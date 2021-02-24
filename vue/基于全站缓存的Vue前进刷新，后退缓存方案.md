最近，在项目中需要实现移动端Vue前进刷新，后退刷新方案，网上的方案大多是针对某个特定页面在路由钩子里，判断from, to 实现，由于我们的项目中有大量页面需要缓存，并不适用。且这种零散的缓存写法，很不利于路由管理，代码维护。于是，在总结了项目中缓存的几种场景后，结合Vuex以及路由钩子，我实现了路由缓存集中式管理的方案。

### 缓存策略

在我们的项目中，路由页面大致可以归类为以下三类缓存策略。

#### 1. backAlive 前进刷新，后退缓存(默认)

这种场景经常出现在一个列表页到详情页，用户希望从每次从列表页进入详情页面中，详情页面都是最新的，而当返回列表页后页面应该保持上次的状态，滚动条也停留在上次的位置。

#### 2. keepAlive 永久缓存
route.meta.keepAlive = true
在大多数的App入口都会有tab页面，比如首页，个人中心，广场页面等等，这种页面应该是永久缓存的，tab页面之间相互切换，都能保持自身状态不变。

#### 3. noCache 不缓存，每次进入都刷新
route.meta.noCache = true
还有一些页面，用户希望无论是前进还是后退，每次进入都是最新的页面。例如这样的场景，一组待发布的文章，点击一篇文章后进入到发布页面，当我们发布成功后，返回上一页，我希望文章列表页是最新的。当然，你也可以通过组件之间通信，让前一个页面更新状态，但是这种方案不够优雅。


### 统一路由管理
所有的路由状态通过Vuex管理，那么路由状态里需要保存哪些数据呢？
+ 首先想到的是路由栈history， 保存用户访问的所有历史路由实例信息；
+ 还需要一个aliveMap来存储永久缓存的路由，用以复用；
+ 最后是所有路由组件所在父级的 keep-alive 组件 parent，用以删除缓存的同时销毁路由组件。
```javascript
state:{
  history:[],
  aliveMap:{},
  parent:null
}
```
#### 存储路由信息
当每次进入路由时，我们要存下route的信息，重新构造一个路由对象，存到栈中，如果是route.meta.keepAlive为true,说明需要永久缓存，保存到aliveMap中。route.key 为fullPath和时间戳的组合，fullpath是为了相同路径但是路由参数不同的页面不是复用而是重新生成页面,比如从文章A的详情页进入到文章B的详情页，这两个页面组件实例是独立的不是共用同一个实例。再考虑从文章B进入到文章A页面(A的相关推荐中有B, B的相关推荐中有A),两个A页面应该也是独立的，这时候时间戳就派上了用场，它让每个页面都是独立的。
```javascript
function dealRouteEnter(state, route) {
  const { meta, path, fullPath, name } = route;
  const key = fullPath + "-" + Date.now(); 
  let item = { meta, path, fullPath, name, key };
  if (route.meta.keepAlive) {
    let aliveItem = state.aliveMap[name];
    if (!aliveItem) {
      state.aliveMap[name] = item;
    } else {
      item = aliveItem;
    }
  }
  return item;
}
```
#### 动态销毁缓存组件
当从路由页面退出时，需要将当前路由从路由栈中删除，同时由于我们是全站缓存，所以需要手动删除缓存的组件实例。
很多人应该想到了在离开页面时调用$destory销毁这个页面，但是由于keep-alive的bug ，组件销毁了缓存还在。那么该如何解决呢？由于keep-alive的cache列表中存放了所有缓存组件的信息,所以我们可以考虑在销毁组件之前，寻找路由组件所在父级的 keep-alive 组件，操控其中的 cache 列表，强行删除其中的缓存。
```javascript
function destory(route) {
  if (!route || !route.parent) return;
  const cache = route.parent.cache;
  const keys = route.parent.keys;
  const key = route.key;
  if (cache[route.key]) {
    if (keys.length) {
      var index = keys.indexOf(key);
      if (index > -1) {
        keys.splice(index, 1);
      }
    }
    delete cache[key];
  }
  route.component && route.component.$destroy();
}
```
#### 处理路由行为

