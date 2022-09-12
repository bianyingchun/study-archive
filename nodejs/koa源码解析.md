# 整体工作

1. 封装 node http server、创建 Koa 类构造函数

2. 构造 request、response、context 对象

3. 中间件机制和剥洋葱模型的实现

4. 错误捕获和错误处理

## 1. 封装 node http server、创建 Koa 类构造函数

```js
const response = require("./response");
const compose = require("koa-compose");
const context = require("./context");
const request = require("./request");
module.exports = class Application extends Emitter {
  /**
   * Initialize a new `Application`.
   *
   * @api public
   */

  /**
   *
   * @param {object} [options] Application options
   * @param {string} [options.env='development'] Environment
   * @param {string[]} [options.keys] Signed cookie keys
   * @param {boolean} [options.proxy] Trust proxy headers
   * @param {number} [options.subdomainOffset] Subdomain offset
   * @param {string} [options.proxyIpHeader] Proxy IP header, defaults to X-Forwarded-For
   * @param {number} [options.maxIpsCount] Max IPs read from proxy IP header, default to 0 (means infinity)
   *
   */

  constructor(options) {
    super();
    options = options || {};
    this.proxy = options.proxy || false;
    this.subdomainOffset = options.subdomainOffset || 2;
    this.proxyIpHeader = options.proxyIpHeader || "X-Forwarded-For";
    this.maxIpsCount = options.maxIpsCount || 0;
    this.env = options.env || process.env.NODE_ENV || "development";
    if (options.keys) this.keys = options.keys;
    this.middleware = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
    // util.inspect.custom support for node 6+
    /* istanbul ignore else */
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
  }
  listen(...args) {
    debug("listen");
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }

  callback() {
    const fn = compose(this.middleware);

    if (!this.listenerCount("error")) this.on("error", this.onerror);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }
};
```

## 2. 构造 request、response、context 对象

阅读 koa2 的源码得知，其中 context.js、request.js、response.js 三个文件分别是 request、response、context 三个模块的代码文件。

context 就是我们平时写 koa 代码时的 ctx，**它相当于一个全局的 koa 实例上下文 this，它连接了 request、response 两个功能模块，并且暴露给 koa 的实例和中间件等回调函数的参数中**，起到承上启下的作用。

request、response 两个功能模块分别对 node 的原生 request、response 进行了一个功能的封装，使用了 getter 和 setter 属性，基于 node 的对象 req/res 对象封装 koa 的 request/response 对象。

```js
  createContext(req, res) {
    const context = Object.create(this.context)
    const request = context.request = Object.create(this.request)
    const response = context.response = Object.create(this.response)
    context.app = request.app = response.app = this
    context.req = request.req = response.req = req
    context.res = request.res = response.res = res
    request.ctx = response.ctx = context
    request.response = response
    response.request = request
    context.originalUrl = request.originalUrl = req.url
    context.state = {}
    return context
  }
```

## 4. 错误捕获和错误处理

- ctx.onerror 中间件中的错误捕获
- app.on('error', (err) => {}) 最外层实例事件监听形式
  添加对错误事件的监听
- app.onerror = (err) => {} 重写 onerror 自定义形式
  重写默认错误监听

### 中间件的错误捕获

```js
  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res
    res.statusCode = 404
    const onerror = err => ctx.onerror(err)
    const handleResponse = () => respond(ctx)
    onFinished(res, onerror)
    return fnMiddleware(ctx).then(handleResponse).catch(onerror)
  }
```

### 框架层错误捕获

为实现服务器实例能有错误事件的监听机制，通过 on 的监听函数就能订阅和监听框架层面上的错误，实现这个机制不难，使用 nodejs 原生 events 模块即可，events 模块给我们提供了事件监听 on 函数和事件触发 emit 行为函数，一个发射事件，一个负责接收事件，我们只需要将 koa 的构造函数继承 events 模块即可，

```js
let EventEmitter = require("events");
class Application extends EventEmitter {}
// 继承了events模块后，当我们创建koa实例的时候，加上on监听函数，代码如下：

let app = new Koa();

app.on("error", (err) => {
  console.log("error what hapen: ", err.stack);
});
```
