## 前端工程化的理解

1. 提高前端工程师的开发效率
   提高开发效率从以下这几个方面入手:

1，扩展 javascript，html，css 本身的语言能力

2，解决重复的工作

3，模块化，组件化

4，解决功能复用和变更问题

5，解决开发和产品环境差异问题

6，解决发布流程问题

2. 进行高效的多人协作
   前端工程化正是在保存工程稳定的情况下进行顺利协作

3. 保证项目的可维护性
   我们知道软件工程化处理正是为了项目工程的可维护性

4. 提高项目的开发质量
   在以上情况的实现下，项目的开发质量必然得到保证

前端工程化应该从模块化，组件化，规范化，自动化四个方面着手

1. 前端模块化
   1，在工程化的基础上，模块化的职责在于模块管理和资源加载

2，模块化的常用工具有:Nodejs，npm，webpack，parcel，rollup 等

2. 前端组件化
   1，组件化趋势的发展存在很大的优势，它自由，灵活，可复用，大大提高了开发的效率

2，它的应用实践，我觉得微信小程序的目录结构应用的是组件化的思想

3. 前端规范化
   关于规范化的工具主要有:eslint,styleint

4. 前端自动化
   自动化阶段包括构建，测试，部署三个阶段

自动化构建工具有 grunt，gulp，对文件进行压缩，校验，资源合并等处理方式

自动化测试借助于一些单元测试框架(Chai,Karma,Mocha)，UI 测试框架(Jest,Enzyme,Selenium Webdriver)测试功能代码，其次还有性能测试-Benchmark，覆盖率测试-Istanbul，持续集成(travis-ci,codecov)帮助我们高效得完成测试工作

自动化部署使用 pm2，项目是一个迭代开发的过程，使用 pm2 工具可用简化开发流程，大大提高开发效率

## 0. 有哪些常见的 Loader？你用过哪些 Loader？

- raw-loader：加载文件原始内容（utf-8）
- file-loader：把文件输出到一个文件夹中，在代码中通过相对 URL 去引用输出的文件 (处理- 图片和字体)
- url-loader：与 file-loader 类似，区别是用户可以设置一个阈值，大于阈值会交给 file-loader 处理，小于阈值时返回文件 base64 形式编码 (处理图片和字体)
- image-loader：加载并且压缩图片文件
- source-map-loader：加载额外的 Source Map 文件，以方便断点调试
- awesome-typescript-loader：将 TypeScript 转换成 JavaScript，性能优于 ts-loader
- sass-loader：将 SCSS/SASS 代码转换成 CSS
- css-loader：加载 CSS，支持模块化、压缩、文件导入等特性,css-loader 只是帮我们解析了 css 文件里面的 css 代码,帮我们分析出各个 css 文件之间的关系，把各个 css 文件合并成一段 css；
- style-loader：把 CSS 代码注入到 JavaScript 中，通过 DOM 操作去加载 CSS
- postcss-loader：扩展 CSS 语法，使用下一代 CSS，可以配合 autoprefixer 插件自动补齐 CSS3 前缀
- eslint-loader：通过 ESLint 检查 JavaScript 代码
- tslint-loader：通过 TSLint 检查 TypeScript 代码
- svg-inline-loader：将压缩后的 SVG 内容注入代码中
- babel-loader：把 ES6 转换成 ES5
- ts-loader: 将 TypeScript 转换成 JavaScript
- mocha-loader：加载 Mocha 测试用例的代码
- coverjs-loader：计算测试的覆盖率
- vue-loader：加载 Vue.js 单文件组件
- i18n-loader: 国际化
- cache-loader: 可以在一些性能开销较大的 Loader 之前添加，目的是将结果缓存到磁盘里

## 1. 有哪些常见的 Plugin？你用过哪些 Plugin？

- ProvidePlugin 自动加载模块，而不必到处 import 或 require
- html-webpack-plugin：自动生成应用所需要的 HTML 文件(依赖于 html-loader)
- define-plugin：定义环境变量 (Webpack4 之后指定 mode 会自动配置)
- clean-webpack-plugin: 实现自动在打包之前清除 dist 目录（上次的打包结果）
- purgecss-webpack-plugin 清除无用 css
- ignore-plugin：忽略部分文件
- speed-measure-webpack-plugin: 可以看到每个 Loader 和 Plugin 执行耗时 (整个打包耗时、每个 Plugin 和 Loader 耗时)
- webpack-bundle-analyzer: 可视化 Webpack 输出文件的体积 (业务组件、依赖第三方模块)
- web-webpack-plugin：可方便地为单页应用输出 HTML，比 html-webpack-plugin 好用
- uglifyjs-webpack-plugin：不支持 ES6 压缩 (Webpack4 以前)
- terser-webpack-plugin: 支持压缩 ES6 (Webpack4)
- webpack-parallel-uglify-plugin: 多进程执行代码压缩，提升构建速度
- mini-css-extract-plugin: 分离样式文件，CSS 提取为独立文件，支持按需加载 (替代 extract-text-webpack-plugin)
- serviceworker-webpack-plugin：为网页应用增加离线缓存功能
- ModuleConcatenationPlugin: 开启 Scope Hoisting

## 2. Loader 和 Plugin 的区别

## 不同的作用

