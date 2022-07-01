Node.js 主线程是单线程的，如果我们使用 node app.js 方式运行，就启动了一个进程，只能在一个 CPU 中进行运算，无法应用服务器的多核 CPU，因此我们需要寻求一些解决方案。你能想到的解决方案肯定是多进程分发策略，即主进程接收所有请求，然后通过一定的负载均衡策略分发到不同的 Node.js 子进程中。
这一方案有 2 个不同的实现：

1. 主进程监听一个端口，子进程不监听端口，通过主进程分发请求到子进程；

2. 主进程和子进程分别监听不同端口，通过主进程分发请求到子进程。

在 Node.js 中的 cluster 模式使用的是第一个实现。

## cluster 模式

cluster 模式其实就是我们上面图 1 所介绍的模式，一个主进程和多个子进程，从而形成一个集群的概念。我们先来看看 cluster 模式的应用例子。

### 应用

我们先实现一个简单的 app.js，代码如下：

```js
const http = require("http");

const server = http.createServer((req, res) => {
  res.write(`hello world, start with cluster ${process.pid}`);
  res.end();
});

server.listen(3000, () => {
  console.log("server start http://127.0.0.1:3000");
});
console.log(`Worker ${process.pid} started`);
```

这是最简单的一个 Node.js 服务，接下来我们应用 cluster 模式来包装这个服务，代码如下：

```js
const cluster = require("cluster");
const instances = 2; // 启动进程数量
if (cluster.isMaster) {
  for (let i = 0; i < instances; i++) {
    // 使用 cluster.fork 创建子进程
    cluster.fork();
  }
} else {
  require("./app.js");
}
```

- 首先判断是否为主进程：

- 如果是则使用 cluster.fork 创建子进程；

- 如果不是则为子进程 require 具体的 app.js。

然后运行下面命令启动服务。

```bash
$ node cluster.js
# 启动成功后，再打开另外一个命令行窗口，多次运行以下命令：
curl "http://127.0.0.1:3000/"
# 你可以看到如下输出：
hello world, start with cluster 4543
hello world, start with cluster 4542
hello world, start with cluster 4543
hello world, start with cluster 4542
```

后面的进程 ID 是比较有规律的随机数，有时候输出 4543，有时候输出 4542，4543 和 4542 就是我们 fork 出来的两个子进程，接下来我们看下为什么是这样的。

### 原理

首先我们需要搞清楚两个问题：

1. Node.js 的 cluster 是如何做到多个进程监听一个端口的；

2. Node.js 是如何进行负载均衡请求分发的。

#### 多进程端口问题

在 cluster 模式中存在 master 和 worker 的概念，master 就是主进程，worker 则是子进程，因此这里我们需要看下 master 进程和 worker 进程的创建方式。如下代码所示：

```js
const cluster = require("cluster");
const instances = 2; // 启动进程数量
if (cluster.isMaster) {
  for (let i = 0; i < instances; i++) {
    // 使用 cluster.fork 创建子进程
    cluster.fork();
  }
} else {
  require("./app.js");
}
```

这段代码中，第一次 require 的 cluster 对象就默认是一个 master，这里的判断逻辑在源码中，如下代码所示：

```js
"use strict";
const childOrPrimary = "NODE_UNIQUE_ID" in process.env ? "child" : "primary";
module.exports = require(`internal/cluster/${childOrPrimary}`);
```

通过**进程环境变量**设置来判断：

- 如果没有设置则为 master 进程；

- 如果有设置则为子进程。

**因此第一次调用 cluster 模块是 master 进程，而后都是子进程**。

主进程和子进程 require 文件不同：

- 前者是 internal/cluster/primary；

- 后者是 internal/cluster/child。

我们先来看下 master 进程的创建过程，这部分代码在这里。

可以看到 cluster.fork，一开始就会调用 setupPrimary 方法，创建主进程，由于该方法是通过 cluster.fork 调用，因此会调用多次，但是**该模块有个全局变量 initialized 用来区分是否为首次，如果是首次则创建，否则则跳过**，如下代码：

```js
if (initialized === true) return process.nextTick(setupSettingsNT, settings);
initialized = true;
```

接下来继续看 cluster.fork 方法，源码如下：

```js
cluster.fork = function (env) {
  cluster.setupPrimary(); // setupPrimary判断是否为首次调用，是则创建主进程，否则跳过
  const id = ++ids;
  const workerProcess = createWorkerProcess(id, env); // 创建 worker 子进程，在这个 createWorkerProcess 方法中，最终是使用 child_process 来创建子进程的
  const worker = new Worker({
    id: id,
    process: workerProcess,
  });

  worker.on("message", function (message, handle) {
    cluster.emit("message", this, message, handle);
  });
};
```

在初始化代码中，我们调用了两次 cluster.fork 方法，因此会创建 2 个子进程，在创建后又会调用我们项目根目录下的 cluster.js 启动一个新实例，这时候由于 cluster.isMaster 是 false，因此会 require 到 internal/cluster/child 这个方法。

由于是 worker 进程，因此代码会 require ('./app.js') 模块，在该模块中会 server.listen 监听具体的端口

#### listen.server

会调用该模块中的 listenInCluster 方法，该方法中有一个关键信息，如下代码所示：

