### CSS 的权重和优先级

#### 权重

从 0 开始，

1. 内联样式，权值为 1000
2. ID 选择器，权值为 0100
3. 类，伪类和属性选择器，权值为 0010
4. 标签选择器和伪元素选择器，权值为 0001
5. 通配符、子选择器、相邻选择器等，权值为 0000
   继承的样式没有权值

#### 优先级

权重相同，写在后面的覆盖前面的
使用 !important 达到最大优先级，都使用 !important 时，权重大的优先级高

### css 伪类与伪元素区别

###### 伪类

⽤来选择 DOM 树之外的信息,不能够被普通选择器选择的⽂档之外的元素，⽤来添加⼀些选择器的特殊效果。⽐如:hover :active :visited :link :visited :first-child :focus :lang 等

###### 伪元素：

DOM 树没有定义的虚拟元素。⽐如::before ::after 它选择的是元素指定内容，表示选择元素内容的之前内容或之后内容

###### 区别

1. 伪类和伪元素都是⽤来表示⽂档树以外的"元素"。
2. 伪类和伪元素分别⽤单冒号:和双冒号::来表示。
3. 伪类和伪元素的区别，**关键点在于是否需要添加元素才能达到效果，如果需要则是伪元素，反之则是伪类**。

### css 实现 div 宽度自适应,宽高等比例缩放

利用元素的 margin/padding 百分比是相对父元素 width 的性质来实现：

```css
.square {
  width: 30%;
  overflow: hidden;
  background: red;
  /* 这样max-height就生效了 */
  /* max-height: 100px */
}
.square::after {
  content: "";
  display: block;
  padding-top: 100%;
}
```

### ul 内部除最后一个 li 以外设置右边框效果

```css
/* 解法1 */
ul li:not(:last-child) {
  border: 1px solid #ccc;
}
/* 解法2*/
ul li {
  border: 1px solid #ccc;
}
ul li:nth-last-of-type(1) {
  border: unset;
}
/* 或 */
ul li:nth-last-child(1) {
  border: unset;
}
```

### nth-of-type() ,nth-child() 的区别

:nth-of-type 为什么要叫:nth-of-type？因为它是以"type"来区分的。

1. ele:nth-of-type(n)是指父元素下**第 n 个 ele 元素**。
2. ele:nth-child(n)是指父元素下**第 n 个元素且这个元素为 ele**，若不是，则选择失败。

```html
<style>
  /* 选中的是 one*/
  .demo li:nth-child(2) {
    color: #ff0000;
  }
  /*  选中的是 two*/
  .demo li:nth-of-type(2) {
    color: #00ff00;
  }
  /* 选中的是 one*/
  .demo :nth-child(2) {
    color: #ff0000;
  }
  /*  选中的是 two, three*/
  /* 不指定标签类型时，:nth-type-of(2)会选中所有类型标签的第二个。 */
  .demo :nth-of-type(2) {
    color: #00ff00;
  }
</style>
<body>
  <div>
    <ul class="demo">
      <p>zero</p>
      <li>one</li>
      <li>two</li>
      <p>three</p>
    </ul>
  </div>
</body>
```

### Flex 布局是什么？

Flex 是 Flexible Box 的缩写，意为"弹性布局"，用来为盒状模型提供最大的灵活性。

#### 容器属性

1. flex-direction:主轴方向
   row | row-reverse | column | column-reverse;
2. flex-wrap:
   1. nowrap(默认)
   2. wrap
   3. wrap-reverse
3. flex-flow：flex-direction 属性和 flex-wrap 属性的简写形式，默认值为 row nowrap。
4. justify-content:项目在主轴上的对齐方式。
   1. flex-start（默认值）：左对齐
   2. flex-end：右对齐
   3. center： 居中
   4. space-between：两端对齐，项目之间的间隔都相等。
   5. space-around：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。
5. align-items：项目在**交叉轴**上如何对齐
   1. flex-start：交叉轴的起点对齐。
   2. flex-end：交叉轴的终点对齐。
   3. center：交叉轴的中点对齐。
   4. baseline: 项目的第一行文字的基线对齐。
   5. stretch（默认值）：如果项目未设置高度或设为 auto，将占满整个容器的高度。
6. align-content: 定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。

#### 项目属性

1. flex
2. flex-grow
3. flex-shrink
4. flex-basis
5. order : 定义项目的排列顺序。数值越小，排列越靠前，默认为 0。
6. align-self:允许单个项目有与其他项目不一样的对齐方式，可覆盖 align-items 属性。默认值为 auto,表示继承父元素的 align-items 属性，如果没有父元素，则等同于 stretch。

### flex:1 的完整写法

[Flex 布局教程：语法篇](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html?20170330153525)

```css
/* flex:1 的完整写法 */
flex-grow: 1
flex-shrink: 1;
flex-basis: 0%；

/* 默认值 */
flex-grow: 0;
flex-shrink: 1;
flex-basis: auto;
```

默认值 0 1 auto;

1. flex-grow 定义项目的放大比例，默认为 0，如果存在剩余空间，也不放大
2. flex-shrink 定义项目的缩小比例，默认为 1，如果存在空间不足，将该项目缩小
3. flex-basis 给上面两个属性分配多余空间之前，计算项目是否还有多余空间，默认为 auto,项目本身的大小

