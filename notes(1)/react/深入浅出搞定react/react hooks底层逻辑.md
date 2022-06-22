## 以 useState 为例，分析 React-Hooks 的调用链路

首先要说明的是，React-Hooks 的调用链路在首次渲染和更新阶段是不同的。首先是首次渲染的过程

### 首次渲染

useState -> resolveDispatcher 获取 dispatcher->dispatcher.useState-> 调用 mountState-> 返回目标数组
在这个流程中，useState 触发的一系列操作最后会落到 mountState 里面去，所以我们重点需要关注的就是 mountState 做了什么事情。以下我为你提取了 mountState 的源码：

#### mountState

```js
// 进入 mounState 逻辑
function mountState(initialState) {
  // 将新的 hook 对象追加进链表尾部
  var hook = mountWorkInProgressHook();
  // initialState 可以是一个回调，若是回调，则取回调执行后的值
  if (typeof initialState === "function") {
    // $FlowFixMe: Flow doesn't like mixed types
    initialState = initialState();
  }
  // 创建当前 hook 对象的更新队列，这一步主要是为了能够依序保留 dispatch
  const queue = (hook.queue = {
    last: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  });

  // 将 initialState 作为一个“记忆值”存下来
  hook.memoizedState = hook.baseState = initialState;
  // dispatch 是由上下文中一个叫 dispatchAction 的方法创建的，这里不必纠结这个方法具体做了什么
  var dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingFiber$1,
    queue
  ));
  // 返回目标数组，dispatch 其实就是示例中常常见到的 setXXX 这个函数，想不到吧？哈哈
  return [hook.memoizedState, dispatch];
}
```

从这段源码中我们可以看出，mounState 的主要工作是**初始化 Hooks**。在整段源码中，最需要关注的是 mountWorkInProgressHook 方法，它为我们道出了 Hooks 背后的数据结构组织形式。以下是 mountWorkInProgressHook 方法的源码：

#### mountWorkInProgressHook

```js
function mountWorkInProgressHook() {
  // 注意，单个 hook 是以对象的形式存在的

  var hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // 这行代码每个 React 版本不太一样，但做的都是同一件事：将 hook 作为链表的头节点处理
    firstWorkInProgressHook = workInProgressHook = hook;
  } else {
    // 若链表不为空，则将 hook 追加到链表尾部
    workInProgressHook = workInProgressHook.next = hook;
  }

  // 返回当前的 hook
  return workInProgressHook;
}
```

到这里可以看出，**hook 相关的所有信息收敛在一个 hook 对象里，而 hook 对象之间以单向链表的形式相互串联。**

### 更新

useState -> resolveDispatcher 获取 dispatcher->dispatcher.useState-> 调用 updateState-> 调用 updateReducer-> 返回目标数组 如 [state, useState]

我们把 mountState 和 updateState 做的事情放在一起来看：**mountState（首次渲染）构建链表并渲染；updateState 依次遍历链表并渲染。**

看到这里，你是不是已经大概知道怎么回事儿了？没错，**hooks 的渲染是通过“依次遍历”来定位每个 hooks 内容的**。如果前后两次读到的链表在顺序上出现差异，那么渲染的结果自然是不可控的。

这个现象有点像我们构建了一个长度确定的数组，数组中的每个坑位都对应着一块确切的信息，后续每次从数组里取值的时候，只能够通过索引（也就是位置）来定位数据。也正因为如此，在许多文章里，都会直截了当地下这样的定义：Hooks 的本质就是数组。但读完这一课时的内容你就会知道，**Hooks 的本质其实是链表**。
