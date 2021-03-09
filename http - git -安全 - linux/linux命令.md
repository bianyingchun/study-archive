### linux 关闭一个进程

1. 查找与进程相关的 PID 号

```shell
ps aux | grep server
```

2.  杀死所有 node 进程
    kill all node

3.  强迫终止进程
    kill -9 pid
    这个强大和危险的命令迫使进程在运行时突然终止，进程在结束后不能自我清理。 危害是导致系统资源无法正常释放，一般不推荐使用，除非其他办法都无效。

4.  以优雅的方式结束进程
    kill -l PID
    当使用该选项时，kill 命令也试图杀死所留下的子进程。但这个命令也不是总能成功–或许仍然需要先手工杀死子进程，然后再杀死父进程


---
默认情况下，MongoDB被配置为自动启动服务器。 如果希望禁用自动启动：

sudo systemctl disable mongodb
再次启用它同样简单：
sudo systemctl enable mongodb
要验证服务的状态：
sudo systemctl status mongodb
停止服务器：
sudo systemctl stop mongodb
启动服务器：
sudo systemctl start mongodb
重新启动服务器：
sudo systemctl restart mongodb

// https://blog.csdn.net/feiyu_may/article/details/82885247 
// 安装配置
https://blog.csdn.net/xingzishuai/article/details/82016141

修改文件属性，使其可执行
chmod +x MongoDB_bak.sh

mongodb 备份 恢复
1. /home/shell/mongod_bak.sh
2. /home/shell/mongod_restore.sh


远程连接
1配置用户
mongo
>use admin
>db.createUser({user:"bianyc7",pwd:"123abc",roles:["root"]})
 2.修改密码
mongo
>use admin
>db.auth('bianyc7', '123abc')
>db.updateUser("bianyc7",{pwd:"gtx@mongo1203"} )

2.修改mongod.conf文件
 配置文件mongod.conf所在路径: /etc/mongod.conf
net:
  port: 27017
  bindIp: 127.0.0.1   #绑定监听的ip 127.0.0.1只能监听本地的连接，可以改为0.0.0.
security:
  authorization: enabled//启用授权

重启MongoDB服务器
service mongod restart
连接
mongo  --port 27017  -u "username" -p "pwd" --authenticationDatabase dbname
mongo  --port 27017  -u bianyc7 -p 123abc --authenticationDatabase admin
问题
1.Linux下使用vi新建文件保存文件时遇到错误：E212: Can't open file for writing ： 在使用命令时，前面加sudo。
2. ubuntu中chkconfig已经被sysv-rc-conf替代，具体如下操作如下：
chkconfig命令：
	[~] chkconfig --add keepalived  
	[~] chkconfig keepalived on  
sysv-rc-conf命令：
	[~] apt-get install sysv-rc-conf
	[~] sysv-rc-conf keepalived on

//定时任务 crontab 注意：ubuntu 中crond 改为cron 
crontab -l #列出crontab文件
crontab -e #添加计划任务
   30 1 * * * root /home/shell/mongod_bak.sh #表示每天凌晨1点30执行备份
service cron reload #重新载入配置
service cron restart   #重新启动服务


vi /var/log/cron.log 查看cron日志

//任务不执行的原因：
1.没有home文件夹的读写权限 
 chmod -R 777 /home 
2.(root) MAIL (mailed 1 byte of output; but got status 0x00ff, #012)
>> /dev/null 2>&1
 3. path变量手动指定，防止命令不存在 
ossutil64=/usr/local/bin/ossutil64

//对外开放端口 // 阿里云需要添加安全组
1.查看已经开启的端口
sudo ufw status
2.打开80端口
sudo ufw allow 80
3.防火墙开启
sudo ufw enable
4.防火墙重启
sudo ufw reload

//Ubuntu sh命令无法正确执行 (修改默认sh为bash)
原来, ubuntu默认的是dash, 需要手动执行命令将dash改为bash.
命令: sudo dpkg-reconfigure dash。
然后出现的界面中选择 NO, 之后就正常啦。

// ossutil64
https://blog.bossma.cn/database/use-ossutil-timed-backup-owner-mysql-to-aliyun-oss/

// bash : xxx command not found 
添加软连接到环境变量
1. which pm2 //得到路径
2. ln -s /usr/nodejs/node-v8.11.3-linux-x64/bin/pm2  /usr/local/bin

//  查看进程
ps -ef|grep node
 