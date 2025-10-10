# Golang中的通道
Golang中的通道分为有缓冲通道和无缓冲通道。


## 主要特性总结
**无缓冲通道**
- 容量为0
- 发送操作会阻塞，直到有接收者接收数据
- 接收操作会阻塞，直到有发送者发送数据
- 同步阻塞，必须发送者和接收者同时准备好才能完成

**有缓冲通道**
- 容量在通道创建时指定缓冲大小
- 发送操作，当缓冲区满的时候会阻塞
- 接收操作，当缓冲区为空时会阻塞
- 异步特性，缓冲区未满，发送不会阻塞；缓冲区有值，接收不会阻塞

## 应用示例
### 无缓冲通道
无缓冲通道可以用做以下场景
- 严格的发送-接收同步
- 实现事件通知或者信号传递
- 请求-响应模式的工作协调
#### 严格同步
先模拟发送阻塞，示例代码：
```go
func main() {
	ch := make(chan string)

	go func() {
		fmt.Println("Goroutine: 准备发送数据...")
		ch <- "Hello" // 这里会阻塞，直到有接收者
		fmt.Println("Goroutine: 数据已被接收")
	}()

	time.Sleep(2 * time.Second) // 模拟主goroutine做其他事情
	fmt.Println("Main: 准备接收数据...")
	msg := <-ch // 接收数据
	fmt.Println("Main: 收到数据:", msg)
}
```
输出结果：
```
Goroutine: 准备发送数据...
Main: 准备接收数据...
Main: 收到数据: Hello
Goroutine: 数据已被接收
```
可以看到，先输出“准备发送数据”，接收阻塞，两秒之后输出“准备接收数据”，然后才开始发送。**这里发送被阻塞了，因为接收者没有准备好**，延迟两秒之后，正常发送。发送和接收**同步**进行。


修改延时位置，模拟接收阻塞，示例代码：
```go
func main() {
	ch := make(chan string)

	go func() {
		time.Sleep(2 * time.Second)
		fmt.Println("Goroutine: 准备发送数据...")
		ch <- "Hello" // 这里会阻塞，直到有接收者
		fmt.Println("Goroutine: 数据已被接收")
	}()

	fmt.Println("Main: 准备接收数据...")
	msg := <-ch // 接收数据
	fmt.Println("Main: 收到数据:", msg)
}
```
输出结果：
```
Main: 准备接收数据...
Goroutine: 准备发送数据...
Goroutine: 数据已被接收
Main: 收到数据: Hello
```

#### 握手信号（阻塞等待，完成后通知）
有些场景，需要等待某个协程执行完之后进行下一步，可以利用无缓冲通道阻塞等待。示例代码：
```go
func main() {
	done := make(chan bool)

	go func() {
		fmt.Println("执行耗时任务...")
		time.Sleep(1 * time.Second)
		fmt.Println("任务完成!")
		done <- true // 发送完成信号
	}()

	fmt.Println("等待任务完成...")
	<-done // 阻塞直到收到完成信号
	fmt.Println("收到完成信号，继续执行")
}
```

#### 工作协调
工作者循环处理工作任务，将单条任务结果发送给无缓冲通道，然后等待协调者确认，确认完成后继续处理下一条任务。示例：
```go
func main() {
	ch := make(chan int)

	// 工作者
	go func() {
		for i := 1; i <= 3; i++ {
			fmt.Printf("工作者: 处理任务 %d\n", i)
			time.Sleep(500 * time.Millisecond)
			ch <- i // 发送结果，等待确认
			fmt.Printf("工作者: 任务 %d 已确认\n", i)
		}
		close(ch)
	}()

	// 协调者
	for result := range ch {
		fmt.Printf("协调者: 收到结果 %d，进行验证\n", result)
		time.Sleep(300 * time.Millisecond)
	}
}
```
### 有缓冲通道
有缓冲通道可以用作以下场景
- 实现生产者-消费者工作队列
- 限流控制并发数量（信号量模式）
- 批量处理

