~~2. react hook useEffect 原理~~
~~3. redux connect~~

1. react 生命周期
   contrcutor
   getDerivedStateFromProps
   componentWillMount
   render
   componentDidMOunt

---

componentWillReceiveProps
getDerivedStateFromProps
shouldComponentUpdate
componentWillUpdate
render()
getSnapshotBeforeUpdate
componentDidUpdate

---

componentWillUnmount

1. 博客文章
   ~~6. 评论系统~~
   ~~4. jwt ~~
2. vue 优化
   ~~7. 消息系统~~
   ~~8. vue 前进刷新，后退缓存 ~~
3. ts 面试题

4. 柯里化
5. 最长递增自序列 动态规划+二分查找
6. 函数组件和类组件的区别
   1. 思想 ：面向对象 函数式编程
   2. 继承生命周期，副作用
   3. 组合优于继承
   4. 性能优化：shouldComponentUpdate vs React.memo
   5. react hook 生命周期
   6. 类组件在未来时间切片与并发模式中，由于生命周期带来的复杂度，并不易于优化。
7. 组件分类
   1. 展示组件内部没有状态管理，仅仅用于最简单的展示表达。展示组件中最基础的一类组件称作代理组件。代理组件常用于封装常用属性、减少重复代码
   2. 灵巧组件由于面向业务，其功能更为丰富，复杂性更高，复用度低于展示组件。最经典的灵巧组件是容器组件。在开发中，我们经常会将网络请求与事件处理放在容器组件中进行。容器组件也为组合其他组件预留了一个恰当的空间。还有一类灵巧组件是高阶组件。高阶组件被 React 官方称为 React 中复用组件逻辑的高级技术，它常用于抽取公共业务逻辑或者提供某些公用能力。
8. vite
   1. 优点
      1. 初次构建启动快：
      2. 按需编译：在浏览器渲染时，根据入口模块分析加载所需模块，编译过程按需处理
      3. 增量构建速度快：在修改代码后的 rebuild 过程中，主流的打包构建中仍然包含编译被修改的模块和打包产物这两个主要流程，因此相比之下，只需处理编译单个模块的无包构建在速度上也会更胜一筹
   2. 缺点
      1. 浏览器网络请求数量剧增
      2. 浏览器的兼容性
9. webpack
10. dns 解析
    1. 我们首先会将请求发送到 本地的 DNS 服务器中，本地 DNS 服务器会判断是否存在该域名的缓存，
    2. 如果不存在，则向根域名服务器发送一个请求，根域名服务器返回负责.com 的顶级域名服务器的 IP 地址的列表。
    3. 然后本地 DNS 服务器再向其中一个负责.com 的顶级域名服务器发送一个请求，负责.com 的顶级域名服务器返回负责.baidu 的权威域名服务器的 IP 地址列表。
    4. 然后本地 DNS 服务器再向其中一个权威域名服 务器发送一个请求，最后权威域名服务器返回一个对应的主机名的 IP 地址列表
11. xss csrf
    > 验证 Token：浏览器请求服务器时，服务器返回一个 token，每个请求都需要同时带上 token 和 cookie 才会被认为是合法请求
    > 验证 Referer：通过验证请求头的 Referer 来验证来源站点，但请求头很容易伪造
    > 设置 SameSite：设置 cookie 的 SameSite，可以让 cookie 不随跨站请求发出，但浏览器兼容不一
12. 实现图片懒加载（intersectionObserver）
13. http2
    1. 多路复用
    2. 二进制分帧传输
    3. 数据流
    4. 服务端推送
    5. 首部压缩
14. 性能优化指标
15. promise
16. jsonp
17. 算法
    1. 快排
18. 深拷贝
19. 性能监控

## 宝典

<!-- 7/6 -->

1. 事件循环
2. nodejs 高并发原理
   1. 单线程
   2. 异步 io
   3. 事件驱动
3. 前端如何解决高并发
   1. 静态资源合并压缩
   2. 减少或合并 HTTP 请求（需权衡，不能为了减少而减少）
   3. 使用 CDN，分散服务器压力
   4. 利用缓存过滤请求
4. 错误上报

   1. 采集哪些数据
   2. 如何采集错误

      1. 代码执行的错误
         1. try catch
         2. window.onerror
         3. window.addEventListener('unhandledrejection')
         4. 处理promise错误
      2. 资源加载错误
         1. img.onerror
         2. window.addEventListener('error')
      3. errorHandler， errorCaputured
      4. componentDidCatch

   3. 如何上报
      1. 图片发送 get 请求
      2. navigator.sendBeacon //不支持 ie, (sendBeacon 并不像 XMLHttpRequest 一样可以直接指定 Content-Type，且不支持 application/json 等常见格式。data 的数据类型必须是 ArrayBufferView 或 Blob, DOMString 或者 FormData 类型的)

