### 查看安装位置

rpm -ql nginx

### 常用命令

```shell
##设置开机自启动
systemctl enable nginx
# 启动 nginx 服务
systemctl start nginx
# 停止 nginx 服务
systemctl stop nginx
# 重启Nginx服务
systemctl restart nginx
# 向主进程发送信号，重新加载配置文件，热重启
nginx -s reload
# 重启 Nginx
nginx -s reopen
# 立即停止服务，无论进程是否在工作，都直接停止进程
nginx -s stop
# 等待工作进程处理完成后关闭
nginx -s quit
# 查看当前 Nginx 最终的配置
nginx -T
 # 检查配置是否有问题，如果已经在配置目录，则不需要-c
nginx -t -c <配置路径>
# 查看nginx进程
ps aux | grep nginx
# 查看端口占用情况
netstat -tlnp
```

### nginx.conf 文件解读

nginx.conf 文件是 Nginx 总配置文件
打开 nginx.conf

```shell
vim /etc/nginx/nginx.conf
```

```shell
user  nginx;                        # 运行用户，默认即是nginx，可以不进行设置
worker_processes  1;                # Nginx 进程数，一般设置为和 CPU 核数一样
error_log  /var/log/nginx/error.log warn;   # Nginx 的错误日志存放目录
pid        /var/run/nginx.pid;      # Nginx 服务启动时的 pid 存放位置

events {
    use epoll;     # 使用epoll的I/O模型(如果你不知道Nginx该使用哪种轮询方法，会自动选择一个最适合你操作系统的)
    worker_connections 1024;   # 每个进程允许最大并发数
}

http {   # 配置使用最频繁的部分，代理、缓存、日志定义等绝大多数功能和第三方模块的配置都在这里设置
    # 设置日志模式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;   # Nginx访问日志存放位置

    sendfile            on;   # 开启高效传输模式
    tcp_nopush          on;   # 减少网络报文段的数量
    tcp_nodelay         on;
    keepalive_timeout   65;   # 保持连接的时间，也叫超时时间，单位秒
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;      # 文件扩展名与类型映射表
    default_type        application/octet-stream;   # 默认文件类型

    include /etc/nginx/conf.d/*.conf;   # 加载子配置项

    server {
    	listen       80;       # 配置监听的端口
    	server_name  localhost;    # 配置的域名

    	location / {
    		root   /usr/share/nginx/html;  # 网站根目录
    		index  index.html index.htm;   # 默认首页文件
    		deny 172.168.22.11;   # 禁止访问的ip地址，可以为all
    		allow 172.168.33.44； # 允许访问的ip地址，可以为all
    	}

    	error_page 500 502 503 504 /50x.html;  # 默认50x对应的访问页面, 也可以换成地址
    	error_page 400 404 error.html;   # 同上
    }
}

```

server 块可以包含多个 location 块，location 指令用于匹配 uri，语法：

```shell
location [ = | ~ | ~* | ^~] uri {
...
}
```

1. = 精确匹配路径，用于不含正则表达式的 uri 前，如果匹配成功，不再进行后续的查找；
2. ^~ 用于不含正则表达式的 uri 前，表示如果该符号后面的字符是最佳匹配，采用该规则，不再进行后续的查找；
3. ~ 表示用该符号后面的正则去匹配路径，区分大小写；

```shell
# 禁止访问.php
location ~\.php$ {
        deny all;
    }
```

4. ~\* 表示用该符号后面的正则去匹配路径，不区分大小写。跟 ~ 优先级都比较低，如有多个 location 的正则能匹配的话，则使用正则表达式最长的那个；

如果 uri 包含正则表达式，则必须要有 ~ 或 ~\* 标志

### 配置虚拟主机

##### 基于端口号

```shell
server{
        # 配置端口
        listen 8001;
        server_name localhost;
        root /usr/share/nginx/html/html8001;
        index index.html;
}
```

##### 基于 IP

```shell
server{
        listen 80;
        # 配置 ip
        server_name 112.74.164.244;
        root /usr/share/nginx/html/html8001;
        index index.html;
}
```

##### 基于域名

```shell
server{
        listen 80;
        # 配置 域名
        server_name blog.bianyc.xyz;
        location / {
                root /usr/share/nginx/html/html8001;
                index index.html index.htm;
        }
}
```

### 正向代理

翻墙工具其实就是一个正向代理工具。它会把们访问墙外服务器 server 的网页请求，代理到一个可以访问该网站的代理服务器 proxy，这个代理服务器 proxy 把墙外服务器 server 上的网页内容获取，再转发给客户。
简单来说就是你想访问目标服务器的权限，但是没有权限。这时候代理服务器有权限访问服务器，并且你有访问代理服务器的权限，这时候你就可以通过访问代理服务器，代理服务器访问真实服务器，把内容给你呈现出来。**这里代理的是客户端的请求，代理对用户是非透明的**。

### 反向代理

反向代理跟代理正好相反（需要说明的是，现在基本所有的大型网站的页面都是用了反向代理），客户端发送的请求，想要访问 server 服务器上的内容。发送的内容被发送到代理服务器上，这个代理服务器再把请求发送到自己设置好的内部服务器上，而用户真实想获得的内容就在这些设置好的服务器上。**这里代理的不是客户，而是服务器，代理对用户是透明的，即无感知**

