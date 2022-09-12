### child_process

1. spawn ： 子进程中执行的是**非 node 程序**，提供一组参数后，执行的结果以**流**的形式返回。
2. execFile：子进程中执行的是**非 node 程序**，提供一组参数后，执行的结果以**回调**的形式返回。
3. exec：子进程执行的是**非 node 程序**，**传入一串 shell 命令**，执行后结果以**回调**的形式返回，**与 execFile 不同的是 exec 可以直接执行一串 shell 命令。**
4. fork：子进程执行的是 node 程序，提供一组参数后，执行的结果以**流**的形式返回，**与 spawn 不同，fork 生成的子进程只能执行 node 应用。**

### 读取命令行参数

1. process.argv
2. minimist

### node 的事件循环

1. times： 这个阶段执行 setTimeout(callback) and setInterval(callback)预定的 callback;
2. io callback： 上一轮循环中有少数的 I/O callback 会被延迟到这一轮的这一阶段执行
3. idel： 仅 node 内部使用
4. poll ：获取新的 I/O 事件, 适当的条件下 node 将阻塞在这里;
   1. 不存在 timer
      1. poll 为空
         1. setImmediate()设定了 callback 或者有满足 close callbacks 阶段的 callback,执行下一个阶段
         2. 代码没有设定 setImmediate(callback)或者没有满足 close callbacks 阶段的 callback，event loop 将阻塞在该阶段等待 callbacks 加入 poll queue;
      2. poll 不为空
         event loop 将同步的执行 queue 里的 callback,直至 queue 为空，或执行的 callback 到达系统上限;
   2. 存在 timer，且 timer 未到超时时间
      则会把最近的一个 timer 剩余超时时间作为参数传入 io_poll()中，这样 event loop 阻塞在 poll 阶段等待时，如果没有任何 I/O 事件触发，也会由 timerout 触发跳出等待的操作，结束本阶段，然后在 close callbacks 阶段结束之后会在进行一次 timer 超时判断
5. check： 执行 setImmediate() 设定的 callbacks;
6. close： 比如 socket.on(‘close’, callback)的 callback 会在这个阶段执行.

event loop 按顺序执行上面的六个阶段，每一个阶段都有一个装有 callbacks 的 fifo queue(队列)，当 event loop 运行到一个指定阶段时，node 将执行该阶段的 fifo queue(队列)，当队列 callback 执行完或者执行 callbacks 数量超过该阶段的上限时，event loop 会转入下一下阶段.

### node 配置环境变量

cross-env

### 结合 pm2 自动化部署

1. 配置 git 的 ssh 免密认证
2. 在 pm2.config.js 中配置 deploy 选项
   1. 服务器地址
   2. 项目路径
   3. 仓库地址
3. 每次部署前先将本地的代码提交到远程 git 仓库
4. 首次部署：pm2 deploy pm2.config.js production setup
5. 再次部署：pm2 deploy pm2.config.js production update

### nodejs 的特点

Node. js 是一个基于 Chrome v8 引擎的服务器端 JavaScript 运行环境；Node. js 是一个事件驱动、非阻塞式 I/O 的模型，轻量而又高效；Node. js 的包管理器 npm 是全球最大的开源库生态系统。

### 进程与线程的区别：

（1）调度：线程作为调度和分配的基本单位，进程作为拥有资源的基本单位

（2）并发性：不仅进程之间可以并发执行，同一个进程的多个线程之间也可并发执行

（3）拥有资源：进程是拥有资源的一个独立单位，线程不拥有系统资源，但可以访问隶属于进程的资源.

（4）系统开销：在创建或撤消进程时，由于系统都要为之分配和回收资源，导致系统的开销明显大于创建或撤消线程时的开销

### 进程和线程的关系：

（1）**一个线程只能属于一个进程**，而一个进程可以有多个线程，但至少有一个线程。

（2）资源分配给进程，**同一进程的所有线程共享该进程的所有资源**。

（3）处理机分给线程，即真正在处理机上运行的是线程。

（4）线程在执行过程中，需要协作同步。不同进程的线程间要利用消息通信的办法实现同步。线程是指进程内的一个执行单元,也是进程内的可调度实体.

### 单线程

我们先来明确一个概念，即：node 是单线程的，这一点与 JavaScript 在浏览器中的特性相同，并且在 node 中 JavaScript 主线程与其他线程（例如 I/O 线程）是无法共享状态的。

单线程的好处就是：

- 无需像多线程那样去关注线程之间的状态同步问题
- 没有线程切换所带来的开销
- 没有死锁存在
- 当然单线程也有许多坏处：

- 无法充分利用多核 CPU
- 大量计算占用 CPU 会导致应用阻塞(即不适用 CPU 密集型)
- 错误会引起整个应用的退出

### 异步 I/O

node 的性能很高。原因之一就是 node 具有异步 I/O 特性，**每当有 I/O 请求发生时，node 会提供给该请求一个 I/O 线程。然后 node 就不管这个 I/O 的操作过程了，而是继续执行主线程上的事件，只需要在该请求返回回调时在处理即可**。也就是 node 省去了许多等待请求的时间。

### 事件驱动

你可能又要问了，node 怎么知道请求返回了回调，又应该何时去处理这些回调呢？

答案就是 node 的另一特性：事务驱动，**即主线程通过 event loop 事件循环触发的方式来运行程序**，这是 node 支持高并发的另一重要原因

1. Node.js 在**主线程里维护了一个事件队列**，当接到请求后，就将该请求作为一个事件放入这个队列中，然后继续接收其他请求。

2. 当**主线程空闲**时(没有请求接入时)，就开始**循环事件队列**，检查队列中是否有要处理的事件，这时要分两种情况：

   - 如果是**非 I/O 任务，就亲自处理**，并通过回调函数返回到上层调用；

   - 如果是**I/O 任务，就从 线程池 中拿出一个线程来处理这个事件**，并指定回调函数，然后继续循环队列中的其他事件。

3. 当 **I/O 任务完成以后就执行回调**，把请求结果存入事件中，并将该**事件重新放入队列中，等待循环，最后释放当前线程**，当**主线程再次循环到该事件时，就直接处理**了。

### 你觉得 node 的适用场景是什么

适合运用在**高并发，io 密集，少量业务逻辑**的场景。
用户表单收集，聊天室，web 论坛
高并发、实时聊天、实时消息推送、客户端逻辑强大的 SPA（单页面应用程序）。
其实 nodejs 能实现几乎一切的应用，但要考虑的是适不适合。

### 为什么要用 Node. js？

1. 简单， Node. js 用 JavaScript、JSON 进行编码，简单好学。
2. 功能强大，非阻塞式 I/O，在较慢的网络环境中，可以分块传输数据，事件驱动，擅长高并发访问。
3. 轻量级， Node. js 本身既是代码又是服务器，前后端使用同一语言。
4. 可扩展，可以轻松应对多实例、多服务器架构，同时有海量的第三方应用组件。

### Node. js 有哪些全局对象？

global、 process, console、 module 和 exports。

### process 有哪些常用方法？

