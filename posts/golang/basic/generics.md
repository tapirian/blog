---
date: 2025-02-18
title: Golang使用泛型
category: Golang 
tags:
- Golang
---
# Golang 使用泛型

## 一、泛型的概念

**泛型（Generics）** 是 Go 1.18 引入的新特性，它允许你编写可以适用于不同类型的函数或结构体，而不用为每个类型都重复写代码。

简单来说，泛型让你可以写出 **类型安全的通用代码**。

---

## 二、泛型函数定义语法

泛型函数的基本语法是：

```go
func FunctionName[T any](param T) T {
    // ...
}
```

解释：

* `T` 是类型参数（Type Parameter）。
* `[T any]` 表示类型参数列表，`any` 是约束（constraint），意思是“任意类型”。
* 你可以用 `T` 像普通类型一样在函数中使用。

---

### 示例 1：通用的 Swap 函数

```go
package main

import "fmt"

// 泛型函数：交换任意类型的两个值
func Swap[T any](a, b T) (T, T) {
	return b, a
}

func main() {
	x, y := Swap[int](10, 20)
	fmt.Println(x, y) // 输出：20 10

	s1, s2 := Swap[string]("hello", "world")
	fmt.Println(s1, s2) // 输出：world hello
}
```

> Go 的类型推断允许你写成 `Swap(10, 20)`，不用显式写 `[int]`。


## 三、使用约束（Constraint）

有时候我们希望泛型类型支持某些操作，比如：

* 可以比较大小
* 可以求和

这时候需要给类型参数 **添加约束（Constraint）**， 使用**接口类型集**来实现。

### 示例 2：计算切片中最大值

```go
package main

import "fmt"

// 定义一个约束，要求类型支持比较
type Ordered interface {
	~int | ~float64 | ~string
}

// 泛型函数：获取最大值
func Max[T Ordered](a, b T) T {
	if a > b {
		return a
	}
	return b
}

func main() {
	fmt.Println(Max(3, 5))          // int
	fmt.Println(Max(2.7, 1.4))      // float64
	fmt.Println(Max("go", "gopher")) // string
}
```

`~` 表示底层类型约束，例如 `~int` 包括自定义类型 `type MyInt int`。

### 示例 3：计算切片总和
```go
package main

import "fmt"

type Number interface {
	~int | ~float64
}

// 泛型函数：计算总和
func Sum[T Number](nums []T) T {
	var total T
	for _, v := range nums {
		total += v
	}
	return total
}

func main() {
	fmt.Println(Sum([]int{1, 2, 3}))          // 6
	fmt.Println(Sum([]float64{1.5, 2.5, 3.5})) // 7.5
}
```
---

## 四、泛型结构体

结构体也可以使用泛型：

### 示例 4：通用栈（Stack）

```go
package main

import "fmt"

// 泛型栈结构
type Stack[T any] struct {
	data []T
}

// 入栈
func (s *Stack[T]) Push(v T) {
	s.data = append(s.data, v)
}

// 出栈
func (s *Stack[T]) Pop() T {
	if len(s.data) == 0 {
		var zero T
		return zero
	}
	last := s.data[len(s.data)-1]
	s.data = s.data[:len(s.data)-1]
	return last
}

func main() {
	s1 := Stack[int]{}
	s1.Push(10)
	s1.Push(20)
	fmt.Println(s1.Pop()) // 20

	s2 := Stack[string]{}
	s2.Push("hello")
	fmt.Println(s2.Pop()) // hello
}
```

---

## 五、小结

| 特性           | 说明                                  |
| ------------ | ----------------------------------- |
| `[T any]`    | 定义类型参数                              |
| `constraint` | 限制类型参数的能力                           |
| `~` 符号       | 表示底层类型约束                            |
| 泛型结构体        | `type MyStruct[T any] struct {...}` |
| 泛型方法         | 方法也能使用类型参数                          |
