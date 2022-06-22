## npm run xxx 发生了什么

1. npm run xxx 实际上会执行 package.json 下 script 下的 xxx

2. 运行 npm run xxx 的时候，npm 会先在当前目录的 node_modules/.bin 查找要执行的程序，如果找到则运行；

   > 注意 bin 字段，当我们运行 ​npm i @vue/cli-service​ 这条命令时，npm 就会在 ​node_modules/.bin/​ 目录中创建好以 ​vue-cli-service​,为名的几个可执行文件了。.bin 目录，这个目录不是任何一个 npm 包。目录下的文件，表示这是一个个软链接，打开文件可以看到文件顶部写着 #!/bin/sh ，表示这是一个脚本。

当使用 npm run serve 执行 vue-cli-service serve ，则相当于执行了 ./node_modules/.bin/vue-cli-service serve（最后的 serve 作为参数传入）。

3. 没有找到则从全局的 node_modules/.bin 中查找，npm i -g xxx 就是安装到到全局目录；

4. 如果全局目录还是没找到，那么就从 path 环境变量中查找有没有其他同名的可执行程序。

### .bin 目录下的文件表示软连接，那这个 bin 目录下的那些软连接文件是哪里来的呢？它又是怎么知道这条软连接是执行哪里的呢

从 package-lock.json 中可知，当我们 npm i 整个新建的 vue 项目的时候，npm 将 bin/vue-cli-service.js 作为 bin 声明了。所以在 npm install 时，npm 读到该配置后，就将该文件软链接到 ./node_modules/.bin 目录下，而 npm 还会自动把 node_modules/.bin 加入$PATH，这样就可以直接作为命令运行依赖程序和开发依赖程序，不用全局安装了。
假如我们在安装包时，使用 npm install -g xxx 来安装，那么会将其中的 bin 文件加入到全局，比如 create-react-app 和 vue-cli ，在全局安装后，就可以直接使用如 vue-cli projectName 这样的命令来创建项目了。

> npm i 的时候，npm 就帮我们把这种软连接配置好了，其实这种软连接相当于一种映射，执行 npm run xxx 的时候，就会到 node_modules/bin 中找对应的映射文件，然后再找到相应的 js 文件来执行
> [参考文档](https://juejin.cn/post/7078924628525056007)
