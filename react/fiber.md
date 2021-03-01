### 1.React 15 的问题

在页面元素很多，且需要频繁刷新的场景下，React 15 会出现掉帧的现象。其根本原因，是大量的同步计算任务阻塞了浏览器的 UI 渲染。默认情况下，JS 运算、页面布局和页面绘制都是运行在浏览器的主线程当中，他们之间是互斥的关系。如果 JS 运算持续占用主线程，页面就没法得到及时的更新。当我们调用 setState 更新页面的时候，React 会遍历应用的所有节点，react 局具体卡顿原因：Stack reconciler 的工作流程很像函数的调用过程。父组件里调子组件，可以类比为函数的递归（这也是为什么被称为 stack reconciler 的原因）。在 setState 后，react 会立即开始 reconciliation 过程，从父节点（Virtual DOM）开始遍历，以找出不同。将所有的 Virtual DOM 遍历完成后，reconciler 才能给出当前需要修改真实 DOM 的信息，并传递给 renderer，进行渲染，然后屏幕上才会显示此次更新内容。对于特别庞大的 vDOM 树来说，reconciliation 过程会很长(x00ms)，在这期间，主线程是被 js 占用的，因此任何交互、布局、渲染都会停止，给用户的感觉就是页面被卡住了。

针对这一问题，React 团队从框架层面对 web 页面的运行机制做了优化，得到很好的效果。

### 2.解题思路

解决主线程长时间被 JS 运算占用这一问题的基本思路，**是将运算切割为多个步骤，分批完成。也就是说在完成一部分任务之后，将控制权交回给浏览器，让浏览器有时间进行页面的渲染。等浏览器忙完之后，再继续之前未完成的任务。**

