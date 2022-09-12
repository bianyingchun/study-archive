### Diff 算法

diff 算法是指生成更新补丁的方式，主要应用于虚拟 DOM 树变化后，更新真实 DOM。所以 diff 算法一定存在这样一个过程：触发更新 → 生成补丁 → 应用补丁。

具体的流程是这样的：

1. 真实 DOM 与虚拟 DOM 之间存在一个映射关系。这个映射关系依靠初始化时的 JSX 建立完成；

2. 当虚拟 DOM 发生变化后，就会根据差距计算生成 patch，这个 patch 是一个结构化的数据，内容包含了增加、更新、移除等；

3. 最后再根据 patch 去更新真实的 DOM，反馈到用户的界面上。

### React Diff 策略

React 的 diff 算法，**触发更新的时机主要在 state 变化与 hooks 调用之后**。此时触发虚拟 DOM 树变更遍历，采用了**深度优先遍历**算法，因为广度优先遍历可能会导致组件的生命周期时序错乱，而深度优先遍历算法就可以解决这个问题。但传统的遍历方式，效率较低，运算复杂度常常是 O(n^3)。为了优化效率，使用了分治的方式。将单一节点比对转化为了 3 种类型节点的比对，分别是树、组件及元素，以此提升效率。

#### Tree Diff：忽略节点跨层级操作场景，提升比对效率。

这一策略需要进行树比对，即对树进行分层比较。树比对的处理手法是非常“暴力”的，即两棵树只对同一层次的节点进行比较，如果发现节点已经不存在了，则该节点及其子节点会被完全删除掉，不会用于进一步的比较，这就提升了比对效率。

![pic](https://pic2.zhimg.com/80/d712a73769688afe1ef1a055391d99ed_720w.png)

在上图，当出现节点跨层级移动时，并不会出现想象中的移动操作，而是以 A 为根节点的树被整个重新创建，这是一种影响 React 性能的操作，因此 React 官方建议不要进行 DOM 节点跨层级的操作。

#### Component Diff: 如果组件的类型一致，则默认为相似的树结构，否则默认为不同的树结构。

在组件比对的过程中：如果组件是同一类型则进行 Tree Diff；如果不是则直接放入补丁中，将该组件判断为 dirty component，从而替换整个组件下的所有子节点。只要父组件类型不同，就会被重新渲染。这也就是为什么 shouldComponentUpdate、PureComponent 及 React.memo 可以提高性能的原因。

#### Element Diff: 同一层级的子节点，可以通过标记 key 的方式进行列表对比。

元素比对主要发生在同层级中，通过标记节点操作生成补丁。节点操作包含了：INSERT_MARKUP（插入）、MOVE_EXISTING（移动）和 REMOVE_NODE（删除）。其中节点重新排序同时涉及插入、移动、删除三个操作，所以效率消耗最大，此时 Element Diff 起到了至关重要的作用。

通过标记 key 的方式，React 可以直接移动 DOM 节点，降低内耗。

### React 16 引入 Fiber 后对 Diff 的影响

Fiber 机制下节点与树分别采用 FiberNode 与 FiberTree 进行重构。FiberNode 使用了双链表的结构，可以直接找到兄弟节点与子节点，使得整个更新过程可以随时暂停恢复。FiberTree 则是通过 FiberNode 构成的树。

Fiber 机制下，整个更新过程由 current 与 workInProgress 两株树双缓冲完成。当 workInProgress 更新完成后，通过修改 current 相关指针指向的节点，直接抛弃老树，虽然非常简单粗暴，却非常合理。

### React 与 Vue Diff 算法的比较

Vue 所以整体思路与 React 相同。但在元素对比时，如果新旧两个元素是同一个元素，且没有设置 key 时，Vue 在 diff 子元素中会一次性对比旧节点、新节点及它们的**首尾元素**四个节点，循环从两边向中间比较，以及验证列表是否有变化。

#### 新旧集合元素相同，位置不同，做移动操作

首先对新集合的节点进行循环遍历，确定两个变量:**mountIndex:当前节点在旧集合中的位置，lastIndex:访问过的节点在旧集合中最大的位置**。如果 lastIndex < \_mountIndex ,则说明当前节点在旧集合中位置比上一个节点靠后，则该节点不会影响其他节点的位置。不动，否则移动节点。

![图片](https://pic2.zhimg.com/80/7541670c089b84c59b84e9438e92a8e9_720w.png)
示例：

1. 节点 B：lastIndex=0,\_mountIndex=1;满足 lastIndex < \_mountIndex，因此 B 节点不动，更新 lastIndex = Math.max(\_mountIndex, lastIndex) = 1
2. 节点 A：lastIndex=1,\_mountIndex=0;不满足 lastIndex > \_mountIndex，因此 A 节点进行移动操作，更新 lastIndex = Math.max(\_mountIndex, lastIndex)= 1
3. 节点 D：lastIndex=1,\_mountIndex=3;满足 lastIndex < \_mountIndex，因此 D 节点不动，更新 lastIndex = Math.max(\_mountIndex, lastIndex) = 3；
4. 节点 C：lastIndex=3,\_mountIndex=2;不满足 lastIndex < \_mountIndex，因此 C 节点进行移动操作，比对完毕

#### 新集合中有新的节点以及旧集合存在需要删除的节点，遍历移动，新增节点后，再次遍历删除无用节点。

![图片](https://pic1.zhimg.com/80/7b9beae0cf0a5bc8c2e82d00c43d1c90_720w.png)

1. 节点 B : mountIndex = 1, lastIndex = 0, lastIndex < mountIndex , 不动，更新 lastIndex = Math.max(\_mountIndex, lastIndex) = 1
2. 节点 E : 旧集合中 E 不存在，创建新节点 E， 更新 lastIndex = Math.max(\_mountIndex, lastIndex)= 1
3. 节点 C: mountIndex = 2, lastIndex = 1, lastIndex < mountIndex , 不动，更新 lastIndex = Math.max(\_mountIndex, lastIndex) = 2
4. 节点 A: \_mountIndex = 0，lastIndex = 2, lastIndex > mouteIndex, 移动 A, 更新 lastIndex = Math.max(\_mountIndex, lastIndex) = 2
5. **最后循环遍历旧集合，判断是否存在新集合中未出现的元素，发现 D，删除 D，到此 diff 完毕**。

#### 建议

当然，React diff 还是存在些许不足与待优化的地方，如下图所示，若新旧集合对比只有 D 节点移动，而 A、B、C 仍然保持原有的顺序，理论上 diff 应该只需对 D 执行移动操作，然而由于 D 在旧集合的位置是最大的，导致其他节点的 \_mountIndex < lastIndex，造成 D 没有执行移动操作，而是 A、B、C 全部移动到 D 节点后面的现象。

![图片](https://pic2.zhimg.com/80/1b8dac5b9b3e4452dec8d5447d7717ad_720w.png)

建议：在开发过程中，尽量减少类似将最后一个节点移动到列表首部的操作，当节点数量过大或更新操作过于频繁时，在一定程度上会影响 React 的渲染性能。

### 参考文章

1. [React 源码剖析系列 － 不可思议的 react diff](https://zhuanlan.zhihu.com/p/20346379)
