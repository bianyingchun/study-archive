从 Vue 代码中, 我们拿出最有代表性的一个函数说明.

```js
const isString = (val: any): val is string => typeof val === 'string'
```

划重点
可以看见在返回值部分返回的不是类型而是一个表达式"val is string", 这段代码的意思是**当 isString 返回值为 true 的时候, 参数 val 就是 string 类型.**
直接返回 boolean 不行吗?
不行! 看下面的代码, 我们虽然知道在 if 判断后 aa 一定是 string,但是 ts 不知道, ts 会提示 aa 可能是 null 类型, 不能执行 substring 方法.

```js
const isString = (val: any): boolean => typeof val === "string";

let a: null | string = Math.random() < 0.5 ? null : "12";

if (isString(a)) {
  aa.subString(0, 1);
}
```

所以需要使用 is 特性. ts 可以根据 if 判断推断出当前的 aa 为 string 类型:

```js
const isString = (val: any): val is string => typeof val === "string";

let a: null | string = Math.random() < 0.5 ? null : "12";

if (isString(a)) {
  aa.subString(0, 1);
}
```

更多"is"在 vue3 中的实例

```js
// 是否是对象
export const isObject = (val: any): val is Record<any, any> =>
  val !== null && typeof val === 'object'

// 是否ref对象
export function isRef(v: any): v is Ref {
  return v ? v[refSymbol] === true : false
}

// 是否vnode
export function isVNode(value: any): value is VNode {
  return value ? value._isVNode === true : false
}

// 是否插槽节点
export const isSlotOutlet = (
  node: RootNode | TemplateChildNode
): node is SlotOutletNode =>
  node.type === NodeTypes.ELEMENT && node.tagType === ElementTypes.SLOT
```

通过总结我们发现, "is"主要都是应用在类型判断函数上, 让后续逻辑判断中可以正确的推断出参数的类型, 好了现在可以在回头看开头的解释**is 是一种类型推断表达式的关键字, 通过和函数返回值的比较, 从而"缩小"参数的类型范围.**, 现在是不是已经理解了呢.