##### flex 常见使用方法：

```js
// flex: none; 等价于flex: 0 0 auto;

// flex: auto; 等价于flex: 1 1 auto;

// flex: 1;    等价于flex: 1 1 0%;  值为非负数字，该值设置的是flex-grow。

// flex: 1 0;  等价于flex: 1 0 0%;  相当于设置的flex-grow和flex-shrink,flex-basis的值为初始值。

// flex: 1 20%;等价于flex: 1 1 20%; 值为一个数字和一个长度或百分比时，设置的是flex-grow和flex-basis，flex-shink的值为初始值。
```

##### flex 取值情况

1. flex:none

```css
flex-grow: 0;
flex-shrink: 0;
flex-basis: auto;
```

2. flex:auto

```css
flex-grow: 1;
flex-shrink: 1;
flex-basis: auto;
```

3. flex:非负数

```css
flex-grow:非负数
flex-shrink:1;
flex-basis:0%;
```

4. flex:取值为长度或百分比

```css
flex-grow:1
flex-shrink:1;
flex-basis:取值为长度或百分比;
```

5. flex : 两个非负数

```css
.item {
  flex: 2 3;
}
/* 等价于 */
.item {
  flex-grow: 2;
  flex-shrink: 3;
  flex-basis: 0%;
}
```

6. flex:一个非负数和一个长度或百分比

```css
flex-grow:非负数
flex-shrink:1;
flex-basis:取值为长度或百分比;

```

### 行内元素和块级元素的区别

1. 行内元素水平排列
2. 块级元素自动占据一行，默认宽度是父元素的 100%；垂直排列
3. 行内元素设置 width，height, margin 上下， padding 上下无效

### 说一下 Css 预处理器，Less 带来的好处

less 的变量符号是@， sass 是 $;

##### 解决的问题

1. css 语法不够强大，无法嵌套导致有很多重复的选择器

2. 没有变量和合理的复用，导致逻辑上相关的属性值只能以字面量重复输出，难以维护

##### 常用规范

变量， 嵌套语法， 混入， @import , 运算，函数，继承

##### 好处

1. css 代码更加整洁，代码量少，易维护
2. 修改更快，基础属性使用变量，无需多处改动，即可改变效果
3. 变量，混入提升了样式的复用性
4. 工具函数类似颜色函数，使得 css 更加像一个真正的编程语言，容易生成复杂的 css 样式

### Css 超出省略

```scss
@mixin text-overflow($width: 100%, $display: block) {
  width: $width;
  display: $display;
  white-space: nowrap;
  -ms-text-overflow: ellipsis;
  text-overflow: ellipsis;
  overflow: hidden;
}
@mixin mutil-text-overflow($line: 2, $width: 100%) {
   width:$width
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: $line; //需要显示的行数
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### position 定位不仅仅是 absolute, fixed, relative

1. static
   默认值，按照正常文档流布局
2. sticky
   粘性定位，该定位基于用户滚动的位置。它的行为就像 position:relative; 而当页面滚动超出目标区域时，它的表现就像 position:fixed;根据 top, left,它会固定在目标位置。
3. initial
4. inherit
   继承父元素,ie8 以及以前不支持

### Css 实现水波纹

```html
<style>
  .wave-content {
    height: 666px;
    width: 666px;
    left: 255px;
    top: 139px;
    position: relative;
  }

  .wave {
    position: absolute;
    left: 0px;
    top: 0px;
    height: 100%;
    width: 100%;
    transform-origin: center center;
    background-color: transparent;
    border: 1px solid #979797;
    border-radius: 50%;
    opacity: 0;
    animation: wv 2s linear infinite;
  }

  .wave1 {
    animation-delay: 0s;
  }

  .wave2 {
    animation-delay: 1.5s;
  }

  .wave3 {
    animation-delay: 3s;
  }

  .wave4 {
    animation-delay: 4.5s;
  }

  @keyframes wv {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }

    30% {
      opacity: 0.7;
      transform: scale(0.65);
    }

    70% {
      opacity: 0.1;
      transform: scale(0.85);
    }

    100% {
      opacity: -0.2;
      transform: scale(1);
    }
  }
</style>
<body>
  <div class="wave-content">
    <div class="wave wave1"></div>
    <div class="wave wave2"></div>
    <div class="wave wave3"></div>
    <div class="wave wave4"></div>
  </div>
