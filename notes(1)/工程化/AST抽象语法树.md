## 什么是 AST

源代码语法结构的一种抽象表示。它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构。
**它就是你所写代码的的树状结构化表现形式。**

有了这棵树，我们就可以通过操纵这颗树，精准的定位到声明语句、赋值语句、运算语句等等，实现对代码的分析、优化、变更等操作。

```js
{
  type: "FunctionDeclaration",
  id: {
    type: "Identifier",
    name: "square"
  },
  params: [{
    type: "Identifier",
    name: "n"
  }],
  body: {
    type: "BlockStatement",
    body: [{
      type: "ReturnStatement",
      argument: {
        type: "BinaryExpression",
        operator: "*",
        left: {
          type: "Identifier",
          name: "n"
        },
        right: {
          type: "Identifier",
          name: "n"
        }
      }
    }]
  }
}
// 你会留意到 AST 的每一层都拥有相同的结构：

{
  type: "FunctionDeclaration",
  id: {...},
  params: [...],
  body: {...}
}
{
  type: "Identifier",
  name: ...
}
{
  type: "BinaryExpression",
  operator: ...,
  left: {...},
  right: {...}
}
```

> 注意：出于简化的目的移除了某些属性

这样的每一层结构也被叫做 节点（Node）。 一个 AST 可以由单一的节点或是成百上千个节点构成。 它们组合在一起可以描述用于静态分析的程序语法。

## AST 能做什么

1. IDE 的错误提示、代码格式化、代码高亮、代码自动补全等
2. JSLint、JSHint 对代码错误或风格的检查等
3. webpack、rollup 进行代码打包等
4. CoffeeScript、TypeScript、JSX 等转化为原生 Javascript

## 如何生成 AST

### parser

在了解如何生成 AST 之前，有必要了解一下 Parser（常见的 Parser 有 esprima、traceur、acorn、shift 等）

JS Parser 其实是一个解析器，它是将 js 源码转化为抽象语法树（AST）的解析器。

整个解析过程主要分为以下两个步骤：

1. 词法分析：扫描代码，字符串形式的代码转换为 令牌（tokens） 流。同时，它会移除空白符，注释，等。最后，整个代码将被分割进一个 tokens 列表

2. 语法分析：在分词基础上建立分析语法单元之间的关系，将词法分析出来的数组转化 AST 成树形的表达形式。同时，验证语法，语法如果有错的话，抛出语法错误。

[聊一聊 Javascript 中的 AST](https://www.jianshu.com/p/32db2f258986)
