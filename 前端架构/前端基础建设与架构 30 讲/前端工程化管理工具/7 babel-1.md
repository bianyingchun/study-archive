## Babel 是什么

Babel 其实就是一个 JavaScript 的“编译器”。但是一个简单的编译器如何会成为影响前端项目的“大杀器”呢？究其原因，主要是前端语言特性和宿主（浏览器/Node.js 等）环境高速发展，但宿主环境对新语言特性的支持无法做到即时，而开发者又需要兼容各种宿主环境，因此语言特性的降级成为刚需。

另一方面，前端框架“自定义 DSL”的风格越来越凸显，使得前端各种“姿势”的代码被编译为 JavaScript 的需求成为标配。因此 Babel 的职责半径越来越大，它需要完成以下内容：

- 语法转换，一般是高级语言特性的降级；

- Polyfill（垫片/补丁）特性的实现和接入；

- 源码转换，比如 JSX 等。

## babel 的理念

Babel 和 Webpack 为了适应复杂的定制需求和频繁的功能变化，都使用了**微内核** 的架构风格。也就是说它们的**核心非常小，大部分功能都是通过插件扩展实现的。**

1. 可插拔
   比如 Babel 需要有一套灵活的**插件机制**，召集第三方开发者力量，同时还需要方便接入各种工具；
2. 可调试
   比如 Babel 在编译过程中，要提供一套 **Source Map**，来帮助使用者在编译结果和编译前源码之间建立映射关系，方便调试；

3. 基于协定
   Compact 可以简单翻译为基于协定，主要是指实现灵活的**配置方式**，比如你熟悉的 Babelloose 模式，Babel 提供 loose 选项，帮助开发者在“尽量还原规范”和“更小的编译产出体积”之间，找到平衡。

编译是 Babel 的核心目标，因此它自身的实现基于编译原理，深入 AST（抽象语法树）来生成目标代码；同时，Babel 需要工程化协作，需要和各种工具（如 Webpack）相互配合，因此 Babel 一定是庞大复杂的。

## Babel Monorepo 架构包解析

Babel 的包可以分成两种情况

- 一些包的意义是在工程上起作用，因此对于业务来说是不透明的，比如一些插件可能被 babel preset 预设机制打包对外输出
- Babel 一些包是为了纯工程项目使用，或者运行目标在 nodejs 环境中

![babel 架构](../../asset/babel%E6%9E%B6%E6%9E%84%E5%9B%BE.png)
![Babel 家族分层模型图](../../asset/babel%E5%AE%B6%E6%97%8F%E5%88%86%E5%B1%82%E6%A8%A1%E6%8B%9F%E5%9B%BE.png)

1. 基础层：提供了基础的编译能力，完成分词、解析 AST、生成产出代码的工作。
2. 辅助层：基础层中，我们将一些抽象能力下沉为辅助层，这些抽象能力被基础层使用。
3. 胶水层：同时，在基础层之上，我们构建了如 @babel/preset-env 等预设/插件能力，这些类似“胶水”的包，完成了代码编译降级所需补丁的构建、运行时逻辑的模块化抽象等工作。
4. 应用层：在最上层，Babel 生态提供了终端命令行、Webpack loader、浏览器端编译等应用级别的能力。

下面，我会对一些“Babel 家族重点成员”进行梳理，并简单说说它们的基本原理。

### 核心

@babel/core 是 Babel 实现转换的核心

- 加载和处理配置(config)
- 加载插件
- 调用 Parser 进行语法解析，生成 AST
- 调用 Traverser 遍历 AST，并使用访问者模式应用'插件'对 AST 进行转换
- 生成代码，包括 SourceMap 转换和源代码生成
- 它可以根据配置，进行源码的编译转换：

```javascript
var babel = require("@babel/core");

babel.transform(code, options, function (err, result) {
  result; // => { code, map, ast }
});
```

### 核心周边插件支撑

#### @babel/standalone

这个包非常有趣，它可以**在非 Node.js 环境（比如浏览器环境）自动编译含有 text/babel 或 text/jsx 的 type 值的 script 标签，并进行编译**

```html
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
  const getMessage = () => "Hello World";
  document.getElementById("output").innerHTML = getMessage();
</script>
```

其工作原理藏在 babel-standalone 的核心源码中，最后的编译行为由@babel/core 来提供。

@babel/standalone 可以在浏览器中直接执行，因此这个包对于浏览器环境动态插入高级语言特性的脚本、在线自动解析编译非常有意义。我们知道的 Babel 官网也用到了这个包，JSFiddle、JS Bin 等也都是 @babel/standalone 的受益者。

#### @babel/parser 语法分析 ，将词法分析后的 Token 数组转换为 AST

它是 Babel 用来对 JavaScript 语言解析的解析器。将源代码解析为 AST 就靠它了。 它已经内置支持很多语法. 例如 JSX、Typescript、Flow、以及最新的 ECMAScript 规范

```javascript
require("@babel/parser").parse("code", {
  sourceType: "module",
  plugins: ["jsx", "flow"],
});
```

