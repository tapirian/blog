# Golang性能剖析工具pprof
Go 语言内置了强大的性能剖析工具——pprof，它能够帮助开发者深入洞察程序的运行时行为，精准定位 CPU 瓶颈、内存泄漏、goroutine 泄露等常见性能问题。

## 引入pprof
`runtime`和`net/http`都有pprof分析工具。可以分场景来使用:

- 如果HTTP服务器中则使用`net/http/pprof`
- 不需要HTTP服务器使用`runtime/pprof`

我们这里先预写一下消耗CPU和消耗内存的方法，后续示例代码中用到的同名方法即为调用该方法：

```go
// 模拟CPU使用
func MockCPUUse() {
	for {
		for i := 0; i < 1000000; i++ {
		}
		time.Sleep(100 * time.Millisecond)
	}
}

// 模拟内存使用持续增加
func MockMemoryUse() {
	var data [][]byte
	for {
		row := make([]byte, 10*1024) // byte固定1个字节，10*1024也就是10kB
		data = append(data, row)
		log.Printf("total size = %dKB\n", len(data)*10)
		time.Sleep(100 * time.Millisecond)
	}
}
```

### HTTP服务器使用pprof
#### 基本使用
导入`net/http/pprof`包通常仅用于注册其 HTTP 处理程序。处理的路径都以 `/debug/pprof/` 开头。启动一个HTTP服务器:（如果你的服务本身存在一个http服务器，则不需要额外启动）。

```go
package main

import (
	_ "net/http/pprof"
)

func main() {
    go func() {
	    log.Println(http.ListenAndServe("localhost:6060", nil))
    }()
	println("服务已运行")

	// 模拟CPU和内存消耗，用来分析
	go MockMemoryUse()
	go MockCPUUse()

	select {}
}
```
现在可以访问`localhost:6060/debug/pprof`查看

#### 多路复用器引入
如果你使用的多路复用器来启动http服务，且没有使用默认的多路复用器，则需要将默认复用器单独注册。
```go
package main

import (
	"log"
	"net/http"
	_ "net/http/pprof"
	"time"
)

func main() {
	go func() {
		// http.ListenAndServe("localhost:6060", nil)
		var mux = http.NewServeMux()
		mux.Handle("/debug/pprof/", http.DefaultServeMux)
		http.ListenAndServe("localhost:6060", mux)
	}()
	println("服务已运行")
	
	// 模拟CPU和内存消耗，用来分析
	go MockMemoryUse()
	go MockCPUUse()
	
	select {}
}
```

### 非HTTP服务器(runtime)使用pprof
如果我们的程序是CLI程序，或者是脚本分析工具等等，不需要启动HTTP服务器，可以使用`runtime/pprof`库，调用`pprof.StartCPUProfile && pprof.StopCPUProfile`和`pprof.WriteHeapProfile`等方法，将分析结果写入文件（二进制文件），然后使用Golang工具包自带的分析工具`pprof`来进行分析。

```go
package main

import (
	"log"
	"os"
	"runtime/pprof"
	"time"
)

func main() {
	// ===== CPU Profiling =====
	f, _ := os.Create("cpu.prof")
	pprof.StartCPUProfile(f)
	defer pprof.StopCPUProfile()

	go MockCPUUse()
	go MockMemoryUse()
	time.Sleep(5 * time.Second)

	// ===== Memory Profiling =====
	f2, _ := os.Create("mem.prof")
	pprof.WriteHeapProfile(f2)
	f2.Close()
}
```
当前文件夹下会生成文件`cpu.prof`和`mem.prof`，分别是cpu和内存的分析文件，使用`pprof`工具来进行分析:
- 交互式用法
```bash
go tool pprof mem.prof
```
- http服务Web UI
```bash
go tool pprof -http localhost:8081 cpu.prof
```
`pprof`工具的详细使用，请看下一章。

## pprof分析工具
`$GOROOT`下`pkg/tool`文件夹有许多golang的内置工具，包括`pprof`工具，我们使用它来分析使用`net/http/pprof`库生成的二进制文件。

### 安装graphviz 
在使用pprof之前， 我们先安装图形可视化工具graphviz，因为许多pprof可视化命令依赖此工具，比如：`go tool pprof -http localhost:8080 mem.prof`等等。

