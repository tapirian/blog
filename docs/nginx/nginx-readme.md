# Nginx 简介

## 主要用途和特点
Nginx是一个高性能 Web 服务器 / 反向代理服务器 / 邮件代理服务器。主要特点是高并发、高稳定、占用内存少。因为其轻量和强大的扩展能力，成为世界上最流行的Web服务器之一。
主要用途有:
| 场景               | 说明                                         |
| ---------------- | ------------------------------------------ |
| **静态资源服务**       | 直接高效地返回 HTML/CSS/JS/图片等静态文件                |
| **反向代理**         | 接收客户端请求，转发到后端服务（Tomcat、Node.js、Go、Python…） |
| **负载均衡**         | 多台后端服务器之间自动分配流量（支持轮询、权重、最少连接等策略）           |
| **SSL/TLS 终结**   | 在 Nginx 终结 HTTPS，后端走 HTTP，减轻后端压力           |
| **缓存**           | 缓存静态或动态页面，加快响应速度                           |
| **限流/防盗链**       | 控制流量、按 IP 限制、按 Referer 限制等                 |
| **WebSocket 支持** | 可以反代 WebSocket 服务                          |
| **邮件代理**         | 支持 IMAP/POP3/SMTP 代理                       |



## 工作原理

* **事件驱动（异步非阻塞 I/O）**
  每个 worker 进程用 epoll/kqueue 等机制同时处理成千上万个连接，不需要像传统服务器（Apache prefork）那样为每个连接开线程或进程。

* **多进程模型**

  * 一个 **master** 进程：负责加载/管理配置、监听信号
  * 多个 **worker** 进程：真正处理网络请求（数量一般 = CPU 核心数）

* **零拷贝（sendfile）**
  直接在内核态把文件发送到 socket，减少内存拷贝开销。

---

## 配置文件结构
Nginx的配置文件使用的是一门微型编程语言，且Nginx的运行过程是声明式的，而不是过程式的。这与传统的编程语言有很大差异。Nginx内部自有一套配置指令的执行顺序。

Nginx 的配置文件一般在 `/etc/nginx/nginx.conf` 或 `/usr/local/nginx/conf/nginx.conf`

基本结构：

```nginx
# 全局块（进程数、日志等）
worker_processes auto;

events {
    worker_connections 1024; # 每个 worker 最大连接数
}

http {
    # 全局 http 配置（mime-type、日志、gzip、缓存等）

    server {
        listen 80;                # 监听端口
        server_name example.com;  # 站点域名

        location / {
            root /var/www/html;   # 静态文件目录
            index index.html;
        }

        location /api/ {
            proxy_pass http://127.0.0.1:3000;  # 反向代理
        }
    }
}
```

核心概念：

* **http{}**：HTTP 服务器全局配置块
* **server{}**：一个虚拟主机
* **location{}**：匹配 URI 的块，可以对不同路径设置不同策略

---

## 常见模块

### 内置模块

* **核心模块**：HTTP 核心、事件、配置解析
* **HTTP 模块**：静态文件服务、gzip、access_log、rewrite、proxy、fastcgi、uwsgi、scgi、memcached
* **Stream 模块**（TCP/UDP 代理）：反代 MySQL、Redis 等
* **Mail 模块**：IMAP/POP3/SMTP 代理

### 第三方模块（可编译进 Nginx）

* `ngx_http_echo_module`（echo 输出）
* `ngx_http_lua_module`（嵌入 Lua 脚本）
* `ngx_pagespeed`（Google 出品，自动优化页面资源）
* `nginx-rtmp-module`（推流/拉流直播）

---