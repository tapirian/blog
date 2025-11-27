---
# date: 2023-11-11
date: 置顶 
title: Golang中的锁和sync包相关方法详解
category: Golang 
tags:
- Golang
- 锁
- 并发
---

# Golang中的锁和sync包相关方法详解
锁（Lock）是并发编程中用于保护共享资源、避免数据竞争的重要机制。Golang标准库sync主要提供了两种锁，普通互斥锁`sync.Mutex`和读写锁`sync.RWMutex`

## 普通互斥锁sync.Mutex
`sync.Mutex`是最基本的锁类型，用于保护临界区代码，确保同一时间只有一个Goroutine可以访问共享资源。主要特点：
- 阻塞式锁：其他 goroutine 会等待直到锁被释放

### 使用示例
```
type Counter struct {
	mu    sync.Mutex
	value int
}

func (c *Counter) SlowIncrement(id int) {
	fmt.Printf("[协程 %d] 尝试获取锁... (时间: %s)\n", id, time.Now().Format("15:04:05.000"))

	c.mu.Lock()
	fmt.Printf("[协程 %d] ✓ 成功获取锁，开始工作 (时间: %s)\n", id, time.Now().Format("15:04:05.000"))

	// 模拟耗时操作
	c.value++
	fmt.Printf("[协程 %d] 正在处理数据... 当前值=%d\n", id, c.value)
	time.Sleep(2 * time.Second) // 持有锁 2 秒

	fmt.Printf("[协程 %d] 工作完成，释放锁 (时间: %s)\n", id, time.Now().Format("15:04:05.000"))
	c.mu.Unlock()
}

func main() {
	fmt.Println("========== Mutex 阻塞效果演示 ==========")
	fmt.Println()

	counter := &Counter{}
	var wg sync.WaitGroup

	// 启动 5 个协程同时竞争锁
	for i := 1; i <= 10; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			counter.SlowIncrement(id)
		}(i)

		// 稍微错开启动时间，让输出更清晰
		time.Sleep(100 * time.Millisecond)
	}

	wg.Wait()
}
```
可以看到： 只有一个协程能获取锁并执行其；他协程必须等待，直到锁被释放；每个协程持有锁约 2 秒，其他协程被阻塞。

### 适用场景
- 保护共享变量
- 保护共享资源（文件、数据库、网络）
- 保证操作原子性
- 避免静态条件

### 注意事项
- 忘记 Unlock() 会造成死锁。
- 不能重复加锁同一个 Mutex（会死锁）。
- 使用 defer mu.Unlock() 避免遗漏。

## 读写锁sync.RWMutex
`sync.RWMutex` 是一种更复杂的锁，区分读锁和写锁。允许多个读操作并发进行，但写操作是**独占的**。主要特点：
- 读锁（RLock/RUnlock）：允许多个 goroutine 同时持有读锁，不会互相阻塞
- 读锁未释放时，会阻塞写操作。写协程必须等待所有读锁释放
- 写锁（Lock/Unlock）：会阻塞所有读写操作，后续的读协程必须等待写锁释放

### 核心特点对比

| 特性 | RLock (读锁) | Lock (写锁) |
|------|-------------|------------|
| 并发性 | ✅ 多个读锁可共存 | ❌ 独占，阻塞一切 |
| 阻塞写 | ✅ 是 | ✅ 是 |
| 阻塞读 | ❌ 否 | ✅ 是 |
| 适用场景 | 读取数据 | 修改数据 |


