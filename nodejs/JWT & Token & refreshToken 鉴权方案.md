### 传统身份验证方案

HTTP 是一种无状态协议，如何鉴别客户端的身份，以及保存用户状态呢。
传统解决方案是在服务器端使用Session。Session 是一种记录服务器和客户端会话状态的机制，session 是基于 cookie 实现的，session 存储在服务器端，sessionId 会被存储到客户端的cookie 中。
##### Session 认证流程：

+ 用户登录，服务器根据用户信息，创建对应的 Session
+ 服务器返回 SessionID 返回给客户端，写入到Cookie
+ 浏览器接收到服务器返回的 SessionID 信息后，会将此信息存入到 Cookie 中，同时 Cookie 记录此 SessionID 属于哪个域名
当用户第二次访问服务器的时候，请求会自动判断此域名下是否存在 Cookie 信息，如果存在自动将 Cookie 信息也发送给服务端，服务端会从 Cookie 中获取 SessionID，再根据 SessionID 查找对应的 Session 信息，如果没有找到说明用户没有登录或者登录失效，如果找到 Session 证明用户已经登录可执行后面操作。

### 使用 Token 实现身份验证的方案

Token 是访问资源接口（API）时所需要的资源凭证，每一次请求都需要携带 token，需要把 token 放到 HTTP 的 Header 里
基于 token 的用户认证是一种服务端无状态的认证方式，服务端不用存放 token 数据。用解析 token 的计算时间换取 session 的存储空间，从而减轻服务器的压力，减少频繁的查询数据库

##### Token 认证流程：

+ 用户登录，服务器验证用户信息，签发一个 token 并把这个 token 发送给客户端
+ 客户端收到 token 以后，会把它存储起来，比如放在 cookie 里或者 localStorage 里
+ 客户端每次向服务端请求资源的时候需要带着服务端签发的 token
+ 服务端收到请求，然后去验证客户端请求里面带着的 token ，如果验证成功，就向客户端返回请求的数据




1、客户端使用用户名跟密码请求登录，并带上设备序列号、appId；

2、服务端收到请求，去验证用户名与密码；

3、验证成功后，服务端会签发一个Token和一个refreshToken；

4、客户端收到Token和refreshToken以后必须把它们存储起来，比如放在Cookie里或者Local Storage里；

5、客户端每次向服务端请求数据的时候需要带着服务端签发的Token；

6、服务端收到请求，就去验证请求里面带着的Token，如果验证成功，就向客户端返回请求的数据；

7、客户端向服务端请求数据的时候如果Token超时，就带上refreshToken，重新调用Token刷新接口，获取新的Token和refreshToken；

8、服务端收到刷新Token请求，就去验证请求里面带着的refreshToken，如果验证成功，就向客户端返回新的Token和refreshToken，客户端用新的Token请求数据；

9、如果刷新Token失败，则重新发起登录流程。

### JWT
实施 Token 验证的方法挺多的，还有一些标准方法，比如 JWT。JSON Web Token (JWT)是一个开放标准(RFC 7519)，它定义了一种紧凑的、自包含的方式，用于作为JSON对象在各方之间安全地传输信息。该信息可以被验证和信任，因为它是数字签名的。

#### JWT的组成
一个JWT实际上就是一个字符串，它由三部分组成，头部Header、负载Payload与签名Signature， 用. 隔开: Header.Payload.Signature。
##### 1. Header
Header 部分是一个 JSON 对象，描述 JWT 的元数据，通常是下面的样子。
```javascript
{
  // alg属性表示签名的算法（algorithm），默认是 HMAC SHA256（写成 HS256）
  "alg": "HS256",
  // typ属性表示这个令牌（token）的类型（type），JWT 令牌统一写为JWT
  "typ": "JWT"
}
```
最后，将上面的 JSON 对象使用 Base64URL 算法（详见后文）转成字符串。

##### 2. Payload
Payload 部分也是一个 JSON 对象，用来存放实际需要传递的数据。JWT 规定了7个官方字段，供选用。
1. iss (issuer)：签发人
2. exp (expiration time)：过期时间
3. sub (subject)：主题
4. aud (audience)：受众
5. nbf (Not Before)：生效时间
6. iat (Issued At)：签发时间
7. jti (JWT ID)：编号
除了官方字段，你还可以在这个部分定义私有字段，下面就是一个例子。
```javascript

{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}
```
注意，JWT 默认是不加密的，任何人都可以读到，所以不要把秘密信息放在这个部分。

这个 JSON 对象也要使用 Base64URL 算法转成字符串。

##### 3. Signature
Signature 部分是对前两部分的签名，防止数据篡改。

首先，需要指定一个密钥（secret）。这个密钥只有服务器才知道，不能泄露给用户。然后，使用 Header 里面指定的签名算法（默认是 HMAC SHA256），按照下面的公式产生签名。
HMACSHA256( base64UrlEncode(header) + "." +base64UrlEncode(payload),secret)

算出签名以后，把 Header、Payload、Signature 三个部分拼成一个字符串，每个部分之间用"点"（.）分隔，就可以返回给用户。

#####  Base64URL
前面提到，Header 和 Payload 串型化的算法是 Base64URL。这个算法跟 Base64 算法基本类似，但有一些小的不同。

JWT 作为一个令牌（token），有些场合可能会放到 URL（比如 api.example.com/?token=xxx）。Base64 有三个字符+、/和=，在 URL 里面有特殊含义，所以要被替换掉：=被省略、+替换成-，/替换成_ 。这就是 Base64URL 算法。



1. 服务端验证

2. 鉴权中间件
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
            return resError(res, { code: 402, msg: "token已过期" });
          }
        }
      }
    }
  }
  if (access) {
    next();
  } else {
    // 
    resError(res, { code: 403, msg: "拒绝访问" });
  }
};

```
#### 生成Token
```javascript
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const PRIVARE_KEY = 'privateKey';
const PUBLIC_KEY = 'publicKey';
const generate = (data = {}, expiresIn) =>{
  expiresIn = expiresIn || "30day";
  const token = jwt.sign(data, PRIVARE_KEY, {
    algorithm: "RS256",
    expiresIn: expiresIn,
  });
  return token;
}
```
#### 参考链接
[JSON Web Token 入门教程](ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)
[还分不清 Cookie、Session、Token、JWT？](https://zhuanlan.zhihu.com/p/164696755)
[基于JWT token 及 AUTH2.0 refresh_token的前后端分离验证模式](https://blog.csdn.net/u011085172/article/details/85337972)
[基于](https://blog.csdn.net/Paulangsky/article/details/95048410)