```js
if (cluster.isPrimary || exclusive) {
  // Will create a new handle
  // _listen2 sets up the listened handle, it is still named like this
  // to avoid breaking code that wraps this method
  server._listen2(address, port, addressType, backlog, fd, flags);
  return;
}

const serverQuery = {
  address: address,
  port: port,
  addressType: addressType,
  fd: fd,
  flags,
};

// Get the primary's server handle, and listen on it
cluster._getServer(server, serverQuery, listenOnPrimaryHandle);
```

上面代码中的第 6 行，判断为主进程，就是真实的监听端口启动服务，而如果非主进程则调用 cluster.\_getServer 方法，也就是 internal/cluster/child 中的 cluster.\_getServer 方法。

接下来我们看下这部分代码：

```js
obj.once("listening", () => {
  cluster.worker.state = "listening";
  const address = obj.address();
  message.act = "listening";
  message.port = (address && address.port) || options.port;
  send(message);
});
```

这一代码通过 send 方法，如果监听到 listening 发送一个消息给到主进程，主进程也有一个同样的 listening 事件，监听到该事件后将子进程通过 EventEmitter 绑定在主进程上，这样就完成了主子进程之间的关联绑定，并且只监听了一个端口。而主子进程之间的通信方式，就是我们常听到的 **IPC 通信方式**。

#### 负载均衡原理

既然 Node.js cluster 模块使用的是主子进程方式，那么它是如何进行负载均衡处理的呢，这里就会涉及 Node.js cluster 模块中的两个模块。

- round_robin_handle.js（非 Windows 平台应用模式），这是一个轮询处理模式，也就是**轮询调度分发给空闲的子进程，处理完成后回到 worker 空闲池子中**，这里要注意的就是如果绑定过就会复用该子进程，如果没有则会重新判断，这里可以通过上面的 app.js 代码来测试，用浏览器去访问，你会发现每次调用的子进程 ID 都会不变。

- shared_handle.js（ Windows 平台应用模式），**通过将文件描述符、端口等信息传递给子进程，子进程通过信息创建相应的 SocketHandle / ServerHandle，然后进行相应的端口绑定和监听、处理请求**。

#### 如果多个 Node 进程监听同一个端口时会出现 Error:listen EADDRIUNS 的错误，而 cluster 模块为什么可以让多个子进程监听同一个端口呢?

原因是 master 进程内部启动了一个 TCP 服务器，而真正监听端口的只有这个服务器，当来自前端的请求触发服务器的 connection 事件后，master 会将对应的 socket 句柄发送给子进程。

### 总结

以上就是 cluster 的原理，总结一下就是**cluster 模块应用 child_process 来创建子进程，子进程通过复写掉 cluster.\_getServer 方法，从而在 server.listen 来保证只有主进程监听端口，主子进程通过 IPC 进行通信，其次主进程根据平台或者协议不同，应用两种不同模块（round_robin_handle.js 和 shared_handle.js）进行请求分发给子进程处理。**

## pm2 原理

### 进程创建管理的原理

![PM2 源码多进程创建方式](./pm2%20%E6%BA%90%E7%A0%81%E5%A4%9A%E8%BF%9B%E7%A8%8B%E5%88%9B%E5%BB%BA.png)

这一方式涉及五个模块文件。

1. CLI（lib/binaries/CLI.js）**处理命令行输入**
2. API（lib/API.js）**对外暴露的各种命令行调用方法**，比如上面的 start 命令对应的 API->start 方法。

3. Client （lib/Client.js）可以理解为**命令行接收端，负责创建守护进程 Daemon，并与 Daemon（lib/Daemon.js）保持 RPC 连接**。

4. God （lib/God.js）主要**负责进程的创建和管理**，主要是通过 Daemon 调用，Client 所有调用都是通过 RPC 调用 Daemon，然后 Daemon 调用 God 中的方法。

5. 最终在 God 中调用 ClusterMode（lib/God/ClusterMode.js）模块，**在 ClusterMode 中调用 Node.js 的 cluster.fork 创建子进程。**

client-(RPC)->Daemon-->God.clusterMode-->cluster.fork

- 图中首先通过命令行解析调用 API，API 中的方法基本上是与 CLI 中的命令行一一对应的，API 中的 start 方法会根据传入参数判断是否是调用的方法，一般情况下使用的都是一个 JSON 配置文件，因此调用 API 中的私有方法 \_startJson。

- 接下来就开始在 Client 模块中流转了，在 \_startJson 中会调用 executeRemote 方法，该方法会先判断 PM2 的守护进程 Daemon 是否启动，如果没有启动会先调用 Daemon 模块中的方法启动守护进程 RPC 服务，启动成功后再通知 Client 并建立 RPC 通信连接。

- 成功建立连接后，Client 会发送启动 Node.js 子进程的命令 prepare，该命令传递 Daemon，Daemon 中有一份对应的命令的执行方法，该命令最终会调用 God 中的 prepare 方法。

- 在 God 中最终会调用 God 文件夹下的 ClusterMode 模块，应用 Node.js 的 cluster.fork 创建子进程，这样就完成了整个启动过程。

综上所述，**PM2 通过命令行，使用 RPC 建立 Client 与 Daemon 进程之间的通信，通过 RPC 通信方式，调用 God，从而应用 Node.js 的 cluster.fork 创建子进程的**

[https://zhuanlan.zhihu.com/p/77733656](https://zhuanlan.zhihu.com/p/77733656)