process.env：环境变量，例如通过 process.env.NODE_ENV 获取不同环境项目配置信息
process.nextTick：这个在谈及 Event Loop 时经常为会提到
process.pid：获取当前进程 id
process.ppid：当前进程对应的父进程
process.cwd()：获取当前进程工作目录，
process.platform：获取当前进程运行的操作系统平台
process.uptime()：当前进程已运行时间，例如：pm2 守护进程的
uptime 值
进程事件：
process.on(‘uncaughtException’, cb) 捕获异常信息、
process.on(‘exit’, cb）进程推出监听
三个标准流：
process.stdout 标准输出、
process.stdin 标准输入、
process.stderr 标准错误输出
process.title 指定进程名称，有的时候需要给进程指定一个名称

### console 有哪些常用方法？

console.log/console. info、console.error/console.warning、console.time/console.timeEnd 、console.trace、console .table。

### Node.js 是怎样支持 HTTPS、tls 的

1. 服务器或客户端使用 HTTPS 替代 HTTP。

2. 服务器或客户端加载公钥、私钥证书

### koa-compose 实现

利用递归实现了 Promise 的链式 p 执行，不管中间件中是同步还是异步都通过 Promise 转成异步链式执行。

```javascript
function compose(middleware) {
  return function (context, next) {
    // last called middleware #
    return dispatch(0);
    function dispatch(i) {
      // 执行当前第 i 个中间件
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

### 你对 koa 了解多少

[](./koa%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90.md)

### 说说你对 koa2 中间件的理解

核心中间件机制洋葱模型
通过 use 注册中间件到数组中，然后从从外层开始往内执行，遇到 next()后进入下一个中间件，当所有中间件执行完毕后，开始返回，执行中间件中未执行的代码，整体流程就是递归处理。

所谓洋葱模型，就是指每一个 Koa 中间件都是一层洋葱圈，它即可以掌管请求进入，也可以掌管响应返回。换句话说：**外层的中间件可以影响内层的请求和响应阶段，内层的中间件只能影响外层的响应阶段**。

dispatch(n)对应第 n 个中间件的执行，第 n 个中间件可以通过 await next()来执行下一个中间件，同时在最后一个中间件执行完成后，依然有恢复执行的能力。即通过洋葱模型，await next()控制调用 “下游”中间件，直到 “下游”没有中间件且堆栈执行完毕，最终流回“上游”中间件。这种方式有个优点，特别是对于日志记录以及错误处理等需要非常友好。

### express, koa2 中间件和 redux 中间件比较

实例创建： express 使用工厂方法, koa 是类

1. koa 实现的语法更高级，使用 ES6，支持 generator(async await)
2. koa 没有内置 router, 增加了 ctx 全局对象，整体代码更简洁，使用更方便。
3. koa 中间件的递归为 promise 形式，express 使用 next 尾递归, redux 的柯里化中间件形式，更简洁灵活，函数式编程体现的更明显, redux 以 dispatch 覆写的方式进行中间件增强
4. redux 的实现，柯里化中间件形式，更简洁灵活，函数式编程体现的更明显
5. redux 以 dispatch 覆写的方式进行中间件增强

### koa2 的洋葱模型和 redux 中间件的洋葱模型一样吗

### redux compose 的大概实现,reduce 的妙用

```javascript
function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  );
}
function applyMiddleware(...middlewares) {
  return (createStore) =>
    (...args) => {
      const store = createStore(...args);

      let dispatch = () => {
        throw new Error(
          `Dispatching while constructing your middleware is not allowed. ` +
            `Other middleware would not be applied to this dispatch.`
        );
      };

      const middlewareAPI = {
        getState: store.getState,
        // 这里很关键，也很巧妙! 没有使用store.dispatch 而是用了一个 `dispatch` 变量，下面会被compose的dispatch覆盖，
        // 这样传入 middlware 的第一个参数中的 dispatch 即为覆盖后的dispatch,
        // 对于类似 redux-thunk 这样的中间件，内部会调用 'store.dispatch', 使得其同样会走一遍所有中间件
        dispatch: (...args) => dispatch(...args),
      };

      // 应用中间件的第一层参数, 为了给中间件暴露store的getState和dispatch方法
      const chain = middlewares.map((middleware) => middleware(middlewareAPI));

      // compose 带来的就是剥洋葱似的函数调用 compose(f, g, h) => (...args) => f(g(h(...args)))
      // redux 中间件的核心就是复写 dispatch
      // 把 store.dispatch 传递给第一个中间件
      // 每一个中间件都会返回一个新的 dispatch 传递给下一个中间件

      dispatch = compose(...chain)(store.dispatch);

      return {
        ...store,
        dispatch, // dispatch 覆盖
      };
    };
}
```

### express 的中间件实现机制

express 本质上就是一个中间件管理器，当进入到 app.handle 的时候就是对中间件进行执行的时候，所以，最关键的两个函数就是：

app.handle 尾递归调用中间件处理 req 和 res
app.use 添加中间件

全局维护一个 stack 数组用来存储所有中间件，app.use 的实现就很简单了，可以就是一行代码

```javascript
app.use = function (fn) {
  this.stack.push(fn);
};
```

express 的真正实现当然不会这么简单，它内置实现了路由功能，其中有 router, route, layer 三个关键的类，有了 router 就要对 path 进行分流，stack 中保存的是 layer 实例，app.use 方法实际调用的是 router 实例的 use 方法,
app.handle 即对 stack 数组进行处理

```javascript
app.handle = function (req, res, p) {
  var stack = this.stack;
  var idx = 0;
  function next(err) {
    if (idx >= stack.length) {
      callback("err");
      return;
    }
    var mid = stack[idx++];
    mid(req, res, next);
  }
  next();
};
```

这里就是所谓的"尾递归调用"，next 方法不断的取出 stack 中的“中间件”函数进行调用，同时把 next 本身传递给“中间件”作为第三个参数，每个中间件约定的固定形式为 (req, res, next) => {}, 这样每个“中间件“函数中只要调用 next 方法即可传递调用下一个中间件。

之所以说是”尾递归“是因为递归函数的最后一条语句是调用函数本身，所以每一个中间件的最后一条语句需要是 next()才能形成”尾递归“，否则就是普通递归，”尾递归“相对于普通”递归“的好处在于节省内存空间，不会形成深度嵌套的函数调用栈。

### 对比一下 express,koa2

1. express 自身集成了路由，视图处理等功能，koa 本身不集成任何中间件，需要配合路由试图等中间件进行开发
2. 异步流程控制， express 采用 callback 来处理异步，koa1 采用 generator ,koa2 采用 async/await 。
3. 错误处理，express 使用 callback 捕获异常，对于深层次的异常捕获不了， koa 使用 try catch ,可以更好的解决异常捕获。
4. 中间件机制，Express 使用普通的回调函数，一种线性的逻辑。koa 采用洋葱模型.
5. 和 express 只有 request 和 response 对象不同，koa 增加了一个 context 作为这次请求的上下文，作为中间件的第一个参数，同时 context 上挂载了 response, request 对象.

### koa2 中 ctx.set 的等价写法

ctx.response.set == ctx.set

context：Koa 封装的带有一些和请求与相应相关的方法和属性
request：Koa 封装的 req 对象，比如提了供原生没有的 host 属性。
response：Koa 封装的 res 对象，对返回的 bodyhook 了 getter 和 setter。
ctx.request.ctx === ctx
ctx.response.ctx === ctx
ctx.request.app === ctx.app
ctx.response.app === ctx.app
ctx.req === ctx.response.req
//==============分割线===========================

### node 作为中间层

客户端直接请求到中间层的 node,node 分析请求，看需要哪个页面，再去请求对应数据，拿到数据后和模板结合成用户看到的页面，返回给前端。

### node 作为中间层的优点

1. 减轻客户端内存，不会像 mvvvm 把数据请求和页面渲染都压在客户端，而是在服务端完成
1. 更利于 seo
1. 保持了前后端分离的优点和目的，解放后端
1. 前端可操作的范围增多，甚至可以做服务器，数据库层面的优化，比如中间层常常用 nginx，redis 来优化项目,应对高并发

### node 的常用包

1. koa/expess 搭建服务器
2. multer 处理文件上传
3. crypto 加密
4. node-xlsx 读取 xlsx 表格文件
5. pac-proxy-agent 代理
6. jsonwebtoken 用于搭建 token 验证
7. xss 防止 xss 攻击
8. classnames
9. axios
10. koa-helmet
11. koa-bodyparser
12. koa-views
13. koa-session
14. koa-static
15. koa-logger
16. koa-convert

### 用 node 如何实现一个带压缩和缓存的 http-server？

### node 端处理大文件上传

Content-Type（内容类型），一般是指网页中存在的 Content-Type，用于定义网络文件的类型和网页的编码，决定浏览器将以什么形式、什么编码读取这个文件，这就是经常看到一些 PHP 网页点击的结果却是下载一个文件或一张图片的原因。

Content-Type 标头告诉客户端实际返回的内容的内容类型。
常见的媒体格式类型如下：

**text/html ： HTML 格式**
**text/plain ：纯文本格式**
text/xml ： XML 格式
image/gif ：gif 图片格式
image/jpeg ：jpg 图片格式
image/png：png 图片格式

以 application 开头的媒体格式类型：
application/xhtml+xml ：XHTML 格式
application/xml： XML 数据格式
application/atom+xml ：Atom XML 聚合格式
**application/json**： JSON 数据格式
application/pdf：pdf 格式
application/msword ： Word 文档格式
application/octet-stream ： 二进制流数据（如常见的文件下载）
**application/x-www-form-urlencoded** ： <form encType=””>中默认的 encType，form 表单数据被编码为 key/value 格式发送到服务器（表单默认的提交数据的格式）
另外一种常见的媒体格式是上传文件之时使用的：

**multipart/form-data** ： 需要在表单中进行文件上传时，就需要使用该格式

### content-type

### 上传文件的 content-type 是什么,node 如何拿到上传的文件内容(不利用插件)，文件内容是一次性传输过去的？

1. content-type: multipart/form-data
2. 如何拿到上传的文件内容

http 模块的 createServer(request, response),传入请求对象的 request 其实实现了 ReadableStream 接口，这个信息流可以被监听，或者与其他流进行对接。我们可以通过监听 data 和 end 事件，把数据给取出来

```javascript
const http = require("http");
let data = "";
http
  .createServer((request, response) => {
    request
      .on("error", (err) => {
        console.log(err);
      })
      .on("data", (chunk) => {
        data += chunk;
      })
      .on("end", () => {
        console.log(data);
      });
  })
  .listen(8080);
