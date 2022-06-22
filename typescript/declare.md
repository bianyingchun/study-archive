## 什么是声明文件?

声明文件就是给 js 代码补充类型标注. 这样在 ts 编译环境下就不会提示 js 文件"缺少类型".
声明变量使用关键字 declare 来表示声明其后面的全局变量的类型, 比如:

```ts
// packages/global.d.ts
declare var __DEV__: boolean;
declare var __TEST__: boolean;
declare var __BROWSER__: boolean;
declare var __RUNTIME_COMPILE__: boolean;
declare var __COMMIT__: string;
declare var __VERSION__: string;
```

复制代码看过 vue3 源码的同学一定知道这些是 vue 中的变量, 上面代码表示**DEV**等变量是全局, 并且标注了他们的类型. 这样无论在项目中的哪个 ts 文件中使用**DEV**, 变量 ts 编译器都会知道他是 boolean 类型.

## 声明文件在哪里?

首先声明文件的文件名是有规范要求的, **必须以.d.ts 结尾**, 看了上面的代码你肯定想练习写下声明文件, 但是你可能想问了"写完放在哪里", 网上说声明文件放在项目里的任意路径/文件名都可以被 ts 编译器识别, 但实际开发中发现, 为了规避一些奇怪的问题, **推荐放在根目录下.**

## 别人写好的声明文件( @types/xxx )

一般比较大牌的第三方 js 插件在 npm 上都有对应的声明文件, 比如 jquery 的声明文件就可以在 npm 上下载:

```sh
npm i @types/jquery
```

复制代码 npm i @types/jquery 中的 jquery 可以换成任意 js 库的名字, 当然前提是有人写了对应的声明文件发布到了 npm

## 声明文件对纯 js 项目有什么帮助?

即便你只写 js 代码, 也可以安装声明文件, 因为如果你用的是 vscode, 那么他会自动分析 js 代码, 如果存在对应的声明文件, vscode 会把声明文件的内容作为代码提示.

## 什么情况下要自己写声明文件?

如果"@types/"下找不到声明文件, 那么就需要我们自己手写了.

### 🔥 如何写声明文件?

声明文件分 2 大类, 一类是全局声明, 一类是对模块的声明. 这节只说"全局".

### 全局声明

通过 declare 我们可以标注 js 全局变量的类型.

#### 简单应用

```ts
//global.d.ts
declare var n: number;
declare let s: string;
declare const o: object;
declare function f(s: string): number;
declare enum dir {
  top,
  right,
  bottom,
  left,
}
```

声明之后,我们就可以在任意文件中直接操作变量:

```js
n = 321;
s = "文字";
let o1 = o;
f("123").toFixed();
dir.bottom.toFixed();

// 报错
n = "312";
s = 123;
```

#### declare namespace

这个 namespace 代表后面的全局变量是一个对象:

```ts
// global.d.ts
declare namespace MyPlugin {
  var n: number;
  var s: string;
  var f: (s: string) => number;
}

MyPlugin.s.substr(0, 1);
MyPlugin.n.toFixed();
MyPlugin.f("文字").toFixed();

// 报错
MyPlugin.s.toFixed();
MyPlugin.n.substr(0, 1);
MyPlugin.f(123);
```

### 修改已存在的全局声明

其实我们安装完 typescript, 会自动给我们安装一些系统变量的声明文件, 存在 node_modules/typescript/lib 下.

如果你要修改已存在的全局变量的声明可以这么写, 下面用 node 下的 global 举例,

```js
declare global {
    interface String {
        hump(input: string): string;
    }
}
// 注意: 修改"全局声明"必须在模块内部, 所以至少要有 export{}字样
// 不然会报错❌: 全局范围的扩大仅可直接嵌套在外部模块中或环境模块声明中
export {}

```

现在 String 类型在 vscode 的语法提示下多了一个 hump 的方法,不过我们只是声明, 并没有用 js 实现, 所以运行会报错, 所以不要忘了写 js 的实现部分哦.

### 模块声明

#### 使用场景

npm 下载的"包"自带了声明文件, 如果我们需要对其类型声明进行扩展就可以使用"declare module"语法.
让 vue3 支持 this.$axios

```js
// main.ts
app.config.globalProperties.$axios = axios;
```

功能上我们实现了"this.axios",但是 ts 并不能自动推断出我们添加了 axios", 但是 ts 并不能自动推断出我们添加了 axios",但是 ts 并不能自动推断出我们添加了 axios 字段, 所以添加如下声明文件:

```ts
// global.d.ts

// axios的实例类型
import { AxiosInstance } from "axios";

// 声明要扩充@vue/runtime-core包的声明.
// 这里扩充"ComponentCustomProperties"接口, 因为他是vue3中实例的属性的类型.
declare module "@vue/runtime-core" {
  // 给`this.$http`提供类型
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}
```

这里扩充"ComponentCustomProperties"接口, 因为他是 vue3 中实例的属性的类型.

#### 更全面的例子

上面的例子中我们扩充了原声明中的 interface, 但是如果导出是一个 Class 我们该如何写呢? 下面我们对"any-touch"的类型进行扩充, 这里"any-touch"的默认导出是一个 Class. 假设我们对"any-touch"的代码做了如下修改:

- 导出增加"aaa"变量, 是 string 类型.
- 类的实例增加"bbb"属性, 是 number 类型.
- 类增加静态属性"ccc", 是个函数.

```ts
// global.d.ts

// AnyTouch一定要导入, 因为只有导入才是扩充, 不导入就会变成覆盖.
import AnyTouch from "any-touch";

declare module "any-touch" {
  // 导出增加"aaa"变量, 是个字符串.
  export const aaa: string;

  export default class {
    // 类增加静态属性"ccc", 是个函数.
    static ccc: () => void;
    // 类的实例增加"bbb"属性, 是number类型.
    bbb: number;
  }
}
```

注意: **AnyTouch 一定要导入, 因为只有导入才是类型扩充, 不导入就会变成覆盖.**

测试下, 类型都已经正确的添加:

```ts
// index.ts
import AT, { aaa } from "any-touch";

const s = aaa.substr(0, 1);

const at = new AT();
at.bbb = 123;

AT.ccc = () => {};
```

#### 对非 ts/js 文件模块进行类型扩充

ts 只支持模块的导入导出, 但是有些时候你可能需要引入 css/html 等文件, 这时候就需要用通配符让 ts 把他们当做模块, 下面是对".vue"文件的导入支持(来自 vue 官方):

```ts
// global.d.ts
declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// App.vue
// 可以识别 vue 文件
import X1 from "./X1.vue";
export default defineComponent({
  components: { X1 },
});
```

声明把 vue 文件当做模块, 同时标注模块的默认导出是"component"类型. 这样在 vue 的 components 字段中注册模块才可以正确识别类型.

#### vuex

```ts
// vuex.d.ts

import { Store } from "vuex";

// 声明要扩充@vue/runtime-core包的声明
declare module "@vue/runtime-core" {
  // declare your own store states
  interface State {
    count: number;
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
```
