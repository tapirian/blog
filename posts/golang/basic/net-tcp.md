---
date: 2019-10-13
title: Golang实现TCP通信
category: Golang 
tags:
- Golang
- 网络通信
---
# Golang实现TCP通信
### TCP连接服务端
实现TCP服务端主是使用到`net`包里面的两个方法：
- 启动监听	```listener, err := net.Listen("tcp", "127.0.0.1:8000")```
- 等待客户端连接，接收连接实例 ```conn, err := listener.Accept()```
  
我们连接成功之后，调用`io.WriteString`写入当前时间，示例代码：
```go
func main() {
	listener, err := net.Listen("tcp", "127.0.0.1:8000")
	if err != nil {
		log.Fatal(err)
	}
	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Fatal(err)
			continue
		}
		fmt.Printf("run: %v\n", conn.LocalAddr())
		handle(conn)
	}
}

func handle(conn net.Conn) {
	defer conn.Close()
	for {
		_, err :=  io.WriteString(conn, time.Now().Format("15:04:05\n"))
		if err != nil {
			log.Fatal(err)
			return
		}
		time.Sleep(time.Second * 1)
	}
}
```
运行服务，执行`telnet 127.0.0.1 8000`模拟tcp客户端可以看到结果。
> 上述代码中，主函数循环的作用是为了保证多次连接。因为当 `服务端 - 客户端` 三次握手之后算是一个连接。当客户端断开之后重新连接，循环从头开始，重新等待连接的建立。

> 使用 defer 关键字确保函数退出时关闭连接，防止连接泄露
### TCP连接客户端
TCP客户端主要实现只有一个方法:
  
```conn, err := net.Dial("tcp", "127.0.0.1:8000")```
我们建立连接成功之后，我们调用 `io.Copy` 将服务端的输出拷贝到标准输出`os.Stdout`，这样控制台就可以看到服务端的输出内容了。示例代码：

```go
func main() {
	conn, err := net.Dial("tcp", "127.0.0.1:8000")
	if err != nil {
		panic(err)
	}
	defer conn.Close()
	fmt.Printf("client on: %v\n", conn.LocalAddr())
	mustCopy(os.Stdout, conn)
}

func mustCopy(dst io.Writer, src io.Reader) {
	if _, err := io.Copy(dst, src); err != nil {
		log.Fatal(err)
	}
}
```
### 对话小程序
实现一个小程序，使TCP连接的客户端可服务端可以在控制台互相对话。

**服务端程序：**
```go
package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"os"
	"sync"
)

func main() {
	listener, err := net.Listen("tcp", "localhost:8000")
	if err != nil {
		log.Fatal(err)
	}

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Fatal(err)
		}
		go handConn(conn)
	}
}

func handConn(conn net.Conn) {
	defer conn.Close()
	go func() {
		// 使用bufio.Scanner逐行读取客户端输入到连接上的内容
		input := bufio.NewScanner(conn)
		for input.Scan() {
			fmt.Fprintln(os.Stdout, "client说：", input.Text())
		}
	}()
		
	// 复制标准输入到当前连接（忽略错误处理）
	io.Copy(conn, os.Stdin)
}
```

**客户端程序：**
```go
package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"net"
	"os"
)

func main() {
	conn, err := net.Dial("tcp", "localhost:8000")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	go func() {
		// 逐行读取
		scanner := bufio.NewScanner(conn)
		for scanner.Scan() {
			fmt.Printf("server说：%s\n", scanner.Text())
		}
	}()

	// 将控制台标准输入复制给当前连接（忽略错误处理）
	io.Copy(conn, os.Stdin)
}
```

### 使用Conn.Read和Conn.Write读写数据
**服务端程序**
```go
func main() {
	listenAddr := "0.0.0.0:8088"
	listener, err := net.Listen("tcp", listenAddr)
	if err != nil {
		fmt.Println("Error starting server:", err)
		return
	}
	defer listener.Close()

	fmt.Println("Server listening on", listenAddr)

	// 无限循环等待客户端连接
	for {
		// 等待客户端连接
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Error accepting connection:", err)
			continue
		}

		fmt.Println("Client connected:", conn.RemoteAddr())

		// 启动一个新的 goroutine 处理客户端连接
		go handleConnection(conn)
	}
}
func handleConnection(conn net.Conn) {
	defer conn.Close()
	// 接收客户端发送的数据
	buffer := make([]byte, 1024)
	n, err := conn.Read(buffer)
	if err != nil {
		fmt.Println("Error reading data:", err)
		return
	}
	receivedData := string(buffer[:n])
	fmt.Println("Received from client:", receivedData)

	// 向客户端发送数据
	message := "Hello, client!"
	_, err = conn.Write([]byte(message))
	if err != nil {
		fmt.Println("Error sending data:", err)
		return
	}
}

func main() {
	// 指定服务器监听的地址和端口
	listenAddr := "0.0.0.0:8088"

	// 创建一个TCP监听器
	listener, err := net.Listen("tcp", listenAddr)
	if err != nil {
		fmt.Println("Error starting server:", err)
		return
	}
	defer listener.Close()

	fmt.Println("Server listening on", listenAddr)

	// 无限循环等待客户端连接
	for {
		// 等待客户端连接
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Error accepting connection:", err)
			continue
		}

		fmt.Println("Client connected:", conn.RemoteAddr())

		// 启动一个新的 goroutine 处理客户端连接
		go handleConnection(conn)
	}
}
```

**客户端程序**
```go
func main() {
	serverAddr := "127.0.0.1:8088"
	conn, err := net.Dial("tcp", serverAddr)
	if err != nil {
		fmt.Println("Error connecting to server:", err)
		return
	}
	defer conn.Close()

	// 发送数据到服务端
	message := "Hello, server!"
	_, err = conn.Write([]byte(message))
	if err != nil {
		fmt.Println("Error sending data:", err)
		return
	}

	// 从服务端接收数据
	buffer := make([]byte, 1024)
	n, err := conn.Read(buffer)
	if err != nil {
		fmt.Println("Error receiving data:", err)
		return
	}
	receivedData := string(buffer[:n])
	fmt.Println("Received:", receivedData)
}
```