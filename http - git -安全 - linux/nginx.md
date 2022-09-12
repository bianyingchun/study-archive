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
**正向代理的过程，隐藏了真实的客户端。客户端请求的服务都被代理服务器代替来请求**

### 反向代理

反向代理跟代理正好相反（需要说明的是，现在基本所有的大型网站的页面都是用了反向代理），客户端发送的请求，想要访问 server 服务器上的内容。发送的内容被发送到代理服务器上，这个代理服务器再把请求发送到自己设置好的内部服务器上，而用户真实想获得的内容就在这些设置好的服务器上。**这里代理的不是客户，而是服务器，代理对用户是透明的，即无感知**

就是代理服务器和真正 server 服务器可以直接互相访问，属于一个 LAN（服务器内网）；代理对用户是透明的，即无感知。不论加不加这个反向代理，用户都是通过相同的请求进行的，且不需要任何额外的操作；代理服务器通过代理内部服务器接受域外客户端的请求，并将请求发送到对应的内部服务器上。

**两者的区别在于代理的对象不一样：正向代理代理的对象是客户端，反向代理代理的对象是服务端**

#### 为什么要 Nginx 反向代理

2. 负载均衡。
   负载均衡就是一个网站的内容被部署在若干服务器上，可以把这些机子看成一个集群，那 Nginx 可以将接收到的客户端请求“均匀地”分配到这个集群中所有的服务器上，从而实现服务器压力的平均分配，也叫负载均衡。

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

#### 反向代理解决跨域

···

```sh
#请求跨域，这里约定代理请求url path是以/apis/开头
location ^~/apis/ {
    # 这里重写了请求，将正则匹配中的第一个()中$1的path，拼接到真正的请求后面，并用break停止后续匹配
    rewrite ^/apis/(.*)$ /$1 break;
    proxy_pass https://www.kaola.com/;
}
```

#### 设置 header 解决跨域

```sh
# /etc/nginx/conf.d/be.sherlocked93.club.conf

server {
  listen       80;
  server_name  be.sherlocked93.club;

	add_header 'Access-Control-Allow-Origin' $http_origin;   # 全局变量获得当前请求origin，带cookie的请求不支持*
	add_header 'Access-Control-Allow-Credentials' 'true';    # 为 true 可带上 cookie
	add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';  # 允许请求方法
	add_header 'Access-Control-Allow-Headers' $http_access_control_request_headers;  # 允许请求的 header，可以为 *
	add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';

  if ($request_method = 'OPTIONS') {
		add_header 'Access-Control-Max-Age' 1728000;   # OPTIONS 请求的有效期，在有效期内不用发出另一条预检请求
		add_header 'Content-Type' 'text/plain; charset=utf-8';
		add_header 'Content-Length' 0;

		return 204;                  # 200 也可以
	}

	location / {
		root  /usr/share/nginx/html/be;
		index index.html;
	}
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

### https

```sh
server {
  listen 443 ssl http2 default_server;   # SSL 访问端口号为 443
  server_name sherlocked93.club;         # 填写绑定证书的域名

  ssl_certificate /etc/nginx/https/1_sherlocked93.club_bundle.crt;   # 证书文件地址
  ssl_certificate_key /etc/nginx/https/2_sherlocked93.club.key;      # 私钥文件地址
  ssl_session_timeout 10m;

  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;      #请按照以下协议配置
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
  ssl_prefer_server_ciphers on;

  location / {
    root         /usr/share/nginx/html;
    index        index.html index.htm;
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

## 参考文章

(https://juejin.cn/post/6844904093463347208)

server{
listen 80;
server_name blog.bianyc.xyz;
location /admin{
alias /usr/share/nginx/html/blog-admin;
index index.html;
try_files $uri $uri/ /admin/index.html;
}
location ~^/api/{
proxy_pass http://127.0.0.1:3030;
}
location /{
proxy_pass http://127.0.0.1:8080;
}
}

## alias , root, index, proxy_pass 的区别

### 1.【alias】

**别名配置**，用于访问文件系统，在匹配到 location 配置的 URL 路径后，指向【alias】配置的路径。如：（注意 alias 配置最后一定要有/，而 root 可以没有）

```sh
location /test/
{
alias /home/sftp/img/;
}
```

即：请求/test/1.jpg（省略了协议与域名），将会返回文件/home/sftp/img/1.jpg

### 2. root

**根路径配置**，用于访问文件系统，在匹配到 location 配置的 URL 路径后，指向【root】配置的路径，**并把 location 配置路径附加到其后**。如：

```sh
location /test/
{
root /home/sftp/img/;

}
```

即：请求/test/1.jpg（省略了协议与域名），将会返回文件/home/sftp/img/test/1.jpg，相较于 alias，使用 root 会把/test/附加到根目录之后。

### 3.【proxy_pass】

反向代理配置，用于代理请求，适用于前后端负载分离或多台机器、服务器负载分离的场景，在匹配到 location 配置的 URL 路径后，转发请求到【proxy_pass】配置的 URL，是否会附加 location 配置路径与【proxy_pass】配置的路径后是否有"/"有关，有"/"则不附加，如：

```sh
location /test/
{
proxy_pass http://127.0.0.1:8080/;
}
```

即：请求/test/1.jpg（省略了协议与域名），将会被 nginx 转发请求到http://127.0.0.1:8080/1.jpg（未附加/test/路径）。

```sh
location /test/
{
proxy_pass http://127.0.0.1:8080;
}
```

即：请求/test/1.jpg（省略了协议与域名），将会被 nginx 转发请求到http://127.0.0.1:8080/test/1.jpg（附加/test/路径）。

```sh
location /test/
{
proxy_pass http://127.0.0.1:8080/img;
}
```

即：请求/test/1.jpg（省略了协议与域名），将会被 nginx 转发请求到http://127.0.0.1:8080/img1.jpg（未附加/test/路径，但附加了/test/之后的路径）。

### 4.【index】，一般有这样的配置：

```sh
location / {
　　root html;
　　index index.html index.htm;
}
```

注意，这里的 root 后面没有跟绝对路径，即前面没有/xxx 这种写法，所以它指的是 nginx 根目录下的 html；

即假设请求 http://localhost/test/uu.html 匹配的是这个规则，那么 nginx 会从根据是 root 是得知是访问文件系统（而非访问其他网络，可以理解为此时的 nginx 是正向代理），然后判断 html 前面没有/或者是:这样的用于描述绝对路径的写法，说明这个路径是相对于 nginx 根目录下的 html 目录，所以最终是从 html 里找 test 目录下的 uu.html 文件返回；

这里的 index 是当比如请求 http://localhost 时默认其实在 nginx 里是 http://localhost/index（但是如果客户端这么写则 nginx 会认为是找绝对文件 index 所以会提示找不到），所以这里的 index 其实就是指示当是 index 时优先从 niginx 目录下的 html 目录里找 index.html 返回，没有才找 index.htm 返回；
