---
date: 2022-01-19
title: Node.js之构建WebSocket服务
category: Nodejs 
tags:
- Nodejs 
- 网络通信
---

# Node.js之构建WebSocket服务
## WebSocket简介
WebSocket是HTML5开始提供的一种在单个TCP 连接上进行全双工通讯的协议。它有如下特点：

- 基于TCP，客户端和服务端只建立一个TCP连接。
- 服务端可以主动向客户端发送消息。
- 采用了二进制帧结构，不具备HTTP/2多路复用、优先级等特性
- 更轻量的协议头，减少数据传输量。
- WebSocket握手包的报文格式必须符合HTTP报文格式的规范

## 服务端实现
```javascript
const ws = require("nodejs-websocket");
const server = ws.createServer(function (socket) {
  // 读取字符串消息，事件名称为:text
  var count = 1;
  socket.on("text", function (str) {
    // 在控制台输出前端传来的消息
    console.log(str);
    //向前端回复消息

    setInterval(() => {
      socket.sendText("服务器端收到客户端发来的消息" + str + count++);
    }, 2000);
  });

  socket.on("error", () => {
    console.log("err");
  });
});

server.listen(3000, () => {
  console.log("connected...");
});
```
nodejs-websocket包读取字符串事件为text，发送字符串到客户端方法为sendText()
还有其他方法和事件请阅读源码。

运行上边的代码，启动服务。


## 客户端
```javascript
const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:3000/");

ws.onopen = function () {
  setInterval(function () {
    ws.send("客户端消息");
  }, 2000);
};

ws.onmessage = function (e) {
  console.log(e.data);
};
```
当然，这段代码也可以在浏览器直接运行（不需要引入ws包）。

我们使用定时器模拟消息的实时发送，来观察客户端和服务端消息的通讯过程。