5. promise vs async/await /Generator

6. 垃圾回收

7. 算法
   1. 最小栈
   2. 回文子串
   3. 层序遍历
8. 双飞翼布局
   content 宽度 100%， 设置浮动.
   main 包在 content 里面 设置左右边距为 left,right 宽度
   left 左浮动，且 margin-left：-100%；
   right 右浮动，margin-left:-自身宽度
9. 圣杯布局
   container 设置左右 margin 为 left,right 的宽度
   left, right :float:left，margin 分别设为 100%；和自身宽度; 设置相对定位 left 为-width, right 为-width
10. react diff
11. fiber
12. setState 原理 isBatchingUpdates
13. redux
14. node + webpack
15. redux-thunk ({getState, dispatch})=>(next)=>(action)=> {if()}

16. react vs vue
17. react 主张函数式编程，不可变数据。单项数据流。vue 可变数据的，支持双向绑定
18. \*react 是单向数据流，react 中属性是不允许更改的，状态是允许更改的。react 中组件不允许通过 this.React**基于状态机，手动优化，数据不可变，需要 setState 驱动新的 state 替换老的 state。**;vue 是实现了双向数据绑定的 mvvm 框架。Vue 采用**数据劫持&发布-订阅模式**的方式。在数据更改时触发视图更新操作；
19. react : jsx ; vue ：template
20. Fiber
    1. 渲染/更新过程（递归 diff）拆分成一系列小任务，每次检查树上的一小部分，做完看是否还有时间继续下一个任务，有的话继续，没有的话把自己挂起，主线程不忙的时候再继续.
    2. 增量渲染（把渲染任务拆分成块，匀到多帧）
    3. 更新时能够暂停，终止，复用渲染任务
    4. 给不同类型的更新赋予优先级
    5. render + commit
    6. effect List
    7. fiber tree 链表和
    8. currentTree 和 workInProgressTree

//

1. nuxt
2. vue api
3. react 18 特性
4. nginx 常用配置
5. 排序算法
6. redux-saga redux-thunk
7. dva
   数据的改变发生通常是通过用户交互行为或者浏览器行为（如路由跳转等）触发的，当此类行为会改变数据的时候可以通过 dispatch 发起一个 action，**如果是同步行为会直接通过 Reducers 改变 State ，如果是异步行为（副作用）会先触发 Effects 然后流向 Reducers 最终改变 State**
   1. Subscription 语义是订阅，用于订阅一个数据源，然后根据条件 dispatch 需要的 action
   2. 把 store 及 saga 统一为一个 model 的概念, 写在一个 js 文件里面
8. typescript
9. 算法
10. 多行文本换行：
    display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2; overflow:hidden; text-overflow:hidden;
11. 单行文本换行
    1. display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis
12. flex 布局
13. HTTP3 使用的传输层协议是什么，怎么保证可靠性
14. http2
15. animation:animation-name animation-duration animation-time-function animation-delay animation-iteration-count animation-direction(alternate normal)
16. animation-fill-mode: forwards(动画完成保持最后一个值) backwards
17. flat :
    1. reduce
    2. toString, split
    3. es6 flat(arr, Infinity)
18. 去重
19. function fibonacci(n, v1 = 1, v2 = 1) { // 尾递归
    if (n == 1) return v1;
    if (n == 2) return v2;
    return fibonacci(n - 1, v2, v1 + v2);
    }
20. 微前端
21. nginx
22. 杨辉三角

> -------分割线------

1. node 项目后端： gt / blog-server
2. nuxt 项目 daisy-blog
3. nginx
4. bff
5. 响应式
   1. 媒体查询:
      1. 屏幕宽度
         1. @media screen and (max-width:320px) 移动端优先使用
         2. @media screen and (min-width:960px) pc 端优先使用
      2. dpr
         1. @media screen and (-webkit-min-device-pixel-ratio:2.0)
6. typescript
7. pwa
8. grid 布局

```css
.container{
   display:grid;/* inline-grid */
   /*网格线的名称
grid-template-columns属性和grid-template-rows属性里面，还可以使用方括号，指定每一根网格线的名字，方便以后的引用。*/
  grid-template-columns: [c1] 100px [c2] 100px [c3] auto [c4];
  grid-template-rows: [r1] 100px [r2] 100px [r3] auto [r4];
   grid-template-columns: 150px 1fr 2fr;
   grid-template-rows: 2fr 1fr;
   grid-template-columns: 100px auto 100px; /*auto关键字，第二列的宽度，基本上等于该列单元格的最大宽度，除非单元格内容设置了min-width，且这个值大于最大宽度。*/
   grid-template-columns: 1fr 1fr minmax(100px, 1fr); /*minmax()函数产生一个长度范围*/
   /*单元格的大小是固定的，但是容器的大小不确定。如果希望每一行（或每一列）容纳尽可能多的单元格，这时可以使用auto-fill关键字表示自动填充。*/
   /* grid-template-columns: repeat(auto-fill, 100px); */
   /* grid-template-columns: 100px 100px 100px;
   grid-template-rows: 100px 100px 100px; */
  /* grid-template-columns: repeat(3, 33.33%);
  grid-template-rows: repeat(3, 33.33%); */
  grid-row-gap:
  grid-column-gap:20px;/*列间隔*/
  grid-row-gap:20; /*行间隔*/
  grid-gap: 20px 20px; /*grid-gap属性是grid-column-gap和grid-row-gap*/
  grid-auto-flow:column;/*内部元素放置顺序 默认值是row，即"先行后列"。也可以将它设成column，变成"先列后行"。*/
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
}
```

