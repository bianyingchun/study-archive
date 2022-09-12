## vite 为什么会出现

### webpack 等构建工具的弊端

这些构建工具在本地开发调试的时候，也都会提前把你的模块先打包成浏览器可读取的 js bundle，虽然有诸如路由懒加载等优化手段，**但懒加载并不代表懒构建，Webpack 还是需要把你的异步路由用到的模块提前构建好**。
当你的项目越来越大的时候，启动也难免变的越来越慢，甚至可能达到分钟级别。而 HMR 热更新也会达到好几秒的耗时。

### vite 的优势

1. Vite 基于 ESM，因此实现了快速启动和即时模块热更新能力；

2. Vite 在服务端实现了按需编译。

经验丰富的开发者通过上述介绍，似乎就能给出 Vite 的基本流程，甚至可以说得更直白一些：**Vite 在开发环境下并没有打包和构建过程**。

**vite 会在本地帮你启动一个服务器，当浏览器读取到这个 html 文件之后，会在执行到 import 的时候才去向服务端发送 Main.vue 模块的请求，Vite 此时在利用内部的一系列黑魔法，包括 Vue 的 template 解析，代码的编译等等，解析成浏览器可以执行的 js 文件返回到浏览器端。这就保证了只有在真正使用到这个模块的时候，浏览器才会请求并且解析这个模块，最大程度的做到了按需加载**

## vite 原理总结

![vite运行思路](../../asset/vite%E4%B8%8Ewebpack%E6%96%B9%E6%A1%88%E6%80%9D%E8%B7%AF%E5%AF%B9%E6%AF%94.png)
![vite运行思路](../../asset/vite%E4%B8%8Ewebpack%E6%96%B9%E6%A1%88%E6%80%9D%E8%B7%AF%E5%AF%B9%E6%AF%94-2.png)

1. Vite 利用浏览器原生支持 ESM 这一特性，省略了对模块的打包，也就不需要生成 bundle，因此初次启动更快，HMR 特性友好。

2. Vite 开发模式下，通过启动 koa 服务器，**在服务端完成模块的改写（比如单文件的解析编译等）和请求处理**，实现真正的**按需编译**。

3. Vite Server 所有逻辑基本都依赖中间件实现。这些中间件，拦截请求之后，完成了如下内容：

   - 处理 ESM 语法，比如将业务代码中的 import 第三方依赖路径转为浏览器可识别的依赖路径；

   - 对 .ts、.vue 等文件进行即时编译；

   - 对 Sass/Less 的需要预编译的模块进行编译；

   - 和浏览器端建立 socket 连接，实现 HMR。

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

![vite HMR](../../asset/vite%20HMR.png)

### vite@2.x不使用 koa 来创建服务和管理中间件了，而是使用 connect。是处于什么考虑呢？

讲师回复： 这是目前看到最好的问题之一，不过提问者应该更进一步，提升自己解决问题，找到答案的能力。具体原因在 https://github.com/vitejs/vite/blob/91dbb017091c175a54bcd1c93a69f8458d1bde8d/docs/guide/migration.md#for-plugin-authors 中有所体现了其实，简单总结一下是 vite@2.x 主要是用基于 hooks 的插件，对于 koa 中间件的需求大幅度减少，从依赖成本上看，old school 的 connect 即可方便轻巧满足需求了

## EsBuild 依赖预构建

1. CommonJS 和 UMD 兼容性: **开发阶段中，Vite 的开发服务器将所有代码视为原生 ES 模块。因此，Vite 必须先将作为 CommonJS 或 UMD 发布的依赖项转换为 ESM。**

当转换 CommonJS 依赖时，Vite 会执行智能导入分析，这样即使导出是动态分配的（如 React），按名导入也会符合预期效果：

```js
// 符合预期
import React, { useState } from "react";
```

2. 性能： Vite **将有许多内部模块的 ESM 依赖关系转换为单个模块**，以提高后续页面加载性能。

一些包将它们的 ES 模块构建作为许多单独的文件相互导入。例如，lodash-es 有超过 600 个内置模块！当我们执行 import { debounce } from 'lodash-es' 时，浏览器同时发出 600 多个 HTTP 请求！尽管服务器在处理这些请求时没有问题，但大量的请求会在浏览器端造成网络拥塞，导致页面的加载速度相当慢。

