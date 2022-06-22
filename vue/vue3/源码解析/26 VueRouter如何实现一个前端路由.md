## 路由的基本用法 初始化路由

```js
import { createApp } from "vue";

import { createRouter, createWebHashHistory } from "vue-router";

// 1. 定义路由组件

const Home = { template: "<div>Home</div>" };
const About = { template: "<div>About</div>" };

// 2. 定义路由配置，每个路径映射一个路由视图组件

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
];

// 3. 创建路由实例，可以指定路由模式，传入路由配置对象

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 4. 创建 app 实例

const app = createApp({});

// 5. 在挂载页面 之前先安装路由

app.use(router);
// 6. 挂载页面
app.mount("#app");
```

# 路由的实现原理

## createRouter 创建路由对象

```js
function createRouter(options) {
  // 定义一些辅助方法和变量

  // ...

  // 创建 router 对象
  const router = {
    // 当前路径
    currentRoute,
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve,
    options,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorHandlers.add,
    isReady,
    install(app) {
      // 安装路由函数
    },
  };

  return router;
}
```

## 路由的安装

```js
const router = {
  install(app) {
    const router = this;

    // 注册路由组件
    app.component("RouterLink", RouterLink);
    app.component("RouterView", RouterView);

    // 全局配置定义 $router 和 $route
    app.config.globalProperties.$router = router;

    Object.defineProperty(app.config.globalProperties, "$route", {
      get: () => unref(currentRoute),
    });

    // 在浏览器端初始化导航
    if (
      isBrowser &&
      !started &&
      currentRoute.value === START_LOCATION_NORMALIZED
    ) {
      // see above
      started = true;
      push(routerHistory.location).catch((err) => {
        warn("Unexpected error when starting the router:", err);
      });
    }
    // 路径变成响应式
    const reactiveRoute = {};
    for (let key in START_LOCATION_NORMALIZED) {
      reactiveRoute[key] = computed(() => currentRoute.value[key]);
    }
    // 全局注入 router 和 reactiveRoute
    app.provide(routerKey, router);
    app.provide(routeLocationKey, reactive(reactiveRoute));

    let unmountApp = app.unmount;
    installedApps.add(app);

    // 应用卸载的时候，需要做一些路由清理工作
    app.unmount = function () {
      installedApps.delete(app);
      if (installedApps.size < 1) {
        removeHistoryListener();
        currentRoute.value = START_LOCATION_NORMALIZED;
        started = false;
        ready = false;
      }
      unmountApp.call(this, arguments);
    };
  },
};
```

路由的安装的过程我们需要记住以下两件事情。

1. 全局注册 RouterView 和 RouterLink 组件——这是你安装了路由后，可以在任何组件中去使用这俩个组件的原因，如果你使用 RouterView 或者 RouterLink 的时候收到提示不能解析 router-link 和 router-view，这说明你压根就没有安装路由。

2. 通过 provide 方式全局注入 router 对象和 reactiveRoute 对象，其中 router 表示用户通过 createRouter 创建的路由对象，我们可以通过它去动态操作路由，reactiveRoute 表示响应式的路径对象，它维护着路径的相关信息。

那么至此我们就已经了解了路由对象的创建，以及路由的安装，但是前端路由的实现，还需要解决几个核心问题：**路径是如何管理的，路径和路由组件的渲染是如何映射的。**