可以直接访问官网安装，或者使用包管理器安装。windows下可以使用`choco`或者`scoop`安装。如果手动安装需要设置环境变量。

检查是否安装成功：
```bash
dot -v 
```

> TIPS： 使用`choco install graphviz`安装，就必须用`choco uninstall graphviz`卸载，否则系统有残留,会影响重新安装。

### pprof基本命令
首先使用帮助命令，查看工具支持的参数选项
```bash
go tool pprof -h
```
基本使用：
```
pprof <格式> [选项] [二进制文件] <来源> ...
```
pprof工具主要的选项有：
| 命令         | 含义                  |
| ---------- | ------------------- |
| `top`      | 显示 CPU 消耗前几名函数      |
| `top10`    | 前10个热点函数            |
| `list 函数名` | 查看某函数内部每行的性能占比      |
| `web`      | 生成调用图（需安装 graphviz） |
| `svg`      | 导出 SVG 图            |
| `pdf`      | 导出 PDF 图            |
| `quit`     | 退出                  |


pprof命令中，格式是用来展示输出内容的，格式有很多种，只能选择一个，比如-dot。如果省略格式，有两种主要用法：

#### 1、交互式命令
```
pprof [options] [binary] <source> ...
```
例如，采集http服务30秒的CPU使用情况：

**命令**
```bash
go tool pprof  http://localhost:6060/debug/pprof/profile?seconds=30
```
**结果**
```bash
Fetching profile over HTTP from http://localhost:6060/debug/pprof/profile?seconds=30
Saved profile in C:\Users\yjby\pprof\pprof.main.exe.samples.cpu.006.pb.gz
File: main.exe
Build ID: C:\Users\yjby\AppData\Local\Temp\go-build1572729231\b001\exe\main.exe2025-10-15 14:37:21.6460188 +0800 CST
Type: cpu
Time: Oct 15, 2025 at 2:37pm (CST)
Duration: 30.01s, Total samples = 1.24s ( 4.13%)
Entering interactive mode (type "help" for commands, "o" for options)
(pprof) 
```
我们等待30秒之后，控制台命令行首出现`(pprof)`字样，表示我们可以交互式输入命令，我们输入`top10`（或者top, 默认10条结果），查看前10名CPU消耗的函数：

```bash
(pprof) top
Showing nodes accounting for 1.01s, 81.45% of 1.24s total
Showing top 10 nodes out of 93
      flat  flat%   sum%        cum   cum%
     0.54s 43.55% 43.55%      0.54s 43.55%  main.MockCPUUse
     0.21s 16.94% 60.48%      0.21s 16.94%  runtime.cgocall
     0.11s  8.87% 69.35%      0.11s  8.87%  runtime.stdcall1
     0.04s  3.23% 72.58%      0.04s  3.23%  runtime.memclrNoHeapPointers
     0.03s  2.42% 75.00%      0.03s  2.42%  runtime.mapaccess1_fast64
     0.03s  2.42% 77.42%      0.03s  2.42%  runtime.stdcall4
     0.02s  1.61% 79.03%      0.02s  1.61%  runtime.stdcall6
     0.01s  0.81% 79.84%      0.02s  1.61%  fmt.(*pp).doPrintf
     0.01s  0.81% 80.65%      0.01s  0.81%  fmt.(*pp).fmtInteger
     0.01s  0.81% 81.45%      0.01s  0.81%  gogo
```
每一列的含义如下：
| 列名        | 含义                                        | 举例说明                                                          |
| --------- | ----------------------------------------- | ------------------------------------------------------------- |
| **flat**  | **该函数本身消耗的 CPU 时间 / 内存 /对象数量**（不包括调用的子函数） | 如果 `flat=0.30s`，说明 `main.compute` 自己占用了 0.3 秒 CPU 时间，不算它调用的函数 |
| **flat%** | **flat 占总消耗的百分比**                         | 如果 `flat%=60%`，说明该函数自己占总 CPU 时间的 60%                          |
| **sum%**  | **累计百分比**（从最耗资源的函数开始累加）                   | 排序按 flat 降序，累加每行的 flat%，比如第一行 60%，第二行 40%，sum%=100%           |
| **cum**   | **累计消耗时间 / 内存**（包括该函数及其调用的所有子函数）          | 如果 `cum=0.50s`，说明 `main.compute` + 它调用的函数总共消耗了 0.5 秒 CPU 时间   |
| **cum%**  | **累计消耗占总量百分比**                            | cum 的百分比表示这个函数及其子调用占总消耗的比例                                    |

