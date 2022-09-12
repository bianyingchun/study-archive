代码块 9
// src/core/observer/watcher.js

// 首先回顾一下上面的代码解析咱们可以总结得出：

export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    // 当前Watcher添加到vue实例上
    vm._watchers.push(this)
    
    // 参数配置，options默认false
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    
    // 如果exporfn是函数的话，就会把这个函数赋值给getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      // 如果不是函数是字符串的话，会调用parsePath方法，
      // parsePath方法会把我们传入的path节分为数组，通过patch来访问到我们的对象。
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    // Vue的设计上，Watcher不止会监听Observer，还会直接把值计算出来放在this.value上。
    // 这里lazy没有直接计算，但是取值的时候肯定要计算的，所以我们直接看看get方法
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  
  get () {
    // 这里的pushTarget函数不是清除，而是把this作为一个参数传进去，其结果为：Dep.target = this
    // 将Dep的target添加到targetStack，同时Dep的target赋值为当前watcher对象
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // 调用updateComponent方法
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      if (this.deep) {
        traverse(value)
      }
      // update执行完成后，又将Dep.target从targetStack弹出, 其结果为：Dep.target = null
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  // 添加依赖
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      // watcher添加它和dep的关系
      this.newDepIds.add(id)
      this.newDeps.push(dep)

      if (!this.depIds.has(id)) {
        // 和上面的反过来，dep添加它和watcher的关系
        dep.addSub(this)
      }
    }
  }

  // 清理依赖项收集
  cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  // 更新
  update () {
    if (this.lazy) {
      // 如果是懒执行走这里，比如：computed
      this.dirty = true
    } else if (this.sync) {
      // 如果是同步执行 则执行run函数
      this.run()
    } else {
      // 将watcher放到watcher队列中 具体实现查看 【代码块 10】
      queueWatcher(this)
    }
  }

  // 更新视图
  run () {
    if (this.active) {
      // 调用get方法
      const value = this.get()
      if (
        value !== this.value ||
        isObject(value) ||
        this.deep
      ) {
        // 更新旧值为新值
        const oldValue = this.value
        this.value = value
        if (this.user) {
          const info = `callback for watcher "${this.expression}"`
          invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info)
        } else {
          // 渲染watcher
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  // 懒执行的watcher会调用该方法 比如：computed
  evaluate () {
    this.value = this.get()
    // computed的缓存原理
    // this.dirty设置为false 则页面渲染时只会执行一次computed的回调
    // 数据更新以后 会在update中重新设置为true
    this.dirty = false
  }

  // 依赖这个观察者收集的所有deps
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  // 从所有依赖项的订阅者列表中把自己删除
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}

代码块 10

export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  /**
   * 当我们调用某个watcher的callback之前会先将它在has中的标记置为null
   * 
   * 注意 这里是==而不是===
   * 如果has[id]不存在，则has[id]为undefined,undefined==null结果为true
   * 如果has[id]存在且为null，则为true
   * 如果has[id]存在且为true，则为false
   * 这个if表示，如果这个watcher尚未被 flush 则 return
   */
  if (has[id] == null) {
    // 再次把watcher置为true
    has[id] = true
    if (!flushing) {
      // 如果当前不是正在更新watcher数组的话，那watcher会被直接添加到队列末尾
      queue.push(watcher)
    } else {
      let i = queue.length - 1
      // 这个循环其实是在处理边界情况。 即：在watcher队列更新过程中，用户再次更新了队列中的某个watcher
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}