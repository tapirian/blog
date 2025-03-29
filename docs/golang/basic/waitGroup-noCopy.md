# sync.WaitGroup的noCopy机制

## 问题背景
当代码中对`WaitGroup`进行赋值、函数传参或返回值时，`go vet`会检查是否存在值拷贝行为，并抛出警告：
```bash
call of xxx copies lock value: sync.WaitGroup contains sync.noCopy
```

---

## 错误剖析

### 1. `noCopy` 机制的作用
Golang 在同步工具源码中内嵌防拷贝标记：
```go
// sync.WaitGroup 源码节选
type WaitGroup struct {
    noCopy  noCopy
    state1  [3]uint32
}

// noCopy 实现逻辑
type noCopy struct{}
func (*noCopy) Lock() {}   // 空方法实现 Locker 接口
func (*noCopy) Unlock() {}
```

noCopy 通过实现 `Lock()` 和 `Unlock()` 空方法，使结构体实现 `sync.Locker` 接口，从而触发 `go vet` 的 `-copylocks` 检测规则。

### 2. 错误场景示例

| 场景类型         | 错误代码示例                          |
|------------------|---------------------------------------|
| 函数参数值传递   | `func Process(wg sync.WaitGroup)`     |
| 结构体值类型嵌入 | `type Task struct { wg sync.WaitGroup }` |


### 3. 设计原因
当 `WaitGroup` 值拷贝时，副本与原实例的计数器状态分离，可能造成：
- 协程等待永远无法结束（死锁）
- 计数器值不一致导致 panic

---

## 解决方案

### 方案 1：指针传递
```go
// 错误示例
func arg(wg sync.WaitGroup) {} // ❌ 值传递

// 正确示例
func arg(wg *sync.WaitGroup) { // ✅ 指针传递
    defer wg.Done()
}
```


### 方案 2：结构体指针嵌入
```go
// 错误示例
type Service struct {
    wg sync.WaitGroup // ❌ 值类型嵌入
}

// 正确示例
type Service struct {
    wg *sync.WaitGroup // ✅ 指针类型嵌入
}
```

### 定期检测
定期运行 `go vet ./...` 检查项目中的非法拷贝操作。

使用 `go run -race` 检测运行时竞态条件，补充静态检查的不足。

---

## 扩展

### 自定义实现防拷贝机制
```go
type noCopy struct{}
func (*noCopy) Lock() {} // 实现 Locker 接口
func (*noCopy) Unlock() {}

type SafeBuffer struct {
noCopy // 内嵌防拷贝标记
mu sync.Mutex
buf []byte
}
```

## 总结
Sync.WaitGroup作为结构体属性或方法参数时，优先指针类型传递或嵌入，禁用值类型。eg:
`func F(wg *WaitGroup)` 或 `type T struct { wg *WaitGroup }` 