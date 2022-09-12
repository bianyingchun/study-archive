## 数坤 一面

1. react 组件通信
1. 1000 条数据渲染
1. 前端性能优化
1. useRef
1. 项目介绍，难点
1. 浏览器的存储方式，差异
1. localstorage 设置过期时间
1. js 为什么是单线程
   JavaScript 的单线程，与它的用途有关。作为浏览器脚本语言，JavaScript 的主要用途是与用户互动，以及操作 DOM。这决定了它只能是单线程，否则会带来很复杂的同步问题。比如，假定 JavaScript 同时有两个线程，一个线程在某个 DOM 节点上添加内容，另一个线程删除了这个节点，这时浏览器应该以哪个线程为准？
1. 线程/进程
   - 进程 Process 是计算机中的**程序关于某数据集合上的一次运行活动，是系统进行资源分配和调度的基本单位**，是操作系统结构的基础，进程是线程的容器（来自百科）。进程是**资源分配的最小单位**。我们启动一个服务、运行一个实例，就是开一个服务进程，
     **实现进程间通信的技术有很多，如命名管道，匿名管道，socket，信号量，共享内存，消息队列等**
   - **线程是操作系统能够进行运算调度的最小单位**，首先我们要清楚线程是隶属于进程的，被包含于进程之中。一个线程只能隶属于一个进程，但是一个进程是可以拥有多个线程的。
   -

1. 手写题

```js
const arr = [1, 3, 4, 5, 7, 8, 9, 11]; //'1,3,5,7-9'

function test(arr) {
  let prev = arr[0];
  let res = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] + 1 == arr[i]) {
      if (res[res.length - 1] !== "-") res += "-";
    } else {
      if (res[res.length - 1] === "-") res += arr[i - 1];
      res += "," + arr[i];
      prev = arr[i];
    }
  }
  if (res[res.length - 1] === "-") {
    res += arr[arr.length - 1];
  }
  return res;
}
```

## 二面

1. vue 组件渲染的过程
2. 最近在研究哪块，看什么书，有什么收获

### Vue3 对比 Vue2 发生哪些变化

1. 多根节点
   Vue3 支持了多根节点组件，也就是 fragment。Vue2 中，编写页面的时候，我们需要去将组件包裹在<div>中，否则报错警告。
2. Teleport
   Vue3 提供 Teleport 组件可将部分 DOM 移动到 Vue app 之外的位置。比如项目中常见的 Dialog 组件。
3. Suspense 异步组件
4. composition api
   Vue2 是 选项式 API（Option API），一个逻辑会散乱在文件不同位置（data、props、computed、watch、生命周期函数等），导致代码的可读性变差，需要上下来回跳转文件位置。Vue3 组合式 API（Composition API）则很好地解决了这个问题，可将同一逻辑的内容写到一起。增强了代码的可读性、内聚性
5. 响应式原理
   Vue2 响应式原理基础是 Object.defineProperty；Vue3 响应式原理基础是 Proxy
6. 静态标记(PatchFlag)
   在创建虚拟 DOM 的时候会根据 DOM 中的内容会不会发生变化添加静态标记,数据更新后，只对比带有**patch flag**的节点

7. 缓存内联事件处理函数:避免造成不必要的组件更新。
8. diff 优化：
   1. patchFlag 帮助 diff 时区分静态节点，以及不同类型的动态节点。一定程度地减少节点本身及其属性的比对。
   2. 有运用最长递增序列的算法思想。
9. 打包优化
   Tree shaking support：可以将无用模块“剪辑”，仅打包需要的，按需编译,体积比 Vue2.x 更小
10. TypeScript
    Vue3 由 TS 重写，相对于 Vue2 有更好地 TypeScript 支持。
11. shapeFlag 类型编码

Vue.js 3.0 内部还针对 vnode 的 type，做了更详尽的分类，包括 Suspense、Teleport 等，且把 vnode 的类型信息做了编码，以便在后面的 patch 阶段，可以根据不同的类型执行相应的处理逻辑

4. vue 中需要注意的地方
5. 有哪些 hook,分别有什么用
6. 为什么选择 ae 脚本

## 珍岛 一面

1. vuex vs redux
2. 深度优先算法，广度优先算法
3. 类组件和函数式组件
4. vue3 新特性
5. vue3 patch diff 过程
6. diff 算法
7. 性能优化
8. webpack loader plugin
9. webpack HMR 热更新
10. useRef reactive
11. webpack 多入口打包
12. watch deep 原理
13. react hook 的优势
14. class vs hook

## 花旗 一面

1. hook
2. 响应式布局
3. flex 布局
4. 工作中比较有成就感的事
5. useEffect 模拟生命周期
6. 合成事件
7. addEventListener 第三个参数
8. webpack 常用配置
9. 实现防抖
10. 实现深度克隆
11. 实现 promise
12. async/await promise 的区别
13. hook
14. 虚拟 dom
15. babel 是什么，原理
16. react 如何防止样式污染全局变量
17. 常用的 webpack 插件
    1. define-plugin