</body>
```

### css 加载会造成阻塞吗？

对于一个 HTML 文档来说，不管是内联还是外链的 css，都会阻碍后续的 dom 渲染，但是不会阻碍后续 dom 的解析。

1. css 加载**不会阻塞 DOM 树的解析**
2. css 加载**会阻塞 DOM 树的渲染**
3. css 加载**会阻塞后面 js 语句的执行**

因此，为了避免让用户看到长时间的白屏时间，我们应该尽可能的提高 css 加载速度，比如可以使用以下几种方法:

使用 CDN(因为 CDN 会根据你的网络状况，替你挑选最近的一个具有缓存内容的节点为你提供资源，因此可以减少加载时间)

1. 对 css 进行压缩(可以用很多打包工具，比如 webpack,gulp 等，也可以通过开启 gzip 压缩)
2. 合理的使用缓存(设置 cache-control,expires,以及 E-tag 都是不错的，不过要注意一个问题，就是文件更新后，你要避免缓存而带来的影响。其中一个解决防范是在文件名字后面加一个版本号)
3. 减少 http 请求数，将多个 css 文件合并，或者是干脆直接写成内联样式(内联样式的一个缺点就是不能缓存)

### js 加载会造成阻塞吗？

js 会阻塞 dom 解析和渲染，但在阻塞的同时，其他线程会解析文档的其余部分(预解析)，找出并加载需要通过网络加载的其他资源，资源可以并行加载，提高加载速度，但是不会修改解析出来的 dom 树，只会解析外部资源。
优化：将 script 标签放在合适的位置，
使用 async/defer 来异步加载执行 js.

1. defer 属性表示延迟执行引入的 JavaScript，载入 JavaScript 文件时不阻塞 HTML 的解析，执行阶段被放到 HTML 标签解析完成之后。

defer 不会改变 script 中代码的执行顺序

2. async 属性表示异步执行引入的 JavaScript，与 defer 的区别在于，**如果已经加载好，就会开始执行——无论此刻是 HTML 解析阶段还是 DOMContentLoaded 触发之后**。需要注意的是，这种方式加载的 JavaScript 依然会阻塞 load 事件。换句话说，async-script 可能在 DOMContentLoaded 触发之前或之后执行，但一定在 load 触发之前执行。

### 什么情况下会出现浏览器分层

[浏览器层合成与页面渲染优化](https://juejin.cn/post/6844903966573068301)
分层与合成
将素材分解成多个图层称为分层，将图层合并到一起的操作就是合成。

1. 3d transform
2. video, canvas, iframe
3. css 动画实现的 opacity 动画转换
4. position:fixed;
5. will-change;
6. filter

### 说一下你知道的浏览器渲染相关的点

浏览器渲染的大致流程

1. 构建 DOM 树：浏览器将 HTML 解析成树形结构的 DOM 树，一般来说，这个过程发生在页面初次加载，或页面 JavaScript 修改了节点结构的时候。

2. 构建渲染 render 树：浏览器将 CSS 解析成树形结构的 CSSOM 树，再和 DOM 树合并成渲染树。

3. 布局（Layout）：浏览器根据渲染树所体现的节点、各个节点的 CSS 定义以及它们的从属关系，计算出每个节点在屏幕中的位置。Web 页面中元素的布局是相对的，在页面元素位置、大小发生变化，往往会导致其他节点联动，需要重新计算布局，这时候的布局过程一般被称为**回流（Reflow）**。

4. 绘制（Paint）：遍历渲染树，调用渲染器的 paint() 方法在屏幕上绘制出节点内容，本质上是一个像素填充的过程。这个过程也出现于回流或一些不影响布局的 CSS 修改引起的屏幕局部重画，这时候它被称为**重绘**（Repaint）。实际上，绘制过程是在多个层上完成的，这些层我们称为渲染层（RenderLayer）。

5. 渲染层合成（Composite）：
   Composite（渲染层合并）：按照合理的顺序合并图层然后显示到屏幕上
   在 DOM 树中每个节点都会对应一个渲染对象（RenderObject），当它们的渲染对象处于相同的坐标空间（z 轴空间）时，就会形成一个 RenderLayers，也就是渲染层。渲染层将保证页面元素以正确的顺序堆叠，这时候就会出现层合成（composite），从而正确处理透明元素和重叠元素的显示

### 什么是重绘重排， 哪些操作会造成重绘重排，如何优化

> 1：用 transform 代替 top，left ，margin-top， margin-left... 这些位移属性
> 2：用 opacity 代替 visibility，但是要同时有 translate3d 或 translateZ 这些可以创建的图层的属性存在才可以阻止回流
> 但是第二点经过我的实验，发现如果不加 transform: translateZ(0) 配合 opacity 的话还是会产生回流的，而只用 visibility 就只会产生重绘不会回流
> 而 opacity 加上 transform: translateZ/3d 这个属性之后便不会发生回流和重绘了
> 3：不要使用 js 代码对 dom 元素设置多条样式，选择用一个 className 代替之。
> 4：如果确实需要用 js 对 dom 设置多条样式那么可以将这个 dom 先隐藏，然后再对其设置
> 5：不要在循环内获取 dom 的样式例如：offsetWidth, offsetHeight, clientWidth, clientHeight... 这些。浏览器有一个回流的缓冲机制，即多个回流会保存在一个栈里面，当这个栈满了浏览器便会一次性触发所有样式的更改且刷新这个栈。但是如果你多次获取这些元素的实际样式，浏览器为了给你一个准确的答案便会不停刷新这个缓冲栈，导致页面回流增加。
> 所以为了避免这个问题，应该用一个变量保存在循环体外。
> 6：不要使用 table 布局，因为 table 的每一个行甚至每一个单元格的样式更新都会导致整个 table 重新布局
> 7：动画的速度按照业务按需决定
> 8：对于频繁变化的元素应该为其加一个 transform 属性，对于视频使用 video 标签
> 9：必要时可以开启 GPU 加速，但是不能滥用

原文链接：https://blog.csdn.net/longyanchen/article/details/92841120

1. 重排
   当 DOM 的变化引发了元素几何属性的变化，比如改变元素的宽高，元素的位置，导致浏览器不得不重新计算布局绘制，这个过程称为“重排”
2. 重绘
   当影响 DOM 元素可见性的属性发生变化 (如 color) 时, 浏览器会重新描绘相应的元素, 此过程称为 重绘（Repaint)。因此重排必然会引起重绘。

3. 引起重绘重排的操作

   - 页面首次渲染。

   - 浏览器窗口大小发生改变。

   - 元素尺寸或位置发生改变。

   - 元素内容变化（文字数量或图片大小等等）。

   - 元素字体大小变化。

   - 添加或者删除可见的 DOM 元素。

   - 激活 CSS 伪类（例如：:hover）。

   - 设置 style 属性

   - 查询某些属性或调用某些方法。

4. 性能优化

- 减少 DOM 操作

  - 最小化 DOM 访问次数，尽量缓存访问 DOM 的样式信息，避免过度触发回流。
  - 如果在一个局部方法中需要多次访问同一个 dom，则先暂存它的引用。

- 采用更优的 API 替代消费高的 api，转换优化消费高的集合

  - 用 querySelectorAll()替代 getElementByXX()。

  - 开启动画的 GPU 加速，把渲染计算交给 GPU。

  - 少用 HTML 集合（类数组）来遍历，因为集合遍历比真数组遍历耗费更高。

  - 用事件委托来减少事件处理器的数量。

* 减少重排

  - 避免设置大量的 style 属性，因为通过设置 style 属性改变结点样式的话，每一次设置都会触发一次 reflow，所以最好是使用 class 属性

  - 实现元素的动画，它的 position 属性，最好是设为 absoulte 或 fixed，这样不会影响其他元素的布局

  - 动画实现的速度的选择。比如实现一个动画，以 1 个像素为单位移动这样最平滑，但是 reflow 就会过于频繁，大量消耗 CPU 资源，如果以 3 个像素为单位移动则会好很多。
  
  - 不要使用 table 布局，
    因为 table 中某个元素旦触发了 reflow，那么整个 table 的元素都会触发 reflow。那么在不得已使用 table 的场合，可以设置 table-layout:auto;或者是 table-layout:fixed 这样可以让 table 一行一行的渲染，这种做法也是为了限制 reflow 的影响范围

- css 及动画处理

  - 少用 css 表达式

  - 减少通过 JavaScript 代码修改元素样式，尽量使用修改 class 名方式操作样式或动画；

  - 动画尽量使用在绝对定位或固定定位的元素上；

  - 隐藏在屏幕外，或在页面滚动时，尽量停止动画

### BFC 是什么， 触发的条件，有哪些应用场景

[什么是 BFC？看这一篇就够了](https://blog.csdn.net/sinat_36422236/article/details/88763187)

##### BFC 是什么

block format context:块级格式上下文。它是一个独立的渲染区域，只有块级 box 参与， 它规定了内部的 块级 box 如何布局，并且与这个区域外部毫不相干。
布局规则：

1. 内部的 Box 会在垂直方向，一个接一个地放置。

2. Box 垂直方向的距离由 margin 决定。属于同一个 BFC 的两个相邻 Box 的 margin 会发生重叠。不同 BFC 不会

3. 每个盒子（块盒与行盒）的 margin box 的左边，与包含块 border box 的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此。

4. BFC 的区域不会与 float box 重叠。

5. BFC 就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。

6. 计算 BFC 的高度时，浮动元素也参与计算。

##### 如何触发 BFC

1. float 的值不是 none。
2. position 的值是 absolute / fixed。
3. display 的值是 inline-block、table-cell、flex、table-caption 或者 inline-flex
4. overflow 的值不是 visible

##### 应用场景

1. 利用 BFC 避免 margin 重叠。//对应第 2 条
2. BFC 的区域不会与浮动元素发生重叠，所以两侧就不会发生重叠，实现了自适应两栏布局。 //第 3 条和第 4 条。
   .left 设置浮动
   .right 触发 bfc
   ```js
   .left{
     width: 100px;
     height: 200px;
     background: red;
     float: left;
   }
   .right{
     height: 300px;
     background: blue;
     overflow: hidden;
   }
   <div class="left"></div>
   <div class="right"></div>
   ```

左侧设置 float:left，右侧设置 overflow: hidden。这样右边就触发了 BFC，BFC 的区域不会与浮动元素发生重叠，所以两侧就不会发生重叠，实现了自适应两栏布局。

3. 清除浮动 //第 6 条
   当我们不给父节点设置高度，子节点设置浮动的时候，会发生高度塌陷，这个时候我们就要清除浮动。

### line-height 如何继承？

父元素的 line-height 写了具体数值，比如 30px，则子元素 line-height 继承该值。
父元素的 line-height 写了比例，比如 1.5 或 2，则子元素 line-height 也是继承该比例。
**父元素的 line-height 写了百分比，比如 200%，则子元素 line-height 继承的是父元素 font-size \* 200% 计算出来的值**。

### 响应式布局用到的技术，移动端需要注意什么

##### 技术

1. 通过媒体查询的方式即 CSS3 的 media queries
   移动端优先使用 min-width (屏幕宽度从小到大)
   pc 端优先使用 max-width(从大到小)
2. 百分比布局
3. 以天猫首页为代表的 flex 弹性布局
   高度定死，宽度自适应，元素都采用 px 做单位。

4. 以淘宝首页为代表的 rem+viewport 缩放
   **根节点 fontSize 根据宽度决定，viewport 动态设置为 1/dpr**
   根据 rem 将页面放大 dpr 倍, 然后 viewport 设置为 1/dpr.
   这样整个网页在设备内显示时的页面宽度就会等于设备逻辑像素大小，也就是 device-width。
   这个 device-width 的计算公式为：设备的物理分辨率/(devicePixelRatio \* scale)，

5. rem 方式
   通过 js 动态设置根元素的 font-size，用 rem 做单位。

6. 视口单位

   1. 仅使用 vw 作为 css 单位，

      1. 设计稿的尺寸转换成单位

      ```scss
      //iPhone 6尺寸作为设计稿基准
      $vm_base: 375;
      @function vw($px) {
        @return ($px / $vm_base) * 100vw;
      }
      ```

      1. 文本，宽度等使用 vw 作为单位
         padding:vm(15)

7. 搭配 vw 和 rem;
   ```scss
   // rem 单位换算：定为 75px 只是方便运算，750px-75px、640-64px、1080px-108px，如此类推
   $vm_fontsize: 75; // iPhone 6尺寸的根元素大小基准值
   @function rem($px) {
     @return ($px / $vm_fontsize) * 1rem;
   }
   // 根元素大小使用 vw 单位
   $vm_design: 750;
   html {
     750/
     font-size: ($vm_fontsize / ($vm_design / 2)) * 100vw;
     // 同时，通过Media Queries 限制根元素最大最小值
     @media screen and (max-width: 320px) {
       font-size: 64px;
     }
     @media screen and (min-width: 540px) {
       font-size: 108px;
     }
   }
   // body 也增加最大最小宽度限制，避免默认100%宽度的 block 元素跟随 body 而过大过小
   body {
     max-width: 540px;
     min-width: 320px;
   }
   ```

##### 图片响应式

1. max-width：100% 随容器的大小缩放
2. srcset

```html
<img
  srcset="photo_w350.jpg 1x, photo_w640.jpg 2x"
  src="photo_w350.jpg"
  alt=""
