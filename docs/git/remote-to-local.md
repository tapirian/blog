# 如何将远程的项目关联到本地

如果远程存在Git代码仓库， 如何关联到本地呢？我们这里用github仓库做示例，分情景来处理一下。 

## 情景一：本地没有项目文件

直接在本地合适的目录下`git clone`克隆仓库
```bash
git clone git@github.com:tapirian/xxxxx.git
```

## 情景二: 本地有项目文件，但是没有本地仓库
1. 先在本地初始化仓库
2. 提交你的项目文件
3. 将分支重命名为你要推送的分支名称（主分支，一般为Master）
4. 添加远程仓库为本地的仓库源
5. 将本地分支推送到远端，并关联到远程同名
```bash
echo "# ai-prompt" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M master
git remote add origin git@github.com:tapirian/xxxxx.git
git push -u origin master
```
> 注意： `git branch -M master` 表示强制重命名当前分支为master分支，即使master分支存在也会覆盖；`git branch -m master`表示如果master分支存在，会报错。

## 情景三：本地有项目文件且有git本地仓库
1. 将分支重命名（或切换到）你要推送的分支名称（主分支，一般为Master）
2. 添加远程仓库为本地的仓库源
3. 将本地分支推送到远端，并关联到远程

```bash
git remote add origin git@github.com:tapirian/xxxxx.git
git branch -M master
git push -u origin master
``` 
> `git push -u origin master`表示把你当前分支（master）的代码推送到远程仓库的 master 分支；建立本地的 master 分支和远程的 origin/master 分支的追踪关系。

## 情景四：本地存在远程仓库源，需要更换远程仓库源
方法一： 删除旧远程并添加新的
```bash
git remote remove origin
git remote add origin https://github.com/tapirian/xxxxx.git
```

方法二： 直接更新（没修改默认远程名为origin）
```bash
git remote set-url origin https://github.com/tapirian/xxxxx.git
```

> 备注： 可以通过 `git remote -v` 来查看当前的远程地址