18. 自定义 webpack 插件
19. webpack.ProvidePlugin
    自动加载模块，而不必到处 import 或 require
20. define-plugin：定义环境变量 (Webpack4 之后指定 mode 会自动配置)
21. webpack 自定义插件
22. webpack 常用配置项
23. 如何在 webpack 中使用 sass;
24. 任务循环。
25. less/sass

## 花旗二面

1. 如何保证前后端传输安全
2. 如何绘制一个时钟
3. requestAnimationFrame setTimeout setInterval
4. 职业规划
5.

### 珍岛 二面

25. 插槽分类，如何分类，如何传值
26. post 和 get
27. http2
28. tcp 和 udp
29. webpack 常用配置
30. nginx 的配置
31. 白屏优化 ： 代码层面 + webpack
32. vue 自定义指令
33. vue 自定义修饰符
    v-model
34. mixin 的合并策略，优缺点
35. 各个排序算法的时间复杂度
36. 深度监听的方法 $watch('',cb, {deep:true})
37. vue 生命周期， keep-alive， vue-router 钩子
38. nuxt 生命周期
39. base64 : data:image/png;base64,

###

1. node 进程挂掉了怎么办，如何处理多节点的数据共享的冲突问题
2. node 为什么支持高并发

###

1. pc/mobile 响应式

2. nuxt 遇到的坑

3. 301, 302 分别在什么场景下出现

###

1. 前端故障排查

   1. 阅读控制台报错信息，大致判断出错误类型以及可能出错的原因，若无法判断，可携带错误信息，利用搜索引擎检索
      1. SyntaxError 语法错误
      2. ReferenceError 引用错误(要用的变量没找到)
      3. TypeError 类型错误(调用不存在的方法)
      4. RangeError 第一是数组长度为负数，第二是 Number 对象的方法参数超出范围，以及函数堆栈超过最大值。
   2. 善用 console， 在关键步骤 console

   3. 线上故障排除 hidden-source-map 配合 sentry
   4. 移动端调试 VConsole

2. 调试步骤

   1. 检查控制台是否报错
   2. 是何种错误
      1. SyntaxError 语法错误
      2. ReferenceError 引用错误(要用的变量没找到)
      3. TypeError 类型错误(调用不存在的方法)
      4. RangeError 第一是数组长度为负数，第二是 Number 对象的方法参数超出范围，以及函数堆栈超过最大值。
   3. 当前页面是否需要请求获取数据
      1.
   4. 网络请求是否成功发送

      1. 检查开发者工具 Network/网络面板，查看需要获取数据的接口是否成功获取到数据。

   5. 定位到代码应当执行的位置（大概即可）
      利用 sourcemap 可以快速定位到问题出在哪一行。如果没有报错信息，就需要凭借当前页面的状态自己判断出问题的区域，按照代码执行的顺序排查。
   6. 按照预期执行顺序检查代码
      通过断点、日志等手段判断程序有没有按照自己想要的顺序执行，简单来说就是排查。
   7. 检查渲染需要的数据是否与预期相同

   8. 异常代码一般分析方法
      1. 代码注释法 利用二分法思想逐行去注释代码，直到定位问题
      2. 类库异常，兼容问题 这种场景也会经常遇到，我们需要用可以调试页面异常的方式，如 Safari，Whistle，vConsole 查看异常日志，从而迅速定位类库位置，从而找寻替换或是兼容方案。
      3. try catch 如果你的项目没有异常监控，那么在可疑的代码片段中去 Try Catch 吧。
   9. ES6 语法兼容 一般我们都会通过 Babel 来编译 ES6 ，但是额外的第三方类库如果有不兼容的语法，低版本的移动设备就会异常。

弹窗组件的设计，组织页面滚动

### 问了监控系统，如何计算白屏时间和首屏渲染时间的，如何进行数据上报的，上报到监控系统展示是怎样的一个过程

### domain 属性解决跨域。几种 domain 设置对跨域是否生效

### ts 泛型做什么的，infer 关键字的作用

### 实现 typescript 的 Paramters、ReturnType (考察 infer 关键字使用)

Mutation Observer、Intersection Observer 使用场景

### websocket/轮询的好处和缺点

### websocket 的握手过程（urgrade websocket）

### 不同路径

```js
var uniquePaths = function (m, n) {
  let cur = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      cur[j] = cur[j] + cur[j - 1];
    }
  }
  return cur[n - 1];
};
```

### pwa

### 数组中的第 K 个最大元素

### 排序算法

### 组合总和

### 零钱兑换 动态规划

### 颜色分类 快排

# JavaScript

