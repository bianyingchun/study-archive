/*每个响应式属性都有dep，dep存放了依赖这个属性的watcher（watcher是观测数据变化的函数），如果数据发生变化，dep就会通知所有的观察者watcher去调用更新方法。因此， 观察者需要被目标对象收集，目的是通知依赖它的所有观察者。这里可能有的小伙伴会问：为什么watcher中也要存放dep呢？原因是因为当前正在执行的watcher需要知道此时是哪个dep通知了自己。
 */
/*
观察者模式
目标者对象和观察者对象有相互依赖的关系，观察者对某个对象的状态进行观察，如果对象的状态发生改变，就会通知所有依赖这个对象的观察者。
观察者模式相比发布订阅模式少了个事件中心，订阅者和发布者不是直接关联的。
*/
// 目标者（发布者）

class Dep {
  constructor() {
    //订阅者
    this.subs = [];
  }
  //添加订阅
  addSub(sub) {
    if (sub && sub.update) {
      this.subs.push(sub);
    }
  }
  // 发布通知
  notify() {
    this.subs.forEach((sub) => sub.update());
  }
}

// Watcher
class Watcher {
  update() {
    console.log("update");
  }
}

let dep = new Dep();
let watcher1 = new Watcher();
let watcher2 = new Watcher();
dep.addSub(watcher1);
dep.notify();

/*
1.创建一个'Observer'（观察者）实例，初始化传入需要做响应式的对象, ob = new Observer(value)
### 对象
1. 遍历对象的所有属性，并为每个属性设置getter和setter，以便将来的获取和设置，如果属性的值也是对象，则递归为属性值上的每个key设置getter和setter
获取数据时：在dep中添加相关的watcher
设置数据时：再由dep通知相关的watcher去更新
### 数组
2. 覆盖了原有的7个改变了原数组的方法，并克隆了一份，然后在克隆的这一份上更改自身的原型方法，然后拦截对这些方法的操作
添加新数据时：需要进行数据响应式的处理，再由dep通知watcher去更新
删除数据时：也要由dep通知watcher去更新


*/

/*
1. 首先创建一个和key一一对应的dep，这里需要注意一下一个key就对应着一个Dep
2. getter中拦截对obj[key]的获取，依赖关系的创建，建立dep和Dep.target之间的依赖关系（把dep添加到watcher中，也将watcher添加到dep中）
*/
