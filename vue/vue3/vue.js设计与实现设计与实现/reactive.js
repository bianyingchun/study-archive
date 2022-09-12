const bucket = new WeakMap();
const toProxy = new WeakMap(); //缓存代理过后的响应式数据 target ->observed，原始数据 -> 可响应数据
const toRaw = new WeakMap(); //缓存被代理过的原始数据 observed -> target，可响应数据 -> 原始数据
//存储effct
const targetMap = new WeakMap();
const handlers = {
  get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);
    // effect 收集
    track(target, key);
    return isObject(res) ? reactive(res) : res;
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver);
    const extraInfo = { oldValue: target[key], newValue: value };
    trigger(target, key, extraInfo);
    return result;
  },
  deleteProperty() {
    return Reflect.deleteProperty(target, key);
  },
};
// reactive
function reactive(target) {
  let observed = toProxy.get(target);
  if (observed) {
    //缓存代理过了
    return observed;
  }
  if (toRaw.has(target)) {
    //已经是响应式数据
    return target;
  }
  observed = new Proxy(target, handlers);
  toProxy.set(target, observed); //缓存observed
  toRaw.set(observed, target); //缓存target
  return observed;
}
// 2. 使用副作用函数栈，防止函数嵌套导致内存副作用函数执行会覆盖activeEffect的值，外层的响应式数据收集到的依赖还是内层函数。
let effectStack = [];
let activeEffect = null;

export function effect(fn, options = {}) {
  const effectFn = () => {
    //清理依赖
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1]; //新增
    return res;
  };
  effect.options = options;
  //用来存储与该副作用函数相关联的依赖集合
  effectFn.deps = [];
  //   立即执行
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}
// 依赖收集，跟踪订阅effect，追踪变化
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  if (!depsMap) bucket.set(target, (depsMap = new Map()));
  let deps = depsMap.get(key);
  if (!deps) depsMap.set(key, (deps = new Set()));
  deps.add(activeEffect);
  //  activeEffect.deps 为与当前副作用函数相关联的依赖集合
  activeEffect.deps.push(deps);
}

//  触发更新，触发副作用函数重新执行
function trigger(target, key) {
  //拿到所有target的订阅
  const depsMap = targetMap.get(target);
  if (!depsMap) return; //没有订阅
  const effects = depsMap.get(key);
  const effectsToRun = new Set();
  effects.forEach((effectFn) => {
    if (effectFn !== activeEffect) {
      effectsToRun.push(effectFn);
    }
    effectsToRun.forEach((effectFn) => {
      if (effectFn.options.scheduler) {
        // 调度器执行
        effectFn.options.scheduler(effectFn);
      } else {
        effectFn();
      }
    });
  });
}
/**
 * 2. 避免无限循环：如果trigger触发的副作用函数与当前正在执行的副作用函数相同，则不触发执行。
 * obj.foo = obj.foo + 1;
 */

// 1.分支切换
/**
 * effect(()=>{
 * document.body.innerText = obj.ok ? obj.text ? 'not'，
 * })
 * 当obj.ok 为true时，副作用函数被obj.text收集的依赖收集。当obj.ok改为false时，触发副作用函数执行。由于obj.text不会被读取，所以理想情况是副作用函数不应该被obj.text收集依赖。
 * 解决思路：每次副作用函数执行时，先把他从所有与之关联的依赖集合中删除，执行完毕后，会重新建立新的联系。
 */
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    //从依赖集合中移除
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

// computed
// 惰性求值，缓存
export function computed(getter) {
  let value;
  let dirty = true;
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true;
        //当计算属性依赖的响应式数据变化时，派发通知，通知运行访问该计算属性的 activeEffect
        trigger(obj, "value");
      }
    },
  });
  const obj = {
    get value() {
      if (dirty) {
        // 只有数据为脏的时候才会重新计算
        value = effectFn();
        dirty = false;
      }
      //依赖收集，收集运行访问该计算属性的 activeEffect
      track(obj, "value");
      return value;
    },
  };
  return obj;
}

// source可以为响应式对象或getter函数,如果是函数类型，说明直接传递了getter函数，这时直接使getter 函数;如果不是函数类型，那么调用 traverse函数递归地读取。
/**
 * source:()=>{} | object
dValue, newValue, onInvalidate :Function)// 在watch内部每次检测到变更后，在副作用函数执行之前，先调用onInvalidate函数。
 * options:{
 * immeditate:true, //立即执行回调
 * flush:'post'|'pre' // 1. post:异步执行，pre:同步执行
 * }
 * cb(ol
 */
export function watch(source, cb, options = {}) {
  let getter;
  if (typeof source === "function") getter = source;
  else getter = () => traverse(source);
  let oldValue, newValue;
  let cleanup;
  function onInvalidate(fn) {
    cleanup = fn;
  }

  const job = () => {
    newValue = effectFn();
    // 调用cb之前，先调用过期函数
    if (cleanup) cleanup();
    cb(oldValue, newValue, onInvalidate);
    oldValue = newValue;
  };
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler() {
      // 放到微任务队列，从而实现异步延迟执行
      if (options.flush === "post") {
        Promise.resolve().then(job);
      } else {
        job();
      }
    },
  });
  if (options.immediate) {
    //立即执行回调
    job();
  } else {
    oldValue = effectFn();
  }
}
// 进行递归的读取操作，代替硬编码的方式，这样就能读取一个对象上的任意属性，从而当任意属性发生变化时都能够触发回调函数执行。
function traverse(value, seen = new Set()) {
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return;
  }
  // 避免循环引用造成的死循环
  seen.add(value);
  for (const k in value) {
    traverse(value[k], seen);
  }
  return value;
}

// 原始值
function ref(val) {
  const wrapper = {
    value: val,
  };
  Object.defineProperty(wrapper, "__v_isRef", { value: true });
  return reactive(wrapper);
}
// 解决响应丢失， 本质上是做了一层响应代理
function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key];
    },
    // 允许设置值
    set value(val) {
      obj[key] = val;
    },
  };
  Object.defineProperty(wrapper, "_v_isRef", { value: true }); //由于“包裹对象”本质上与普通对象没有任何区别，因此为了区分ref与普通响应式对象，我们还为“包裹对象”定义了一个值为 true 的属性，即_v_isRef，用它作为 ref的标识
  return wrapper;
}

// const obj = reactive({foo:1, bar:2})
// const refFoo = toRef(obj, "foo");
// 自动脱ref,为了减轻用户的心智负担，我们自动对暴露到模板中的响应式数据进行脱ref处理。这样，用户在模板中使用响应式数据时，就无须关心一个值是不是ref了。
function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return value._v_isRef ? value.value : value;
    },
    set(target, key, newValue, receiver) {
      // 通过 target 读取真实值 const value =target[key]
      //如果值是Ref，则设置其对应的value属性值
      if (value._v_isRef) {
        value.value = newValue;
        return true;
      }
      return Reflect.set(target, key, newValue, receiver);
    },
  });
}
