[原文链接](https://zhuanlan.zhihu.com/p/44809689)
https://www.jianshu.com/p/bfd5abc106ed

### 理解流

流是基于事件的 API，用于管理和处理数据。

- 流是能够读写的
- 是基于事件实现的一个实例

理解流的最好方式就是想象一下没有流的时候怎么处理数据：

- fs.readFileSync 同步读取文件，程序会阻塞，所有数据被读到内存
- fs.readFile 阻止程序阻塞，但仍会将文件所有数据读取到内存中
- 希望少内存读取大文件，读取一个数据块到内存处理完再去索取更多的数据

HTTP 响应在客户端中是一个可读流，而在服务端则是一个可写流。毕竟在 HTTP 场景中，我们在客户端侧是从相应对象（http.IncommingMessage）读取数据，而在服务端则是写入数据（http.ServerResponse）。

还需要注意的是，stdio 相应的流（stdin, stdout, stderr）在子进程中与主进程都是相反的流类型。这样一来主进程和子进程直接就可以方便地 pipe stdio 数据了。

### 流的类型

1. Writable: 可以写入数据的流（例如，fs.createWriteStream()）。
2. Readable: 可以从中读取数据的流（例如，fs.createReadStream()）。
3. Duplex: Readable 和 Writable 的流（例如，net.Socket）。
4. Transform: 可以在写入和读取数据时修改或转换数据的 Duplex 流（例如，zlib.createDeflate()）。

### 事件

在可读流中，几个重要的事件分别是：

1. data 事件，当流中传出一块数据给消费者的时候会触发这个事件；
2. end 事件，当没有更多数据了的时候触发该事件；

在可写流中，几个重要的事件分别是：

1. drain 事件，该事件触发后就表示可写流可以写入数据了；
2. finish 事件，该事件触发后表示数据已经写入到下层系统了。

### Readable

创建可读流。

实例：流式消耗迭代器中的数据。

```js
"use strict";
const Readable = require("stream").Readable;

class ToReadable extends Readable {
  constructor(iterable) {
    super();
    this.iterator = new (function* () {
      yield* iterable;
    })();
  }

  // 子类需要实现该方法
  // 这是生产数据的逻辑
  _read() {
    const res = this.iterator.next();
    if (res.done) {
      // 数据源已枯竭，调用`push(null)`通知流
      this.push(null);
    } else {
      // 通过`push`方法将数据添加到流中
      this.push(res.value + "\n");
    }
  }
}

module.exports = ToReadable;
```

实际使用时，new ToReadable(iterable)会返回一个可读流，下游可以流式的消耗迭代器中的数据。

```js
const iterable = (function* (limit) {
  while (limit--) {
    yield Math.random();
  }
})(1e10);

const readable = new ToReadable(iterable);

// 监听`data`事件，一次获取一个数据
readable.on("data", (data) => process.stdout.write(data));

// 所有数据均已读完
readable.on("end", () => process.stdout.write("DONE"));
```

执行上述代码，将会有 100 亿个随机数源源不断地写进标准输出流。

创建可读流时，需要继承 Readable，并实现\_read 方法。

- \_read 方法是从底层系统读取具体数据的逻辑，即生产数据的逻辑。
- 在\_read 方法中，通过调用 push(data)将数据放入可读流中供下游消耗。
- 在\_read 方法中，可以同步调用 push(data)，也可以异步调用。
- 当全部数据都生产出来后，必须调用 push(null)来结束可读流。
- 流一旦结束，便不能再调用 push(data)添加数据。
- 可以通过监听 data 事件的方式消耗可读流。

在首次监听其 data 事件后，readable 便会持续不断地调用\_read()，通过触发 data 事件将数据输出。
第一次 data 事件会在下一个 tick 中触发，所以，可以安全地将数据输出前的逻辑放在事件监听后（同一个 tick 中）。
当数据全部被消耗时，会触发 end 事件。
上面的例子中，process.stdout 代表标准输出流，实际是一个可写流。下小节中介绍可写流的用法。

### Writable

创建可写流。

前面通过继承的方式去创建一类可读流，这种方法也适用于创建一类可写流，只是需要实现的是\_write(data, enc, next)方法，而不是\_read()方法。

有些简单的情况下不需要创建一类流，而只是一个流对象，可以用如下方式去做：

```js
const Writable = require("stream").Writable;

const writable = Writable();
// 实现`_write`方法
// 这是将数据写入底层的逻辑
writable._write = function (data, enc, next) {
  // 将流中的数据写入底层
  process.stdout.write(data.toString().toUpperCase());
  // 写入完成时，调用`next()`方法通知流传入下一个数据
  process.nextTick(next);
};

// 所有数据均已写入底层
writable.on("finish", () => process.stdout.write("DONE"));

// 将一个数据写入流中
writable.write("a" + "\n");
writable.write("b" + "\n");
writable.write("c" + "\n");

// 再无数据写入流时，需要调用`end`方法
writable.end();
```

上游通过调用 writable.write(data)将数据写入可写流中。write()方法会调用\_write()将 data 写入底层。

- 在\_write 中，当数据成功写入底层后，必须调用 next(err)告诉流开始处理下一个数据。
- next 的调用既可以是同步的，也可以是异步的。
- 上游必须调用 writable.end(data)来结束可写流，data 是可选的。此后，不能再调用 write 新增数据。
- 在 end 方法调用后，当所有底层的写操作均完成时，会触发 finish 事件。

### Duplex

创建可读可写流。

Duplex 实际上就是继承了 Readable 和 Writable 的一类流。
所以，一个 Duplex 对象既可当成可读流来使用（需要实现\_read 方法），也可当成可写流来使用（需要实现\_write 方法）。

```js
var Duplex = require("stream").Duplex;

var duplex = Duplex();

// 可读端底层读取逻辑
duplex._read = function () {
  this._readNum = this._readNum || 0;
  if (this._readNum > 1) {
    this.push(null);
  } else {
    this.push("" + this._readNum++);
  }
};

// 可写端底层写逻辑
duplex._write = function (buf, enc, next) {
  // a, b
  process.stdout.write("_write " + buf.toString() + "\n");
  next();
};

// 0, 1
duplex.on("data", (data) => console.log("ondata", data.toString()));

duplex.write("a");
duplex.write("b");

duplex.end();
```

上面的代码中实现了\_read 方法，所以可以监听 data 事件来消耗 Duplex 产生的数据。
同时，又实现了\_write 方法，可作为下游去消耗数据。

因为它既可读又可写，所以称它有两端：可写端和可读端。
可写端的接口与 Writable 一致，作为下游来使用；可读端的接口与 Readable 一致，作为上游来使用。

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

#### transform

变形金刚流则更有意思了，它的输出是经过计算的自身输入。

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

### axios 获取文件流并下载文件

```js
axios.post(url, data, { responseType: "blob" }).then((res) => {
  const blob = new Blob([res.data]); //处理文档流
  const fileName = "资产列表.xlsx";
  const elink = document.createElement("a");
  elink.download = fileName;
  elink.style.display = "none";
  elink.href = URL.createObjectURL(blob);
  document.body.appendChild(elink);
  elink.click();
  URL.revokeObjectURL(elink.href); // 释放URL 对象
  document.body.removeChild(elink);
});
```

## 参考文档：

[想学 Node.js，stream 先有必要搞清楚](https://juejin.cn/post/6844903891083984910#heading-11)

## ==============分割线==================

## 使用内建流 API

### 静态 web 服务器

想要通过网络高效且支持大文件的发送一个文件到一个客户端。

#### 不使用流

```js
const http = require("http");
const fs = require("fs");

http
  .createServer((req, res) => {
    fs.readFile(`${__dirname}/index.html`, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(String(err));
        return;
      }

      res.end(data);
    });
  })
  .listen(8000);
```

#### 使用流

```js
const http = require("http");
const fs = require("fs");

http
  .createServer((req, res) => {
    fs.createReadStream(`${__dirname}/index.html`).pipe(res);
  })
  .listen(8000);
```

更少代码，更加高效
提供一个缓冲区发送到客户端

#### 使用流 + gzip

```js
const http = require("http");
const fs = require("fs");
const zlib = require("zlib");

http
  .createServer((req, res) => {
    res.writeHead(200, {
      "content-encoding": "gzip",
    });
    fs.createReadStream(`${__dirname}/index.html`)
      .pipe(zlib.createGzip())
      .pipe(res);
  })
  .listen(8000);
```

#### 流的错误处理

```js
const fs = require("fs");
const stream = fs.createReadStream("not-found");

stream.on("error", (err) => {
  console.trace();
  console.error("Stack:", err.stack);
  console.error("The error raised was:", err);
});
```

[nodejs stream 基础篇](https://zhuanlan.zhihu.com/p/21681090)
[nodejs stream 进阶篇](https://cloud.tencent.com/developer/article/1058118)
https://www.jianshu.com/p/bfd5abc106ed
https://zhuanlan.zhihu.com/p/36728655