1. 因为 Webpack 只认识 JavaScript, js，所以 Loader 就成了翻译官，对其他类型的资源进行转译的预处理工作。**通过 Loader 处理特殊类型资源的加载**，例如加载样式、图片；Loader 本质就是一个函数，在该函数中对接收到的内容进行转换，返回转换后的结果。

2. 通过 Plugin 实现各种自动化的构建任务，例如自动压缩、自动发布。Webpack 的插件机制就是我们在软件开发中最常见的**钩子机制**。在 Webpack 整个工作过程会有很多环节，为了便于插件的扩展，Webpack 几乎在每一个环节都埋下了一个钩子。这样我们在开发插件的时候，通过往这些不同节点上挂载不同的任务，就可以轻松**扩展 Webpack 的能力**。

## 不同的用法

1.  Loader 在 module.rules 中配置，作为模块的解析规则，类型为数组。每一项都是一个 Object，内部包含了 test、use 、option 属性。

2.  Plugin 在 plugins 中单独配置，类型为数组，每一项是一个 Plugin 的实例，参数都通过构造函数传入。

[万字总结] 一文吃透 Webpack 核心原理](https://mp.weixin.qq.com/s/SbJNbSVzSPSKBe2YStn2Zw)

## webpack 中，module，chunk 和 bundle 的区别是什么？

module，chunk 和 bundle 其实就是同一份逻辑代码在不同转换场景下的取了三个名字：
我们直接写出来的是 module，webpack 处理时是 chunk，最后生成浏览器可以直接运行的 bundle。
module：是开发中的单个模块
chunk：是指 webpack 在进行模块依赖分析的时候，代码分割出来的代码块
bundle：是我们最终输出的一个或多个打包文件。确实，大多数情况下，一个 Chunk 会生产一个 Bundle。但有时候也不完全是一对一的关系

## 产生 Chunk 的三种途径

1. entry 入口
2. 异步加载模块
   1. Import
   2. require.ensure([])
3. 代码分割（code spliting）

## 4.使用 webpack 开发时，你用过哪些可以提高效率的插件

- webpack-dashboard：可以更友好的展示相关打包信息。
- webpack-merge：提取公共配置，减少重复配置代码
- speed-measure-webpack-plugin：简称 SMP，分析出 Webpack 打包过程中 Loader 和 Plugin 的耗时，有助于找到构建过程中的性能瓶颈。
- size-plugin：监控资源体积变化，尽早发现问题
- HotModuleReplacementPlugin：模块热替换机制（HMR）

## 开启模块热替换 HMR

Webpack 中的模块热替换，指的是我们可以在应用运行过程中，这个机制可以做到不用刷新浏览器而将新变更的模块替换掉旧的模块，而应用的运行状态不会因此而改变。
HMR 已经集成在了 webpack 模块中了，所以不需要再单独安装什么模块。

1. 使用这个特性最简单的方式就是，在运行 webpack-dev-server 命令时，通过 --hot 参数去开启这个特性。
2. 配置文件中通过添加对应的配置来开启这个功能
3. 首先需要将 devServer 对象中的 hot 属性设置为 true。
4. 然后需要载入一个插件，这个插件是 webpack 内置的一个插件，所以我们先导入 webpack 。
5. 模块，有了这个模块过后，这里使用的是一个叫作 HotModuleReplacementPlugin 的插件。

## 8.说一下 Webpack 的热更新原理吧 \*\*\*

1. 对本地源文件内容变更的监控
2. 网页和本地服务器的 websocket 通信
3. 模块解析和替换功能

HMR 的核心就是

1. 客户端从服务端拉去更新后的文件，准确的说是 chunk diff (chunk 需要更新的部分)，实际上 WDS 与浏览器之间维护了一个 Websocket
2. 当本地资源发生变化时，WDS 会向浏览器推送更新，并带上构建时的 hash，让客户端与上一次资源进行对比。
3. 客户端对比出差异后会向 WDS 发起 Ajax 请求来获取更改内容(文件列表、hash)
4. 这样客户端就可以再借助这些信息继续向 WDS 发起 jsonp 请求获取该 chunk 的增量更新。
5. 后续的部分(拿到增量更新之后如何处理？哪些状态该保留？哪些又需要更新？)由 HotModulePlugin 来完成，提供了相关 API 以供开发者针对自身场景进行处理，像 react-hot-loader 和 vue-loader 都都是借助这些 API 实现 HMR。

## 5.source map 是什么？生产环境怎么用？

^(inline-|hidden-|eval-)?(nosources-)?(cheap-(module-)?)?source-map$
^(inline-|hidden-|eval-)?(nosources-)?(cheap-(module-)?)?source-map$

- hidden
  生成 SourceMap 文件，但不使用
- eval
  使用 eval 包裹模块代码
- inline
  将.map 作为 DataURI 嵌入，不单独生成.map 文件

- nosources
  不生成 SourceMap

- module：
  包含 loader 的 sourcemap（比如 jsx to js ，babel 的 sourcemap）
- cheap
  不包含列信息（关于列信息的解释下面会有详细介绍)也不包含 loader 的 sourcemap

