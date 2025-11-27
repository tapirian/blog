---
date: 2022-01-11
title: Node.js之事件触发器 
category: Nodejs 
tags:
- Nodejs 
---

# Node.js之事件触发器

## 触发器
程序中的触发器的设计一般分两步：
1. 将某一个动作存储在一个唯一标志。
2. 固定场景触发此动作。

​
## Node.js中的触发器

### api地址： 
​​​​​https://nodejs.cn/api/events.html


### 简单使用
调用on()方法绑定触发器，调用emit()方法触发。
```javascript
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();

// on 方法和 emit方法

// emit 用于触发事件。
// on 用于添加回调函数（会在事件被触发时执行）。

eventEmitter.on("start", () => console.log("start a event"));
eventEmitter.emit("start");
```

### 单次监听
```javascript
// 单次监听器 once (回调只执行一次)
eventEmitter.once("once", () => console.log("only console once"));

eventEmitter.emit("once");
eventEmitter.emit("once");
```

触发器只会单次触发。不会报错。

### 触发器的传参
```javascript
// 传参
eventEmitter.on("active", (start, end) =>
  console.log(`the activity between ${start} and ${end}`)
);
eventEmitter.emit("active", "2020", "2021");
```

​可以看到，触发的时候，将参数依次缀到 eventName 后面

### 触发器移除
```javascript

// 移除单个监听器
eventEmitter.removeListener("start");
eventEmitter.emit("start"); // Error: The "listener" argument must be of type function. Received undefined

// 移除所有监听器
eventEmitter.removeAllListeners();
eventEmitter.emit("active", "2021", "2022"); // 回调不执行，emit触发不报错
```