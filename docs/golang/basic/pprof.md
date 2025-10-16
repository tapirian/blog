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

### 锁竞争问题
锁竞争问题可能会导致程序卡顿，比如：大量 goroutine 并发写同一个 map，用单个 sync.Mutex 保护，造成显著锁竞争。

#### 模拟代码
```go
func MockMutexCompetition() {
	var mu sync.Mutex
	data := make(map[int]int)

	competition := func(id int) {
		for {
			mu.Lock()
			data[id]++
			mu.Unlock()
			time.Sleep(10 * time.Millisecond)
		}
	}

	for i := 0; i < 100; i++ {
		go competition(i)
	}
}
```
分析锁竞争，我们用到的profile主要是：`/debug/pprof/mutex`。运行上边的代码，然后浏览器打开：`http://localhost:6060/debug/pprof/mutex?debug=1`我们发现没有太多有用的信息，那是因为我们没有开启采样锁竞争。在上述代码中的协程运行之前注入：
```
runtime.SetMutexProfileFraction(1) // 采样所有的锁竞争事件
```
我们修改速率为1， 设置为0是关闭采样，设置小于0为获取当前速率。生产环境建议关闭。

#### 分析问题

设置采样速率后再打开：`http://localhost:6060/debug/pprof/mutex?debug=1`。获取到：
```
--- mutex:
cycles/second=2743450477
sampling period=1
209789992 18513 @ 0xd14ec5 0xd14ea9 0xafbf81
#	0xd14ec4	sync.(*Mutex).Unlock+0xa4		D:/Program Files/Go/src/sync/mutex.go:223
#	0xd14ea8	main.MockMutexCompetition.func1+0x88	D:/project/personal-project/demo/golang-demos/pprof/main.go:89
```
因为我们程序中只有一个地方有锁竞争，所以只有一段数据呈现。我们可以从结果中获取以下有效信息：
- cycles/second=2743450477 这是用于把采样的“周期/计数”换算成时间的基准值（CPU 周期速率），用于将样本值转换为时间度量（可理解为运行时环境下每秒的 CPU 周期数或采样器的速率参考）
- sampling period=1 采样周期或采样频率参数。这里数值 1 表示采样器记录的粒度（运行时可能表示每次发生竞争就记录，或每 1 次事件采样一次）。
- **大量**的第一个数字（209789992）与第二个数字（18513）表明在这个调用栈上出现了 18513 次事件，总计采样量为 209789992（采样单位），说明这是一个高频、且影响显著的位置。
- **sync.(\*Mutex).Unlock** 出现在栈顶，说明采样器把竞争/等待的“归因点”放在了 Unlock 上
- **main.MockMutexCompetition.func1:89** 说明竞争发生在代码的 89 行附近（即那里在持有/释放锁或在临界区附近），这就是需要重点查看和优化的位置。

或者我们使用`go tool pprof`工具分析
```bash
go tool pprof -list MockMutexCompetition  http://localhost:6060/debug/pprof/mutex
```

### 锁竞争阻塞或IO阻塞
锁竞争阻塞或IO阻塞，我们一般使用`debug/pprof/block`文件来进行分析。`debug/pprof/block`文件主要捕获的阻塞有：
- sync.Mutex.Lock
- sync.Cond.Wait
- channel 发送/接收阻塞
- 阻塞在 runtime 相关等待（如等待网络 I/O、系统调用等）

> 注意： `time.Sleep` 本身不会触发block profile，因为它是 runtime 调度器的暂停，不是锁等待。

#### 模拟锁等待
跟采样锁竞争事件一样，阻塞事件同样需要开启并设置频率。
```go
func MockIOBlock() {
	var mu sync.Mutex
	runtime.SetBlockProfileRate(1) // 采样所有的阻塞事件
	for {
		go func() {
			mu.Lock()
			defer mu.Unlock()
			// 模拟长时间IO阻塞
			time.Sleep(10 * time.Second)
		}()
		time.Sleep(10 * time.Millisecond)
	}
}
```

