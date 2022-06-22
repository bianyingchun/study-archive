### CI 环境上的 npm 优化

CI 环境下的 npm 配置和开发者本地 npm 操作有些许不同，接下来我们一起看看 CI 环境上的 npm 相关优化。

合理使用 npm ci 和 npm install
顾名思义，npm ci 就是专门为 CI 环境准备的安装命令，相比 npm install 它的不同之处在于：

1. npm ci 要求项目中必须存在 package-lock.json 或 npm-shrinkwrap.json；

2. npm ci 完全根据 package-lock.json 安装依赖，这可以保证整个开发团队都使用版本完全一致的依赖；

3. 正因为 npm ci 完全根据 package-lock.json 安装依赖，在安装过程中，它不需要计算求解依赖满足问题、构造依赖树，因此安装过程会更加迅速；

4. npm ci 在执行安装时，会先删除项目中现有的 node_modules，然后全新安装；

5. npm ci 只能一次安装整个项目所有依赖包，无法安装单个依赖包；

6. 如果 package-lock.json 和 package.json 冲突，那么 npm ci 会直接报错，并非更新 lockfiles；

7. npm ci 永远不会改变 package.json 和 package-lock.json。

#### 使用 package-lock.json 优化依赖安装时间

上面提到过，对于应用项目，建议上传 package-lock.json 到仓库中，以保证依赖安装的一致性。事实上，如果项目中使用了 package-lock.json 一般还可以显著加速依赖安装时间。这是因为 package-lock.json 中已经缓存了每个包的具体版本和下载链接，你不需要再去远程仓库进行查询，即可直接进入文件完整性校验环节，减少了大量网络请求。

### 更多工程化相关问题解析

下面这部分，我将通过剖析几个问题，来加深你对这几讲学习概念的理解，以及对工程化中可能遇到的问题进行预演。

为什么要 lockfiles，要不要提交 lockfiles 到仓库？
从 npm v5 版本开始，增加了 package-lock.json 文件。我们知道 package-lock.json 文件的作用是锁定依赖安装结构，目的是保证在任意机器上执行 npm install 都会得到完全相同的 node_modules 安装结果。

你需要明确，为什么单一的 package.json 不能确定唯一的依赖树：

不同版本的 npm 的安装依赖策略和算法不同；

npm install 将根据 package.json 中的 semver-range version 更新依赖，某些依赖项自上次安装以来，可能已发布了新版本。

因此，保证能够完整准确地还原项目依赖，就是 lockfiles 出现的原因。

首先我们了解一下 package-lock.json 的作用机制。

一个 package-lock.json 的 dependency 主要由以下部分构成。

1. Version：依赖包的版本号

2. Resolved：依赖包安装源（可简单理解为下载地址）

3. Integrity：表明包完整性的 Hash 值

4. Dev：表示该模块是否为顶级模块的开发依赖或者是一个的传递依赖关系

5. requires：依赖包所需要的所有依赖项，对应依赖包 package.json 里 dependencies 中的依赖项

6. dependencies：依赖包 node_modules 中依赖的包（特殊情况下才存在）

事实上，并不是所有的子依赖都有 dependencies 属性，只有子依赖的依赖和当前已安装在根目录的 node_modules 中的依赖冲突之后，才会有这个属性。这就涉及嵌套情况的依赖管理，我已经在前文做了说明。

至于要不要提交 lockfiles 到仓库？这就需要看项目定位决定了。

如果开发一个应用，我建议把 package-lock.json 文件提交到代码版本仓库。这样可以保证项目组成员、运维部署成员或者 CI 系统，在执行 npm install 后，能得到完全一致的依赖安装内容。

如果你的目标是开发一个给外部使用的库，那就要谨慎考虑了，因为库项目一般是被其他项目依赖的，在不使用 package-lock.json 的情况下，就可以复用主项目已经加载过的包，减少依赖重复和体积。

如果我们开发的库依赖了一个精确版本号的模块，那么提交 lockfiles 到仓库可能会造成同一个依赖不同版本都被下载的情况。如果作为库开发者，真的有使用某个特定版本依赖的需要，一个更好的方式是定义 peerDependencies。

因此，一个推荐的做法是：把 package-lock.json 一起提交到代码库中，不需要 ignore。但是执行 npm publish 命令，发布一个库的时候，它应该被忽略而不是直接发布出去。

### 最佳实操建议

前面我们讲了很多 npm 的原理和设计理念，理解了这些内容，你应该能总结出一个适用于团队的最佳实操建议。对于实操我有以下想法，供你参考。

1. 优先使用 npm v5.4.2 以上的 npm 版本，以保证 npm 的最基本先进性和稳定性。

2. 项目的第一次搭建使用 npm install 安装依赖包，并提交 package.json、package-lock.json，而不提交 node_modules 目录。

3. 其他项目成员首次 checkout/clone 项目代码后，执行一次 npm install 安装依赖包。

4. 对于升级依赖包的需求：

- 依靠 npm update 命令升级到新的小版本；

- 依靠 npm install @ 升级大版本；

- 也可以手动修改 package.json 中版本号，并执行 npm install 来升级版本；

  - 本地验证升级后新版本无问题，提交新的 package.json、package-lock.json 文件。

5. 对于降级依赖包的需求：执行 npm install @ 命令，验证没问题后，提交新的 package.json、package-lock.json 文件。

6. 删除某些依赖：

执行 npm uninstall 命令，验证没问题后，提交新的 package.json、package-lock.json 文件；

或者手动操作 package.json，删除依赖，执行 npm install 命令，验证没问题后，提交新的 package.json、package-lock.json 文件。

7. 任何团队成员提交 package.json、package-lock.json 更新后，其他成员应该拉取代码后，执行 npm install 更新依赖。

8. 任何时候都不要修改 package-lock.json。

9. 如果 package-lock.json 出现冲突或问题，建议将本地的 package-lock.json 文件删除，引入远程的 package-lock.json 文件和 package.json，再执行 npm install 命令。