就是代理服务器和真正 server 服务器可以直接互相访问，属于一个 LAN（服务器内网）；代理对用户是透明的，即无感知。不论加不加这个反向代理，用户都是通过相同的请求进行的，且不需要任何额外的操作；代理服务器通过代理内部服务器接受域外客户端的请求，并将请求发送到对应的内部服务器上。

###### 为什么要 Nginx 反向代理

1. 安全及权限。使用反向代理后，用户端将无法直接通过请求访问真正的内容服务器，而必须首先通过 Nginx。可以通过在 Nginx 层上将危险或者没有权限的请求内容过滤掉，从而保证了服务器的安全。
2. 负载均衡。负载均衡就是一个网站的内容被部署在若干服务器上，可以把这些机子看成一个集群，那 Nginx 可以将接收到的客户端请求“均匀地”分配到这个集群中所有的服务器上，从而实现服务器压力的平均分配，也叫负载均衡。

```shell
server{
   listen 80;
   server_name blog.bianyc.xyz;
   location ~^/api/{
       rewrite ^/api/(.*) /$1 break; # 如果不加这一行，访问/api/article == :3030/api/article => / api/article === 3030:/api/
       proxy_pass http://127.0.0.1:3030;
   }
   location ~ ^/admin/{
        proxy_pass http://127.0.0.1:8080;
   }
}
```

### 访问权限控制

```shell
location / {
    deny  192.168.1.100; # 禁止192.168.1.100访问
    allow 192.168.1.10/200; # 允许192.168.1.10-200 ip段内的访问（排除192.168.1.100）
    allow 10.110.50.16; # 允许10.110.50.16这个单独ip的访问，
    deny  all; # 剩下未匹配到的全部禁止访问
}
```

### 跨域

```sh
#请求跨域，这里约定代理请求url path是以/apis/开头
location ^~/apis/ {
    # 这里重写了请求，将正则匹配中的第一个()中$1的path，拼接到真正的请求后面，并用break停止后续匹配
    rewrite ^/apis/(.*)$ /$1 break;
    proxy_pass https://www.kaola.com/;
}
```

### 适配 PC 或移动设备

```sh
# /etc/nginx/conf.d/fe.sherlocked93.club.conf

server {
  listen 80;
	server_name fe.sherlocked93.club;

	location / {
		root  /usr/share/nginx/html/pc;
        if ($http_user_agent ~* '(Android|webOS|iPhone|iPod|BlackBerry)') {
            root /usr/share/nginx/html/mobile;
        }
		index index.html;
	}
}

```

### Gzip

```sh
location ~ .*\. (jpg|png|gif)$ {    
    gzip off; #关闭压缩    
    root /data/www/images;
}
location ~ .*\. (html|js|css)$ {    
    gzip on; #启用压缩    
    gzip_min_length 1k; # 超过1K的文件才压缩    
    gzip_http_version 1.1; # 启用gzip压缩所需的HTTP最低版本
    gzip_comp_level 9; # 压缩级别，压缩比率越高，文件被压缩的体积
    gzip_types text/css application/javascript; # 进行压缩的文件类型    
    root /data/www/html;
}
```

### 防盗链

```shell
location ~ .*\.(jpg|png|gif)$ { # 匹配防盗链资源的文件类型    
    # 通过 valid_referers 定义合法的地址白名单 $invalid_referer 不合法的返回403      
    valid_referers none blocked 127.0.0.1;    
    if ($invalid_referer) {  
        return 403;    
    }
}
```

### react 项目部署

[参考链接](https://juejin.cn/post/6844903640432377863)

1. 打包时可能存在静态资源访问不到的问题，在 package.json 中配置 homePage:'.';或配置 webpack 的 publicPath:'./'
2. BrowerRouter 的 basename = 'admin'

```shell
    server{
        listen 80;
        server_name blog.bianyc.xyz;
        location /admin {
        alias: /usr/share/nginx/html/blog-admin; # 注意，配置的是alias 不是root
        index : index.html
    }
        location ~^/api/{
        proxy_pass http://127.0.0.1:3030;
    }
}
```

### react 项目优化

#### 打包 react 项目 部署到 nginx

1. 关闭 source map

```javascript
process.env.GENERATE_SOURCEMAP = false;
```

1. 打包时可能存在静态资源访问不到的问题，在 package.json 中配置 homePage:'.';或配置 webpack 的 publicPath:'./'
2. 设置 BrowerRouter 的 basename = 'admin'

##### 优化

**全程注意版本匹配**

1. 开启 gzip 压缩
2. cache-loader 缓存 babel-loader
3. external 打包时忽略 cdn 资源
4. HardSourceWebpackPlugin 为模块提供中间缓存，
5. CompressionWebpackPlugin (高版本不匹配，降版本至 1.1.12) 压缩代码
6. splitChuncks 抽取公共代码

## [参考文章](https://juejin.cn/post/6844904093463347208)

```javascript
yarn build
```