- source-map
  产生.map 文件

  source map 是**将编译、打包、压缩后的代码映射回源代码的过程**。打包压缩后的代码不具备良好的可读性，想要调试源码就需要 source map。
  配置：devtool:'source-map'
  map 文件只要不打开开发者工具，浏览器是不会加载的。
  Webpack 中的 devtool 配置，除了可以使用 source-map 这个值，它还支持很多其他的选项

线上环境一般有三种处理方案：

1. hidden-source-map：（在这个模式下，我们在开发工具中看不到 Source Map 的效果，但是它也确实生成了 Source Map 文件，这就跟 jQuery 一样，虽然生成了 Source Map 文件，但是代码中并没有引用对应的 Source Map 文件，开发者可以自己选择使用。） 借助第三方错误监控平台 Sentry 使用
2. no sources-source-map：可以查看错误代码错误原因，但不能查看错误代码准确信息，并且没有任何源代码信息。安全性比 sourcemap 高
3. sourcemap：完整源代码 通过 nginx 设置将 .map 文件只对白名单开放(公司内网)

注意：避免在生产中使用 inline- 和 eval-，因为它们会增加 bundle 体积大小，并降低整体性能。 这种模式下。Source Map 文件不是以物理文件存在，而是以 data URLs 的方式出现在代码中。

- 在**开发环境**中，通常我们关注的是**构建速度快，质量高，以便于提升开发效率，而不关注生成文件的大小和访问方式。**
  **eval-cheap-module-source-map**
  本地开发首次打包慢点没关系，因为 eval 缓存的原因，rebuild 会很快
  开发中，我们每行代码不会写的太长，只需要定位到行就行，所以加上 cheap
  我们希望能够找到源代码的错误，而不是打包后的，所以需要加上 module

- 在**生产环境**中，通常我们更关注**是否需要提供线上 source map , 生成的文件大小和访问方式是否会对页面性能造成影响等，其次才是质量和构建速度**。

## 6.模块打包原理知道吗？

Webpack 实际上为每个模块创造了一个可以导出和导入的环境，本质上并没有修改 代码的执行逻辑，代码执行顺序与模块加载顺序也完全一致。

### webpack 的打包思想可以简化为 3 点：

1. 一切源代码文件均可通过各种 Loader 转换为 JS 模块 （module），模块之间可以互相引用。

2. webpack 通过入口点（entry point）递归处理各模块引用关系，最后输出为一个或多个产物包 js(bundle) 文件。

3. 每一个入口点都是一个块组（chunk group），在不考虑分包的情况下，一个 chunk group 中只有一个 chunk，该 chunk 包含递归分析后的所有模块。每一个 chunk 都有对应的一个打包后的输出文件（asset/bundle）。

## 7.文件监听原理呢？

在发现源码发生变化时，自动重新构建出新的输出文件。
原理：**轮询判断文件的最后编辑时间是否变化，如果某个文件发生了变化，并不会立刻告诉监听者，而是先缓存起来，等 aggregateTimeout 后再执行**。
缺点：每次需要手动刷新浏览器
Webpack 开启监听模式，有两种方式：

1. 启动 webpack 命令时，带上 --watch 参数
2. 在配置 webpack.config.js 中设置 watch:true

```javascript
module.export = {
  // 默认false,也就是不开启
  watch: true,
  // 只有开启监听模式时，watchOptions才有意义
  watchOptions: {
    // 默认为空，不监听的文件或者文件夹，支持正则匹配
    ignored: /node_modules/,
    // 监听到变化发生后会等300ms再去执行，默认300ms
    aggregateTimeout: 300,
    // 判断文件是否发生变化是通过不停询问系统指定文件有没有变化实现的，默认每秒问1000次
    poll: 1000,
  },
};
```

## 9.如何对 bundle 体积进行监控和分析？

https://www.jb51.net/article/132275.htm

VSCode 中有一个插件 Import Cost 可以帮助我们对引入模块的大小进行实时监测，还可以使用 webpack-bundle-analyzer 生成 bundle 的模块组成图，显示所占体积。
bundlesize 工具包可以进行自动化资源体积监控

## 10.文件指纹是什么？怎么用？

hash 一般是结合浏览器缓存来使用，通过 webpack 构建之后，生成对应文件名自动带上对应的 MD5 值。如果文件内容改变的话，那么对应文件哈希值也会改变，对应的 HTML 引用的 URL 地址也会改变，触发 CDN 服务器从源服务器上拉取对应数据，进而更新本地缓存。

文件指纹是打包后输出的文件名的后缀。

- Hash：和整个项目的构建相关，只要项目文件有修改，整个项目构建的 hash 值就会更改
- chunkhash: Webpack 打包的 chunk 有关，不同的 entry 会生出不同的 chunkhash
- Contenthash：根据文件内容来定义 hash，文件内容不变，则 contenthash 不变

JS 的文件指纹设置

chunkhash 和 hash 不一样，它根据不同的入口文件(Entry)进行依赖文件解析、构建对应的 chunk，生成对应的哈希值。我们在生产环境里把一些公共库和程序入口文件区分开，单独打包构建，接着我们采用 chunkhash 的方式生成哈希值，那么只要我们不改动公共库的代码，就可以保证其哈希值不会受影响。

设置 output 的 filename，用 chunkhash。

```javascript
module.exports = { entry: { app: './scr/app.js', search: './src/search.js' }, output: { filename: '[name][chunkhash:8].js', path:**dirname + '/dist' }}
```

