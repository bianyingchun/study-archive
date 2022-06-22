> 在一个函数上下文中，this 由调用者提供，由调用函数的方式来决定。**如果调用者函数，被某一个对象所拥有，那么该函数在调用时，内部的 this 指向该对象。如果函数独立调用，那么该函数内部的 this，则指向 undefined。但是在非严格模式中，当 this 指向 undefined 时，它会被自动指向全局对象**。

作者：这波能反杀
链接：https://www.jianshu.com/p/d647aa6d1ae6
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

### this 关键字

什么是 this？this 是 JavaScript 的一个关键字般指向调用它的对象。

这句话其实有两层意思，首先 this 指向的应该是一个对象，更具体地说是函数执行的“上下文对象”。其次这个对象指向的是“调用它”的对象，如果调用它的不是对象或对象不存在，则会指向全局对象（严格模式下为 undefined）。

下面举几个例子来进行说明。

1. 当代码 1 执行 fn() 函数时，实际上就是通过对象 o 来调用的，所以 this 指向对象 o。

2. 代码 2 也是同样的道理，通过实例 a 来调用，this 指向类实例 a。

3. 代码 3 则可以看成是通过全局对象来调用，this 会指向全局对象（需要注意的是，严格模式下会是 undefined）。

```js
// 代码 1
var o = {
  fn() {
    console.log(this);
  },
};
o.fn(); // o
// 代码 2
class A {
  fn() {
    console.log(this);
  }
}
var a = new A();
a.fn(); // a
// 代码 3
function fn() {
  console.log(this);
}
fn(); // 浏览器：Window；Node.js：global
```

是不是觉得 this 的用法很简单？别着急，我们再来看看其他例子以加深理解。

（1）如果在函数 fn2() 中调用函数 fn()，那么当调用函数 fn2() 的时候，函数 fn() 的 this 指向哪里呢？

```js
function fn() {
  console.log(this);
}
function fn2() {
  fn();
}
fn2(); // ?
```

由于没有找到调用 fn 的对象，所以 this 会指向全局对象，答案就是 window（Node.js 下是 global）。

（2）再把这段代码稍稍改变一下，让函数 fn2() 作为对象 obj 的属性，通过 obj 属性来调用 fn2，此时函数 fn() 的 this 指向哪里呢？

```js
function fn() {
  console.log(this);
}
function fn2() {
  console.log(this);
  fn();
}
var obj = { fn2 };
obj.fn2(); // ?
```

这里需要注意，调用函数 fn() 的是函数 fn2() 而不是 obj。虽然 fn2() 作为 obj 的属性调用，但 fn2()中的 this 指向并不会传递给函数 fn()， 所以答案也是 window（Node.js 下是 global）。
（3）对象 dx 拥有数组属性 arr，在属性 arr 的 forEach 回调函数中输出 this，指向的是什么呢？

```js
var dx = {
  arr: [1],
};
dx.arr.forEach(function () {
  console.log(this);
}); // ?
```

按照之前的说法，很多同学可能会觉得输出的应该是对象 dx 的属性 arr 数组。但其实仍然是全局对象。

如果你看过 **forEach 的说明文档便会知道，它有两个参数，第一个是回调函数，第二个是 this 指向的对象**，这里只传入了回调函数，第二个参数没有传入，默认为 undefined，所以正确答案应该是输出全局对象。

类似的，需要传入 this 指向的函数还有：every()、find()、findIndex()、map()、some()，在使用的时候需要特别注意。

（4）前面提到通过类实例来调用函数时，this 会指向实例。那么如果像下面的代码，创建一个 fun 变量来引用实例 b 的 fn() 函数，当调用 fun() 的时候 this 会指向什么呢？

```js
class B {
  fn() {
    console.log(this);
  }
}
var b = new B();
var fun = b.fn;
fun(); // ?
```

这道题你可能会很容易回答出来：fun 是在全局下调用的，所以 this 应该指向的是全局对象。这个思路没有没问题，但是这里有个隐藏的知识点。那就是**ES6 下的 class 内部默认采用的是严格模式**，实际上面代码的类定义部分可以理解为下面的形式。

```js
class B {
  "use strict";
  fn() {
    console.log(this);
  }
}
```

而严格模式下不会指定全局对象为默认调用对象，所以答案是 undefined。

（5）ES6 新加入的箭头函数不会创建自己的 this，它只会从自己的作用域链的上一层继承 this。可以简单地理解为箭头函数的 this 继承自上层的 this，但在全局环境下定义仍会指向全局对象。

```js
var arrow = {
  fn: () => {
    console.log(this);
  },
};
arrow.fn(); // ?
```

所以虽然通过对象 arrow 来调用箭头函数 fn()，那么 this 指向不是 arrow 对象，而是全局对象。如果要让 fn() 箭头函数指向 arrow 对象，我们还需要再加一层函数，让箭头函数的上层 this 指向 arrow 对象。

```js
var arrow = {
  fn() {
    const a = () => console.log(this);
    a();
  },
};
arrow.fn(); // arrow
```

（6）前面提到 this 指向的要么是调用它的对象，要么是 undefined，那么如果将 this 指向一个基础类型的数据会发生什么呢？

比如下面的代码将 this 指向数字 0，打印出的 this 是什么呢？

```js
[0].forEach(function () {
  console.log(this);
}, 0); // ?
```

结合上一讲关于数据类型的知识，我们知道基础类型也可以转换成对应的引用对象。所以这里 this 指向的是一个值为 0 的 Number 类型对象。

（7）改变 this 指向的常见 3 种方式有 bind、call 和 apply。call 和 apply 用法功能基本类似，都是通过传入 this 指向的对象以及参数来调用函数。区别在于传参方式，前者为逐个参数传递，后者将参数放入一个数组，以数组的形式传递。bind 有些特殊，它不但可以绑定 this 指向也可以绑定函数参数并返回一个新的函数，当 c 调用新的函数时，绑定之后的 this 或参数将无法再被改变。

```js
function getName() {
  console.log(this.name);
}
var b = getName.bind({ name: "bind" });
b();
getName.call({ name: "call" });
getName.apply({ name: "apply" });
```

由于 this 指向的不确定性，所以很容易在调用时发生意想不到的情况。在编写代码时，应尽量避免使用 this，比如可以写成纯函数的形式，也可以通过参数来传递上下文对象。实在要使用 this 的话，可以考虑使用 bind 等方式将其绑定。

### 补充 1：箭头函数

箭头函数和普通函数相比，有以下几个区别，在开发中应特别注意：

1. 不绑定 arguments 对象，也就是说在箭头函数内访问 arguments 对象会报错；

2. 不能用作构造器，也就是说不能通过关键字 new 来创建实例；

3. 默认不会创建 prototype 原型属性；

4. 不能用作 Generator() 函数，不能使用 yeild 关键字。
