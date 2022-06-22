## CSS 模块化需要解决的问题

1. Class 命名冲突
2. Class 层级结构
3. CSS 代码复用
4. CSS 文件拆分

## CSS 模块方案

### BEM

BEM 是一种非常有用、强大且简单的命名约定，可以说是一个 CSS 命名规范，也可以说是一种思想。它使前端代码更易于阅读和理解、更易于使用、更易于扩展、更健壮和明确，并且更加严格。

BEM 的意思就是块（block）、元素（element）、修饰符（modifier）

我们可以简单看一下这个命名约定：

```css
.block {
} /* 代表了更高级别的抽象或组件 */
.block__element {
} /*  代表.block的后代，用于形成一个完整的.block的整体 */
.block--modifier {
} /* 代表.block的不同状态或不同版本 */
```

上面的描述有些官方，其实 .block 就代表一个视图中的一个块，而 .block_element 代表的是 .block 块下的元素 ，最后的 .block--modifier 代表的是 .block 块的修饰符。当然也可以按照下面这种写：

```css
.site-search {
} /* 块 */
.site-search__field {
} /* 元素 */
.site-search--full {
} /* 修饰符 */
```

唯一的区别是多了一个 - 符号，这个是为了让你自己的视图块可以用单个连字符来界定，\_代表元素，-- 代表修饰符。

#### 优点：

**BEM 的优点在于所产生的 CSS 类名都只使用一个类别选择器，可以避免传统做法中由于多个类别选择器嵌套带来的复杂的属性级联问题**。BEM 命名规则中，所有的 CSS 样式规则都只用一个类别选择器。因此所有样式规则的特异性（specificity）都是相同的，也就不存在复杂的优先级问题。这可以简化属性值的层叠规则。代码清单中的命名规则的好处在于每个 CSS 类名都很简单明了，而且类名的层次关系可以与 DOM 节点的树型结构相对应。

#### 缺点：

**CSS 类名会比较长而且复杂**，根据 BEM 命名规则产生的 CSS 类名都会很复杂，粗暴来说就是丑。不过熟悉了命名规则之后，可以很容易理解其含义。和 BEM 的实用性比起来，丑一点根本不值一提！！

### OOCSS

Object Oriented CSS，面向对象的 CSS，旨在编写高可复用、低耦合和高扩展的 CSS 代码。
OOCSS 是以面向对象的思想去定义样式，将抽象和实现分离，抽离公共代码。
OOCSS 认为 container（容器） 和 content（内容） 是需要隔离开的。也就是说，尽量不要去使用依赖于节点结构位置的样式定义。比如这样的就是不允许的：

```css
.container-list .title {
  /* ... */
}
```

OOCSS 建议：

```
.title{ /* ... */ }
```

举个例子大家就理解了，假如我们有一个容器如下：

```html
<div class="container"></div>

<style>
  .container {
    width: 50%;
    background: yellow;
    border: 1px solid #ccc;
    margin: 10px 15px 20px 25px;
  }
</style>
```

按照 OOCSS ，会为这个容器创建更多的类，并且每个样式对应一个类，这样是为了后面可以重复使用这些组件的样式，避免重复写相同的样式。如下：

```html
<div class="sizelof2 solidGray bgYellow mt10 ml25 mr15 mb20"></div>

<style>
  .sizelof2 {
    width: 50%;
  }
  .solidGray {
    border: 1px solid #ccc;
  }
  .bgYellow {
    background: yellow;
  }
  .mt10 {
    margin-top: 10px;
  }
  .mr15 {
    margin-right: 15px;
  }
  .mb20 {
    margin-bottom: 20px;
  }
  .ml25 {
    margin-left: 25px;
  }
</style>
```

如上，是不是很好理解？

#### 优点：

说到 OOCSS 的优点，因为**样式重复利用**，所以 CSS 代码量自然就减少了减少，可以降低我们工作量。**代码量少，那加载速度自然也快，代码简洁，便于维护**。能轻松构造新的页面布局，或制作新的页面风格。

#### 缺点：

