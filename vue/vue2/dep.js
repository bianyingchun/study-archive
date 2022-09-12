// 代码块 8
// src/core/observer/dep.js


// Dep在数据响应式中扮演的角色就是数据的依赖收集和变更通知
// 在获取数据的时候知道自己（Dep）依赖的watcher都有谁，同时在数据变更的时候通知自己（Dep）依赖的这些watcher去执行他们（watcher）的update 
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    //每个Dep都有唯一的ID
    this.id = uid++
    //subs用于存放依赖
    this.subs = []
  }
  
  // 在dep中添加watcher
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  
  // 删除dep中的watcher
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  
  // 反过来 在watcher中添加dep，详细的一会查看 【代码块 9】中的 addDep 方法
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  // 遍历dep的所有watcher 然后执行他们的update 
  notify () {
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}


Dep.target = null
const targetStack = []

// 开始收集的时候 设置：Dep.target = watcher
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}
// 结束收集的时候 设置：Dep.target = null
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