/>
```

3. background-imgage 配合媒体查询
4. picture

```javascript
<picture>
    <source srcset="banner_w1000.jpg" media="(min-width: 801px)">
    <source srcset="banner_w800.jpg" media="(max-width: 800px)">
    <img src="banner_w800.jpg" alt="">
</picture>

<!-- picturefill.min.js 解决IE等浏览器不支持 <picture> 的问题 -->
<script type="text/javascript" src="js/vendor/picturefill.min.js"></script>
```

##### 移动端需要注意的

1. 禁用缩放

```html
<meta
  name="viewport"
  content="width=device-width,user-scalable=no,initial-scale=1.0,maximum=1.0,minimum=1.0"
/>
<!-- width=device-width//页面大小屏幕等宽
   initial-scale=1.0//初始缩放比例，1.0 表示原始比例大小
   user-scalable=no//用户是否可以缩放，这里 no 表示不可以。 -->
```

2. 1px 问题
   逻辑像素，物理像素
   解决：viewPort+rem / transform:scale(0.5)

### Css inherit ,initial ,unset 的区别

1. inherit 继承父级样式
2. initial 恢复到浏览器默认样式
3. unset 不设置 优先使用 inherit 的样式，其次会用到 initial 的样式。

### img 是什么元素

1. 内联元素
2. 可以设置 width/height
3. 替换元素

### 替换元素

浏览器根据元素的标签和属性，来决定元素的具体显示内容。
textarea, input, img, select
替换元素一般有内在尺寸，所以有 width/height

### 左右 100px,中间自适应的三列布局（至少三种）\*\*

[详解 CSS 七种三栏布局技巧](https://zhuanlan.zhihu.com/p/25070186)

1. 双飞翼布局
   content 宽度 100%， 设置浮动。
   main 包在 content 里面 设置左右边距为 left,right 宽度。
   left 左浮动，且 margin-left：-100%。
   right 右浮动，margin-left: -自身宽度。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      .content {
        float: left;
        width: 100%;
      }
      .main {
        height: 200px;
        margin-left: 100px;
        margin-right: 100px;
        background-color: green;
      }
      .left {
        float: left;
        height: 200px;
        width: 100px;
        margin-left: -100%;
        background-color: red;
      }
      .right {
        width: 100px;
        height: 200px;
        float: right;
        margin-left: -100px;
        background-color: blue;
      }
    </style>
  </head>
  <body>
    <div class="content">
      <div class="main"></div>
    </div>
    <div class="left"></div>
    <div class="right"></div>
  </body>
</html>
```