在路由改变的时机，我们需要统一确定路由是前进push，后退pop，还是替换replace。并且更新路由状态。
+ 判定前进替换。在这里可以确定进入路由，同时拦截router的push()和repalce()方法，区别当前是前进还是替换。
+ 判定后退。当用户点击浏览器的回退按钮（或者在Javascript代码中调用history.back()或者history.forward()方法）时会触发popstate事件，表明当前是后退行为，
+ 修改路由状态，vue-router为我们提供了全局钩子afterEach(),来提交不同的路由行为到store中，从而修改全局路由状态。
```javascript
const Vue = require("vue");
const VueRouter = require("vue-router");
import store from "../store";
import routes from "./routes";
Vue.use(VueRouter);
const router = new VueRouter({
  routes,
});

let isBack = false;
let isReplace = false;

router.push = function(...args) {
  isBack = false;
  router.__proto__.push.call(this, ...args);
};

router.replace = function(...args) {
  isBack = false;
  isReplace = true;
  return router.__proto__.replace.call(this, ...args);
};

window.addEventListener("popstate", () => {
  isBack = true;
});

router.afterEach((to) => {
  to.meta.isBack = isBack;
  if (isReplace) {
    store.commit("router/replace", to);
  } else if (isBack) {
    store.commit("router/pop");
  } else {
    store.commit("router/push", to);
  }
  isBack = false;
  isReplace = false;
});
```

#### 路由进入 push

```javascript
function push(state, route){
  const item = dealRouteEnter(state, route);
  state.history.push(item);
}
```
#### 路由替换 replace

```javascript
function replace(state, route) {
    const item = dealRouteEnter(state, route);
    const index = state.history.length - 1;
    const removeItems = state.history.splice(index, 1, item);
    removeItems.forEach((item) => {
      if (!route || route.meta.keepAlive || !route.parent) return;
      destory(route);
    });
  },
```
#### 路由后退 pop
```javascript
 pop (state) {
    let item = state.history.pop();
    if (!route || route.meta.keepAlive || !route.parent) return;
    destory(route);
  });
},
```

#### 清空路由
有时候我们需要对路由栈进行清空操作，比如缓存的页面过多，占用大量内存，这是不可取的，这时就需要清空缓存。
```javascript
function clear(state) {
  while (state.history.length) {
    let route = state.history.pop();
    destory(route);
  }
  for (let name in state.aliveMap) {
    destory(state.aliveMap[name]);
  }
  state.aliveMap = {};
},
```
### 缓存页面
一切准备工作已经准备完毕，最后我们需要将路由状态和组件进行组合。

在根组件中，我们用keep-alive来缓存组件，并排除noCache页面，监听路由变化，确定组件实例和滚动条位置。这里的currentRoute.key是给当前路由就是存到store时标记的key。

```html
<keep-alive>
  <router-view :key="currentRoute && currentRoute.key"
                v-if="!$route.meta.noCache"
                ref="alive"></router-view>
</keep-alive>
<router-view :key="currentRoute && currentRoute.key" v-if="$route.meta.noCache"></router-view>   
<script>
export default {
  computed: {
    currentRoute() {
      const history = this.$store.state.router.history
      return history[history.length - 1] || null
    },
  },
  methods: {
    onRouteChange () {
      // 离开
      const vm = this.$refs.alive;
      if (vm) {
        const top = document.documentElement.scrollTop || document.body.scrollTop  || window.pageYOffset;
        // 保存离开时滚动条位置
        this.$store.commit("router/savePos", top);
      }
      this.$nextTick(() => {
        //  进入
        const vm = this.$refs.alive
        if (vm) {
          // 设置当前路由对应的组件实例
          this.$store.commit("router/setCompInstance", vm)
          const lastPos = this.currentRoute && this.curentRoute.lastPos || 0;
          // 恢复上次离开时滚动条位置
          window.scrollTo(0, lastPos);
        }
      })
    }
  },
  watch: {
    $route() {
      this.onRouteChange();
    }
  },
}
</script>
```

### 参考文章
[Vue 全站缓存之 keep-alive ： 动态移除缓存](Vue 全站缓存之 keep-alive ： 动态移除缓存)