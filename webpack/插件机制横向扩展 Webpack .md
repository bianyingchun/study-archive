### 前言

Webpack 插件机制的目的是为了增强 Webpack 在项目自动化构建方面的能力。通过上一讲的介绍你应该知道，Loader 就是负责完成项目中各种各样资源模块的加载，从而实现整体项目的模块化，而**Plugin 则是用来解决项目中除了资源模块打包以外的其他自动化工作**，所以说 Plugin 的能力范围更广，用途自然也就更多。

### 常用插件

1.  clean-webpack-plugin 实现自动在打包之前清除 dist 目录（上次的打包结果）
2.  html-webpack-plugin 自动生成应用所需要的 HTML 文件
    相比于之前写死 HTML 文件的方式，自动生成 HTML 的优势在于：HTML 也输出到 dist 目录中了，上线时我们只需要把 dist 目录发布出去就可以了；HTML 中的 script 标签是自动引入的，所以可以确保资源文件的路径是正常的。
3.  copy-webpack-plugin 用于复制文件的插件

### 插件机制

其实说起来也非常简单，Webpack 的插件机制就是我们在软件开发中最常见的钩子机制。

钩子机制也特别容易理解，它有点类似于 Web 中的事件。在 Webpack 整个工作过程会有很多环节，为了便于插件的扩展，Webpack 几乎在每一个环节都埋下了一个钩子。这样我们在开发插件的时候，通过往这些不同节点上挂载不同的任务，就可以轻松扩展 Webpack 的能力。

- Compiler Hooks；
- Compilation Hooks；
- ContextModuleFactory Hooks
- JavascriptParser Hooks
- NormalModuleFactory Hooks

Webpack 要求我们的插件必须是一个函数或者是一个包含 apply 方法的对象，一般我们都会定义一个类型，在这个类型中定义 apply 方法。然后在使用时，再通过这个类型来创建一个实例对象去使用这个插件
