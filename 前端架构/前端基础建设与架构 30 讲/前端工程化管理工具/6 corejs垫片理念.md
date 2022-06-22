core-js 是一个 JavaScript 标准库，它包含了 ECMAScript 2020 在内的多项特性的 polyfills，以及 ECMAScript 在 proposals 阶段的特性、WHATWG/W3C 新特性等。因此它是一个现代化前端项目的“标准套件”。

### core-js 分包设计

1. core-js
   实现的基础垫片能力，是整个 core-js 的逻辑核心。

2. core-js-pure
   core-js-pure 提供了不污染全局变量的垫片能力，比如我们可以按照：

```javascript
import _from from "core-js-pure/features/array/from";
import _flat from "core-js-pure/features/array/flat";
```

的方式，来实现独立的导出命名空间，进而避免全局变量的污染

3. core-js-compact
   core-js-compact 维护了按照 browserslist 规范的垫片需求数据，来帮助我们找到“符合目标环境”的 polyfills 需求集合，比如以下代码：

```javascript
const {
  list, // array of required modules
  targets, // object with targets for each module
} = require("core-js-compat")({
  targets: "> 2.5%",
});
```

就可以筛选出全球使用份额大于 2.5% 的浏览器范围，并提供在这个范围下需要支持的垫片能力。

4. core-js-builder
   core-js-builder 可以结合 core-js-compact 以及 core-js，并利用 webpack 能力，根据需求打包出 core-js 代码。比如：

```javascript
require("core-js-builder")({
  targets: "> 0.5%",
  filename: "./my-core-js-bundle.js",
})
  .then((code) => {})
  .catch((error) => {});
```

将会把符合需求的 core-js 垫片打包到 my-core-js-bundle.js 文件当中。

5. core-js-bundle

### 总结

总之，根据分包的设计，我们能发现，**core-js 将自身能力充分解耦，提供出的多个包都可以被其他项目所依赖**。比如：

- core-js-compact 可以被 Babel 生态使用，由 Babel 分析出根据环境需要按需加载的垫片；

- core-js-builder 可以被 Node.js 服务使用，构建出不同场景的垫片包。

宏观上的设计，体现了工程复用能力。

### 寻找最佳 Polyfill 方案

前文多次提到了 polyfill/垫片/补丁（下文混用这三种说法），这里我们正式对 polyfill 进行一个定义：

> A polyfill, or polyfiller, is a piece of code (or plugin) that provides the technology that you, the developer, expect the browser to provide natively. Flattening the API landscape if you will.

简单来说，**polyfill 就是用社区上提供的一段代码，让我们在不兼容某些新特性的浏览器上，使用该新特性**。

随着前端的发展，尤其是 ECMAScript 的迅速成长以及浏览器的频繁更新换代，前端使用 polyfills 技术的情况屡见不鲜。那么如何能在工程中，寻找并设计一个“最完美”的 polyfill 方案呢？注意，这里的完美指的是**侵入性最小，工程化、自动化程度最高，业务影响最低。**

#### 手动打补丁

第一种方案：**手动打补丁**。这种方式最为简单直接，也能天然做到“按需打补丁”，但是这不是一种工程化的解决方式，方案原始而难以维护，同时对于 polyfill 的实现要求较高。

#### babel-polyfill 方案

于是，es5-shim 和 es6-shim 等“轮子”出现了，它们伴随着前端开发走过了一段艰辛岁月。但 es5-shim 和 es6-shim 这种笨重的方案很快被 babel-polyfill 取代，**babel-polyfill 融合了 core-js 和 regenerator-runtime**。

但如果粗暴地使用 babel-polyfill 一次性全量导入到项目中，不和 @babel/preset-env 等方案结合，babel-polyfill 会将其所包含的所有补丁都应用在项目当中，这样直接造成了项目 size 过大的问题，且存在污染全局变量的潜在问题。

于是，**babel-polyfill 结合 @babel/preset-env + useBuiltins（entry） + preset-env targets 的方案如今更为流行**，

- @babel/preset-env 定义了 Babel 所需插件预设，
- 同时由 Babel 根据 preset-env targets 配置的支持环境，自动按需加载 polyfills，使用方式如下：

```js
{
"presets": [
  ["@babel/env", {
    useBuiltIns: 'entry',
    targets: { chrome: 44 }
    }]
  ]
}
```

这样我们在工程代码入口处的：

```js
import "@babel/polyfill";
// 会被编译为：
import "core-js/XXXX/XXXX";
import "core-js/XXXX/XXXXX";
```

这样的方式省力省心。也是 core-js 和 Babel 深度绑定并结合的典型案例。

core-js 既可以在项目中单独使用，也可以和 Babel 绑定，作为更低层的依赖出现。

我们再思考一个问题：如果某个业务代码中，并没有用到配置环境填充的 polyfills，那么这些 polyfills 的引入依然出现了引用浪费的情况。实际上环境需要是一回事儿，代码是否需要却是另一回事儿。比如，我的 MPA（多页面应用）项目需要提供 Promise Polyfill，但是某个业务页面中，并没有使用 Promise 特性，理想情况并不需要在当前页面中引入 Promise Polyfill bundle。

针对这个问题，@babel/preset-env + useBuiltins（usage） + preset-env targets 方案就出现了，注意这里的 useBuiltins 配置为 usage，**它可以真正根据代码情况，分析 AST（抽象语法树）进行更细粒度的按需引用。但是这种基于静态编译的按需加载补丁也是相对的，因为 JavaScript 是一种弱规则的动态语言**，比如这样的代码：foo.includes(() => {//...})，我们无法判断出这里的 includes 是数组原型方法还是字符串原型方法，因此一般做法只能将数组原型方法和字符串原型方法同时打包为 polyfill bundle。

#### 在线动态打补丁

除了在打包构建阶段植入 polyfill 以外，另外一个思路是**在线动态打补丁**，这种方案以 Polyfill.io 为代表，它提供了 CDN 服务，使用者可以按照所需环境，生成打包链接。
在高版本浏览器上，可能会返回空内容，因为该浏览器已经支持了 ES2015 特性。如果在低版本浏览器上，将会得到真实的 polyfills bundle。

从工程化的角度来说，一个趋于完美的 polyfill 设计应该满足的**核心原则是按需加载补丁**，这个按需加载主要包括两方面：

1. 按照用户终端环境

2. 按照业务代码使用情况

因为按需加载补丁，意味着更小的 bundle size，直接决定了应用的性能。
