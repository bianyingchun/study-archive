## npm scripts 原理介绍

这一部分，我们将对 npm scripts 是什么，以及其核心原理进行讲解。

### npm scripts 是什么

我们先来系统地了解一下 npm scripts。Node.js 在设计 npm 之初，**允许开发者在 package.json 文件中，通过 scripts 字段来自定义项目的脚本**。比如我们可以在 package.json 中这样使用：

```js
{
	// ...
  "scripts": {
    "build": "node build.js",
    "dev": "node dev.js",
    "test": "node test.js",
  }
  // ...
}
```

对应上述代码，我们在项目中可以使用命令行执行相关的脚本：

```sh
$ npm run build
$ npm run dev
$ npm run test
```

其中 build.js、dev.js、test.js 三个 Node.js 模块分别对应上面三个命令行执行命令。这样的设计，可以方便我们统计和集中维护项目工程化或基建相关的所有脚本/命令，也可以利用 npm 很多辅助功能，例如下面几个功能。

##### npm script 辅助功能

**使用 npm 钩子**，比如 pre、post，对应命令 npm run build 的钩子命令就是：prebuild 和 postbuild。

**开发者使用 npm run build 时，会默认自动先执行 npm run prebuild 再执行 npm run build，最后执行 npm run postbuild**，对此我们可以自定义：

```js
{
// ...
"scripts": {
"prebuild": "node prebuild.js",
"build": "node build.js",
"postbuild": "node postbuild.js",
}
// ...
}
```

##### process.env.npm_lifecycle_event 获得当前运行的脚本名称

使用 npm 提供的 process.env.npm_lifecycle_event 等环境变量。通过 process.env.npm_lifecycle_event，可以在相关 npm scripts 脚本中获得当前运行的脚本名称。

##### 使用 npm 提供的 npm*package*能力，获取 package.json 中的相关字段，比如下面代码：

```js
// 获取 package.json 中的 name 字段值
console.log(process.env.npm_package_name);

// 获取 package.json 中的 version 字段值
console.log(process.env.npm_package_version);
```

更多 npm 为 npm scripts 提供的“黑魔法”，我们不再一一列举了。你可以前往 https://docs.npmjs.com/ 进行了解。

### npm scripts 原理

其实，npm scripts 原理比较简单。我们依靠 npm run xxx 来执行一个 npm scripts，那么核心奥秘就在于 npm run 了。**npm run 会自动创建一个 Shell（实际使用的 Shell 会根据系统平台而不同，类 UNIX 系统里，如 macOS 或 Linux 中指代的是 /bin/sh， 在 Windows 中使用的是 cmd.exe），我们的 npm scripts 脚本就在这个新创建的 Shell 中被运行**。这样一来，我们可以得出几个关键结论：

- 只要是 Shell 可以运行的命令，都可以作为 npm scripts 脚本；

- npm 脚本的退出码，也自然遵守 Shell 脚本规则；

- 如果我们的系统里安装了 Python，可以将 Python 脚本作为 npm scripts；

- npm scripts 脚本可以使用 Shell 通配符等常规能力。

比如这样的代码：

```js
{
// ...
"scripts": {
"lint": "eslint **/*.js",
}
// ...
}
```

\*表示任意文件名，\*\*表示任意一层子目录，在执行 npm run lint 后，就可以对当前目录下，任意一层子目录的 js 文件进行 lint 审查。

另外，请你思考：**npm run 创建出来的 Shell 有什么特别之处呢？**

我们知道，node_modules/.bin 子目录中的所有脚本都可以直接以脚本名的形式调用，而不必写出完整路径，比如下面代码：

```js
{
// ...
"scripts": {
"build": "webpack",
}
// ...
}
```

在 package.json 中直接写 webpack 即可，而不需要写成：

```js
{
// ...
"scripts": {
"build": "./node_modules/.bin/webpack",
}
// ...
}
```

的形式。这是为什么呢？

**实际上，npm run 创建出来的 Shell 需要将当前目录的 node_modules/.bin 子目录加入 PATH 变量中，在 npm scripts 执行完成后，再将 PATH 变量恢复**。

### npm scripts 使用技巧

这里我们简单讲解两个常见场景，以此介绍 npm scripts 的关键使用技巧。

#### 传递参数

任何命令脚本，都需要进行参数传递。在 npm scripts 中，可以使用--标记参数。比如下面代码：

```sh
$ webpack --profile --json > stats.json
```

另外一种传参的方式是通过 package.json，比如下面代码：

```js
{
// ...
"scripts": {
"build": "webpack --profile --json > stats.json",
}
// ...
}
```

#### 串行/并行执行脚本

在一个项目中，任意 npm scripts 可能彼此之间都有会依赖关系，我们可以通过**&&符号来串行执行脚本**。比如下面代码：

```sh
$ npm run pre.js && npm run post.js
```

如果需要并行执行，可以使用&符号，如下代码：

```sh
npm run scriptA.js & npm run scriptB.js
```

这两种串行/并行执行方式其实是 Bash 的能力，社区里也封装了很多串行/并行执行脚本的公共包供开发者选用，比如：npm-run-all 就是一个常用的例子。

最后的提醒

最后，特别强调两点注意事项。

首先，npm scripts 可以和 git-hooks 相结合，为项目提供更顺畅、自然的能力。比如 pre-commit、husky、lint-staged 这类工具，支持 Git Hooks 各种种类，在必要的 git 操作节点，执行我们的 npm scripts。

同时需要注意的是，我们编写的 npm scripts 应该考虑不同操作系统上兼容性的问题，因为 npm scripts 理论上在任何系统都应该 just work。社区为我们提供了很多跨平台的方案，比如 un-script-os 允许我们针对不同平台进行不同的定制化脚本，如下代码：

```js
{
// ...
    "scripts": {
    // ...
    "test": "run-script-os",
    "test:win32": "echo 'del whatever you want in Windows 32/64'",
    "test:darwin:linux": "echo 'You can combine OS tags and rm all the things!'",
    "test:default": "echo 'This will run on any platform that does not have its own script'"
// ...
},
// ...
}
```

再比如，更加常见的 cross-env，可以为我们自动在不同的平台设置环境变量。

好了，接下来我们从一个实例出发，打造一个 lucas-scripts，实践操作 npm scripts，同时丰富我们的工程化经验。
