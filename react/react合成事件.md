### React 事件系统是如何工作的
React 的事件系统沿袭了事件委托的思想。在 React 中，除了少数特殊的不可冒泡的事件（比如媒体类型的事件）无法被事件系统处理外，绝大部分的事件都不会被绑定在具体的元素上，而是统一被绑定在页面的 document 上。当事件在具体的 DOM 节点上被触发后，最终都会冒泡到 document 上，document 上所绑定的统一事件处理程序会将事件分发到具体的组件实例。

在分发事件之前，React 首先会对事件进行包装，把原生 DOM 事件包装成合成事件。

### 认识 React 合成事件
合成事件是 React 自定义的事件对象，它符合W3C规范，在底层抹平了不同浏览器的差异，在上层面向开发者暴露统一的、稳定的、与 DOM 原生事件相同的事件接口。开发者们由此便不必再关注烦琐的兼容性问题，可以专注于业务逻辑的开发。

虽然合成事件并不是原生 DOM 事件，但它保存了原生 DOM 事件的引用。当你需要访问原生 DOM 事件对象时，可以通过合成事件对象的 e.nativeEvent 属性获取到它

### React 事件系统工作流拆解
既然是事件系统，那就逃不出“事件绑定”和“事件触发”这两个关键动作。首先让我们一起来看看事件的绑定是如何实现的。

##### 事件的绑定
事件的绑定是在组件的挂载过程中完成的，具体来说，是在 completeWork 中完成的。completeWork 内部有三个关键动作：创建 DOM 节点（createInstance）、将 DOM 节点插入到 DOM 树中（appendAllChildren）、为 DOM 节点设置属性（finalizeInitialChildren）。其中“为 DOM 节点**设置属性”**这个环节，会遍历 FiberNode 的 props key。当遍历到事件相关的 props 时，就会触发事件的注册链路。
1. ensureListeningTo 进入事件注册流程，
2. legacyListenToTopLevelEvent 分发事件监听的注册逻辑，判断捕获还是冒泡 
3. 事件需要捕获 trapCapture
4. 时间需要冒泡 trapBubbleEvent
5. addTrappedEventListenser将统一的事件监听注册到document上
在2中listenerMap 是在 legacyListenToEvent 里创建/获取的一个数据结构，它将记录当前 document 已经监听了哪些事件。在 legacyListenToTopLevelEvent 逻辑的起点，会首先判断 listenerMap.has(topLevelType) 这个条件是否为 true。为什么针对同一个事件，即便可能会存在多个回调，document 也只需要注册一次监听？因为 React最终注册到 document 上的并不是某一个 DOM 节点上对应的具体回调逻辑，而是一个统一的事件分发函数,其实就是 dispatchEvent
那么 dispatchEvent 是如何实现事件分发的呢？
##### 事件的触发
 1. 事件触发，冒泡至document
 2. 执行dispatchEvent
 3. 创建时间对应的合成事件对象
 4. 收集事件在**捕获阶段**所波及的回调函数和对应的节点实例
 5. 收集事件在**冒泡阶段**所波及的回调函数和对应的节点实例
 6. 将前两步收集来的回调按顺序执行

 ##### 事件回调的收集与执行

 首先我们来看收集过程对应的源码逻辑，这部分逻辑在 traverseTwoPhase 函数中，源码如下（解析在注释里）：
 ```javascript
function traverseTwoPhase(inst, fn, arg) {
  // 定义一个 path 数组
  var path = [];
  while (inst) {
    // 将当前节点收集进 path 数组
    path.push(inst);
    // 向上收集 tag===HostComponent 的父节点
    inst = getParent(inst);
  }
  var i;
  // 从后往前，收集 path 数组中会参与捕获过程的节点与对应回调
  for (i = path.length; i-- > 0;) {
    fn(path[i], 'captured', arg);
  }
  // 从前往后，收集 path 数组中会参与冒泡过程的节点与对应回调
  for (i = 0; i < path.length; i++) {
    fn(path[i], 'bubbled', arg);
  }
}
```
traverseTwoPhase 函数做了以下三件事情。

