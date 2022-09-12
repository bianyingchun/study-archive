### 异步编程

1. 回调函数

- 优点：简单、容易理解
- 缺点：不利于维护，回调深

2. 事件监听（采用时间驱动模式，取决于某个事件是否发生）：
   优点：容易理解，可以绑定多个事件，每个事件可以指定多个回调函数
   缺点：事件驱动型，流程不够清晰
3. 发布/订阅（观察者模式）
   类似于事件监听，但是可以通过‘消息中心’，了解现在有多少发布者，多少订阅者
4. Promise 对象
   优点：可以利用 then 方法，进行链式写法；可以书写错误时的回调函数；
   缺点：无法取消，pending 状态时，无法得知目 前进行到哪一步了
5. Generator 函数
   优点：函数体内外的数据交换、错误处理机制
   缺点：流程管理不方便
6. async 函数
   优点：内置执行器、更好的语义、更广的适用性、返回的是 Promise、结构清晰。
   缺点：控制流程复杂

### Promise 基本特性

[参考](https://github.com/lgwebdream/FE-Interview/issues/29)

1. Promise 有三种状态：pending(进行中)、fulfilled(已成功)、rejected(已失败)

2. Promise 对象接受一个回调函数作为参数, 该回调函数接受两个参数，分别是成功时的回调 resolve 和失败时的回调 reject；另外 resolve 的参数除了正常值以外， 还可能是一个 Promise 对象的实例；reject 的参数通常是一个 Error 对象的实例。

3. then 方法返回一个新的 Promise 实例，并接收两个参数 onResolved(fulfilled 状态的回调)；onRejected(rejected 状态的回调，该参数可选)

4. catch 方法返回一个新的 Promise 实例

5. finally 方法不管 Promise 状态如何都会执行，该方法的回调函数不接受任何参数

6. Promise.all()方法将多个 Promise 实例，包装成一个新的 Promise 实例，该方法接受一个由 Promise 对象组成的数组作为参数(Promise.all()方法的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 Promise 实例)，注意参数中只要有一个实例触发 catch 方法，都会触发 Promise.all()方法返回的新的实例的 catch 方法，如果参数中的某个实例本身调用了 catch 方法，将不会触发 Promise.all()方法返回的新实例的 catch 方法

7. Promise.race()方法的参数与 Promise.all 方法一样，参数中的实例只要有一个率先改变状态就会将该实例的状态传给 Promise.race()方法，并将返回值作为 Promise.race()方法产生的 Promise 实例的返回值,all 和 race 传入的数组中如果有会抛出异常的异步任务，那么只有最先抛出的错误会被捕获，并且是被 then 的第二个参数或者后面的 catch 捕获；但并不会影响数组中其它的异步任务的执行。

8. Promise.resolve()将现有对象转为 Promise 对象，
   1. 如果该方法的参数为一个 Promise 对象，Promise.resolve()将不做任何处理；
   2. 如果参数 thenable 对象(即具有 then 方法)，Promise.resolve()将该对象转为 Promise 对象并立即执行 then 方法；
   3. 如果参数是一个原始值，或者是一个不具有 then 方法的对象，则 Promise.resolve 方法返回一个新的 Promise 对象，状态为 fulfilled，其参数将会作为 then 方法中 onResolved 回调函数的参数，
   4. 如果 Promise.resolve 方法不带参数，会直接返回一个 fulfilled 状态的 Promise 对象。
      需要注意的是，立即 resolve()的 Promise 对象，是在本轮“事件循环”（event loop）的结束时执行，而不是在下一轮“事件循环”的开始时。
9. Promise.reject()同样返回一个新的 Promise 对象，状态为 rejected，无论传入任何参数都将作为 reject()的参数

### Promise 优点

1. **统一异步 API**
   Promise 的一个重要优点是它将逐渐被用作浏览器的异步 API ，统一现在各种各样的 API ，以及不兼容的模式和手法。

2. Promise 与事件对比
   和事件相比较， Promise 更适合处理一次性的结果。在结果计算出来之前或之后注册回调函数都是可以的，都可以拿到正确的值。 Promise 的这个优点很自然。但是，不能使用 Promise 处理多次触发的事件。**链式处理**是 Promise 的又一优点，但是事件却不能这样链式处理。

3. promise 与回调对比
   解决了**回调地狱**的问题，将异步操作以同步操作的流程表达出来。
4. Promise 带来的额外好处是包含了**更好的错误处理**方式（包含了异常处理），并且写起来很轻松（因为可以重用一些同步的工具，比如 Array.prototype.map() ）。

### Promise 缺点

1. **无法取消**Promise，一旦新建它就会立即执行，无法中途取消。
2. 如果**不设置回调函数，Promise 内部抛出的错误，不会反应到外部**。
3. 当处于 Pending 状态时，**无法得知目前进展**到哪一个阶段（刚刚开始还是即将完成）。
4. Promise 真正执行回调的时候，定义 Promise 那部分实际上已经走完了，所以 Promise 的报错堆栈上下文不太友好。

---

[](https://juejin.cn/post/6903725134977171463)

### 实现 promise A+ 规范

##### 1.1 术语

1. promise 是一个包含 then 方法的对象或函数，该方法符合规范指定的行为。
2. thenable 是一个包含 then 方法的对象或者函数。
3. value 就是任意合法 JS 值。
4. exception 就是 throw 语句抛出的值。
5. reason 是一个指示 promise 为什么被 rejected 的值。

###### 1.2 状态

promise 有 3 个状态，分别是 pending, fulfilled 和 rejected。

1. 在 pending 状态，promise 可以切换到 fulfilled 或 rejected。
2. 在 fulfilled 状态，不能迁移到其它状态，必须有个不可变的 value。
3. 在 rejected 状态，不能迁移到其它状态，必须有个不可变的 reason。

###### 1.3 then 方法

promise 必须有 then 方法，接受 onFulfilled 和 onRejected 参数。then 方法必须返回 promise。

1. onFulfilled 和 onRejected 如果是函数，必须最多执行一次。

2. onFulfilled 的参数是 value，onRejected 函数的参数是 reason。

then 方法可以被调用很多次，每次注册一组 onFulfilled 和 onRejected 的 callback。它们如果被调用，必须按照注册顺序调用。

---

[](https://juejin.cn/post/6844904077537574919#heading-16)

1. Promise 的状态一经改变就不能再改变。(见 3.1)
2. .then 和.catch 都会返回一个新的 Promise。(上面的 👆1.4 证明了)
3. catch 不管被连接到哪里，都能捕获上层未捕捉过的错误。(见 3.2)
   在 Promise 中，返回任意一个非 promise 的值都会被包裹成 promise 对象，例如 return 2 会被包装为 return Promise.resolve(2)。
4. Promise 的 .then 或者 .catch 可以被调用多次, 但如果 Promise 内部的状态一经改变，并且有了一个值，那么后续每次调用.then 或者.catch 的时候都会直接拿到该值。(见 3.5)
5. then 或者 .catch 中 return 一个 error 对象并不会抛出错误，所以不会被后续的 .catch 捕获。(见 3.6)
6. then 或 .catch 返回的值不能是 promise 本身，否则会造成死循环。(见 3.7)
7. then 或者 .catch 的参数期望是函数，传入非函数则会发生值透传。(见 3.8)

```javascript
Promise.resolve(1).then(2).then(Promise.resolve(3)).then(console.log);
// 1
```

8. .then 方法是能接收两个参数的，第一个是处理成功的函数，第二个是处理失败的函数，再某些时候你可以认为 catch 是.then 第二个参数的简便写法。(见 3.9)
9. .finally 方法也是返回一个 Promise，他在 Promise 结束的时候，无论结果为 resolved 还是 rejected，都会执行里面的回调函数。

### 手写 promise

[](https://juejin.cn/post/6844904096525189128#heading-12)

```javascript
//Promise/A+规定的三种状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  // 构造方法接收一个回调
  constructor(executor) {
    this._status = PENDING; // Promise状态
    this._value = undefined; // 储存then回调return的值
    this._resolveQueue = []; // 成功队列, resolve时触发
    this._rejectQueue = []; // 失败队列, reject时触发

    // 由于resolve/reject是在executor内部被调用, 因此需要使用箭头函数固定this指向, 否则找不到this._resolveQueue
    let _resolve = (val) => {
      //把resolve执行回调的操作封装成一个函数,放进setTimeout里,以兼容executor是同步代码的情况
      const run = () => {
        if (this._status !== PENDING) return; // 对应规范中的"状态只能由pending到fulfilled或rejected"
        this._status = FULFILLED; // 变更状态
        this._value = val; // 储存当前value

        // 这里之所以使用一个队列来储存回调,是为了实现规范要求的 "then 方法可以被同一个 promise 调用多次"
        // 如果使用一个变量而非队列来储存回调,那么即使多次p1.then()也只会执行一次回调
        while (this._resolveQueue.length) {
          const callback = this._resolveQueue.shift();
          callback(val);
        }
      };
      setTimeout(run);
    };
    // 实现同resolve
    let _reject = (val) => {
      const run = () => {
        if (this._status !== PENDING) return; // 对应规范中的"状态只能由pending到fulfilled或rejected"
        this._status = REJECTED; // 变更状态
        this._value = val; // 储存当前value
        while (this._rejectQueue.length) {
          const callback = this._rejectQueue.shift();
          callback(val);
        }
      };
      setTimeout(run);
    };
    // new Promise()时立即执行executor,并传入resolve和reject
    executor(_resolve, _reject);
  }

  // then方法，接收一个成功的回调和一个失败的回调
  then(resolveFn, rejectFn) {
    // 根据规范，如果then的参数不是function，则我们需要忽略它, 让链式调用继续往下执行
    typeof resolveFn !== "function" ? (resolveFn = (value) => value) : null;
    typeof rejectFn !== "function"
      ? (rejectFn = (reason) => {
          throw new Error(reason instanceof Error ? reason.message : reason);
        })
      : null;

    // return一个新的promise
    return new MyPromise((resolve, reject) => {
      // 把resolveFn重新包装一下,再push进resolve执行队列,这是为了能够获取回调的返回值进行分类讨论
      const fulfilledFn = (value) => {
        try {
          // 执行第一个(当前的)Promise的成功回调,并获取返回值
          let x = resolveFn(value);
          // 分类讨论返回值,如果是Promise,那么等待Promise状态变更,否则直接resolve
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x);
        } catch (error) {
          reject(error);
        }
      };

      // reject同理
      const rejectedFn = (error) => {
        try {
          let x = rejectFn(error);
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x);
        } catch (error) {
          reject(error);
        }
      };

      switch (this._status) {
        // 当状态为pending时,把then回调push进resolve/reject执行队列,等待执行
        case PENDING:
          this._resolveQueue.push(fulfilledFn);
          this._rejectQueue.push(rejectedFn);
          break;
        // 当状态已经变为resolve/reject时,直接执行then回调
        case FULFILLED:
          fulfilledFn(this._value); // this._value是上一个then回调return的值(见完整版代码)
          break;
        case REJECTED:
          rejectedFn(this._value);
          break;
      }
    });
  }

  //catch方法其实就是执行一下then的第二个回调
  catch(rejectFn) {
    return this.then(undefined, rejectFn);
  }

  //finally方法
  finally(callback) {
    return this.then(
      (value) => MyPromise.resolve(callback()).then(() => value), //执行回调,并return value传递给后面的then
      (reason) =>
        MyPromise.resolve(callback()).then(() => {
          throw reason;
        }) //reject同理
    );
  }

  //静态的resolve方法
  static resolve(value) {
    if (value instanceof MyPromise) return value; //根据规范, 如果参数是Promise实例, 直接return这个实例
    return new MyPromise((resolve) => resolve(value));
  }

  //静态的reject方法
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  //静态的all方法
  static all(promiseArr) {
    let index = 0;
    let result = [];
    return new MyPromise((resolve, reject) => {
      promiseArr.forEach((p, i) => {
        //Promise.resolve(p)用于处理传入值不为Promise的情况
        MyPromise.resolve(p).then(
          (val) => {
            index++;
            result[i] = val;
            if (index === promiseArr.length) {
              resolve(result);
            }
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }

  //静态的race方法
  static race(promiseArr) {
    return new MyPromise((resolve, reject) => {
      //同时执行Promise,如果有一个Promise的状态发生改变,就变更新MyPromise的状态
      for (let p of promiseArr) {
        MyPromise.resolve(p).then(
          //Promise.resolve(p)用于处理传入值不为Promise的情况
          (value) => {
            resolve(value); //注意这个resolve是上边new MyPromise的
          },
          (err) => {
            reject(err);
          }
        );
      }
    });
  }
}
```

### Generator，async/await 和 promise 的区别

1. promise 是 ES6，async/await 是 ES7
2. async/await 相对于 promise 来讲，写法更加优雅,更符合同步语义，容易理解，使得异步代码更像是同步代码
3. reject 状态：
   1. promise 错误可以通过 catch 来捕捉，建议尾部捕获错误，
   2. async/await 既可以用.then 又可以用 try-catch 捕捉
4. async/await 是生成器函数的语法糖，拥有内置执行器，不需要额外的调用，直接会自动调用并返回一个 promise 对象

### generator

Generator 函数是 ES6 提供的一种异步编程解决方案，语法行为与传统函数完全不同。

Generator 函数是一个普通函数，但是有两个特征。一是关键字星号（function \*）；二是，函数体内部使用 yield 表达式，定义不同的内部状态。执行 Generator 函数会返回一个遍历器对象。

调用 generator 对象有两个方法：

1. 不断地调用 generator 对象的 next()方法，next()方法会执行 generator 的代码，然后，每次遇到 yield x;就返回一个对象{value: x, done: true/false}，然后“暂停”。返回的 value 就是 yield 的返回值，done 表示这个 generator 是否已经执行结束了。如果 done 为 true，则 value 就是 return 的返回值，也表示这个 generator 对象就已经全部执行完毕，不要再继续调用 next()了。
2. 直接用 for … of 循环迭代 generator 对象，这种方式不需要我们自己判断 done

### 谈谈对 async/await 的理解

1. async/await 是写异步代码的新方式，它是 generator 的语法糖，以前的方法有回调函数和 Promise。
2. async/await 是基于 Promise 实现的，它不能用于普通的回调函数。
3. async/await 与 Promise 一样，是非阻塞的。async/await **使得异步代码看起来像同步代码**

4. async 用来表示函数是异步的，定义的函数**会返回一个 promise 对象**，可以使用 then 方法添加回调函数。
5. await 必须出现在 async 函数内部，不能单独使用
6. await 后面可以跟任何的 JS 表达式。
7. 虽然说 await 可以等很多类型的东西，但是它最主要的意图是用来等待 Promise 对象的状态被 resolved。
8. **如果 await 的是 promise 对象会造成异步函数停止执行并且等待 promise 的解决,如果等的是正常的表达式则立即执行**。

### es6 实现 async/await

ES6 实现 async/await
// gen 为 generator
实现 Async 的主要思路

1. Async 返回的是一个 promise 对象
2. 使用一个 step 对 generator 进行遍历
3. 使用一个 Promise.resolve（）来拿到每个 yield 的返回值，并且在下一次调用时传入，循环以往直到结束
4. 有错误使用 throw 方法抛出，在 generator 内部捕获错误，然后成为 reject 状态，返回错误结果

```javascript
function myAsync(genF) {
  return new Promise(function (resolve, reject) {
    // async返回的是一个promise对象
    const gen = genF(); // 拿到这个遍历器
    function step(nextF) {
      let next;
      try {
        next = nextF(); // 执行传入的回调函数获取{value:xx,done:xx}
      } catch (e) {
        // 出错就直接抛出，抛出的错误就是当前出错的promise对象
        return reject(e);
      }
      if (next.done) {
        //完成就直接resolve
        return resolve(next.value);
      }
      // 直接resolve当前的指针指向的对象然后继续执行下一个
      Promise.resolve(next.value)
        .then((res) => {
          step(() => gen.next(res)); // 返回上一个promise对象的返回值
        })
        .catch((e) => {
          step(() => gen.throw(e)); // 错误就抛出
        });
    }
    // 初始化调用这个遍历器
    step(() => gen.next());
  });
}

// 测试代码
myAsync(function* () {
  const a = yield Promise.resolve(1);
  const b = yield new Promise((res, rej) => {
    setTimeout(() => {
      res(2);
    }, 2000);
  });
  const c = yield Promise.resolve(3);
  console.log(a, b, c);

  try {
    const d = yield Promise.reject(4);
  } catch (error) {
    console.log(error);
  }

  return [a, b, c];
}).then(console.log);
// 输出
// 1 2 3
// 4
// [1,2,3]
```

```js
function generator2promise(generatorFn) {
  return function () {
    var gen = generatorFn.apply(this, arguments);

    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);

          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function (value) {
              step("next", value);
            },
            function (err) {
              step("throw", err);
            }
          );
        }
      }

      return step("next");
    });
  };
}
```

### 使用 Promise 实现每隔 1 秒输出 1,2,3

这道题比较简单的一种做法是可以用 Promise 配合着 reduce 不停的在 promise 后面叠加.then，请看下面的代码：

```js
const arr = [1, 2, 3];
arr.reduce((p, x) => {
  return p.then(() => {
    return new Promise((r) => {
      setTimeout(() => r(console.log(x)), 1000);
    });
  });
}, Promise.resolve());
```

### promise 并发量控制

题目描述：
实现一个批量请求函数 multiRequest(urls, maxNum)，要求如下：

- 要求最大并发数 maxNum
- 每当有一个请求返回，就留下一个空位，可以增加新的请求
- 所有请求完成后，结果按照 urls 里面的顺序依次打出

```javascript
/*整体采用递归调用来实现：最初发送的请求数量上限为允许的最大值，
并且这些请求中的每一个都应该在完成时继续递归发送，
通过传入的索引来确定了urls里面具体是那个URL，保证最后输出的顺序不会乱，而是依次输出。
代码实现
*/
function multiRequest(urls = [], maxNum) {
  // 请求总数量
  const len = urls.length;
  // 根据请求数量创建一个数组来保存请求的结果
  const result = new Array(len).fill(false);
  // 当前完成的数量
  let count = 0;

  return new Promise((resolve, reject) => {
    // 请求maxNum个
    while (count < maxNum) {
      next();
    }
    function next() {
      let current = count++;
      // 处理边界条件
      if (current >= len) {
        // 请求全部完成就将promise置为成功状态, 然后将result作为promise值返回
        !result.includes(false) && resolve(result);
        return;
      }
      const url = urls[current];
      console.log(`开始 ${current}`, new Date().toLocaleString());
      fetch(url)
        .then((res) => {
          // 保存请求结果
          result[current] = res;
          console.log(`完成 ${current}`, new Date().toLocaleString());
          // 请求没有全部完成, 就递归
          next();
        })
        .catch((err) => {
          console.log(`结束 ${current}`, new Date().toLocaleString());
          result[current] = err;
          // 请求没有全部完成, 就递归
          next();
        });
    }
  });
}
```

### Promise 并发量控制

JS 实现一个带并发限制的异步调度器 Scheduler,
保证同时运行的任务最多有两个。
完善代码中 Scheduler 类,使得以下程序能正确输出：
Scheduler 内部可以写其他的方法

```javascript
// 异步调度器
class Scheduler {
  constructor() {
    this.waitTasks = []; // 待执行的任务队列
    this.excutingTasks = []; // 正在执行的任务队列
    this.maxExcutingNum = 2; // 允许同时运行的任务数量
  }

  add(promiseMaker) {
    if (this.excutingTasks.length < this.maxExcutingNum) {
      this.run(promiseMaker);
    } else {
      this.waitTasks.push(promiseMaker);
    }
  }

  run(promiseMaker) {
    const len = this.excutingTasks.push(promiseMaker);
    const index = len - 1;
    return new 
    promiseMaker().then(() => {
      this.excutingTasks.splice(index, 1);
      if (this.waitTasks.length > 0) {
        this.run(this.waitTasks.shift());
      }
    });
  }
}

const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });
const addTask = (time, order) => {
  scheduler.add(() => timeout(time)).then(() => console.log(order));
};

const scheduler = new Scheduler();

addTask(1000, "1");
addTask(500, "2");
addTask(300, "3");
addTask(400, "4");

// output: 2 3 1 4

// 一开始,1、2两个任务进入队列
// 500ms时,2完成,输出2,任务3进队
// 800ms时,3完成,输出3,任务4进队
// 1000ms时,1完成,输出1
// 1200ms时,4完成,输出4
```

### 写一个函数，可以控制最大并发数

微信小程序最一开始对并发数限制为 5 个，后来升级到 10 个，如果超过 10 个会被舍弃。后来微信小程序升级为不限制并发请求，但超过 10 个会排队机制。也就是当同时调用的请求超过 10 个时，小程序会先发起 10 个并发请求，超过 10 个的部分按调用顺序进行排队，当前一个请求完成时，再发送队列中的下一个请求。

```js
function concurrentPoll() {
  this.tasks = [];
  this.max = 10;
  setTimeout(() => {
    this.run();
  }, 0);
}

concurrentPoll.prototype.addTask = function (task) {
  this.tasks.push(task);
};

concurrentPoll.prototype.run = function () {
  if (this.tasks.length == 0) {
    return;
  }
  var min = Math.min(this.tasks.length, max);
  for (var i = 0; i < min; i++) {
    this.max--;
    var task = this.tasks.shift();
    task()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        this.max++;
        this.run();
      });
  }
};
```

### 异步请求缓存，怎么保证当前 ajax 请求相同资源时，真实网络层中，实际只发出一次请求

### 补充：Promise 的局限性

虽然 Promise 相对于回调具有明显的优势，但其仍然有一些局限性，至少有下面 2 个方面的问题。

#### 立即执行

当一个 Promise 实例被创建时，内部的代码就会立即被执行，而且无法从外部停止。比如无法取消超时或消耗性能的异步调用，容易导致资源的浪费。

#### 单次执行

Promise 处理的问题都是“一次性”的，因为一个 Promise 实例只能 resolve 或 reject 一次，所以面对某些需要持续响应的场景时就会变得力不从心。比如上传文件获取进度时，默认采用的就是通过事件监听的方式来实现。

所以说 Promise 并不是万能的，全面了解其优缺点能帮助我们更好地使用 Promise。上述这些问题其实都有解决方案，比如使用 RxJS

## 实现一个异步求和函数

提供一个异步 add 方法如下，需要实现一个 await sum(...args)函数;

```js
function asyncAdd(a, b, callback) {
  setTimeout(function () {
    callback(null, a + b);
  }, 1000);
}
//实现
async function sum(...args) {
  if (args.length > 1) {
    const result = await new Promise((resolve) => {
      asyncAdd(args[0], args[1], (err, result) => {
        if (!err) {
          resolve(result);
        }
      });
    });
    return sum(result, ...args.splice(2));
  }
  return args[0];
}
// 认真看的同学应该就能发现，当前版本存在一个优化点，计算时长可以缩短。优化版本如下：
function createAdd(a, b = 0) {
  return new Promise((resolve) => {
    asyncAdd(a, b, (err, result) => {
      if (!err) {
        resolve(result);
      }
    });
  });
}

async function sum(...args) {
  if (args.length > 1) {
    const result = [];
    for (let i = 0; i < args.length; i = i + 2) {
      result.push(createAdd(args[i], args[i + 1]));
    }
    return sum(...(await Promise.all(result)));
  }
  return args[0];
}
```

## 将一个同步 callback 包装成 promise 形式

同步的 callback 用的最多的是在 node 的回调中，例如下面这种，包装完之后就可以愉快的使用 .then 了。

```js
nodeGet(param, function (err, data) {});
// 转化成promise形式
function nodeGetAysnc(param) {
  return new Promise((resolve, reject) => {
    nodeGet(param, function (err, data) {
      if (err !== null) return reject(err);
      resolve(data);
    });
  });
}
// 按照上面的思路，即可写出通用版的形式。
function promisify(fn, context) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(context, [
        ...args,
        (err, res) => {
          return err ? reject(err) : resolve(res);
        },
      ]);
    });
  };
}
```

### 实现 Person 方法

```javascript
Person("Li");
// 输出： Hi! This is Li!

Person("Dan").sleep(10).eat("dinner");
// 输出：
// Hi! This is Dan!
// 等待10秒..
// Wake up after 10
// Eat dinner~

Person("Jerry").eat("dinner").eat("supper");
// 输出：
// Hi This is Jerry!
// Eat dinner~
// Eat supper~

Person("Smith").sleepFirst(5).eat("supper");
// 输出：
// 等待5秒
// Wake up after 5
// Hi This is Smith!
// Eat supper
```

答案

```javascript
class PersonGenerator {
  taskQueue = [];
  constructor(name) {
    this.taskQueue.push(() => this.sayHi(name));
    this.runTaskQueue();
  }
  nextTask = () => {
    if (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (typeof task === "function") {
        task();
        this.nextTask();
      }
      if (typeof task === "number") {
        console.log(`Sleep ${task} seconds\n`);
        setTimeout(() => this.nextTask(), task * 1000);
      }
    }
  };

  runTaskQueue = () => {
    setTimeout(() => this.nextTask());
  };

  sayHi(name) {
    console.log(`Hi! This is ${name}! \n`);
    return this;
  }

  sleep(seconds) {
    this.taskQueue.push(seconds);
    return this;
  }

  sleepFirst(seconds) {
    this.taskQueue.splice(-1, 0, seconds);
    return this;
  }

  eat(food) {
    this.taskQueue.push(() => console.log(`Eat ${food}~ \n`));
    return this;
  }
}

const Person = (name) => new PersonGenerator(name);

Person("helloWorld").sleepFirst(3).sleep(3).eat("little_cute");
```

```javascript
function _LazyMan(name) {
  this.nama = name;
  this.queue = [];
  this.queue.push(() => {
    console.log("Hi! This is " + name + "!");
    this.next();
  });
  setTimeout(() => {
    this.next();
  }, 0);
}

_LazyMan.prototype.eat = function (name) {
  this.queue.push(() => {
    console.log("Eat " + name + "~");
    this.next();
  });
  return this;
};

_LazyMan.prototype.next = function () {
  var fn = this.queue.shift();
  fn && fn();
};

_LazyMan.prototype.sleep = function (time) {
  this.queue.push(() => {
    setTimeout(() => {
      console.log("Wake up after " + time + "s!");
      this.next();
    }, time * 1000);
  });
  return this;
};

_LazyMan.prototype.sleepFirst = function (time) {
  this.queue.unshift(() => {
    setTimeout(() => {
      console.log("Wake up after " + time + "s!");
      this.next();
    }, time * 1000);
  });
  return this;
};

function LazyMan(name) {
  return new _LazyMan(name);
}
```

### 按要求完成代码 Promise 顺序执行

```javascript
const timeout = (ms) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
const ajax1 = () =>
  timeout(2000).then(() => {
    console.log("1");
    return 1;
  });
const ajax2 = () =>
  timeout(1000).then(() => {
    console.log("2");
    return 2;
  });
const ajax3 = () =>
  timeout(2000).then(() => {
    console.log("3");
    return 3;
  });
const mergePromise = (ajaxArray) => {
  // 1,2,3 done [1,2,3] 此处写代码 请写出ES6、ES3 2中解法
};
mergePromise([ajax1, ajax2, ajax3]).then((data) => {
  console.log("done");
  console.log(data); // data 为[1,2,3]
});
// 执行结果为：1 2 3 done [1,2,3]
```

答案

```javascript
//解法1
const mergePromise = (ajaxArray) => {
  //串行
  return new Promise((resolve, reject) => {
    let len = ajaxArray.length;
    let idx = 0;
    let tem = [];
    function next() {
      if (idx === len) return resolve(tem);
      ajaxArray[idx]()
        .then((data) => {
          tem.push(data);
          idx++;
          next();
        })
        .catch(reject);
    }
    next();
  });
};
// 解法2
// es6 串行
const mergePromise = (ajaxArray) => {
  return (async function () {
      let ret = []
      let idx = 0
      let len = ajaxArray.length
      while(idx < len) {
          let data = await ajaxArray[idx]()
          ret.push(data)
          idx++
      }
      return ret
  })()
}
console.log(data)
})
```

实现具有并发限制的 promise.all

```js
function promsieTask(taskList, maxNum) {
  return new Promise((resolve, rejuct) => {
    let runCount = 0;
    let complated = 0;
    const taskNum = taskList.length;
    const resArr = [];
    let current = 0;
    function handler() {
      if (runCount >= maxNum) return;
      const a = taskNum - complated;
      const b = maxNum - runCount;
      const arr = taskList.splice(0, a > b ? b : a);
      arr.forEach((task, index) => {
        const d = current + index;
        task
          .then(
            (res) => {
              console.log(current, index, res);
              resArr[current] = res;
            },
            (reason) => {
              resArr[current] = reason;
            }
          )
          .finally(() => {
            complated++;
            runCount--;

            if (complated === taskNum) {
              resolve(resArr);
            }
            handler();
          });
      });
      current += taskList.length;
    }
    handler();
  });
}
```

## 实现 maxRequest，成功后 resolve 结果，失败后重试，尝试超过一定次数才真正的 reject

```js
function maxRequest(fn, maxNum) {
  return new Promise((resolve, reject) => {
    function help(index) {
      Promise.resolve(fn())
        .then((value) => {
          resolve(value);
        })
        .catch((error) => {
          if (index - 1 > 0) {
            help(index - 1);
          } else {
            reject(error);
          }
        });
    }
    help(maxNum);
  });
}
```

## 实现 Promise.allSettled

返回一个在所有给定的 promise 都已经 fulfilled 或 rejected 后的 promise，并带有一个对象数组，每个对象表示对应的 promise 结果。
一旦所指定的 promises 集合中每一个 promise 已经完成，无论是成功的达成或被拒绝，未决议的 Promise 将被异步完成。那时，所返回的 promise 的处理器将传入一个数组作为输入，该数组包含原始 promises 集中每个 promise 的结果。

对于每个结果对象，都有一个 status 字符串。如果它的值为 fulfilled，则结果对象上存在一个 value 。如果值为 rejected，则存在一个 reason 。value（或 reason ）反映了每个 promise 决议（或拒绝）的值

```js
Promise.allSettled = function (promises) {
  let count = 0;
  let result = [];
  return new Promise((resolve, reject) => {
    promises.forEach((p, index) => {
      Promise.resolve(p)
        .then((value) => {
          result[index] = {
            status: "fulfilled",
            value,
          };
        })
        .catch((e) => {
          result[index] = {
            status: "rejected",
            reason: e,
          };
        })
        .finally(() => {
          count++;
          if (count === promises.length) {
            resolve(result);
          }
        });
    });
  });
};
```