OOCSS 的缺点也很明显，它**只适用于大型网站项目（因为重复组件，样式多）**，小型项目优势不明显（代码少）。而且需要巧妙运用，因为特定要求（强调重复使用类选择器，避免使用 ID 选择器）如果运用不得当，反而可能会造成后续维护困难，所以使用此方案最好写上说明文档。

### AMCSS

AMCSS 即 Attribute Modules for CSS 。
AM 是一种使用 HTML 属性及其值而非样式元素的类的技术。这样每个属性都可以有效地声明一个单独的命名空间来封装样式信息，从而使 HTML 和 CSS 更具可读性和可维护性。
**简单来说就是通过 CSS 属性选择器来模块化 CSS。**
举个例子，如下这段代码：

```html
<div class="button button-large button-blue">Button</div>

<style>
  .button {
    /* ... */
  }
  .button-large {
    /* ... */
  }
  .button-blue {
    /* ... */
  }
</style>
```

转变成 AMCSS，由于是基于属性控制，就变成了下面这样：

```html
<div button="large blue">Button</div>

<style>
  [button] {
    /* ... */
  }
  [button~="large"] {
    /* ... */
  }
  [button~="blue"] {
    /* ... */
  }
</style>
```

**为了避免属性冲突，我们一般会为其加一个统一的前缀，如 am-**，所以最终就变成下面这样子：

```html
<div am-button="large blue">Button</div>

<style>
  [am-button] {
    /* ... */
  }
  [am-button~="large"] {
    /* ... */
  }
  [am-button~="blue"] {
    /* ... */
  }
</style>
```

### ACSS

ACSS，全称是 Atomic CSS ，即原子化的 CSS。
用最简单的话来说就是，**把每一个单一的作用样式定义一个 Class，确保整个样式表没有一条重复的样式，这样复用性是最高的，代码也最少，但是每个元素就需要一堆的 Class。**
如下：

<div class="w-100 h-150 m-10 bgc-greed f-l"></div>

<style>
.w-100 { width: 100px; }
.h-150 { height: 150px; }
.m-10 { margin: 10px; }
.bgc-greed { background-color: green; }
.f-l { float: left; }
</style>

````
直接写原子化的 CSS 还是比较累的，不过好在有现成框架，像 **Tailwind CSS 就是一个基于 ACSS 的可定制的基础层 CSS 框架**，它提供了构建定制化所需的构建块，无需重新覆盖内建于框架内中的风格。设计想法基于工具类延伸，解决了工具理念的缺点。而整体框架设计，带来很好的拓展性。最重要的是主流编辑器都有补全插件，使用成本低。
使用 Tailwind CSS 后的代码就像下面这样，每个块元素上通过很多的 CSS 类来定义样式，基本不需要我们自己定义，即使有，也只需要写很少一部分额外的 CSS 代码，当然，也可以对 Tailwind 做一些扩展，配合 PostCSS 等后处理器，使用起来相当丝滑，看些例子：
响应式：
```html
<img class="w-16 md:w-32 lg:w-48" src="...">
````

上面代码中的 md 即代表 @media (min-width: 768px) { ... } ，lg 则是 @media (min-width: 1024px) { ... } 。
主题色：

```html
<div class="bg-white dark:bg-gray-800">
  <h1 class="text-gray-900 dark:text-white">Dark mode is here!</h1>
  <p class="text-gray-600 dark:text-gray-300">Lorem ipsum...</p>
</div>
```

如上，默认主题以及 dark 主题集于一身。
交互状态：

```html
<form>
  <input
    class="focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent ..."
  />
  <button
    class="hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 ..."
  >
    Sign up
  </button>
</form>
```

基础样式：
如下，还可以自定义一些基础样式：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  h1 {
    @apply text-2xl;
  }
  h2 {
    @apply text-xl;
  }
}
```

功能类：
功能类相当于一个拥有多个类样式的类集合，使用时要按需着重设计。

```css
.btn {
  @apply py-2 px-4 font-semibold rounded-lg shadow-md;
}
.btn-green {
  @apply text-white bg-green-500 hover:bg-green-700;
}
```

当然，还有很多用法，不一一细说了，具体使用官方文档说的很全面。

#### 优点：