2. 圣杯布局
   container 设置左右 margin 为 left,right 的宽度
   left, right :float:left，margin-left 分别设为 -100%；和自身宽度; 设置相对定位 left 为-width, right 为-width

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      .container {
        margin-left: 120px;
        margin-right: 220px;
      }
      .main {
        float: left;
        width: 100%;
        height: 300px;
        background-color: red;
      }
      .left {
        float: left;
        width: 100px;
        height: 300px;
        margin-left: -100%;
        position: relative;
        left: -120px;
        background-color: blue;
      }
      .right {
        float: left;
        width: 200px;
        height: 300px;
        margin-left: -200px;
        position: relative;
        right: -220px;
        background-color: green;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="main"></div>
      <div class="left"></div>
      <div class="right"></div>
    </div>
  </body>
</html>
```

3. BFC 三栏布局

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      .left {
        float: left;
        height: 200px;
        width: 100px;
        margin-right: 20px;
        background-color: red;
      }
      .right {
        width: 200px;
        height: 200px;
        float: right;
        margin-left: 20px;
        background-color: blue;
      }
      .main {
        height: 200px;
        overflow: hidden;
        background-color: green;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="left"></div>
      <div class="right"></div>
      <div class="main"></div>
    </div>
  </body>
</html>
```

4. 浮动布局 left:float,right:float,main 设置 margin

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>浮动布局</title>
    <style>
      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }

      .main {
        height: 100%;
        margin: 0 100px;
        background: blue;
      }

      .left {
        float: left;
        width: 100px;
        height: 100%;
        background: red;
      }

      .right {
        width: 100px;
        height: 100%;
        background: red;
        float: right;
      }
    </style>
  </head>

  <body>
    <div class="left"></div>
    <div class="right"></div>
    <div class="main"></div>
  </body>
