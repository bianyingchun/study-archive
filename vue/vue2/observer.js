
/**
 * observer.js
 *
 * 功能
 * - 把$data中的属性，转换成响应式数据
 * - 如果$data中的某个属性也是对象，把该属性转换成响应式数据
 * - 数据变化的时候，发送通知
 *
 * 方法：
 * - walk(data)    - 遍历data属性，调用defineReactive将数据转换成getter/setter
 * - defineReactive(data, key, value)    - 将数据转换成getter/setter
 *
 */
 class Observer {
    constructor(data) {
      this.walk(data)
    }
    // 遍历data转为响应式
    walk(data) {
       // 如果data为空或者或者data不是对象
       if (!data || typeof data !== "object") {
        return;
      }
      // 遍历data转为响应式
      Object.keys(data).forEach((key) => {
        this.defineReactive(data, key, data[key])
      })
    }
    // 将data中的属性转为getter/setter
    defineReactive(data, key, value) {
      // 检测属性值是否是对象，是对象的话，继续将对象转换为响应式的
      this.walk(value)
      // 保存一下 this
      const that = this;
      // 创建Dep对象 给每个data添加一个观察者
      let dep = new Dep();
  
      Object.defineProperty(data, key, {
        // 可枚举（可遍历）
        enumerable: true,
        // 可配置（可以使用delete删除，可以通过defineProperty重新定义）
        configurable: true,
        // 获取值的时候执行
        get() {
          // 在这里添加观察者对象 Dep.target 表示观察者
          Dep.target && dep.addSub(Dep.target)
          return value
        },
         // 设置值的时候执行
        set(newValue) {
          // 若新值等于旧值则返回
          if (newValue == value) {
            return;
          }
          // 如新值不等于旧值则赋值 此处形成了闭包，延长了value的作用域
          value = newValue;
          // 赋值以后检查属性是否是对象，是对象则将属性转换为响应式的
          that.walk(newValue);
          // 数据变化后发送通知，触发watcher的pudate方法
          dep.notify();
        },
      })
    }
  }
  