9.  http 文件上传
10. z-index
11. vue 官方文档- vue 项目- vue 面试题
12. vue3 源码
13. vue2 中响应式原理
14. vue 双向绑定原理
    要实现 Vue 中的双向绑定，大致可以分为三个模块 Observer, Compile, Watcher

    1. 数据监听器 Observer。用来**劫持并监听**所有属性，监听到数据变化后**通知订阅**者。每个属性对应消息订阅器 Dep, 维护一个数组，用来收集订阅者，数据变动触发 dep.notify，再调用订阅者的 update 方法。

    2. 解析器 Compile。是**解析模板**指令，将模板中的变量替换成数据，然后**初始化渲染页面**视图，并将每个指令对应的节点**绑定更新函数 update**，**添加监听数据的订阅者**，一旦**数据有变动**，**收到通知，更新视图**。

    3. Watcher 订阅者。作为 Observer 和 Compile 之间通信的桥梁，主要做的事情是:
       - 在自身实例化时往属性订阅器(dep)里面添加自己
       - 自身必须有一个 update()方法
       - 待属性变动 dep.notify()通知时，能调用自身的 update()方法，并触发 Compile 中绑定的回调，则功成身退。

15. mvc mvvm
16. vite
17. nuxt 生命周期：
    1.  nuxtServerInit 服务端初始化 **只在服务端渲染**
    2.  middleware 中间件运行 **两端都可能执行**
        middleware 的执行顺序：nuxt.config.js 中配置的 -> 匹配 layouts -> 匹配 pages
    3.  validate 校验参数 **两端都可能执行**
    4.  asyncData/fetch 异步数据处理 **两端都可能执行**
        **2.12 后，fetch 在 created 之后执行**
    5.  render() **两端都可能执行**
    6.  beforeCreate , created **两端都可能执行**
    7.  vue 其他生命周期 **客户端**
18. computed 的原理
    计算属性本质上是一个懒执行的副作用函数，通过 lazy 选项使其懒执行，当读取计算属性时，手动执行副作用函数，当计算属性依赖的响应式数据发生变化时，会通过 scheduler 将 dirty 设置为 true,代表脏，下次读取计算属性的值时，会重新计算真正的值
19. watch 原理
    它本质上利用了副作用函数重新执行时的可调度性。一个 watch 会创建一 effect，当这个 effect 依赖的响应式数据发生变化时，会执行该 effect 的调度器函数，即 scheduler。这里的 scheduler 可以理解为“回调”，所以我们需要 scheduler 中执行用户通过 watch 注册的回调函数即可。

## 响应式原理

整体思路是数据劫持+观察者模式
对象内部通过 defineReactive 方法，使用 Object.defineProperty 将属性进行劫持（只会劫持已经存在的属性），数组则是通过重写数组方法来实现。当页面使用对应属性时，每个属性都拥有自己的 dep 属性，存放他所依赖的 watcher（依赖收集），当属性变化后会通知自己对应的 watcher 去更新(派发更新)。

1. 初始化时需要遍历对象所有 key，如果对象层级较深，性能不好
2. 通知更新过程需要维护大量 dep 实例和 watcher 实例，额外占用内存较多
3. 动态新增、删除对象属性无法拦截，只能用特定 set/delete api 代替
4. 不支持新的 Map、Set 等数据结构

## 深拷贝：

```js
const isComplexDataType = (obj) =>
  (typeof obj === "object" || typeof obj === "function") && obj !== null;
function cloneDeep(obj, hash = new WeakMap()) {
  if (obj.constructor === Date) return new Date(obj);
  if (obj.constructor === RegExp) return new RegExp(obj);
  if (hash.has(obj)) return hash.get(obj);
  let allDesc = Object.getOwnPropertyDescriptors(obj);
  //遍历传入参数所有键的特性
  let cloneObj = Object.create(Object.getPrototypeOf(obj), allDesc);
  //继承原型链
  hash.set(obj, cloneObj);
  for (let key of Reflect.ownKeys(obj)) {
    cloneObj[key] =
      isComplexDataType(obj[key]) && typeof obj[key] !== "function"
        ? deepClone(obj[key], hash)
        : obj[key];
  }
  return cloneObj;
}
```

