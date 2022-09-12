import { effect } from "./reactive";
const Text = Symbol();
const Comment = Symbol();
const Fragment = Symbol();

function createRenderer(options) {
  const { createElement, setElementText, insert, createText, setText } =
    options;
  // 打补丁/执行挂载
  function patch(n1, n2, container) {
    if (n1 && n1.type !== n2.type) {
      unMount(n1);
      n1 = null;
    }
    const { type } = n2;
    if (typeof type === "string") {
      //普通标签元素
      if (!n1) {
        //挂载
        mountElement(n2, container);
      } else {
        // 打补丁
        patchElement(n1, n2);
      }
    } else if (type === Text) {
      if (!n1) {
        const el = createText(n2.children);
        insert(el, container);
      } else {
        const el = (n2.el = n1.el);
        if (n1.children !== n2.children) {
          setText(el, n2.children);
        }
      }
    } else if (type === Comment) {
      //与Text处理类似
    } else if (type === Fragment) {
      if (!n1) {
        n2.children.forEach((c) => patch(null, c, container));
      } else {
        patchChildren(n1, n2, container);
      }
    } else if (typeof type === "object") {
      // 组件
      if (!n1) {
        mountComponent(n2, container);
      } else {
        patchComponent(n1, n2, container);
      }
    }
  }
  // 优先设置dom properties; 不具备则使用setAttribute设置
  function patchProps(el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
      // 伪造事件处理函数
      const invokers = el._vei || (el._vei = {});
      let invoker = invokers[key];
      const name = key.slice(2).toLowerCase();
      if (nextValue) {
        invoker = el._vei[key] = (e) => {
          // 事件发生的时间早于事件处理函数绑定的时间，则不执行事件处理函数
          if (e.timeStamp < invoker.attached) return;
          if (Array.isArray(invoker.value)) {
            invoker.value.forEach((fn) => fn(e));
          } else {
            invoker.value(e);
          }
        };
        // 存储事件处理函数被绑定的时间
        invoker.attached = performance.now();
        invoker.value = nextValue;
        el.addEventListener(name, invoker);
      } else if (invoker) {
        el.removeEventListener(name, invoker);
      }
    } else if (key === "class") {
      el.className = nextValue || "";
    } else if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key];
      if (type === "boolean" && nextValue === "") el[key] = true;
      else el[key] = nextValue;
    } else {
      el.setAttribute(key, nextValue);
    }
  }

  function shouldSetAsProps(el, key, value) {
    if (key === "form" && el.tagName === "INPUT") return false;
    return key in el;
  }

  //全局变量，存储当前正在被初始化的组件实例, 以此与生命周期钩子关联
  let currentInstance = null;
  function setCurrentInstance(instance) {
    currentInstance = instance;
  }
  
  function onMounted() {
    if (currentInstance) {
      currentInstance.mounted.push(fn);
    }
  }
  //挂载组件
  function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type;
    const slots = vnode.children || {};
    const {
      render,
      data,
      setup,
      props: propsOptions, // Component中定义的props选项， vnode.props 是传递给组件的props数据
      beforeCreate,
      created,
      beforeMount,
      mounted,
      beforeUpdate,
      updated,
    } = componentOptions;
    //调用钩子函数
    beforeCreate && beforeCreated(); //实际上钩子函数是一个数组
    // 包装data为响应式数据
    const state = reactive(data());
    // 解析props和attrs数据
    const [props, attrs] = resolveProps(propsOptions, vnode.props);
    // 定义组件实例，保存组件相关的状态信息
    const instance = {
      //状态数据
      state,
      //包装父组件传递的props为shallowReactive
      props: shallowReactive(props),
      // 是否已被挂载
      isMounted: false,
      // 组件渲染的内容，子树
      subTree: null,
      //插槽
      slots,
    };
    //发射自定义事件，本质是根据事件名称去props中寻找对应的事件处理函数
    function emit(event, ...payload) {
      const eventName = `on${(event[0].toUpperCase, event.slice(1))}`; // change => onChange
      const handler = instance.props[eventName];
      if (handler) {
        handler(...payload);
      } else {
        console.error("事件不存在");
      }
    }
    // 处理setup函数
    const setupContext = { attrs, emit /*slots */ };
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), setupContext);
    setCurrentInstance(null);
    let setupState = null;
    if (typeof setupResult === "function") {
      if (render) console.error("setup函数返回渲染结果, render选项将被忽略");
      render = setupResult;
    } else {
      setupState = setupResult;
    }
    // 将组件实例设置到vnode上，用于后续更新
    vnode.component = instance;
    const renderContext = createRenderContext(instance, setupState);
    //调用钩子函数
    created && created().call(renderContext);

    // 渲染任务包装成effect，当state更改时自动触发组件更新
    effect(
      () => {
        //执行渲染函数，获取组件要渲染的内容，即render()返回的虚拟dom
        // 将this指向state
        const subTree = render.call(renderContext, state);
        //检查组件是否已被挂载
        if (!instance.isMounted) {
          //调用钩子函数
          beforeMount && beforeMount.call(renderContext);
          patch(null, subTree, container, anchor);
          instance.isMounted = true;
          mounted && mounted().call(renderContext);
          //
          instance.mounted &&
            instance.mounted.forEach((hook) => hook().call(renderContext));
        } else {
          // 使用新的子树和上次渲染的子树进行打补丁操作
          beforeUpdate && beforeUpdate();
          patch(instance.subTree, subTree, container, anchor);
          updated && updated().call(renderContext);
        }
        // 更新组件实例的子树
        instance.subTree = subTree;
      },
      {
        scheduler: queueJob,
      }
    );
  }

  // 利用微任务队列的异步执行机制，实现对副作用函数的缓冲，对任务进行去重，避免多次执行副作用函数带来的性能开销
  const queue = new Set();
  let isFlushing = false;
  const p = Promise.resolve();
  function queueJob(job) {
    queue.add(job);
    if (!isFlushing) {
      isFlushing = true;
      p.then(() => {
        try {
          queue.forEach((job) => job());
        } finally {
          isFlushing = false;
          queue.clear();
        }
      });
    }
  }
  //创建渲染上下文对象，本质上是组件实例的代理
  /**
   *
   * 1. state
   * 2. props
   */
  function createRenderContext(instance, setupState) {
    const renderContext = new Proxy(instance, {
      get(t, k, r) {
        //取得组件自身状态与 props 数据 const renderContext=new Proxy(instance,{ 首先说
        const { state, props, slots } = t; // 先尝试读取自身状态数据
        if (k === "$slot") return slots;
        if (state && k in state) {
          return state[k];
        } else if (k in props) {
          // 如果组件自身没有该数据，则尝试从props中读取
          return props[k];
        } else if (k in setupState) {
          //从setup返回值读取
          return setupState[k];
        } else {
          console.error("不存在");
        }
      },
      set(t, k, v, r) {
        const { state, props } = t;
        if (state && k in state) {
          state[k] = v;
        } else if (k in props) {
          props[k] = v;
        } else {
          console.error("不存在");
        }
      },
    });
    return renderContext;
  }
  function resolveProps(options, propsData) {
    const props = {};
    const attrs = {};
    // 实际在vue中需要处理默认值和类型校验
    for (const key in propsData) {
      // 以字符串on开头的props,无论是否被声明，都添加到props中
      if (key in options || key.startsWith("on")) {
        props[key] = propsData[key];
      } else {
        attrs[key] = propsData[key];
      }
    }
    return [props, attrs];
  }
  function hasPropsChanged(prevProps, nextProps) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
      return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys;
      if (nextProps[key] !== prevProps[key]) return true;
    }
    return false;
  }
  // 检测子组件是否需要更新，如需要，则更新子组件的props,attrs
  function patchComponent(n1, n2, container) {
    // 获取组件实例,并将组件实例添加到新组件的vnode对象上，防止下次更新时无法取得组件实例
    const instance = (n2.component = n1.component);
    const { props } = instance;
    // 检测props是否有变化
    if (hasPropsChanged(n1.props, n2.props)) {
      // 重新获取props
      const [nextProps] = resolveProps(n2.type.props, n2.props);
      // 更新props
      // props是shallowReactive,因此设置instance.props的属性就能触发组件重新渲染。
      for (const k in nextProps) {
        props[k] = nextProps[k];
      }
      for (const k in props) {
        if (!(k in nextProps)) {
          delete props[k];
        }
      }
    }
  }

  function mountElement(vnode, container) {
    const el = createElement(vnode.type);
    if (typeof vnode.children === "string") {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => {
        patch(null, child, el);
      });
    }
    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key]);
      }
    }
    insert(el, container);
  }

  function patchElement(n1, n2) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props;
    const newProps = n2.props;
    //更新props
    for (let key in newProps) {
      patchProps(el, key, oldProps[key], newProps[key]);
    }
    for (let key in oldProps) {
      if (!key in newProps) patchProps(el, key, oldProps[key], null);
    }
    // 更新children
    patchChildren(n1, n2, el);
  }
  /*

1.  旧子节点是纯文本 ：

    1. 新子节点也是纯文本：简单地文本替换即可；
    2. 新子节点是空：删除旧子节点即可；
    3. 新子节点是 vnode 数组：那么先把旧子节点的文本清空，再去旧子节点的父容器下添加多个新子节点。

2.  旧节点为空

    1. 新子节点是纯文本，那么在旧子节点的父容器下添加新文本节点即可；
    2. 新子节点也是空，什么都不需要做；
    3. 新子节点是 vnode 数组，那么直接去旧子节点的父容器下添加多个新子节点即可。

3. 旧子节点是 vnode 数组：

    1. 新子节点是纯文本，那么先删除旧子节点，再去旧子节点的父容器下添加新文本节点；

    2. 新子节点是空，那么删除旧子节点即可；

    3. 新子节点也是 vnode 数组，那么就需要做完整的 diff 新旧子节点了，这是最复杂的情况，内部运用了核心 diff 算法。
    */
  const patchChildren = (
    n1,
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    optimized = false
  ) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { shapeFlag } = n2;
    // 子节点有 3 种可能情况：文本、数组、空
    if (shapeFlag & 8 /* TEXT_CHILDREN */) {
      if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
        // 数组 -> 文本，则删除之前的子节点
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        // 文本对比不同，则替换为新文本
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
        // 之前的子节点是数组
        if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
          // 新的子节点仍然是数组，则做完整地 diff
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            optimized
          );
        } else {
          // 数组 -> 空，则仅仅删除之前的子节点
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        // 之前的子节点是文本节点或者为空
        // 新的子节点是数组或者为空
        if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
          // 如果之前子节点是文本，则把它清空

          hostSetElementText(container, "");
        }

        if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
          // 如果新的子节点是数组，则挂载新子节点

          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            optimized
          );
        }
      }
    }
  };
  //卸载
  /*
  1. 可能由组件渲染，需执行相关生命周期钩子
  2. 自定义指令的指令钩子函数
  3. innerHTML 不会移除事件绑定
  */
  function unMount(vnode) {
    const parent = vnode.el.parentNode;
    if (parent) {
      parent.removeChild(vnode.el);
    }
  }
  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else {
      unMount(container._vnode);
    }
    container._vnode = vnode;
  }
  return {
    render,
  };
}

const renderer = createRenderer({
  createElement(tag) {
    return document.createElement(tag);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(el, text) {
    el.nodeValue = text;
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
});
