### 核心思想

1. View 通过 Dispatch 派发 action
2. Store 调用 Reducer，传入当前 state 和 action, Reducer 返新的 State
3. State 一旦发生变化，调用监听函数，更新 view。

### 源码结构

其中，utils 是工具方法库；index.js 作为入口文件，用于对功能模块进行收敛和导出。真正“干活”的是功能模块本身，也就是下面这几个文件：

- createStore.js
  提供生成唯一 store 的函数。createStore 方法是我们在使用 Redux 时最先调用的方法，它是整个流程的入口，也是 Redux 中最核心的 API。

- applyMiddleware.js
  中间件模块
- bindActionCreators.js
  用于将传入的 actionCreator 与 dispatch 方法相结合，揉成一个新的方法
- combineReducers.js
  用于将多个  reducer 合并起来
- compose.js
  用于把接收到的函数从右向左进行组合进行函数式编程

### createStore

源码

```javascript
function createStore(reducer, preloadedState, enhancer) {
  // 这里处理的是没有设定初始状态的情况，也就是第一个参数和第二个参数都传 function 的情况

  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    // 此时第二个参数会被认为是 enhancer（中间件）
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  // 当 enhancer 不为空时，便会将原来的 createStore 作为参数传入到 enhancer 中

  if (typeof enhancer !== "undefined") {
    return enhancer(createStore)(reducer, preloadedState);
  }

  // 记录当前的 reducer，因为 replaceReducer 会修改 reducer 的内容

  let currentReducer = reducer;
  // 记录当前的 state
  let currentState = preloadedState;
  // 声明 listeners 数组，这个数组用于记录在 subscribe 中订阅的事件
  let currentListeners = [];
  // nextListeners 是 currentListeners 的快照
  let nextListeners = currentListeners;
  // 该变量用于记录当前是否正在进行 dispatch
  let isDispatching = false;

  // 该方法用于确认快照是 currentListeners 的副本，而不是currentListeners 本身
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  // 我们通过调用 getState 来获取当前的状态
  function getState() {
    return currentState;
  }

  // subscribe 订阅方法，它将会定义 dispatch 最后执行的 listeners 数组的内容
  function subscribe(listener) {
    // 校验 listener 的类型
    if (typeof listener !== "function") {
      throw new Error("Expected the listener to be a function.");
    }

    // 禁止在 reducer 中调用 subscribe

    if (isDispatching) {
      throw new Error(
        "You may not call store.subscribe() while the reducer is executing. " +
          "If you would like to be notified after the store has been updated, subscribe from a " +
          "component and invoke store.getState() in the callback to access the latest state. " +
          "See https://redux.js.org/api-reference/store#subscribe(listener) for more details."
      );
    }

    // 该变量用于防止调用多次 unsubscribe 函数

    let isSubscribed = true;

    // 确保 nextListeners 与 currentListeners 不指向同一个引用

    ensureCanMutateNextListeners();

    // 注册监听函数

    nextListeners.push(listener);

    // 返回取消订阅当前 listener 的方法

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();

      const index = nextListeners.indexOf(listener);

      // 将当前的 listener 从 nextListeners 数组中删除

      nextListeners.splice(index, 1);
    };
  }

  // 定义 dispatch 方法，用于派发 action

  function dispatch(action) {
    // 校验 action 的数据格式是否合法

    if (!isPlainObject(action)) {
      throw new Error(
        "Actions must be plain objects. " +
          "Use custom middleware for async actions."
      );
    }

    // 约束 action 中必须有 type 属性作为 action 的唯一标识

    if (typeof action.type === "undefined") {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          "Have you misspelled a constant?"
      );
    }

    // 若当前已经位于 dispatch 的流程中，则不允许再度发起 dispatch（禁止套娃）
    if (isDispatching) {
      throw new Error("Reducers may not dispatch actions.");
    }

    try {
      // 执行 reducer 前，先"上锁"，标记当前已经存在 dispatch 执行流程
      isDispatching = true;

      // 调用 reducer，计算新的 state
      currentState = currentReducer(currentState, action);
    } finally {
      // 执行结束后，把"锁"打开，允许再次进行 dispatch
      isDispatching = false;
    }

    // 触发订阅

    const listeners = (currentListeners = nextListeners);

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];

      listener();
    }

    return action;
  }

  // replaceReducer 可以更改当前的 reducer

  function replaceReducer(nextReducer) {
    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.REPLACE });
    return store;
  }

  // 初始化 state，当派发一个 type 为 ActionTypes.INIT 的 action，每个 reducer 都会返回

  // 它的初始值

  dispatch({ type: ActionTypes.INIT });

  // observable 方法可以忽略，它在 redux 内部使用，开发者一般不会直接接触

  function observable() {
    // observable 方法的实现
  }

  // 将定义的方法包裹在 store 对象里返回

  return {
    dispatch,

    subscribe,

    getState,

    replaceReducer,

    [$$observable]: observable,
  };
}
```

