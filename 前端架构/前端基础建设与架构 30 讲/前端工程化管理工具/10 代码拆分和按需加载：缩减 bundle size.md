# 代码拆分和按需加载：缩减 bundle size，把性能做到极致

## 代码拆分和按需技术实现

### 按需加载和按需打包区分

从技术角度介绍按需加载概念前，我们需要先和另外一个概念：按需打包，进行区分。事实上，当前社区对于按需加载和按需打包并没有一个准确的命名上的划分约定。因此从两者命名上，难以区分其实际含义。

1. 其实，**按需加载表示代码模块在交互需要时，动态引入**；
2. 而按需打包针对第三方依赖库，及业务模块，**只打包真正在运行时可能会需要的代码**。

我们不妨先说明按需打包的概念和实施方法，目前按需打包一般通过两种方式进行：

1. 使用 ES Module 支持的 Tree Shaking 方案，在使用构建工具打包时，完成按需打包；

2. 使用以 babel-plugin-import 为主的 Babel 插件，实现自动按需打包 。

### Tree Shaking 实现按需打包

我们来看一个场景，假设业务中使用 antd 的 Button 组件：

```js
import { Button } from "antd";
```

这样的引用，会使得最终打包的代码中包含所有 antd 导出来的内容。假设应用中并没有使用 antd 提供的 TimePicker 组件，那么对于打包结果来说，无疑增加了代码体积。在这种情况下，如果组件库提供了 ES Module 版本，并开启了 Tree Shaking，我们就可以通过“摇树”特性，将不会被使用的代码在构建阶段移除。

**Webpack 可以在 package.json 中设置 sideEffects: false**。我们在 antd 源码当中可以找到（相关 chore commit）：

```js
"sideEffects": [
	"dist/*",
	"es/**/style/*",
	"lib/**/style/*",
	"*.less"
],
```

指定副作用模块——这是一种值得推荐的开发习惯，建议你注意 Tree Shaking 的使用，最好实际观察一下打包结果。

### 学习编写 Babel 插件，实现按需打包

如果第三方库不支持 Tree Shaking，我们依然可以通过 Babel 插件，改变业务代码中对模块的引用路径来实现按需打包。

比如 babel-plugin-import 这个插件，它是 antd 团队推出的一个 Babel 插件，我们通过一个例子来理解它的原理，比如：

```js
import { Button as Btn, Input, TimePicker, ConfigProvider, Haaaa } from "antd";
```

这样的代码就可以被编译为：

```js
import _ConfigProvider from "antd/lib/config-provider";
import _Button from "antd/lib/button";
import _Input from "antd/lib/input";
import _TimePicker from "antd/lib/time-picker";
```

### 重新认识动态导入 dynamic import

#### 动态导入

动态 import,类似函数的动态 import()，它不需要依赖 type="module" 的 script 标签。
**标准用法的 import 导入的模块是静态的，会使所有被导入的模块，在加载时就被编译（无法做到按需编译，降低首页加载速度）**。有些场景中，你可能希望根据条件导入模块或者按需导入模块，这时你可以使用动态导入代替静态导入。下面的是你可能会需要动态导入的场景：

1. 当静态导入的模块很明显的降低了代码的加载速度且被使用的可能性很低，或者并不需要马上使用它。
2. 当静态导入的模块很明显的**占用了大量系统内存且被使用的可能性很低**。
3. 当被导入的模块，在加载时并不存在，需要**异步获取**
4. 当导入模块的说明符，需要**动态构建**。（静态导入只能使用静态说明符）
5. 当被导入的模块有**副作用**（这里说的副作用，可以理解为模块中会直接运行的代码），这些副作用只有在触发了某些条件才被需要时。（原则上来说，模块不能有副作用，但是很多时候，你无法控制你所依赖的模块的内容）

请不要滥用动态导入（只有在必要情况下采用）。静态框架能更好的初始化依赖，而且更有利于静态分析工具和 tree shaking 发挥作用

关键字 import 可以像调用函数一样来动态的导入模块。以这种方式调用，将返回一个 promise。

```js
import("/modules/my-module.js").then((module) => {
  // Do something with the module.
});
```

这种使用方式也支持 await 关键字。

```js
let module = await import("/modules/my-module.js");
```

#### 模拟实现一个 dynamic import（动态导入）

```js
const importModule = (url) => {
  // 返回一个新的 Promise 实例

  return new Promise((resolve, reject) => {
    // 创建 script 标签

    const script = document.createElement("script");
    const tempGlobal =
      "__tempModuleLoadingVariable" + Math.random().toString(32).substring(2);

    script.type = "module";
    script.textContent = `import * as m from "${url}"; window.${tempGlobal} = m;`;
    // load 回调

    script.onload = () => {
      resolve(window[tempGlobal]);
      delete window[tempGlobal];
      script.remove();
    };

    // error 回调
    script.onerror = () => {
      reject(new Error("Failed to load module script with URL " + url));
      delete window[tempGlobal];
      script.remove();
    };

    document.documentElement.appendChild(script);
  });
};
```

### Webpack 赋能代码拆分和按需加载

如何在代码中安全地使用动态导入而不用去过多关心浏览器的兼容情况，如何在工程环境中实现代码拆分和按需加载呢？