CSS 的文件指纹设置
// 在 chunkhash 的例子，我们可以看到由于 index.css 被 index.js 引用了，所以共用相同的 chunkhash 值。但是这样子有个问题，如果 index.js 更改了代码，css 文件就算内容没有任何改变，由于是该模块发生了改变，导致 css 文件会重复构建。

设置 MiniCssExtractPlugin 的 filename，使用 contenthash。

```javascript
module.exports = {
    entry: {
         app: './scr/app.js',
    search: './src/search.js'
    },
 output: {
     filename: '[name][chunkhash:8].js', path:**dirname + '/dist'
     },
      plugins:[
          new MiniCssExtractPlugin({
           filename: `[name][contenthash:8].css` })
      ]
}
```

图片的文件指纹设置
设置 file-loader 的 name，使用 hash。

> file-loader 的 hash 字段，这个 loader 自己定义的占位符，和 webpack 的内置 hash 字段并不一致。这里的 hash 是使用 md4 等 hash 算法，对文件内容进行 hash。所以只要文件内容不变，hash 还是会保持一致。

ext 资源后缀名 name 文件名称 path 文件的相对路径 folder 文件所在的文件夹 contenthash 文件的内容 hash，默认是 md5 生成 hash 文件内容的 hash，默认是 md5 生成一个随机的指代文件内容的

```javascript
const path = require("path");
module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(_dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: { name: "img/[name][hash:8].[ext]" },
          },
        ],
      },
    ],
  },
};
```

## 11.在实际工程中，配置文件上百行乃是常事，如何保证各个 loader 按照预想方式工作？

可以使用 enforce 强制执行 loader 的作用顺序，pre 代表在所有正常 loader 之前执行，post 是所有 loader 之后执行。(inline 官方不推荐使用)

## 10.如何提高 webpack 的构建速度？

1. 多入口情况下，使用 CommonsChunkPlugin 来提取公共代码（webpack4 移除了 CommonsChunkPlugin (提取公共代码)，用 optimization.splitChunks 和 optimization.runtimeChunk 来代替）
2. 通过 externals 配置来提取常用库
3. 利用 DllPlugin 和 DllReferencePlugin 预编译资源模块 通过 DllPlugin 来对那些我们引用但是绝对不会修改的 npm 包来进行预编译，再通过 DllReferencePlugin 将预编译的模块加载进来。
4. 使用 Happypack 实现多进程加速编译
5. 使用 webpack-uglify-parallel 来提升 uglifyPlugin 的压缩速度。 原理上 webpack-uglify-parallel 采用了多核并行压缩来提升压缩速度
6. 使用 Tree-shaking 和 Scope Hoisting 来剔除多余代码

## 13.代码分割的本质是什么？有什么意义呢

> 代码分割区别于动态加载，它们本质上是两个概念。前文介绍到的 dynamic import（动态导入）技术本质上一种是懒加载——按需加载，即只有在需要的时候，才加载代码。**而以 splitChunk 插件为代表的代码分割，是一种代码拆包技术，与代码合并打包是一个相逆的过程。**

代码分割的核心意义在于**避免重复打包以及提升缓存利用率，进而提升访问速度**。比如，我们将不常变化的第三方依赖库进行代码拆分，方便对第三方依赖库缓存，**同时抽离公共逻辑，减少单个文件的 size 大小**。

代码分割的本质其实就是在源代码直接上线和打包成唯一脚本 main.bundle.js 这两种极端方案之间的一种更适合实际场景的中间状态。「用可接受的服务器性能压力增加来换取更好的用户体验。」

源代码直接上线：虽然过程可控，但是 http 请求多，性能开销大。
打包成唯一脚本：一把梭完自己爽，服务器压力小，但是页面空白期长，用户体验不好

# 14.是否写过 自定义 Loader？简单描述一下编写 loader 的思路？\*\*\*

所谓 loader 只是一个导出为函数的 JavaScript 模块。loader runner 会调用这个函数，然后把上一个 loader 产生的结果或者资源文件(resource file)传入进去。函数的 this 上下文将由 webpack 填充，并且 loader runner 具有一些有用方法，可以使 loader 改变为异步调用方式，或者获取 query 参数。

第一个 loader 的传入参数只有一个：资源文件(resource file)的内容。compiler 需要得到最后一个 loader 产生的处理结果。这个处理结果应该是 String 或者 Buffer（被转换为一个 string），代表了模块的 JavaScript 源码。另外还可以返回一个可选的 SourceMap 结果（格式为 JSON 对象）。

如果是单个处理结果，可以在同步模式中直接返回。如果有多个处理结果，则必须调用 this.callback()。在异步模式中，必须调用 this.async()，来指示 loader runner 等待异步结果，它会返回 this.callback() 回调函数，随后 loader 必须返回 undefined 并且调用该回调函数。

# 15. 是否写过 Plugin？简单描述一下编写 Plugin 的思路？\*\*\*

插件的用处，对开发者来说就是可以接触到 webpack 构建流程中的各个阶段并劫持做一些代码处理，对使用者来说则是我们可以通过各类插件实现诸如自动生成 HTML 模版 (html-webpack-plugin)、自动压缩图片 (imagemin-webpack-plugin) 等功能。
一个插件应该包含：

