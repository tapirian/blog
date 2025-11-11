---
date: 2025-05-08
title: 使用Docker运行Nginx 
category: Nginx
tags:
- Nginx 
---
# 使用Docker运行Nginx

## 官方nginx-docker

dockerhub: https://hub.docker.com/_/nginx

github: https://github.com/nginx/docker-nginx


## 安装运行Nginx
首先你得需要安装Docker，此步骤省略。
### 1、从docker hub拉取最新的nginx镜像
```bash
docker pull nginx:latest
```

### 2、将nginx镜像中的配置文件复制到本地（方便做数据卷）
```bash
docker run --rm --entrypoint=cat nginx /etc/nginx/nginx.conf > D:\nginx-demo\conf\nginx.conf
```

> 这里的参数`--rm`表示执行完之后删除容器。

或者我们可以通过使用`docker cp`命令复制整个nginx配置文件夹到本地，已备运行容器做数据卷。`docker cp`命令不能从镜像拷贝文件，只能从容器拷贝，所以需要创建一个临时容器。
```bash
# 创建临时容器
docker create --name tmp nginx
# 拷贝文件
docker cp tmp:/etc/nginx/ D:\nginx-demo\etc
# 删除临时容器
docker rm tmp
```
注意，使用`docker cp`命令拷贝文件夹中的内容：
- 如果宿主机的文件夹**不存在**，则会新建文件夹，并将源文件夹`/etc/nginx/`下的所有文件拷贝到目标文件夹`D:\nginx-demo\etc`，不包括源文件夹本身`/nginx`。最终结果：`D\nginx-demo\etc\nignx.d\...`
- 如果宿主机文件夹**存在**，则会包括源文件夹本身，即`/nginx`，最终结果：`D:\nginx-demo\etc\nginx\nginx.d\...`

### 3、运行nginx容器
```bash
docker run --name nginx-demo \
-v D:\nginx-demo\conf\nginx.conf:/etc/nginx/nginx.conf:ro \
-v D:\nginx-demo\html:/usr/share/nginx/html:ro -dp 8080:80 nginx
```

### 4、测试
- 1、查看本机对应目录有没有相关文件（`D:\nginx-demo\`）
- 2、本机打开浏览器，输入：`http://127.0.0.1:8080`, 试试是否可以访问。
## 安装运行OpenResty
OpenResty是一个基于Nginx的动态Web平台，集成了很多Nginx扩展。

网址: https://openresty.org/

### 1、获取镜像
```bash
docker pull openresty/openresty:alpine
```

### 2、运行
```bash
docker run --name openrestry-demo -v D:\nginx-demo\etc:/etc/nginx:ro -v D:\nginx-demo\html:/usr/share/nginx/html:ro -dp 8080:80 openresty/openresty:alpine
```