以最常见、最典型的前端构建工具——Webpack 为例，我们来分析如何在 Webpack 环境下支持代码拆分和按需加载。

总的来说，Webpack 提供了三种相关能力：

1. 通过入口配置手动分割代码；

2. 动态导入支持；

3. 通过 splitChunk 插件提取公共代码（公共代码分割）。

#### Webpack 对 dynamic import 能力支持

事实上，在 Webpack 早期版本中，提供了 require.ensure() 能力。请注意这是 Webpack 特有的实现：**require.ensure() 能够将其参数对应的文件拆分到一个单独的 bundle 中，此 bundle 会被异步加载**。

目前 require.ensure() 已经被符合 ES 规范的 dynamic import 取代。调用 import()，被请求的模块和它引用的所有子模块，会分离到一个单独的 chunk 中。值得学习的是，Webpack 对于 import() 的支持和处理非常“巧妙”，我们知道 ES 中关于 dynamic import 的规范，只接受一个参数，表示模块的路径：

```js
import(`${path}`) -> Promise
```

但是 Webpack 是一个构建工具，**Webpack 中对于 import() 的处理，可以通过注释接收一些特殊的参数，无须破坏 ES 对于 dynamic import 规定**。比如：

```js
import(
  /* webpackChunkName: "chunk-name" */
  /* webpackMode: "lazy" */
  "module"
);
```

Webpack 在构建时，可以读取到 import 参数，即便是参数内的注释部分，Webpack 也可以获取并处理。如上述代码，webpackChunkName: "chunk-name"表示自定义新 chunk 名称；webpackMode: "lazy"表示每个 import() 导入的模块，会生成一个可延迟加载（lazy-loadable） chunk。此外，webpackMode 的取值还可以是 lazy-once、eager、weak，具体含义可参考：Webpack import()。

你可能很好奇：Webpack 在编译构建时，会如何处理代码中的 dynamic import 呢？下面，我们一探究竟。

```js
// index.js 文件：
import("./module").then((data) => {
  console.log(data);
});
// module.js 文件：
const module = {
  value: "moduleValue",
};
export default module;
```

我们配置入口文件为 index.js，输出文件为 bundle.js，简单的 Webpack 配置信息（webpack@4.44.2）：

```js
const path = require("path");
module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
```

运行构建命令后，得到两个文件：

0.bundle.js

bundle.js

bundle.js 中对 index.js dynamic import 编译结果为：

```js
/******/ ({
  /***/ "./index.js":
    /*!******************!*\
  !*** ./index.js ***!
  \******************/
    /*! no static exports found */
    /***/ function (module, exports, __webpack_require__) {
      eval(
        '__webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ./module */ "./module.js")).then((data) => {\n  console.log(data)\n});\n\n//# sourceURL=webpack:///./index.js?'
      );
      /***/
    },
  /******/
});
```

由此可知，Webpack 对于业务中写到的 dynamic import 代码，会转换成了 Webpack 自己自定义的 **webpack_require.e** 函数，这个函数返回了一个 promise 数组，最终模拟出了动态导入的效果。
webpack_require.e 主要做了如下内容：

- 定义一个 promise **数组 promises**，最终以 Promise.all(promises) 形式返回；

- 通过 installedChunkData 变量判断当前模块是否已经被加载，**如果已经加载过，将模块内容 push 到 promises 数组**中；

- 如果当前模块没有被加载过，则先定义一个 promise，然后创建一个 script 标签，**加载模块内容**，并定义此 script 的 onload 和 onerror 回调；

- 最终对新增 script 标签对应的 promise （resolve/reject）处理定义在 webpackJsonpCallback 函数中。

#### Webpack 中 splitChunk 插件和代码分割

代码分割区别于动态加载，它们本质上是两个概念。前文介绍到的 dynamic import（动态导入）技术本质上一种是懒加载——按需加载，即只有在需要的时候，才加载代码。**而以 splitChunk 插件为代表的代码分割，是一种代码拆包技术，与代码合并打包是一个相逆的过程。**

代码分割的核心意义在于**避免重复打包以及提升缓存利用率，进而提升访问速度**。比如，我们将不常变化的第三方依赖库进行代码拆分，方便对第三方依赖库缓存，同时抽离公共逻辑，减少单个文件的 size 大小。

了解了代码分割的概念，那么就很好理解 Webpack splitChunk 插件满足下述条件时，自动进行代码分割：

1. 可以被**共享**的（即重复被引用的）模块或者 node_modules 中的模块；

2. 在压缩前**体积**大于 30KB 的模块；

3. 在按需加载模块时，并行加载的模块不得超过 5 个；

4. 在页面初始化加载时，并行加载的模块不得超过 3 个。

当然，上述配置数据是完全可以由开发者掌握主动权，并根据项目实际情况进行调整的。更多内容可以参考：split-chunks-plugin。不过需要注意的是，**关于 splitChunk 插件的默认参数是 Webpack 团队所设定的通用性优化手段，是经过“千挑万选”确定的，因此适用于多数开发场景。如果在没有实践测量的情况下，不建议开发者手动优化这些参数。**
