https://segmentfault.com/a/1190000016655409
https://www.jianshu.com/p/cad966097d9d

静态资源服务器
压缩
缓存 强缓存 协商缓存
+ 强缓存在 Request Header 中的字段是 Expires 和 Cache-Control；如果在有效期内则直接加载缓存资源，状态码直接是显示 200。

+ 协商缓存在 Request Header 中的字段是：

If-Modified-Since（对应值为上次 Respond Header 中的 Last-Modified）
If-None—Match（对应值为上次 Respond Header 中的 Etag）