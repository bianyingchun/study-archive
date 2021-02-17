1. 技巧：让 webpack 配置文件拥有代码提示
   直接在类型注释中使用  import  动态导入类型

```typescript
// ./webpack.config.js

/** @type {import('webpack').Configuration} */

const config = {
  entry: "./src/index.js",

  output: {
    filename: "bundle.js",
  },
};

module.exports = config;
```

2. Webpack 工作模式
   Webpack 4 新增了一个工作模式的用法，为针对不同环境的几组预设配置：

   1. production 模式下，启动内置优化插件，自动优化打包结果，打包速度偏慢；

   1. development 模式下，自动优化打包速度，添加一些调试过程中的辅助插件；

   1. none 模式下，运行最原始的打包，不做任何额外处理。

   针对工作模式的选项，如果你没有配置一个明确的值，打包过程中命令行终端会打印一个对应的配置警告。在这种情况下 Webpack 将默认使用 production 模式去工作。

   production 模式下 Webpack 内部会自动启动一些优化插件，例如，自动压缩打包后的代码。这对实际生产环境是非常友好的，但是打包的结果就无法阅读了。

   修改 Webpack 工作模式的方式有两种：

   1.通过 CLI --mode 参数传入；

   2. 通过配置文件设置 mode 属性。

3. 打包结果运行原理
   最后，我们来一起学习 Webpack 打包后生成的 bundle.js 文件，深入了解 Webpack 是如何把这些模块合并到一起，而且还能正常工作的。
   1. 整体生成的代码其实就是一个立即执行函数，这个函数是 Webpack 工作入口（webpackBootstrap），它接收一个 modules 参数，调用时传入了一个数组。
   2. 展开这个数组，里面的元素均是参数列表相同的函数。这里的函数对应的就是我们源代码中的模块，也就是说每个模块最终被包裹到了这样一个函数中，从而实现模块私有作用域，
   3. 这个函数内部并不复杂，而且注释也很清晰，最开始定义了一个 installedModules 对象用于存放或者缓存加载过的模块。
   4. 紧接着定义了一个 require 函数，顾名思义，这个函数是用来加载模块的。
   5. 再往后就是在 require 函数上挂载了一些其他的数据和工具函数，这些暂时不用关心。这个函数执行到最后调用了 require 函数，传入的模块 id 为 0，开始加载模块。模块 id 实际上就是模块数组的元素下标，也就是说这里开始加载源代码中所谓的入口模块
