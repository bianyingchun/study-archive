//

//同时绑定touchstart touchend touchmove tap事件，触碰立即弹起会先执行start->end->tap;为了区分touch和tap事件，可以在end时判断是否有move标志。
### cybo
#### 技术栈
微信小程序
redux
immutable

### 介绍
每周cybo 报告。管理员可编辑发布cybo,查看切换监听的公众号，搜索公众号，文章，将公众号里的文章发布到cybo, 用户卡查看cybo 列表， 访问文章。
#### 页面
1. cybo-list
 所有期的cybo列表， 1. 编辑，删除，添加，查找

1. 标签系统
  管理员对标签增删改查，为cybo, 公号，文章添加标签。在非编辑模式下可查看该标签下的所有文章

3. 公号列表
  1. 监听公号
  2. 编辑公号
  3. 添加公号
  3. 搜索公号列表结果
  4. 查看公号文章
 
5. 用户登录退出

6. cybo-detail
  赛博详情，cybo 文章列表

### 核心组件vbar-box， 
所有列表页以及文章页都使用到了这个组件
**布局组件**，类似于通讯录，主体部分是列表页或者文章，右侧是导航条vbar，
**定制化**，不同的页面导航项显示内容，样式有细微不一致，可以传入setting需要定制化，
**同步更新**，页面滚动或者列表项更新，vbar也是要同步更新当前导航项的位置， 滑动vbar， 页面也要滚动到对应位置。
**重排序** ,可倒序或正序，

核心: 监听list的变化，nextTick 主体和导航条都重新计算位置，同步更新位置。

#### 遇到的坑
1. redux
  + 引入redux
    微信小程序文档中没有介绍如何引入第三方的包,需要自己修改，第三方库的代码使用这种形式的export : module.exports = function(){}，可以自己打包一个Redux包，让它可以兼容微信小城的加载方式，或者直接使用修改好的库 https://github.com/charleyw/wechat-weapp-redux

  + 调试redux :wechat-weapp-redux-todos

  + 使用redux时onLoad生命周期被重写，
   自定义after_onload()函数,在redux的onload方法最后执行