1. 循环收集符合条件的父节点，存进 path 数组中
traverseTwoPhase会以当前节点（触发事件的目标节点）为起点，不断向上寻找 tag===HostComponent 的父节点，并将这些节点按顺序收集进 path 数组中。其中 tag===HostComponent 这个条件是在 getParent() 函数中管控的。
为什么一定要求 tag===HostComponent 呢？前面介绍渲染链路时，我们曾经讲过，HostComponent 是 DOM 元素对应的 Fiber 节点类型。此处限制 tag===HostComponent，也就是说只收集 DOM 元素对应的 Fiber 节点。之所以这样做，是因为浏览器只认识 DOM 节点，浏览器事件也只会在 DOM 节点之间传播，收集其他节点是没有意义的。
2. 模拟事件在捕获阶段的传播顺序，收集捕获阶段相关的节点实例与回调函数
接下来，traverseTwoPhase 会从后往前遍历 path 数组，模拟事件的捕获顺序，收集事件在捕获阶段对应的回调与实例。
前面咱们说 path 数组是从子节点出发，向上收集得来的。所以说path 数组中子节点在前，祖先节点在后。
从后往前遍历 path 数组，其实就是从父节点往下遍历子节点，直至遍历到目标节点的过程，这个遍历顺序和事件在捕获阶段的传播顺序是一致的。在遍历的过程中，fn 函数会对每个节点的回调情况进行检查，若该节点上对应当前事件的捕获回调不为空，那么节点实例会被收集到合成事件的 _dispatchInstances 属性（也就是 SyntheticEvent._dispatchInstances）中去，事件回调则会被收集到合成事件的 _dispatchListeners 属性（也就是 SyntheticEvent._dispatchListeners） 中去，等待后续的执行。

3. 模拟事件在冒泡阶段的传播顺序，收集冒泡阶段相关的节点实例与回调函数

捕获阶段的工作完成后，traverseTwoPhase 会从后往前遍历 path 数组，模拟事件的冒泡顺序，收集事件在捕获阶段对应的回调与实例。
这个过程和步骤 2 基本是一样的，唯一的区别是对 path 数组的倒序遍历变成了正序遍历。既然倒序遍历模拟的是捕获阶段的事件传播顺序，那么正序遍历自然模拟的就是冒泡阶段的事件传播顺序。在正序遍历的过程中，同样会对每个节点的回调情况进行检查，若该节点上对应当前事件的冒泡回调不为空，那么节点实例和事件回调同样会分别被收集到 SyntheticEvent._dispatchInstances 和 SyntheticEvent._dispatchListeners 中去。
需要注意的是，当前事件对应的 SyntheticEvent 实例有且仅有一个，因此在模拟捕获和模拟冒泡这两个过程中，收集到的实例会被推入同一个 SyntheticEvent._dispatchInstances，收集到的事件回调也会被推入同一个 SyntheticEvent._dispatchListeners。

这样一来，我们在事件回调的执行阶段，只需要按照顺序执行 SyntheticEvent._dispatchListeners 数组中的回调函数，就能够一口气模拟出整个完整的 DOM 事件流，也就是 “捕获-目标-冒泡”这三个阶段。

#### React 事件系统的设计动机是什么？
1. 首先一定要说的，也是 React 官方说明过的一点是：合成事件符合W3C规范，在底层抹平了不同浏览器的差异，在上层面向开发者暴露统一的、稳定的、与 DOM 原生事件相同的事件接口。开发者们由此便不必再关注烦琐的底层兼容问题，可以专注于业务逻辑的开发。

2. 此外，自研事件系统使 React 牢牢把握住了事件处理的主动权：比如说它想在事件系统中处理 Fiber 相关的优先级概念，或者想把多个事件揉成一个事件（比如 onChange 事件），原生 DOM 会帮它做吗？不会，因为原生讲究的就是个通用性。而 React 想要的则是“量体裁衣”，通过自研事件系统，React 能够从很大程度上干预事件的表现，使其符合自身的需求。