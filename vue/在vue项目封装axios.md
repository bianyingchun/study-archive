## 前言

axios 是一个轻量的 HTTP 客户端，拥有众多优秀的特性，支持浏览器端和 Node.js 端，支持 Promise API，拦截请求和响应，转换请求数据和响应数据，取消请求，自动转换 JSON 数据，客户端支持防御 XSRF 等。axios 已经成为 Vue 开发者与后端进行数据交互的首选。

在项目如果每次发送请求我们重新设置超时时间、设置请求头、根据项目环境判断使用哪个请求地址、错误处理等等操作，这样是非常繁琐且不优雅的，所以我们可以把这些重复性工作进行统一处理，封装 axios。

## 创建实例

```javascript
const axios = require("axios");
const instance = axios.create({});
```

## 切换环境，设置接口请求前缀

```javascript
// 这里的baseUrl可以作为常量，从constant.js中导出。
if (process.env.NODE_ENV === "development") {
  instance.defaults.baseURL = "http://dev.xxx.com";
} else if (process.env.NODE_ENV === "production") {
  instance.defaults.baseURL = "http://prod.xxx.com";
}
```

## 设置超时

```javascript
//ms为单位
instance.defaults.timeout = 1000 * 10;
```

## 请求拦截器

我们可以在请求发送之前做一些处理，比如从 store 或 localstorage 中取出 token，写入到请求头，作为登录凭证，供后端检测是否登录，或登录是否过期。

```javascript
instance.interceptors.request.use(
  (config) => {
    const token = store.state.user.token;
    token && (config.headers.Authorization = `Bearer ${token}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## 响应拦截器

在收到服务器响应后，我们可以拦截响应，根据状态码，处理错误，处理未登录或登录过期等。

```javascript
instance.interceptors.response.use(
  (response) => {
    const { code, err, result } = response.data;
    // token过期，刷新token
    if (code === 402) {
      const config = response.config;
      if (!isRefresh) {
        isRefresh = true;
        return refreshToken()
          .then((res) => {
            store.commit("user/setToken", res.data);
            // 已经刷新了token，将所有队列中的请求进行重试
            requests.forEach((cb) => cb());
            requests = [];
            return instance(config);
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            isRefresh = false;
          });
      } else {
        // 正在刷新token，将返回一个未执行resolve的promise
        return new Promise((resolve) => {
          // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
          requests.push(() => {
            config.baseURL = "";
            resolve(instance(config));
          });
        });
      }
    } else if (code === 401 || code === 403) {
      // 处理登录需求，比如弹出登录或跳转到登录页
      store.commit("setNeedLogin", true);
    } else if (code === 200) {
      return Promise.resolve(result);
    } else {
      return Promise.reject(result);
    }
  },
  (err) => {
    // 我们可以在这里对异常状态作统一处理
    if (error.response.status) {
      // 处理请求失败的情况
      // 对不同返回码对相应处理
      return Promise.reject(error.response);
    }
  }
);
```

## 统一 POST/GET 请求

将 get 和 post 请求封装成一个方法，统一参数，方便调用。

```javascript
const request = (url, method, params = {}, headers = {}) => {
  let requestData = {
    url,
    method,
  };
  if (method === "get" || method === "GET") {
    requestData.params = params;
  } else {
    requestData.data = params;
  }
  return instance(requestData, { headers });
};
```
