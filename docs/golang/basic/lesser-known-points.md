# Golang基础知识点

## 结构体struct
#### 结构体可以使用new来创建，返回一个指针
```go
	zhangsan := new(Person)
	zhangsan = &Person{
		name: "张三",
		sex:  1,
	}
	fmt.Printf("zhangsan : %v\n", zhangsan)   // &{{ 0} 张三 1}
	fmt.Printf("*zhangsan : %v\n", *zhangsan) // {{ 0} 张三 1}
```
#### 指针结构体赋值，可以省略 * 标识符
```go
	lisi := &Person{
		name: "李四",
		sex:  2,
	}
	fmt.Printf("lisi : %v\n", lisi)
    lisi.name = "李思" // 同(*lisi).name = "李思"
	fmt.Printf("lisi : %v\n", lisi)
```

#### TIPS: 可以使用结构体继承，来覆盖写或增加写json返回
```go
type User struct {
		Name       string    `json:"name"`
		Age        uint32    `json:"age"`
		UpdateTime time.Time `json:"updateTime"`
	}

	type Response struct {
		User
		UpdateTime string `json:"updateTime"`
	}

	user := User{
		Name:       "张三",
		Age:        12,
		UpdateTime: time.Now(),
	}

	userResponse := Response{
		User:       user,
		UpdateTime: user.UpdateTime.Format(time.DateTime),
	}

    userData, _ := json.Marshal(user)
	userRespData, _ := json.MarshalIndent(userResponse, "", "  ") // 格式化

	fmt.Printf("user=%s\n", userData) //user={"name":"张三","age":12,"updateTime":"2025-10-09T15:16:30.8851019+08:00"}
	fmt.Printf("userResp=%s\n", userRespData)
	/*
		userResp={
		  "name": "张三",
		  "age": 12,
		  "updateTime": "2025-10-09 15:16:30"
		}
	*/
```

## 数组&切片
切片的底层结构是数组。
#### new & make
|      | new                | make                  |
| ---- | ------------------ | --------------------- |
| 使用对象 | 任意类型               | slice、map、chan        |
| 返回值  | 指针 `*T`            | 类型本身（非指针）             |
| 初始化  | 零值                 | 初始化完成，可以直接用           |
| 用法示例 | `p := new(Person)` | `s := make([]int, 3)` |

#### 使用new初始化一个切片
初始化之后返回的值是一个指针，长度和容量都为0，值不为nil（会分配内存，所以返回了内存地址）
```go
	ar := *new([]int)
	fmt.Printf("ar=%v, len(ar)=%v, cap(ar)=%v\n", ar, len(ar), cap(ar)) //ar=[], len(ar)=0, cap(ar)=0
	fmt.Printf("ar == nil: %v\n", ar == nil)                          // false
	ar[0] = 1         // panic: runtime error: index out of range [0] with length 0
```
超出数组的长度，使用下标赋值会报错。直接赋值则不会，如：
```go
ar = []int{1234, 12345}
```
#### 使用make初始化一个切片
初始化一个长度为3和容量为5的切片，即当前切片含有三个元素，且全部初始化为零值，切片的底层数组长度为5
```go
	arr := make([]int, 3, 5)
	fmt.Printf("arr=%v, len(arr)=%v, cap(arr)=%v\n", arr, len(arr), cap(arr))
    // arr=[0 0 0], len(arr)=3, cap(arr)=5
```
如果使用make初始化，指定了长度，没有指定容量，则容量等于长度。（使用make初始化，最少两个参数）
```go
	s1 := make([]int, 1234567)
	fmt.Printf("len(s1)=%v, cap(s1)=%v\n", len(s1), cap(s1)) // len(s1)=1234567, cap(s1)=1234567
```
同样：超出切片长度，使用下标赋值会报错：
```go
	arr := make([]int, 3, 5)
	arr[3] = 1
    // panic: runtime error: index out of range [3] with length 3
```

#### 使用var关键字初始化一个切片
使用var关键字初始化切片，若是没有赋值初始值，即没有分配内存，则值是nil；若是赋值了初始值，则容量和长度都是初始值的数量
```go
	var s []int
	fmt.Printf("s=%v, len(s)=%v, cap(s)=%v\n", s, len(s), cap(s)) //s=[], len(s)=0, cap(s)=0
	fmt.Printf("s == nil: %v\n", s == nil)                        // true

    var s []int = []int{1, 2, 3}
```

#### 使用 := 初始化一个切片
使用 `:=` 初始化一个切片，如果初始化空值，则不为nil，且长度容量都是0
```go
    s := []int{}
	fmt.Printf("s=%v, len(s)=%v, cap(s)=%v\n", s, len(s), cap(s)) //s=[], len(s)=0, cap(s)=0
	fmt.Printf("s == nil: %v\n", s == nil)                        // false
```

