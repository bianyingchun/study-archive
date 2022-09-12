## 1. react

1.  面试题
2.  redux
3.  diff 算法
4.  redux connect 原理
5. hooks 原理 
    1. 手写useEffect
    2. 手写useState
6. fiber 
## 2. vue

1.  组件原理
2.  diff 算法
3.  面试题目
4.  前端路由
    1. 拦截用户的刷新操作，避免服务端盲目响应更新；监听 url 的变化，前端处理页面刷新
    2. hash : location.hast + 监听 hashchange
    3. history: pushstate/replaceState(浏览器并不会刷新当前页面，而仅仅修改网址) + 监听 popState

## 3. js

1. 词法环境、闭包
1. 防抖节流
1. bind 实现， （注意可以当做构造函数使用）
1. 事件循环
1. promise
1. blob
   1. 文件分片上传
   2. 文件下载
      1. responseType:'blob'
      2. URL.createObjectURL(blob)
      3. URL.revokeObjectURL(blob) // 释放 URL 对象
   3. 图片预览
      const reader = new FileReader();
      reader.onload = function(){
      const output = document.querySelector('output');
      output.src = reader.result;
      };
      reader.readAsDataURL(event.target.files[0]); //
1. base64 data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..

## 4. NodeJS

1. 事件循环原理
2. koa
3. 大文件分片上传
4. nginx

## 5. http

1. 三次握手
1. https http2
1. 缓存
   1. 强缓存 不会向服务器发送请求,直接从缓存中读取资源
      1. expire 绝对时间
      2. cache-control
         max-age
         no-cache
         private
         public
         no-store
   2. 协商缓存 当协商缓存生效时,返回 304 和 Not Modified。它指的是强制缓存失效后,浏览器携带缓存标示向服务器发起请求,由服务器决定是否需要使用缓存。
      1. last-Modified & if-Modified-since
      2. eTag & if-None-Match
1. 跨域

   1. 简单请求
      CORS 将请求分为简单请求和非简单请求，可以简单的认为，简单请求就是没有加上额外请求头部的 get 和 post 请求，并且如果是 post 请求，请求格式不能是 application/json
 
      对于简单请求，浏览器直接发出 CORS 请求。具体来说，就是在头信息之中，增加一个 Origin 字段。

      1. origin Access-control-allow-origin :'\*'

   2. 非简单请求
      1. 预检 options
      2. Access-Control-Allow-Origin: http://localhost:3000
      3. Access-Control-Allow-Methods: PUT,DELETE,POST,GET
      上面两个条件符合，则正式发出请求，
      4. Access-Control-Max-Age: 86400 在该非简单请求在服务器端通过检验的那一刻起，当流逝的时间的毫秒数不足 Access-Control-Max-Age 时，就不需要再进行预检，可以直接发送一次请求。
   3. 允许发送 cookie Aceess-control-alow-credentials:true(如果要发送 Cookie，Access-Control-Allow-Origin 不能为\*)

   ```js
   ctx.set('Access-control-allow-origin', '*')
   ctx.set('Acess-control-allow-methods', 'PUT,DELETE,POST,GET')
   ctx.set('Acess-control-Max-Age', 60*1000)
   ctx.set('Access-control-Allow-credential':true)
   ```

1. tcp
1. content-type
   1. application/x-www-form-urlencoded
   2. multipart/form-data

## 6. html/css

1. flex

   ```css
   flex-grow: 0;
   flex-shrink: 1;
   flex-basis: auto;
   ```

   默认值 0 1 auto;

   1. flex-grow 定义项目的放大比例，默认为 0，如果存在剩余空间，也不放大
   2. flex-shrink 定义项目的缩小比例，默认为 1，如果存在空间不足，将该项目缩小
   3. flex-basis 给上面两个属性分配多余空间之前，计算项目是否还有多余空间，默认为 auto,项目本身的大小
   4. flex:1 : 1, 1, 0%

## 7. webpack

    1. split-chunk
    2. 按需加载
    3. tree-shaking
    4. 优化
    5. vite 原理
## 8. babel

## 10. 项目

    1. 网易云音乐
    2. 博客 增加一些文章
    3. 时报
    4. 混剪
    5. gt

## 11. 算法

    1. 排序算法

## 性能优化与安全

## 前端监控：数据采集+数据上报

## 微服务

## css 模块化 
- CSS 命名方法论：通过人工的方式来约定命名规则。BEM\OOCSS
- CSS Modules：一个 CSS 文件就是一个独立的模块。是构建步骤中的一个进程，通过构建工具的帮助，将 class 的名字或选择器的名字作用域化（类似命名空间化）postcss-modules /css-loader module属性
vue : <div data-v-ca49f7d6 class="logo-wrapper"></div>
<style>
  .logo-wrapper[data-v-ca49f7d6] {
    display: flex;
  }
</style>
- CSS-in-JS：在 JS 中写 CSS。: Styled-components