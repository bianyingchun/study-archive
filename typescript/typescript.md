js 项目如何升级为 ts？有何影响？
ts 基础类型都哪些，他们跟 js 的区别
ts 为什么会流行？与 ECMA 新规范的关系？
tslint 都能配置哪些功能？对开发流程有何影响？
如何使用 js 实现类型约束，枚举等特性么？

## 如何理解接口，泛型?

“泛型,简单来说就是类型变量。在 ts 中存在类型,类型如 number、string、boolean 等,泛型就是使用一个类型变量来表示一种类型,类型值通常是在使用的时候才会设置。泛型的使用场景非常多,可以在函数、类甚至 interface 中使用。”

## js 与 ts 的区别，与优势,

### 区别

1. TypeScript 是静态类型，TS 是动态类型
2. 定义变量的时候，TS 必须指定数据类型，JS 不确定
3. TS 是 JS 的超集，在 TS 中可以使用原生 JS 语法

### 各自优势

**编码期间检测错误，增强了代码的可读性，还引入了类、接口、模块、装饰器、命名空间等特性（ES6），完全兼容 js，增强了编辑器的功能，提供代码补全，接口提示等等**

1. TS

   1. **静态输入**：在开发人员编写脚本时检测错误，查找并修复错误
   2. **大型的开发项目和更好的协作**：当开发大型项目时，会有许多开发人员，此时乱码和错误的机也会增加。类型安全是一种在**编码期间检测错误**的功能，而不是在编译项目时检测错误。这为开发团队创建了一个更高效的编码和调试过程
   3. 更强的生产力：干净的 ECMAScript 6 代码，自动完成和动态输入等因素有助于提高开发人员的工作效率。这些功能也有助于编译器创建优化的代码
   4. **除了静态类型的定义和检查外，TypeScript 还引入了类、接口、模块、装饰器、命名空间等特性（ES6 中也实现了部分)**
   5. TypeScript 是添加了类型系统的 JavaScript，适用于任何规模的项目，**增加了代码的可读性和可维护性**
   6. TypeScript 是一门静态类型、弱类型的语言，它是**完全兼容 JavaScript** 的，它不会修改 JavaScript 运行时的特性
   7. TypeScript **增强了编辑器（IDE）**的功能，提供了代码补全、接口提示、跳转到定义、代码重构等能力

2. JS

- 本地浏览器支持，不需要被编译，可以直接运行，但是 TS 需要被编译为 javascript 语言
- 人气：在社区中很方便地找到大量成熟的开发项目和可用资源
- 灵活性

## 1. 什么是 TypeScript？

Typescript 是一个强类型的 JavaScript 超集，支持 ES6 语法，支持面向对象编程的概念，如类、接口、继承、泛型等。Typescript 并不直接在浏览器上运行，需要编译器编译成纯 Javascript 来运行。

## 2. 为什么要使用 TypeScript ? TypeScript 相对于 JavaScript 的优势是什么？

增加了静态类型，可以在开发人员编写脚本时检测错误，使得代码质量更好，更健壮。
优势:

1.  杜绝手误导致的变量名写错;
2.  类型可以一定程度上充当文档;
3.  IDE 自动填充，自动联想;

## 3. TypeScript 中 const 和 readonly 的区别？枚举和常量枚举的区别？接口和类型别名的区别？

const 和 readonly: const 可以防止变量的值被修改，readonly 可以防止变量的属性被修改。
枚举和常量枚举: 常量枚举只能使用常量枚举表达式，并且不同于常规的枚举，它们在编译阶段会被删除。 常量枚举成员在使用的地方会被内联进来。 之所以可以这么做是因为，常量枚举不允许包含计算成员。
接口和类型别名: 两者都可以用来描述对象或函数的类型。与接口不同，类型别名还可以用于其他类型，如基本类型（原始值）、联合类型、元组。

## 4. TypeScript 中 any 类型的作用是什么？

为编程阶段还不清楚类型的变量指定一个类型。 这些值可能来自于动态的内容，比如来自用户输入或第三方代码库。 这种情况下，我们不希望类型检查器对这些值进行检查而是直接让它们通过编译阶段的检查。

## 5. TypeScript 中 any、never、unknown、null & undefined 和 void 有什么区别？

1. any: 动态的变量类型（失去了类型检查的作用）。
2. never: 永不存在的值的类型。例如：never 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型。
3. unknown: 任何类型的值都可以赋给  unknown  类型，但是  unknown  类型的值只能赋给  unknown  本身和  any  类型。
4. null & undefined: 默认情况下 null 和 undefined 是所有类型的子类型。 就是说你可以把  null 和 undefined 赋值给 number 类型的变量。当你指定了 --strictNullChecks 标记，null 和 undefined 只能赋值给 void 和它们各自。
5. void: 没有任何类型。例如：一个函数如果没有返回值，那么返回值可以定义为 void。

## 6. TypeScript 中 interface 可以给 Function / Array / Class（Indexable）做声明吗？

```ts
/* 可以 */
// 函数声明
interface Say {
  (name: string): viod;
}
let say: Say = (name: string): viod => {};
// Array 声明
interface NumberArray {
  [index: number]: number;
}
let fibonacci: NumberArray = [1, 1, 2, 3, 5];
// Class 声明
interface PersonalIntl {
  name: string;
  sayHi(name: string): string;
}
```

## 9. TypeScript 中使用 Union Types 时有哪些注意事项？

