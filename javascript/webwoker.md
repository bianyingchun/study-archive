 参考链接 http:www.ruanyifeng.com/blog/2018/07/web-worker.html
 同源， Dom限制，通信联系， 脚本限制，文件限制

 7.1 主线程
 浏览器原生提供Worker()构造函数，用来供主线程生成 Worker 线程。


var myWorker = new Worker(jsUrl, options);
 Worker()构造函数，可以接受两个参数。第一个参数是脚本的网址（必须遵守同源政策），该参数是必需的，且只能加载 JS 脚本，否则会报错。第二个参数是配置对象，该对象可选。它的一个作用就是指定 Worker 的名称，用来区分多个 Worker 线程。


  主线程
var myWorker = new Worker('worker.js', { name : 'myWorker' });

  Worker 线程
self.name  myWorker
 Worker()构造函数返回一个 Worker 线程对象，用来供主线程操作 Worker。Worker 线程对象的属性和方法如下。

 Worker.onerror：指定 error 事件的监听函数。
 Worker.onmessage：指定 message 事件的监听函数，发送过来的数据在Event.data属性中。
 Worker.onmessageerror：指定 messageerror 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
 Worker.postMessage()：向 Worker 线程发送消息。
 Worker.terminate()：立即终止 Worker 线程。

 7.2 Worker 线程
 Web Worker 有自己的全局对象，不是主线程的window，而是一个专门为 Worker 定制的全局对象。因此定义在window上面的对象和方法不是全部都可以使用。

 Worker 线程有一些自己的全局属性和方法。

 self.name： Worker 的名字。该属性只读，由构造函数指定。
 self.onmessage：指定message事件的监听函数。
 self.onmessageerror：指定 messageerror 事件的监听函数。
 发送的数据无法序列化成字符串时，会触发这个事件。
 self.close()：关闭 Worker 线程。
 self.postMessage()：向产生这个 Worker 线程发送消息。
 self.importScripts()：加载 JS 脚本。


 [精读《谈谈 Web Workers》](https:zhuanlan.zhihu.com/p/47326066)
 ### 对象转移
 对象转移就是将对象引用零成本转交给 Web Workers 的上下文，而不需要进行结构拷贝。
 这里要解释的是，主线程与 Web Workers 之间的通信，并不是对象引用的传递，
 而是序列化 / 反序列化的过程，当对象非常庞大时，序列化和反序列化都会消耗大量计算资源，降低运行速度。
/**

 需要注意的是，对象引用转移后，原先上下文就无法访问此对象了，需要在 Web Workers 再次将对象还原到主线程上下文后，主线程才能正常访问被转交的对象。
 */

const code = `
  importScripts('https:xxx.com/xxx.js');
  self.onmessage = e => {};
`;

const blob = new Blob([code], { type: "application/javascript" });
const worker = new Worker(URL.createObjectURL(blob));

<!-- https://zhuanlan.zhihu.com/p/29165800 -->

### 为什么JS执行CPU密集型任务会导致页面卡顿
JavaScript 执行是单线程的，同一时间只能做一件事，无法同时运行两个 JavaScript 脚本。执行CPU密集型任务时，大量的同步计算任务阻塞了浏览器的 UI 渲染。默认情况下，JS 运算、页面布局和页面绘制都是运行在浏览器的主线程当中，他们之间是互斥的关系。如果 JS 运算持续占用主线程，页面就没法得到及时的更新。从而造成卡顿。

### 如何解决大量计算导致的卡顿问题

#### 将这种 CPU 密集型任务移到 Server 端计算

的确可以移到 Server 端计算，等计算完成了再将结果返回给客户端。
缺点: 弱网或无网络下必须等待，增加了服务端的压力。

#### 使用 setTimeout 拆分密集型任务

使用 setTimeout 或 setInterval 将这种密集型任务拆分成一个个小任务，JavaScript 引擎会将这些任务添加到队列中，以便腾出机会给页面渲染。
缺点:
1. 并不是所有的任务都可以被拆分成一个个小的任务，有些任务是原子的。
2. 增加了代码的复杂性，同时需要保证子任务计算结果的依赖和顺序。
3. 需要考虑避免将任务拆分的过于碎片化，且无法保证拆分的粒度确实能提升性能并带给用户流畅的体验。

#### 第三种解决办法：使用 Web Worker 方式

Web Worker 是一个独立的线程（独立的执行环境），这就意味着它可以完全和 UI 线程（主线程）并行的执行 js 代码，从而不会阻塞 UI，它和主线程是通过 onmessage 和 postMessage 接口进行通信的。
#### Web Worker 的限制
1. 无法访问 DOM 元素、window、document
当然不能允许访问，如果两个线程都能操作 DOM，当两个线程同时操作 DOM，一个做删除操作，另一个做改变样式操作，这就冲突了，浏览器到底该如何更新 DOM。所以 Web Worker 只做相应的计算，当计算完成，把数据传给主线程，由主线程去更新 DOM。

2. 无法访问 LocalStorage
和对 dom 元素的限制一样，因为读写 LocalStorage 是同步的，一定会引起竞争

3. Web Worker 不支持跨域

4. 无法和主线程共享内存、worker 之间也无法共享内存，所以无需保护数据
