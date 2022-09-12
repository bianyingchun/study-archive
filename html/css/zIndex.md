### z-index 基础内容（入门级掌握）

1. z-index 含义：
   z-index 属性指定了元素及其子元素的【z 顺序】，而【z 顺序】可以决定当元素发生覆盖的时候，哪个元素在上面。通常一个较大 z-index 值的元素会覆盖较低的那一个

2. z-index 支持的属性值：auto|inherit|number
3. z-index 的特性：
   1. 支持负值
   2. 支持 css 动画
   3. 如果不考虑 CSS3，只有标记了定位元素 position 的 z-index 才有作用，但在 CSS3 中有例外

### 多个定位 u 元素

1. 如果定位元素 z-index 没有发生嵌套：

   1. ① 后来居上的准则；

   2. ② 哪个大，哪个上；

2. 如果定位元素 z-index 发生嵌套：

   1. ① 祖先优先原则；
   2. 当有外层包裹发生嵌套的时候，两个元素的层级比较依赖于祖先的 z-index 值大小

② 特殊情况
特殊情况（当 z-index 的值为 auto 时，当前层叠上下文的生成盒子层叠水平为 0，盒子（除非是根元素）不会创建一个新的层叠上下文，因此内层的 z-index:2;起了作用

```html
<div style="position:relative;z-index:auto">
  <img style="position:absolute;z-index:2;" />
</div>
<div style="position:relative;z-index:1">
  <img style="position:absolute;z-index:1;" />
</div>
```

## 理解 CSS 中的层叠上下文和层叠水平（进阶内容掌握）

#### 概念：

> 层叠上下文（stacking context）是 HTML 元素中的一个三维概念，标识元素在 Z 轴上有了“可以高人一等”。

1. 页面根元素天生具有层叠上下文，称之为“根层叠上下文”。
2. z-index 值为数值的定位元素也具有层叠上下文。
3. 其他属性
   > 层叠上下文中的每个元素都有一个层叠水平（stacjing level），决定了同一个层叠上下文中元素在 z 轴上的显示顺序。**遵循“后来居上”和“谁上谁大”的原则**。**层叠水平必须放在层叠上下文中来看**，层叠水平和 z-index 并不是一个概念。

##### 层叠上下文的特性：

① 层叠上下文可以嵌套，组合成一个分层次的层叠上下文。

② 每个层叠上下文和兄弟元素独立：当进行层叠变化或渲染的时候，只需要考虑后代元素。

③ 每个层叠上下文是自成体系的：当元素的内容被层叠后，整个元素被认为是在父层的层叠顺序中。

#### 层叠水平：

1. 著名的 7 阶层叠水平（规范层叠，更符合页面加载的功能和视觉呈现）
   1. background/border
   2. 负 z-index
   3. block 块状盒子
   4. float 浮动盒子
   5. inline/inline-block 水平盒子
   6. z-index:auto/z-index 看成为 0(不依赖z-index的层级上下文)
   7. z-index:正数

#### Z-index 与层叠上下文：

① 特性：

1. 定位元素默认 z-index:auto 可以看成是 z-index:0;
2. z-index 不为 auto 的定位元素会创建层叠上下文；
3. z-index 层叠顺序的比较止步于父级层叠上下文;

② 为何定位元素会覆盖普通元素
如果 z-index 不做设置，当有定位属性的时候，默认为 z-index:auto; 也就是 z-index 为 0。而根据层叠水平规则，z-index:auto 是在 inline（图片）之上的，因此会反转覆盖。

③z-index 与创建层叠上下文
普通元素，并不具备自身的层叠上下文，而普通元素的层叠规则在 z-index:-1 之上。

> 从层叠顺序上讲，z-index:auto;可以看成 z-index:0;。但是从层叠上下文来讲，两者却有着本质差异！auto 不会创建层叠上下文，但是 0 会创建。
