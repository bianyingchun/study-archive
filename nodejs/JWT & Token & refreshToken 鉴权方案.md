### 传统身份验证方案

HTTP 是一种无状态协议，那么如何鉴别客户端的身份，以及保存用户状态呢。

传统解决方案是在服务器端使用 Session。Session 是一种记录服务器和客户端会话状态的机制，session 是基于 cookie 实现的，session 存储在服务器端，sessionId 会被存储到客户端的 cookie 中。

##### Session 认证流程：

- 用户登录，服务器根据用户信息，创建对应的 Session
- 服务器返回 SessionID 返回给客户端，写入到 Cookie
- 浏览器接收到服务器返回的 SessionID 信息后，会将此信息存入到 Cookie 中，同时 Cookie 记录此 SessionID 属于哪个域名
- 当用户第二次访问服务器的时候，请求会自动判断此域名下是否存在 Cookie 信息，如果存在自动将 Cookie 信息也发送给服务端，服务端会从 Cookie 中获取 SessionID，再根据 SessionID 查找对应的 Session 信息，如果没有找到说明用户没有登录或者登录失效，如果找到 Session 证明用户已经登录可执行后面操作。

### 使用 Token 实现身份验证的方案

Token 是访问资源接口（API）时所需要的资源凭证，每一次请求都需要携带 token，需要把 token 放到 HTTP 的 Header 里。

基于 token 的用户认证是一种服务端无状态的认证方式，服务端不用存放 token 数据。用解析 token 的计算时间换取 session 的存储空间，从而减轻服务器的压力，减少频繁的查询数据库。

考虑到 token 超时后必须重新登录以及安全问题，有效期设置过长和过短都有弊端，往往会添加一个 RefreshToken，用于刷新 token，RefreshToken 的有效时间大于 token，比如 token 的有效期 15 分钟内有效，refreshToken7 天有效，只要用户在 7 天内再次访问，就无需重新登录。

##### Token 认证流程：

1. 用户登录，服务器验证用户信息，签发一个 token 和 refreshToken 发送给客户端；

2. 客户端收到 token 和 refreshToken 以后，会把它存储起来，比如放在 cookie 里或者 localStorage 里；

3. 客户端每次向服务端请求数据的时候需要带着服务端签发的 Token；

4. 服务端收到请求，就去验证请求里面带着的 Token，如果验证成功，就向客户端返回请求的数据；

5. 客户端向服务端请求数据的时候如果 Token 超时，就带上 refreshToken，重新调用 Token 刷新接口，获取新的 Token 和 refreshToken；

6. 服务端收到刷新 Token 请求，验证 refreshToken，如果验证成功，就向客户端返回新的 Token 和 refreshToken，客户端用新的 Token 请求数据；

7. 如果刷新 Token 失败，则重新发起登录流程。

### JWT

实施 Token 验证的方法有很多，还有一些标准方法，比如 JWT。

JSON Web Token (JWT)是一个开放标准(RFC 7519)，它定义了一种紧凑的、自包含的方式，用于作为 JSON 对象在各方之间安全地传输信息。该信息可以被验证和信任，因为它是数字签名的。

一个 JWT 实际上就是一个字符串，它由三部分组成，头部 Header、负载 Payload 与签名 Signature， 用 . 隔开: Header.Payload.Signature。

想要深入了解 JWT，可以阅读阮一峰老师的这篇文章 [JSON Web Token 入门教程](ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)，这里就不再赘述了。

### Token 身份认证实现过程

#### 服务器端

##### 封装 JWT

在 nodeJs 中通常使用 jsonwebtoken 这个 npm 包来实现 jwt， 以下是对 jwt 封装的一些方法，用于生成和校验 token;

```javascript
const jwt = require("jsonwebtoken");
const { TOKEN, REFRESH_TOKEN } = require("../config");
const _verifyToken = (token, config) => {
  return jwt.verify(token, config.screct);
};

// 生成token
const genToken = (data) => _genToken(data, TOKEN);
// 校验token
const verifyToken = (token) => _verifyToken(token, TOKEN);
// 生成refreshToken
const genRefreshToken = (data) => _genToken(data, REFRESH_TOKEN);
// 校验refreshtoken
const verifyRefreshToken = (token) => _verifyToken(token, REFRESH_TOKEN);
```

