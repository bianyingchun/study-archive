// 加载其他脚本
// importScripts('script1.js', 'script2.js');
self.addEventListener('message', function (e) {
  self.postMessage('You said: ' + e.data);
}, false);
// 上面代码中，self代表子线程自身，即子线程的全局对象。因此，等同于下面两种写法

// 写法一
this.addEventListener('message', function (e) {
  this.postMessage('You said: ' + e.data);
}, false);

// 写法二
addEventListener('message', function (e) {
  postMessage('You said: ' + e.data);
}, false);

// 除了使用self.addEventListener()指定监听函数，也可以使用self.onmessage指定。
// 监听函数的参数是一个事件对象，它的data属性包含主线程发来的数据。
// self.postMessage()方法用来向主线程发送消息。
// 根据主线程发来的数据，Worker 线程可以调用不同的方法，下面是一个例子。
self.addEventListener('message', function (e) {
  var data = e.data;
  switch (data.cmd) {
    case 'start':
      self.postMessage('WORKER STARTED: ' + data.msg);
      break;
    case 'stop':
      self.postMessage('WORKER STOPPED: ' + data.msg);
      // 关闭自身
      self.close(); // Terminates the worker.
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);


self.onmessage = function (e) {
  var uInt8Array = e.data;
  postMessage('Inside worker.js: uInt8Array.toString() = ' + uInt8Array.toString());
  postMessage('Inside worker.js: uInt8Array.byteLength = ' + uInt8Array.byteLength);
};

addEventListener)