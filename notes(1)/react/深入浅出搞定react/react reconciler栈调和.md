**通过如 ReactDOM 等类库使虚拟 DOM 与“真实的” DOM 同步，这一过程叫作协调（调和）。**

说人话：调和指的是将虚拟 DOM 映射到真实 DOM 的过程。因此严格来说，调和过程并不能和 Diff 画等号。调和是“使一致”的过程，而 Diff 是“找不同”的过程，它只是“使一致”过程中的一个环节。

React 的源码结构佐证了这一点：React 从大的板块上将源码划分为了 Core、Renderer 和 Reconciler 三部分。其中 Reconciler（调和器）的源码位于 src/renderers/shared/stack/reconciler 这个路径，调和器所做的工作是一系列的，包括组件的挂载、卸载、更新等过程，其中更新过程涉及对 Diff 算法的调用。

### Dom Diff

1. 分层对比
   React 的 Diff 过程直接放弃了跨层级的节点比较，它只针对相同层级的节点作对比
2. 类型一致才继续 diff
3. 设置 key， 尽可能复用同一层级内的节点

### fiber

### fiber 对生命周期的影响

1. render phase 纯净且没有副作用，可能会被 React 暂停、终止或重新启动
   getDerivedStateFromProps render
2. pre-commit phase 可以读取 DOM
   getSnapShotBeforeUpdate
3. commit phase
   可以使用 DOM，运行副作用，安排更新
   componentDidMount componentDiUpdate

在 render 阶段，一个庞大的更新任务被分解为了一个个的工作单元，这些工作单元有着不同的优先级，React 可以根据优先级的高低去实现工作单元的打断和恢复。由于 render 阶段的操作对用户来说其实是“不可见”的，所以就算打断再重启，对用户来说也是 0 感知。但是，工作单元（也就是任务）的重启将会伴随着对部分生命周期的重复执行，这些生命周期是：

componentWillMount
componentWillUpdate
shouldComponentUpdate
componentWillReceiveProps

其中 shouldComponentUpdate 的作用是通过返回 true 或者 false，来帮助我们判断更新的必要性，一般在这个函数中不会进行副作用操作，因此风险不大。
