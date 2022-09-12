1. react 18 放弃支持 ie

# 新特性

## render APi

1. 创建应用

```js
// React 17
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const root = document.getElementById('root')!;

ReactDOM.render(<App />, root);

// React 18
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,

);

```

2. 卸载应用

```js
// React 17
ReactDOM.unmountComponentAtNode(root);

// React 18
root.unmount();
```

## setState 自动批处理

批处理是指为了获得更好的性能，在数据层，将多个状态更新批量处理，合并成一次更新（在视图层，将多个渲染合并成一次渲染）。

1. 在 React 18 之前：
   在 React 18 之前，我们只在 React 事件处理函数 中进行批处理更新。默认情况下，在 promise、setTimeout、原生事件处理函数中、或任何其它事件内的更新都不会进行批处理：
2. 在 18 之后，任何情况都会自动执行批处理，多次更新始终合并为一次

## flushSync

批处理是一个破坏性改动，如果你想退出批量更新，你可以使用 flushSync：

```js
import React, { useState } from "react";
import { flushSync } from "react-dom";

const App: React.FC = () => {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  return (
    <div
      onClick={() => {
        flushSync(() => {
          setCount1((count) => count + 1);
        });
        // 第一次更新
        flushSync(() => {
          setCount2((count) => count + 1);
        });
        // 第二次更新
      }}
    >
      <div>count1： {count1}</div>
      <div>count2： {count2}</div>
    </div>
  );
};

export default App;
```

注意：**flushSync  函数内部的多个  setState  仍然为批量更新，这样可以精准控制哪些不需要的批量更新。**

## 关于卸载组件时的更新状态警告

warning:can not perform a react state update on an unmounted component this is a no op, but is indicates a memory leak in your application .....

这个错误表示：无法对未挂载（已卸载）的组件执行状态更新。这是一个无效操作，并且表明我们的代码中存在内存泄漏。
实际上，这个错误并不多见，在以往的版本中，这个警告被广泛误解，并且有些误导。
这个错误的初衷，原本旨在针对一些特殊场景，譬如 你在 useEffect 里面设置了定时器，或者订阅了某个事件，从而在组件内部产生了副作用，而且忘记 return 一个函数清除副作用，则会发生内存泄漏…… 之类的场景
但是在实际开发中，更多的场景是，**我们在 useEffect 里面发送了一个异步请求，在异步函数还没有被 resolve 或者被 reject 的时候，我们就卸载了组件。 在这种场景中，警告同样会触发。但是，在这种情况下，组件内部并没有内存泄漏，因为这个异步函数已经被垃圾回收了，此时，警告具有误导性。**

综上所述原因，在 React 18 中，官方删除了这个报错

## react 组件的返回值

1. 在  React 17  中，如果你需要返回一个空组件，React 只允许返回 null。如果你显式的返回了  undefined，控制台则会在运行时抛出一个错误。
2. 在  React 18  中，不再检查因返回  undefined  而导致崩溃。既能返回 null，也能返回 undefined（但是 React 18 的 dts 文件还是会检查，只允许返回 null，你可以忽略这个类型错误）。

## Strict Mode

不再抑制控制台日志：

1. 当你使用严格模式时，React 会对每个组件进行两次渲染，以便你观察一些意想不到的结果。在 **React 17 中，取消了其中一次渲染的控制台日志**，以便让日志更容易阅读。
2. 为了解决社区对这个问题的困惑，**在 React 18 中，官方取消了这个限制。**如果你安装了 React DevTools，第二次渲染的日志信息将显示为灰色，以柔和的方式显式在控制台

## Suspense 不再需要 fallback 来捕获

在 React 18 的 Suspense 组件中，官方对 空的 fallback 属性的处理方式做了改变：**不再跳过 缺失值 或 值为 null 的 fallback 的 Suspense 边界。相反，会捕获边界并且向外层查找，如果查找不到，将会把 fallback 呈现为 null。**
更新前：
以前，如果你的 Suspense 组件没有提供 fallback 属性，React 就会悄悄跳过它，继续向上搜索下一个边界：

```js
// React 17
const App = () => {
  return (
    <Suspense fallback={<Loading />}> // <--- 这个边界被使用，显示 Loading 组件
      <Suspense>                      // <--- 这个边界被跳过，没有 fallback 属性
        <Page />
      </Suspense>
    </Suspense>
  );
};

export default App;
```