**复用性高，代码量少**
ACSS 的优点是可以写基础、视觉功能小的、单用途的 CSS，相当于把每一个单一的作用定义一个 class，这点也是和 OOCSS 不一样的地方。它确保整个样式表没有一条重复的样式，这样复用性是最高的，代码也最少。

#### 缺点：

**html 代码量膨胀，需要记新规则**
使用原子化的 Tailwind CSS 框架后写 CSS 类有点像写行内样式。虽然 CSS 代码最小化了，但 HTML 膨胀了，虽然不用考虑命名，但是要记一堆新规则。所以市场对它的评价褒贬都有吧！具体大家自行体验过后自有评判，个人还是很看好的。

### CSS modules

是构建步骤中的一个进程，通过构建工具的帮助，将 class 的名字或选择器的名字作用域化（类似命名空间化）

我们之前使用原生 CSS 时，写两个名字相同的 class，样式肯定会冲突。而 CSS Modules 则会**将两个 class 名字通过 JS 手段编译最终生成两个不同的 class 名附加到元素上从而避免样式冲突，相当于为 CSS 搞了一个作用域**。

当然这个编译手段有很多，但目的相同，都是让两个**名字相同的 class 互不干扰**，拿我们常用的 Vue 举例子：

```html
<!--书写代码-->
<div class="logo-wrapper"></div>
<style>
  .logo-wrapper {
    display: flex;
  }
</style>
<!-- 编译后的代码 -->
<div data-v-ca49f7d6 class="logo-wrapper"></div>
<style>
  .logo-wrapper[data-v-ca49f7d6] {
    display: flex;
  }
</style>
```

编译后的 html 标签带有 data-v 开头的自定义属性，而 CSS 为其添加样式时，通过类名+属性选择器的方法来避免命名冲突，从而实现模块化。
而 Vue 的这种 CSS Modules 实现形式，恰好使用到了上面我们所说的 AMCSS。

### 优点：

其实也可以猜到，首先 CSS Modules 只关心组件本身的命名唯一就可以了，也就相对 **解决了 CSS 的全局命名冲突问题**。
其次也解决了 **CSS 嵌套过深**的问题，因为全局命名冲突的问题，我们不得已就要为 class 加上一些独立的命名空间，书写时也会多层嵌套。我们知道，**CSS 选择器的解析规则是层级越深，比较的次数也就越多，会影响整个页面的渲染。而独立命名空间以及嵌套也会增加不必要的字节开销，很大程度上还伴随语义混乱，可扩展性很不好，而我们只能进行约束，但是约束越多，扩展性越差**，CSS Modules 则不同，因为分割了组件，每个组件都将作为一个独立单元存在，很清爽。
最后，CSS Modules 也支持引入外部模块样式，可以共享样式。

### 缺点：

要说到 CSS Modules 的缺点，我个人觉得 CSS Modules 本身没有特别明显的缺点，硬说起来，它对于开发可能还是缺乏一些 CSS 代码组织方式（规范），比如 CSS 复用、单文件中 CSS 书写方式等等，这些其实可以配合前文我们说的 BEM、ACSS 等一些约束，就可以很好的控制。

### CSS in JS

CSS in JS，从名字就可以看出，把 CSS 写在 JS 文件里。它是一种思想，而不是某个具体库的实现，这样你就可以在 CSS 中使用一些属于 JS 的诸如模块声明，变量定义，函数调用和条件判断等语言特性来提供灵活的可扩展的样式定义。这种思想也因为 React 的广泛使用而普及。
实现 CSS in JS 的库有很多，较为常见的应该是下面这几个：

- Styled-components
- Radium
- glamorous
- JSS

不同的 CSS in JS 实现除了生成的 CSS 样式和编写语法有所区别外，它们实现的功能除了一些最基本的如 CSS 局部作用域之外还有一些独有功能，就比如下面这些：

全局选择器
基于状态的样式
客户端与服务器端渲染
缓存
内置自动前缀
媒体查询
选择器嵌套
内置动画支持
其他插件和软件包
等等

这里就不一一展开说了，自行了解即可。

作者：isboyjc
链接：https://juejin.cn/post/7012774158371127326
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