#### 2、Web UI
```
pprof -http [host]:[port] [options] [binary] <source> ...
```
例如：我们已经采集了服务的内存消耗情况到文件`mem.prof`， 我们使用WebUI的方式来呈现结果（需要安装graphviz）
```bash
go tool pprof -http :8081 .\mem.prof
```
浏览器打开`http://localhost:8081`， 可以看到我们可以选择不同格式或图表来展示结果，还可以看到对应到源码哪一部分的消耗等等。

## Golang程序性能剖析
我们这里主要讲HTTP服务器的程序性能剖析

### CPU热点问题
这个前面有讲过，主要使用`debug/pprof/profile`来进行分析，有以下几种方法
#### 方法一：下载后分析
CPU分析二进制文件不支持浏览器`text/plain`响应，可以直接打开`http://localhost:6060/debug/pprof`，点击`profile`来下载，或使用`curl -o cpu.prof http://localhost:6060/debug/pprof/profile`来下载。下载完使用命令行分析：
```bash
go tool pprof cpu.prof 
```
注意： CPU分析文件默认抓取30秒进行分析，可以修改参数更改时间比如： `http://localhost:6060/debug/pprof/profile?seconds=10`

#### 方法二： 直接使用交互式命令分析
```bash
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30
```

### 内存泄露问题
内存泄露问题前面讲过，主要使用`debug/pprof/heap`来进行分析， 这是用来采样当前内存快照的，主要记录当前仍在堆上存活的对象（未被 GC 回收）。和`allocs`有区别，`allocs`是记录所有分配过的内存对象（包括已释放）

我们现在主要讲调试模式打开`heap`信息页面这种方式来分析，打开：`http://localhost:6060/debug/pprof/heap?debug=1`,可以看到有很多项信息，主要有：
```
Alloc = 483096                 # 当前堆活跃内存 ~ 0.46MB
TotalAlloc = 12679299096       # 累积分配 ~ 12.6GB
HeapAlloc = 483096             # 当前 heap 活跃内存，和 Alloc 相同
HeapSys = 39583744             # 分配给堆的总空间 ~ 37.7MB
HeapIdle = 38305792            # 堆空闲 ~ 36.5MB，可回收
HeapObjects = 2245             # 当前堆上活跃对象 ~2k
Mallocs = 6243                 # 历史分配次数
Frees = 3998                   # 历史释放次数
```

### GC频繁问题
GC频繁一般是由于**短命对象过多**，这是一段模拟频繁GC的代码：
```go
func MockGCfreq() {
	for {
		_ = make([]byte, 10*1024*1024)
		time.Sleep(100 * time.Millisecond)
	}
}
```
GC频繁主要使用`debug/pprof/allocs`。和内存泄露的排查步骤相似，打开：`http://localhost:6060/debug/pprof/allocs?debug=1`,看到有很多项信息和`heap`页相似，但是通过不断刷新页面， 可以看到Alloc偶尔增加又释放，而`TotalAlloc`不断增加，说明GC比较频繁，同时可看到：main.MockGCfreq函数内存地址不断变化，且占用内存较大。
```
0: 0 [2: 32768] @ 0x9d5c0a 0x9d5b0f 0x9d3e2b 0x9e2f05 0x9e3a53 0x991baf 0x993549 0x993549 0x994556 
......
......
0: 0 [1: 16384] @ 0x9d5c0a 0x9d5aa7 0x9d3e2b 0x9e2f05 0x9e3a53 0x991baf 0x993549 0x993549 0x994556 
......
......
0: 0 [1: 663552] @ 0x94c56f 0x955e59 0x9db5fc 0x9e085e 0x9d5e45 0x9d5b0f 0x9d3e2b 0x9e2f05 0x9e3a53 
......
......
0: 0 [3343: 35053895680] @ 0x9e4cc8 0x7cbf81
#	0x9e4cc7	main.MockGCfreq+0x27	D:/project/personal-project/demo/golang-demos/pprof/main.go:34
```