### 使用示例
```go
package main 

import (
	"fmt"
	"sync"
	"time"
)

type DataStore struct {
	mu   sync.RWMutex
	data map[string]int
}

func NewDataStore() *DataStore {
	return &DataStore{
		data: make(map[string]int),
	}
}

// 读操作 - 使用读锁
func (ds *DataStore) Read(id int, key string) {
	fmt.Printf("[读协程 %d] 🔍 尝试获取读锁... (时间: %s)\n", id, time.Now().Format("15:04:05.000"))

	ds.mu.RLock()
	fmt.Printf("[读协程 %d] ✓ 获取读锁成功，开始读取 (时间: %s)\n", id, time.Now().Format("15:04:05.000"))

	// 模拟读取操作
	value := ds.data[key]
	fmt.Printf("[读协程 %d] 读取到 %s = %d\n", id, key, value)
	time.Sleep(1 * time.Second) // 模拟读取耗时

	fmt.Printf("[读协程 %d] 读取完成，释放读锁 (时间: %s)\n", id, time.Now().Format("15:04:05.000"))
	ds.mu.RUnlock()
}

// 写操作 - 使用写锁
func (ds *DataStore) Write(id int, key string, value int) {
	fmt.Printf("[写协程 %d] ✏️  尝试获取写锁... (时间: %s)\n", id, time.Now().Format("15:04:05.000"))

	ds.mu.Lock()
	fmt.Printf("[写协程 %d] ✓ 获取写锁成功，开始写入 (时间: %s)\n", id, time.Now().Format("15:04:05.000"))

	// 模拟写入操作
	ds.data[key] = value
	fmt.Printf("[写协程 %d] 写入 %s = %d\n", id, key, value)
	time.Sleep(1 * time.Second) // 模拟写入耗时

	fmt.Printf("[写协程 %d] 写入完成，释放写锁 (时间: %s)\n", id, time.Now().Format("15:04:05.000"))
	ds.mu.Unlock()
}

func main() {
	fmt.Println("========== RWMutex 读写锁演示 ==========\n")

	store := NewDataStore()
	var wg sync.WaitGroup

	// 先初始化一些数据
	store.data["counter"] = 0

	fmt.Println("【场景1】多个读操作可以并发执行")
	fmt.Println("启动 3 个读协程...\n")

	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			store.Read(id, "counter")
		}(i)
		time.Sleep(100 * time.Millisecond)
	}

	wg.Wait()
	time.Sleep(500 * time.Millisecond)

	fmt.Println("\n--------------------------------------------------")
	fmt.Println("【场景2】写操作会阻塞所有读和写")
	fmt.Println("启动 1 个写协程和 2 个读协程...\n")

	// 先启动写操作
	wg.Add(1)
	go func() {
		defer wg.Done()
		store.Write(1, "counter", 100)
	}()

	time.Sleep(200 * time.Millisecond)

	// 再启动读操作（会被写锁阻塞）
	for i := 1; i <= 2; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			store.Read(id, "counter")
		}(i)
		time.Sleep(100 * time.Millisecond)
	}

	wg.Wait()
	time.Sleep(500 * time.Millisecond)

	fmt.Println("\n--------------------------------------------------")
	fmt.Println("【场景3】读操作期间，写操作必须等待")
	fmt.Println("启动 2 个读协程和 1 个写协程...\n")

	// 先启动读操作
	for i := 1; i <= 2; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			store.Read(id, "counter")
		}(i)
		time.Sleep(100 * time.Millisecond)
	}

	time.Sleep(200 * time.Millisecond)

	// 再启动写操作（会被读锁阻塞）
	wg.Add(1)
	go func() {
		defer wg.Done()
		store.Write(2, "counter", 200)
	}()

	wg.Wait()
}
```

### 注意事项
- **读多写少**的场景用 RWMutex，性能更好
- **读写均衡**的场景用普通 Mutex 即可
- 读锁内**不要嵌套**获取写锁（会死锁）

## sync库中其他结构使用
我们再简单介绍一sync库中其他的方法。

### 协程等待组sync.WaitGroup
sync.WaitGroup我们前面例子已经使用过了。`sync.WaitGroup` 是 Go 标准库中的一个**等待组**，用于**等待一组 goroutine 全部执行完毕**。

你可以理解为一个**计数器**：

* 每启动一个 goroutine，就让计数器 +1；
* 每个 goroutine 完成后，让计数器 -1；
* 主线程用 `Wait()` 阻塞，直到计数器变为 0，才继续执行。

