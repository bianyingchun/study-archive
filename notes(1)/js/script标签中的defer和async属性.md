[原文链接](https://blog.csdn.net/weixin_42561383/article/details/86564715)

默认情况下，浏览器是同步加载 JavaScript 脚本，即渲染引擎遇到<script>标签就会停下来，等到执行完脚本，再继续向下渲染。如果是外部脚本，还必须加入脚本下载的时间。

如果脚本体积很大，下载和执行的时间就会很长，因此造成浏览器堵塞，用户会感觉到浏览器“卡死”了，没有任何响应。这显然是很不好的体验，所以浏览器允许脚本异步加载，下面就是两种异步加载的语法。

```js
<script src="path/to/myModule.js" defer></script>
<script src="path/to/myModule.js" async></script>
```

上面代码中，<script>标签打开 defer 或 async 属性，脚本就会异步加载。渲染引擎遇到这一行命令，就会开始下载外部脚本，但不会等它下载和执行，而是直接执行后面的命令。

### defer 与 async 的区别是

- defer 要等到整个页面在内存中正常渲染结束（DOM 结构完全生成，以及其他脚本执行完成），才会执行；async 一旦下载完，渲染引擎就会中断渲染，执行这个脚本以后，再继续渲染。一句话，**defer 是“渲染完再执行”，async 是“下载完就执行”。**
- **另外，如果有多个 defer 脚本，会按照它们在页面出现的顺序加载，而多个 async 脚本是不能保证加载顺序的。**

如果同时指定了两个属性，则会遵从 async 属性而忽略 defer 属性。

### 只有一个脚本的情况

- 没有 defer 或 async 属性，浏览器会立即下载并执行相应的脚本，并且在下载和执行时页面的处理会停止。

<script src="example.js"></script>

- 有了 defer 属性，浏览器会立即下载相应的脚本，在下载的过程中页面的处理不会停止，等到文档解析完成后脚本才会执行。

<script defer src="example.js"></script>

- 有了 async 属性，浏览器会立即下载相应的脚本，在下载的过程中页面的处理不会停止，下载完成后立即执行，执行过程中页面处理会停止。

<script async src="example.js"></script>

- 如果同时指定了两个属性，则会遵从 async 属性而忽略 defer 属性。

<script async src="example.js" defer async></script>

### 多个脚本的情况

- 两个脚本都没有 defer 或 async 属性，浏览器会立即下载并执行脚本 example1.js，在 example1.js 脚本执行完成后才会下载并执行脚本 example2.js，在脚本下载和执行时页面的处理会停止。

```html
<script src="example1.js"></script>
<script src="example2.js"></script>
```

- 有了 defer 属性，浏览器会立即下载相应的脚本 example1.js 和 example2.js，在下载的过程中页面的处理不会停止，等到文档解析完成才会执行这两个脚本。

HTML5 规范要求脚本按照它们出现的先后顺序执行，因此第一个延迟脚本会先于第二个延迟脚本执行，而这两个脚本会先于 DOMContentLoaded 事件执行。

**在现实当中，延迟脚本并不一定会按照顺序执行，也不一定会在 DOMContentLoaded 事件触发前执行，因此最好只包含一个延迟脚本。**

<script defer src="example1.js"></script>
<script defer src="example2.js"></script>

- 有了 async 属性，浏览器会立即下载相应的脚本 example1.js 和 example2.js，在下载的过程中页面的处理不会停止，example1.js 和 example2.js **哪个先下载完成哪个就立即执行，执行过程中页面处理会停止，但是其他脚本的下载不会停止。**标记为 async 的脚本并不保证按照制定它们的先后顺序执行。**异步脚本一定会在页面的 load 事件前执行，但可能会在 DOMContentLoaded 事件触发之前或之后执行。**

<script async src="example1.js"></script>
<script async src="example2.js"></script>

## 小结

将脚本放在 </body>前面就可以了，如果有依赖的则按照顺序放好。如果一定要放在 head 标签里面，最好是加 defer 属性。