require("@babel/parser").parse()方法可以返回给我们一个针对源码编译得到的 AST，

#### @babel/traverse 遍历 AST 并应用转换器

实现了访问者模式，对 AST 进行遍历。
有了 AST，我们还需要对 AST 完成修改，才能产出编译后的代码。这就需要对 AST 进行遍历，此时 @babel/traverse 就派上用场了，使用方式如下：

```javascript
traverse(ast, {
  enter(path) {
    if (path.isIdentifier({ name: "n" })) {
      path.node.name = "x";
    }
  },
});
```

##### 访问者模式

转换器会遍历 AST 树，找出自己感兴趣的节点类型, 再进行转换操作. 这个过程和我们操作 DOM 树差不多，只不过目的不太一样。AST 遍历和转换一般会使用访问者模式。
想象一下，Babel 有那么多插件，如果每个插件自己去遍历 AST，对不同的节点进行不同的操作，维护自己的状态。这样子不仅低效，它们的逻辑分散在各处，会让整个系统变得难以理解和调试， 最后插件之间关系就纠缠不清，乱成一锅粥。

**所以转换器操作 AST 一般都是使用访问器模式，由这个访问者(Visitor)来 ① 进行统一的遍历操作，② 提供节点的操作方法，③ 响应式维护节点之间的关系；而插件(设计模式中称为‘具体访问者’)只需要定义自己感兴趣的节点类型，当访问者访问到对应节点时，就调用插件的访问(visit)方法。**

遍历的同时，如何对 AST 上指定内容进行修改呢？这就又要引出另外一个“家族成员”

#### @babel/types 包提供了对具体的 AST 节点的修改能力。

得到了编译后的 AST 之后，

#### 最后一步：使用 @babel/generator 对新的 AST 转换为源代码

支持 SourceMap

```javascript
const output = generate(
  ast,
  {
    /* options */
  },
  code
);
```

**至此，我们看到了 @babel/core 被多个 Babel 包应用，而 @babel/core 的能力由更底层的 @babel/parser、@babel/code-frame、@babel/generator、@babel/traverse、@babel/types 等包提供。这些“家族成员”提供了更基础的 AST 处理能力。**

### 插件

#### 1. 语法插件 （@babel/plugin-syntax-\*）：

上面说了 @babel/parser 已经支持了很多 JavaScript 语法特性，Parser 也不支持扩展. 因此 plugin-syntax-\* **实际上只是用于开启或者配置 Parser 的某个功能特性**。

一般用户不需要关心这个，Transform 插件里面已经包含了相关的 plugin-syntax-\*插件了。用户也可以通过 parserOpts 配置项来直接配置 Parser

#### 2. 转换插件

**用于对 AST 进行转换, 实现转换为 ES5 代码、压缩、功能增强等目的**. Babel 仓库将转换插件划分为两种(只是命名上的区别)：

- @babel/plugin-transform-\*： 普通的转换插件
- @babel/plugin-proposal-\*： 还在'提议阶段'(非正式)的语言特性

#### 3. 预定义集合 (@babel/presets-\*)：

**插件集合或者分组，主要方便用户对插件进行管理和使用**。比如 preset-env 含括所有的标准的最新特性; 再比如 preset-react 含括所有 react 相关的插件.

#### 插件开发辅助

- @babel/template： 某些场景直接操作 AST 太麻烦，就比如我们直接操作 DOM 一样，所以 Babel 实现了这么一个简单的**模板引擎**，可以将字符串代码转换为 AST。比如在生成一些辅助代码(helper)时会用到这个库

- @babel/types： AST 节点构造器和断言. 插件开发时使用很频繁

- @babel/helper-\*： 一些辅助器，用于辅助插件开发，例如简化 AST 操作

- @babel/helper： 辅助代码，单纯的语法转换可能无法让代码运行起来，比如低版本浏览器无法识别 class 关键字，这时候需要添加辅助代码，对 class 进行模拟。

### 工具

- @babel/node： Node.js CLI, 通过它直接运行需要 Babel 处理的 JavaScript 文件

- @babel/register： Patch NodeJs 的 require 方法，支持导入需要 Babel 处理的 JavaScript 模块

- @babel/cli： CLI 工具

### 典型的 Babel 底层编译流程

1. Tokenizer
   词法分析，将源代码分割成 Token 数组
2. Parser
   语法分析，将 Token 数组转化为 AST
3. traverse
   遍历（访问者模式） AST 并生成应用转换器
4. transform
   AST 转换器，增删改查 AST 节点
5. generator
   代码生成

source code => [@babel/core] (解析代码) => AST => [@babel/traverse | @babel/types](对AST树进行遍历转译) =>
AST => [@babel/generator] ( 生成代码)=> output code
这样一个典型的 Babel 底层编译流程就出来了，如下图：

![Babel 底层编译流程图](../../asset/babel%E5%BA%95%E5%B1%82%E7%BC%96%E8%AF%91%E6%B5%81%E7%A8%8B%E5%9B%BE.png)

