/**
 * vue.js
 *
 * 属性
 * - $el：挂载的dom对象
 * - $data: 数据
 * - $options: 传入的属性
 *
 * 方法：
 * - _proxyData 将数据转换成getter/setter形式
 *
 */

class Vue {
  constructor(options) {
    // 获取传入的对象 默认为空对象
    this.$options = options || {};
    // 获取 el (#app)
    this.$el =
      typeof options.el === "string"
        ? document.querySelector(options.el)
        : options.el;
    // 获取data 默认为空对象
    this.$data = options.data || {};
    // 调用_proxyData处理data中的属性
    this._proxyData(this.$data);
    // 使用Obsever把data中的数据转为响应式 并监测数据的变化，渲染视图
    new Observer(this.$data);
    // 编译模板 渲染视图
    new Compiler(this);
  }
  init(vm) {
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, "beforeCreate");
    initInjections(vm);
    initState(vm); // 对props,methods,data,computed,watch进行初始化，包括响应式的处理
    initProvide(vm);
    callHook(vm, "created");
    if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
  }

}

//数据响应式的入口
export function initState (vm: Component) {
  vm._watchers = []
  // 从Vue实例上拿到配置项，并对配置项做以下处理：
  const opts = vm.$options
  
  // 1、处理props对象，并把props对象的属性设置为响应式，且代理到vm实例上，使我们可以用this.props[key]的方式去获取
  if (opts.props) initProps(vm, opts.props)
  
  // 2、处理methods对象，首先和props对象做重复处理，且优先级props > methods
  // 然后把methods对象的属性赋值到vm实例上，使我们可以用this.methods[key]的方式去获取
  if (opts.methods) initMethods(vm, opts.methods)
   
  // 3、处理data对象，首先和props对象、methods对象做重复处理，且优先级props > methods > data

  // 然后给data对象的属性设置为响应式，且把data对象的属性代理到vm实例上，使我们可以用this.data[key]的方式去获取
  if (opts.data) {
    initData(vm)
  } else {
    //看下文
    observe(vm._data = {}, true /* asRootData */)
  }
  
  // 4、首先为每个计算属性（computed）创建一个内部观察者（watcher），因为computed都是通过watcher来实现的
  // 然后和props对象、methods对象、data对象做重复处理，且优先级props > methods > data > computed
  // 最后把computed对象的属性代理到vm实例上，使我们可以用this.computed[key]的方式去获取
  if (opts.computed) initComputed(vm, opts.computed)
  
  // 5、和computed对象一样，watch对象的属性也都需要创建watcher实例，也需要对watch对象的属性进行属性处理。
  // 需要注意的是computed对象是懒执行，而watch对象是可以配置的，如果设置了immediate为true，则立即执行
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

// Vue处理响应式的入口
export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 如果是非对象和虚拟dom 则不做响应式的处理 直接返回 
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  
  // 'Observer'是一个真正的观察者，具体做了什么咱们【代码块 5】再说
  let ob: Observer | void
  
  // 首先'__ob__'的值其实就是一个'Observer'实例
  // 所以下面的判断其实就是：如果已经做过了响应式处理（已经被观察过了），则直接返回'ob'，也就是'Observer'实例
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  // 如果是初始化的时候，则没有'Observer'的实例，因此需要创建一个'Observer'实例
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 创建一个'Observer'（观察者）实例，初始化传入需要做响应式的对象
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}


