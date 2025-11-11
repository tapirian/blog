---
date: 2020-04-13
title: Golang使用标准库expvar实现运行时状态导出
category: Golang 
tags:
- Golang
- 监控
---

# 使用expvar实现运行时状态导出
## 🧩 一、`expvar` 的核心功能定位

`expvar` 是 Go 标准库中一个非常轻量的 **运行时状态导出工具**，专为调试与简单监控设计。
它的主要用途是：

> 👉 **在运行时，通过 HTTP 端点动态暴露应用的内部指标、统计值、运行状态等数据，以 JSON 格式输出。**

这些指标通常包括：

* 系统指标：goroutine 数量、内存占用、GC 次数；
* 应用指标：请求总数、错误数、平均响应时间；
* 动态状态：任务队列长度、缓存命中率、连接池大小；
* 自定义数据结构统计：如每个模块的运行情况。

而这些数据可以：

* 被开发者直接通过浏览器或 `curl` 访问；
* 被监控系统（如 Prometheus、Datadog、自研系统）周期性抓取；
* 用于本地调试、健康检查或自动化测试中。

---

## 🧠 二、使用场景举例

| 使用场景              | 说明                                                         |
| ----------------- | ---------------------------------------------------------- |
| **1. Web 服务运行监控** | 在生产环境中，你想查看请求数、错误率、平均耗时，而不引入外部监控库。                         |
| **2. 定位性能瓶颈**     | 配合 `net/http/pprof` 暴露 `/debug/pprof`，`expvar` 可同时暴露自定义指标。 |
| **3. 内部任务队列状态**   | 导出队列长度、待处理任务数、成功/失败次数。                                     |
| **4. 服务健康状态检测**   | 通过 `/debug/vars` 提供结构化数据给健康检测工具（如 Prometheus 或自定义监控脚本）。    |
| **5. 微服务集群运行态收集** | 每个服务节点都暴露自身指标，聚合端周期抓取生成全局视图。                               |

---

## ⚙️ 三、详细用法与高级示例

### ✅ 示例 1：基本计数器（统计请求数）

```go
package main

import (
	"expvar"
	"fmt"
	"net/http"
)

var (
	requests = expvar.NewInt("requests_total")  // 自动注册
	errors   = expvar.NewInt("errors_total")
)

func handler(w http.ResponseWriter, r *http.Request) {
	requests.Add(1)
	if r.URL.Path == "/error" {
		errors.Add(1)
		http.Error(w, "error occurred", 500)
		return
	}
	fmt.Fprintf(w, "hello world")
}

func main() {
	http.HandleFunc("/", handler)

	// 暴露 expvar 的标准输出
	http.Handle("/debug/vars", expvar.Handler())

	fmt.Println("Listening on :8080 ...")
	http.ListenAndServe(":8080", nil)
}
```

访问：

```
curl http://localhost:8080/debug/vars
```

输出（部分）：

```json
{
  "cmdline": ["./main"],
  "memstats": { ... },
  "requests_total": 12,
  "errors_total": 3
}
```

---

### ✅ 示例 2：动态计算值（expvar.Func）

你可以用 `expvar.Func` 注册一个动态值（函数在访问时执行）：

```go
package main

import (
	"expvar"
	"net/http"
	"runtime"
)

func main() {
	// 注册动态变量
	expvar.Publish("goroutines", expvar.Func(func() interface{} {
		return runtime.NumGoroutine()
	}))

	expvar.Publish("heap_alloc", expvar.Func(func() interface{} {
		var m runtime.MemStats
		runtime.ReadMemStats(&m)
		return m.HeapAlloc
	}))

	http.Handle("/debug/vars", expvar.Handler())
	http.ListenAndServe(":8080", nil)
}
```

访问 `/debug/vars`：

```json
{
  "goroutines": 10,
  "heap_alloc": 76544
}
```

💡 动态函数特别适合导出：

* 实时内存占用；
* 当前 goroutine 数；
* 当前连接数；
* 队列中任务数量。

