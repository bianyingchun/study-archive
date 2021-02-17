[参考链接](https://zhuanlan.zhihu.com/p/87079561)

### 用法简单对比

如果你使用 express.js 启动一个简单的服务器，那么基本写法应该是这样：

```javascript
const express = require("express");

const app = express();
const router = express.Router();

app.use(async (req, res, next) => {
  console.log("I am the first middleware");
  next();
  console.log("first middleware end calling");
});
app.use((req, res, next) => {
  console.log("I am the second middleware");
  next();
  console.log("second middleware end calling");
});

router.get("/api/test1", async (req, res, next) => {
  console.log("I am the router middleware => /api/test1");
  res.status(200).send("hello");
});

router.get("/api/testerror", (req, res, next) => {
  console.log("I am the router middleware => /api/testerror");
  throw new Error("I am error.");
});

app.use("/", router);

app.use(async (err, req, res, next) => {
  if (err) {
    console.log("last middleware catch error", err);
    res.status(500).send("server Error");
    return;
  }
  console.log("I am the last middleware");
  next();
  console.log("last middleware end calling");
});

app.listen(3000);
console.log("server listening at port 3000");
```

换算成等价的 koa2，那么用法是这样的：

```javascript
const koa = require("koa");
const Router = require("koa-router");

const app = new koa();
const router = Router();

app.use(async (ctx, next) => {
  console.log("I am the first middleware");
  await next();
  console.log("first middleware end calling");
});

app.use(async (ctx, next) => {
  console.log("I am the second middleware");
  await next();
  console.log("second middleware end calling");
});

router.get("/api/test1", async (ctx, next) => {
  console.log("I am the router middleware => /api/test1");
  ctx.body = "hello";
});

router.get("/api/testerror", async (ctx, next) => {
  throw new Error("I am error.");
});

app.use(router.routes());

app.listen(3000);
console.log("server listening at port 3000");
```

### express.js 中间件实现原理

###### 2.1、express 挂载中间件的方式

要理解其实现，我们得先知道 express.js 到底有多少种方式可以挂载中间件进去？

目前可以挂载中间件进去的有：(HTTP Method 指代那些 http 请求方法，诸如 Get/Post/Put 等等)

- app.use
- app.[HTTP Method]
- app.all
- app.param
- router.all
- router.use
- router.param
- router.[HTTP Method]