旧版 React 通过递归的方式进行渲染，使用的是 JS 引擎自身的函数调用栈，它会一直执行到栈空为止。而 Fiber 实现了自己的组件调用栈，它以链表的形式遍历组件树，可以灵活的暂停、继续和丢弃执行的任务。实现方式是使用了浏览器的 requestIdleCallback 这一 API。官方的解释是这样的：window.requestIdleCallback()会在浏览器空闲时期依次调用函数，这就可以让开发者在主事件循环中执行后台或低优先级的任务，而且不会对像动画和用户交互这些延迟触发但关键的事件产生影响。函数一般会按先进先调用的顺序执行，除非函数在浏览器调用它之前就到了它的超时时间。(详情:https://www.cnblogs.com/goloving/p/14074006.html)

有了解题思路后，我们再来看看 React 具体是怎么做的。

### 4.React 的答卷

React 框架内部的运作可以分为 3 层：

1. Virtual DOM 层，描述页面长什么样。
2. Reconciler 层，负责调用组件生命周期方法，进行 Diff 运算等。
3. Renderer 层，根据不同的平台，渲染出相应的页面，比较常见的是 ReactDOM 和 ReactNative。
   这次改动最大的当属 Reconciler 层了，React 团队也给它起了个新的名字，叫 Fiber Reconciler。这就引入另一个关键词：Fiber。

Fiber 其实指的是一种数据结构，它可以用一个纯 JS 对象来表示：

const fiber = {
stateNode, // 节点实例
child, // 子节点
sibling, // 兄弟节点
return, // 父节点
}
为了加以区分，以前的 Reconciler 被命名为 Stack Reconciler。Stack Reconciler 运作的过程是不能被打断的，必须一条道走到黑。而 Fiber Reconciler 每执行一段时间，都会将控制权交回给浏览器，可以分段执行。

为了达到这种效果，就需要有一个调度器 (Scheduler) 来进行任务分配。任务的优先级有六种：

1. synchronous，与之前的 Stack Reconciler 操作一样，同步执行
2. task，在 next tick 之前执行
3. animation，下一帧之前执行
4. high，在不久的将来立即执行
5. low，稍微延迟执行也没关系
6. offscreen，下一次 render 时或 scroll 时才执行
7. 优先级高的任务（如键盘输入）可以打断优先级低的任务（如 Diff）的执行，从而更快的生效。

Fiber Reconciler 在执行过程中，会分为 2 个阶段。

- 阶段一，生成 Fiber 树，得出需要更新的节点信息。这一步是一个渐进的过程，可以被打断。
- 阶段二，将需要更新的节点一次性批量更新，这个过程不能被打断。

阶段一可被打断的特性，让优先级更高的任务先执行，从框架层面大大降低了页面掉帧的概率。

### 5.Fiber 树

Fiber Reconciler 在阶段一进行 Diff 计算的时候，会生成一棵 Fiber 树。这棵树是在 Virtual DOM 树的基础上增加额外的信息来生成的，**它本质来说是一个链表。**

Fiber 树在首次渲染的时候会一次性生成。在后续需要 Diff 的时候，会根据已有树和最新 Virtual DOM 的信息，生成一棵新的树。这颗新树每生成一个新的节点，都会将控制权交回给主线程，去检查有没有优先级更高的任务需要执行。如果没有，则继续构建树的过程. 如果过程中有优先级更高的任务需要进行，则 Fiber Reconciler 会丢弃正在生成的树，在空闲的时候再重新执行一遍。

在构造 Fiber 树的过程中，Fiber Reconciler 会将需要更新的节点信息保存在 Effect List 当中，在阶段二执行的时候，会批量更新相应的节点。

注意：React.createElement 创建一颗 Element 树，可以称之为 Virtual DOM Tree

### 6. firber nodes

在 reconciliation 期间，来自 render 方法返回的每个 React 元素的数据被合并到 fiber node 树中，每个 React 元素都有一个相应的 fiber node。与 React 元素不同，每次渲染过程，不会再重新创建 fiber。这些可变的数据包含组件 state 和 DOM。
可以这样认为：**fiber 作为一种数据结构，用于代表某些 worker，换句话说，就是一个 work 单元，通过 Fiber 的架构，提供了一种跟踪，调度，暂停和中止工作的便捷方式**。

当 React 元素第一次转换为 fiber 节点时，React 使用 createElement 返回的数据来创建 fiber。在随后的更新中，React 重用 fiber 节点，并使用来自相应 React 元素的数据来更新必要的属性。如果不再从 render 方法返回相应的 React 元素，React 可能还需要根据 key 来移动层次结构中的节点或删除它。

所有 fiber 节点都通过使用 fiber 节点上的以下属性：child，sibling 和 return 来构成一个 fiber node 的 linked list(后面我们称之为链表)

##### fiber tree

在第一次**渲染之后**，React 最终得到一个 fiber tree，它**反映了用于渲染 UI 的应用程序的状态。这棵树通常被称为 current tree**。当 React 开始**处理更新**时，它会构建一个所谓的 **workInProgress tree，它反映了要刷新到屏幕的未来状态**。

所有 work 都在 workInProgress tree 中的 fiber 上执行。当 React 遍历 current tree 时，对于每个现有 fiber 节点，它会使用 render 方法返回的 React 元素中的数据创建一个**备用(alternate)fiber 节点**，这些节点**用于构成 workInProgress tree(备用 tree)**。处理完更新并完成所有相关工作后，React 将备用 tree 刷新到屏幕。一旦这个 **workInProgress tree 在屏幕上呈现，它就会变成 current tree**。

React 的核心原则之一是一致性。 React 总是一次更新 DOM - 它不会显示部分结果。 workInProgress tree 对用户不可见，因此 React 可以先处理完所有组件，然后将其更改刷新到屏幕。

### React 把一次渲染分为两个阶段：render 和 commit。

在 render 阶段时，React 通过 setState 或 React.render 来执行组件的更新，并确定需要在 UI 中更新的内容。如果是第一次渲染，React 会为 render 方法返回的每个元素，创建一个新的 fiber 节点。**在接下来的更新中，将重用和更新现有 React 元素的 fiber 节点。render 阶段的结果是生成一个部分节点标记了 side effects 的 fiber 节点树，side effects 描述了在下一个 commit 阶段需要完成的工作。**

在 commit 阶段，React 采用标有 side effects 的 fiber 树并将其应用于实例。它遍历 side effects 列表并执行 DOM 更新和用户可见的其他更改。

一个很重要的点是，**render 阶段可以异步执行**。 React 可以根据可用时间来处理一个或多个 fiber 节点，然后停止已完成的工作，并让出调度权来处理某些事件。然后它从它停止的地方继续。但有时候，它可能需要丢弃完成的工作并再次从头。由于在 render 阶段执行的工作不会导致任何用户可见的更改（如 DOM 更新），因此这些暂停是不会有问题的。相反，**在接下来的 commit 阶段始终是同步的，这是因为在此阶段执行的工作，将会生成用户可见的变化，**例如， DOM 更新，这就是 React 需要一次完成它们的原因。

##### 参考链接:

https://segmentfault.com/a/1190000018250127
https://zhuanlan.zhihu.com/p/57346388 [译]深入 React fiber 架构及源码
https://zhuanlan.zhihu.com/p/57856350 [译]深入 React fiber 链表和 DFS

<!-- =========https://juejin.cn/post/6844903582622285831 -->

### Scheduler

scheduling(调度)是 fiber reconciliation 的一个过程，主要决定应该在何时做什么。👆 的过程表明在 stack reconciler 中，reconciliation 是“一气呵成”，对于函数来说，这没什么问题，因为我们只想要函数的运行结果，但对于 UI 来说还需要考虑以下问题：

- 并不是所有的 state 更新都需要立即显示出来，比如屏幕之外的部分的更新
- 并不是所有的更新优先级都是一样的，比如用户输入的响应优先级要比通过请求填充内容的响应优先级更高
- 理想情况下，对于某些高优先级的操作，应该是可以打断低优先级的操作执行的，比如用户输入时，页面的某个评论还在 reconciliation，应该优先响应用户输入

所以理想状况下 reconciliation 的过程应该是像下图所示一样，每次只做一个很小的任务，做完后能够“喘口气儿”，回到主线程看下有没有什么更高优先级的任务需要处理，如果又则先处理更高优先级的任务，没有则继续执行
。

### 任务拆分 fiber-tree & fiber

先看一下 stack-reconciler 下的 react 是怎么工作的。代码中创建（或更新）一些元素，react 会根据这些元素创建（或更新）Virtual DOM，然后 react 根据更新前后 virtual DOM 的区别，去修改真正的 DOM。注意，在 stack reconciler 下，DOM 的更新是同步的，也就是说，在 virtual DOM 的比对过程中，发现一个 instance 有更新，会立即执行 DOM 操作。
而 fiber-conciler 下，操作是可以分成很多小部分，并且可以被中断的，所以同步操作 DOM 可能会导致 fiber-tree 与实际 DOM 的不同步。对于每个节点来说，其不光存储了对应元素的基本信息，还要保存一些用于任务调度的信息。因此，fiber 仅仅是一个对象，表征 reconciliation 阶段所能拆分的最小工作单元，和上图中的 react instance 一一对应。通过 stateNode 属性管理 Instance 自身的特性。通过 child 和 sibling 表征当前工作单元的下一个工作单元，return 表示处理完成后返回结果所要合并的目标，通常指向父节点。整个结构是一个链表树。每个工作单元（fiber）执行完成后，都会查看是否还继续拥有主线程时间片，如果有继续下一个，如果没有则先处理其他高优先级事务，等主线程空闲下来继续执行。

### 举个例子

当前页面包含一个列表，通过该列表渲染出一个 button 和一组 Item，Item 中包含一个 div，其中的内容为数字。通过点击 button，可以使列表中的所有数字进行平方。另外有一个按钮，点击可以调节字体大小。

页面渲染完成后，就会初始化生成一个 fiber-tree。初始化 fiber-tree 和初始化 Virtual DOM tree 没什么区别，这里就不再赘述。

同时，react 还会维护一个 workInProgressTree。workInProgressTree 用于计算更新，完成 reconciliation 过程。

用户点击平方按钮后，利用各个元素平方后的 list 调用 setState，react 会把当前的更新送入 list 组件对应的 update queue 中。但是 react 并不会立即执行对比并修改 DOM 的操作。而是交给 scheduler 去处理。

scheduler 会根据当前主线程的使用情况去处理这次 update。为了实现这种特性，使用了 requestIdelCallbackAPI。对于不支持这个 API 的浏览器，react 会加上 pollyfill。
总的来讲，通常，客户端线程执行任务时会以帧的形式划分，大部分设备控制在 30-60 帧是不会影响用户体验；在两个执行帧之间，主线程通常会有一小段空闲时间，requestIdleCallback 可以在这个空闲期（Idle Period）调用空闲期回调（Idle Callback），执行一些任务

1. 低优先级任务由 requestIdleCallback 处理；
2. 高优先级任务，如动画相关的由 requestAnimationFrame 处理；
3. requestIdleCallback 可以在多个空闲期调用空闲期回调，执行任务；
4. requestIdleCallback 方法提供 deadline，即任务执行限制时间，以切分任务，避免长时间执行，阻塞 UI 渲染而导致掉帧；
   一旦 reconciliation 过程得到时间片，就开始进入 work loop。work loop 机制可以让 react 在计算状态和等待状态之间进行切换。为了达到这个目的，对于每个 loop 而言，需要追踪两个东西：

- 下一个工作单元（下一个待处理的 fiber）;
- 当前还能占用主线程的时间。
  第一个 loop，下一个待处理单元为根节点。因为根节点上的更新队列为空，所以直接从 fiber-tree 上将根节点复制到 workInProgressTree 中去。根节点中包含指向子节点（List）的指针。
  根节点处理完成后，react 此时检查时间片是否用完。如果没有用完，根据其保存的下个工作单元的信息开始处理下一个节点 List。
  接下来进入处理 List 的 work loop，List 中包含更新，因此此时 react 会调用 setState 时传入的 updater funciton 获取最新的 state 值，此时应该是[1,4,9]。通常我们现在在调用 setState 传入的是一个对象，但在使用 fiber conciler 时，必须传入一个函数，函数的返回值是要更新的 state。react 从很早的版本就开始支持这种写法了，不过通常没有人用。在之后的 react 版本中，可能会废弃直接传入对象的写法。

```javascript
setState({}, callback); // stack conciler
setState(() => {
  return {};
}, callback); // fiber conciler
```

在获取到最新的 state 值后，react 会更新 List 的 state 和 props 值，然后调用 render，然后得到一组通过更新后的 list 值生成的 elements。react 会根据生成 elements 的类型，来决定 fiber 是否可重用。对于当前情况来说，新生成的 elments 类型并没有变（依然是 Button 和 Item），所以 react 会直接从 fiber-tree 中复制这些 elements 对应的 fiber 到 workInProgress 中。并给 List 打上标签，因为这是一个需要更新的节点。
List 节点处理完成，react 仍然会检查当前时间片是否够用。如果够用则处理下一个，也就是 button。加入这个时候，用户点击了放大字体的按钮。这个放大字体的操作，纯粹由 js 实现，跟 react 无关。但是操作并不能立即生效，因为 react 的时间片还未用完，因此接下来仍然要继续处理 button。
button 没有任何子节点，所以此时可以返回，并标志 button 处理完成。如果 button 有改变，需要打上 tag，但是当前情况没有，只需要标记完成即可。老规矩，处理完一个节点先看时间够不够用。注意这里放大字体的操作已经在等候释放主线程了
第二个 Item shouldComponentUpdate 返回 true，所以需要打上 tag，标志需要更新，复制 div，调用 render，讲 div 中的内容从 2 更新为 4，因为 div 有更新，所以标记 div。当前节点处理完成.
接下来处理第一个 item。通过 shouldComponentUpdate 钩子可以根据传入的 props 判断其是否需要改变。对于第一个 Item 而言，更改前后都是 1,所以不会改变，shouldComponentUpdate 返回 false，复制 div，处理完成，检查时间，如果还有时间进入第二个 Item
对于上面这种情况，div 已经是叶子节点，且没有任何兄弟节点，且其值已经更新，这时候，需要将此节点改变产生的 effect 合并到父节点中。此时 react 会维护一个列表，其中记录所有产生 effect 的元素.合并后，回到父节点 Item，父节点标记完成。
下一个工作单元是 Item，在进入 Item 之前，检查时间。但这个时候时间用完了。此时 react 必须交换主线程，并告诉主线程以后要为其分配时间以完成剩下的操作。
主线程接下来进行放大字体的操作。完成后执行 react 接下来的操作，跟上一个 Item 的处理流程几乎一样，处理完成后整个 fiber-tree 和 workInProgress 如下：完成后，Item 向 List 返回并 merge effect，effect List 现在如下所示：

此时 List 向根节点返回并 merge effect，所有节点都可以标记完成了。此时 react 将 workInProgress 标记为 pendingCommit。意思是可以进入 commit 阶段了。
此时，要做的是还是检查时间够不够用，如果没有时间，会等到时间再去提交修改到 DOM。进入到阶段 2 后，reacDOM 会根据阶段 1 计算出来的 effect-list 来更新 DOM。
更新完 DOM 之后，workInProgress 就完全和 DOM 保持一致了，为了让当前的 fiber-tree 和 DOM 保持一致，react 交换了 current 和 workinProgress 两个指针。

###### 小结

通过将 reconciliation 过程，分解成小的工作单元的方式，可以让页面对于浏览器事件的响应更加及时。但是另外一个问题还是没有解决，就是如果当前在处理的 react 渲染耗时较长，仍然会阻塞后面的 react 渲染。这就是为什么 fiber reconciler 增加了优先级策略。

优先级策略的核心是，在 reconciliation 阶段，低优先级的操作可以被高优先级的操作打断，并让主线程执行高优先级的更新，以时用户可感知的响应更快。值得注意的一点是，当主线程重新分配给低优先级的操作时，并不会从上次工作的状态开始，而是从新开始。

这就可能会产生两个问题：

1. 饿死：正在实验中的方案是重用，也就是说高优先级的操作如果没有修改低优先级操作已经完成的节点，那么这部分工作是可以重用的。
2. 一次渲染可能会调用多次生命周期函数