---

### ✅ 示例 3：使用 Map 管理多维指标

如果你有一组相关指标，可以使用 `expvar.Map`。

```go
package main

import (
	"expvar"
	"fmt"
	"net/http"
)

var apiStats = expvar.NewMap("api_stats")

func main() {
	apiStats.Add("total", 0)
	apiStats.Add("success", 0)
	apiStats.Add("fail", 0)

	http.HandleFunc("/success", func(w http.ResponseWriter, r *http.Request) {
		apiStats.Add("total", 1)
		apiStats.Add("success", 1)
		fmt.Fprintf(w, "OK")
	})
	http.HandleFunc("/fail", func(w http.ResponseWriter, r *http.Request) {
		apiStats.Add("total", 1)
		apiStats.Add("fail", 1)
		http.Error(w, "fail", 500)
	})

	http.Handle("/debug/vars", expvar.Handler())
	http.ListenAndServe(":8080", nil)
}
```

访问 `/debug/vars`：

```json
{
  "api_stats": {
    "fail": 2,
    "success": 5,
    "total": 7
  }
}
```

---

### ✅ 示例 4：自定义结构体 + 实现 `expvar.Var`

当内置类型不够用时，可以自定义：

```go
package main

import (
	"encoding/json"
	"expvar"
	"fmt"
	"net/http"
	"sync"
)

type QueueStatus struct {
	mu      sync.Mutex
	Pending int
	Done    int
}

func (q *QueueStatus) String() string {
	q.mu.Lock()
	defer q.mu.Unlock()
	data, _ := json.Marshal(map[string]int{
		"pending": q.Pending,
		"done":    q.Done,
	})
	return string(data)
}

var queue = &QueueStatus{}

func main() {
	expvar.Publish("queue_status", queue)

	http.HandleFunc("/task", func(w http.ResponseWriter, r *http.Request) {
		queue.mu.Lock()
		queue.Pending++
		queue.mu.Unlock()
		fmt.Fprintf(w, "task queued")
	})

	http.HandleFunc("/finish", func(w http.ResponseWriter, r *http.Request) {
		queue.mu.Lock()
		queue.Pending--
		queue.Done++
		queue.mu.Unlock()
		fmt.Fprintf(w, "task done")
	})

	http.Handle("/debug/vars", expvar.Handler())
	http.ListenAndServe(":8080", nil)
}
```

输出：

```json
{
  "queue_status": {
    "pending": 2,
    "done": 5
  }
}
```

---

### ✅ 示例 5：结合 Prometheus 抓取（桥接）

`expvar` 输出的是 JSON，不是 Prometheus 格式。但可以写一个中间层转成 Prometheus 指标：

```go
package main

import (
	"encoding/json"
	"io"
	"net/http"
)

func main() {
	http.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		resp, _ := http.Get("http://localhost:8080/debug/vars")
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)

		var data map[string]interface{}
		json.Unmarshal(body, &data)

		for key, val := range data {
			switch v := val.(type) {
			case float64:
				fmt.Fprintf(w, "%s %f\n", key, v)
			case map[string]interface{}:
				for sub, num := range v {
					fmt.Fprintf(w, "%s_%s %v\n", key, sub, num)
				}
			}
		}
	})
	http.ListenAndServe(":9090", nil)
}
```

这样 Prometheus 可以抓取 `/metrics` 端点。

---

## 🔐 四、安全与部署注意

| 注意点      | 说明                                                      |
| -------- | ------------------------------------------------------- |
| **安全**   | `/debug/vars` 可能包含内部运行参数，请不要直接暴露在公网。                    |
| **访问控制** | 可以监听本地回环 `127.0.0.1` 或用反向代理加 BasicAuth。                 |
| **性能**   | `expvar` 自身极轻量，但注册 `Func` 时要避免复杂计算。                     |
| **集成**   | 通常与 `/debug/pprof` 一起挂载：<br>`import _ "net/http/pprof"` |