React 工作组发现这可能会导致混乱、难以调试的情况发生。例如，你正在 debug 一个问题，并且在没有 fallback 属性的 Suspense 组件中抛出一个边界来测试一个问题，它可能会带来一些意想不到的结果，并且 不会警告 说它 没有 fallback 属性。
更新后：
现在，React 将使用当前组件的 Suspense 作为边界，即使当前组件的 Suspense 的值为 null 或 undefined：

```js
// React 18
const App = () => {
  return (
    <Suspense fallback={<Loading />}> // <--- 不使用
      <Suspense>                      // <--- 这个边界被使用，将 fallback 渲染为 null
        <Page />
      </Suspense>
    </Suspense>
  );
};
```

export default App;

这个更新意味着我们不再跨越边界组件。相反，我们将在边界处捕获并呈现 fallback，就像你提供了一个返回值为 null 的组件一样。这意味着被挂起的 Suspense 组件将按照预期结果去执行，如果忘记提供 fallback 属性，也不会有什么问题。

# 新的 API

## useId 支持同一个组件在客户端和服务端生成相同的唯一的 ID

https://cloud.tencent.com/developer/article/1977997

```js
useId;
const id = useId();
```

**支持同一个组件在客户端和服务端生成相同的唯一的 ID**，避免  hydration  的不兼容，这解决了在 React 17 及 17 以下版本中已经存在的问题。因为我们的服务器渲染时提供的 HTML 是无序的，**useId 的原理就是每个 id 代表该组件在组件树中的层级结构。**

> 在服务端，我们会将 React 组件渲染成为一个字符串，这个过程叫做（脱水）「dehydrate」。字符串以 html 的形式传送给客户端，作为首屏直出的内容。到了客户端之后，React 还需要对该组件重新激活，用于参与新的渲染更新等过程中，这个过程叫做「hydrate」(注水)

那么这个过程中，同一个组件在服务端和客户端之间就需要有一个相对稳定的 id 来确定对应的匹配关系。

如何解决这个问题呢？

如果客户端和服务端的组件渲染顺序是一致的。那么我们就可以在全局通过递增的计数器来达到这个目标。

```js
var fieldCounter = 0;

export default function Field(props) {
  const [inputId, setInputId] = useState(++fieldCounter);

  return (
    <div className="field">
      <label htmlFor={inputId}>props.label</label>
      <input type={props.type} id={inputId} name={props.name} value="" />
    </div>
  );
}
```

但是，React 在后续的更新中，就开始搞事情，客户端渲染有 reconciler ，服务端渲染有 fizz，他们的作用大概相同，那就是根据某种优先级进行任务调度。于是，无论是客户端还是服务端，都可能不会按照稳定的顺序渲染组件了，这种递增的计数器方案就无法解决问题。

那么，有没有一种属性，是在客户端和服务端都绝对稳定的呢？

当然有，那就是组件的树状结构。

## useSyncExternalStore

useSyncExternalStore 是一个新的 api，经历了一次修改，由 useMutableSource 改变而来，主要用来解决外部数据撕裂问题。

useSyncExternalStore 能够通过**强制同步更新数据让 React 组件在 CM 下安全地有效地读取外接数据源**。 在 Concurrent Mode 下，React 一次渲染会分片执行（以 fiber 为单位），中间可能穿插优先级更高的更新。假如在高优先级的更新中改变了公共数据（比如 redux 中的数据），那之前低优先的渲染必须要重新开始执行，否则就会出现前后状态不一致的情况。

useSyncExternalStore 一般是三方状态管理库使用，我们在日常业务中不需要关注。因为 **React 自身的 useState 已经原生的解决的并发特性下的 tear（撕裂）问题**。useSyncExternalStore 主要对于框架开发者，比如 redux，它在控制状态时可能并非直接使用的 React 的 state，而是自己在外部维护了一个 store 对象，用发布订阅模式实现了数据更新，脱离了 React 的管理，也就无法依靠 React 自动解决撕裂问题。因此 React 对外提供了这样一个 API。
目前 React-Redux 8.0 已经基于 useSyncExternalStore 实现。

## useInsertionEffect

```js
const useCSS = (rule) => {
  useInsertionEffect(() => {
    if (!isInserted.has(rule)) {
      isInserted.add(rule);
      document.head.appendChild(getStyleForRule(rule));
    }
  });
  return rule;
};

const App: React.FC = () => {
  const className = useCSS(rule);
  return <div className={className} />;
};

export default App;
```

这个 Hooks 只建议  css-in-js 库来使用。 **这个 Hooks 执行时机在 DOM 生成之后，useLayoutEffect 之前**，它的工作原理大致和  useLayoutEffect  相同，只是此时无法访问  DOM  节点的引用，一般用于提前注入  <style>  脚本。

