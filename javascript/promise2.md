## Promise.resolve

Promsie.resolve(value) 可以将任何值转成值为 value 状态是 fulfilled 的 Promise，但如果传入的值本身是 Promise 则会原样返回它。

```js
Promise.resolve = function (value) {
  // 如果是 Promsie，则直接输出它
  if (value instanceof Promise) {
    return value;
  }
  return new Promise((resolve) => resolve(value));
};
```

## Promise.reject

和 Promise.resolve() 类似，Promise.reject() 会实例化一个 rejected 状态的 Promise。但与 Promise.resolve() 不同的是，如果给 Promise.reject() 传递一个 Promise 对象，则这个对象会成为新 Promise 的值。

```js
Promise.reject = function (reason) {
  return new Promise((resolve, reject) => reject(reason));
};
```

## 实现 mergePromise 函数，把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组 data 中。

```js
const time = (timer) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timer);
  });
};
const ajax1 = () =>
  time(2000).then(() => {
    console.log(1);
    return 1;
  });
const ajax2 = () =>
  time(1000).then(() => {
    console.log(2);
    return 2;
  });
const ajax3 = () =>
  time(1000).then(() => {
    console.log(3);
    return 3;
  });

function mergePromise(ajaxArray) {
  // 存放每个ajax的结果
  const data = [];
  let promise = Promise.resolve();
  ajaxArray.forEach((ajax) => {
    // 第一次的then为了用来调用ajax
    // 第二次的then是为了获取ajax的结果
    promise = promise.then(ajax).then((res) => {
      data.push(res);
      return data; // 把每次的结果返回
    });
  });
  // 最后得到的promise它的值就是data
  return promise;
}

mergePromise([ajax1, ajax2, ajax3]).then((data) => {
  console.log("done");
  console.log(data); // data 为 [1, 2, 3]
});

// 要求分别输出
// 1
// 2
// 3
// done
// [1, 2, 3]
```

## 使用 Promise 实现红绿灯交替重复亮

```js
function red() {
  console.log("red");
}
function green() {
  console.log("green");
}
function yellow() {
  console.log("yellow");
}
const light = function (timer, cb) {
  return new Promise((resolve) => {
    setTimeout(() => {
      cb();
      resolve();
    }, timer);
  });
};
const step = function () {
  Promise.resolve()
    .then(() => {
      return light(3000, red);
    })
    .then(() => {
      return light(2000, green);
    })
    .then(() => {
      return light(1000, yellow);
    })
    .then(() => {
      return step();
    });
};

step();
```

## 题目一

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
async1();
console.log("start");
```

这道基础题输出的是啥？
答案：
'async1 start'
'async2'
'start'
'async1 end'
过程分析：

首先一进来是创建了两个函数的，我们先不看函数的创建位置，而是看它的调用位置
发现 async1 函数被调用了，然后去看看调用的内容
执行函数中的同步代码 async1 start，之后碰到了 await，它会阻塞 async1 后面代码的执行，因此会先去执行 async2 中的同步代码 async2，然后跳出 async1
跳出 async1 函数后，执行同步代码 start
在一轮宏任务全部执行完之后，再来执行刚刚 await 后面的内容 async1 end。

在这里，你可以理解为「紧跟着 await 后面的语句相当于放到了 new Promise 中，下一行及之后的语句相当于放在 Promise.then 中」。
让我们来看看将 await 转换为 Promise.then 的伪代码：

```js
async function async1() {
  console.log("async1 start");
  // 原来代码
  // await async2();
  // console.log("async1 end");

  // 转换后代码
  new Promise((resolve) => {
    console.log("async2");
    resolve();
  }).then((res) => console.log("async1 end"));
}
async function async2() {
  console.log("async2");
}
async1();
console.log("start");
```

转换后的伪代码和前面的执行结果是一样的。

## 5.5 题目五

```js
async function async1() {
  console.log("async1 start");
  await new Promise((resolve) => {
    console.log("promise1");
  });
  console.log("async1 success");
  return "async1 end";
}
console.log("srcipt start");
async1().then((res) => console.log(res));
console.log("srcipt end");
```

这道题目比较有意思，大家要注意了。
在 async1 中 await 后面的 Promise 是没有返回值的，也就是它的状态始终是 pending 状态，因此相当于一直在 await，await，await 却始终没有响应...

所以在 await 之后的内容是不会执行的，也包括 async1 后面的 .then。

答案为：

'script start'
'async1 start'
'promise1'
'script end'

## 题目二

```js
const async1 = async () => {
  console.log("async1");
  setTimeout(() => {
    console.log("timer1");
  }, 2000);
  await new Promise((resolve) => {
    console.log("promise1");
  });
  console.log("async1 end");
  return "async1 success";
};
console.log("script start");
async1().then((res) => console.log(res));
console.log("script end");
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .catch(4)
  .then((res) => console.log(res));
setTimeout(() => {
  console.log("timer2");
}, 1000);
```

注意的知识点：

1. async 函数中 await 的 new Promise 要是没有返回值的话则不执行后面的内容(类似题 5.5)
2. .then 函数中的参数期待的是函数，如果不是函数的话会发生透传(类似题 3.8 )
   注意定时器的延迟时间

因此本题答案为：
'script start'
'async1'
'promise1'
'script end'
1
'timer2'
'timer1'