</html>
```

4. 绝对定位布局 position+margin

```html
<div class="container">
  <div class="left">left</div>
  <div class="right">right</div>
  <div class="main">main</div>
</div>
<style>
  body,
  html {
    padding: 0;
    margin: 0;
  }
  .left,
  .right {
    position: absolute;
    top: 0;
    background: red;
  }
  .left {
    left: 0;
    width: 200px;
  }
  .right {
    right: 0;
    width: 200px;
  }
  .main {
    margin: 0 200px;
    background: green;
  }
</style>
```

5. flex 布局

```html
<div class="container">
  <div class="left">left</div>
  <div class="main">main</div>
  <div class="right">right</div>
</div>
<style>
  .container {
    display: flex;
  }
  .left {
    flex-basis: 200px;
    background: green;
  }
  .main {
    flex: 1;
    background: red;
  }
  .right {
    flex-basis: 200px;
    background: green;
  }
</style>
```

6. calc 函数

### 宽高不固定的 div 垂直水平居中

1. flex
2. position+transform
3. 父元素: display：table-cell，vertical-align:middle;
   子元素： display:inline-block / margin:auto
4. display:flex(父元素)+margin:auto
5. grid(父元素) + align-self：center; justify-self:center
6. grid(父元素) + margin:auto

```css
.wp {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}
.box {
  display: inline-block;
}
```

### 多行文本居中

```css
.parent {
  display: table;
  width: 300px;
  height: 300px;
  text-align: center;
}
.son {
  display: table-cell;
  height: 200px;
  background-color: yellow;
  vertical-align: middle;
}
```

### flex 布局设置 8 个元素两行显示

```html
<style>
  .parent {
    width: 100%;
    height: 150px;
    display: flex;
    flex-flow: row wrap;
    /* 多个轴线的对齐方式*/
    align-content: flex-start;
  }
  .child {
    box-sizing: border-box;
    background-color: white;
    flex: 0 0 25%;
    height: 50px;
    border: 1px solid red;
  }
</style>
<div class="parent">
  <div class="child"></div>
  <div class="child"></div>
  <div class="child"></div>
  <div class="child"></div>
  <div class="child"></div>
  <div class="child"></div>
  <div class="child"></div>
  <div class="child"></div>
