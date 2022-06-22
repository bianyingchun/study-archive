### 什么时候要用命名空间?

如果你发现自己写的功能(函数/类/接口等...)越来越多, 你想对他们进行分组管理就可以用命名空间, 下面先用"类"举例:

```js
namespace Tools {
const TIMEOUT = 100;

    export class Ftp {
        constructor() {
            setTimeout(() => {
                console.log('Ftp');
            }, TIMEOUT)
        }
    }

    export class Http {
        constructor() {
            console.log('Http');
        }
    }

    export function parseURL(){
        console.log('parseURL');
    }

}
```

仔细看你会发现 namespace 下还有 export, export 在这里用来表示哪些功能是可以外部访问的:

```js
Tools.TIMEOUT; // 报错, Tools 上没有这个属性
Tools.parseURL(); // 'parseURL'
```

最后我们看下编译成 js 后的代码:

```js
"use strict";
var Tools;
(function (Tools) {
  const TIMEOUT = 100;
  class Ftp {
    constructor() {
      setTimeout(() => {
        console.log("Ftp");
      }, TIMEOUT);
    }
  }
  Tools.Ftp = Ftp;
  class Http {
    constructor() {
      console.log("Http");
    }
  }
  Tools.Http = Http;
  function parseURL() {
    console.log("parseURL");
  }
  Tools.parseURL = parseURL;
})(Tools || (Tools = {}));
```

看 js 代码能发现, 在 js 中命名空间其实就是一个全局对象. 如果你开发的程序想要暴露一个全局变量就可以用 namespace;

### 如何用命名空间来管理类型?

命名空间不仅可以用在逻辑代码中, 也可以用在类型, 用来给类型分组:

```js
namespace Food {
export type A = Window;
export interface Fruits{
taste: string;
hardness: number;
}

    export interface Meat{
        taste: string;
        heat: number;
    }

}

let meat: Food.Meat;
let fruits: Food.Fruits;
```

### 如何引入写好的命名空间?

有 2 种方式, 一种/// <reference path="xxx.ts" />, 还有就是 import:

#### 通过 "/// <reference path='xxx.ts'/>" 导入

通过 reference 进行导入相当于 xxx.ts 文件内的命名空间和当前文件进行了合并:

```js
// xxx.ts
namespace Food {
export interface Fruits{
taste: string;
hardness: number;
}
}


// yyy.ts
<reference path="xxx.ts" />

let meat: Food.Meat;
let fruits: Food.Fruits;
```

现在在 yyy.ts 中我们就可以直接使用 xxx.ts 中的 Food 类型了, 而不需要使用 import.

#### 通过 import 导入

如果命名空间是用 export 导出的, 那么使用的时候就不可以用/// <reference/>了, 要用 import 导入:

```js
// xxx.ts
// 使用 export 导出
export interface Fruits {
  taste: string;
  hardness: number;
}

export interface Meat {
  taste: string;
  heat: number;
}

// yyy.ts
import { Food } from "./xxx"; // 使用 import 导入
let meat: Food.Meat;
let fruits: Food.Fruits;
```

### 如何合并多个命名空间

我们知道接口是可以合并的, 命名空间也是可以的, 下面我们把 Vegetables 类型合并到 Food 类型中:

```js
// xxx.ts
namespace Food {
    export interface Fruits{
    taste: string;
    hardness: number;
    }
}

// yyy.ts
<reference path="xxx.ts" />
namespace Food {
    export interface Vegetables{
        title: string;
        heat: number;
    }
}

type Vh = Food.Vegetables['heat'] // number;

```

### export=

如果你的 tsconfig 中设置了"module": "umd",, 那么 export = Food 等价于 export default Food, **export=常见于支持 umd 的插件的声明文件.**
