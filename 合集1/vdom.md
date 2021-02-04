1.概念：
  1.当我们页面中dom数比较多的时候，频繁的修改、增加dom的数量，对性能会有极大的浪费。虚拟dom就是为了解决这个问题而生，
  2.它建立在真实的dom之上。当数据驱动dom修改时，它会通过diff计算，来尽量少的创建新元素，而尽可能多地复用旧的dom，这样就可以减少频繁创建新dom带来的消耗。

vm._patch_(prevVnode, vnode)//元素渲染、vnode做diff并修改、元素销毁
  1.prevVnode指的是旧的vnode，我们第一次创建时，没有旧的vnode，所以!prevVnode返回true，此时的操作就是创建根据vnode直接绘制dom到页面中。

  2.当数据更新再次调用_update方法时，prevVnode是旧的vnode，此时传入新旧两个虚拟dom对象，__patch__会对它们做diff，并相应修改页面展现。

  3.销毁vue对象时，通过给__patch__第二个参数传入null，来从页面中删除相应dom。// 销毁对象同样是通过__patch__方法。
Vue.prototype.$destroy = function () {
    ...
    vm.__patch__(vm._vnode, null)
    ...
  }