-# vue

-# react

# css

# node

# webpack

# http / https / 安全/ 性能优化/前端监控

# 高频算法

# 微前端

# nuxt

# 按照简历回顾项目细节

# fiber

# 手写题

## performance 调试前端性能

## Scheduler 并发控制

## 排序算法

## 预加载

链接预取是一种浏览器机制，其**利用浏览器空闲时间来下载或预取用户在不久的将来可能访问的文档**。网页向浏览器提供一组预取提示，并在浏览器完成当前页面的加载后开始静默地拉取指定的文档并将其存储在缓存中。当用户访问其中一个预取文档时，便可以快速的从浏览器缓存中得到。

##### 目前支持两种方式的预加载

- preload 立即请求

<link href=/js/chunk-vendors.5e63c7cf.js rel=preload as=script>
当浏览器解析到preload会立即进行资源的请求，需要注意的是使用preload进行预加载时需要指定文件的类型

- prefetch 空闲请求

<link href=/js/chunk-dca4e6ea.e4986a0a.js rel=prefetch>
当浏览器解析到prefetch时，不会立即请求资源，会等待浏览器空闲以后再进行资源的请求

综上所述

- preload 适用于加载当前页面需要用到的资源
- prefetch 适用于后续页面需要用到的资源

##### 在 webpack 中开启

```js
import(/* webpackPrefetch: true */ "LoginModal");
import(/* webpackPreload: true */ "ChartingLibrary");
```

## css-loader 实现原理

## ssr 实现原理

## nginx 开启缓存

## npm 打包发布包

## 重点算法

1. 圆圈中最后剩下的数字
   约瑟夫环问题：f(n) = (f(n-1) + m )% n
2. 零钱兑换
3. LIS
4. 排序算法
5. 最长回文子序列
6. 最长公共子序列

## typescript

## stream

## vue3

## vue

问下这种面试感觉怎么样， 然后有什么需要提升的点
问问刚刚面试中不会的东西
问问专业的方向
公司的做什么、技术栈、新人培养方案

## 双向绑定

1. new Vue()首先执行初始化，对 data 执行响应化处理，这个过程发生 Observe 中

2. 同时对模板执行编译，找到其中动态绑定的数据，从 data 中获取并初始化视图，这个过程发生在 Compile 中

3. 同时定义⼀个更新函数和 Watcher，将来对应数据变化时 Watcher 会调用更新函数

4. 由于 data 的某个 key 在⼀个视图中可能出现多次，所以每个 key 都需要⼀个管家 Dep 来管理多个 Watcher

5. 将来 data 中数据⼀旦发生变化，会首先找到对应的 Dep，通知所有 Watcher 执行更新函数

vue 数据双向绑定是**通过数据劫持结合发布者-订阅者模式的方式来实现的。**

1. 实现一个监听器 Observer，用来劫持并监听所有属性，如果有变动的，就通知订阅者。因为订阅者是有很多个，所以我们需要有一个消息订阅器 Dep 来专门收集这些订阅者，然后在监听器 Observer 和订阅者 Watcher 之间进行统一管理的。

2. 实现一个订阅者 Watcher，每一个 Watcher 都绑定一个更新函数，watcher 可以收到属性的变化通知并执行相应的函数，从而更新视图。

3. 实现一个解析器 Compile，可以扫描和解析每个节点的相关指令（v-model，v-on 等指令），如果节点存在 v-model，v-on 等指令，则解析器 Compile 初始化这类节点的模板数据，使之可以显示在视图上，然后初始化相应的订阅者（Watcher）

### AMD 和 CMD 规范的区别？

第一个方面是在**模块定义时对依赖的处理不同**。

- AMD 推崇**依赖前置，在定义模块的时候就要声明其依赖的模块**。

- 而 CMD 推崇**就近依赖，只有在用到某个模块的时候再去 require**。

第二个方面是**依赖模块的执行时机**处理不同。

首先 AMD 和 CMD 对于 模块的加载方式都是异步加载，不过它们的区别在于模块的执行时机.

- AMD 在 **依赖模块加载完成后就直接执行依赖模块**，依赖模块的执行顺序和我们书写的顺序不一定一致。

- 而 CMD 在依赖模块**加载完成后并不执行，只是下载而已，等到所有的依赖模块都加载好后，进入回调函数逻辑，遇到 require 语句 的时候 才执行对应的模块**，这样模块的执行顺序就和我们书写的顺序保持一致了。

### 垃圾回收栈和堆的区别

1. 栈内存中的数据只要运行结束，则直接回收
2. 堆内存中，对象先分配到新生代的 from 中， 如果不可达直接释放，如果可达，就复制到 To，然后将 to 和 from 互换，如果多次复制后依然没有回收，则放入老生代中，进行标记回收，之后将内存碎片进行整合放到一端。

### pwa
