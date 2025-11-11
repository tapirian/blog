---
date: 2019-10-17
title: Golang实现HTTP通信
category: Golang 
tags:
- Golang
- 网络通信
---
# Golang实现HTTP通信
### HTTP服务端
#### 基础实现
http服务端实现主要方法为`het/http`包中的`ListenAndServe`方法
示例代码：
```go
func main() {
	http.HandleFunc("/", handler)
	addr := "127.0.0.1:9000"
	err := http.ListenAndServe(addr, nil)
	if err != nil {
		panic(err)
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "hello呀")
	// 或：
	// 	msg := strings.NewReader("hello")
	//  io.Copy(w, msg)
}
```

注意：`ListenAndServe`调用之后，代码内部使用死循环，监听器会一直循环等待下一次连接。所以之后的逻辑会被阻塞。
如果后续还有逻辑执行，可以将http服务在协程运行，main()方法结束可以用`select{}`或一个无缓冲通道来阻塞。示例：
```go
func main() {
	http.HandleFunc("/", handler)
	addr := "127.0.0.1:9000"

	go func() {
		err := http.ListenAndServe(addr, nil)
		if err != nil {
			panic(err)
		}
	}()
	fmt.Println("end......")

	select {}
}
```
或
```go
func main() {
	http.HandleFunc("/", handler)
	addr := "127.0.0.1:9000"
	ch := make(chan struct{})
	go func() {
		err := http.ListenAndServe(addr, nil)
		if err != nil {
			panic(err)
		}
	}()
	fmt.Println("end......")

	<-ch
}
```
#### ServeMux路由分发器
使用`ServeMux`自动路由分发，有以下优点：
- 代码更简洁。
- 支持固定路径和子树路径匹配，层级清晰。
- 自动处理斜杠和 URL 重定向，避免 404。
- 可选主机名匹配，方便多域名服务。
- URL 自动规范化，提高安全性。
- 可扩展，适合作为基础路由器。

示例代码
```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	// 创建路由
	mux := http.NewServeMux()

	// 注册路由
	registerRoutes(mux)

	// 创建服务器
	httpServer := &http.Server{
		Addr:    "127.0.0.1:9000",
		Handler: mux,
	}

	// 启动HTTP服务器
	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	select {}
}
func registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/user", GetUser)
	mux.HandleFunc("/api/role", GetRole)
}
func GetUser(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "user")
}

func GetRole(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "role")
}
```

### HTTP客户端
客户端的Get请求和Post请求非常相似，我们这里就只写一个Post请求的实现。我们需要先调用`http.NewRequest`方法生成请求实例；然后定义一个`http.Client`结构体客户端来发起请求。
```go
func main() {
	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	var data []byte
	data = []byte("server,你好，我是client")
	req, err := http.NewRequest(http.MethodPost, "http://127.0.0.1:9000", bytes.NewBuffer(data))
	if err != nil {
		panic(err)
	}
	req.Header.Set("content-type", "application/text")
	res, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()

	body := make([]byte, 4096)
	n, err := res.Body.Read(body)
	if err != io.EOF {
		panic(err)
	}
	
	fmt.Println("响应： ", string(body[:n]))
}
```
上边的程序，使用`Body.Read()`，如果数据量超过body定义的大小，则剩余部分会被丢弃。我们优化一下读所有：
```go
	body, err := io.ReadAll(res.Body)
```

