## 如何做到修改 node_module 中的包，却不受重新安装的影响

1. yarn add patch-package postinstall-postinstall -d

2. package.json 添加脚本命令：

```js
    "scripts": {
 "postinstall": "patch-package"
 }
```

3. 修改源码

4. 运行命令 yarn patch-package package-name 生成补丁

5. 删除 node_module 并重新安装后可以发现补丁被应用
