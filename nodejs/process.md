[Nodejs 入门：process 模块](https://zhuanlan.zhihu.com/p/151447683)

### 概述

process 是 node 的全局模块，作用比较直观。可以通过它来获得 node 进程相关的信息，比如运行 node 程序时的命令行参数。或者设置进程相关信息，比如设置环境变量。

### 常用

1. process.env.NODE_ENV //服务运行的环境
2. process.nexTick
3. process.argv // 命令行参数
4. process.cwd()：返回当前工作路径
5. process.chdir(directory)：切换当前工作路径
   process 模块

Node.js 中的进程 Process 是一个全局对象，无需 require 直接使用，给我们提供了当前进程中的相关信息。官方文档提供了详细的说明，感兴趣的可以亲自实践下 Process 文档。

process.env：环境变量，例如通过 process.env.NODE_ENV 获取不同环境项目配置信息
process.nextTick：这个在谈及 Event Loop 时经常为会提到
process.pid：获取当前进程 id
process.ppid：当前进程对应的父进程
process.cwd()：获取当前进程工作目录，
process.platform：获取当前进程运行的操作系统平台
process.uptime()：当前进程已运行时间，例如：pm2 守护进程的 uptime 值
进程事件：
process.on(‘uncaughtException’, cb) 捕获异常信息、
process.on(‘exit’, cb）进程推出监听
三个标准流：
process.stdout 标准输出、
process.stdin 标准输入、
process.stderr 标准错误输出
process.title 指定进程名称，有的时候需要给进程指定一个名称