上图也是 Babel 插件运作实现的基础。基于 AST 的操作，Babel 将上述所有能力开放给插件，让第三方能够更方便地操作 AST，并聚合成最后编译产出的代码。

基于以上原理，Babel 具备了编译处理能力，但在工程中运用时，我们一般不会感知这些内容，你可能也很少直接操作 @babel/core、@babel/types 等，**而应该对 @babel/preset-env 更加熟悉，毕竟 @babel/preset-env 是直接暴露给开发者在业务中运用的包能力。**@babel/preset-env 允许我们配置需要支持的目标环境

> > 分割线==============

# 深入理解 Babel 原理及其使用

## Babel 的包构成

### 核心包

1. babel-core
   babel 转译器本身，提供了 babel 的转译 API，如 babel.transform 等，用于对代码进行转译。像 webpack 的 babel-loader 就是调用这些 API 来完成转译过程的。

2. babylon
   js 的词法解析器

3. babel-traverse
   用于对 AST（抽象语法树，想了解的请自行查询编译原理）的遍历，主要给 plugin 用

4. babel-generator
   根据 AST 生成代码

### 功能包

1. babel-types：用于检验、构建和改变 AST 树的节点

2. babel-template：辅助函数，用于从字符串形式的代码来构建 AST 树节点

3. babel-helpers：一系列预制的 babel-template 函数，用于提供给一些 plugins 使用

4. babel-code-frames：用于生成错误信息，打印出错误点源代码帧以及指出出错位置

5. babel-plugin-xxx：babel 转译过程中使用到的插件，其中 babel-plugin-transform-xxx 是 transform 步骤使用的

6. babel-preset-xxx：transform 阶段使用到的一系列的 plugin
7. babel-polyfill：JS 标准新增的原生对象和 API 的 shim，实现上仅仅是 core-js 和 regenerator-runtime 两个包的封装

8. babel-runtime：功能类似 babel-polyfill，一般用于 library 或 plugin 中，因为它不会污染全局作用域

### 工具包

1. babel-cli：babel 的命令行工具，通过命令行对 js 代码进行转译
2. babel-register：通过绑定 node.js 的 require 来自动转译 require 引用的 js 代码文件

## babel 的配置

### 使用形式

如果是以命令行方式使用 babel，那么 babel 的设置就以命令行参数的形式带过去；
还可以在 package.json 里在 babel 字段添加设置；

但是**建议还是使用一个单独的.babelrc 文件**，把 babel 的设置都放置在这里，所有 babel API 的 options（除了回调函数之外）都能够支持，具体的 options 见 babel 的 API options 文档

### 常用 options 字段说明

1. env：指定在不同环境下使用的配置。比如 production 和 development 两个环境使用不同的配置，就可以通过这个字段来配置。env 字段的从 process.env.BABEL_ENV 获取，如果 BABEL_ENV 不存在，则从 process.env.NODE_ENV 获取，如果 NODE_ENV 还是不存在，则取默认值"development"

2. plugins：要加载和使用的插件列表，插件名前的 babel-plugin-可省略；plugin 列表按从头到尾的顺序运行

3. presets：要加载和使用的 preset 列表，preset 名前的 babel-preset-可省略；**presets 列表的 preset 按从尾到头的逆序运行**（为了兼容用户使用习惯）

4. **同时设置了 presets 和 plugins，那么 plugins 的先运行**；每个 preset 和 plugin 都可以再配置自己的 option

### 配置文件的查找

babel 会从当前转译的文件所在目录下查找配置文件，如果没有找到，就顺着文档目录树一层层往上查找，一直到.babelrc 文件存在或者带 babel 字段的 package.json 文件存在为止。

## babel 的 工作原理

babel 是一个转译器，感觉相对于编译器 compiler，叫转译器 transpiler 更准确，因为它只是把同种语言的高版本规则翻译成低版本规则，而不像编译器那样，输出的是另一种更低级的语言代码。
但是和编译器类似，babel 的转译过程也分为三个阶段：parsing、transforming、generating，以 ES6 代码转译为 ES5 代码为例，babel 转译的具体过程如下：

1. ES6 代码输入
2. babylon 进行解析
3. 得到 AST
4. plugin 用 babel-traverse 对 AST 树进行遍历转译
5. 得到新的 AST 树
6. 用 babel-generator 通过 AST 树生成 ES5 代码

此外，还要注意很重要的一点就是，babel 只是转译新标准引入的语法，比如 ES6 的箭头函数转译成 ES5 的函数；而新标准引入的新的原生对象，**部分原生对象新增的原型方法，新增的 API 等（如 Proxy、Set 等），这些 babel 是不会转译的。需要用户自行引入 polyfill 来解决**

## plugins

[深入理解 Babel 原理及其使用](https://www.jianshu.com/p/e9b94b2d52e2)
[Babel 用户手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/user-handbook.md)
[ASTExplorer](https://astexplorer.net/#/KJ8AjD6maa)
[深入浅出 Babel 上篇：架构和原理 + 实战](https://juejin.cn/post/6844903956905197576)