#### 常用方法

| 方法           | 说明                         |
| ------------ | -------------------------- |
| `Add(n int)` | 增加等待的 goroutine 数量（计数器 +n） |
| `Done()`     | goroutine 执行完毕时调用，计数器 -1   |
| `Wait()`     | 阻塞当前 goroutine，直到计数器归零     |

#### 简单示例

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 3; i++ {
		wg.Add(1) // 每启动一个 goroutine，就 +1
		go func(id int) {
			defer wg.Done() // 执行完后 -1
			fmt.Printf("Goroutine %d started\n", id)
			time.Sleep(time.Duration(id) * 200 * time.Millisecond)
			fmt.Printf("Goroutine %d finished\n", id)
		}(i)
	}

	fmt.Println("Waiting for goroutines...")
	wg.Wait() // 等待所有 goroutine 完成
	fmt.Println("All goroutines done!")
}
```
---

### 单次执行sync.Once
`sync.Once` 是 Go 提供的一个**只执行一次**的同步工具。
它可以确保某个函数在程序运行过程中 **只会执行一次**（无论多少个 goroutine 调用它）。


| 方法             | 说明                                     |
| -------------- | -------------------------------------- |
| `Do(f func())` | 执行函数 `f`，且保证只执行一次，即使被多个 goroutine 并发调用 |

> ✅ `Do()` 内的函数只会被执行一次，其他 goroutine 会等待它执行完。

#### 应用场景

| 场景       | 说明                        |
| -------- | ------------------------- |
| 初始化资源 | 如配置文件、数据库连接、日志系统等只需要初始化一次 |
| 单例模式  | 确保对象只被创建一次                |
| 懒加载   | 在首次使用时执行初始化逻辑             |

#### 简单示例

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	var once sync.Once
	var wg sync.WaitGroup

	initFunc := func() {
		fmt.Println("Initializing resource...")
	}

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			fmt.Printf("Goroutine %d calling once.Do()\n", id)
			once.Do(initFunc)
		}(i)
	}

	wg.Wait()
	fmt.Println("All goroutines finished.")
}
```

输出：

```
Goroutine 1 calling once.Do()
Initializing resource...
Goroutine 2 calling once.Do()
Goroutine 3 calling once.Do()
Goroutine 4 calling once.Do()
Goroutine 5 calling once.Do()
All goroutines finished.
```

可以看到，即使有多个 goroutine 调用了 `once.Do(initFunc)`，
**`initFunc` 只执行了一次**。

---
### 条件执行sync.Cond
`sync.Cond` 是 Go 的一个**条件变量**，用于在多个 goroutine 之间实现**事件通知机制**。适合用于“等待某个事件发生再继续执行”的场景，比如生产者–消费者模型、任务调度等待、资源可用等待等。

简单来说，它让一个或多个 goroutine：

* **等待某个条件成立**（用 `Wait()`）；
* 当条件满足时，**通知它们继续执行**（用 `Signal()` 或 `Broadcast()`）。

---

#### 常用方法

| 方法            | 说明                                         |
| ------------- | ------------------------------------------ |
| `Wait()`      | 当前 goroutine 等待条件满足，会自动释放关联的锁，直到被唤醒后重新加锁返回 |
| `Signal()`    | 唤醒一个正在等待的 goroutine                        |
| `Broadcast()` | 唤醒所有正在等待的 goroutine                        |
| 创建方式          | `cond := sync.NewCond(&sync.Mutex{})`      |


#### 简单示例

