## 微信小程序1
- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
小程序·云开发
小程序·云开发是微信团队联合腾讯云推出的专业的小程序开发服务。
开发者可以使用云开发快速开发小程序、小游戏、公众号网页等，并且原生打通微信开放能力。
开发者无需搭建服务器，可免鉴权直接使用平台提供的 API 进行业务开发。

####  GI 引力创新 流浪地球宣发 点亮行星发动机 云开发

#### 游戏规则
 在所有点亮一万座行星发动机的玩家中，将抽取50名幸运玩家获得由引力创新提供的《流浪地球》官方授权行星发动机AR模型一个，或《流浪地球》电影票一张。在游戏中每点击一次点亮按钮可点亮十座行星发动机；每一位助力的好友可以协助点亮一百座行星发动机。
#### 需求介绍
1. 小程序入口处嵌入webview h5 页面
2. 点击地图从而点亮地图
3. 动态生成排行榜， 显示当前100 排名，和当前用户自己的排名
4. 分享小程序到不同的群或朋友圈，增加游戏机会

#### 小程序相关api
1. 程序生命周期 app.js 
https://developers.weixin.qq.com/miniprogram/dev/reference/api/App.html
App(Object object)
注册小程序。接受一个 Object 参数，其指定小程序的生命周期回调等。

App() 必须在 app.js 中调用，必须调用且只能调用一次。不然会出现无法预期的后果。

onLaunch	function		否	生命周期回调——监听小程序初始化。	
onShow	function		否	生命周期回调——监听小程序启动或切前台。	
onHide	function		否	生命周期回调——监听小程序切后台。	
onError	function		否	错误监听函数。	
onPageNotFound	function		否	页面不存在监听函数。	1.9.90
onUnhandledRejection	function		否	未处理的 Promise 拒绝事件监听函数。	2.10.0
onThemeChange	function		否	监听系统主题变化

2. 页面生命周期
https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html
Page({}) onLoad -> onShow->onReady
```javascript
  onLoad: function(options) {
    // 页面创建时执行
  },
  onShow: function() {
    // 页面出现在前台时执行
  },
  onReady: function() {
    // 页面首次渲染完毕时执行
  },
  onHide: function() {
    // 页面从前台变为后台时执行
  },
  onUnload: function() {
    // 页面销毁时执行
  },
  onPullDownRefresh: function() {
    // 触发下拉刷新时执行
  },
  onReachBottom: function() {
    // 页面触底时执行
  },
  onShareAppMessage: function () {
    // 页面被用户分享时执行
  },
  onPageScroll: function() {
    // 页面滚动时执行
  },
  onResize: function() {
    // 页面尺寸变化时执行
  },

```
3. 注册components
json文件中的usingComponents选项

### 全局数据 globalData
rank_changed: 排名是否更新
openid:当前登录用户(每个用户在不同小程序的openid是不同的，但在同一个小程序中始终相同)
current_user_record:当前用户的游戏记录
top_rank_list : top50 排行榜

## 页面
### index 首页
webview 中嵌入入口h5页面
1. onLoad() 调用云函数login 获得用户openid
2. 调用dbms.get_record(openid) 查找当前用户是否有游戏记录，有则更新globalData.current_user_record,跳转到结果页result，

### entry 游戏入口页
<button class='nav_btn' open-type="getUserInfo" 
      bindgetuserinfo="onGetUserInfo" plain="true">
      我要点亮行星发动机
</button>
点击按钮， 授权获得用户信息后转向游戏页 game

### game 游戏页
#### 页面布局
1. 发动机地图，底部是一个bg-image，上层是一个canvas 负责绘制点亮的行星点
2. 进度条
显示倒计时
3. 成绩
  + 点亮的数目
  + 灯光 opacity表示亮度 点击的行星发送机越多越量
4. 游戏按钮
点击数表示点亮的行星发动机数目


#### 逻辑
```javascript
// 页面创建时
onLoad: function() {
  this.mask = []; // 
  this.init_userinfo(); //初始化用户信息
  this.init_mask();// 初始化canvas
  this.init_game(); // 初始化游戏状态 gameover gamestart
},
// 页面出现在前台时播放音乐
onShow(){
  this.play_bg_music();
},
// 页面从前台变为后台时或者退出时停止音乐
onHide() {
  this.stop_music()
},
onUnload() {
  this.stop_music()
},
```

用户点击游戏按钮时，setInterval开启定时器，每隔一秒，更新剩余时间，并随着用户点击重绘canvas，显示已经点亮的行星发动机。在时间用尽后，dbms.save_record 保存用户记录，更新rank_changed， current_user_record，top_rank_list。跳转到结果页result.



### invite 邀请页

