# npm 与 yarn 一样么

#### 你在实际的开发会不会出现这样的一些情况

1. 当你项目依赖出现问题的时候, 我们会不会是直接删除 node_modules 和 lockfiles 依赖, 再重新 npm install,删除大法是否真的好用?这样的使用方案会不会带来什么问题？
   不要轻易删除锁文件 lockfiles，这会导致原本的依赖出现版本更新，可能会导致项目崩了。直接 npm install 即可，不好使可以手动重新安装或更新报错的具体依赖，当然有些包需要特定的 node 版本，也需要对应改 node 版本。
2. 把所有的依赖包都安装到 dependencies 中,对 devDependencies 不区分会不会有问题?
   所有依赖装 dependencies 和 devDependencies 得看项目，如果是前端 spa 应用 或者一次性的 ssg 项目可以这样做，但是如果是开后端或者 ssr 以及开库给别人用就需要特别注意到底是通用环境下的依赖 dependencies 还是仅生产环境下的依赖 devDependencies。
3. 一个项目中, 你使用 yarn, 我使用 npm，会不会有问题呢？
   yarn 和 npm 混用在部分特别依赖包管理器的项目中是有问题的，例如 antfu 的 vitesse 需要通过包的锁文件去判断具体用到那个包管理器然后用这个包管理器去自动安装具体的图标集依赖。当然除此之外还有两个包管理器的网络机制以及缓存机制和下载后的依赖分布也不同，如果特别依赖这些的项目也需要注意一下。推荐统一一个包管理器。
4. 还有一个问题, lockfiles 文件 我们提交代码的时候需不需要提交到仓库中呢？
   需要上传 lockfiles 文件到仓库中，因为这个文件主要用来锁默认的依赖版本，最好让别人的依赖和自己的依赖保持统一，这样的错误率最小。
5.

## npm 的安装机制

1. npm install 执行之后, 首先会**检查和获取 npm 的配置**,这里的优先级为:
   项目级的.npmrc 文件 > 用户级的 .npmrc 文件 > 全局级的 .npmrc > npm 内置的 .npmrc 文件
2. 然后**检查项目中是否有 package-lock.json 文件**

   - 如果有, 检查 package-lock.json 和 package.json 声明的依赖是否一致：

     - 一致, 直接使用 package-lock.json 中的信息,从网络或者缓存中加载依赖
     - 不一致, 根据 npm 的不同版本进行处理

       - npm 5.0.x 根据 package-lock.json 下载

       - npm 5.1.0 -npm 5.4.2, 当 package.json 声明的依赖版本规范有符合的更新版本时，会忽略 package-lock.json,按照 package.json 安装，并更新 package-lock.json
       - npm 5.4.2 以上，当 package.json 声明的依赖版本与 package.lock.json 安装版本兼容时，则根据 package.lock.json 安装，否则根据 package.json 安装依赖，并更新 package-lock.json

   - 如果没有, 那么会**根据 package.json 递归构建依赖树,然后就会根据构建好的依赖去下载完整的依赖资源,在下载的时候,会检查有没有相关的资源缓存**:

     - 存在, 直接解压到 node_modules 文件中
     - 不存在, 从 npm 远端仓库下载包,校验包的完整性,同时添加到缓存中,解压到 node_modules 中

3. 最后, **生成 package-lock.json 文件**

### 为什么会有 xxxDependencies?

其实, npm 设计了以下的几种依赖类型声明:

dependencies 项目依赖
devDependencies 开发依赖
peerDependencies 同版本的依赖
bundledDependencies 捆绑依赖
optionalDependencies 可选依赖

它们起到的作用和声明意义是各不相同的。下面我们来具体介绍一下:

- dependencies 表示**项目依赖，这些依赖都会成为你的线上生产环境中的代码组成的部分**。当 它关联到 npm 包被下载的时候, dependencies 下的模块也会作为依赖, 一起被下载。
- devDependencies 表示**开发依赖,** 不会被自动下载的。因为 devDependencies 一般是用于开发阶段起作用或是只能用于开发环境中被用到的。 比如说我们用到的 Webpack，预处理器 babel-loader、scss-loader，测试工具 E2E 等， 这些都相当于是辅助的工具包, 无需在生产环境被使用到的。

  这里有一点还是需要我去啰嗦一下的，并不是只有在 dependencies 中的模块才会被一起打包, 而是在 devDependencies 中的依赖一定不会被打包的。 **实际上, 依赖是否是被打包,完全是取决你的项目里的是否是被引入了该模块。**

- peerDependencies 表示同版本的依赖, 简单一点说就是: 如果你已经安装我了, 那么你最好也安装我对应的依赖。 这里举个小例子: 加入我们需要开发一个 react-ui 就是一个基于 react 开发的 UI 组件库， 它本身是会需要一个宿主环境去运行的, 这个宿主环境还需要指定的 react 版本来搭配使用的， 所以需要我们去 package.json 中去配置:

  ```js
  "peerDependencies": {
      "React": "^17.0.0"
  }
  ```

- bundledDependencies 和 npm pack 打包命令有关。假设我们在 package.json 中有如下的配置:

  ```js
  {
  "name": "test",
  "version": "1.0.0",
  "dependencies": {
      "dep": "^0.0.2",
      ...
  },
  "devDependencies": {
      ...
      "devD1": "^1.0.0"
  },
  "bundledDependencies": [
      "bundleD1",
      "bundleD2"
  ]
  }
  ```

  那我们此时执行 npm pack 的时候, 就会生成一个 test-1.0.0.tgz 的压缩包, 在该压缩包中还包含了 bundleD1 和 bundleD2 两个安装包。 实际使用到 这个压缩包的时候
  npm install test-1.0.0.tgz 的命令时, bundleD1 和 bundleD2 也会被安装的。
  这里其实也有需要注意的是:

  > 在 bundledDependencies 中指定的依赖包, 必须先在 dependencies 和 devDependencies 声明过, 否则 npm pack 阶段是会报错的。

