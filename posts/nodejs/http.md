---
date: 2022-01-19
title: Node.js之HTTP服务端和客户端实现
category: Nodejs 
tags:
- Nodejs 
- 网络通信
---

# Node.js之HTTP服务端和客户端实现

## 服务端实现
```javascript
const http = require('http')

const port = 3000

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('你好世界\n')
})

server.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}/`)
})
```
首先我们引入http模块，然后调用http的createServer方法，创建http服务，这个方法的参数是一个回调，回调函数有两个参数，第一个是请求，第二个是响应。我们可以通过请求参数req获取客户端的请求数据，然后通过赋值响应参数res，来返回我们的响应数据。


我们可以对上边的httpServer修改一下，用到request请求回调将请求数据处理之后并返回。
```javascript
const httpServer = http.createServer((request, response) => {
  let data = "";
  request.on("data", (chunck) => {
    data += chunck;
    console.log("request data: " + data);

    console.log("response: " + data);
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/plain");
    response.write(
      JSON.stringify({
        name: "test",
        content: data,
      })
    );
    response.end();
  });

  request.on("end", () => {
    console.log("request end: " + data);
  });
});
```
上边的代码，我们绑定了request的data事件，用来做数据处理并返回，还绑定了end事件，做请求结束前的数据处理。

我们可以将上边的代码稍作封装，来实现路由的分发。
```javascript
const http = require("http");
const url = require("url");
let thisRequest;

class Person {
  getJames() {
    // 获取请求正文
    console.log(thisRequest.method); // POST
    let bodyRaw = "";
    thisRequest.on("data", (chunk) => {
      bodyRaw += chunk;
      return JSON.stringify({
        name: "james",
        content: bodyRaw,
      });
    });
    thisRequest.on("end", () => {
      // do something....
      // console.log(bodyRaw);
    });
  }
}

class Animals {
  getDog() {
    return "dog";
  }
}

let routeTree = {
  "Person/getJames": new Person().getJames,
  "Animals/getDog": new Animals().getDog,
};

// 中划线转驼峰
function toHump(words) {
  return words.replace(/\-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}

// 首字母大写
function UCWords(words) {
  return words.slice(0, 1).toUpperCase() + words.slice(1).toLowerCase();
}

class httpServerObj {
  createServerAndListen() {
    let httpServer = http.createServer((req, res) => {
      thisRequest = req;

      let content = "";
      //   let requestUrl = "http://localhost:3000/person/get-james";
      let requestUrl = req.url;
      if (requestUrl === "/favicon.ico") {
        return;
      }
      let pathname = url.parse(requestUrl).pathname.slice(1);
      if (pathname) {
        let pathnameSlices = pathname.split("/");
        let className = UCWords(pathnameSlices[0]);
        let actionName = "";
        if (pathnameSlices[1]) {
          actionName = toHump(pathnameSlices[1]);
        }
        let routeKey = className + "/" + actionName;
        if (routeTree.hasOwnProperty(routeKey)) {
          content = routeTree[routeKey]();
        } else {
          content = "404";
        }
      } else {
        content = "hello word";
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.write(content);
      res.end();
    });

    httpServer.listen(3000, () => {
      console.log("running in port: 3000");
    });
  }
}

obj = new httpServerObj().createServerAndListen();
```
> 每次请求会附带网站ico图标的请求，这段代码是为了屏蔽node发起网站ico图标的请求。
if (requestUrl === "/favicon.ico") {
       return;
}

当然，上边所有的功能实现在同一个文件，实际情况。业务类是单独分离出来的。

## 客户端实现
发起http请求，我们可以用axios包来实现，这里不做多余赘述。除此之外，我们可以用http包来发起http请求：
```javascript
const http = require("http");
const options = {
  hostname: "127.0.0.1",
  port: 3000,
  path: "/work",
  method: "GET",
};

const req = http.request(options, (res) => {
  console.log(res.statusCode);
  res.on("data", (d) => {
    process.stdout.write(d);
    // console.log(data);
  });
});

req.on("error", (err) => {
  console.log(err);
});

req.end();
```
- 首先我们根据需要选择包，如果https请求就选https包。
- 然后调用request方法，第一个参数是请求方法、请求地址、请求端口等请求数据。第二个参数是返回数据的回调。
- 最后调用end方法结束请求。

稍作封装：
```javascript
const http = require("http");

class httpPackageClientObj {
  byPost() {
    let postData = JSON.stringify({
      content: "白日依山尽，黄河入海流",
    });
    let options = {
      hostname: "localhost",
      port: 3000,
      path: "/person/get-james",
      agent: false,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    let req = http.request(options, (res) => {
      console.log(res.statusCode);
      res.on("data", (buf) => {
        process.stdout.write(buf);
      });
    });
    req.on("error", (err) => {
      console.error(err);
    });
    req.write(postData);
    req.end();
  }

  byGet() {
    let options = {
      hostname: "localhost",
      port: 3000,
      path: "/person/get-james",
      agent: false,
    };
    let req = http.request(options, (res) => {
      console.log(res.statusCode);

      res.on("data", (chunk) => {
        if (Buffer.isBuffer(chunk)) {
          console.log(chunk.toString());
        } else {
          console.log(chunk);
        }
      });
    });

    req.on("error", (err) => {
      console.error(err);
    });
    req.end();
  }
}

let httpClient = new httpPackageClientObj();

httpClient.byGet();
httpClient.byPost();
```
我们可以看到post请求，通过调用write方法进行数据传输。