1. 一个 JavaScript 函数或 JavaScript 类，用于承接这个插件模块的所有逻辑；
   在它原型上定义的 apply 方法，这个方法会在 Webpack 启动时被调用，它接收一个 compiler 对象参数，这个对象是 Webpack 工作过程中最核心的对象，里面包含了我们此次构建的所有配置信息，我们就是通过这个对象去注册钩子函数。
2. 还需要明确我们这个任务的执行时机，也就是到底应该把这个任务挂载到哪个钩子上。通过 compiler 对象的 hooks 属性访问到 相关 钩子，再通过 tap 方法注册一个钩子
3. 对 webpack 实例内部做一些操作处理；
4. 在功能流程完成后可以调用 webpack 提供的回调函数；

```javascript
// ./remove-comments-plugin.js

class RemoveCommentsPlugin {
  apply(compiler) {
    // 通过 compiler 对象的 hooks 属性访问到 emit 钩子，再通过 tap 方法注册一个钩子函数，这个方法接收两个参数：
    // 第一个是插件的名称，我们这里的插件名称是 RemoveCommentsPlugin；
    // 第二个是要挂载到这个钩子上的函数；
    compiler.hooks.emit.tap("RemoveCommentsPlugin", (compilation) => {
      // compilation => 可以理解为此次打包的上下文
      // compiler 和 compilation两者的区别在于，前者代表了整个 webpack 从启动到关闭的生命周期，而 compilation 只代表一次单独的编译。
      for (const name in compilation.assets) {
        if (name.endsWith(".js")) {
          const contents = compilation.assets[name].source();
          const noComments = contents.replace(/\/\*{2,}\/\s?/g, "");
          compilation.assets[name] = {
            source: () => noComments,
            size: () => noComments.length,
          };
        }
      }
    });
  }
}
```

## 16.聊一聊 Babel 原理吧

Babel 大概分为三大部分：

1. 解析：将代码转换成 AST
   - 词法分析：将代码(字符串)分割为 token 流，即语法单元成的数组
   - 语法分析：分析 token 流(上面生成的数组)并生成 AST
2. 转换：访问 AST 的节点进行变换操作生产新的 AST,Taro 就是利用 babel 完成的小程序语法转换
3. 生成：以新的 AST 为基础生成代码

## 17 .webpack 和 gulp 的区别？

webpack 是一个模块打包器，强调的是一个**前端模块化方案，更侧重模块打包**，我们可以把开发中的所有资源都看成是模块，通过 loader 和 plugin 对资源进行处理。

**gulp 是一个前端自动化构建工具，强调的是前端开发的工作流程**，可以通过配置一系列的 task,定义 task 处理的事情（如代码压缩，合并，编译以及浏览器实时更新等）。然后定义这些执行顺序，来让 glup 执行这些 task，从而构建项目的整个开发流程。自动化构建工具并不能把所有的模块打包到一起，也不能构建不同模块之间的依赖关系。

## 18. webpack 与 grunt、gulp 的不同？

三者都是前端构建工具，grunt 和 gulp 在早期比较流行，现在 webpack 相对来说比较主流，不过一些轻量化的任务还是会用 gulp 来处理，比如单独打包 CSS 文件等。

grunt 和 gulp 是基于任务和流（Task、Stream）的。类似 jQuery，找到一个（或一类）文件，对其做一系列链式操作，更新流上的数据， 整条链式操作构成了一个任务，多个任务就构成了整个 web 的构建流程。

webpack 是基于入口的。webpack 会自动地递归解析入口所需要加载的所有资源文件，然后用不同的 Loader 来处理不同的文件，用 Plugin 来扩展 webpack 功能。

## 19.什么是长缓存？在 webpack 中如何做到长缓存优化？

浏览器在用户访问页面的时候，为了加快加载速度，对用户请求的静态资源都会进行存储，但是每次代码更新或者升级的时候，我们都需要浏览器去加载新的代码。最方便的方法就是引入新的文件名称，只下载新的代码块，不加载旧的代码块，这就是长缓存。

在 webpack 中，可以在 output 给出输出的文件制定 chunkhash，并且分离经常更新的代码和框架代码，通过 NameModulesPlugin 或者 HashedModulesPlugin 使再次打包文件名不变

## 20.如何利用 webpack 来优化前端性能

1. 压缩代码
   删除多余代码，注释，简化代码的写法等等方式。可以利用 webpack 的 terser-webpack-plugin 来压缩 js 文件，利用 cssnano 来压缩 css 资源。(optimize-css-assets-webpack-plugin, OptimizeCSSNanoPlugin, CSSMinimizerWebpackPlugin)，
1. 利用 CDN 加速：在构建过程中，将引用的静态资源修改为 CDN 上对应的路径。我们想引用一个库，但是又不想让 webpack 打包，并且又不影响我们在程序中以 CMD、AMD 或者 window/global 全局等方式进行使用，那就可以通过配置 externals。

```js
configureWebpack: {
    externals: {
        "vue": "Vue",
        "vue-router": "VueRouter",
        "axios": "axios",
        "moment": "moment",
        "element-ui": "ELEMENT",
    }
}
```