#### 分析阻塞
访问：`http://localhost:6060/debug/pprof/block?debug=1`, 得到：
```
--- contention:
cycles/second=2760111301
532460521632 6 @ 0xa94e31 0xa94e0e 0x87c021
#	0xa94e30	sync.(*Mutex).Lock+0x50		D:/Program Files/Go/src/sync/mutex.go:90
#	0xa94e0d	main.MockIOBlock.func1+0x2d	D:/project/personal-project/demo/golang-demos/pprof/main.go:137

14786216 121 @ 0x894d4c 0xa3a995 0xa3fd6a 0xa40a3a 0x87c021
#	0x894d4b	sync.(*Cond).Wait+0x8b				D:/Program Files/Go/src/sync/cond.go:70
#	0xa3a994	net/http.(*connReader).abortPendingRead+0xb4	D:/Program Files/Go/src/net/http/server.go:722
#	0xa3fd69	net/http.(*response).finishRequest+0x89	D:/Program Files/Go/src/net/http/server.go:1654
#	0xa40a39	net/http.(*conn).serve+0x659			D:/Program Files/Go/src/net/http/server.go:2001
```
可以看到第一类阻塞为锁竞争阻塞，问题代码位于：main.MockIOBlock函数，阻塞次数高达532460521632, 一共有6个goroutine阻塞。

第二类阻塞为正常的HTTP等待客户端读写的IO阻塞。


#### 解决问题
一般来说，解决锁竞争的思路就是，减少同时加锁的并发数。有以下几种方法：
- 限制协程并发数或限制goroutine数量
- 弃用map，使用channel等无锁机制通信
- 使用分片map
- 缩小锁粒度，只做必要的写入
- 优化锁类型，比如读多写少可以使用读写锁sync.RWMutex

这里用map 分片来解决：
```go
func SolveMutexCompetition() {
	type dataMutex struct {
		data []map[int]int
		mu   []sync.Mutex
	}

	totalSize := 10
	dm := dataMutex{
		data: make([]map[int]int, totalSize),
		mu:   make([]sync.Mutex, totalSize),
	}
	for i := 0; i < totalSize; i++ {
		dm.data[i] = make(map[int]int)
	}

	runtime.SetMutexProfileFraction(1)

	for i := 0; i < 100; i++ {
		go func(id int) {
			lockID := id % totalSize
			for j := 0; j < 1000; j++ {
				dm.mu[lockID].Lock()
				dm.data[lockID][id]++
				dm.mu[lockID].Unlock()
				time.Sleep(10 * time.Millisecond)
			}
		}(i)
	}
}
```
优化之后，再访问`http://localhost:6060/debug/pprof/mutex?debug=1`发现当前堆栈调用事件数量明显减少。

## trace工具使用
### 命令
trace是Go语言的内置调试工具，查看命令帮助：
```bash
go tool trace -h
```
根据帮助文档， 我们可以看到：
- 可以使用`go test -trace=trace.out pkg`生成trace文件
- 命令`go tool trace trace.out` 会打开web浏览器分析页面

### 结pprof使用trace
打开pprof调试页，可以直接点击trace按钮，在浏览器下载。也可以使用curl下载：
```bash
curl -o trace.out 'http://localhost:6060/debug/pprof/trace?seconds=5'
```
然后使用trace工具分析：
```bash
go tool trace trace.out
```

### 三方工具statsviz
测试环境还可以使用第三方库statsviz来实时展示Golang的运行指标：https://github.com/arl/statsviz

```go
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/arl/statsviz"
	example "github.com/arl/statsviz/_example"
)

func main() {
	// Force the GC to work to make the plots "move".
	go example.Work()

	// Register a Statsviz server on the default mux.
	statsviz.Register(http.DefaultServeMux)

	fmt.Println("Point your browser to http://localhost:8080/debug/statsviz/")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

浏览器打开：http://localhost:8080/debug/statsviz/ 可以更直观地看到CPU、Goroutines、GC等各项参数

## 生产环境使用
通常**不建议在生产环境使用**`pprof`作性能剖析（生产环境有更好的解决方案），因为pprof 可以暴露程序的详细内部信息，包括：
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
- go tool trace: https://pkg.go.dev/cmd/trace
- 更强大的go执行跟踪: https://go.dev/blog/execution-traces-2024