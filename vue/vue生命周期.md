### 什么是 Vue 的生命周期

Vue 中实例从创建到销毁的过程就是生命周期，即指从创建、初始化数据、编译模板、挂载 Dom→ 渲染、更新 → 渲染、卸载等一系列

### 有哪些生命周期

1. beforeCreate 组件实例被创建之初

   此时数据初始化并未完成，像 data、props 这些属性无法访问到，vm.$el 和 data 并未初始化

2. created 组件实例已经完全创建

   - 完成数据观测，属性与方法的运算，watch、event 事件回调的配置
   - 可调用 methods 中的方法，访问和修改 data 数据触发响应式渲染 dom，可通过 computed 和 watch 完成数据计算
   - 此时 vm.$el 并没有被创建

3. beforeMount 组件挂载到实例上去之前

   - 在此阶段可获取到 vm.el
   - 此阶段 vm.el 虽已完成 DOM 初始化，但并未挂载在 el 选项上。

4. mouted 组件挂载到实例上去之后
   此阶段 vm.el 完成挂载，vm.$el 生成的 DOM 替换了 el 选项所对应的 DOM。

5. beforeUpdate 组件数据发生变化，更新之前

- 此时 view 层还未更新,
- 若在 beforeUpdate 中再次修改数据，不会再次触发更新方法

6. updated 数据数据更新之后

- 完成 view 层的更新
- 若在 updated 中再次修改数据，会再次触发更新方法（beforeUpdate、updated）

7. beforeDestroy

   实例被销毁前调用，此时实例属性与方法仍可访问

8. destroyed

- 完全销毁一个实例。可清理它与其它实例的连接，解绑它的全部指令及事件监听器
- 并不能清除 DOM，仅仅销毁实例

### vue 父子组件的生命周期顺序

#### 加载渲染过程

父 beforeCreate->父 created->父 beforeMount->子 beforeCreate->子 created->子 beforeMount->子 mounted->父 mounted

#### 子组件更新过程

父 beforeUpdate->子 beforeUpdate->子 updated->父 updated

#### 父组件更新过程

父 beforeUpdate->父 updated

#### 销毁过程

父 beforeDestroy->子 beforeDestroy->子 destroyed->父 destroyed