export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    // 实例化一个dep
    // 正常来说，遍历一个对象的属性时，都是一个属性创建一个dep，为什么此处要给当前对象额外创建一个dep?
    // 其目的在于如果使用Vue.set/delete添加或删除属性，这个dep负责通知更新。
    this.dep = new Dep()
    this.vmCount = 0
    // 为value对象设置 __ob__
    def(value, '__ob__', this)
    
    // 学习源码之前我相信大部分的小伙伴已经知道了 Vue2的响应式是根据 Object.defineProperty() 来实现的，不能监听数组的改变。所以下面做了一个数组和对象的判断
    if (Array.isArray(value)) {
      // 数组的响应式处理
      // 如果是现代的浏览器
      if (hasProto) {
        // protoAugment方法其实就是做一个原型的覆盖，那怎么去覆盖一个对象的实例的原型呢？通过覆盖'__proto__'就能实现，只会影响当前数组的实例
        // arrayMethods 又是什么？数组具体是怎么做响应式处理的呢？咱们看【代码块 6】
        protoAugment(value, arrayMethods)
      } else {
        // 如果的老的IE浏览器，没有原型，那该怎么办？
        // copyAugment方法 主要数就是做：毫不讲道理的直接给数组上覆盖几个方法，则就会把需要覆盖的方法全部替换掉，就硬换掉。【老IE说：年轻人不讲武德！！】
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else { 
      // 对象的响应式处理，见下面的walk方法
      this.walk(value)
    }
  }

  // 对象的响应式处理方法
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      // 遍历对象中的key，并对key做响应式处理
      // 具体 defineReactive 方法怎么做对象的响应式，见【代码块 7】
      defineReactive(obj, keys[i])
    }
  }

  // 数组的处理方法
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      // 遍历数组，为数组的每一项设置观察，处理数组元素为对象的情况
      observe(items[i])
    }
  }
}


// 代码块 6

import { def } from '../util/index'
// 获取数组的原型
const arrayProto = Array.prototype
// 克隆一份，为什么要克隆一份呢？因为如果直接更改数组的原型，那么将来所有的数组都会被我改了。
export const arrayMethods = Object.create(arrayProto)
// 需要覆盖的7个方法，为什么只有7个方法呢？因为只有这7个方法改变了原数组
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

// 如何覆盖这7个方法呢？
// 首先开始循环它们
methodsToPatch.forEach(function (method) {
  // 每次从原型中拿出原始的方法
  const original = arrayProto[method]
  // 将当前的对象重新定义它的属性，如何重新定义呢？
  def(arrayMethods, method, function mutator (...args) {
    // 首先 先执行原始行为，以前咋滴现在就咋滴
    const result = original.apply(this, args)
    // 然后 再做变更通知，如何变更的呢？
    // 1、获取ob实例
    const ob = this.__ob__
    // 2、如果是新增元素的操作：比如puah、unshift或者增加元素的splice操作
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 3、新加入的元素依然需要做响应式处理
    if (inserted) ob.observeArray(inserted)
    // 4、让内部的dep去通知更新
    ob.dep.notify()
    return result
  })
})


// 代码块 7
// 对象的响应式处理：defineReactive

export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  // 首先创建一个和key一一对应的dep，这里需要注意一下 一个key就对应着一个Dep
  const dep = new Dep()

  // 然后是一些getter/setters的设定，正常也很少设置，所以不用关心这个
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  
  // 递归遍历
  // 如果已经做了响应式就返回出来 '__ob__', 如果是一个新对象就创建一个实例返回出来
  let childOb = !shallow && observe(val)
  //拦截对obj[key]的获取和设置
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    // 拦截对obj[key]的获取操作
    get: function reactiveGetter () {
      // 拿到obj[key]的值
      const value = getter ? getter.call(obj) : val
      // 依赖收集
      // 如果存在，则说明此次调用触发者是一个Watcher实例
      if (Dep.target) {
        // 依赖关系的创建，建立dep和Dep.target之间的依赖关系（把dep添加到watcher中，也将watcher添加到dep中）
        dep.depend()
        if (childOb) {
          // 也是依赖关系的创建，只是建立是ob内部的dep和Dep.target之间的依赖关系，也就是嵌套对象的依赖收集
          childOb.dep.depend()
          // 如果是数组，数组内部的所有项都需要做以上相同的依赖收集处理
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    
    // 拦截对obj[key]的设置操作
    set: function reactiveSetter (newVal) {
    
      // 获取老的值
      const value = getter ? getter.call(obj) : val
      
      // 如果新值和老值相等则不做处理 直接返回
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      
      // 如果setter不存在，说明只能获取不能设置，也直接返回
      if (getter && !setter) return
      
      // 设置为新的值
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      
      // 对新的值也做响应式处理
      childOb = !shallow && observe(newVal)
      
      // 通知更新
      dep.notify()
    }
  })
}


