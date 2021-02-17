compose 是一个工具函数，Koa.js 的中间件通过这个工具函数组合后，按 app.use() 的顺序同步执行，也就是形成了 洋葱圈式的调用。
利用递归实现了 Promise 的链式执行，不管中间件中是同步还是异步都通过 Promise 转成异步链式执行。

```javascript
module.exports = compose;

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose(middleware) {
  if (!Array.isArray(middleware))
    throw new TypeError("Middleware stack must be an array!");
  for (const fn of middleware) {
    if (typeof fn !== "function")
      throw new TypeError("Middleware must be composed of functions!");
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times"));
      // 执行当前第 i 个中间件
      index = i;
      let fn = middleware[i];
      // 所有的中间件执行完毕
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        // 执行当前的中间件
        // 这里的fn 就是app.use(fn) 传入的函数
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
```