#### 实现工作队列
生产者生产消息之后，消费者慢速消费。达到通道容量之后，生产者不再往通道添加数据，直到消费者再次消费至通道容量未满。
```go
func main() {
	fmt.Println("\n=== 有缓冲通道示例1: 生产者消费者 ===")
	ch := make(chan int, 3) // 缓冲区大小为3

	// 生产者
	go func() {
		for i := 1; i <= 5; i++ {
			fmt.Printf("生产者: 生产数据 %d\n", i)
			ch <- i
			fmt.Printf("生产者: 数据 %d 已放入通道 (缓冲: %d/%d)\n", i, len(ch), cap(ch))
			time.Sleep(200 * time.Millisecond)
		}
		close(ch)
	}()

	// 消费者（慢速）
	time.Sleep(1 * time.Second) // 延迟启动消费者
	fmt.Println("消费者: 开始消费...")
	for data := range ch {
		fmt.Printf("消费者: 消费数据 %d\n", data)
		time.Sleep(500 * time.Millisecond)
	}
}
```
#### 限流控制
有这样一个场景：有 8 个任务要执行，但一次最多只允许同时执行 3 个。我们使用有缓冲通道来限流控制。

每次启动一个任务前，先执行 `semaphore <- struct{}{}`，向通道中放入一个空结构体（占一个位置）。如果通道未满，则立即成功；如果通道已满（说明已有 3 个任务在执行），则会阻塞直到有任务完成并释放一个位置。
```go
func main() {
	maxConcurrent := 3
	semaphore := make(chan struct{}, maxConcurrent)

	tasks := 8
	for i := 1; i <= tasks; i++ {
		semaphore <- struct{}{} // 获取令牌

		go func(id int) {
			defer func() { <-semaphore }() // 释放令牌

			fmt.Printf("任务 %d 开始执行\n", id)
			time.Sleep(1 * time.Second)
			fmt.Printf("任务 %d 完成\n", id)
		}(i)
	}

	// 等待所有任务完成
    // 保证最后三条任务完成之后，再退出主程序（通道满了，会阻塞等待）
    // 这里或者使用sync.WaitGroup更为直观
	for i := 0; i < maxConcurrent; i++ {
		println(i)
		semaphore <- struct{}{}
	}
	fmt.Println("所有任务已完成")
}
```

#### 批量处理
实现了一个**批量收集（batching）**的模式：有一个专门的 goroutine 从带缓冲通道 ch 读取整数，按 batchSize（此处为 5）把数据聚成一批处理；主 goroutine 发送 12 个数据后关闭 ch，并通过 done 通道等待收集器把剩余数据处理完再退出。示例代码：
```go
func main() {
	batchSize := 5
	ch := make(chan int, batchSize)
	done := make(chan bool)

	// 数据收集器
	go func() {
		batch := make([]int, 0, batchSize)
		for num := range ch {
			batch = append(batch, num)
			if len(batch) == batchSize {
				fmt.Printf("处理批次: %v\n", batch)
				batch = batch[:0] // 清空批次
			}
		}
		if len(batch) > 0 {
			fmt.Printf("处理最后批次: %v\n", batch)
		}
		done <- true
	}()

	// 发送数据
	for i := 1; i <= 12; i++ {
		ch <- i
	}
	close(ch)
	<-done
}
```

## 通道关闭

### 不关闭的后果

不关闭通道有时会造成严重后果，比如以下场景:
#### Goroutine泄露（最严重）
如果有goroutine在等待从通道接收数据，而通道永远不关闭且没有数据发送，这些goroutine会永远阻塞，造成goroutine泄露。

#### range循环永不退出
使用 for range 遍历通道时，如果通道不关闭，循环永远不会结束。

#### 资源无法释放
等待通道的goroutine会持有相关资源（内存、文件句柄等），导致资源无法及时释放。

### 通道关闭规则
- 只能发送端（生产者）关闭，接收端不要关闭通道；
- 只能关闭一次，再次关闭会触发panic;
- 关闭后仍可安全读取剩余数据；
- 读取已关闭且空的通道返回零值且 ok=false；
- 写入已关闭通道必然 panic。