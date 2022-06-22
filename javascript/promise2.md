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
