### @babel/core

Babel 的核心模块.

### @babel/cli

终端中通过命令行方式运行，编译文件或目录

### 插件 plugins

**插件在 Presets 前运行。前往后排列**
它的本质就是一个 JS 程序, 指示着 Babel 如何对代码进行转换.

@babel/plugin-transform-arrow-functions:官方插件 将 ES6+转成 ES5

### preset

**Preset 顺序是颠倒的（从后往前）。**
这里可以理解为一个 preset 就是一组插件的集合.
@babel/preset-env:这个 preset 包括支持现代 JavaScript(ES6+)的所有插件.

babel-preset-es2015、babel-preset-es2016、babel-preset-es2017
分别支持不同版本的 ECMA 规范，es2015 将 es6 转成 es5，es2016 只将比 es6 新增加的特性转成 es5。es2017 也是只将比 es6 新增加的特性转成 es5

### 配置文件 babel.config.js

```js
const presets = [
  [
    "@babel/env", //只会为目标浏览器中没有的功能加载转换插件
    {
      targets: {
        edge: "9", //转换之后的代码支持到edge17.
        chrome: "64",
        firefox: "60",
        safari: "11.1",
      },
    },
  ],
];

module.exports = { presets };
```

### Polyfill

Plugins 是提供的插件, 例如箭头函数转普通函数@babel/plugin-transform-arrow-functions

Presets 是一组 Plugins 的集合.

而 Polyfill 是**对执行环境或者其它功能的一个补充**.

你想在 edge10 浏览器中使用 ES7 中的方法 includes(), 但是我们知道这个版本的浏览器环境是不支持你使用这个方法的, 所以如果你强行使用并不能达到预期的效果.
而 polyfill 的作用正是如此, 知道你的环境不允许, 那就帮你**引用一个这个环境**, 也就是说此时编译后的代码就会变成

```js
var hasTwo = [1, 2, 3].includes(2);

// 加了 polyfill 之后的代码
require("core-js/modules/es7.array.includes");
require("core-js/modules/es6.string.includes");
var hasTwo = [1, 2, 3].includes(2);
```

#### @babel/polyfill

@babel/polyfill 用来模拟完成 ES6+环境:

- 可以使用像 Promise 或者 WeakMap 这样的新内置函数
- 可以使用像 Array.from 或者 Object.assign 这样的静态方法
- 可以使用像 Array.prototype.includes 这样的实例方法
- 还有 generator 函数

而@babel/polyfill 模块包括了 core-js 和自定义 regenerator runtime
**对于库/工具**, 如果你不需要像 Array.prototype.includes 这样的实例方法, **可以使用 transform runtime 插件, 而不是使用污染全局的@babel/polyfill.**

**对于应用程序**, 我们建议安装使用@babel/polyfill

安装

```sh
npm install --save @babel/polyfill
```

(注意 --save 选项而不是 --save-dev，因为这是一个需要在源代码之前运行的 polyfill。)
但是由于我们使用的是 env preset, 这里个配置中有一个叫做 "useBuiltIns"的选项
如果将这个选择设置为"usage", 就**只包括你需要的 polyfill**

**安装配置了@babel/polyfill, Babel 将检查你的所有代码, 然后查找目标环境中缺少的功能, 并引入仅包含所需的 polyfill**

### 被 deprecated 的@babel/polyfill

@babel/polyfill 的 polyfill, 其实它在 Babel7.4.0 以上已经不被推荐使用了.

而是推荐使用**core-js@3+@babel/preset-env 然后设置@babel/preset-env 的 corejs 选项为 3**

## 插件手册

[原文链接](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)

### Babel 的处理步骤 解析（parse），转换（transform），生成（generate）。

#### 解析 parse

1. 词法分析 将字符串形式的代码转化为令牌 tokens 流
2. 语法分析 一个令牌流转换成 AST 的形式。 这个阶段会使用令牌中的信息把它们转换成一个 AST 的表述结构，这样更易于后续的操作。

#### 转换 transform

转换步骤接收 AST 并对其进行遍历，在此过程中对节点进行添加、更新及移除等操作。 这是 Babel 或是其他编译器中最复杂的过程 同时也是插件将要介入工作的部分

#### 代码生成 generate

代码生成步骤把最终（经过一系列转换之后）的 AST 转换成字符串形式的代码，同时还会创建源码映射（source maps）。.

深度优先遍历整个 AST，然后构建可以表示转换后代码的字符串。

### 遍历
