### polyfill 方案

定义：polyfill 就是用社区上提供的一段代码，让我们在不兼容某些新特性的浏览器上，使用该新特性。

那么如何能在工程中，寻找并设计一个“最完美”的 polyfill 方案呢？注意，这里的完美指的是侵入性最小，工程化、自动化程度最高，业务影响最低。

1. 第一种方案：手动打补丁。这种方式最为简单直接，也能天然做到“按需打补丁”，但是这不是一种工程化的解决方式，方案原始而难以维护，同时对于 polyfill 的实现要求较高。

于是，es5-shim 和 es6-shim 等“轮子”出现了，它们伴随着前端开发走过了一段艰辛岁月。但 es5-shim 和 es6-shim 这种笨重的方案很快被 babel-polyfill 取代，babel-polyfill 融合了 core-js 和 regenerator-runtime。

但如果粗暴地使用 babel-polyfill 一次性全量导入到项目中，不和 @babel/preset-env 等方案结合，babel-polyfill 会将其所包含的所有补丁都应用在项目当中，这样直接造成了**项目 size 过大的问题，且存在污染全局变量的潜在问题。**

于是，babel-polyfill 结合 @babel/preset-env + useBuiltins（entry） + preset-env targets 的方案如今更为流行，@babel/preset-env 定义了 Babel 所需插件预设，同时由 Babel 根据 preset-env targets 配置的支持环境，自动按需加载 polyfills，使用方式如下：

```javascript
{
  "presets": [
    ["@babel/env", {
      useBuiltIns: 'entry',
      targets: { chrome: 44 }
    }]
  ]
}
```