### 协程泄露
我们首先模拟写一段协程泄露的代码，进行分析：
```go
package main

import (
	"fmt"
	"net/http"
	_ "net/http/pprof"
	"runtime"
	"time"
)

func main() {
	go func() {
		var mux = http.NewServeMux()
		// http.ListenAndServe("localhost:6060", nil)
		// mux.HandleFunc("/debug/pprof/", http.DefaultServeMux.ServeHTTP)
		mux.Handle("/debug/pprof/", http.DefaultServeMux)
		http.ListenAndServe("localhost:6060", mux)
	}()
	println("服务已运行")
	
	go MockGoroutineLeak()

	for {
		time.Sleep(2 * time.Second)
		fmt.Println("NumGoroutine:", runtime.NumGoroutine())
	}
}

// 模拟协程泄露
func GoroutineLeak(ch <-chan struct{}) {
	for {
		go func() {
			if _, ok := <-ch; !ok {
				return
			}
		}()
		time.Sleep(1 * time.Second)
	}
}
func MockGoroutineLeak() {
	for {
		ch := make(chan struct{})
		go GoroutineLeak(ch)
		time.Sleep(500 * time.Millisecond)
	}
}
```
运行结果：
```
$ go run main.go 
服务已运行
NumGoroutine: 15
NumGoroutine: 33
NumGoroutine: 59
NumGoroutine: 93
```
我们可以看到， 协程数量不断增加，大概率是协程泄露了，来进行分析： 

**方法一：**：打开pprof分析页面：http://localhost:6060/debug/pprof/， 点击goroutine进入协程分析页面：http://localhost:6060/debug/pprof/goroutine?debug=2。

注意修改参数debug=2，可以看到详细的调用堆栈信息。我们可以看到大量的类似信息
```
goroutine 35 [chan receive, 2 minutes]:
main.GoroutineLeak.func1()
	D:/project/personal-project/demo/golang-demos/pprof/main.go:34 +0x25
created by main.GoroutineLeak
	D:/project/personal-project/demo/golang-demos/pprof/main.go:33 +0x25
```
存在大量的[chan receive], 说明“通道等待接收（读取）但没有关闭或发送”, 且定位在`main.GoroutineLeak`函数中。

**方法二：** 使用`pprof`命令行工具来分析，命令如下：
```bash
go tool pprof -text  http://localhost:6060/debug/pprof/goroutine
```
当然可以用别的格式输出，或者使用交互式命令。当然也可以使用Web UI:
```bash
go tool pprof -http :8080  http://localhost:6060/debug/pprof/goroutine
```
最终定位在`main.GoroutineLeak`函数中，然后我们来解决泄露:

- 1、让外层循环监听 ch（for range ch 或 select <-ch）当 ch 关闭，外层循环退出，整个 goroutine 结束。
- 2、通道使用结束后，直接关闭。
```go
// 模拟协程泄露
func GoroutineLeakFixed(ch <-chan struct{}) {
	for range ch { // ch 被 close 时 loop 结束
		// 如果确实需要并发处理可在此派发短生命周期的 goroutine
		go func() {
			// ...短任务
		}()
		time.Sleep(1 * time.Second)
	}
}
func MockGoroutineLeak() {
	for {
		ch := make(chan struct{})
		go GoroutineLeakFixed(ch)
		time.Sleep(500 * time.Millisecond)
		close(ch)
	}
}
```

## 生产环境使用
通常**不建议在生产环境使用**`pprof`作性能剖析（生产环境有更好的选择），因为pprof 可以暴露程序的详细内部信息，包括：
- 内存使用情况（heap profile）
- CPU 占用和调用栈
- 所有函数调用关系
  
这些信息可能会被攻击者来进行Dos攻击等。另外，
**在高并发下开启profile，可能导致额外 CPU 消耗，Heap profile 或 block profile 也会占用额外内存。** 如果在生产使用，有以下建议：
- 通过防火墙、VPN 或本地端口，
限制访问环境
- 使用Nginx反向代理限制IP，或增加认证机制
- 必要时按需采集日志。

## 参考资料
- net/http/pprof包： https://pkg.go.dev/net/http/pprof
- 图形可视化软件graphviz： https://graphviz.org/