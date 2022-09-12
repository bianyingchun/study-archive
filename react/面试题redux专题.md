# redux 的设计思想

Redux 是 Flux 思想的一种体现
三大原则

1. 单一数据源
   整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中。

2. State 是只读的
   唯一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象。

3. 使用纯函数修改
   为了描述 action 如何改变 state tree ，你需要编写 reducers。

# Redux 和 Vuex 的区别和共同思想

## 区别

1. 从表面上来说，store 注入和使用方式有一些区别。

   1. 在 Vuex 中，$store 被直接注入到了组件实例中，因此可以比较灵活的使用

      1. 使用 dispatch 和 commit 提交更新
      2. 通过 mapState 或者直接通过 this.$store 来读取数据

   2. 在 Redux 中，我们每一个组件都需要显示的用 connect 把需要的 props 和 dispatch 连接起来。
   3. 另外 Vuex 更加灵活一些，组件中既可以 dispatch action 也可以 commit updates，而 Redux 中只能进行 dispatch，并不能直接调用 reducer 进行修改。

2. 从实现原理上来说，最大的区别是两点：
   1. Redux 使用的是不可变数据，而 Vuex 的数据是可变的。Redux 每次都是用新的 state 替换旧的 state，而 Vuex 是直接修改
   2. Redux 在检测数据变化的时候，是通过 diff 的方式比较差异的，而 Vuex 其实和 Vue 的原理一样，是通过 getter/setter 来比较的（如果看 Vuex 源码会知道，其实他内部直接创建一个 Vue 实例用来跟踪数据变化）

## 共同思想

单—的数据源
变化可以预测
本质上 ∶ redux 与 vuex 都是对 mvvm 思想的服务，将数据从视图中抽离的一种方案。
# state 是如何注入到组件的，从 reducer 到组件经历了什么样的过程

# Redux 原理及工作流程

## 原理

Redux 源码主要分为以下几个模块文件

- createStore.js
  提供生成唯一 store 的函数。createStore 方法是我们在使用 Redux 时最先调用的方法，它是整个流程的入口，也是 Redux 中最核心的 API。
- applyMiddleware.js
  中间件模块
- bindActionCreators.js
  用于将传入的 actionCreator 与 dispatch 方法相结合，揉成一个新的方法
- combineReducers.js
  用于将多个 reducer 合并起来
- compose.js
  用于把接收到的函数从右向左进行组合进行函数式编程

## 工作流程

