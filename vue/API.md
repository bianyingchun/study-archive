## 非 Prop 的 Attribute
一个非 prop 的 attribute 是指传向一个组件，但是该组件并没有相应 props 或 emits 定义的 attribute。常见的示例包括 class、style 和 id attribute。可以通过 $attrs property 访问那些 attribute。
1. 当组件返回单个根节点时，非 prop 的 attribute 将自动添加到根节点的 attribute 中,同样的规则也适用于事件监听器
2. 具有多个根节点的组件不具有自动 attribute
3. 禁用Attribute 继承
   禁用 attribute 继承的常见场景是需要将 attribute 应用于根节点之外的其他元素。
```js
app.component('date-picker', {
  inheritAttrs: false,
  template: `
    <div class="date-picker">
      <input type="datetime-local" v-bind="$attrs" />
    </div>
  `
})
```