# Concurrent Mode（并发模式）

**React 17 和 React 18 的区别就是：从同步不可中断更新变成了异步可中断更新。**

在 React 17 中一些实验性功能里面，开启并发模式就是开启了并发更新，但是在 React 18 正式版发布后，由于官方策略调整，React 不再依赖并发模式开启并发更新了。
换句话说：**开启了并发模式，并不一定开启了并发更新**！
一句话总结：**在 18 中，不再有多种模式，而是以是否使用并发特性作为是否开启并发更新的依据。**

从最老的版本到当前的 v18，市面上有多少个版本的 React？
可以从架构角度来概括下，当前一共有两种架构：

- 采用不可中断的递归方式更新的 Stack Reconciler（老架构）
- 采用可中断的遍历方式更新的 Fiber Reconciler（新架构）

新架构可以选择是否开启并发更新，所以当前市面上所有 React 版本有四种情况：

1. 老架构（v15 及之前版本）
2. 新架构，未开启并发更新，与情况 1 行为一致（v16、v17 默认属于这种情况）
3. 新架构，未开启并发更新，但是启用了并发模式和一些新功能（比如 Automatic Batching，v18 默认属于这种情况）
4. 新架构，开启并发模式，开启并发更新

**并发特性指开启并发模式后才能使用的特性**，比如：

1. useDeferredValue
2. startTransition

#### startTransition

```js
import React, { useState, useEffect, useTransition } from 'react';

const App: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    // 使用了并发特性，开启并发更新
    startTransition(() => {
      setList(new Array(10000).fill(null));
    });
  }, []);
  return (
    <>
      {list.map((_, i) => (
        <div key={i}>{i}</div>
      ))}
    </>
  );
};

export default App
```

由于 setList 在 startTransition 的回调函数中执行（使用了并发特性），所以 setList 会触发并发更新。
startTransition，主要为了能在大量的任务下也能保持 UI 响应。这个新的 API 可以通过将特定更新标记为“过渡”来显著改善用户交互，简单来说，**就是被  startTransition  回调包裹的  setState  触发的渲染被标记为不紧急渲染，这些渲染可能被其他紧急渲染所抢占。**

#### useDeferredValue

**返回一个延迟响应的值，可以让一个 state 延迟生效，只有当前没有紧急更新时，该值才会变为最新值**。useDeferredValue 和 startTransition 一样，都是标记了一次非紧急更新。
从介绍上来看 useDeferredValue 与 useTransition 是否感觉很相似呢？

- 相同：useDeferredValue 本质上和内部实现与 useTransition 一样，都是标记成了延迟更新任务。
- 不同：
  - **useTransition 是把更新任务变成了延迟更新任务**，
  - **而 useDeferredValue 是产生一个新的值，这个值作为延时状态。（一个用来包装方法，一个用来包装值）**

所以，上面 startTransition 的例子，我们也可以用  useDeferredValue 来实现：

```js
import React, { useState, useEffect, useDeferredValue } from 'react';

const App: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    setList(new Array(10000).fill(null));
  }, []);
  // 使用了并发特性，开启并发更新
  const deferredList = useDeferredValue(list);
  return (
    <>
      {deferredList.map((_, i) => (
        <div key={i}>{i}</div>
      ))}
    </>
  );
};

export default App;


```

### 结论

并发更新的意义就是**交替执行不同的任务，当预留的时间不够用时，React 将线程控制权交还给浏览器，等待下一帧时间到来，然后继续被中断的工作**

1. **并发模式是实现并发更新的基本前提**
2. **时间切片是实现并发更新的具体手段**
   上面所有的东西都是基于 fiber 架构实现的，fiber 为状态更新提供了可中断的能力

#### fiber

提到 fiber 架构，那就顺便科普一下 fiber 到底是个什么东西：
关于 fiber，有三层具体含义：

1. 作为架构来说，在旧的架构中，Reconciler（协调器）采用递归的方式执行，无法中断，节点数据保存在递归的调用栈中，被称为 Stack Reconciler，stack 就是调用栈；在新的架构中，Reconciler（协调器）是基于 fiber 实现的，节点数据保存在 fiber 中，所以被称为 fiber Reconciler。
2. 作为静态数据结构来说，每个 fiber 对应一个组件，保存了这个组件的类型对应的 dom 节点信息，这个时候，fiber 节点就是我们所说的虚拟 DOM。
3. 作为动态工作单元来说，fiber 节点保存了该节点需要更新的状态，以及需要执行的副作用。

链接：https://juejin.cn/post/7094037148088664078