通过 esbuild 预构建 lodash-es 成为一个模块，我们就只需要一个 HTTP 请求了！

### esbuild

Vite 底层使用 Esbuild 实现对`.ts、jsx、.js` 代码文件的转化，所以先看下什么是 es-build。
Esbuild 是一个 JavaScript Bundler 打包和压缩工具，它提供了与 Webpack、Rollup 等工具相似的资源打包能力。可以将 JavaScript 和 TypeScript 代码打包分发在网页上运行。但其打包速度却是其他工具的 10 ～ 100 倍。
目前他支持以下的功能：

加载器、压缩、打包、Tree shaking、Source map 生成

esbuild 总共提供了四个函数：transform、build、buildSync、Service。有兴趣的可以移步官方文档了解。

1. 编译运行 VS 解释运行

大多数前端打包工具都是基于 JavaScript 实现的，大家都知道 JavaScript 是解释型语言，边运行边解释。而 Esbuild 则选择使用 Go 语言编写，该语言可以编译为原生代码,在编译的时候都将语言转为机器语言，在启动的时候直接执行即可，在 CPU 密集场景下，Go 更具性能优势。

2. 多线程 VS 单线程

JavaScript 本质上是一门单线程语言，直到引入 WebWorker 之后才有可能在浏览器、Node 中实现多线程操作。就我对 Webpack 的源码理解，其源码也并未使用 WebWorker 提供的多线程能力。而 GO 天生的多线程优势。

3. 对构建流程进行了优化，充分利用 CPU 资源

### 实现原理

Vite 预编译之后，将文件缓存在 node_modules/.vite/文件夹下。根据以下地方来决定是否需要重新执行预构建。

1. package.json 中：dependencies 发生变化
2. 包管理器的 lockfile

如果想强制让 Vite 重新预构建依赖，可以使用--force 启动开发服务器，或者直接删掉 node_modules/.vite/文件夹。

![预构建流程图](../../asset/vite-%E9%A2%84%E6%9E%84%E5%BB%BA%E6%B5%81%E7%A8%8B.png)

### rollup

在生产环境下，Vite 使用 Rollup 来进行打包
Rollup 是基于 ESM 的 JavaScript 打包工具。相比于其他打包工具如 Webpack，他总是能打出更小、更快的包。因为 Rollup 基于 ESM 模块，比 Webpack 和 Browserify 使用的 CommonJS 模块机制更高效。Rollup 的亮点在于同一个地方，一次性加载。能针对源码进行 Tree Shaking(去除那些已被定义但没被使用的代码)，以及 Scope Hoisting 以减小输出文件大小提升运行性能。
Rollup 分为 build（构建）阶段和 output generate（输出生成）阶段。主要过程如下：

1. 获取入口文件的内容，包装成 module，生成抽象语法树
2. 对入口文件抽象语法树进行依赖解析
3. 生成最终代码
4. 写入目标文件
   如果你的项目（特别是类库）只有 JavaScript，而没有其他的静态资源文件，使用 Webpack 就有点大才小用了。因为 Webpack 打包的文件的体积略大，运行略慢，可读性略低。这时候 Rollup 也不失为一个好选择。

## 插件机制

Vite 可以使用插件进行扩展，这得益于 Rollup 优秀的插件接口设计和一部分 Vite 独有的额外选项。这意味着 Vite 用户可以利用 Rollup 插件的强大生态系统，同时根据需要也能够扩展开发服务器和 SSR 功能。

## 4 总结

最后总结下 Vite 相关的优缺点：

### 优点：

1. 快速的冷启动: 采用 No Bundle 和 esbuild 预构建，速度远快于 Webpack
2. 高效的热更新：基于 ESM 实现，同时利用 HTTP 头来加速整个页面的重新加载，增加缓存策略
3. 真正的按需加载: 基于浏览器 ESM 的支持，实现真正的按需加载

### 缺点

1. 生态：目前 Vite 的生态不如 Webapck，不过我觉得生态也只是时间上的问题。
2. prod环境的构建，目前用的Rollup，原因在于esbuild对于css和代码分割不是很友好

Vite.js 虽然才在构建打包场景兴起，但在很多场景下基本都会优于现有的解决方案。如果有生态、想要丰富的 loader、plugins 的要求可以考虑成熟的 Webpack。在其余情况下，Vite.js 不失为一个打包构建工具的好选择。
