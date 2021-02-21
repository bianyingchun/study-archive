// 1.重复多次写ob = reactive(person)就会一直执行new Proxy，这不是我们想要的。理想情况应该是，代理过的对象缓存下来，下次访问直接返回缓存对象就可以了；
// 2、同理多次这么写ob = reactive(person); ob = reactive(ob) 那也要缓存下来。
const toProxy = new WeakMap();//缓存代理过后的响应式数据 target ->observed，原始数据 -> 可响应数据
const toRaw = new WeakMap();//缓存被代理过的原始数据 observed -> target，可响应数据 -> 原始数据
//存储effct
const targetMap = new WeakMap();
function isObject(val) {//对象类型判断
    return val !== null && typeof val === 'object'
}

const handlers = {
    get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver)
        // effect 收集
        track(target, key)
        return isObject(res) ? reactive(res) : res
    },
    set(target, key, value, receiver) {
        const result = Reflect.set(target, key, value, receiver)
        const extraInfo = { oldValue: target[key], newValue: value }
        trigger(target, key, extraInfo)
        return result
    },
    deleteProperty() {
        return Reflect.deleteProperty(target, key)
    }
}
// 触发更新
function trigger(target, key, extraInfo) {
    //拿到所有target的订阅
    const depsMap = targetMap.get(target)
    if (!depsMap) return;//没有订阅
    const effects = new Set(); //普通的订阅
    const computedRunners = new Set(); //computed 的 effect
    if (key) {
        let deps = depsMap.get(key);
        //拿到deps订阅的每个effect，然后放到对应的Set里面
        deps.forEach(effect => {
            if (effect.computed) {
                computedRunners.add(effect)
            } else {
                effects.add(effect)
            }
        })
    }
    const run = effect => {
        effect()
    }
    computedRunners.forEach(run)
    effects.forEach(run)
}

// 依赖收集
// 跟踪订阅effect
function track(target, key) {
    // 拿到上面push进来的effect
    const effect = activeEffectStack[activeEffectStack.length - 1];
    if (effect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            depsMap = new Map();
            // targetMap如果不存在target 的 Map 就设置一个
            targetMap.set(target, depsMap)
        }
        let dep = depsMap.get(key);
        if (!dep) {
            // 如果depsMap里面不存在key 的 Set 就设置一个
            dep = new Set()
            depsMap.set(key, dep)
        }
        if (!dep.has(effect)) {
            // 收集当前的effect
            dep.add(effect)
            effect.deps.push(dep)
        }
    }
}
// reactive
function reactive(target) {
    let observed = toProxy.get(target);
    if (observed) {//缓存代理过了
        return observed
    }
    if (toRaw.has(target)) {//已经是响应式数据
        return target
    }
    observed = new Proxy(target, handlers);
    toProxy.set(target, observed); //缓存observed
    toRaw.set(observed, target); //缓存target
    return observed;
}

//effect
function effect(fn, options = {}) {
    const effect = createReativeEffect(fn, options);
    if (!options.lazy) {//立即计算的
        effect()
    }
    return effect;
}
// 创建一个新的effect函数，并且给这个effect函数挂在一些属性，
// 为后面做computed准备，这个effect函数里面调用run函数, 最后在返回出新的effect。
function createReativeEffect(fn, options) {
    const effect = function (...args) {
        return run(effect, fn, args);
    }
    effect.lazy = options.lazy;
    effect.computed = options.computed;
    effect.deps = []
    return effect;
}
// 把reactive和effect串联起来
//声明一个数组，来存储当前的effect，订阅时需要
const activeEffectStack = []
// 把传进来的effect推送到一个activeEffectStack数组中，然后执行传进来的fn(...args)
function run(effect, fn, args) {
    if (activeEffectStack.indexOf(effect) === -1) {
        try {
            activeEffectStack.push(effect)
            return fn(...args)
        }
        finally {
            //清除已经收集过的effect,为下一个effect作准备
            activeEffectStack.pop()
        }
    }
}
//上面的代码，把传进来的effect推送到一个activeEffectStack数组中，然后执行传进来的fn(...args)，这里的fn就是
// fn = () => {
//     root.innerHTML = `<h1>${ob.name}---${ob.age}---${cAge.value}</h1>`
//   }
//   执行上面的fn访问到ob.name、ob.age、cAge.value(这是computed得来的)，这样子就会触发到proxy的getter,执行handler.get();
// track依赖收集，在handlers.set中trigger派发更新。

//computed函数
function computed(fn) {
    const getter = fn;
    const runner = effect(getter, {
        computed: true,
        lazy: true
    })
    return {
        effect: runner,
        get value() {
            value = runner()
            return value;
        }
    }
}
let person = {
    name: '张三',
    age: 10,
    hobby: {
        play: ['basketball', 'football']
    }
}

// let ob = reactive(person)
// ob = reactive(person)// 返回都是缓存的
// ob = reactive(ob) // 返回都是缓存的
// console.log(ob.age)
// ob.age = 20
// console.log(ob.age)

// 补充
//1.Reflect 
// Reflect对象是一个全局的普通的对象。Reflect的原型就是Object.
// Reflect对象的设计目的主要有：
// https://www.cnblogs.com/tugenhua0707/p/10291909.html
// 1）将Object对象的一些明显属于语言内部的方法(比如Object.defineProperty)，放到Reflect对象上，那么以后我们就可以从Reflect对象上可以拿到语言内部的方法。
// 2）在使用对象的 Object.defineProperty(obj, name, {})时，如果出现异常的话，会抛出一个错误，需要使用try catch去捕获，但是使用 Reflect.defineProperty(obj, name, desc) 则会返回false。
// 1、将Object对象的一些明显属于语言层面的方法放到Reflect对象上。
// 2、修改某些Object方法的返回结果，使其更加合理。
// 3、让对象操作都变成函数行为。
// 4、Reflect对象的方法和Proxy对象的方法一一对应，只要是Proxy对象的方法，都能在Reflect对象上找到对应的方法。这就让Proxy对象可以方便地调用对应的Reflect方法完成默认行为。

// 2.WeakMap

// 与集合类型（Set）一样，映射类型也有一个Weak版本的WeakMap。WeakMap和WeakSet很相似，只不过WeakMap的键会检查变量的引用，只要其中任意一个引用被释放，该键值对就会被删除。
// 以下三点是Map和WeakMap的主要区别：
// Map对象的键可以是任何类型，但WeakMap对象中的键只能是对象引用
// WeakMap不能包含无引用的对象，否则会被自动清除出集合（垃圾回收机制）。
// WeakSet对象是不可枚举的，无法获取大小。

//3.vue中的实现细节
// 1) 如何避免多次trigger
// 通过 判断 key 是否为 target 自身属性，以及设置val是否跟target[key]相等 可以确定 trigger 的类型，并且避免多余的 trigger。
// 2) 如何做到深度的侦测数据的 ？
// 当对多层级的对象操作时，proxy 中 set 并不能感知到，但是 get 会触发， 于此同时，利用 Reflect.get() 返回的“多层级对象中内层” ，再对“内层数据”做一次代理。


// vue2