#### createStore 流程：

1. 处理没有传入初始状态的情况
2. 用 enhancer 包装 creatStore
3. 定义 ensureCanMutateNextListeners(); 确保 nextListeners 与 currentListeners 不指向同一个引用

4. 定义 getState() ，用于获取当前状态
5. 定义 subscribe()， 用于注册监听函数
6. 定义 dispatch()， 用于派发 action， 调用 reducer 计算新的 state, 并触发订阅
7. 定义 replaceReducer() 可以更改当前的 reducer
8. 执行 dispatch()，初始化 state，当派发一个 type 为 ActionTypes.INIT 的 action
9. 定义 observable 方法，可以忽略，它在 redux 内部使用，开发者一般不会直接接触

#### 为什么需要 currentListeners

currentListeners 在此处的作用，就是为了记录下当前正在工作中的 listeners 数组的引用，将它与可能发生改变的 nextListeners 区分开来，以确保监听函数在执行过程中的稳定性。

### Redux 中间件

applyMiddleware 接受任意个中间件作为入参，而它的返回值将会作为参数传入 createStore，这就是中间件的引入过程。

```javascript
// 引入 redux

import { createStore, applyMiddleware } from 'redux'
......
// 创建 store

const store = createStore(

    reducer,

    initial_state,

    applyMiddleware(middleware1, middleware2, ...)

);

```

#### 中间件的工作模式：

1. 中间件的执行时机，即 action 被分发之后、reducer 触发之前；

2. 中间件的执行前提，即 applyMiddleware 将会对 dispatch 函数进行改写，使得 dispatch 在触发 reducer 之前，会首先执行对 Redux 中间件的链式调用。

### redux-thunk

redux-thunk 是经典的异步 Action 解决方案，和普通 Redux 调用最大的不同就是 dispatch 的入参从 action 对象变成了一个函数。

redux-thunk 主要做的事情，就是在拦截到 action 以后，会去检查它是否是一个函数。若 action 是一个函数，那么 redux-thunk 就会执行它并且返回执行结果；若 action 不是一个函数，那么它就不是 redux-thunk 的处理目标，直接调用 next，告诉 Redux “我这边的工作做完了”，工作流就可以继续往下走了。

中间件的外层函数的主要作用是获取 dispatch、getState 这两个 API，而真正的中间件逻辑是在内层函数中包裹的。

```javascript
// createThunkMiddleware 用于创建 thunk

function createThunkMiddleware(extraArgument) {
  // 返回值是一个 thunk，它是一个函数

  return ({ dispatch, getState }) => (next) => (action) => {
    // thunk 若感知到 action 是一个函数，就会执行 action

    if (typeof action === "function") {
      return action(dispatch, getState, extraArgument);
    }

    // 若 action 不是一个函数，则不处理，直接放过

    return next(action);
  };
}

const thunk = createThunkMiddleware();

thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```

#### applyMiddleware Redux 中间件实现机制

源码

