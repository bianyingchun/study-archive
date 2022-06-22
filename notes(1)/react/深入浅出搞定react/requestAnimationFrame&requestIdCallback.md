### requestAnimationFrame

window.requestAnimationFrame() 告诉浏览器——你希望执行一个动画，并且要求浏览器**在下次重绘之前调用指定的回调函数更新动画**。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行

> 注意：若你想在浏览器下次重绘之前继续更新下一帧动画，那么回调函数自身必须再次调用 window.requestAnimationFrame()

### requestIdleCallback

window.requestIdleCallback()方法插入一个函数，这个函数将在**浏览器空闲时期被调用**。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。函数一般会按先进先调用的顺序执行，然而，如果回调函数指定了执行超时时间 timeout，则有可能为了在超时前执行函数而打乱执行顺序。

[参考链接](https://www.cnblogs.com/cangqinglang/p/13877078.html)

## 页面流畅与 FPS

页面是一帧一帧绘制出来的，当每秒绘制的帧数（FPS）达到 60 时，页面是流畅的，小于这个值时，用户会感觉到卡顿。1s 60 帧，所以每一帧分到的时间是 1000/60 ≈ 16 ms。所以我们书写代码时力求不让一帧的工作量超过 16ms。

## Frame

那么浏览器每一帧都需要完成哪些工作？
![](./list_iframe.png)

1. 处理用户的输入
2. js 解析执行
3. 帧开始。窗口尺寸变更、页面滚动等处理
4. requestAnimationFrame(RAF)
5. 布局
6. 绘制

### requestIdleCallback

上面六个步骤完成后没超过 16 ms，说明时间有富余，此时就会执行 requestIdleCallback 里注册的任务。
![](./requestIdleCallback.png)

从上图也可看出，和 **requestAnimationFrame 每一帧必定会执行不同，requestIdleCallback 是捡浏览器空闲来执行任务**。

如此一来，**假如浏览器一直处于非常忙碌的状态，requestIdleCallback 注册的任务有可能永远不会执行**。此时可通过设置 timeout （见下面 API 介绍）来保证执行。

#### API

var handle = window.requestIdleCallback(callback[, options])

1. callback：回调，即空闲时需要执行的任务，该回调函数接收一个 IdleDeadline 对象作为入参。其中 IdleDeadline 对象包含：

- didTimeout，布尔值，表示任务是否超时，结合 timeRemaining 使用。即回调函数在规定的时间内是否被执行，如果没有执行 didTimeout 属性将为 ture，如果任务是急需完成的此时应该忽略剩余时间逻辑上强制执行回调函数)。
- timeRemaining()，表示当前帧剩余的时间，也可理解为留给任务的时间还有多少。

2. options：目前 options 只有一个参数

- timeout。表示超过这个时间后，如果任务还没执行，则强制执行，不必等待空闲。

```js
requestIdleCallback(myNonEssentialWork, { timeout: 2000 });
// 任务队列
const tasks = [
  () => {
    console.log("第一个任务");
  },
  () => {
    console.log("第二个任务");
  },
  () => {
    console.log("第三个任务");
  },
];

function myNonEssentialWork(deadline) {
  // 如果帧内有富余的时间，或者超时
  while (
    (deadline.timeRemaining() > 0 || deadline.didTimeout) &&
    tasks.length > 0
  ) {
    work();
  }

  if (tasks.length > 0) requestIdleCallback(myNonEssentialWork);
}

function work() {
  tasks.shift()();
  console.log("执行任务");
}
```

超时的情况，其实就是浏览器很忙，没有空闲时间，此时会等待指定的 timeout 那么久再执行，通过入参 dealine 拿到的 didTmieout 会为 true，同时 timeRemaining () 返回的也是 0。超时的情况下如果选择继续执行的话，肯定会出现卡顿的，因为必然会将一帧的时间拉长。

### cancelIdleCallback

与 setTimeout 类似，返回一个唯一 id，可通过 cancelIdleCallback 来取消任务。

## 总结

一些低优先级的任务可使用 requestIdleCallback 等浏览器不忙的时候来执行，同时因为时间有限，它所执行的任务应该尽量是能够量化，细分的微任务（micro task）。

因为它发生在一帧的最后，此时页面布局已经完成，所以**不建议在 requestIdleCallback 里再操作 DOM，这样会导致页面再次重绘**。DOM 操作建议在 rAF 中进行。同时，操作 DOM 所需要的耗时是不确定的，因为会导致重新计算布局和视图的绘制，所以这类操作不具备可预测性。

Promise 也不建议在这里面进行，因为 Promise 的回调属性 Event loop 中优先级较高的一种微任务，会在 requestIdleCallback 结束时立即执行，不管此时是否还有富余的时间，这样有很大可能会让一帧超过 16 ms。

额外补充一下 window.requestAnimationFrame
在没有 requestAnimationFrame 方法的时候，执行动画，我们可能使用 setTimeout 或 setInterval 来触发视觉变化；但是这种做法的问题是：回调函数执行的时间是不固定的，可能刚好就在末尾，或者直接就不执行了，经常会引起丢帧而导致页面卡顿。

归根到底发生上面这个问题的原因在于时机，也就是浏览器要知道何时对回调函数进行响应。setTimeout 或 setInterval 是使用定时器来触发回调函数的，而**定时器并无法保证能够准确无误的执行，有许多因素会影响它的运行时机**，比如说：当有同步代码执行时，会先等同步代码执行完毕，异步队列中没有其他任务，才会轮到自己执行。并且，我们知道每一次重新渲染的最佳时间大约是 16.6 ms，如果定时器的时间间隔过短，就会造成 过度渲染，增加开销；过长又会延迟渲染，使动画不流畅。

requestAnimationFrame 它是由系统来决定回调函数的执行时机的，会请求浏览器在下一次重新渲染之前执行回调函数。无论设备的刷新率是多少，requestAnimationFrame 的时间间隔都会紧跟屏幕刷新一次所需要的时间