</div>
```

## 1. 为什么需要清除浮动？清除浮动的方式

### 浮动的定义

非 IE 浏览器下，容器不设高度且子元素浮动时，容器高度不能被内容撑开。 此时，内容会溢出到容器外面而影响布局。这种现象被称为浮动（溢出）。

### 浮动的工作原理：

浮动元素脱离文档流，不占据空间（引起“高度塌陷”现象）
浮动元素碰到包含它的边框或者其他浮动元素的边框停留
浮动元素只会对其后面的元素产生影响
浮动元素可以左右移动，直到遇到另一个浮动元素或者遇到它外边缘的包含框。浮动框不属于文档流中的普通流，当元素浮动之后，不会影响块级元素的布局，只会影响内联元素布局。此时文档流中的普通流就会表现得该浮动框不存在一样的布局模式。当包含框的高度小于浮动框的时候，此时就会出现“高度塌陷”。

### 浮动元素引起的问题？

1. 父元素的高度无法被撑开，影响与父元素同级的元素
2. 与浮动元素同级的非浮动元素会跟随其后
3. 若浮动的元素不是第一个元素，则该元素之前的元素也要浮动，否则会影响页面的显示结构

### 清除浮动的方式如下：

1. 给父级 div 定义 height 属性
2. 最后一个浮动元素之后添加一个空的 div 标签，并添加 clear:both 样式
3. 包含浮动元素的父级标签添加 overflow:hidden 或者 overflow:auto
4. 使用 :after 伪元素。由于 IE6-7 不支持 :after，使用 zoom:1 触发 hasLayout\*\*

### 清除浮动

除浮动主要是为了防止父元素塌陷。清除浮动的方法有很多，常用的是 clearfix 伪类。

1. 方法一：clearfix

```css
<div class="outer clearfix" > <div class="inner" > inner</div > </div > .outer {
  background: blue;
}
.inner {
  width: 100px;
  height: 100px;
  background: red;
  float: left;
}
.clearfix:after {
  content: "";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
```

方法二：额外加一个 div，clear:both

```css
<div
  class="container"
  > <div
  class="inner"
  > </div
  > <div
  class="clear"
  > </div
  > </div
  > .container {
  background: blue;
}
.inner {
  width: 100px;
  height: 100px;
  background: red;
  float: left;
}
.clear {
  clear: both;
}
```

方法三：触发父盒子 BFC，overflow:hidden

```css
<div class="outer" > <div class="inner" > inner</div > </div > .outer {
  background: blue;
  overflow: hidden;
}
.inner {
  width: 100px;
  height: 100px;
  background: red;
  float: left;
}
```

### link @import 的区别

1. link 属于 xHTMl 标签，除了加载 css 以外，还可以定义 RSS 等其他事务，@import 属于 css 范畴，只能加载 css
2. link 在页面载入时同时加载，@import 需要页面网页完全载入后加载，会出现一开始没有 css，闪烁一下后出现样式的情况。
3. link 无兼容问题，@import 在低版本浏览器不支持
4. link 支持 js 控制 dom， @import 不支持。

### grid 布局

[CSS Grid 网格布局教程 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)

##

```html
<style>
  .outer {
    display: flex;
    width: 400px;
    height: 400px;
    background-color: aqua;
    justify-content: center;
    align-items: center;
  }
  .inner {
    width: 100px;
    margin: auto;

    background-color: red;
    position: relative;
    overflow: hidden;
  }
  .inner:after {
    content: "";
    display: block;
    padding-bottom: 50%;
  }
  .inner div {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
</style>
<body>
  <div class="outer">
    <div class="inner">
      <div></div>
    </div>
  </div>
</body>
```

## 实现自适应两栏布局

1. 左 float，然后右 margin-left（右边自适应）

```css
.aside {
  width: 300px;
  float: left;
  background: yellow;
}
.main {
  background: aqua;
  margin-left: 300px;
}
```

2. float + bfc

```css
.aside {
  width: 300px;
  float: left;
  background: yellow;
}
.main {
  background: aqua;
  overflow: hidden;
}
```

3. float+负 margin

```css
.left {
  width: 100%;
  float: left;
  background: #f00;
  margin-right: -200px;
}

.right {
  float: left;
  width: 200px;
  background: #0f0;
}
```

4. flex 布局

```css
.container {
  display: flex;
}
.left {
  width: 200px;
}

.main {
  flex: 1;
  background: #0f0;
}
```

5. position+margin

```css
.container {
  position: relative;
}
.left {
  position: absolute;
  width: 300px;
  background: #0f0;
}

.right {
  width: 100%;
  margin-left: 300px;
  background: #00f;
}
```

## css 动画类型

1. transition 过渡动画

   1. transition: property duration timing-function delay;
   2. transition-property
      规定设置过渡效果的 CSS 属性的名称
   3. transition-duration
      规定完成过渡效果需要多少秒或毫秒
   4. transition-timing-function
      规定速度效果的速度曲线
   5. transition-delay
      定义过渡效果何时开始

2. animation 自定义动画

   1. name
      用来调用@keyframes 定义好的动画，与@keyframes 定义的动画名称一致

   2. duration
      指定元素播放动画所持续的时间

   3. timing-function
      规定速度效果的速度曲线，是针对每一个小动画所在时间范围的变换速率

   4. delay
      定义在浏览器开始执行动画之前等待的时间，值整个 animation 执行之前等待的时间

   5. iteration-count
      定义动画的播放次数，可选具体次数或者无限(infinite)

   6. direction
      设置动画播放方向：normal(按时间轴顺序),reverse(时间轴反方向运行),alternate(轮流，即来回往复进行),alternate-reverse(动画先反运行再正方向运行，并持续交替运行)

   7. play-state
      控制元素动画的播放状态，通过此来控制动画的暂停和继续，两个值：running(继续)，paused(暂停)

   8. fill-mode
      控制动画结束后，元素的样式，有四个值：none(回到动画没开始时的状态)，forwards(动画结束后动画停留在结束状态)，backwards(动画回到第一帧的状态)，both(根据 animation-direction 轮流应用 forwards 和 backwards 规则)，注意与 iteration-count 不要冲突(动画执行无限次)

3. transform 变换

## transition 和 animation 的区别:

1. Transition 强调过渡; Animation 强调流程与控制。

2. 两者的控制粒度不一样

   1. 某种程度上, transition 更加粗一点, 比如过渡的速度进行了封装, 可以控制是匀速改变还是贝塞尔曲线之类的。
   2. animation 提供的 keyframe 方法, 可以让你手动去指定每个阶段的属性; 此外 animation 还封装了循环次数, 动画延迟等功能, 更加自由和强大。

3. 动画状态:
   1. CSS 的 transition 只有两个状态:开始状态 和 结束状态。
   2. animation 可能是多个状态, 有帧的概念 。
4. 动画触发方式:
   1. CSS 的 transition 需要借助别的方式来触发, 比如 CSS 的状态选择器（如:hover）或 借助 JavaScript 来触发 。
   2. animation 不但可以使用上面的方式触发, 更重要的是可以自动触发 。
5. animation 控制动效上要比 transition 强，因为它具备一些控制动效的属性，比如“播放次数”、“播放方向”、“播放状态”等。
6. 动画实现的范围:
   1. transition 是有一定限制的, 并不是所有 CSS 的属性都具有过渡效果 。
   2. 另外相比而言, CSS 的 animation 要比 transition 强大的多, 几乎所有的 css 属性都可以实现动画效果。
   3. 这也是为什么使用 animation 制作 Web 动画的场景更多 。
7. 动画实现方式
   1. CSS 的 animation 是离不开 @keyframes 的，换句话说，我们需要先使用 @keyframes 来注册一个动画效果，即帧来描述动画效果。当然，只注册也不见得有效果，还是需要使用 animation-name 属性引用 @keyframes 注册好的动画效果。

## transition 和 animation 的共同点:

1. 从整体来看，animation 和 transition 想做的事情都是一样, 通过控制属性变化的过程也, 实现动画; 都是立足于控制本身 dom 的 css 属性变化过程, 来实现动画的视觉效果。而你看 transform 就不同, 本身一个 css 属性 。

2. 他们都有“持续时间”、“延迟时间” 和“时间缓动函数”等概念，这些都是用来控制动效的效果。

## visibility 和 display 的差别（还有 opacity)

1. display 设置了 none 属性会隐藏元素，且其位置也不会被保留下来，所以会触发浏览器渲染引擎的回流和重绘。
2. visibility 设置 hidden 会隐藏元素，但是其位置还存在与页面文档流中，不会被删除，所以会触发浏览器渲染引擎的重绘
3. opacity 会将元素设置为透明，但是其位置也在页面文档流中，不会被删除，所以会触发浏览器渲染引擎的重绘

## 盒模型

CSS 盒模型本质上是一个盒子，封装周围的 HTML 元素，它包括：外边距（margin）、边框（border）、内边距（padding）、实际内容（content）四个属性。
CSS 盒模型：标准模型 + IE 模型
标准盒子模型：宽度=内容的宽度（content）+ border + padding
低版本 IE 盒子模型：宽度=内容宽度（content+border+padding），如何设置成 IE 盒子模型:
box-sizing: border-box;

## box-sizing

box-sizing 属性可以被用来调整这些表现:

1. content-box  是默认值。如果你设置一个元素的宽为 100px，那么这个元素的内容区会有 100px 宽，并且任何边框和内边距的宽度都会被增加到最后绘制出来的元素宽度中。
2. border-box 告诉浏览器：你想要设置的边框和内边距的值是包含在 width 内的。也就是说，如果你将一个元素的 width 设为 100px，那么这 100px 会包含它的 border 和 padding，内容区的实际宽度是 width 减去(border + padding)的值。大多数情况下，这使得我们更容易地设定一个元素的宽高。

## 说一下你知道的 position 属性，都有啥特点？

1. static：无特殊定位，对象遵循正常文档流。top，right，bottom，left 等属性不会被应用。
2. relative：对象遵循正常文档流，但将依据 top，right，bottom，left 等属性在正常文档流中偏移位置。而其层叠通过 z-index 属性定义。
3. absolute：对象脱离正常文档流，使用 top，right，bottom，left 等属性进行绝对定位。而其层叠通过 z-index 属性定义。
4. fixed：对象脱离正常文档流，使用 top，right，bottom，left 等属性以窗口为参考点进行定位，当出现滚动条时，对象不会随着滚动。而其层叠通过 z-index 属性定义。
5. sticky：具体是类似 relative 和 fixed，在 viewport 视口滚动到阈值之前应用 relative，滚动到阈值之后应用 fixed 布局，由 top 决定。

## 两个 div 上下排列，都设 margin，有什么现象？

都正取大
一正一负相加

问：为什么会有这种现象？你能解释一下吗
是由块级格式上下文决定的，BFC，元素在 BFC 中会进行上下排列，然后垂直距离由 margin 决定，并且会发生重叠，具体表现为同正取最大的，同负取绝对值最大的，一正一负，相加
BFC 是页面中一个独立的隔离容器，内部的子元素不会影响到外部的元素。

## z-index 注意事项

1. 默认值：z-index 在 ie 下默认为 z-index:0;而 FF 下则默认为 z-index:auto;
   可以自己开头对全局进行设置，z-index:0;

2. 正常情况下：兄弟（同级）元素后者居上，父子之间子高于父；（没有设置定位浮动的情况下）

3. 对于定位元素，（不管 ie 还是 FF）非同级关系和非父子元素关系之间的 z 值大小（在 z 轴上的值）比较，
   需要回溯至其为兄弟关系的两个祖先元素上，先比较这两个元素的 z-index 值，只有当“兄”（前者）
   的 z-index 大于“弟”的 z-index 值，“兄”的各个后代元素，才能盖过“弟”元素及其后代元素。

4. 对于 IE，元素的 z-index 默认为 0，如果不另外设置“兄”，“弟”元素的 z-index 值，那么“兄”的
   z-index 就无法大于“弟”的 z-index。那么“兄”元素及其子孙就无法盖过“弟”元素及其子孙。
   而对于 FF,元素的 z-index 的默认值为 auto，auto 自动，表示“随便，不管我的事”；那么子孙的
   z 值等级就只跟他们本身的 z-index 的值有关。