```

### 业务中看你有涉及到 node 的文件读写操作,有没有想过如果某个文件被锁怎么处理？

### 某些接口允许跨域,某些不允许,如何实现?能不能使用 koa2 中间件的方式实现一下?

1. koa2-cors

```javascript
const cors = require("koa2-cors");
// 跨域
app.use(
  cors({
    origin: function (ctx) {
      //设置允许来自指定域名请求
      return "*";
      // if (ctx.url === '/test') {
      //     return '*'; // 允许来自所有域名请求
      // }
      // return 'http://localhost:8080'; //只允许http://localhost:8080这个域名的请求
    },
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], //设置所允许的HTTP请求方法
    allowHeaders: ["Content-Type", "Authorization", "Accept"], //设置服务器支持的所有头信息字段
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"], //设置获取其他自定义字段
  })
);
```

2. koa

```javascript
app.use(async (ctx, next) => {
  if (
    ctx.request.header.origin !== ctx.origin &&
    whiteList.includes(ctx.request.header.origin) //检测白名单
  ) {
    ctx.set("Access-Control-Allow-Origin", ctx.request.header.origin);
    ctx.set("Access-Control-Allow-Credentials", true);
    //可选 指定浏览器CORS请求会额外发送的头信息字段
    ctx.set(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
  }
  await next();
});

app.use(async (ctx, next) => {
  if (ctx.method === "OPTIONS") {
    //表明服务器支持的所有跨域请求的方法,而不单是浏览器请求的那个方法。这是为了避免多次"预检"请求。
    ctx.set("Access-Control-Allow-Methods", "PUT,DELETE,POST,GET");
    //该字段可选，用来指定本次预检请求的有效期，单位为秒。
    ctx.set("Access-Control-Max-Age", 3600 * 24);
    ctx.body = "";
  }
  await next();
});
//ctx.origin与ctx.request.header.origin不同，ctx.origin是本服务器的域名，ctx.request.header.origin是发送请求的请求头部的origin，二者不要混淆
```

 <!-- // 1 允许指定的端口访问 必须开启的设置 
    ctx.set("Access-Control-Allow-Origin", "http://localhost:3000");

    // 2 允许获取头部信息(响应头部)
    ctx.set("Access-Control-Expose-Headers", "Content-Type,Content-length,Date");

    // 3 设置允许前端设置的请求方式(请求头部类型和数值)
    ctx.set("Access-Control-Allow-Headers", "Content-Type,Content-Length,test");

    // 4 设置允许前端发送请求的方式
    ctx.set("Access-Control-Allow-Methods", "GET,POST,DELETE,HEAD,OPTIONS");

    // 5 允许携带凭证
    ctx.set("Access-Control-Allow-Credentials", true);

    // 6 设置预检请求的缓存时间 两个位置都写
    ctx.set("Access-Control-Max-Age", 36000 * 24); -->

### koa-body 原理

koa-body 中间件作用是将 post 请求的请求体携带的数据解析到 ctx.request.body 中，
原理是先用 type-is 这个包(ctx.is 函数，根据请求的 content-type)判断出请求的数据类型，然后根据不同的类型用 co-body(请求体解析)和 formidable(数据类型是 multipart,文件上传解析)来解析，拿到解析结果后放到 ctx.request.body 或者 ctx.request.files 里面。

### node 事件循环机制

[事件循环机制专题](./事件循环机制.md)

### 业务中的实时保存会有性能开销,又没有做什么优化？

开启多进程 ？

### node 的优缺点

1. 优点
   1. js 运行环境，js 也可以开发后端程序
   2. 事件驱动，通过单线程维护时间循环队列，没有多线程的资源占用，和上下文切换，高效扩展性好，能充分利用系统资源
   3. 非阻塞 io，能处理高并发
   4. 主线程为单线程
   5. 跨平台，可以用在 pc web，electron, 移动端，react-native
   6. 可以做请求转发，合并请求，削减 json 大小，可以独立可控制路由，可以独立部署上线
2. 缺点
   1. 不适合 cpu 密集型应用，由于 js 是单线程，如果长时间运行机选，会使 cpu 时间片得不到释放，后续 io 无法发起
      (解决方案：分解大型运算任务为多个小任务， 使得运算适时释放，不阻塞 io 的发起)
   2. 不适合大内存的应用
      v8 的内存管理机制限制(64 为 1.4G, 32 为 0.7G)
   3. 不适合大量同步的应用
   4. 只适合单核 cpu，不能充分利用 cpu
   5. 可靠性低，一旦某个环节崩溃，整个系统都崩溃
      原因：单线程
      解决：
      1. nginx 反向代理，负载均衡，开多个进程，绑定多个端口；
      2. 开启多个进程监听同一个端口，使用 cluster 模块

### npm 是什么？

npm 是 Node. js 中管理和分发包的工具，可用于安装、卸载、发布、查看包等。

### npm 的好处是什么？

通过 ηpm，可以安装和管理项目的依赖，还可以指明依赖项的具体版本号。

### npm 的作用是什么？

npm 是同 Node .js 一起安装的包管理工具，能解决 Node. js 代码部署上的很多问题。常见的使用场景有以下几种。

1. 允许用户从 npm 服务器下载别人编写的第三方包到本地。

2. 允许用户从 npm 服务器下载并安装别人编写的命令行程序到本地。
3. 允许用户将自己编写的包或命令行程序上传到 npm 服务器供别人使用。

### node 的核心模块

1. http 模块 创建服务器
2. fs 模块 文件读写
3. path 操作文件路径
4. os 基本的操作系统相关的方法
   // CPU 的字节序

```javascript
// cpu 字节序
os.endianness();
// 操作系统名
os.type();
// 操作系统名
os.platform();
// 系统内存总量
os.totalmem();
// 操作系统空闲内存量
os.freemem();
// 返回一个对象数组，其中包含有关每个逻辑 CPU 内核的信息。
os.cpus();
```

5. **stream 模块**
   四种类型
1. readable
1. writeable
1. duplex 读写流
1. transform 转换流
   为什么要使用 stream
   减少 node 由于单线程读取大文件而导致其他程序停止。避免一次性读取所有文件内容再返回，
   stream 进行流处理数据时，传递的是 buffer 数据，最大的好处就是开辟的内存都是堆外内存，不管 v8 管理，在 c++层面实现内存的申请。

### node 与 mysql 通信

1. mysql 库
2. 连接 mysql mysql.createConnect({...}).connect()
3. connection.query(sql, callback)

### 说一下锁,举例是读锁和写锁

它能保证一些方法在同一时间只能被执行一次, 从而避免并发问题.

1. 读写锁
   如果有其它线程读数据, 则允许其它线程执行读操作, 但不允许写操作
   如果有其它线程写数据, 则其它线程都不允许读和写操作
2. 互斥锁
   在大多数语言中, 互斥锁使用线程调度来实现的, 假如现在锁被锁住了, 那么后面的线程就会进入”休眠”状态, 直到解锁之后, 又会唤醒线程继续执行. 这也叫空等待(sleep-waiting).
3. 自旋锁
   自旋锁也是广义上的互斥锁, 是互斥锁的实现方式之一, 它不会产生线程的调度, 而是通过"循环"来尝试获取锁, 优点是能很快的获取锁, 缺点是会占用过多的 CPU 时间, 这被称为忙等待(busy-waiting).
4. 分布式锁
   在单机情况下, 在内存中的一个互斥锁就能控制到一个程序中所有线程的并发.
   但由于有集群架构(负载均衡/微服务等场景下), 内存中的锁就没用了. 所以我们需要一个"全局锁"去实现控制多个程序/多个机器上的线程并发. 这个全局锁就叫"分布式锁".

### 服务端渲染

简单理解是将组件或页面通过服务器生成 html 字符串，再发送到浏览器，最后将静态标记"混合"为客户端上完全交互的应用程序 (数据+模板)

##### 优点

1. 更利于 SEO。
2. 更利于首屏渲染
   首屏渲染是服务器发送过来的 html 字符串，并不依赖 js 文件，就会更快呈现页面内容，尤其针对大型单页应用，打包户文件体积较大，客户端渲染加载所有时间比较长，首页就会有很长的白屏等待时间

##### 缺点

1. 服务端压力较大
   本来是通过客户端完成渲染，现在统一到服务端 node 服务去做。尤其是高并发访问的情况，会大量占用服务端 CPU 资源；

2. 开发条件受限
   在服务端渲染中，只会执行到 componentDidMount 之前的生命周期钩子，因此项目引用的第三方的库也不可用其它生命周期钩子，这对引用库的选择产生了很大的限制；

3. 学习成本相对较高
   除了对 webpack、React 要熟悉，还需要掌握 node、Koa2 等相关技术。相对于客户端渲染，项目构建、部署过程更加复杂

#### 时间耗时比较

1. html 渲染
   - SSR 服务端渲染是先向后端服务器请求数据，然后**生成完整首屏 html 返回给浏览器**；就是服务端渲染**不需要等待 js 代码下载完成并请求数据，就可以返回一个已有完整数据的首屏页面**。
   - SPA 客户端渲染是等 js 代码下载、加载、解析完成后再请求数据渲染，等待的过程页面是什么都没有的，就是用户看到的白屏。
2. 数据请求
   - SSR 由服务端请求首屏数据，而不是客户端请求首屏数据，这是“快”的一个主要原因。服务端在内网进行请求，数据响应速度快。
   - SPA 客户端在不同网络环境进行数据请求，且外网 http 请求开销大，导致时间差。

### 用 nodejs，将 base64 转化成 png 文件

```javascript
const filePath = "test.png";
const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
const dataBuffer = Buffer.from(base64Data, "base64");
fs.writefileSync(filePath, dataBuffer);
```

### png 转成 base64

```javascript
const fs = require("fs");
const filePath = "test.png";
fs.readFile(filePath, (err, data) => {
  const imageBase64 = data.toString("base64");
  const imagePrefix = "data:image/png;base64,";
  console.log(imagePrefix + imageBase64);
});
```

### base64 为什么能提升性能，缺点

[参考链接](imooc.com/article/27804#comment)
什么是 base64 编码?　　
图片的 base64 编码就是可以将一副图片数据编码成一串字符串，使用该字符串代替图像地址。
那么为什么要使用 base64 传输图片文件？
**因为这样可以节省一个 http 请求。**

缺点:

1. base64 会导致 css 文件变大，意味着 CRP 的阻塞。CRP（Critical Rendering Path，关键渲染路径）：当浏览器从服务器接收到一个 HTML 页面的请求时，到屏幕上渲染出来要经过很多个步骤。浏览器完成这一系列的运行，或者说渲染出来我们常常称之为“关键渲染路径”。

通俗而言，**就是图片不会导致关键渲染路径的阻塞，而转化为 Base64 的图片大大增加了 CSS 文件的体积，CSS 文件的体积直接影响渲染，导致用户会长时间注视空白屏幕**。HTML 和 CSS 会阻塞渲染，而图片不会。

2. 页面解析 CSS 生成的 CSSOM 时间增加

Base64 跟 CSS 混在一起，大大增加了浏览器需要解析 CSS 树的耗时。其实解析 CSS 树的过程是很快的，一般在几十微妙到几毫秒之间。而如果 CSS 文件中混入了 Base64，那么（因为文件体积的大幅增长）解析时间会增长到十倍以上。

### node 模块查找策略

#### 1. 当模块拥有路径但没有后缀时

```js
require("./find");
```

1.  require 方法根据模块路径查找模块，如果是完整路径，直接引入模块
2.  如果模块后缀省略，先找同名 JS 文件再找同名 JS 文件夹，没有同名文件夹则报错
3.  如果找到了同名文件夹，找文件夹中的 index.js
4.  如果文件夹中没有 index.js，就会去当前文件夹中的 package.json 文件中查找 main 选项中的入口文件
5.  如果找指定的入口文件不存在或者没有指定入口文件就会报错，模块没有被找到

##### 2. 当模块没有路径且没有后缀时

```js
require("find");
```

1.  Node.js 会假设它是系统模块
2.  Node.js 会去 node_modules 文件夹中
3.  首先看是否有该名字的 JS 文件
4.  再看是否有该名字的文件夹
5.  如果是文件夹看里面是否有 index.js
6.  如果没有 index.js 查看该文件夹中的 package.json 中的 main 选项确定模块入口文件

### node 转 buffer 输出字符串会比直接 string 输出快,你的依据是什么？

### nodejs 怎么创建进程线程，可以用在哪些场景

### 为什么需要子进程？

Node. js 是异步非阻塞的，这对高并发非常有效。可是我们还有其他一些常用的需求，比如和操作系统 shell 命令交互，调用可执行文件，创建子进程，进行阻塞式访问或高 CPU 计算等，子进程就是为满足这些需求而产生的。顾名思义，子进程就是把 Node. js 阻塞的工作交给子进程去做。

### 两个 Node. js 程序之间如何交互？

通过 fork 实现父子程序之间的交互。

1. 子程序用 process.on、 process.send 访问父程序，
2. 父程序用 child.on、 child.send 访问子程序。

关于 parent. JS 的示例代码如下。

```js
var cp = require (' child_process' ) ;
 var child= cp.fork ('./child. js' );
child .on（'message'， function（msg）{
 console.log（'子程序发送的数据：'，msg )
})
child.send ( '来自父程序发送的数据' )
```

关于 child .js 的示例代码如下。

```js
process.on ( 'message' , function（msg）{
console.log ( '父程序发送的数据: ' , msg )
process.send ( '来自子程序发送的数据' )
```

### exec、 execFile、 spawn 和 fork 都是做什么用的？

1. exec：子进程执行的是**非 node 程序**，**传入一串 shell 命令**，执行后结果以**回调**的形式返回，与 execFile 不同的是 exec 可以直接执行一串 shell 命令。
2. execFile：子进程中执行的是**非 node 程序**，提供一组参数后，执行的结果以**回调**的形式返回。
3. spawn ： 子进程中执行的是**非 node 程序**，提供一组参数后，执行的结果以**流**的形式返回。
4. fork：子进程执行的是 node 程序，提供一组参数后，执行的结果以流的形式返回，与 spawn 不同，fork 生成的子进程只能执行 node 应用。

使用 fork 方法，可以在父进程和子进程之间开放一个 IPC 通道，使得不同的 node 进程间可以进行消息通信。

#### 如何开启多个子进程

单线程的一个缺点是不能充分利用多核，所以官方推出了 cluster 模块， cluster 模块可以创建共享服务器端口的子进程

```js
const cluster = require("cluster");
for (let i = 0; i < numCPUs; i++) {
  cluster.fork(); // 生成新的工作进程，可以使用 IPC 和父进程通信
}
```

本质还是通过 child_process.fork() 专门用于衍生新的 Node.js 进程,衍生的 Node.js 子进程独立于父进程，但两者之间建立的 IPC 通信通道除外， 每个进程都有自己的内存，带有自己的 V8 实例

#### 如何在一个进程的前提下开启多个线程

在 nodejs 10.0 及以上的版本，新增了 **worker_threads 模块**，可开启多个线程

```js
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const worker = new Worker(__filename, {
  workerData: script,
});
```

线程间如何传输数据: parentPort postMessage on 发送监听消息
共享内存： SharedArrayBuffer 通过这个共享内存

#### 使用场景

1. 常见的一个场景，在服务中若需要执行 shell 命令，那么就需要开启一个进程

```js
var exec = require("child_process").exec;
exec("ls", function (error, stdout, stderr) {
  if (error) {
    console.error("error: " + error);
    return;
  }
  console.log("stdout: " + stdout);
});
```

2. 对于服务中涉及大量计算的，可以开启一个工作线程，由这个线程去执行，执行完毕再把结果通知给服务线程。

### cluster 了解多少

Node.js 默认单进程运行，对于 32 位系统最高可以使用 512MB 内存，对于 64 位最高可以使用 1GB 内存。对于多核 CPU 的计算机来说，这样做效率很低，**因为只有一个核在运行，其他核都在闲置**。cluster 模块就是为了解决这个问题而提出的。

**主从模式**：Cluster 模块允许设立一个主进程和若干个 worker 进程，由主进程监控和协调 worker 进程的运行，worker 之间采用进程间通信交换信息，cluster 模块内置一个负载均衡器，协调各个进程之间的负载。这是典型的分布式架构中用于并行处理业务的模式，具备较好的可伸缩性和稳定性。主进程不负责具体的业务处理，而是负责调度或管理工作进程，他是趋向于稳定为。工作进程负责具体的业务处理。

cluster 模块允许设立一个主进程和若干个 worker 进程，由**主进程监控和协调 worker 进程的运行**。

**worker 之间采用进程间通信 IPC 交换消息**，**cluster 模块内置一个负载均衡器，采用 Round-robin 算法协调各个 worker 进程之间的负载**。

运行时，所有新建立的连接都由主进程完成，然后主进程再把 TCP 连接分配给指定的 worker 进程。
[详见 clurster 专题](./cluster.md)

#### 如果多个 Node 进程监听同一个端口时会出现 Error:listen EADDRIUNS 的错误，而 cluster 模块为什么可以让多个子进程监听同一个端口呢?

原因是 master 进程内部启动了一个 TCP 服务器，而真正监听端口的只有这个服务器，当来自前端的请求触发服务器的 connection 事件后，master 会将对应的 socket 句柄发送给子进程。

### node 的进程守护怎么做的,发现非预期故障怎么排查

1. pm2 和 forever ，它们都可以实现进程守护，底层也都是通过上面讲的 child_process 模块和 cluster 模块 实现的
2. nohup
   查看 pm2.log 文件

### node 单线程容易崩溃,怎么维护服务的

进程守护
使用 pm2

### pm 核心的功能其实不多：

1. 多进程管理
2. 系统信息监控
3. 日志管理

### pm2 内部机制了解吗

PM2 模块是 cluster 模块的一个包装层。它的作用是尽量将 cluster 模块抽象掉，让用户像使用单进程一样，部署多进程 Node 应用。

**PM2 通过命令行 CL，使用 RPC 建立 Client(命令行接收端，负责创建守护进程 Daemon，并与 Daemon 保持 RPC 连接) 与 Daemon 进程之间的通信，通过 RPC 通信方式，调用 God(负责进程的创建和管理)，从而应用 Node.js 的 cluster.fork 创建子进程的**

### pm2 依据什么重启服务

采用心跳包检测查看子进程是否处于活跃状态
每隔数秒钟向子进程发送心跳包，子进程如果响应，那么调用 kill 杀死这个进程，然后再重启 cluster.fork()一个新的进程，子进程可以监听到错误事件，这时可以发送消息给主进程，要求杀死自己，并且主进程此时重新调用 cluster.fork()一个新的子进程。

### 使用 pm2 的好处

1. 进程守护，系统崩溃自动重启
2. 启动多进程，充分利用 cpu 和内存
3. 自带日志记录功能
4. pm2 官方也结合 pm2 管理提供了一套可视化在线监控平台 keymetrics 实时监控

### 为什么要使用 pm2

对于这个问题，先说说我的看法，最基本的原因是因为 node 本身是一个单线程应用，它的特点就是所有方法都是串行一次执行，并且 node 并没有能力像 Java 一样独自去创建一个新的线程来实现异步操作，如果在执行 I/O 中遇到了阻塞就会降低整个应用的执行效率，导致 CPU 使用率高等不利原因。

因此在这种模式下，一个线程只能处理一个任务，要想提高吞吐量必须通过多线程。虽然单线程的好处有很多比如避免了线程同步或者死锁、状态同步等等之类的问题，但是在应用和计算能力要求日益倍增的今天，单线程最大的弊端就是无法利用多核 CPU 带来的优势来提升运行效率。
同时为了弥补单线程无法利用多核 CPU 的问题，提供了“子进程”这个概念，Node.js 实际上是 Javascript 执行线程的单线程，真正的的 I/O 操作，底层 API 调用都是通过多线程执行的。

1. pm2 可以把你的应用部署到服务器所有的 CPU 上（$ pm2 start app.js -i max），有效的解决了之前背景里提出的问题。
2. 同样是进程管理器，为什么不用 forever？我认为最大的区别是在监控欠缺，进程和集群管理有限

### 不用 pm2 怎么做进程管理

1. cluster api ，在业务代码上起一个 master 进程，它 fork 出多个 worker 来处理任务，每当一个 worker 挂了，会有事件传回 master,master 就能重新 fork 一份新的 worker,只要 master 不挂，就能达到守护进程的目的.
2. node-forever 原理就是崩溃就从重启一个

### 主线程挂了，pm2 如何处理

PM2 的方式
PM2 内置了处理上述的逻辑，你不用再写这么多繁琐的代码了。
只需这样一行：

```sh
$ pm2 start app.js -i 4
```

-i <number of workers> 表示实例程序的个数。就是工作线程。
如果 i 为 0 表示，会根据当前 CPU 核心数创建 .

1. 保持你的程序不中断运行
   如果有任何工作线程意外挂掉了，PM2 会立即重启他们，当前你可以在任何时候重启
   pm2 restart all
2. 实时调整集群数量
   你可以使用命令 pm2 scale <app name> <n> 调整你的线程数量，
   如 pm2 scale app +3 会在当前基础上加 3 个工作线程。
3. 在生产环境让你的程序永不中断
   PM2 reload <app name> 命令会一个接一个的重启工作线程，在新的工作线程启动后才结束老的工作线程。
   这种方式可以保持你的 Node 程序始终是运行状态。即使在生产环境下部署了新的代码补丁

### node 服务的性能监测有没有了解过?

### node

nodejs 日志切割用什么实现

1. pm2-logrotate
   https://www.jianshu.com/p/f6c95e406097
2. winston winston-daily-rotate-file

### node 如何做错误监控，生成日志，日志等级

1. 使用 pm2 来部署程序，任何标准输出和标准错误输出都会被写入日志文件
2. log4js

### 说一下进程线程,如何通信?

Node 本身提供了 cluster 和 child_process 模块创建的进程，本质上 cluster.fork() 是 child_process.fork()的上层实现，cluster 带来的好处是可以监听共享端口，否则建议使用 child_process

### # 进程

进程 Process 是计算机中的**程序关于某数据集合上的一次运行活动，是系统进行资源分配和调度的基本单位**，是操作系统结构的基础，进程是线程的容器（来自百科）。进程是\***\*资源分配的最小单位**。我们启动一个服务、运行一个实例，就是开一个服务进程，**多进程就是进程的复制（fork），fork 出来的每个进程都拥有自己的独立空间地址、数据栈，一个进程无法访问另外一个进程里定义的变量、数据结构，只有建立了 IPC 通信，进程之间才可数据共享。**

#### 线程

线程是操作系统能够进行**运算调度的最小单位**，首先我们要清楚线程是隶属于进程的，被包含于进程之中。一个线程只能隶属于一个进程，但是一个进程是可以拥有多个线程的。

#### 进程通信

**IPC 的全称是 Inter-Process Communication,即进程间通信**。它的目的是为了让不同的进程能够互相访问资源并进行协调工作。**实现进程间通信的技术有很多，如命名管道，匿名管道，socket，信号量，共享内存，消息队列等**。Node 中实现 IPC 通道是依赖于 **libuv**。**windows 下由命名管道(name pipe)实现，linux 系统则采用 Unix Domain Socket 实现**。表现在应用层上的进程间通信只有简单的 message 事件和 send()方法，接口十分简洁和消息化。

父进程在实际创建子进程之前，会**创建 IPC 通道并监听它，然后才真正的创建出子进程**，这个过程中也会通过环境变量（NODE_CHANNEL_FD）告诉子进程这个**IPC 通道的文件描述符**。子进程在启动的过程中，根据文件描述符去连接这个已存在的 IPC 通道，从而完成父子进程之间的连接。

### 多个 Nodejs 进程之间进行通信，有多种方式：

1. 使用共享内存，信号量。这种方式可以通过 child_process 模块实现。

2. socket。这种方式可以使用 net，http，websocket 模块实现，还可以使用 socket.io 来实现（推荐）。

3. 使用共享文件。这种方式通过监听文件的变化来实现，不过效率不理想（不推荐）。

4. 使用订阅发布，响应式数据库。通过 Redis 这些数据库，并利用它们的特性进行多进程通信

### 两个线程可以直接通信吗

1. 什么时候需要通信

- 多个线程并发执行时, 在默认情况下 CPU 是随机切换线程的
- 如果我们希望他们有规律的执行, 就可以使用通信, 例如每个线程执行一次打印

2. 怎么通信

- 如果希望线程等待, 就调用 wait()
- 如果希望唤醒等待的线程, 就调用 notify();
- 这两个方法必须在同步代码中执行, 并且使用同步锁对象来调用

### node 是真的单线程的吗？

Node 中最核心的是 v8 引擎，在 Node 启动后，会创建 v8 的实例，这个实例是多线程的。

- 主线程：编译、执行代码。
- 编译/优化线程：在主线程执行的时候，可以优化代码。
- 分析器线程：记录分析代码运行时间，为 Crankshaft 优化代码执行提供依据。
- 垃圾回收的几个线程。

所以大家常说的 Node 是单线程的指的是 JavaScript 的执行是单线程的(开发者编写的代码运行在单线程环境中)，但 Javascript 的宿主环境，无论是 Node 还是浏览器都是多线程的。 因为 libuv 中有线程池的概念存在的，libuv 会通过类似线程池的实现来模拟不同操作系统的异步调用，这对开发者来说是不可见的。

为什么需要使用线程池？
文件 IO、DNS、CPU 密集型不适合在 Node.js 主线程处理，需要把这些任务放到子线程处理。

### nginx 负载均衡配置

### 业务线如何用端口号区分(nginx http-proxy)

### 看你简历有提到 nginx 配置,主要配置了什么

### ##### Session 认证流程：

- 用户登录，服务器根据用户信息，创建对应的 Session
- 服务器返回 SessionID 返回给客户端，写入到 Cookie
- 浏览器接收到服务器返回的 SessionID 信息后，会将此信息存入到 Cookie 中，同时 Cookie 记录此 SessionID 属于哪个域名
- 当用户第二次访问服务器的时候，请求会自动判断此域名下是否存在 Cookie 信息，如果存在自动将 Cookie 信息也发送给服务端，服务端会从 Cookie 中获取 SessionID，再根据 SessionID 查找对应的 Session 信息，如果没有找到说明用户没有登录或者登录失效，如果找到 Session 证明用户已经登录可执行后面操作。

#### 缺点

服务端存储每个用户的 session，当用户很多时，需要大量的资源

不能很好解决跨域资源共享问题

### 说下 jwt

**JSON Web Token（简称 JWT）是目前最流行的跨域认证解决方案。是一种认证授权机制。**
JWT 是为了在网络应用环境间传递声明而执行的一种基于 JSON 的开放标准（RFC 7519）。JWT 的声明一般被用来在身份提供者和服务提供者间传递被认证的用户身份信息，以便于从资源服务器获取资源。比如用在用户登录上。
可以使用 HMAC 算法或者是 RSA 的公/私秘钥对 JWT 进行签名。因为数字签名的存在，这些传递的信息是可信的。

JSON Web Token（缩写 JWT）是目前最流行的跨域认证解决方案,**JWT 的原理是，服务器认证以后，生成一个 JSON 对象，发回给用户**，就像下面这样。

{
"姓名": "张三",
"角色": "管理员",
"到期时间": "2018 年 7 月 1 日 0 点 0 分"
}
**以后，用户与服务端通信的时候，都要发回这个 JSON 对象。服务器完全只靠这个对象认定用户身份。为了防止用户篡改数据，服务器在生成这个对象的时候，会加上签名**（详见后文）。

服务器就不保存任何 session 数据了，也就是说，服务器变成无状态了，从而比较容易实现扩展。

它是一个很长的字符串，中间用点（.）分隔成三个部分。注意，JWT 内部是没有换行的，这里只是为了便于展示，将它写成了几行。

JWT 的三个部分依次如下。

Header（头部）
Payload（负载）
Signature（签名）

#### jwt 优点

1. 可扩展性好

应用程序分布式部署的情况下，session 需要做多机数据共享，通常可以存在数据库或者 redis 里面。而 jwt 不需要。

2. 无状态

jwt 不在服务端存储任何状态。RESTful API 的原则之一是无状态，发出请求时，总会返回带有参数的响应，不会产生附加影响。

用户的认证状态引入这种附加影响，这破坏了这一原则。另外 jwt 的载荷中可以存储一些常用信息，用于交换信息，有效地使用 JWT，可以降低服务器查询数据库的次数。

### 知道 jwt 有哪些缺点吗

1. 安全性

由于 jwt 的 payload 是使用 base64 编码的，并没有加密，因此 jwt 中不能存储敏感数据。而 session 的信息是存在服务端的，相对来说更安全。

2. 性能

jwt 太长。

由于是无状态使用 JWT，所有的数据都被放到 JWT 里，如果还要进行一些数据交换，那载荷会更大，经过编码之后导致 jwt 非常长，cookie 的限制大小一般是 4k，cookie 很可能放不下；

所以 jwt 一般放在 local storage 里面。

并且用户在系统中的每一次 http 请求都会把 jwt 携带在 Header 里面，http 请求的 Header 可能比 Body 还要大。

而 sessionId 只是很短的一个字符串，因此使用 jwt 的 http 请求比使用 session 的开销大得多。

3. 一次性

无状态是 jwt 的特点，但也导致了这个问题，jwt 是一次性的。想修改里面的内容，就必须签发一个新的 jwt。

1）无法废弃

通过上面 jwt 的验证机制可以看出来，一旦签发一个 jwt，在到期之前就会始终有效，无法中途废弃。

例如你在 payload 中存储了一些信息，当信息需要更新时，则重新签发一个 jwt，但是由于旧的 jwt 还没过期，拿着这个旧的 jwt 依旧可以登录，那登录后服务端从 jwt 中拿到的信息就是过时的。

为了解决这个问题，我们就需要在服务端部署额外的逻辑，例如设置一个黑名单，一旦签发了新的 jwt，那么旧的就加入黑名单（比如存到 redis 里面），避免被再次使用。

2）续签

如果你使用 jwt 做会话管理，传统的 cookie 续签方案一般都是框架自带的，session 有效期 30 分钟，30 分钟内如果有访问，有效期被刷新至 30 分钟。

一样的道理，要改变 jwt 的有效时间，就要签发新的 jwt。最简单的一种方式是每次请求刷新 jwt，即每个 http 请求都返回一个新的 jwt。

这个方法不仅暴力不优雅，而且每次请求都要做 jwt 的加密解密，会带来性能问题。

另一种方法是在 redis 中单独为每个 jwt 设置过期时间，每次访问时刷新 jwt 的过期时间。

#### 适合使用 jwt 的场景：

有效期短
只希望被使用一次
<<<<<<< HEAD
**模糊的知识点: process cluster stream buffer**

## 关于字符编码

ASCII：编码的规范标准

Unicode：将全世界所有的字符包含在一个集合里，计算机只要支持这一个字符集，就能显示所有的字符，再也不会有乱码了。Unicode 码是 ASCII 码的一个超集(superset)

UTF-32 UTF-8 UTF-16 都是 Unicode 码的编码形式

1. UTF-32：用固定长度的四个字节来表示每个码点

2. UTF-8：**用可变长度**的字节来表示每个码点,如果只需要一个字节就能表示的,就用一个字节,一个不够,就用两个…所以,在 UTF-8 编码下,一个字符有可能由 1-4 个字节组成.

3. UTF-16：结合了固定长度和可变长度,它只有两个字节和四个字节两种方式来表示码点

## npm install 的执行过程

npm 模块安装机制

1. npm install 执行之后, 首先会**检查和获取 npm 的配置**,这里的优先级为:
   项目级的.npmrc 文件 > 用户级的 .npmrc 文件 > 全局级的 .npmrc > npm 内置的 .npmrc 文件
2. 然后**检查项目中是否有 package-lock.json 文件**

   - 如果有, 检查 package-lock.json 和 package.json 声明的依赖是否一致：

     - 一致, 直接使用 package-lock.json 中的信息,从网络或者缓存中加载依赖
     - 不一致, 根据 npm 的不同版本进行处理

       - npm 5.0.x 根据 package-lock.json 下载

       - npm 5.1.0 -npm 5.4.2, 当 package.json 声明的依赖版本规范有符合的更新版本时，会忽略 package-lock.json,按照 package.json 安装，并更新 package-lock.json
       - npm 5.4.2 以上，当 package.json 声明的依赖版本与 package.lock.json 安装版本兼容时，则根据 package.lock.json 安装，否则根据 package.json 安装依赖，并更新 package-lock.json

   - 如果没有, 那么会**根据 package.json 递归构建依赖树,然后就会根据构建好的依赖去下载完整的依赖资源,在下载的时候,会检查有没有相关的资源缓存**:

     - 存在, 直接解压到 node_modules 文件中
     - 不存在, 从 npm 远端仓库下载包,校验包的完整性,同时添加到缓存中,解压到 node_modules 中

3. 最后, **生成 package-lock.json 文件**

## yarn 安装机制

1. 检测包
   这一步，最主要的目的就是**检测我们的项目中是否存在 npm 相关的文件**,比如 package-lock.json 等;
   如果有,就会有相关的提示用户注意：这些文件可能会存在冲突。在这一步骤中 也会检测系统 OS, CPU 等信息。
2. 解析包
   这一步会**解析依赖树中的每一个包的信息**:
   首先呢,获取到首层依赖: 也就是我们当前所处的项目中的 package.json 定义的 dependencies、devDependencies、optionalDependencies 的内容。
   紧接着会采用**遍历首层依赖的方式来获取包的依赖信息,以及递归查找每个依赖下嵌套依赖的版本信息，并将解析过的包和正在进行解析包呢用 Set 数据结构进行存储,这样就可以保证同一版本范围内的包不会进行重复的解析**:

   举个例子

   - 对于没有解析过的包 A, 首次尝试从 yarn.lock 中获取版本信息,并且标记为已解析
   - 如果在 yarn.lock 中没有找到包 A， 则向 Registry 发起请求获取满足版本范围内的已知的最高版本的包信息,获取之后将该包标记为已解析。

总之，经过解析包这一步之后呢,我们就已经**确定了解析包的具体版本信息和包的下载地址**。

3. 获取包
   1. 创建缓存目录
   2. 解析下载地址
   3. 判断是否为本地资源
      - 是本地资源，从本地加载资源
      - 不是本地资源，从外部获取资源
   4. 写入缓存目录
   5. 更新 lockfiles
4. 链接包
   1. 解析 peerDependencies，
      - 有冲突，warning
   2. 扁平化依赖树
   3. 执行拷贝任务
   4. 拷贝到 项目目录的 node modules
5. 构建包
   如果依赖包中存在二进制包需要进行编译，那么会在这一步进行。

## node 中如何设置模块导入的路径别名

安装模块：module-alias
在 package.json 中配置：

```json
// Aliases
"_moduleAliases": {
  "@root"      : ".", // Application's root
  "@deep"      : "src/some/very/deep/directory/or/file",
  "@my_module" : "lib/some-file.js",
  "something"  : "src/foo", // Or without @. Actually, it could be any string
}
```

### module-alias 原理介绍

module-alias 通过覆写了全局对象 Module 上的方法\_resolveFilename 来实现路径别名的转换，简单来说就是通过拦截原生的\_resolveFilename 方法调用，进行路径别名的转换，当获取到文件的真实路径后，再调用原生的\_resolveFilename 方法。

## Node.js EventEmitter

**EventEmitter 事件派发器 是 Node. js 中一个实现观察者模式的类，主要功能是订阅和发布消息**，用于解决多模块交互而产生的模块之间的耦合问题.

1. Node.js 所有的异步 I/O 操作在完成时都会发送一个事件到事件队列。

2. Node.js 里面的许多对象都会分发事件：一个 net.Server 对象会在每次有新连接时触发一个事件， 一个 fs.readStream 对象会在文件被打开的时候触发一个事件。 所有这些产生事件的对象都是 events.EventEmitter 的实例。

3. EventEmitter 类: events 模块只提供了一个对象： events.EventEmitter。**EventEmitter 的核心就是事件触发与事件监听器功能的封装。**
4. **大多数时候我们不会直接使用 EventEmitter，而是在对象中继承它**。包括 fs、net、 http 在内的，只要是支持事件响应的核心模块都是 EventEmitter 的子类。

你可以通过 require("events");来访问该模块。

```js
// 引入 events 模块
var events = require("events");
// 创建 eventEmitter 对象
var eventEmitter = new events.EventEmitter();
```

EventEmitter 对象如果在实例化时发生错误，会触发 error 事件。当添加新的监听器时，newListener 事件会触发，当监听器被移除时，removeListener 事件被触发。

1. api
   1. addListener(event, listener)
   2. on(event, listener)
   3. emit(event, [arg1], [arg2], [...])
   4. once(event, listener)
   5. removeListener(event, listener)
   6. removeAllListeners([event])
   7. setMaxListeners(n)
   8. listeners(event)
   9. listenerCount(emitter, event)
2. 事件
   1. newListener
   2. removeListener
   3. error

### 介绍下 stream

流是基于事件的 API，用于管理和处理数据。

- 流是能够读写的
- 是基于事件实现的一个实例
- 可以看做是一个管道，从一端流向另一端

### 使用流有什么好处？

流是非阻塞式数据处理模式，可以提升效率，节省内存，有助于处理管道且可扩展等。

### 流有哪些典型应用？

流在文件读写、网络请求、数据转换、音频、视频等方面有很广泛的应用。

### 如何捕获流的错误事件？

监听 error 事件，方法与订阅 EventEmitter 的 error 事件相似。

### 流的类型

1. Writable: 可以写入数据的流（例如，fs.createWriteStream()）。
2. Readable: 可以从中读取数据的流（例如，fs.createReadStream()）。
3. Duplex: Readable 和 Writable 的流（例如，net.Socket）。
4. Transform: 可以在写入和读取数据时修改或转换数据的 Duplex 流（例如，zlib.createDeflate()）。

### 如何读取 JSON 配置文件？

主要有两种方式。

1. 第一种是利用 Node. js 内置的 require（ data.json！）机制，直接得到 Javascript 对象；

2. 第二种是读入文件内容，然后用 JSON. parse（ content）转换成 JavaScript 对象。

3. 二者的区别是，对于第一种方式，如果多个模块都加载了同一个 JSON 文件，那么**其中一个改变了 JavaScript 对象，其他也跟着改变，这是由 Node.js 模块的缓存机制造成的，缓存中只有一个 JavaScript 模块对象**；

4. 第二种方式则可以随意改变加载后的 JavaScript 变量，而且各模块互不影响，因为它们都是独立的，存储的是多个 JavaScript 对象

## Redis

https://blog.csdn.net/weixin_45301250/article/details/119336415

是一个高性能的 **key-value** 数据库,支持数据的**持久化**，可以将内存中的数据保存在磁盘中，重启的时候可以再次加载进行使用。Redis 不仅仅支持简单的 key-value 类型的数据，同时还提供 string，list，set，sorted set，hash 等数据结构的存储。Redis 支持数据的备份，即 **master-slave** 模式的数据备份。

#### 优点

(1) 速度快，因为数据存在内存中，类似于 HashMap，HashMap 的优势就是查找和操作的时间复杂度都是 O(1)

(2) 支持丰富数据类型，支持 string，list，set，sorted set，hash

(3) 支持事务，操作都是原子性，所谓的原子性就是对数据的更改要么全部执行，要么全部不执行

(4) 丰富的特性：可用于缓存，消息，按 key 设置过期时间，过期后将会自动删除

#### 使用场景

① 缓存；② 排行榜系统；③ 计数器系统；④ 社交网络；⑤ 消息队列系统。

#### Redis 不可以做的事：

1. 数据规模角度看，Redis 不支持大规模数据（每天有几亿用户行为），只支持小规模数据；

2. 数据冷热角度看，Redis 支持热数据，例如对视频网站而言，视频信息属于热数据，用户观看记录为冷数据。

## mongodb 和 mysql 的区别

MySQL 是关系型数据库。
优势：在不同的引擎上有不同 的存储方式。
查询语句是使用传统的 sql 语句，拥有较为成熟的体系，成熟度很高。
开源数据库的份额在不断增加，mysql 的份额页在持续增长。
缺点：
在海量数据处理的时候效率会显著变慢。
Mongodb **是非关系型数据库(nosql),属于文档型数据库。文档是 mongoDB 中数据的基本单元**，类似关系数据库的行，多个键值对有序地放置在一起便是文档，语法有点类似
javascript 面向对象的查询语言，它是一个面向集合的，模式自由的文档型数据库。
存储方式：虚拟内存+持久化。
查询语句：是独特的 Mongodb 的查询方式。
适合场景：事件的记录，内容管理或者博客平台等等。
架构特点：可以通过副本集，以及分片来实现高可用。
数据处理：**数据是存储在硬盘上的，只不过需要经常读取的数据会被加载到内存中，将数据存储在物理内存中，从而达到高速读写**。
成熟度与广泛度：新兴数据库，成熟度较低，Nosql 数据库中最为接近关系型数据库，
比较完善的 DB 之一，适用人群不断在增长。
优点：
快速！在适量级的内存的 Mongodb 的性能是非常迅速的，它将热数据存储在物理内存中，
使得热数据的读写变得十分快。高扩展性，**存储的数据格式是 json 格式**！
缺点：
不支持事务，而且开发文档不是很完全，完善。

Mysql 和 Mongodb 主要应用场景（简单了解叙述下即可）

1. 如果需要将 mongodb 作为后端 db 来代替 mysql 使用，即这里 mysql 与 mongodb 属于
   平行级别，那么，这样的使用可能有以下几种情况的考量： (1)mongodb 所负责部分以
   文档形式存储，能够有较好的代码亲和性，json 格式的直接写入方便。(如日志之类) (2)
   从 data models 设计阶段就将原子性考虑于其中，无需事务之类的辅助。开发用如 nodejs
   之类的语言来进行开发，对开发比较方便。 (3)mongodb 本身的 failover 机制，无需使
   用如 MHA 之类的方式实现。
2. 将 mongodb 作为类似 redis ，memcache 来做缓存 db，为 mysql 提供服务，或是后端
   日志收集分析。 考虑到 mongodb 属于 nosql 型数据库，sql 语句与数据结构不如 mysql
   那么亲和 ，也会有很多时候将 mongodb 做为辅助 mysql 而使用的类 redis memcache 之
   类的缓存 db 来使用。 亦或是仅作日志收集分析
