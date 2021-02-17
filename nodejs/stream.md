[原文链接](https://zhuanlan.zhihu.com/p/44809689)

HTTP 响应在客户端中是一个可读流，而在服务端则是一个可写流。毕竟在 HTTP 场景中，我们在客户端侧是从相应对象（http.IncommingMessage）读取数据，而在服务端则是写入数据（http.ServerResponse）。

还需要注意的是，stdio 相应的流（stdin, stdout, stderr）在子进程中与主进程都是相反的流类型。这样一来主进程和子进程直接就可以方便地 pipe stdio 数据了。

在可读流中，几个重要的事件分别是：

1. data 事件，当流中传出一块数据给消费者的时候会触发这个事件；
2. end 事件，当没有更多数据了的时候触发该事件；

在可写流中，几个重要的事件分别是：

1. drain 事件，该事件触发后就表示可写流可以写入数据了；
2. finish 事件，该事件触发后表示数据已经写入到下层系统了。

```javascript
const { Duplex } = require("stream");

const inoutStream = new Duplex({
  write(chunk, encoding, callback) {
    console.log(chunk.toString());
    callback();
  },

  read(size) {
    this.push(String.fromCharCode(this.currentCharCode++));
    if (this.currentCharCode > 90) {
      this.push(null);
    }
  },
});

inoutStream.currentCharCode = 65;

process.stdin.pipe(inoutStream).pipe(process.stdout);
```

糅杂了这些方法后，我们可以用这个双工流去读取 A 到 Z 的字母，然后也可以用做 echo。我们将可读流 stdin 给 pipe 到这个双工流中来进行 echo，然后再将双工流再给连接到可写流 stdout 中，我们就可以看到 A 到 Z 的输出了。

敲黑板，**_重点是我们要理解双工流的读写是完全独立操作的，它只是将可读流和可写流的特征给糅杂到一个对象中_**。

#### 变形金刚流则更有意思了，它的输出是经过计算的自身输入。

对于变形金刚流来说，我们不需要实现 read 或者 write 方法，我们只需要实现 transform 方法就好了——它是一个糅杂方法。它既有 write 方法的特征，又可以在里面 push 数据。

这是一个简单的变形金刚流，它会把流入的数据全部大写化后再输出出来：

```javascript
const { Transform } = require("stream");

const upperCaseTr = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  },
});

process.stdin.pipe(upperCaseTr).pipe(process.stdout);
```

这个变形金刚流中，我们只实现了 transform()。在该方法中，我们将 chunk 给转换成大写字符串，然后将其 push 给自身可读流的部分。

### Node.js 的内置变形金刚流

Node.js 内置了一些很有用的变形金刚流。点一下名，如 zlib 和 crypto。

下面是一个使用 zlib.createGzip 和 fs 的可读/可写流结合起来写的一个文件压缩脚本：

```javascript
const fs = require("fs");
const zlib = require("zlib");
const file = process.argv[2];

fs.createReadStream(file)
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream(file + ".gz"));
```

我们可以使用这个脚本来压缩传入参数中所指明的文件。我们将一个文件的可读流给 pipe 到 zlib 的内置变形金刚流中，然后将其传入可写流中去，这样就出来了一个新的压缩后文件。Easy。

特别腻害的是，我们可以在必要时候为其加上一些事件。例如我想用户看到压缩的进度条，然后在压缩完成的时候看到 “Done” 字样。由于 pipe 方法返回的是目标流，所以我们就可以链式调用，并在期间加上监听：

```javascript
const fs = require("fs");
const zlib = require("zlib");
const file = process.argv[2];

fs.createReadStream(file)
  .pipe(zlib.createGzip())
  .on("data", () => process.stdout.write("."))
  .pipe(fs.createWriteStream(file + ".zz"))
  .on("finish", () => console.log("Done"));
```

虽然跟 pipe 函数一起搞事情的话，我们可以非常方便地消费流，但是我们想要一些额外功能的时候，就需要用到事件了。
