---
date: 2022-01-18
title: Node.js之构建UDP服务
category: Nodejs 
tags:
- Nodejs 
- 网络通信
---

# Node.js之构建UDP服务

## UDP简介
UDP又称用户数据包协议，它和TCP一样属于网络传输层。与TCP不同的是，它不是面向连接的，只需要一个套接字就可以与多个UDP服务通信。它提供的信息传输服务虽然简单不可靠，并且在网络差的情况存在丢包问题，但是由于它无需连接，资源消耗低，所以常常应用在一些偶尔丢包也不会产生严重影响的场景下。例如音频视频，DNS服务等。

### 服务端实现
```javascript
const dgram = require("dgram");

const server = dgram.createSocket("udp4");

server.on("message", (msg, rinfo) => {
  console.log("rinfo.address =  " + rinfo.address);
  console.log("rinfo.port =  " + rinfo.port);
  console.log(msg.toString());
});

server.on("listening", () => {
  console.log("address:" + server.address().address);
  console.log("port:" + server.address().port);
});

server.bind("41234");
```
- 使用dgram包的createSocket方法来创建一个udp服务，其实我们即可以用它做服务端，也可以用来作客户端。
- 绑定listening事件，当服务启动，就会触发监听。
- 绑定message事件，当有客户端消息发送过来的时候就会触发，发送过来的message是一个buffer
- 最后调用bind方法，绑定数据传输端口。

### 客户端实现
```javascript
const dgram = require("dgram");

const client = dgram.createSocket("udp4");

client.send("hello, nodejs", 41234, "localhost", (err, bytes) => {
  console.error(err);
  console.log(bytes);
  client.close();
  client.on("close", () => {
    console.log("close");
  });
});
```

客户端调用send方法来发送消息，参数分别代表，要发送的信息，端口，地址，以及回调。

运行server.js 和client.js进行测试。