## 中间件

#### koa

1. 洋葱模型，就是指每一个 Koa 中间件都是一层洋葱圈，它即可以掌管请求进入，也可以掌管响应返回。
2. 换句话说：**外层的中间件可以影响内层的请求和响应阶段，内层的中间件只能影响外层的响应阶段**。
   dispatch(n)对应第 n 个中间件的执行，第 n 个中间件可以通过 **await next()来执行下一个中间件，同时在最后一个中间件执行完成后，依然有恢复执行的能力**。即，通过洋葱模型，await next()控制调用 “下游”中间件，直到 “下游”没有中间件且堆栈执行完毕，最终流回“上游”中间件。这种方式有个优点，特别是对于日志记录以及错误处理等需要非常友好。

#### redux

1. Redux 中间件接收 getState 和 dispatch 两个方法组成的对象作为参数；

2. Redux 中间件返回一个函数，该函数接收下一个 next 方法作为参数，并返回一个接收 action 的新的 dispatch 方法；

3. Redux 中间件通过手动调用 next(action)方法，执行下一个中间件。

#### express

Express 中间件设计并不是一个洋葱模型，它是基于回调实现的线形模型，不利于组合

1. 一个中间件可以理解为一个 Layer 对象，其中包含了当前路由匹配的正则信息以及 handle 方法。
2. 所有中间件（Layer 对象）使用 stack 数组存储起来。
3. 因此，每个 Router 对象都是通过一个 stack 数组，存储了相关中间件函数。
4. 当一个请求过来时，会从 req 中获取请求 path，根据 path 从 stack 中找到匹配的 Layer
5. **Express 的 next()方法维护了遍历中间件列表的 Index 游标，中间件每次调用 next()方法时，会通过增加 Index 游标的方式找到下一个中间件并执行**

### xss 跨站脚本攻击

1. 存储型
2. 反射型
3. dom 型
   1. 使用纯前端渲染，对 html 转义
   2. 谨慎使用 innerHTML,outerHTMl,不要把不可信的数据作为 HTML 插到页面上
   3. 插入 html 内容前对数据进行转义和 dompurify 消毒
   4. Content Security Policy，<meta http-equiv="Content-Security-Policy">；**CSP 本质上是建立白名单，规定了浏览器只能够执行特定来源的代码；即使发生了 xss 攻击，也不会加载来源不明的第三方脚本**
   5. HTTP-only Cookie: 禁止 JavaScript 读取某些敏感 Cookie，
      攻击者完成 XSS 注入后也无法窃取此 Cookie。

### CSRF：跨站请求伪造

1. 验证 Token：浏览器请求服务器时，服务器返回一个 token，每个请求都需要同时带上 token 和 cookie 才会被认为是合法请求
2. 验证 Referer：通过验证请求头的 Referer 来验证来源站点，但请求头很容易伪造
3. 设置 SameSite：设置 cookie 的 SameSite，可以让 cookie 不随跨站请求发出，但浏览器兼容不一

### vue 结合 keep-alive，结合路由守卫，触发钩子的完整顺序：

将路由导航、keep-alive、和组件生命周期钩子结合起来的，触发顺序，假设是从 a 组件离开，第一次进入 b 组件：

1. beforeRouteLeave:路由组件的组件离开路由前钩子，可取消路由离开。
2. beforeEach: 路由全局前置守卫，可用于登录验证、全局路由 loading 等。
3. beforeEnter: 路由独享守卫
4. beforeRouteEnter: 路由组件的组件进入路由前钩子。
5. beforeResolve:路由全局解析守卫
6. afterEach:路由全局后置钩子
7. beforeCreate:组件生命周期，不能访问 this。
8. created:组件生命周期，可以访问 this，不能访问 dom。
9. beforeMount:组件生命周期
10. deactivated: 离开缓存组件 a，或者触发 a 的 beforeDestroy 和 destroyed 组件销毁钩子。
11. mounted:访问/操作 dom。
12. activated:进入缓存组件，进入 a 的嵌套子组件(如果有的话)。
13. 执行 beforeRouteEnter 回调函数 next。

### 首屏加载速度慢怎么解决

减小入口文件积,静态资源本地缓存,UI 框架按需加载,图片资源的压缩,组件重复打包,开启 GZip 压缩,使用 SSR.

### CSRF 怎么防范\*\*

### 编辑距离\*\*

### 大文件上传

### 数组中的第 K 个最大元素

### stream

### cluster,child_process

### 性能监控，错误上报

### 单点登录

### 四次握手

### vue / react key 作用， 数组