2. Tree shaking:将代码中永远不会⾛到的⽚段删除掉。可以通过在启动 webpack 时追加参数 --optimize-minimize 来实现。
3. Code Splitting 将代码按路由维度或者组件分块(chunk),这样做到按需加载,同时可以充分利⽤浏览器缓存。例如 vue 中的异步组件就是按需加载。
4. 提取公共第三⽅库: 提取公共第三⽅库:来进⾏公共模块抽取,利⽤浏览器缓存可以⻓期缓存这些⽆需频繁变动的公共代码

# 21.webpack 的构建流程是什么?从读取配置到输出文件这个过程尽量说全

Webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：

1. 初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数；
2. 开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；
3. 确定入口：根据配置中的 entry 找出所有的入口文件；
4. 编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
5. 完成模块编译：在经过第 4 步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
7. 输出完成：在确定好输出内容后，根据配置中的 output 确定输出的路径和文件名，把文件内容写入到文件系统。
8. 在以上过程中，Webpack 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。

# 22.怎么配置单页应用？怎么配置多页应用？

单页应用可以理解为 webpack 的标准模式，直接在 entry 中指定单页应用的入口即可，这里不再赘述

多页应用的话，采用插件为 html-webpack-plugin。分离共用模板插件为 SplitChunksPlugin。

每个页面都有公共的代码，可以将这些代码抽离出来，避免重复的加载。比如，每个页面都引用了同一套 css 样式表

随着业务的不断扩展，页面可能会不断的追加，所以一定要让入口的配置足够灵活，避免每次添加新页面还需要修改构建配置

# 23.npm 打包时需要注意哪些？如何利用 webpack 来更好的构建

NPM 模块需要注意以下问题

1. 要支持 CommonJS 模块化规范，所以要求打包后的最后结果也遵守该规则。
2. Npm 模块使用者的环境是不确定的，很有可能并不支持 ES6，所以打包的最后结果应该是采用 ES5 编写的。并且如果 ES5 是经过转换的，请最好连同 SourceMap 一同上传。
3. Npm 包大小应该是尽量小（有些仓库会限制包大小）
4. 发布的模块不能将依赖的模块也一同打包，应该让用户选择性的去自行安装。这样可以避免模块应用者再次打包时出现底层模块被重复打包的情况。
5. UI 组件类的模块应该将依赖的其它资源文件，例如.css 文件也需要包含在发布的模块里。

基于以上需要注意的问题，我们可以对于 webpack 配置做以下扩展和优化：

1. CommonJS 模块化规范的解决方案： 设置 output.libraryTarget='commonjs2'使输出的代码符合 CommonJS2 模块化规范，以供给其它模块导入使用
2. 输出 ES5 代码的解决方案：使用 babel-loader 把 ES6 代码转换成 ES5 的代码。再通过开启 devtool: 'source-map'输出 SourceMap 以发布调试。
3. Npm 包大小尽量小的解决方案：Babel 在把 ES6 代码转换成 ES5 代码时会注入一些辅助函数，最终导致每个输出的文件中都包含这段辅助函数的代码，造成了代码的冗余。解决方法是修改.babelrc 文件，为其加入 transform-runtime 插件
4. 不能将依赖模块打包到 NPM 模块中的解决方案：使用 externals 配置项来告诉 webpack 哪些模块不需要打包。
5. 对于依赖的资源文件打包的解决方案：通过 css-loader 和 extract-text-webpack-plugin 来实现，配置如下：

# 24.如何在 vue 项目中实现按需加载？

1.  es 提案的 import()

()=>import('./test.vue')

2.  resolve => require(['../components/PromiseDemo'], resolve)

3.  resolve => require.ensure([], () => resolve(require('../components/Hello')), 'demo')

# 25.webpack 有哪些优化方案

