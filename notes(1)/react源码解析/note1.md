1.  初始化

    1.  **legacyRenderSubtreeIntoContainer**
        1. 完成 fiber 树基本实体的创建
           1. 调用**legacyCreateRootFromComContainer** ，创建 Container.\_reactRootContainer 对象，并赋值 root
           2. 将 root.\_internalRoot 赋值给 fiberRoot(FiberRootNode 实例)， fiberRoot.current = rootFiber(FiberNode 实例)
        2. fiberRoot 将和 ReactDOM.render 方法的其他入参一起，作为 **unbatchedUpdates** 的回调执行, 回调 是一个针对 **updateContainer** 的调用.
           **updateContainer**
           1. **requestUpdateLane**获取当前 Fiber 节点的的 lane(优先级)
           2. **createUpdate**结合 lane,创建当前 fiber 节点的 update 对象
           3. **enqueueUpdate** 将 update 入队
           4. **scheduleUpdateOnFiber** 调度 fiberRoot
              **scheduleUpdateOnFiber**
              scheduleUpdateOnFiber 的任务就是调度当前节点的更新， 在这个函数中，会处理一系列与优先级、打断操作相关的逻辑。 但是在 ReactDOM.render 发起的**首次渲染链路中，这些意义都不大，因为这个渲染过程其实是同步的。**，scheduleUpdateOnFiber 中会调用 performSyncWorkOnRoot,performSyncWorkOnRoot 直译过来就是“执行根节点的同步任务”。 如果想要开启异步渲染，我们需要调用 **ReactDOM.createRoot** 方法来启动应用