#### 使用 : 截取切片
使用`:`可以来截取切片。例如`s[1:3]`, 注意，截取的规则是**左闭右开**, 即包含左边的元素，忽略右边的元素，即`[1,3)`。
```go
	s2 := []int{0, 1, 2, 3, 4}
	fmt.Println("s2[:3] = ", s2[:3])   // s2[:3] = [0 1 2] 
	fmt.Println("s2[3:] = ", s2[3:])   // s2[3:] = [3 4] 
	fmt.Println("s2[1:3] = ", s2[1:3]) // s2[1:3] = [1 2]
```
注意，截取之后的切片，底层数组如果没有变化，那么修改会影响到源切片。如果截取之后的切片底层数组变化了（和源切片不同了），则不会影响源切片。看示例：
```go
	arr := make([]int, 4, 5)
	arr1 := arr[1:3]
    arr2 := arr[1:3]
	fmt.Printf("arr=%v, len(arr)=%v, cap(arr)=%v\n", arr, len(arr), cap(arr))
    // arr=[0 0 0 0], len(arr)=4, cap(arr)=5
	fmt.Printf("arr1=%v, len(arr1)=%v, cap(arr1)=%v\n", arr1, len(arr1), cap(arr1))
    // arr1=[0 0], len(arr1)=2, cap(arr1)=4

    // 如果修改之后，arr1的最后一个值的位置小于等于arr最后一个值的位置，则会覆盖修改arr的值。否则不修改。
    arr1[0] = 100
	arr1[1] = 200
	arr1 = append(arr1, 300)
	fmt.Printf("arr=%v, len(arr)=%v, cap(arr)=%v\n", arr, len(arr), cap(arr))
    // arr=[0 100 200 300], len(arr)=4, cap(arr)=5
	fmt.Printf("arr1=%v, len(arr1)=%v, cap(arr1)=%v\n", arr1, len(arr1), cap(arr1))
    // arr1=[100 200 300], len(arr1)=3, cap(arr1)=4

    // 不修改
    arr2 = append(arr1, 1000, 2000, 3000, 4000)
	fmt.Printf("arr=%v, len(arr)=%v, cap(arr)=%v\n", arr, len(arr), cap(arr))
    // arr=[0 100 200 300], len(arr)=4, cap(arr)=5
	fmt.Printf("arr2%v, len(arr2)=%v, cap(arr2)=%v\n", arr2, len(arr2), cap(arr2))
    // arr2[100 200 300 1000 2000 3000 4000], len(arr2)=7, cap(arr2)=8
```

#### 使用copy实现切片深拷贝
copy() 是一个 内置函数，用于切片之间的数据复制。copy() 会将 src（源切片）中的元素 复制到 dst（目标切片）中。
```go
func copy(dst, src []Type) int
```
注意，对于切片，长度也是类型的一部分（因为slice基于array），所以复制的目标切片需给定正确的长度
```go
	s2 := []int{0, 1, 2, 3, 4}

	var dst1 []int
	copy(dst1, s2)
	fmt.Println("dst1 = ", dst1) // dst1 =  []

	dst2 := make([]int, len(s2)-1)
	n := copy(dst2, s2)
	fmt.Printf("dst2 = %v, 复制数量=%d, 源切片长度=%d\n", dst2, n, len(s2)) // dst2 = [0 1 2 3], 复制数量=4, 源切片长度=5
```

**TIPS: 实现切片删除**
```go
// 删除索引为 i 的元素
func remove(s []int, i int) []int {
    copy(s[i:], s[i+1:]) // 向前覆盖
    return s[:len(s)-1]  // 截断最后一个
}
```

## 函数
#### 闭包函数
简单来实现一个计数器：
```go
func main() {
	nextInt := intSeq()
	fmt.Println(nextInt())
	fmt.Println(nextInt())
	fmt.Println(nextInt())
	fmt.Println(nextInt())

	newInts := intSeq()
	fmt.Println(newInts())
}

func intSeq() func() int {
	i := 0
	return func() int {
		i++
		return i
	}
}
```
结果：
```
1
2
3
4
1
```

## 协程
#### TIPS: 开启协程包含死循环，会导致该协程一直运行，直到程序终止
下面的代码，实现了一个等待效果，等待斐波那契数列函数计算完毕则返回：
```go
func main() {
	go spinner(100 * time.Millisecond)
	const n = 46
	fibN := fib(n) // 比较慢，等待执行
	fmt.Printf("\rFibonacci(%d) = %d\n", n, fibN)
}

// 开启协程包含死循环会导致该协程一直运行，直到程序中止。（不会影响主程序运行）
func spinner(delay time.Duration) {
	for {
		for _, r := range `-\|/` {
			fmt.Printf("\r%c", r)
			time.Sleep(delay)
		}
	}
}

func fib(x int) int {
	if x < 2 {
		return x
	}
	return fib(x-1) + fib(x-2)
}
```

### TIPS: 等待协程执行完，再执行主程序（或者主程序再结束）
因为我们知道，main函数也是一个协程， 所以，当main函数中包含协程，如果不加限制的话，主程序并不会等待协程执行完毕。所以我们这里使用一个有缓冲的通道（无阻塞）来实现。
```go
func main() {
    done := make(chan bool, 1)  // 带缓冲的通道

    go func() {
        golist()
        done <- true
    }()

    forlist(100)  // 立即执行，不会阻塞
    <-done        // 最后检查协程是否完成
}


func golist() {
	for i := 0; i < 100; i++ {
		println("delay process: ", i)
        time.Sleep(time.Microsecond * 100) // 延迟，方便查看同步效果
	}
}

func forlist(x int) {
	for i := 0; i < x; i++ {
		println("main process: ", i)
        time.Sleep(time.Microsecond * 100)
	}
}
```
## TCP连接
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
