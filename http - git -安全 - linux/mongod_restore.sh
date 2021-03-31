#!/bin/sh
# RESTORE 命令执行路径，根据mongodb安装路径而定
read -p "please input dir name:" dir
RESTORE=/usr/bin/mongorestore
# 临时备份路径
OUT_DIR=/home/backup/mongod_bak/mongod_bak_now/
# 数据库账号
DB_USER=bianyc7
# 数据库密码
DB_PASS=123abc
# 数据库名称
DB_NAME=techtree
$RESTORE -h  127.0.0.1:27017 -u $DB_USER -p $DB_PASS -d $DB_NAME  --authenticationDatabase "admin" --dir $OUT_DIR/$dir/$DB_NAME/ --drop
