[参考链接](https://blog.csdn.net/jasonzds/article/details/87559644)

### API

1. spawn ： 子进程中执行的是**非 node 程序**，提供一组参数后，执行的结果以**流**的形式返回。
2. execFile：子进程中执行的是**非 node 程序**，提供一组参数后，执行的结果以**回调**的形式返回。
3. exec：子进程执行的是**非 node 程序**，**传入一串 shell 命令**，执行后结果以**回调**的形式返回，与 execFile 不同的是 exec 可以直接执行一串 shell 命令。
4. fork：子进程执行的是 node 程序，提供一组参数后，执行的结果以流的形式返回，与 spawn 不同，fork 生成的子进程只能执行 node 应用。

使用 fork 方法，可以在父进程和子进程之间开放一个 IPC 通道，使得不同的 node 进程间可以进行消息通信。

在子进程中：

通过 process.on(‘message’)和 process.send()的机制来接收和发送消息。

```javascript
// child
process.on("message", function (msg) {
  console.log("get a message from parent", msg);
  process.send("child message");
});
```

在父进程中：

通过 child.on(‘message’)和 child.send()的机制来接收和发送消息。

```javascript
// parent.js
const cp = require("child_process");
let child = cp.fork("./child");
child.on("message", function (msg) {
  console.log("got a message is", msg);
});
child.send("parent message");
```

中断父子间通信的方式，可以通过在父进程中调用：
child.disconnect()
