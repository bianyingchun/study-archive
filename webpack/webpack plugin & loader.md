## plugin

https://blog.51cto.com/u_15291238/3690831?b=totalstatistic
https://juejin.cn/post/6901210575162834958

## loader

https://juejin.cn/post/7100534685134454815#heading-5

# plugin

### plugin 的特征

webpack 插件有以下特征

是一个独立的模块。
模块对外暴露一个 js 函数。
**(函数的原型 (prototype) 上定义了一个注入 compiler 对象的 apply 方法**。
apply 函数中需要有通过 compiler 对象挂载的 webpack 事件钩子，钩子的回调中能拿到当前编译的 compilation 对象，如果是异步编译插件的话可以拿到回调 callback。
完成自定义子编译流程并处理 complition 对象的内部数据。
如果异步编译插件的话，数据处理完成后执行 callback 回调。

```js
class HelloPlugin {
  // 在构造函数中获取用户给该插件传入的配置
  constructor(options) {}
  // Webpack 会调用 HelloPlugin 实例的 apply 方法给插件实例传入 compiler 对象
  apply(compiler) {
    // 在emit阶段插入钩子函数，用于特定时机处理额外的逻辑；
    compiler.hooks.emit.tap("HelloPlugin", (compilation) => {
      // 在功能流程完成后可以调用 webpack 提供的回调函数；
    });
    // 如果事件是异步的，会带两个参数，第二个参数为回调函数，
    compiler.plugin("emit", function (compilation, callback) {
      // 处理完毕后执行 callback 以通知 Webpack
      // 如果不执行 callback，运行流程将会一直卡在这不往下执行
      callback();
    });
  }
}

module.exports = HelloPlugin;
```

### 事件流机制

webpack 本质上是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是 Tapable，核心原理就是一个订阅发布模式

webpack 中最核心的负责编译的 Compiler 和负责创建 bundles 的 Compilation 都是 Tapable 的实例，可以直接在 Compiler 和 Compilation 对象上广播和监听事件

```js
// 广播事件,订阅
compiler.apply("event-name", params);
compilation.apply("event-name", params);

// 监听事件
compiler.plugin("event-name", function (params) {});
compilation.plugin("event-name", function (params) {});
```

Tapable 还统一暴露了三个方法给插件，用于注入不同类型的自定义构建行为：

1. tap：可以注册同步钩子和异步钩子。
2. tapAsync：回调方式注册异步钩子。
3. tapPromise：Promise 方式注册异步钩子。

### 编写一个插件
一个 webpack 插件由以下组成：

1. 一个 JavaScript 命名函数。
2. 在插件函数的 prototype 上定义一个 apply 方法。
3. 指定一个绑定到 webpack 自身的事件钩子。
4. 处理 webpack 内部实例的特定数据。
5. 功能完成后调用 webpack 提供的回调。
   
下面实现一个最简单的插件
```js
class WebpackPlugin1 {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    compiler.hooks.done.tap('MYWebpackPlugin', (compilation) => {
      console.log(this.options)
    })
  }
}

module.exports = WebpackPlugin1

// 然后在 webpack 的配置中注册使用就行，只需要在 webpack.config.js 里引入并实例化就可以了：
const WebpackPlugin1 = require('./src/plugin/plugin1')

module.exports = {
  entry: {
    index: path.join(__dirname, '/src/main.js'),
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index.js',
  },
  plugins: [new WebpackPlugin1({ msg: 'hello world' })],
}
```

作者：lzg9527
链接：https://juejin.cn/post/6901210575162834958
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。