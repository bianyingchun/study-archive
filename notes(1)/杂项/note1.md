### TypeScript 中的 Omit 帮助类型

​Omit<T, K>​ 类型让我们可以从另一个对象类型中剔除某些属性，并创建一个新的对象类型：

```javascript
type User = {
  id: string,

  name: string,

  email: string,
};

type UserWithoutEmail = Omit<User, "email">;

// 等价于:

type UserWithoutEmail = {
  id: string,

  name: string,
};
```

### React Hooks 系列之 useImperativeHandle

https://blog.csdn.net/weixin_43720095/article/details/104967478

### 微前端

https://blog.csdn.net/webyouxuan/article/details/107603165

### html 转 text

```js
function pareseHtmlToText(html = "") {
  return html
    .replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, "")
    .replace(/<[^>]+?>/g, "")
    .replace(/\s+/g, " ")
    .replace(/ /g, " ")
    .replace(/>/g, " ");
}
```