const store= createStore（fn）生成数据;
action: {type: Symbol('action01), payload:'payload' }定义行为;
dispatch 发起 action：store.dispatch(doSomething('action001'));
reducer：处理 action，返回新的 state;

通俗点解释：

1. 首先，用户（通过 View）发出 Action，发出方式就用到了 dispatch 方法
2. 然后，Store 自动调用 Reducer，并且传入两个参数：当前 State 和收到的 Action，Reducer 会返回新的 State
3. State—旦有变化，Store 就会调用监听函数，来更新 View

以 store 为核心，可以把它看成数据存储中心，但是他要更改数据的时候不能直接修改，数据修改更新的角色由 Reducers 来担任，store 只做存储，中间人，当 Reducers 的更新完成以后会通过 store 的订阅来通知 react component，组件把新的状态重新获取渲染，组件中也能主动发送 action，创建 action 后这个动作是不会执行的，所以要 dispatch 这个 action，让 store 通过 reducers 去做更新 React Component 就是 react 的每个组件。

## 5. Redux 中间件是什么？接受几个参数？柯里化函数两端的参数具体是什么？

Redux 的中间件提供的是位于 action 被发起之后，到达 reducer 之前的扩展点，换而言之，原本 view -→> action -> reducer -> store 的数据流加上中间件后变成了 view -> action -> middleware -> reducer -> store ，在这一环节可以做一些"副作用"的操作，如异步请求、打印日志等。

```js
applyMiddleware源码：
export default function applyMiddleware(...middlewares) {
    return createStore => (...args) => {
        // 利用传入的createStore和reducer和创建一个store
        const store = createStore(...args)
        let dispatch = () => {
            throw new Error()
        }
        const middlewareAPI = {
            getState: store.getState,
            dispatch: (...args) => dispatch(...args)
        }
        // 让每个 middleware 带着 middlewareAPI 这个参数分别执行一遍
        const chain = middlewares.map(middleware => middleware(middlewareAPI))
        // 接着 compose 将 chain 中的所有匿名函数，组装成一个新的函数，即新的 dispatch
        dispatch = compose(...chain)(store.dispatch)
        return {
            ...store,
            dispatch
        }
    }
}
```

从 applyMiddleware 中可以看出 ∶

- redux 中间件接受一个对象作为参数，对象的参数上有两个字段 dispatch 和 getState，分别代表着 Redux Store 上的两个同名函数。
- 柯里化函数两端一个是 middlewares，一个是 store.dispatch

# Redux 状态管理器和变量挂载到 window 中有什么区别

两者都是存储数据以供后期使用。但是 Redux 状态更改可回溯——Time travel，数据多了的时候可以很清晰的知道改动在哪里发生，完整的提供了一套状态管理模式。且可以通知订阅者数据变更，如 react 组件重渲染

# Redux 中间件是怎么拿到 store 和 action? 然后怎么处理?

redux 中间件本质就是一个函数柯里化。redux applyMiddleware Api 源码中每个 middleware 接受 2 个参数， Store 的 getState 函数和 dispatch 函数，分别获得 store 和 action，最终返回一个函数。该函数会被传入 next 的下一个 middleware 的 dispatch 方法，并返回一个接收 action 的新函数，这个函数可以直接调用 next（action），或者在其他需要的时刻调用，甚至根本不去调用它。调用链中最后一个 middleware 会接受真实的 store 的 dispatch 方法作为 next 参数，并借此结束调用链。所以，middleware 的函数签名是（{ getState，dispatch })=> next => action。

# Redux 中的 connect 有什么作用

connect 负责连接 React 和 Redux

1. 获取 state
   connect 通过 context 获取 Provider 中的 store，通过 store.getState() 获取整个 store tree 上所有 state

2. 包装原组件
   将 state 和 action 通过 props 的方式传入到原组件内部 wrapWithConnect 返回—个 ReactComponent 对象 Connect，Connect 重新 render 外部传入的原组件 WrappedComponent ，并把 connect 中传入的 mapStateToProps，mapDispatchToProps 与组件上原有的 props 合并后，通过属性的方式传给 WrappedComponent

3. 监听 store tree 变化
   connect 缓存了 store tree 中 state 的状态，通过当前 state 状态 和变更前 state 状态进行比较，从而确定是否调用 this.setState()方法触发 Connect 及其子组件的重新渲染


# React-redux 的理解以及原理，主要解决什么问题

[](./redux是如何工作的.md)


# Redux 中异步请求怎么处理
1. redux-thunk 中间件
2. redux-saga 中间件

# redux-thunk 中间件实现

```javascript
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) =>
    (next) =>
    (action) => {
      if (typeof action === "function") {
        return action(dispatch, getState, extraArgument);
      }

      return next(action);
    };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```

# redux-saga 和 redux-thunk 的区别

1. redux-thunk 的整个流程来说，它是等异步任务执行完成之后，我们再去调用 dispatch，然后去 store 去调用 reduces

```js
export function decreaseAsyncCount() {
  return (dispatch) => {
    // 异步操作
    setTimeout(function () {
      dispatch(inscreaseCount());
    }, 1000);
  };
}
```

缺点：

1. **action 的形式不统一**

2. **异步操作太为分散**，分散在了各个 action 中

   
redux-thunk 和 redux-saga 处理异步任务的时机不一样。对于 redux-saga，相对于在 redux 的 action 基础上，重新开辟了一个 async action 的分支，单独处理异步任务，**saga 自己基本上完全弄了一套 async 的事件监听机制**。

redux-saga，把异步操作单独分离出来放在 saga 文件中。当我们提交普通 action 的时候，如果匹配到了 saga 文件中的监听器就会被拦截下来，然后调用 saga 里配置的方法进行异步操作。如果没匹配上就走提交普通 action 的逻辑。总体来说逻辑较为清晰，但是使用成本增加

```js
import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

function* asyncGetData() {
  yield* takeEvery('asyncGetData', asyncGetData)
}

function asyncGetData(action){
  try {
      // 执行函数
      const data = yield call(Api.fetchUser, action.payload.url);
      // 相当于dispatch
      yield put({type: "FETCH_SUCCEEDED", data});
   } catch (error) {
      yield put({type: "FETCH_FAILED", error});
   }
}
```

redux-saga 的优缺点

优点：

（1）集中处理了所有的异步操作，异步接口部分一目了然

（2）action 是普通对象，这跟 redux 同步的 action 一模一样

3. 通过 Effect，方便异步接口的测试

2. 通过 worker 和 watcher 可以实现非阻塞异步调用，并且同时可以实

现非阻塞调用下的事件监听

1. 异步操作的流程是可以控制的，可以随时取消相应的异步操作。

缺点：太复杂，学习成本较高


# redux 请求中间件如何处理并发

1. takeEvery
2. takeLatest

不允许多个 saga 任务并行的执行，一旦接收到新的发起的 action，就会取消前面所有 fork 过的任务。

# 对比 mobx 和 redux

redux 将数据保存在单一的 store 中；mobx 将数据保存在分散的多个 store 中

redux 使用 plain object 保存数据，需要手动处理变化后的操作；mobx 使用 observable 保存数据，数据变化后自动处理响应的操作

redux 使用不可变状态，这意味着状态是只读的，不能直接去修改它，而是应该返回一个新的状态，同时使用纯函数；mobx 中的状态是可变的，可以直接对其进行修改

mobx 相对来说比较简单，在其中有很多的抽象，mobx 更多的使用面向对象的编程思维；redux 会比较复杂，因为其中的函数式编程思想掌握起来不是那么容易，同时需要借助一系列的中间件来处理异步和副作用
mobx 中有更多的抽象和封装，调试会比较困难，同时结果也难以预测；而 redux 提供能够进行时间回溯的开发工具，同时其纯函数以及更少的抽象，让调试变得更加的容易；

1. Redux 的编程范式是函数式的而 Mobx 是面向对象的；
2. redux 使用不可变状态，不能直接修改，而是返回一个新的状态，同时使用纯函数，
   mobx 的状态可变，可以直接修改。
3. Redux 数据流流动很自然，可以充分利用时间回溯的特征，增强业务的可预测性；MobX 没有那么自然的数据流动，也没有时间回溯的能力，但是 View 更新很精确，粒度控制很细。
4. Redux 通过引入一些中间件来处理异步和副作用；MobX 没有中间件，副作用的处理比较自由，比如依靠 autorunAsync 之类的方法。
5. Redux 的样板代码更多，而 MobX 基本没啥多余代码，直接硬来。

总结：但其实 Redux 和 MobX 并没有孰优孰劣，Redux 比 Mobx 更多的样板代码，是因为特定的设计约束。如果项目比较小的话，使用 MobX 会比较灵活，但是大型项目，像 MobX 这样没有约束，没有最佳实践的方式，会造成代码很难维护，各有利弊。一般来说，小项目建议 MobX 就够了，大项目还是用 Redux 比较合适。

# redux-saga 和 mobx

https://github.com/lgwebdream/FE-Interview/issues/32
# 对比 redux-saga 和 mobx

### 状态管理

redux-saga 是 redux 的一个异步处理的中间件。
mobx 是数据管理库，和 redux 一样。

### 设计思想

redux-saga 属于 flux 体系， 函数式编程思想。
mobx 不属于 flux 体系，面向对象编程和响应式编程。

### 主要特点

redux-saga 因为是中间件，更关注异步处理的，通过 Generator 函数来将异步变为同步，使代码可读性高，结构清晰。action 也不是 action creator 而是 pure action，
在 Generator 函数中通过 call 或者 put 方法直接声明式调用，并自带一些方法，如 takeEvery，takeLast，race 等，控制多个异步操作，让多个异步更简单。

mobx 是更简单更方便更灵活的处理数据。 Store 是包含了 state 和 action。state 包装成一个可被观察的对象， action 可以直接修改 state，之后通过 Computed values 将依赖 state 的计算属性更新 ，之后触发 Reactions 响应依赖 state 的变更，输出相应的副作用 ，但不生成新的 state。

### 数据可变性

redux-saga 强调 state 不可变，不能直接操作 state，通过 action 和 reducer 在原来的 state 的基础上返回一个新的 state 达到改变 state 的目的。
mobx 直接在方法中更改 state，同时所有使用的 state 都发生变化，不生成新的 state。

### 写法难易度

redux-saga 比 redux 在 action 和 reducer 上要简单一些。需要用 dispatch 触发 state 的改变，需要 mapStateToProps 订阅 state。

mobx 在非严格模式下不用 action 和 reducer，在严格模式下需要在 action 中修改 state，并且自动触发相关依赖的更新。

### 使用场景

redux-saga 很好的解决了 redux 关于异步处理时的复杂度和代码冗余的问题，数据流向比较好追踪。但是 redux 的学习成本比 较高，代码比较冗余，不是特别需要状态管理，最好用别
的方式代替。
mobx 学习成本低，能快速上手，代码比较简洁。但是可能因为代码编写的原因和数据更新时相对黑盒，导致数据流向不利于追踪。


