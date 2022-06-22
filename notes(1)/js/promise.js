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

  // then方法,接收一个成功的回调和一个失败的回调
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
          if (x instanceof MyPromise) {
            console.log(x._status, x.then, resolve);
          }
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

  catch(rejectFn) {
    return this.then(undefined, rejectFn);
  }

  finally(cb) {
    return this.then(
      (value) => MyPromise.resolve(cb()).then(() => value), // MyPromise.resolve执行回调,并在then中return结果传递给后面的Promise
      (reason) =>
        MyPromise.resolve(cb()).then(() => {
          throw reason;
        }) // reject同理
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  static all(promiseArr) {
    let index = 0;
    let result = [];
    return new MyPromise((resolve, reject) => {
      //Promise.resolve(p)用于处理传入值不为Promise的情况
      promiseArr.forEach((p, i) => {
        MyPromise.resolve(p).then(
          (val) => {
            index++;
            result[i] = val;
            if (index === promiseArr.length) {
              resolve(result);
            }
          },
          (err) => {
            //有一个Promise被reject时，MyPromise的状态变为reject
            reject(err);
          }
        );
      });
    });
  }

  static race(promiseArr) {
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < promiseArr.length; i++) {
        const p = promiseArr[p];
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

const p1 = new MyPromise((resolve, reject) => {
  resolve(1); //同步executor测试
});

p1.then((res) => {
  console.log(res);
  return 2; //链式调用测试
})
  .then() //值穿透测试
  .then((res) => {
    console.log(res);
    return new MyPromise((resolve, reject) => {
      resolve(3); //返回Promise测试
    });
  })
  .then((res) => {
    console.log(res);
    throw new Error("reject测试"); //reject测试
  })
  .then(
    () => {},
    (err) => {
      console.log(err);
    }
  );

// 输出
// 1
// 2
// 3
// Error: reject测试

MyPromise.resolve(2).then((val) => {
  console.log(val, "resolve test");
});

/*
let x = resolveFn(value) //分类讨论返回值,如果是Promise,那么等待Promise状态变更,否则直接resolve x instanceof MyPromise ? x.then(resolve, reject) : resolve(x) 之前一直不了解 为什么如果x是promise，就需要执行x.then()，苦想一段时间后有点体会： 在这里只讨论 p1.then(() => { return new Promise() }).then() 的情况 首先 第一个 .then() 内部默认会返回一个promise，叫做promiseA，开发者如果有需求则会手动return一个 新的 promise，叫做 promiseB，也就是上文的 x 。 第二个.then()的回调函数参数实际上应该获取到的是开发者写的 promiseB(也就是x) 的执行结果，但是由于默认返回一个promiseA，则第二个.then()的回调函数参数是 promiseA 的执行结果.。 因此想要第二个.then()获取到的结果是正确的结果，就需要先执行 promiseB，再把 promiseB 的结果丢到promiseA。 因此在得到 x 为 promise 的时候，先执行 x.then(resolve) ，这个形参 resolve 是 promiseA 的 resolve函数 ， 等到 x （promiseB） 的状态发生变化的时候，会执行then收集到的回调，即会执行 A 的 resolve 函数，而 x.then 的回调函数的参数就是 promiseA 的 resolve函数的参数。这样就把 x （promiseB）的执行结果通过.then回调传递到了 promiseA，然后通过 promiseA 的 resolve 函数传递到了第二个.then()。 个人认为这个方法的巧妙之处在于 将 promiseA 的的 resolve 作为 x （promiseB）的then回调，而then回调的参数正是 x（promiseB）的执行结果，这样就把数据传递了起来。
*/

function run() {
  return new Promise((resolve, reject) => {
    const g = gen();
    function _next(val) {
      try {
        var res = g.next(val);
      } catch (err) {
        reject(err);
      }
      if (res.done) return resolve(res.value);
      Promise.resolve(res.value).then(
        (val) => _next(val),
        (err) => {
          g.throw(err);
        }
      );
    }
    _next();
  });
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (err) {
    reject(err);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then();
  }
}

function _asyncToGenerator(fn) {
  return () => {
    const self = this;
    const args = arguments;
    return new Promise((resolve, reject) => {
      const gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      //处理异常
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