```javascript
// applyMiddlerware 会使用“...”运算符将入参收敛为一个数组

export default function applyMiddleware(...middlewares) {
  // 它返回的是一个接收 createStore 为入参的函数
  return (createStore) => (...args) => {
    // 首先调用 createStore，创建一个 store
    const store = createStore(...args);

    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      );
    };

    // middlewareAPI 是中间件的入参

    const middlewareAPI = {
      getState: store.getState,

      dispatch: (...args) => dispatch(...args),
    };

    // 遍历中间件数组，调用每个中间件，并且传入 middlewareAPI 作为入参，得到目标函数数组 chain
    /**例如传入redux-thunk中间件，chain=[
        (next) => (action) => {
            if (typeof action === "function") {
            return action(dispatch, getState, extraArgument);
            }
            return next(action);
        };
    ]
    **/
    const chain = middlewares.map((middleware) => middleware(middlewareAPI));

    // 改写原有的 dispatch：将 chain 中的函数按照顺序“组合”起来，调用最终组合出来的函数，传入 dispatch 作为入参

    dispatch = compose(...chain)(store.dispatch);

    // 返回一个新的 store 对象，这个 store 对象的 dispatch 已经被改写过了

    return {
      ...store,

      dispatch,
    };
  };
}
```

### compose 源码解读：函数的合成

```javascript
// compose 会首先利用“...”运算符将入参收敛为数组格式

export default function compose(...funcs) {
  // 处理数组为空的边界情况

  if (funcs.length === 0) {
    return (arg) => arg;
  }

  // 若只有一个函数，也就谈不上组合，直接返回

  if (funcs.length === 1) {
    return funcs[0];
  }

  // 若有多个函数，那么调用 reduce 方法来实现函数的组合 ***
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
```

```javascript
compose(f1, f2, f3, f4);
```

它会把函数组合为这种形式：

```javascript
(...args) => f1(f2(f3(f4(...args))));
```

如此一来，f1、f2、f3、f4 这 4 个中间件的内层逻辑就会被组合到一个函数中去，当这个函数被调用时，f1、f2、f3、f4 将会按照顺序被依次调用。这就是“函数组合”在此处的含义。

### 中间件与面向切面编程 AOP

AOP（面向切面）这个概念可能很多同学都不太了解，大家相对熟悉的应该是 OOP（面向对象）。而 AOP 的存在，恰恰是为了解决 OOP 的局限性，我们可以将 AOP 看作是对 OOP 的一种补充。

在 OOP 模式下，当我们想要拓展一个类的逻辑时，最常见的思路就是继承：class A 继承 class B，class B 继承 class C......这样一层一层将逻辑向下传递。

当我们想要为某几个类追加一段共同的逻辑时，可以通过修改它们共同的父类来实现，这无疑会使得公共类越来越臃肿，可我们也确实没有什么更好的办法——总不能任这些公共逻辑散落在不同的业务逻辑里吧？那将会引发更加严重的代码冗余及耦合问题。

考虑某些需求的**通用性很强、业务属性很弱**，因此不适合与任何的业务逻辑耦合在一起。那我们就可以以 “切面”这种形式，把它与业务逻辑剥离开来：扩展功能在工作流中的执行节点，可以视为一个单独“切点”；我们把扩展功能的逻辑放到这个“切点”上来，形成的就是一个可以拦截前序逻辑的“切面”，“切面”与业务逻辑是分离的，因此 **AOP 是一种典型的 “非侵入式”的逻辑扩充思路**。

从 Redux 中间件机制中，不难看出，面向切面思想在很大程度上**提升了我们组织逻辑的灵活度与干净度，帮助我们规避掉了逻辑冗余、逻辑耦合这类问题**。通过将“切面”与业务逻辑剥离，开发者能够专注于业务逻辑的开发，并通过“**即插即用**”的方式自由地组织自己想要的扩展功能。

### 参考链接

[深入浅出搞定 React 之从 Redux 中间件实现原理切入，理解“面向切面编程”](https://kaiwu.lagou.com/course/courseInfo.htm?courseId=510#/detail/pc?id=4867)
