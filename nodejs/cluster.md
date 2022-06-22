[原文](https://blog.csdn.net/u012060033/article/details/102766342)

### 概述

Node.js 默认单进程运行，对于 32 位系统最高可以使用 512MB 内存，对于 64 位最高可以使用 1GB 内存。对于多核 CPU 的计算机来说，这样做效率很低，**因为只有一个核在运行，其他核都在闲置**。cluster 模块就是为了解决这个问题而提出的。

cluster 模块允许设立一个主进程和若干个 worker 进程，由**主进程监控和协调 worker 进程的运行**。

**worker 之间采用进程间通信 IPC 交换消息**，**cluster 模块内置一个负载均衡器，采用 Round-robin 算法协调各个 worker 进程之间的负载**。

运行时，所有新建立的连接都由主进程完成，然后主进程再把 TCP 连接分配给指定的 worker 进程。

### 简单使用

```javascript
const cluster = require("cluster");
const os = require("os");
const http = require("http");
if (cluster.isMaster) {
  for (var i = 0, n = os.cpus().length; i < n; i += 1) {
    cluster.fork();
  }
} else {
  http
    .createServer(function (req, res) {
      res.writeHead(200);
      res.end("hello world\n");
    })
    .listen(8000);
}
```

上面代码先判断当前进程是否为主进程（cluster.isMaster），如果是的，就按照 CPU 的核数，新建若干个 worker 进程；如果不是，说明当前进程是 worker 进程，则在该进程启动一个服务器程序。

上面这段代码有一个缺点，就是一旦 work 进程挂了，主进程无法知道。

为了解决这个问题，可以在主进程部署 online 事件和 exit 事件的监听函数。

```javascript
var cluster = require("cluster");
if (cluster.isMaster) {
  var numWorkers = require("os").cpus().length;
  console.log("Master cluster setting up " + numWorkers + " workers...");
  for (var i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  cluster.on("online", function (worker) {
    console.log("Worker " + worker.process.pid + " is online");
  });
  cluster.on("exit", function (worker, code, signal) {
    console.log(
      "Worker " +
        worker.process.pid +
        " died with code: " +
        code +
        ", and signal: " +
        signal
    );
    console.log("Starting a new worker");
    cluster.fork();
  });
}
```

### api

#### cluster

1. isMaster 属性返回一个布尔值，表示当前进程是否为主进程。这个属性由 process.env.NODE_UNIQUE_ID 决定，如果 process.env.NODE_UNIQUE_ID 为未定义，就表示该进程是主进程。
2. isWorker 属性返回一个布尔值，表示当前进程是否为 work 进程。

3. fork()
   fork 方法用于新建一个 worker 进程，上下文都复制主进程。只有主进程才能调用这个方法。该方法返回一个 worker 对象。
4. kill()
   kill 方法用于终止 worker 进程。它可以接受一个参数，表示系统信号。
   如果当前是主进程，就会终止与 worker.process 的联络，然后将系统信号法发向 worker 进程。
   如果当前是 worker 进程，就会终止与主进程的通信，然后退出，返回 0。
5. listening 事件
   从工作进程调用 listen() 后，当服务器上触发 'listening' 事件时，则主进程中的 cluster 也将触发 'listening' 事件。
   事件句柄使用两个参数执行，worker 包含工作进程对象，address 对象包含以下连接属性：address、port 和 addressType。 如果工作进程正在监听多个地址，则这将非常有用。

```js
cluster.on("listening", function (worker, address) {
  console.log(
    "A worker is now connected to " + address.address + ":" + address.port
  );
});
```

6. message 事件
   当集群主进程接收到来自任何工作进程的消息时触发。

#### worker 对象

worker 对象是 cluster.fork()的返回值，代表一个 worker 进程。
它的属性和方法如下

1. id
   进程编号。这个编号也是 cluster.workers 中指向当前进程的索引值。
2. process
   所有的 worker 进程都是用 child_process.fork()生成的。child_process.fork()返回的对象，就被保存在 worker.process 之中。通过这个属性，可以获取 worker 所在的进程对象
3. worker.send()
   该方法用于在主进程中，向子进程发送信息。

```javascript
if (cluster.isMaster) {
  var worker = cluster.fork();
  worker.send("hi there"); // 在主进程中，向子进程发送信息
} else if (cluster.isWorker) {
  process.on("message", function (msg) {
    process.send(msg); // 子进程向主进程发送消息
  });
}
```

上面代码的作用是，worker 进程对主进程发出的每个消息，都做回声。
在 worker 进程中，要向主进程发送消息，使用 process.send(message)；发出的消息可以字符串，也可以是 JSON 对象。要监听主进程发出的消息，使用下面的代码。

```javascript
process.on("message", function (message) {
  console.log(message);
});
```

4. listening 事件
   类似于 cluster.on('listening') 事件，但特定于此工作进程。

```js
cluster.fork().on("listening", (address) => {
  // 工作进程正在监听
});
```

4. message 事件
   类似于 cluster 的 'message' 事件，但特定于此工作线程。

在工作进程中，也可以使用 process.on('message')。

5. 'exit' 事件
   回调参数
   code <number> 如果其正常退出，则为退出码。
   signal <string> 造成进程被终止的信号的名称（例如 'SIGHUP'）。
   类似于 cluster.on('exit') 事件，但特定于此工作进程。

#### cluster.workers 对象

该对象只有主进程才有，包含了所有 worker 进程。每个成员的键值就是一个 worker 进程对象，键名就是该 worker 进程的 worker.id 属性。

```javascript
function eachWorker(callback) {
  for (var id in cluster.workers) {
    callback(cluster.workers[id]);
  }
}
eachWorker(function (worker) {
  worker.send("big announcement to all workers");
});
```

上面代码用来遍历所有 worker 进程。
当前 socket 的 data 事件，也可以用 id 属性识别 worker 进程。

```javascript
socket.on("data", function (id) {
  var worker = cluster.workers[id];
});
```

### 不中断地重启 Node 服务

重启服务需要关闭后再启动，利用 cluster 模块，可以做到先启动一个 worker 进程，再把原有的所有 work 进程关闭。这样就能实现不中断地重启 Node 服务。
首先，主进程向 worker 进程发出重启信号。

```javascript
workers[wid].send({ type: "shutdown", from: "master" });

process.on("message", function (message) {
  if (message.type === "shutdown") {
    process.exit(0);
  }
});

//下面是一个关闭所有worker进程的函数。

function restartWorkers() {
  var wid,
    workerIds = [];
  for (wid in cluster.workers) {
    workerIds.push(wid);
  }
  workerIds.forEach(function (wid) {
    cluster.workers[wid].send({
      text: "shutdown",
      from: "master",
    });
    setTimeout(function () {
      if (cluster.workers[wid]) {
        cluster.workers[wid].kill("SIGKILL");
      }
    }, 5000);
  });
}
```

下面是一个完整的实例，先是主进程的代码 master.js。

```javascript
var cluster = require("cluster");
console.log("started master with " + process.pid);
// 新建一个worker进程
cluster.fork();

process.on("SIGHUP", function () {
  console.log("Reloading...");
  var new_worker = cluster.fork();
  new_worker.once("listening", function () {
    // 关闭所有其他worker进程
    for (var id in cluster.workers) {
      if (id === new_worker.id.toString()) continue;
      cluster.workers[id].kill("SIGTERM");
    }
  });
});
```

上面代码中，主进程监听 SIGHUP 事件，如果发生该事件就关闭其他所有 worker 进程。之所以是 SIGHUP 事件，是因为 nginx 服务器监听到这个信号，会创造一个新的 worker 进程，重新加载配置文件。另外，关闭 worker 进程时，主进程发送 SIGTERM 信号，这是因为 Node 允许多个 worker 进程监听同一个端口。
下面是 worker 进程的代码 server.js。

```javascript
var cluster = require("cluster");
if (cluster.isMaster) {
  require("./master");
  return;
}
var express = require("express");
var http = require("http");
var app = express();

app.get("/", function (req, res) {
  res.send("ha fsdgfds gfds gfd!");
});

http.createServer(app).listen(8080, function () {
  console.log("http://localhost:8080");
});
```

使用时代码如下。

```sh
$ node server.js
started master with 10538
http://localhost:8080
```

然后，向主进程连续发出两次 SIGHUP 信号。

```shell
$ kill -SIGHUP 10538
$ kill -SIGHUP 10538
```

主进程会连续两次新建一个 worker 进程，然后关闭所有其他 worker 进程，显示如下。

```sh
Reloading...
http://localhost:8080
Reloading...
http://localhost:8080
```

最后，向主进程发出 SIGTERM 信号，关闭主进程。

```shell
$ kill 10538
```

### pm2

PM2 模块是 cluster 模块的一个包装层。它的作用是尽量将 cluster 模块抽象掉，让用户像使用单进程一样，部署多进程 Node 应用。

```javascript
// app.js
var http = require("http");
http
  .createServer(function (req, res) {
    res.writeHead(200);
    res.end("hello world");
  })
  .listen(8080);
```

上面代码是标准的 Node 架设 Web 服务器的方式，然后用 PM2 从命令行启动这段代码。

```sh
$ pm2 start app.js -i 4
```

上面代码的 i 参数告诉 PM2，这段代码应该在 cluster_mode 启动，且新建 worker 进程的数量是 4 个。
如果 i 参数的值是 0，那么当前机器有几个 CPU 内核，PM2 就会启动几个 worker 进程。
如果一个 worker 进程由于某种原因挂掉了，会立刻重启该 worker 进程。

### pm2 reload

重启所有 worker 进程

```sh
$ pm2 reload all
```

每个 worker 进程都有一个 id，可以用下面的命令查看单个 worker 进程的详情。

```sh
$ pm2 show <worker id>
```

正确情况下，PM2 采用 fork 模式新建 worker 进程，即主进程 fork 自身，产生一个 worker 进程。
**pm2 reload 命令则会用 spawn 方式启动，即一个接一个启动 worker 进程，一个新的 worker 启动成功，再杀死一个旧的 worker 进程**。
采用这种方式，重新部署新版本时，服务器就不会中断服务。

```sh
$ pm2 reload <脚本文件名>
```

关闭 worker 进程的时候，可以部署下面的代码，让 worker 进程监听 shutdown 消息。一旦收到这个消息，进行完毕收尾清理工作再关闭。

```javascript
process.on("message", function (msg) {
  if (msg === "shutdown") {
    close_all_connections();
    delete_logs();
    server.close();
    process.exit(0);
  }
});
```

#### pm2 restart

restart 与 reload 字面意思翻译过来为’重启‘ 和 ’重载‘，区别在于 restart 为’冷启动‘，reload 为’热启动‘，一个需要进程先停止再启动，另一个则保持进程在运行状态下完全’刷新‘ 自身数据，reload 的好处是可以减少’重启‘等待时间。

## 参考文档

http://nodejs.cn/api/cluster.html#cluster_event_online

[从 pm2 看 node 多进程管理(一)：进程创建](https://zhuanlan.zhihu.com/p/301501874)
[从 pm2 看 node 多进程管理(二)：进程中止与重启](https://zhuanlan.zhihu.com/p/330230119)
