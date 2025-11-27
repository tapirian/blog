---
date: 2020-04-24
title: Git 服务器的搭建 
category: Git
tags:
- Git
---

# GIT服务器的搭建
我们进行的步骤是你的服务器已经安装了git的前提下。

## 创建git用户去运行git服务

```bash
$ sudo adduser git
```

## 创建证书登录
收集所有需要登录的用户的公钥，就是他们自己的id_rsa.pub文件，把所有公钥导入到/home/git/.ssh/authorized_keys文件里，一行一个。
证书生成：

```bash
$ ssh-keygen -t rsa -C “15900962242@163.com”
```
三次回车，默认不设置密码

## 初始化Git仓库
先选定一个目录作为Git仓库，假定是/srv/sample.git，在/srv目录下输入命令：

```bash
$ sudo git init --bare sample.git
```
Git就会创建一个裸仓库，裸仓库没有工作区，因为服务器上的Git仓库纯粹是为了共享，所以不让用户直接登录到服务器上去改工作区，并且服务器上的Git仓库通常都以.git结尾。然后，把owner改为git：

```bash
$ sudo chown -R git:git sample.git
```
## 禁止shell登录
出于安全考虑，第二步创建的git用户不允许登录shell，这可以通过编辑/etc/passwd文件完成。找到类似下面的一行：

```bash
git:x:1001:1001:,,,:/home/git:/bin/bash
```
改为：

```bash
git:x:1001:1001:,,,:/home/git:/usr/bin/git-shell
```
这样，git用户可以正常通过ssh使用git，但无法登录shell，因为我们为git用户指定的git-shell每次一登录就自动退出

## 客户端克隆
到自己的电脑上克隆代码。
```bash
$ git clone git@server:/srv/sample.git
```

## GIT设置自动更新钩子
找到git仓库里面的`hooks`文件夹，新建`post-receive`文件，并给git用户授予权限： 

```bash
$ cd /srv/sample.git/hooks
$ touch post-receive
$ chown git:git post-receive
```
### 添加自动更新

```bash
#!/bin/bash
git --work-tree=/home/wwwroot/server_project checkout -f
```
server_project 就是线上项目的地址文件夹，注意这个文件夹git用户要有执行权限。

## 给远端项目库开放git用户的权限

```bash 
cd /home/wwwroot
chown -R git:git server_project
```

## 测试
 1. 在自己的电脑上（客户端）克隆代码

```bash
git clone git@servername:/srv/sample.git
```
2.  将本地仓库和远端关联，并且忽略版本不同造成的影响

```bash
git branch --set-upstream-to=origin/master master
git pull --allow-unrelated-histories 
```
3. 创建一个文件，并提交到远端。然后看看远端有没有自动更新。


## 参考
- https://git-scm.com/book/zh/v2/