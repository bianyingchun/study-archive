[immer.js:也许更适合你的 immutable js 库](https://juejin.cn/post/6844904111402385422)
[精读《Immer.js》源码](https://zhuanlan.zhihu.com/p/34691516)

### 使用

```js
this.setState((state) => ({
  ...state,
  isShow: true,
}));
this.setState((state) => {
  const cloneProducts = state.products.slice();
  cloneProducts.push({ text: "shoes" });
  return {
    ...state,
    cloneProducts,
  };
});
//  immerJs写法
this.setState(produce((state) => (state.isShow = true)));

this.setState(produce((state) => state.products.push({ text: "shoes" })));
```

### 原理解析 【Proxy】

Proxy 对象接受两个参数，第一个参数是需要操作的对象，第二个参数是设置对应拦截的属性

```js
{
  modified, // 是否被修改过
  finalized, // 是否已经完成（所有 setter 执行完，并且已经生成了 copy）
  parent, // 父级对象
  base, // 原始对象（也就是 obj）
  copy, // base（也就是 obj）的浅拷贝，使用 Object.assign(Object.create(null), obj) 实现
  proxies, // 存储每个 propertyKey 的代理对象，采用懒初始化策略
}
```

immer 维护一份 state 在内部，劫持所有操作，内部来判断是否有变化从而最终决定如何返回。下面这个例子就是一个构造函数，如果将它的实例传入 Proxy 对象作为第一个参数，就能够后面的处理对象中使用其中的方法：

```js
class Store {
  constructor(state) {
    this.modified = false; //是否被修改过
    this.source = state; // 原始对象
    this.copy = null; // source的浅拷贝，
  }
  get(key) {
    if (!this.modified) return this.source[key];
    return this.copy[key];
  }
  set(key, value) {
    if (!this.modified) this.modifing();
    return (this.copy[key] = value);
  }
  modifing() {
    // 如果触发了 setter 并且之前没有改动过的话，就会手动将 modified 这个 flag 设置为 true，并且手动通过原生的 API 实现一层 immutable。
    if (this.modified) return;
    this.modified = true;
    // 这里使用原生的 API 实现一层 immutable，
    // 数组使用 slice 则会创建一个新数组。对象则使用解构
    this.copy = Array.isArray(this.source)
      ? this.source.slice()
      : { ...this.source };
  }
}
```

proxy handler

```js
const PROXY_FLAG = "@@SYMBOL_PROXY_FLAG";
const handler = {
  get(target, key) {
    // 如果遇到了这个 flag 我们直接返回我们操作的 target
    if (key === PROXY_FLAG) return target;
    return target.get(key);
  },
  set(target, key, value) {
    return target.set(key, value);
  },
};
```

这里在 getter 里面加一个 flag 的目的就在于将来从 proxy 对象中获取 store 实例更加方便。
最终我们能够完成这个 produce 函数，创建 store 实例后创建 proxy 实例。然后将创建的 proxy 实例传入第二个函数中去。这样无论在内部做怎样有副作用的事情，最终都会在 store 实例内部将它解决。最终得到了修改之后的 proxy 对象，而 proxy 对象内部已经维护了两份 state ，通过判断 modified 的值来确定究竟返回哪一份。

```js
function produce(state, producer) {
  const store = new Store(state);
  const proxy = new Proxy(store, handler);

  // 执行我们传入的 producer 函数，我们实际操作的都是 proxy 实例，所有有副作用的操作都会在 proxy 内部进行判断，是否最终要对 store 进行改动。
  producer(proxy);

  // 处理完成之后，通过 flag 拿到 store 实例
  const newState = proxy[PROXY_FLAG];
  if (newState.modified) return newState.copy;
  return newState.source;
}
```

这样，一个分割成 Store 构造函数，handler 处理对象和 produce 处理 state 这三个模块的最简版就完成了，将它们组合起来就是一个最最最 tiny 版的 immer ，里面去除了很多不必要的校验和冗余的变量。但真正的 immer 内部也有其他的功能，例如上面提到的深层嵌套对象的结构化共享等等。

当然，Proxy 作为一个新的 API，并不是所有环境都支持，Proxy 也无法 polyfill，所以 immer 在不支持 Proxy 的环境中，使用 Object.defineProperty 来进行一个兼容。
