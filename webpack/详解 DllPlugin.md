### 什么是 DLL

> DLL(Dynamic Link Library)文件为动态链接库文件,在 Windows 中，许多应用程序并不是一个完整的可执行文件，它们被分割成一些相对独立的动态链接库，即 DLL 文件，放置于系统中。当我们执行某一个程序时，相应的 DLL 文件就会被调用。

举个例子：很多产品都用到螺丝，但是工厂在生产不同产品时，不需要每次连带着把螺丝也生产出来，因为螺丝可以单独生产，并给多种产品使用。在这里螺丝的作用就可以理解为是 dll。

### 为什么要使用 Dll

通常来说，我们的代码都可以至少简单区分成**业务代码**和**第三方库**。如果不做处理，每次构建时都需要把所有的代码重新构建一次，耗费大量的时间。然后大部分情况下，很多第三方库的代码并不会发生变更（除非是版本升级），这时就可以用到 dll：**把复用性较高的第三方模块打包到动态链接库中，在不升级这些库的情况下，动态库不需要重新打包，每次构建只重新打包业务代码**

还是上面的例子：把每次构建，当做是生产产品的过程，我们把生产螺丝的过程先提取出来，之后我们不管调整产品的功能或者设计（对应于业务代码变更），**都不必重复生产螺丝（第三方模块不需要重复打包）；除非是产品要使用新型号的螺丝（第三方模块需要升级）**，才需要去重新生产新的螺丝，然后接下来又可以专注于调整产品本身。

### 基本用法

使用 dll 时，可以把构建过程分成 dll 构建过程和主构建过程（实质也就是如此），所以需要两个构建配置文件，例如叫做 webpack.config.js 和 webpack.dll.config.js。

#### 1. 使用 DLLPlugin 打包需要分离到动态库的模块

DllPlugin 是 webpack 内置的插件，不需要额外安装，直接配置 webpack.dll.config.js 文件：

```js
module.exports = {
  entry: {
    react: ["react", "react-dom", "react-redux"],
  },
  output: {
    filename: "[name].dll.js",
    path: resolve("dist/dll"),
    // library必须和后面dllplugin中的name一致 后面会说明
    library: "[name]_dll_[hash]",
  },
  plugins: [
    // 接入 DllPlugin
    new webpack.DllPlugin({
      // 动态链接库的全局变量名称，需要和 output.library 中保持一致
      // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
      name: "[name]_dll_[hash]",
      // 描述动态链接库的 manifest.json 文件输出时的文件名称
      path: path.join(__dirname, "dist/dll", "[name].manifest.json"),
    }),
  ],
};
```

我们先来看看，这一步到底做了什么。执行：webpack --config webpack.dll.config，然后到指定的输出文件夹查看输出：

1. react.dll 文件里是使用数组保存的模块，索引值就作为 id；
2. react.manifest.json 文件里，是用来描述对应的 dll 文件里保存的模块

```js
{
  "name":"react_dll_553e24e2c44987d2578f",
  "content":{
    "./node_modules/webpack/node_modules/process/browser.js": {"id":0,"meta":{}},
    "./node_modules/react/node_modules/fbjs/lib/invariant.js":{"id":1,"meta":{}},
    "./node_modules/react/lib/Object.assign.js":{"id":2,"meta":{}},
    "./node_modules/react/node_modules/fbjs/lib/warning.js":{"id":3,"meta":{}}
    //省略相似代码
  }
}
```

#### 2. 在主构建配置文件使用动态库文件

在 webpack.config 中使用 dll 要用到 DllReferencePlugin,这个插件通过**引用 dll 的 manifest 文件来把依赖的名称映射到模块的 id 上**，之后再在需要的时候通过内置的 webpack_require 函数来 require 他们.

```js
 new webpack.DllReferencePlugin({
    context: __dirname,
    manifest: require('./dist/dll/react.manifest.json')
  }),
```

第一步产出的 manifest 文件就用在这里，给主构建流程作为查找 dll 的依据：**DllReferencePlugin 去 manifest.json 文件读取 name 字段的值，把值的内容作为在从全局变量中获取动态链接库中内容时的全局变量名**，因此：在 webpack_dll.config.js 文件中，DllPlugin 中的 name 参数必须和 output.library 中保持一致。

#### 3. 在入口文件引入 dll 文件。

生成的 dll 暴露出的是全局函数，因此还需要在入口文件里面引入对应的 dll 文件。

```html
<body>
  <div id="app"></div>
  <!--引用dll文件-->
  <script src="../../dist/dll/react.dll.js"></script>
</body>
```

### 作用

首先从前面的介绍，至少可以看出 dll 的两个作用

1. 分离代码，业务代码和第三方模块可以被打包到不同的文件里，这个有几个好处：

- 避免打包出单个文件的大小太大，不利于调试
- 将单个大文件拆成多个小文件之后，一定情况下有利于加载（不超出浏览器一次性请求的文件数情况下，并行下载肯定比串行快）

2. 提升构建速度。第三方库没有变更时，由于我们只构建业务相关代码，相比全部重新构建自然要快的多。

### 注意事项

从前面可以看到 dll 带来的优点，但并不意味着我们就应该把除业务代码外的所有代码全部都丢到 dll 中，举一个例子：
对于 lodash 这种第三方库，正确的用法是只去 import 所需的函数（用什么引什么），例如：

```js
// 正确用法
import isPlainObject from "lodash/isPlainObject";

//错误用法
import { isPlainObject } from "lodash";
```

这两种写法的差别在于，打包时 webpack 会根据引用去打包依赖的内容，所以第一种写法，webpack 只会打包 lodash 的 isPlainObject 库，第二种写法却会打包整个 lodash。现在假设在项目中只是用到不同模块对 lodash 里的某几个函数并且没有对于某个函数重复使用非常多次，那么这时候把 lodash 添加到 dll 中，带来的收益就并不明显，反而导致 2 个问题：

1. 由于打包了整个 lodash，而导致打包后的文件总大小（注意是总大小）比原先还要大
2. 在 dll 打包太多内容也需要耗费时间，虽然我们一般只在第三方模块更新之后才进行重新预编译（就是 dll 打包的过程），但是如果这个时间太长的话体验也不好、

[参考链接](https://segmentfault.com/a/1190000016567986)
