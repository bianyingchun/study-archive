默认情况下，MongoDB 被配置为自动启动服务器。 如果希望禁用自动启动：

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
1 配置用户
mongo

> use admin
> db.createUser({user:"bianyc7",pwd:"123abc",roles:["root"]}) 2.修改密码
> mongo
> use admin
> db.auth('bianyc7', '123abc')
> db.updateUser("bianyc7",{pwd:"gtx@mongo1203"} )

2.修改 mongod.conf 文件
配置文件 mongod.conf 所在路径: /etc/mongod.conf
net:
port: 27017
bindIp: 127.0.0.1 #绑定监听的 ip 127.0.0.1 只能监听本地的连接，可以改为 0.0.0.
security:
authorization: enabled//启用授权

重启 MongoDB 服务器
service mongod restart
连接
mongo  --port 27017  -u "username" -p "pwd" --authenticationDatabase dbname
mongo  --port 27017  -u bianyc7 -p daisygot7 --authenticationDatabase admin
问题
1.Linux 下使用 vi 新建文件保存文件时遇到错误：E212: Can't open file for writing ： 在使用命令时，前面加 sudo。 2. ubuntu 中 chkconfig 已经被 sysv-rc-conf 替代，具体如下操作如下：
chkconfig 命令：
[~] chkconfig --add keepalived  
 [~] chkconfig keepalived on  
sysv-rc-conf 命令：
[~] apt-get install sysv-rc-conf
[~] sysv-rc-conf keepalived on

//定时任务 crontab 注意：ubuntu 中 crond 改为 cron
crontab -l #列出 crontab 文件
crontab -e #添加计划任务
30 1 \* \* \* root /home/shell/mongod_bak.sh #表示每天凌晨 1 点 30 执行备份
service cron reload #重新载入配置
service cron restart #重新启动服务

vi /var/log/cron.log 查看 cron 日志

//任务不执行的原因： 1.没有 home 文件夹的读写权限
chmod -R 777 /home
2.(root) MAIL (mailed 1 byte of output; but got status 0x00ff, #012)

> > /dev/null 2>&1 3. path 变量手动指定，防止命令不存在
> > ossutil64=/usr/local/bin/ossutil64

//对外开放端口 // 阿里云需要添加安全组 1.查看已经开启的端口
sudo ufw status 2.打开 80 端口
sudo ufw allow 80 3.防火墙开启
sudo ufw enable 4.防火墙重启
sudo ufw reload

//Ubuntu sh 命令无法正确执行 (修改默认 sh 为 bash)
原来, ubuntu 默认的是 dash, 需要手动执行命令将 dash 改为 bash.
命令: sudo dpkg-reconfigure dash。
然后出现的界面中选择 NO, 之后就正常啦。

// ossutil64
https://blog.bossma.cn/database/use-ossutil-timed-backup-owner-mysql-to-aliyun-oss/

// bash : xxx command not found
添加软连接到环境变量

1. which pm2 //得到路径
2. ln -s /usr/nodejs/node-v8.11.3-linux-x64/bin/pm2 /usr/local/bin

### 查看 node 进程

ps -ef|grep node

ps -ef|grep node
ps -ef|grep

ps -ef|grep node
