---
date: 2022-01-12
title: Node.js之文件系统
category: Nodejs 
tags:
- Nodejs 
---
# Node.js之文件系统 

## 文件描述符
文件描述符是使用 fs 模块提供的 open() 方法打开文件后返回的（即fd）：
```javascript
const fs = require("fs");

// 文件描述符（fd: number）
const filePath = "./mylog.txt";
const flag = "r";
const mode = 0o666;
const buf = Buffer.alloc(1024);
fs.open(filePath, flag, mode, (err, fd) => {});
```

常用的操作标志：

- r+ 打开文件用于读写。
- w+ 打开文件用于读写，将流定位到文件的开头。如果文件不存在则创建文件。
- a 打开文件用于写入，将流定位到文件的末尾。如果文件不存在则创建文件。
- a+ 打开文件用于读写，将流定位到文件的末尾。如果文件不存在则创建文件。
  
## 文件属性
使用stat方法可以获取文件属性：

```javascript
const fs = require("fs");
fs.stat(filePath, (err, stat) => {
  if (err) {
    console.error(err);
  } else {
    console.log(stat);
  }
});

 /* {
  dev: 16777220,
  mode: 33188,
  nlink: 1,
  uid: 501,
  gid: 20,
  rdev: 0,
  blksize: 4096,
  ino: 1722353,
  size: 13,
  blocks: 8,
  atimeMs: 1641891254185.2805,
  mtimeMs: 1641891215764.0925,
  ctimeMs: 1641891215764.0925,
  birthtimeMs: 1641889004385.9033,
  atime: 2022-01-11T08:54:14.185Z,
  mtime: 2022-01-11T08:53:35.764Z,
  ctime: 2022-01-11T08:53:35.764Z,
  birthtime: 2022-01-11T08:16:44.386Z
 }
 */
```

## 文件路径
```javascript
const path = require("path");

const mylogPath = "/Users/123/project/test-node/mylog.txt";

// 获取目录
console.log(path.dirname(mylogPath)); // /Users/123/project/test-node

// 获取文件名称
console.log(path.basename(mylogPath)); // mylog.txt

// 获取扩展名 
console.log(path.extname(mylogPath)); // .txt

// 根据相对路径找绝对路径
console.log(path.resolve("./mylog.txt"));
```

## 操作文件夹
写一个，如果log文件夹不存在就创建，存在就重命名的示例：
```javascript
const fs = require("fs");
const path = require("path");


if (!fs.existsSync("log")) {
  fs.mkdir("log", (err) => {
    err && console.log(err);
  });
} else {
  fs.rename(
    path.resolve("log"),
    path.join("/", path.dirname(path.resolve("log")), "mylog"),
    (err) => {
      err && console.error(err);
    }
  );
}
```
上边的代码中：

- existSync 判断文件夹是否存在
- mkdir 创建新的文件夹
- rename 文件夹重命名

删除文件夹：rmdir: 
```javascript
const fs = require("fs");
fs.rmdir("mylog", (err) => {
   err && console.log(err);
});
```

文件夹读取：readdir:
```javascript
const fs = require("fs");
const path = require("path");

fs.readdir("/Users/123/project/test-node/log", (err, files) => {
  if (err) {
    console.error(err);
  } else {
    const absoluteFiles = files.map((basename) =>
      path.join("/Users/123/project/test-node/log", basename)
    );
    console.log(absoluteFiles);
  }
});
```

## 文件的读取和写入
这里用最简单的方法实现。

### 文件读取
```javascript
const fs = require("fs");

fs.readFile("./mylog.txt", (err, data) => {
  console.log(data.toString());
});
```

### 文件写入

覆盖写：
```javascript
const fs = require("fs");
fs.writeFile("./mylog.txt", " (hello world - w+) ", (err) => {
  err && console.log(err);
});
```

追加写：
```javascript
const fs = require("fs");

fs.appendFile("./mylog.txt", " (hello world - a+) ", (err) => {
  err && console.log(err);
});
```


