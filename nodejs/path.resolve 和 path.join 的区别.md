### path.join()

path.join()方法是将多个参数字符串合并成一个路径字符串 (用/拼接)

```javascript
path.join("foo", "baz", "bar"); // 返回 'foo/baz/bar'

path.join(__dirname, "foo", "bar"); // 假如当前文件的路径是E:/node/demos,那么拼接出来就是E:/node/demos/foo/bar。

path.join(__dirname, "/foo", "/bar", ".."); //路径开头的/不会影响拼接，..代表上一级文件，拼接出来的结果是：E:/node/demos/foo

path.join(__dirname, "foo", {}, "bar"); // 而且path.join()还会帮我们做路径字符串的校验，当字符串不合法时，会抛出错误：Path must be a string.
```

### path.resolve()

path.resolve()方法是以程序为根目录，作为起点，把一个路径或路径片段的序列解析为一个绝对路径

- 以应用程序为根目录
- 普通字符串代表子目录
- /代表绝对路径根目录

```javascript
//注： 当前工作目录为 E:/node/demos
path.resolve(); // 得到应用程序启动文件的目录（得到当前执行文件绝对路径）E:\node\demos
path.resolve("/foo/bar", "./baz"); // 返回: 'E:/foo/bar/baz'

path.resolve("/foo/bar", "/tmp/file/"); // 返回: 'E:/tmp/file'

path.resolve("wwwroot", "static_files/png/", "../gif/image.gif"); // 返回 'E:/node/demos/wwwroot/static_files/gif/image.gif'
```

### 总结

1. join 是把各个 path 片段连接在一起， resolve 把/当成根目录

```javascript
path.join("/a", "/b"); // '/a/b'
path.resolve("/a", "/b"); //  '/b'
```

2. join 直接拼接字段，resolve 解析路径并返回

```javascript
path.join("a", "b1", "..", "b2"); // a/b2
path.resolve("a", "b1", "..", "b2"); // 工作目录/a/b2
```
