// 参考链接 http://www.ruanyifeng.com/blog/2018/07/web-worker.html
// 同源， Dom限制，通信联系， 脚本限制，文件限制

// 7.1 主线程
// 浏览器原生提供Worker()构造函数，用来供主线程生成 Worker 线程。


var myWorker = new Worker(jsUrl, options);
// Worker()构造函数，可以接受两个参数。第一个参数是脚本的网址（必须遵守同源政策），该参数是必需的，且只能加载 JS 脚本，否则会报错。第二个参数是配置对象，该对象可选。它的一个作用就是指定 Worker 的名称，用来区分多个 Worker 线程。


// // 主线程
var myWorker = new Worker('worker.js', { name : 'myWorker' });

// // Worker 线程
self.name // myWorker
// Worker()构造函数返回一个 Worker 线程对象，用来供主线程操作 Worker。Worker 线程对象的属性和方法如下。

// Worker.onerror：指定 error 事件的监听函数。
// Worker.onmessage：指定 message 事件的监听函数，发送过来的数据在Event.data属性中。
// Worker.onmessageerror：指定 messageerror 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
// Worker.postMessage()：向 Worker 线程发送消息。
// Worker.terminate()：立即终止 Worker 线程。

// 7.2 Worker 线程
// Web Worker 有自己的全局对象，不是主线程的window，而是一个专门为 Worker 定制的全局对象。因此定义在window上面的对象和方法不是全部都可以使用。

// Worker 线程有一些自己的全局属性和方法。

// self.name： Worker 的名字。该属性只读，由构造函数指定。
// self.onmessage：指定message事件的监听函数。
// self.onmessageerror：指定 messageerror 事件的监听函数。
// 发送的数据无法序列化成字符串时，会触发这个事件。
// self.close()：关闭 Worker 线程。
// self.postMessage()：向产生这个 Worker 线程发送消息。
// self.importScripts()：加载 JS 脚本。

// ### 对象转移
// 对象转移就是将对象引用零成本转交给 Web Workers 的上下文，而不需要进行结构拷贝。
// 这里要解释的是，主线程与 Web Workers 之间的通信，并不是对象引用的传递，
// 而是序列化 / 反序列化的过程，当对象非常庞大时，序列化和反序列化都会消耗大量计算资源，降低运行速度。
/**

 需要注意的是，对象引用转移后，原先上下文就无法访问此对象了，需要在 Web Workers 再次将对象还原到主线程上下文后，主线程才能正常访问被转交的对象。
 */

const code = `
  importScripts('https://xxx.com/xxx.js');
  self.onmessage = e => {};
`;

const blob = new Blob([code], { type: "application/javascript" });
const worker = new Worker(URL.createObjectURL(blob));

