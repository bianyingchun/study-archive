1. HEAD
   在 Git 中，用 HEAD 表示当前版本，也就是最新的提交 1094adb...（注意我的提交 ID 和你的肯定不一样），上一个版本就是 HEAD^，上上一个版本就是 HEAD^^，当然往上 100 个版本写 100 个^比较容易数不过来，所以写成 HEAD~100。

2. $ git reset --hard commitID
   回退版本
3. git checkout -- file
   撤销工作区的修改

4. git reset HEAD <file>
   撤销暂存区的修改

5. git reflog
   要重返未来，用 git reflog 查看命令历史，以便确定要回到未来的哪个版本。
6. git add
   文件修改添加到暂存区
7. git commit
   把暂存区的所有内容提交到当前分支
8. git diff
   工作区(work dict)和暂存区(stage)的比较（--cached 暂存）
   - git diff 不加参数即默认比较工作区与暂存区
   - git diff --cached [<path>...]比较暂存区与最新本地版本库（本地库中最近一次 commit 的内容）
   - git diff HEAD [<path>...]比较工作区与最新本地版本库。如果 HEAD 指向的是 master 分支，那么 HEAD 还可以换成 master
   - git diff commit-id [<path>...]比较工作区与指定 commit-id 的差异
   - git diff --cached [<commit-id>] [<path>...]比较暂存区与指定 commit-id 的差异
   - git diff [<commit-id>] [<commit-id>]比较两个 commit-id 之间的差异
9. git rm <file>
   将文件从暂存区和工作区中删除
10. git rm --cached <file>
    文件从暂存区域移除，但仍然希望保留在当前工作目录中

11. git remote add origin git@server-name:path/repo-name.git

---

### 分支

1. 查看分支：git branch

2. 创建分支：git branch <name>

3. 切换分支：git checkout <name>或者 git switch <name>

4. 创建+切换分支：git checkout -b <name>或者 git switch -c <name>

5. 合并某分支到当前分支：git merge <name>

6. 删除分支：git branch -d <name>

7. 当 Git 无法自动合并分支时，就必须首先解决冲突。解决冲突后，再提交，合并完成。

解决冲突就是把 Git 合并失败的文件手动编辑为我们希望的内容，再提交。

用 git log --graph 命令可以看到分支合并图

https://blog.csdn.net/asoar/article/details/84111841
