---
date: 2022-01-22
title: Node.js之创建TCP服务器端
category: Nodejs 
tags:
- Nodejs 
- 网络通信
---

# Node.js之创建TCP服务器端
## 什么是TCP
TCP全名为传输控制协议，在OSI七层模型（物理层、数据链路层、网络层、传输层、会话层、表示层、应用层）中属于传输层协议。
| 层级 (Layer)       | 名称 (Name)           | 功能简述                           | 常见协议 (Examples)                  |
|-------------------|---------------------|----------------------------------|-----------------------------------|
| 7                 | 应用层 (Application) | 为用户提供应用服务，直接与软件交互 | HTTP, HTTPS, FTP, SMTP, DNS, Telnet |
| 6                 | 表示层 (Presentation)| 数据格式转换、加密、压缩           | SSL/TLS, JPEG, MPEG, ASCII         |
| 5                 | 会话层 (Session)     | 建立、管理和终止会话              | NetBIOS, RPC, PPTP                 |
| 4                 | 传输层 (Transport)   | 端到端数据传输、可靠性保证         | TCP, UDP, SCTP                     |
| 3                 | 网络层 (Network)     | 路由选择与逻辑地址管理             | IP, ICMP, IGMP, IPsec              |
| 2                 | 数据链路层 (Data Link)| 物理地址、差错检测、帧传输        | Ethernet, PPP, Switch, ARP         |
| 1                 | 物理层 (Physical)    | 比特传输，物理媒介                 | 光纤, 网线, RS-232, DSL            |

TCP是面向连接的，传输之前需要3次握手形成会话，之后服务器端和客户端才能互相发送数据。

在创建会话过程中，服务器和客户端分别提供一个套接字，两个套接字共同形成一个连接。

​
## 创建TCP服务端
api地址：http://nodejs.cn/api/net.html

服务端的创建我们使用node提供的net包，客户端我们使用telnet工具来模拟。

简单实现一个TCP服务端：
```javascript
const net = require("net");

const netServer = net.createServer((socket) => {
  socket.on("data", (data) => {
    socket.write("hello," + data.toString());
  });

  socket.on("end", () => {
    console.log("bye bye ~");
  });

  socket.write("欢迎来到比尔吉沃特，请输入召唤师名称：");
});

netServer.listen(9186, () => {
  console.log("running");
});
```
我们调用net包的createServer方法来创建一个tcp服务。里面需要传递一个回调函数作为参数，函数有一个参数为连接所需套接字。

在回调函数里面，我们绑定了data事件，它在数据传输的时候会触发。（传输的数据${data}为一个Buffer）

我们客户端模拟一下：
```bash
➜  test-node telnet localhost 9186
Trying ::1...
Connected to localhost.
Escape character is '^]'.
欢迎来到比尔吉沃特，请输入召唤师名称：zhangsan
hello,zhangsan
```
还有另外一种方法可以实现，本身net.CreateServer()创建的服务器是一个EventEmitter实例：
```javascript
const netServer = net.createServer();
netServer.on("connection", (socket) => {
  socket.on("data", (data) => {
    socket.write("welcome, " + data.toString());
  });
  socket.write("欢迎来到node.js, 请输入你的名字:");
});

netServer.listen(9186, () => {
  console.log("running");
});
```

## TCP服务的事件
​
这里简单列一下，详细触发条件在文档：http://nodejs.cn/api/net.html 

服务器事件：
- listening         server.listen()时触发
- connection     每一个客户端连接到套接字时触发
- close    服务器关闭时触发
- error    服务器异常时触发


连接事件：
- data    一端调用write()事件传数据，另一端触发。
- end    连接中任意一端发送了FIN数据时触发
- connect    客户端事件，套接字与服务器端连接成功触发
- drain    任意一端调用write()事件传数据，当前端触发。
- error    异常发生时
- close    套接字完全关闭时
- timeout   一定时间之后连接不在活跃时触发。

## Nagle算法
node中默认开启Nagle算法，缓冲区数据达到一定数量才会将其发出，以此节约网络资源。使用socket.setNoDelay(true)关闭，使数据立即发送。

关闭Nagle算法之后，一端可能收到多个小数据包的合并，所以多次write()可能另一端只触发一次data()






​


​