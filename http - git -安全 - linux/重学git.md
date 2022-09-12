## ssh
1. ssh-keygen -t rsa -C "你公司内部邮箱地址"
2. cd ~/.ssh  复制id_rsa.pub
3. 添加id_rsa.pub的内容到git ssh key 

## 设置邮箱账户
```bash 
git config --global user.name "xxx"
git config --global user.email "xxx@xx.com"
```