- optionalDependencies 表示可选依赖，就是说当你安装对应的依赖项安装失败了, 也不会对整个安装过程有影响的。一般我们很少会用到它, 这里我是 不建议大家去使用, 可能会增加项目的不确定性和复杂性。

## yarn

当 npm 还处于 v3 时期的时候,一个叫 yarn 的包管理工具横空出世.在 2016 年, npm 还没有 package-lock.json 文件,安装的时候速度很慢,稳定性很差,yarn 的出现很好的解决了一下的一些问题:

1. 确定性: 通过 yarn.lock 等机制,即使是不同的安装顺序,相同的依赖关系在任何的环境和容器中,都可以以相同的方式安装。(那么,此时的 npm v5 之前,并没有 package-lock.json 机制,只有默认并不会使用 npm-shrinkwrap.json)

2. 采用模块扁平化的安装模式: 将不同版本的依赖包,按照一定的策略，归结为单个版本;以避免创建多个版本造成工程的冗余(目前版本的 npm 也有相同的优化)

3. 网络性能更好: yarn 采用了请求排队的理念,类似于并发池连接,能够更好的利用网络资源;同时也引入了一种安装失败的重试机制

4. 采用缓存机制,实现了离线模式 (目前的 npm 也有类似的实现)

### 安装机制

1. 检测包
   这一步，最主要的目的就是**检测我们的项目中是否存在 npm 相关的文件**,比如 package-lock.json 等;如果有,就会有相关的提示用户注意：这些文件可能会存在冲突。在这一步骤中 也会检测系统 OS, CPU 等信息。
2. 解析包
   这一步会**解析依赖树中的每一个包的信息**:
   首先呢,获取到首层依赖: 也就是我们当前所处的项目中的 package.json 定义的 dependencies、devDependencies、optionalDependencies 的内容。
   紧接着会采用**遍历首层依赖的方式来获取包的依赖信息,以及递归查找每个依赖下嵌套依赖的版本信息，并将解析过的包和正在进行解析包呢用 Set 数据结构进行存储,这样就可以保证同一版本范围内的包不会进行重复的解析**:

   举个例子

   - 对于没有解析过的包 A, 首次尝试从 yarn.lock 中获取版本信息,并且标记为已解析
   - 如果在 yarn.lock 中没有找到包 A， 则向 Registry 发起请求获取满足版本范围内的已知的最高版本的包信息,获取之后将该包标记为已解析。

总之，经过解析包这一步之后呢,我们就已经**确定了解析包的具体版本信息和包的下载地址**。

3. 获取包
   1. 创建缓存目录
   2. 解析下载地址
   3. 判断是否为本地资源
      - 是本地资源，从本地加载资源
      - 不是本地资源，从外部获取资源
   4. 写入缓存目录
   5. 更新 lockfiles
4. 链接包
   1. 解析 peerDependencies，
      - 有冲突，warning
   2. 扁平化依赖树
   3. 执行拷贝任务
   4. 拷贝到 项目目录的 node modules
5. 构建包
   如果依赖包中存在二进制包需要进行编译，那么会在这一步进行。

## 实践建议

下面我会给出具体的实操的建议, 供大家来参考：

1. 优先去使用 npm 官方已经稳定的支持的版本, 以保证 npm 的最基本先进性和稳定性

2. 当我们的项目第一次去搭建的时候, 使用 npm install 安装依赖包, 并去提交 package.json、package-lock.json, 至于 node_moduled 目录是不用提交的。

3. 当我们作为项目的新成员的时候, checkout/clone 项目的时候, 执行一次 npm install 去安装依赖包。

4. 当我们出现了需要升级依赖的需求的时候:

- 升级小版本的时候, 依靠 npm update
- 升级大版本的时候, 依靠 **npm install@ **
- 当然我们也有一种方法, 直接去修改 package.json 中的版本号, 并去执行 npm install 去升级版本
- 当我们本地升级新版本后确认没有问题之后, 去提交新的 package.json 和 **package-lock.json **文件。

5. 对于降级的依赖包的需求： 我们去执行 npm install @ 命令后，验证没有问题之后, 是需要提交新的 package.json 和 package-lock.json 文件。

6. 删除某些依赖的时候:

- 当我们执行 npm uninstall 命令后， 需要去验证，提交新的 package.json 和 package-lock.json 文件。
- 或者是更加暴力一点, 直接操作 package.json, 删除对应的依赖, 执行 npm install 命令, 需要去验证，提交新的 package.json 和 package-lock.json 文件。

7. 当你把更新后的 package.json 和 package-lock.json 提交到代码仓库的时候, 需要通知你的团队成员, 保证其他的团队成员拉取代码之后, 更新依赖可以有一个更友好的开发环境保障持续性的开发工作。

8. 任何时候我们都不要去修改 package-lock.json，这是交过智商税的。

9. 如果你的 package-lock.json 出现冲突或问题, 我的建议是将本地的 package-lock.json 文件删掉, 然后去找远端没有冲突的 package.json 和 package-lock.json, 再去执行 npm install 命令。