属性或方法访问: 当 TypeScript 不确定一个联合类型的变量到底是哪个类型的时候，我们只能访问此联合类型的所有类型里共有的属性或方法。

```js
function getLength(something: string | number): number {
  return something.length;
}
// index.ts(2,22): error TS2339: Property 'length' does not exist on type >'string | number'.
//   Property 'length' does not exist on type 'number'.

function getString(something: string | number): string {
  return something.toString();
}
// 公共方法和属性可以访问
```

## 1. TypeScript 如何设计 Class 的声明？

```js
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet(): string {
    return "Hello, " + this.greeting;
  }
}
let greeter = new Greeter("world");
// 在声明类的时候，一般类中都会包含，构造函数、对构造函数中的属性进行类型声明、类中的方法。
```

## 7. TypeScript 中可以使用 String、Number、Boolean、Symbol、Object 等给类型做声明吗？

```ts
/* 可以 */
let name: string = "bob";
let decLiteral: number = 6;
let isDone: boolean = false;
let sym: symbol = Symbol();
interface Person {
  name: string;
  age: number;
}
```

## 11. TypeScript 中如何联合枚举类型的 Key?

enum str {
A,
B,
C
}
type strUnion = keyof typeof str; // 'A' | 'B' | 'C'

## 12. TypeScript 中 type 和 interface 的区别?

相同点：

1. 都可以描述 '对象' 或者 '函数'
2. 都允许拓展(extends)

不同点：

1. type 可以声明基本类型，联合类型，元组
2. type 可以使用 typeof 获取实例的类型进行赋值
3. 多个相同的 interface 声明可以自动合并
   使用 interface 描述‘数据结构’，使用 type 描述‘类型关系’

## TypeScript 中 ?.、??、!、!.、\_、\*\* 等符号的含义？

- ?. 可选链 遇到 null 和 undefined 可以立即停止表达式的运行。
  const a = obj?.xxx
- ?? 空值合并运算符 当左侧操作数为 null 或 undefined 时，其返回右侧的操作数，否则返回左侧的操作数。
  ```js
  const i = undefined;
  const k = i ?? 5;
  console.log(k); // 5
  ```
- ! 非空断言运算符 x! 将从 x 值域中排除 null 和 undefined
  ```js
   function handler (arg: string | null | undefined) {
   let str: string = arg!;   // 没毛病
   str.split('');
   // ...
  ```
  }
- !. 在变量名后添加，可以断言排除 undefined 和 null 类型
- \_ 数字分割符 分隔符不会改变数值字面量的值，使人更容易读懂数字 .e.g 1_101_324。 => 编译后（1101324）
- \*\* 求幂

## 28. 数组定义的两种方式

```js
type Foo = Array<string>;
interface Bar {
  baz: Array<{ name: string, age: number }>;
}

type Foo = string[];
interface Bar {
  baz: { name: string, age: number }[];
}
```

## declare，declare global 是什么？

[](./declare.md)
declare 是用来定义全局变量、全局函数、全局命名空间、js modules、class 等
declare global 为全局对象 window 增加新的属性

```js
declare global {
   interface Window {
        csrf: string;
   }
}
```

## 23. TypeScript 中如何设置模块导入的路径别名？

通过 tsconfig.json 中的 paths 项来配置:

```js
{
  "compilerOptions":
    {
      "baseUrl": ".",
      "paths": {
         "@helper/*": ["src/helper/*"],
         "@utils/*": ["src/utils/*"],
         ...
      }
   }
}
```

## 21. 如何使 TypeScript 项目引入并识别编译为 JavaScript 的 npm 库包？

选择安装 ts 版本，npm install @types/包名 --save；
对于没有类型的 js 库，需要编写同名的.d.ts 文件

22. TypeScript 的 tsconfig.json 中有哪些配置项信息？

```js

{
  "files": [],
  "include": [],
  "exclude": [],
  "compileOnSave": false,
  "extends": "",
  "compilerOptions": { ... }
}
```

files  是一个数组列表，里面包含指定文件的相对或绝对路径，用来指定待编译文件，编译器在编译的时候只会编译包含在 files 中列出的文件。
include & exclude 指定编译某些文件，或者指定排除某些文件。
compileOnSave：true 让 IDE 在保存文件的时候根据 tsconfig.json 重新生成文件。
extends 可以通过指定一个其他的 tsconfig.json 文件路径，来继承这个配置文件里的配置。
compilerOptions 编译配置项，如何对具体的 ts 文件进行编译

## 19. 类型的全局声明和局部声明

如果声明文件内不包含 import、export，那么这个文件声明的类型就会变成全局声明。反之，若是这个文件包含了 import、export，那么这个文件包含的类型声明则会是局部声明，不会影响到全局声明。

## 20. TypeScript 中同名的 interface 或者同名的 interface 和 class 可以合并吗？

同名的 interface 会自动合并，同名的 interface 和 class 会自动聚合。

## Typescript 中 interface 和 class 的区别？

interface: 接口只负责声明成员变量类型，不作具体实现。

class：类既声明成员变量类型并实现。

## 基于已有类型生成新类型：剔除类型中的 width 属性

```ts
interface A {
  content: string;
  width: number;
  height: number;
}
type B = Omit<A, "height">;
```

## const func = (a, b) => a + b; 要求编写 Typescript，要求 a，b 参数类型一致，都为 number 或者都为 string

```ts

```