下面示例演示了一个生产者-消费者模型：
消费者等待数据可用，生产者写入数据后通知它们。

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var mu sync.Mutex
	cond := sync.NewCond(&mu)

	dataReady := false

	// 消费者（等待条件）
	go func() {
		mu.Lock()
		for !dataReady { // 条件不满足就等待
			fmt.Println("Consumer: waiting for data...")
			cond.Wait() // 等待时会自动释放锁
		}
		fmt.Println("Consumer: data is ready!")
		mu.Unlock()
	}()

	// 生产者（修改条件并通知）
	time.Sleep(1 * time.Second)
	mu.Lock()
	fmt.Println("Producer: preparing data...")
	dataReady = true
	mu.Unlock()

	cond.Signal() // 通知一个等待的 goroutine

	time.Sleep(500 * time.Millisecond)
	fmt.Println("All done")
}
```

#### 输出示例：
```
Consumer: waiting for data...
Producer: preparing data...
Consumer: data is ready!
All done
```

#### 注意事项

1. **Cond 一定要配合互斥锁使用**（通常是 `sync.Mutex`）。
2. `Wait()` 调用时，会自动释放锁并挂起；被唤醒后会重新获取锁。
3. `Signal()` 通知一个等待者；`Broadcast()` 通知所有等待者。
4. 一般搭配一个布尔条件使用，如 `for !ready { cond.Wait() }`。

---

### 并发安全的Map —— sync.Map

`sync.Map` 是 Go 在 `sync` 包中提供的一个**并发安全的 map**，
用于在多个 goroutine 同时读写时，**避免使用显式的加锁（Mutex）**。
也就是说，`sync.Map`通常适用于**读多写少**的高并发场景不需要你自己写 `mu.Lock()` / `mu.Unlock()`。


#### 常用方法

| 方法                                 | 说明                  |
| ---------------------------------- | ------------------- |
| `Store(key, value)`                | 存储键值对（若已存在则覆盖）      |
| `Load(key)`                        | 获取值（返回 value, ok）   |
| `LoadOrStore(key, value)`          | 若 key 存在返回旧值，否则存入新值 |
| `Delete(key)`                      | 删除键                 |
| `Range(func(key, value any) bool)` | 遍历所有键值对             |

#### 简单示例

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	var m sync.Map

	// 写入数据
	m.Store("name", "Tom")
	m.Store("age", 18)

	// 读取数据
	if value, ok := m.Load("name"); ok {
		fmt.Println("name:", value)
	}

	// LoadOrStore: 如果 key 不存在则写入
	actual, loaded := m.LoadOrStore("city", "Taipei")
	fmt.Println("city:", actual, "loaded:", loaded) // loaded=false 表示新写入

	// 再次调用 LoadOrStore
	actual, loaded = m.LoadOrStore("city", "Tokyo")
	fmt.Println("city:", actual, "loaded:", loaded) // loaded=true 表示已存在

	// 遍历
	m.Range(func(key, value any) bool {
		fmt.Printf("%v = %v\n", key, value)
		return true
	})

	// 删除
	m.Delete("age")
	fmt.Println("After delete:")
	m.Range(func(key, value any) bool {
		fmt.Printf("%v = %v\n", key, value)
		return true
	})
}
```
输出：
```
name: Tom
city: Taipei loaded: false
city: Taipei loaded: true
name = Tom
age = 18
city = Taipei
After delete:
name = Tom
city = Taipei
```

#### 注意事项

  1. **不适合频繁写入、删除的高竞争场景**（性能可能下降）。
  2. `sync.Map` 的内部实现与普通 `map` 不同，**无法直接进行类型断言或取地址**。
  3. 对于**单 goroutine 或低并发**场景，普通 `map` + `sync.Mutex` 性能更好。
  4. 适合读多写少的情况，比如：注册表 / 会话表，用来存放活跃连接、用户状态等

---

### 对象复用池sync.Pool

 `sync.Pool` 是 Go 的高性能**对象复用池**，适合创建和销毁频繁的临时对象场景，可以**降低内存分配开销和垃圾回收压力**。

#### 常用方法

| 方法       | 说明                         |
| -------- | -------------------------- |
| `New`    | 用于创建新对象的函数（当池为空时调用）        |
| `Get()`  | 从池中获取对象，如果池为空，则调用 `New` 创建 |
| `Put(x)` | 使用完对象后放回池中，以便复用            |

