## createElement 格式化参数，创建 ReactElement 实例

```js
/**

 101. React的创建元素方法

 */

export function createElement(type, config, children) {
  // propName 变量用于储存后面需要用到的元素属性

  let propName;

  // props 变量用于储存元素属性的键值对集合

  const props = {};

  // key、ref、self、source 均为 React 元素的属性，此处不必深究

  let key = null;

  let ref = null;

  let self = null;

  let source = null;

  // config 对象中存储的是元素的属性

  if (config != null) {
    // 进来之后做的第一件事，是依次对 ref、key、self 和 source 属性赋值

    if (hasValidRef(config)) {
      ref = config.ref;
    }

    // 此处将 key 值字符串化

    if (hasValidKey(config)) {
      key = "" + config.key;
    }

    self = config.__self === undefined ? null : config.__self;

    source = config.__source === undefined ? null : config.__source;

    // 接着就是要把 config 里面的属性都一个一个挪到 props 这个之前声明好的对象里面

    for (propName in config) {
      if (
        // 筛选出可以提进 props 对象里的属性

        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // childrenLength 指的是当前元素的子元素的个数，减去的 2 是 type 和 config 两个参数占用的长度

  const childrenLength = arguments.length - 2;

  // 如果抛去type和config，就只剩下一个参数，一般意味着文本节点出现了

  if (childrenLength === 1) {
    // 直接把这个参数的值赋给props.children

    props.children = children;

    // 处理嵌套多个子元素的情况
  } else if (childrenLength > 1) {
    // 声明一个子元素数组

    const childArray = Array(childrenLength);

    // 把子元素推进数组里

    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }

    // 最后把这个数组赋值给props.children

    props.children = childArray;
  }

  // 处理 defaultProps

  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;

    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  // 最后返回一个调用ReactElement执行方法，并传入刚才处理过的参数

  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
  );
}
```

1. 二次处理 key, ref, self, source 属性值
2. 遍历 config, 筛选可提进 props 中的属性
3. 提取子节点，推入 childArray (props.children)
4. 格式化 defaultProps

createElement 就像是开发者和 ReactElement 调用之间的一个“转换器”、一个数据处理层。它可以从开发者处接受相对简单的参数，然后将这些**参数按照 ReactElement 的预期做一层格式化**，最终通过调用 ReactElement 来实现元素的创建

## ReactElement 创建虚拟 dom

```js
const ReactElement = function (type, key, ref, self, source, owner, props) {
  const element = {
    // REACT_ELEMENT_TYPE是一个常量，用来标识该对象是一个ReactElement
    $$typeof: REACT_ELEMENT_TYPE,

    // 内置属性赋值
    type: type,
    key: key,
    ref: ref,
    props: props,

    // 记录创造该元素的组件
    _owner: owner,
  };

  //
  if (__DEV__) {
    // 这里是一些针对 __DEV__ 环境下的处理，对于大家理解主要逻辑意义不大，此处我直接省略掉，以免混淆视听
  }

  return element;
};
```

从逻辑上我们可以看出，ReactElement 其实只做了一件事情，那就是“创建”，说得更精确一点，是“组装”：ReactElement 把传入的参数按照一定的规范，“组装”进了 element 对象里，并把它返回给了 React.createElement，最终 React.createElement 又把它交回到了开发者手中。

ReactElement 对象实例实际上就是虚拟 Dom, js 对象形式对 dom 的描述

既然是“虚拟 DOM”，那就意味着和渲染到页面上的真实 DOM 之间还有一些距离，这个“距离”，就是由大家喜闻乐见的 ReactDOM.render 方法来填补的。

### ReactDom.render 渲染虚拟 Dom
