### Vite 实现原理
就是启动一个koa服务器拦截浏览器请求ESModule 的请求。通过路径查找目录下对应文件的文件做一定的处理最终以ESModule 格式返回给客户端

### Vue3.0 新特性
https://www.jianshu.com/p/9d3ddaec9134

Proxy：不只是解决了 defineProperty 的局限性
Performance：性能比Vue 2.x快1.2~2倍
Tree shaking support：可以将无用模块“剪辑”，仅打包需要的，按需编译,体积比Vue2.x更小
Composition API: 组合API(类似React Hooks)
Better TypeScript support：更优秀的 Ts 支持
Custom Renderer API：暴露了自定义渲染API
Fragment, Teleport(Protal), Suspense：更先进的组件，“碎片”，Teleport 即 Protal 传送门，“悬念”。

### Vue3 为什么这么快，做了哪些优化

#### 双向绑定
+ 2.0现有限制：

无法检测到新的属性添加/删除
无法监听数组的变化
需要深度遍历，浪费内存
3.0优化：

使用 ES6的**Proxy** 作为其观察者机制，取代之前使用的Object.defineProperty。
1. Proxy默认 可以支持数组
允许框架拦截对象上的操作
多层对象嵌套，使用懒代理


#### 虚拟Dom
2.0 虚拟 DOM性能瓶颈：

虽然vue能够保证触发更新的组件最小化，但单个组件部分变化需要遍历该组件的整个vdom树
传统vdom性能跟模版大小正相关，跟动态节点的数量无关
3.0优化工作

在 vue 3.0 中重新推翻后重写了虚拟 DOM 的实现，官方宣称渲染速度最快可以翻倍。更多**编译时的优化以减少运行时的开销**

#### diff算法优化
**Vue2中的虚拟dom是进行全量的对比**，即数据更新后在虚拟DOM中每个标签内容都会对比有没有发生变化

Vue3新增了**静态标记(PatchFlag)**

在创建虚拟DOM的时候会根据DOM中的内容会不会发生变化添加静态标记

数据更新后，只对比带有**patch flag**的节点

#### hoistStatic 静态提升
Vue2中无论元素是否参与更新, 每次都会重新创建, 然后再渲染
Vue3中对于不参与更新的元素, 会做静态提升, 只会被创建一次, 在渲染时直接复用即可

#### 事件监听缓存
默认情况下onClick会被视为动态绑定, 所以每次都会去追踪它的变化，但是因为是同一个函数，所以没有追踪变化, 直接缓存起来复用即可

### 相比较2.0 有哪些变化
响应式基本原理：Object.defineProperty -> Proxy，提高性能
初始化方式：Options api -> composition api，提供代码复用，更好的tree-shaking
初始化项目：vue-cli -> vite，提高开发效率
扩展方法：Vue.property.xxx -> config.globalProperties.xxx，更好的tree-shaking
实例化：new Vue -> createApp。

#### reactive 和 ref 的区别
ref数据响应式监听。ref 函数传入一个值作为参数，一般传入基本数据类型，返回一个基于该值的响应式Ref对象，该对象中的值一旦被改变和访问，都会被跟踪到，就像我们改写后的示例代码一样，通过修改 count.value 的值，可以触发模板的重新渲染，显示最新的值

reactive是用来定义更加复杂的数据类型，但是定义后里面的变量取出来就不在是响应式Ref对象数据了，所以需要用toRefs函数转化为响应式数据对象

ref 和 reactive 本质我们可以简单的理解为ref是对reactive的二次包装, ref定义的数据访问的时候要多一个.value


####  Vue3.0 Diff 算法

https://blog.csdn.net/zl_Alien/article/details/106595459