2.  render 阶段

    1. performSyncWorkOnRoot->renderRootSync->prepareFreshStack->**createWorkProgress**
       **createWorkProgress 创建 workInProgress 工作单元**

       1. 调用 **createFiber** 创建 workInProgress
          creteFiber 会创建一个 FiberNode 实例,**workInProgress 节点其实就是 current 节点（即 rootFiber）的副本。**
       2. workInProgress 和 current, 通过 alternate 属性互相引用

    2. renderRoot 调用 workLoopSync/workLoop 循环更新

       ```js
        function renderRoot() {
          do {
              try {
                if (isSync) {
                  workLoopSync();
                } else {
                  workLoop();
                }
                break;
              }
          // ...
        }

        function workLoop() { // 异步模式
          while (workInProgress !== null && !shouldYield()) {
            workInProgress = performUnitOfWork(workInProgress);
          }
        }

        function workLoopSync() { // 同步模式
          while (workInProgress !== null && !shouldYield()) {
          performUnitWork(workInProgress);
          }
        }
       ```

    3. **workLoopSync** 同步模式
       workLoopSync 循环判断 workInProgress 是否为空，不为空针对它执行 **performUnitOfWork** 函数
       **performUnitOfWork**

       ```js
        function performUnitOfWork(unitOfWork) {
          ......
          // 获取入参节点对应的 current 节点
          var current = unitOfWork.alternate;
          var next;
          if (xxx) {
            ...
            // 创建当前节点的子节点
            next = beginWork(current, unitOfWork, subtreeRenderLanes);
            ...
          } else {
            // 创建当前节点的子节点
            next = beginWork(current, unitOfWork, subtreeRenderLanes);
          }
          unitOfWork.memoizedProps = unitOfWork.pendingProps;
          ......
          //// Fiber 树已经更新到叶子节点
          if (next === null) {
            // 调用 completeUnitOfWork
            completeUnitOfWork(unitOfWork);
          } else {
            // 将当前节点更新为新创建出的 Fiber 节点
            workInProgress = next;
          }
          ......
          return next
        }
       ```

       **通过循环调用 performUnitOfWork 来触发 beginWork，新的 Fiber 节点就会被不断地创建。**当 workInProgress 终于为空时，说明没有新的节点可以创建了，也就意味着已经完成对整棵 Fiber 树的构建。**调用 completeUnitOfWork**

       1. **beginWork**
          根据 workInProgress 的 tag ，把对应的 FiberNode 上下文压入栈，然后更新节点，对应 render 阶段。beginWork 会返回当前节点的子节点，如果有子节点，继续 workLoop；如果没有子节点，进入 completeUnitOfWork

          ```js
          function beginWork(current, workInProgress, renderLanes) {
            ......
            //  current 节点不为空的情况下，会加一道辨识，看看是否有更新逻辑要处理
            if (current !== null) {
              // 获取新旧 props
              var oldProps = current.memoizedProps;
              var newProps = workInProgress.pendingProps;
              // 若 props 更新或者上下文改变，则认为需要"接受更新"
              if (oldProps !== newProps || hasContextChanged() || (
              workInProgress.type !== current.type )) {
                // 打个更新标
                didReceiveUpdate = true;
              } else if (xxx) {
                // 不需要更新的情况 A
                return A
              } else {
                if (需要更新的情况 B) {
                  didReceiveUpdate = true;
                } else {
                  // 不需要更新的其他情况，这里我们的首次渲染就将执行到这一行的逻辑
                  didReceiveUpdate = false;
                }
              }
            } else {
              didReceiveUpdate = false;
            }
            .....
            // 这坨 switch 是 beginWork 中的核心逻辑，原有的代码量相当大
            switch (workInProgress.tag) {
              ......
              // 这里省略掉大量形如"case: xxx"的逻辑
              // 根节点将进入这个逻辑
              case HostRoot:
                return updateHostRoot(current, workInProgress, renderLanes)
              // dom 标签对应的节点将进入这个逻辑
              case HostComponent:
                return updateHostComponent(current, workInProgress, renderLanes)
              // 文本节点将进入这个逻辑
              case HostText:
                return updateHostText(current, workInProgress)
              ......
              // 这里省略掉大量形如"case: xxx"的逻辑
            }
            // 这里是错误兜底，处理 switch 匹配不上的情况
            {
              {
                throw Error(
                  "Unknown unit of work tag (" +
                    workInProgress.tag +
                    "). This error is likely caused by a bug in React. Please file an issue."
                )
              }
            }
          }
          ```

          beginWork 的核心逻辑是根据 fiber 节点（workInProgress）的 tag 属性的不同，调用不同的节点创建函数。**就 render 链路来说，它们共同的特性，就是都会通过调用 reconcileChildren 方法，生成当前节点的子节点。**
          **reconcileChildren**

          ```js
          function reconcileChildren(
            current,
            workInProgress,
            nextChildren,
            renderLanes
          ) {
            // 判断 current 是否为 null
            if (current === null) {
              // 若 current 为 null，则进入 mountChildFibers 的逻辑
              workInProgress.child = mountChildFibers(
                workInProgress,
                null,
                nextChildren,
                renderLanes
              );
            } else {
              // 若 current 不为 null，则进入 reconcileChildFibers 的逻辑
              workInProgress.child = reconcileChildFibers(
                workInProgress,
                current.child,
                nextChildren,
                renderLanes
              );
            }
          }
          var reconcileChildFibers = ChildReconciler(true);
          var mountChildFibers = ChildReconciler(false);
          ```

          reconcileChildFibers 和 mountChildFibers 不仅名字相似，出处也一致。它们都是 **ChildReconciler** 这个函数的返回值，仅仅存在入参上的区别。

          ```js
          function ChildReconciler(shouldTrackSideEffects) {
            // 删除节点的逻辑
            function deleteChild(returnFiber, childToDelete) {
              if (!shouldTrackSideEffects) {
                // Noop.
                return;
              }
              // 以下执行删除逻辑
            }
            ......

            // 单个节点的插入逻辑
            function placeSingleChild(newFiber) {
              if (shouldTrackSideEffects && newFiber.alternate === null) {
                newFiber.flags = Placement;
              }
              return newFiber;
            }

            // 插入节点的逻辑
            function placeChild(newFiber, lastPlacedIndex, newIndex) {
              newFiber.index = newIndex;
              if (!shouldTrackSideEffects) {
                // Noop.
                return lastPlacedIndex;
              }
              // 以下执行插入逻辑
            }
            ......
            // 此处省略一系列 updateXXX 的函数，它们用于处理 Fiber 节点的更新

            // 处理不止一个子节点的情况
            function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
              ......
            }
            // 此处省略一堆 reconcileXXXXX 形式的函数，它们负责处理具体的 reconcile 逻辑
            function reconcileChildFibers(returnFiber, currentFirstChild, newChild, lanes) {
              // 这是一个逻辑分发器，它读取入参后，会经过一系列的条件判断，调用上方所定义的负责具体节点操作的函数
            }

            // 将总的 reconcileChildFibers 函数返回
            return reconcileChildFibers;
          }
          ```

          1. 关键的入参 shouldTrackSideEffects，意为“是否需要追踪副作用”，因此 reconcileChildFibers 和 mountChildFibers 的不同，在于**对副作用的处理不同**；给 fiberNode 打上不同的副作用标志 flag
          2. ChildReconciler 中定义了大量如 placeXXX、deleteXXX、updateXXX、reconcileXXX 等这样的函数，这些函数**覆盖了对 Fiber 节点的创建、增加、删除、修改等动作，将直接或间接地被 reconcileChildFibers 所调用**；
          3. ChildReconciler 的返回值是一个名为 reconcileChildFibers 的函数，这个函数是一个逻辑分发器，它将根据入参的不同，执行不同的 Fiber 节点操作，最终返回不同的目标 Fiber 节点。
             **reconcileChildFibers**
             1. reconcileChildFibers 这个逻辑分发器中，会把 rootFiber 子节点的创建工作分发给 reconcileXXX 函数家族的一员——**reconcileSingleElement** 来处理
             2. reconcileSingleElement 将基于 rootFiber 子节点（APP）的 ReactElement 对象信息,创建其对应的 FiberNode。
             3. App 所对应的 Fiber 节点，将被 placeSingleChild 打上“Placement”（新增）的副作用标记
             4. App FiberNode 作为 rootFiber 的 Child 属性，与 workInProgress fiber 建立关联

       2. **completeUnitOfWork**
