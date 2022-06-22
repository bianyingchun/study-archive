## 任务拆分 fiber-tree & fiber

#### stack-reconciler 下的 react 是怎么工作的

代码中创建（或更新）一些元素，react 会根据这些元素创建（或更新）Virtual DOM，然后 react 根据更新前后 virtual DOM 的区别，去修改真正的 DOM。注意，**在 stack reconciler 下，DOM 的更新是同步的，也就是说，在 virtual DOM 的比对过程中，发现一个 instance 有更新，会立即执行 DOM 操作。**

#### fiber-reconciler

而 fiber-reconciler 下，操作是可以分成很多小部分，并且可以被中断的，所以同步操作 DOM 可能会导致 fiber-tree 与实际 DOM 的不同步。**对于每个节点来说，其不光存储了对应元素的基本信息，还要保存一些用于任务调度的信息。**

因此，fiber 仅仅是一个对象，表征 reconciliation 阶段所能拆分的**最小工作单元**，和上图中的 react instance 一一对应。

通过 stateNode 属性管理 Instance 自身的特性。**通过 child 和 sibling 表征当前工作单元的下一个工作单元，return 表示处理完成后返回结果所要合并的目标，通常指向父节点。整个结构是一个链表树。**

当组件发生更新时，react 会把当前的更新送入组件对应的 update queue 中。但是 react 并不会立即执行对比并修改 DOM 的操作。而是交给 scheduler 去处理。scheduler 会根据当前主线程的使用情况去处理这次 update。

**每个工作单元（fiber）执行完成后，都会查看是否还继续拥有主线程时间片**，如果有继续下一个，如果没有则先处理其他高优先级事务，等主线程空闲下来继续执行。**如果在一次遍历时发现如果有过期任务，会立即执行，即使时间片已经用完。**

一旦 reconciliation 过程得到时间片，就开始进入 work loop。work loop 机制可以让 react 在计算状态和等待状态之间进行切换。为了达到这个目的，对于每个 loop 而言，需要追踪两个东西：下一个工作单元（下一个待处理的 fiber）;当前还能占用主线程的时间。第一个 loop，下一个待处理单元为根节点。

#### FiberNode

- nextEffect 标记具有 DOM 更新或与其关联的其他 effects 的节点, effectList 的连接属性

- effectTag 标记与之相关的 effects

- alternate 备用 fiber 节点， workInProgress 和 current 树的连接属性

- stateNode：保存对组件的类实例，DOM 节点或与 fiber 节点关联的其他 React 元素类型的引用。一般来说，可以认为这个属性用于保存与 fiber 相关的本地状态。

- type：定义与此 fiber 关联的功能或类。对于类组件，它指向构造函数；对于 DOM 元素，它指定 HTML tag。可以使用这个字段来理解 fiber 节点与哪个元素相关。

- tag：定义 fiber 的类型。它在 reconcile 算法中用于确定需要完成的工作。工作取决于 React 元素的类型，函数 createFiberFromTypeAndProps 将 React 元素映射到相应的 fiber 节点类型。在我们的应用程序中，ClickCounter 组件的属性标记是 1，表示 ClassComponent，而 span 元素的属性标记是 5，表示 Host Component。

- updateQueue：用于状态更新，回调函数，DOM 更新的队列

- memoizedState：用于创建输出的 fiber 状态。处理更新时，它会反映当前在屏幕上呈现的状态。

- memoizedProps：在前一次渲染期间用于创建输出的 props

- pendingProps：已从 React 元素中的新数据更新，并且需要应用于子组件或 DOM 元素的 props

- key：具有一组 children 的唯一标识符，可帮助 React 确定哪些项已更改，已添加或从列表中删除。它与此处描述的 React 的“list and key”功能有关。

###