https://blog.csdn.net/weixin_40811829/article/details/88599201
https://segmentfault.com/a/1190000022205477
[参考链接](https://github.com/lgwebdream/FE-Interview/issues/25)

https://juejin.cn/post/7023242274876162084#heading-22

### 1. 优化构建速度

1. 构建速度分析工具 speed-measure-webpack-plugin
2. 优化 resolve 配置
   1. modules
      告诉 webpack 解析模块时应该搜索的目录,告诉 webpack 优先 src 目录下查找需要解析的文件，会大大节省查找时间

   ```js
   resolve: {
     modules: [resolve('src'), 'node_modules'],
     }
   ```
3. alias
4. 利用 DllPlugin 和 DllReferencePlugin 预编译资源模块 通过 DllPlugin 来对那些我们引用但是绝对不会修改的 npm 包来进行预编译，再通过 DllReferencePlugin 将预编译的模块加载进来。
5. externals
   Webpack 配置中的 externals 和 DllPlugin 解决的是同一类问题：**将依赖的框架等模块从构建过程中移除**。它们的区别在于：
6. exclude / include 缩小范围
   在配置 loader 的时候，我们需要更精确的去指定 loader 的作用目录或者需要排除的目录，通过使用 include 和 exclude 两个配置项
7. noParse 一般使用.min.js 结尾的文件，都是已经经过模块化处理的，那么这个时候就没必要在进行 loader 或者 webpack 分析了，noParer 的字面意思也是不再解析。( noParse 该引入还是会引入，只是不参与 loader 或 webpack 的解析及打包。)比如 jquery
8. IgnorePlugin 直接就将符合匹配条件的模块，不再进行引入，代码中没有。比如 moment 中的非中文语言包
9. 多进程
   > 实际上在小型项目中，开启多进程打包反而会增加时间成本，因为启动进程和进程间通信都会有一定开销。
   1. **thread-loader**
   2. HappyPack webpack5 中已经弃用
10. 缓存 利用缓存可以大幅提升重复构建的速度

11. 为 babel-loader 开启缓存

```js
const config = {
  module: {
    noParse: /jquery|lodash/,
    rules: [
      {
        test: /\.js$/i,
        include: resolve("src"),
        exclude: /node_modules/,
        use: [
          // ...
          {
            loader: "babel-loader",
            options: {
              、、                                                 : true, // 启用缓存
            },
          },
        ],
      },
      {
        test: /\.(s[ac]|c)ss$/i, //匹配所有的 sass/scss/css 文件
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          "cache-loader", // 获取前面 loader 转换的结果
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      // ...
    ],
  },
};
```

1.  cache-loader 缓存一些性能开销比较大的 loader 的处理结果
2.  hard-source-webpack-plugin 为模块提供了中间缓存，重复构建时间大约可以减少 80%，但是在**webpack5 中已经内置了模块缓存，不需要再使用此插件**

### 2. 优化构建结果

1. 分析工具 webpack-bundle-analyzer
   借助插件 webpack-bundle-analyzer 我们可以直观的看到打包结果中，文件的体积大小、各模块依赖关系、文件是够重复等问题，极大的方便我们在进行项目优化的时候，进行问题诊断
2. 压缩 CSS

   1. optimize-css-assets-webpack-plugin
   2. OptimizeCSSNanoPlugin
   3. CSSMinimizerWebpackPlugin

这三个插件在压缩 CSS 代码功能方面，**都默认基于 cssnano 实现**，因此在压缩质量方面没有什么差别

```js
optimization: {
 minimize: true,
 minimizer: [
   // 添加 css 压缩配置
   new OptimizeCssAssetsPlugin({}),
 ]
},

```

1. 压缩 js terser-webpack-plugin

```js
optimization: {
    minimize: true, // 开启最小化
    minimizer: [
      // ...
      new TerserPlugin({})
    ]
  },
```

4. 清除无用的 CSS
   purgecss-webpack-plugin 会单独提取 CSS 并清除用不到的 CSS

5. treeShaking Tree-shaking 作用是剔除没有使用的代码，以降低包的体积
   webpack 默认支持，需要在 .bablerc 里面设置 model：false，即可在生产环境下默认开启

6. Scope Hoisting
   Scope Hoisting 即作用域提升，原理是将多个模块放在同一个作用域下，并重命名防止命名冲突，通过这种方式可以减少函数声明和内存开销。webpack 默认支持，在生产环境下默认开启,只支持 es6 代码

### 3. 优化运行时体验

运行时优化的核心就是提升首屏的加载速度，主要的方式就是**降低首屏加载文件体积，首屏不需要的文件进行预加载或者按需加载**

1. 入口点分割， 多页打包。
2. 代码分割：按需打包 splitChunks 代码拆分，提取公共代码，按需打包针对第三方依赖库，及业务模块，**只打包真正在运行时可能会需要的代码**。
3. 按需加载，**按需加载表示代码模块在交互需要时，动态引入**；

# Webpack 核心概念：

Entry（入口）：Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
Output（出口）：指示 webpack 如何去输出、以及在哪里输出
Module（模块）：指在模块化编程中我们把应用程序分割成的独立功能的代码模块。在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
Chunk（代码块）：指模块间按照引用关系组合成的代码块，一个 chunk 中可以包含多个 module。用于代码合并与分割。
Loader（模块转换器）：用于把模块原内容按照需求转换成新内容。
Plugin（扩展插件）：在 Webpack 构建流程中的特定时机会广播出对应的事件，插件可以监听这些事件，并改变输出结果

# cache-loader hard-source-webpack-plugin 区别

1. HardSourceWebpackPlugin 是 webpack 的插件，用于为模块提供中间缓存步骤。为了查看结果，您需要使用此插件运行两次 webpack：第一次构建将花费正常时间。第二个版本将明显更快。适合用在开发模式 development 和生产模式 production 下。速度提升的效果是原来的好几倍。

2. cache-loader 缓存加载器的编译的结果，避免重新编译。

# SplitChunks 插件是什么呢

简单的来说就是 Webpack 中一个提取或分离代码的插件，主要作用是提取公共代码，防止代码被重复打包，拆分过大的 js 文件，合并零散的 js 文件。

# treeShaking

1. 指去除代码中那些未引用代码，通过 Tree-shaking 就可以极大地减少最终打包后 bundle 的体积。Webpack 生产模式打包的优化过程中，就使用自动开启这个功能，以此来检测我们代码中的未引用代码，然后自动移除它们。

```js
const config = {
 mode: 'production',
 optimization: {
  usedExports: true,// 模块只导出被使用的成员
  minimizer: [
   new TerserPlugin({...}) // 支持删除死代码的压缩器
  ]
 }
}
```

2. Tree Shaking 要依赖 ESM 规范，Tree Shaking 是在编译时进行无用代码消除的，因此它需要 **在编译时确定依赖关系**
3. 解决“具有副作用的模块难以被 Tree Shaking 优化”这个问题，，package.json 的 sideEffects 属性来告诉工程化工具哪些模块具有副作用
4. 如果使用 Babel 对代码进行编译，**Babel 默认会将 ESM 编译为 CommonJS 模块规范**。而我们从前面理论知识知道，Tree Shaking 必须依托于 ESM。为此，我们需要配置 Babel 对于模块化的**编译降级**，

但是如果我们不使用 Babel 将代码编译为 CommonJS 规范的代码，某些工程链上的工具可能就要罢工了，
**思路之一是根据不同的环境，采用不同的 Babel 配置**

```js
// 生产环境
production: {

   presets: [

    [
     '@babel/preset-env',
     {
      modules: false
     }
    ]
   ]
  },
}
// 测试环境
test: {
   presets: [
    [
     '@babel/preset-env',
     {
      modules: 'commonjs'
     }
    ]
   ]
  },
}

```

## 插件 purgecss-webpack-plugin 实现 css treeShaking

## webpack css 中的路径是如何解析的

### 1. css-loader 的主要功能：

css-loader 的作用是帮我们分析出各个 css 文件之间的关系，把各个 css 文件合并成一段 css；css-loader 会对 @import 和 url() 进行处理，就像 js 解析 import/require() 一样，默认生成一个数组存放存放处理后的样式字符串，并将其导出。

1. 转换 css 中的 url 和@import 为 require/import；

例如 url 中的地址（绝对地址除外）会被解析为**相对地址**，防止 webpack 在解析模块地址时出错；这其中包括 webpack alias 别名组成的地址和 node_moduels 库中地址。顺便说下：

css-loader 内部是通过**postcss 生成 css 的 ast 并遍历找出其 url 方法来完成转换的**。

2. 按 commonjs 模块的形式生成 css 文件模块内容

3. css 文件最终转换后的 commonjs 模块形式，模块的后缀还是.css，其内容如下图所示：

4. css-loader 还处理 css module，也是通过遍历 css 的 ast 来完成转换

这样通过 css-loader 完成了 css 文件中图片 url 路径的转换，有助于 webpack 寻找图片资源的具体位置。

### 2. url-loader 处理图片资源

### vite 原理

1. Vite 利用浏览器原生支持 ESM 这一特性，省略了对模块的打包，也就不需要生成 bundle，因此初次启动更快，HMR 特性友好。

2. Vite 开发模式下，通过启动 koa 服务器，**在服务端完成模块的改写（比如单文件的解析编译等）和请求处理**，实现真正的**按需编译**。

3. Vite Server 所有逻辑基本都依赖中间件实现。这些中间件，拦截请求之后，完成了如下内容：

   - 处理 ESM 语法，比如将业务代码中的 import 第三方依赖路径转为浏览器可识别的依赖路径；

   - 对 .ts、.vue 等文件进行即时编译；

   - 对 Sass/Less 的需要预编译的模块进行编译；

   - 和浏览器端建立 socket 连接，实现 HMR。

4. Vite 底层使用 Esbuild 实现对`.ts、jsx、.js` 代码文件的转化

### vite 中 esbuild 的应用

esbuild 是 vite 性能快的关键。esbuild 在 vite 中主要被使用在以下场景:

1. 通过入口分析依赖树，收集 node_modules 中的依赖，提前打包处理，并在磁盘持久化缓存处理过后的文件。

   1. 第三方库代码不会经常变动，缓存处理，提高响应速度。
   2. 打包第三方库，使 lodash 这种文件较多的库，减少网络请求。
   3. 代码兼容处理：比如有的依赖代码模块格式并不是 esm 而是 commonjs，利用 esbuild 进行模块格式转换。

2. 对部分业务文件 使用 esbuild 处理转化，比如 ts、jsx、tsx。注意 js 类型文件并不会被处理

### vite HMR 原理

#### VS Webpack

- Webpack: 重新编译，请求变更后模块的代码，客户端重新加载

- Vite: 请求变更的模块，再重新加载
  Vite 通过 chokidar 来监听文件系统的变更，只用对发生变更的模块重新加载， 只需要精确的使相关模块与其临近的 HMR 边界连接失效即可，这样 HMR 更新速度就不会因为应用体积的增加而变慢而 Webpack 还要经历一次打包构建。所以 HMR 场景下，Vite 表现也要好于 Webpack。

#### 核心流程

Vite 整个热更新过程可以分成四步

1. 创建一个 websocket 服务端和 client 文件，启动服务
2. 通过 chokidar 监听文件变更
3. 当代码变更后，服务端进行判断并推送到客户端
4. 客户端根据推送的信息执行不同操作的更新

### vite 的优势

1. 快速的冷启动: 采用 No Bundle 和 esbuild 预构建，速度远快于 Webpack
2. 高效的热更新：基于 ESM 实现，同时利用 HTTP 头来加速整个页面的重新加载，增加缓存策略
3. 真正的按需加载: 基于浏览器 ESM 的支持，实现真正的按需加载

### 缺点

1. 生态：目前 Vite 的生态不如 Webapck，不过我觉得生态也只是时间上的问题。
2. 生产环境由于 esbuild 对 css 和代码分割不友好使用 Rollup 进行打包