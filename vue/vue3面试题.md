### Vite 实现原理

就是启动一个 koa 服务器拦截浏览器请求 ESModule 的请求。通过路径查找目录下对应文件的文件做一定的处理最终以 ESModule 格式返回给客户端

### Vue3 对比 Vue2 发生哪些变化

1. 多根节点
   Vue3 支持了多根节点组件，也就是 fragment。Vue2 中，编写页面的时候，我们需要去将组件包裹在<div>中，否则报错警告。
2. Teleport
   Vue3 提供 Teleport 组件可将部分 DOM 移动到 Vue app 之外的位置。比如项目中常见的 Dialog 组件。
3. Suspense 异步组件
4. composition api
   Vue2 是 选项式 API（Option API），一个逻辑会散乱在文件不同位置（data、props、computed、watch、生命周期函数等），导致代码的可读性变差，需要上下来回跳转文件位置。Vue3 组合式 API（Composition API）则很好地解决了这个问题，可将同一逻辑的内容写到一起。增强了代码的可读性、内聚性,同时通过抽取hook实现逻辑复用，提升效率。相较于mixin具有隐式依赖等缺点，更具备可用性
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

### Vue3.0 新特性

https://www.jianshu.com/p/9d3ddaec9134

Proxy：不只是解决了 defineProperty 的局限性
Performance：性能比 Vue 2.x 快 1.2~2 倍
Tree shaking support：可以将无用模块“剪辑”，仅打包需要的，按需编译,体积比 Vue2.x 更小
Composition API: 组合 API(类似 React Hooks)
Better TypeScript support：更优秀的 Ts 支持
Custom Renderer API：暴露了自定义渲染 API
Fragment, Teleport(Protal), Suspense：更先进的组件，“碎片”，Teleport 即 Protal 传送门，“悬念”。

### Vue3 为什么这么快，做了哪些优化

#### 双向绑定

- 2.0 现有限制：

无法检测到新的属性添加/删除
无法监听数组的变化
需要深度遍历，浪费内存
3.0 优化：

使用 ES6 的**Proxy** 作为其观察者机制，取代之前使用的 Object.defineProperty。

1. Proxy 默认 可以支持数组
   允许框架拦截对象上的操作
   多层对象嵌套，使用懒代理

#### 虚拟 Dom

2.0 虚拟 DOM 性能瓶颈：

虽然 vue 能够保证触发更新的组件最小化，但单个组件部分变化需要遍历该组件的整个 vdom 树
传统 vdom 性能跟模版大小正相关，跟动态节点的数量无关
3.0 优化工作

在 vue 3.0 中重新推翻后重写了虚拟 DOM 的实现，官方宣称渲染速度最快可以翻倍。更多**编译时的优化以减少运行时的开销**

#### diff 算法优化

**Vue2 中的虚拟 dom 是进行全量的对比**，即数据更新后在虚拟 DOM 中每个标签内容都会对比有没有发生变化

Vue3 新增了**静态标记(PatchFlag)**

在创建虚拟 DOM 的时候会根据 DOM 中的内容会不会发生变化添加静态标记

数据更新后，只对比带有**patch flag**的节点

#### hoistStatic 静态提升

Vue2 中无论元素是否参与更新, 每次都会重新创建, 然后再渲染
Vue3 中对于不参与更新的元素, 会做静态提升, 只会被创建一次, 在渲染时直接复用即可

#### 事件监听缓存

默认情况下 onClick 会被视为动态绑定, 所以每次都会去追踪它的变化，但是因为是同一个函数，所以没有追踪变化, 直接缓存起来复用即可

### 相比较 2.0 有哪些变化

响应式基本原理：Object.defineProperty -> Proxy，提高性能
初始化方式：Options api -> composition api，提供代码复用，更好的 tree-shaking
初始化项目：vue-cli -> vite，提高开发效率
扩展方法：Vue.property.xxx -> config.globalProperties.xxx，更好的 tree-shaking
实例化：new Vue -> createApp。

#### reactive 和 ref 的区别

ref 数据响应式监听。ref 函数传入一个值作为参数，一般传入基本数据类型，返回一个基于该值的响应式 Ref 对象，该对象中的值一旦被改变和访问，都会被跟踪到，就像我们改写后的示例代码一样，通过修改 count.value 的值，可以触发模板的重新渲染，显示最新的值

reactive 是用来定义更加复杂的数据类型，但是定义后里面的变量取出来就不在是响应式 Ref 对象数据了，所以需要用 toRefs 函数转化为响应式数据对象

ref 和 reactive 本质我们可以简单的理解为 ref 是对 reactive 的二次包装, ref 定义的数据访问的时候要多一个.value

#### Vue3.0 Diff 算法

https://blog.csdn.net/zl_Alien/article/details/106595459

### 为什么引入组合式 API

对象式 API 存在的问题

- 不利于复用
- 潜在命名冲突
- 上下文丢失

组合式 API 提供的能力

- 极易复用
- 可灵活组合（生命周期钩子可多次使用）
- 提供更好的上下文支持

### vue3 中移除了 native 修饰符，现在该如何绑定原生事件

v-on 的 .native 修饰符已被移除。同时，新增的 emits 选项允许子组件定义真正会被触发的事件。

因此，对于子组件中未被定义为组件触发的所有事件监听器，Vue 现在将把它们作为原生事件监听器添加到子组件的根元素中 (除非在子组件的选项中设置了 inheritAttrs: false)。

<my-component
  v-on:close="handleComponentEvent"
  v-on:click="handleNativeClickEvent"
/>
MyComponent.vue

<script>
  export default {
    emits: ['close']
  }
</script>

## vue3.0为什么要引入CompositionAPI？
更好的代码组织，options api造成了代码的跳来跳去
逻辑复用更加的方便，虽然mixin也能够很好的复用代码，但是当mixin多了以后就不知道变量哪里来的了，还会造成命名冲突
没有让人捉摸不透的this
