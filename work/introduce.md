#### GT TechTree 社区 （PC + 移动端）

技术架构:前端（Vue）+ 后端（NodeJs + Express+ Mongodb + Redis + Pm2）
项目介绍：

1. 该项目是公司正在研发的一款社区产品，包含了用户，标签，评论，通知，排行榜等模块，难点在于逻辑复杂，页面多。我负责后端，前端以及上线的工作，完全独立开发。
2. 实现了基于 JWT & token & refreshToken 的鉴权方案，做到了前后端请求拦截，权限控制，以及 token 过期刷新和登录状态保持。
3. 实现了基于全站缓存的 Vue 路由前进刷新，后退缓存方案，集中式管理路由缓存。
4. 针对白屏时间过长的问题，利用 webpack 对项目进行优化，配置 external 打包时忽略 cdn 资源，通过 splitChuncks 抽取公共代码，HardSourceWebpackPlugin 为模块提供中间缓存，CompressionWebpackPlugin 开启 gzip 压缩，同时在 nginx 中也配置了 gzip。
5. 设计和实现了消息系统，根据消息类型分成提醒、系统公告、私信，用户可配置订阅规则决定哪些消息可以收到。消息的获取方式：提醒和系统公告采取拉取 pull 的方式，私信采取推 push 的方式，目前项目中私信功能暂未开发。
6. 项目中多处需要评论功能，设计和实现了一套评论系统，合并了评论表和回复表，采用树形结构。可以实现对不同主体的评论和回复。
7. 利用 Redis 和 mongodb 实现了排行榜功能，支持不同主体的总榜以及周榜和月榜此类周期榜单，如用户月榜，专辑周榜。核心是利用了 redis 的 Sorted Sets 来保存分数，可以做到自动排序，同时通过 node-schedule 开启定时任务，定期清空 redis，生成榜单写入到 mongodb。
8. 使用 pm2 配合 nginx 实现自动化部署，可以做到性能监控，自动重启，和负载监控，大大简化了部署流程，也便于管理。
9. 编写数据库备份和恢复脚本，利用 crontab 开启定时备份任务，定期将 mongodb 数据库备份到本地和阿里云 OSS，并且可以做到数据库恢复。

#### 少儿社问答系统

技术架构: 前端（Vue）+ 后端（Python + Flask+ + Mysql+ ElasticSearch ）+ 算法（TensorFlow + Bert）
项目介绍：

1. 该项目是为上海少年儿童出版社开发的一套语料收集测试搜索的问答系统，完全独立开发。该项目对我来说是难度非常大的，首先，客户需求不明确，也在探索当中，需要我们给出一套合适的解决方案，其次，最终确定的技术选型对于我也是个挑战，需要去学习完全陌生的算法，且语义化问答本身就是一个难题。

2. 首先要解决的是问句匹配问题，最初是采用模板匹配的方式，穷举每种问题的变形问题，通过贝叶斯分类来匹配问题。这种方式显然是不能解决问题，没办法穷举所有问题的变形，还要考虑语序等对语义的影响，经过一番调研后我最终选择了Bert 这个语言模型，用以计算文本语义相似度。
3. 少儿社希望能够强调编辑人员在系统中的作用，参与整个编辑和审核过程。针对这个需求我设计并实现了人工提取问答对，问答审核及录入，问句语义相似度测试三大模块。不仅提升了编辑效率，也为算法训练提供了足够的语料，建立了问答库。
4. 项目中利用了ElasticSearch 提供搜索功能，返回相关段落及问题。

#### 每周赛博小程序

技术架构:微信小程序 + Redux + immutable.js
项目介绍：

1. 该项目是一款微信小程序，基于对优秀公众号的文章爬取，产出每周优秀文章报告。集成了编辑管理发布，搜索，标签系统，收藏等功能。项目中我主要负责前端的所有开发工作。
2. 引入 Redux (wechat-weapp-redux) 提供全局状态管理，并且使用 immutable.js 提升性能和 redux-thunk 中间件处理异步。
3. 实现了核心组件 vbar，该项目中几乎所有列表页以及文章页都使用到了这个组件。提供侧边导航功能，定制化程度高，滚动位置联动，支持重排序。
4. 实现了树型标签系统前端页面，类似于文件系统，支持路径跳转。

#### 流浪地球点亮行星发动机小程序

技术架构: 微信小程序云开发
项目介绍：

1. 该项目是为 GI 引力创新公司开发的一款微信小程序，用于电影《流浪地球》的宣发工作。我负责所有的开发工作，
2. 项目中最核心的模块是排行榜模块，用户参与游戏后，可查看自己排名，以及前 50 名排名。难点在于排名是实时计算更新的，每次对数据库中所有数据计算排名并重新写入是非常耗时的，高并发场景下可能还会导致排名不一致的情况。我的解决方案是开启一个全局定时器进行轮询，检测到排名需要更新，才去更新排名。计算排名也不是对数据整体排序，而是通过分页查询找到大于当前分数的有 rank 值的第一条记录，根据偏移量计算出排行榜。
3. 遇到的坑是需要利用 web-view 嵌入一段电影宣传内容的 h5 动画，但是小程序无法操控动画转场，最终通过播放 mp4 解决的。

#### 开源项目

个人博客系统
项目架构:前端(Nuxt)+ 后端服务(Nodejs + mongodb + Koa2) + 后台管理系统(React + Ant Design + Typescript)
项目介绍：

1. 该项目使用了 JWT 鉴权方案，通过 Koa2 中间件对请求拦截，前端进行了路由拦截，只有管理员才可以进入后台系统。
2. 封装了上传文件到七牛云模块。
3. 后端集成了 NeteaseCloudMusic nodeJs API，为博客的音乐播放器提供数据支持，通过反向代理请求 Bing 提供壁纸数据。
4. 使用 marked 和 highlight.js 解析 markDown，实现代码高亮，并且自定义 marked 渲染方式，实现点击图片以模态窗方式呈现等功能。
5. 利用 PM2 和 nginx 实现了自动化远程部署。

#### 专业技能

1. 熟练掌握 HTML、CSS、Javascript、 ES6 等基础知识，熟悉各种布局，开发符合 W3C 标准的前端页面

2. 熟练使用 Vue 全家桶、SSR 框架 Nuxt，搭建项目和系统架构、模块化开发。

3. 能够使用 NodeJs+ Express/ koa2 开发后台服务，熟悉 MongoDB 以及 Mysql 数据库的基本操作。

4. 熟悉 React + React-Router + Redux + Hooks 开发工作，使用过 Ant Design 组件库。

5. 掌握 Typescript 的基本使用，并且应用于多个项目的开发中。

6. 熟悉 webpack 打包流程和基本配置。

7. 注重前端性能优化，包括代码层面优化、webpack 层面优化、网络层面优化等。

8. 熟悉 Vue3.0 Composition API，并且使用 Vue3.0 开发过一个完整项目。
9. 掌握 redis 的基本使用
