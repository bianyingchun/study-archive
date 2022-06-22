[跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)
(https://www.jb51.net/article/135924.htm)

### 两种请求

浏览器将 CORS 请求分成两类：简单请求（simple request）和非简单请求（not-so-simple request）。

**只要同时满足以下两大条件，就属于简单请求**。凡是不同时满足这两个条件，就属于非简单请求

1. 请求方法是以下三种方法之一：

- HEAD
- GET
- POST

2. HTTP 的头信息不超出以下几种字段：

- Accept
- Accept-Language
- Content-Language
- Last-Event-ID
- Content-Type：只限于三个值 application/x-www-form-urlencoded、multipart/form-data、text/plain

浏览器对这两种请求的处理，是不一样的。

### 简单请求

对于简单请求，浏览器直接发出 CORS 请求。具体来说，就是在头信息之中，增加一个 Origin 字段。

服务器设置跨域

```javascript
// 仅需配置响应头部的 Access-Control-Allow-Origin 即可。
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "http://localhost:3000");
  await next();
});
```

Origin 字段用来说明，本次请求来自哪个源（协议 + 域名 + 端口）。服务器根据这个值，决定是否同意这次请求。

如果 Origin 指定的源，不在许可范围内，服务器会返回一个正常的 HTTP 回应。浏览器发现，这个回应的头信息没有包含 Access-Control-Allow-Origin 字段（详见下文），就知道出错了，从而抛出一个错误，被 XMLHttpRequest 的 onerror 回调函数捕获。注意，这种错误无法通过状态码识别，因为 HTTP 回应的状态码有可能是 200。

如果 Origin 指定的域名在许可范围内，服务器返回的响应，会多出几个头信息字段。

```js
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: FooBar
Content-Type: text/html; charset=utf-8
```

上面的头信息之中，有三个与 CORS 请求相关的字段，都以 Access-Control-开头。

1. Access-Control-Allow-Origin 字段
   该字段是必须的。它的值要么是请求时 Origin 字段的值，要么是一个\*，表示接受任意域名的请求。
2. Access-Control-Allow-Credentials
   该字段可选。它的值是一个布尔值，表示是否允许发送 Cookie。默认情况下，Cookie 不包括在 CORS 请求之中。设为 true，即表示服务器明确许可，Cookie 可以包含在请求中，一起发给服务器。这个值也只能设为 true，如果服务器不要浏览器发送 Cookie，删除该字段即可。

   ##### withCredentials 属性

   上面说到，CORS 请求默认不发送 Cookie 和 HTTP 认证信息。如果要把 Cookie 发到服务器，一方面要服务器同意，指定 Access-Control-Allow-Credentials 字段。

```js
Access-Control-Allow-Credentials: true
```

另一方面，开发者必须在 AJAX 请求中打开 withCredentials 属性。

```js
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;
```

否则，即使服务器同意发送 Cookie，浏览器也不会发送。或者，服务器要求设置 Cookie，浏览器也不会处理。

但是，如果省略 withCredentials 设置，有的浏览器还是会一起发送 Cookie。这时，可以显式关闭 withCredentials。

```js
xhr.withCredentials = false;
```

> 需要注意的是，如果要发送 Cookie，Access-Control-Allow-Origin 就不能设为星号，必须指定明确的、与请求网页一致的域名。同时，Cookie 依然遵循同源政策，只有用服务器域名设置的 Cookie 才会上传，其他域名的 Cookie 并不会上传，且（跨源）原网页代码中的 document.cookie 也无法读取服务器域名下的 Cookie。

3. Access-Control-Expose-Headers
   该字段可选。CORS 请求时，XMLHttpRequest 对象的 getResponseHeader()方法只能拿到 6 个基本字段：Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma。如果想拿到其他字段，就必须在 Access-Control-Expose-Headers 里面指定。

### 非简单请求

当第一次发出非简单请求的时候，实际上会发出两个请求，第一次发出的是 preflight request，这个请求的请求方法是 OPTIONS，这个请求是否通过决定了这一个种类的非简单请求是否能成功得到响应。
