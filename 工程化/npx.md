Node 自带 npm 模块，所以可以直接使用 npx 命令。万一不能用，就要手动安装一下。

```sh
$ npm install -g npx
```

## 调用项目安装的模块

```sh
# 项目的根目录下执行
$ node-modules/.bin/mocha --version
# 使用npx
$ npx mocha --version
```

npx 的原理很简单，就是运行的时候，**会到 node_modules/.bin 路径和环境变量$PATH 里面，检查命令是否存在。**

由于 npx 会检查环境变量$PATH，所以系统命令也可以调用。

```sh
# 等同于 ls
$ npx ls
```

## 避免全局安装模块

除了调用项目内部模块，npx 还能避免全局安装的模块。比如，create-react-app 这个模块是全局安装，npx 可以运行它，而且不进行全局安装。

```sh
$ npx create-react-app my-react-app
```

上面代码运行时，npx 将 create-react-app 下载到一个临时目录，使用以后再删除。所以，以后再次执行上面的命令，会重新下载 create-react-app。

## 下载全局模块时，npx 允许指定版本

```sh
$ npx uglify-js@3.1.0 main.js -o ./dist/main.js
```

上面代码指定使用 3.1.0 版本的 uglify-js 压缩脚本。

注意，**只要 npx 后面的模块无法在本地发现，就会下载同名模块**。比如，本地没有安装 http-server 模块，下面的命令会自动下载该模块，在当前目录启动一个 Web 服务。

```sh
$ npx http-server
```

## --np-install 强制使用本地模块，不下载远程模块

```sh
npx --no-install http-server
```

## --ignore-existing 忽略本地的同名模块，强制安装使用远程模块

```sh
 npx --ignore-existing create-react-app my-react-app
```

## 使用不同版本的 node

```sh
npx node@0.12.8 -v
```

上面命令会使用 0.12.8 版本的 Node 执行脚本。**原理是从 npm 下载这个版本的 node，使用后再删掉。**

某些场景下，这个方法用来切换 Node 版本，要比 nvm 那样的版本管理器方便一些。
[原文链接](http://www.ruanyifeng.com/blog/2019/02/npx.html)