##### 用户登录/注册，生成 token 和 refreshToken 返回给客户端

```javascript
router.post("/login", async (req, res) => {
  const { tel, password } = req.body;
  try {
    let user = await findUser({ tel, password: md5Pwd(password) });
    if (!user) {
      return resError(res, { msg: "手机号或密码错误" });
    }
    // 返回token
    resSuccess(res, {
      refreshtoken: genRefreshToken(user._id),
      token: genToken(user._id),
    });
  } catch (err) {
    resError(res, err);
  }
});
```

##### 刷新 token 接口

客户端发送 refreshtoken 来刷新 token， 校验成功返回新的 token 和 refreshToken，这里同时刷新 refreshToken 是为了保障只要用户长期保持登录，就可以让 refreshToken 时效增长，无需重新登录。验证失败返回错误码 401 给客户端，通知重新登录，

```javascript
router.post("/refresh", async (req, res) => {
  try {
    let { refreshtoken } = req.body;
    const decoded = verifyRefreshToken(refreshtoken);
    let token = genToken(decoded.data);
    refreshtoken = genRefreshToken(decoded.data);
    resSuccess(res, {
      token: token,
      refreshtoken: refreshtoken,
      msg: "刷新token成功",
    });
  } catch (err) {
    resError(res, {
      code: 401,
      msg: "请重新登录",
    });
  }
});
```

##### 鉴权中间件，拦截非法请求，校验用户身份

NodeJs 后端使用 express 搭建的服务器，可以设置中间件拦截请求。

```javascript
const authMiddleware = (req, res, next) => {
  // 处理预检
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  let access = false;
  //过滤不需要鉴权的路由
  if (_jumpAuth(req.url)) {
    access = true;
  }
  // 校验请求头token信息，检测是否登录， 或登录已过期 认证用户身份。
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.trim().split(" ");
    if (parts.length === 2) {
      const schema = parts[0];
      const token = parts[1];
      if (schema === "Bearer") {
        try {
          let decode = verifyToken(token);
          req.uid = decode.data;
          access = true;
        } catch (err) {
          if (!access) {
            // token 过期， 通知客户端发送refreshToken来刷新token
            return resError(res, { code: 402, msg: "token已过期" });
          }
        }
      }
    }
  }
  if (access) {
    next();
  } else {
    // 认证失败
    resError(res, { code: 403, msg: "拒绝访问" });
  }
};
```

#### 客户端

我这里的客户端是 Vue 实现的，使用 axios 封装的请求接口。具体的封装过程可以查看这篇文章[在 vue 项目封装 axios](http://blog.bianyc.xyz/article/603f81e7dd16eb3eeb6ff392)

##### 请求拦截器，携带 token

refreshToken 和 token 存储在 localstorage 中，每次请求后端时将 token 取出放到请求头中，作为登录凭证，供后端检测是否登录，或登录是否过期。

```javascript
instance.interceptors.request.use(
  (config) => {
    const token = localstorage.getItem("TOKEN");
    token && (config.headers.Authorization = `Bearer ${token}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

##### 响应拦截器

拦截 token 失效的所有请求，放到请求队列里，等待 token 刷新成功后重新发送。需要注意的一点是，这里只有一个接口刷新 Token。

由于客户端一般都是多个接口并发请求数据，当 Token 超时后，服务端要求客户端刷新 Token，这时候客户端会多个请求并发刷新 Token。当第一个接口刷新 Token 成功后，服务端的 Token 和 refreshToken 都发生了改变，导致后面的刷新请求验证 refreshToken 不通过，从而刷新失败。

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
            localstorage.setItem("TOKEN", res.data);
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

const refreshToken = () => {
  const refreshtoken = localStorage.getItem("REFRESH_TOKEN");
  return request("/user/refresh", "post", { refreshtoken });
};
```

#### 参考链接

[JSON Web Token 入门教程](ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)
[还分不清 Cookie、Session、Token、JWT？](https://zhuanlan.zhihu.com/p/164696755)
[APP 使用 token 和 refreshToken 实现接口身份认证，保持登录状态](https://blog.csdn.net/Paulangsky/article/details/95048410)
