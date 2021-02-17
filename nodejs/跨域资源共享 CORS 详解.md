[跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)
(https://www.jb51.net/article/135924.htm)

### 两种请求

浏览器将 CORS 请求分成两类：简单请求（simple request）和非简单请求（not-so-simple request）。

只要同时满足以下两大条件，就属于简单请求。凡是不同时满足这两个条件，就属于非简单请求

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

仅需配置响应头部的 Access-Control-Allow-Origin 即可。

```javascript
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "http://localhost:3000");
  await next();
});
```

这时候如果看一下请求和响应的头部信息，会发现请求头部多了个 origin（还有一个 referer 为发出请求的 url 地址），而响应头部多了个 Access-Control-Allow-Origin。

除了 Access-Control-Allow-Origin 字段，可选 2. Access-Control-Allow-Credentials
该字段可选。它的值是一个布尔值，表示是否允许发送 Cookie。默认情况下，Cookie 不包括在 CORS 请求之中。设为 true，即表示服务器明确许可，Cookie 可以包含在请求中，一起发给服务器。这个值也只能设为 true，如果服务器不要浏览器发送 Cookie，删除该字段即可。
注意，开发者必须在 AJAX 请求中打开 withCredentials 属性。Access-Control-Allow-Origin 就不能设为星号，必须指定明确的、与请求网页一致的域名

1. Access-Control-Expose-Headers
   该字段可选。CORS 请求时，XMLHttpRequest 对象的 getResponseHeader()方法只能拿到 6 个基本字段：Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma。如果想拿到其他字段，就必须在 Access-Control-Expose-Headers 里面指定。

### 非简单请求

当第一次发出非简单请求的时候，实际上会发出两个请求，第一次发出的是 preflight request，这个请求的请求方法是 OPTIONS，这个请求是否通过决定了这一个种类的非简单请求是否能成功得到响应。