#### 简单示例

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	// 创建对象池
	pool := sync.Pool{
		New: func() any {
			fmt.Println("Creating new object")
			buf := make([]byte, 1024) // 1KB 临时缓冲
			return &buf
		},
	}

	// 从池中获取对象
	obj1 := pool.Get().(*[]byte)
	fmt.Println("Got object 1:", len(*obj1))

	// 使用完放回池
	pool.Put(obj1)

	// 再次获取对象（会复用上次的 obj1）
	obj2 := pool.Get().(*[]byte)
	fmt.Println("Got object 2:", len(*obj2))

	// 获取新的对象（池空时会调用 New）
	pool.Put(nil)
	obj3 := pool.Get().(*[]byte)
	fmt.Println("Got object 3:", len(*obj3))
}
```

输出：
```
Creating new object
Got object 1: 1024
Got object 2: 1024
Creating new object
Got object 3: 1024
```

可以看到：

* 第一次 `Get()` 时调用了 `New`；
* 第二次 `Get()` 复用了池里的对象；
* 第三次 `Get()`（池空）再次调用了 `New`。

#### 应用场景

| 场景       | 说明                           |
| -------- | ---------------------------- |
|  临时缓冲区 | 如 `[]byte`、临时 struct，避免频繁 GC |
|  高并发请求 | HTTP 请求处理、日志缓存等              |
|  对象复用  | 减少内存分配，降低性能开销                |

---

### 原子操作 —— sync/atomic

`sync/atomic` 是 Go 提供的一个包，用于**在多线程/多 goroutine 环境下进行原子操作**。

所谓“原子操作”，就是：操作不可被中断，不会出现中间状态。它能让你在不使用锁（`sync.Mutex`）的情况下安全地对**整数或指针**进行并发读写。

#### 常用函数

| 函数                                                        | 说明                   |
| --------------------------------------------------------- | -------------------- |
| `atomic.AddInt32(addr *int32, delta int32)`               | 原子地为变量加上 `delta`     |
| `atomic.LoadInt32(addr *int32)`                           | 原子地读取变量值             |
| `atomic.StoreInt32(addr *int32, val int32)`               | 原子地设置变量值             |
| `atomic.CompareAndSwapInt32(addr *int32, old, new int32)` | 如果当前值等于 old，则更新为 new |
> （还有对应的 `Int64`、`Uint32`、`Uint64`、`Pointer` 版本）            


#### 简单示例

下面的例子演示多个 goroutine 并发递增一个计数器：

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var counter int32 = 0
	var wg sync.WaitGroup

	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			for j := 0; j < 1000; j++ {
				atomic.AddInt32(&counter, 1) // 原子自增
			}
			fmt.Printf("Goroutine %d done\n", id)
		}(i)
	}

	wg.Wait()
	fmt.Println("Final counter:", atomic.LoadInt32(&counter))
}
```

---

输出：

```
Goroutine 0 done
Goroutine 1 done
Goroutine 2 done
Goroutine 3 done
Goroutine 4 done
Final counter: 5000
```

可以看到：即使 5 个 goroutine 同时操作同一个变量，也不会出现数据竞争。


#### 应用场景

| 场景        | 说明                           |
| --------- | ---------------------------- |
| 计数器    | 并发统计数量（如请求数、任务数）             |
| 状态标志   | 例如控制程序初始化一次（可替代 `sync.Once`） |
| 性能敏感场景 | 比 `Mutex` 开销更小，适合高频操作        |

#### 注意事项

1. `atomic` 只能操作基础类型（如 `int32`, `int64`, `uint32`）。
2. 不适合复杂数据结构（要用 `sync.Mutex` 或 `RWMutex`）。
3. 使用时一定要用指针类型（`&counter`）。


## 参考文档
- 标准库： https://pkg.go.dev/sync
- https://go.dev/tour/concurrency/9