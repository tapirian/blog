---
date: 2019-10-10
title: Golang实现UDP通信
category: Golang 
tags:
- Golang
- 网络通信
---
# Golang实现UDP通信
众所周知，UDP是无连接的，所以并不保证数据的稳定性。我们实现代码中，往往会创造一个“伪连接”。来看一下服务端和客户端实现方式
### UDP服务端
实现TCP服务端主是使用到`net`包里面的`ListenUDP`方法， 监听端口成功之后，（伪）连接就自动建立。
  
示例代码：
```go
func main() {
	addr := &net.UDPAddr{
		IP:   net.ParseIP("127.0.0.1"),
		Port: 8080,
	}

	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	println("udp server on: ", conn.LocalAddr().String())
	for {
		buffer := make([]byte, 1024)
		n, err := conn.Read(buffer)
		if err != nil {
			log.Println(err)
		}
		println("接收到：", string(buffer[:n]))
	}
}
```
运行服务，发现输出：```udp server on:  127.0.0.1:8080```表示服务端监听UDP端口成功。

客户端我们可以使用nc工具来模拟。windows下系统没有自带nc工具，需要手动安装。地址：https://nmap.org/download.html

下载完，我们运行`ncat -u 127.0.0.1 8080` 来进行测试。（linux下使用nc -u 127.0.0.1 8080）

### UDP客户端
TCP客户端主要实现只有一个方法`net.DialUDP`。通信成功之后，我们向服务端发送一段话。
示例代码：
```go
func main() {
	raddr := &net.UDPAddr{
		IP:   net.ParseIP("127.0.0.1"),
		Port: 8080,
	}
	laddr := &net.UDPAddr{
		IP:   net.ParseIP("127.0.0.1"),
		Port: 8081,
	}

	conn, err := net.DialUDP("udp", laddr, raddr)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	println("udp client on: ", conn.LocalAddr().String())
	messge := "server你好，我是client"
	_, err = conn.Write([]byte(messge))
	if err != nil {
		log.Println(err)
	}
}
``` 