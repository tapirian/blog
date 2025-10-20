# Golang反射

Go（Golang）的**反射（reflection）**是通过标准库 `reflect` 包实现的。它的核心思想是：

> “在运行时获知类型信息并对其进行操作。”

编译时我们知道变量的静态类型（static type），但在某些场景（如 JSON 序列化、ORM、通用函数）中，我们需要**在运行时**处理任意类型的数据。这时就用到了反射。 它允许程序在**运行时动态地检查、修改变量的类型和值**。反射非常强大，但是因为其性能较低，且易出错。所以：**仅在无法通过静态类型解决问题时使用反射。**

---

## 一、反射和接口
先看个简单的例子：
```go
	var a int = 42
	var b any
	b = a
	println(a, b)
```
打印结果：
```
42 (0xcf69a0,0xd99ad0)
```
为什么两个结果不相等呢？因为在 Go 运行时，一个接口变量（如 var i interface{}）其实包含两个隐藏信息：
```
interface = (type, value)
```
也就是：
- **type**：保存实际数据的类型信息（如 int、string、struct）
- **value**：保存实际的数据值

使用println 打印接口类型时会显示类型和值的地址，而不是直接的值。而反射可以通过`reflect.TypeOf()` 获interface 中的 type 信息，可以通过`reflect.ValueOf()` 获取 interface 中的 value 信息。

---

## 二、反射的核心类型和函数

### 核心类型
`reflect` 包中有三个最核心的类型：

| 类型              | 说明                                                                                 |
| --------------- | ---------------------------------------------------------------------------------- |
| `reflect.Type`  | 表示 Go 中的类型信息，例如 `int`、`string`、`struct`、`[]int` 等。                                 |
| `reflect.Value` | 表示 Go 中的值信息，可以读取或修改它。                                                              |
| `reflect.Kind`  | 类型的“种类”，是 `Type.Kind()` 返回的枚举值，如 `reflect.Int`, `reflect.Struct`, `reflect.Slice`。 |

---

### 核心函数
| 函数                                     | 作用                                         |
| -------------------------------------- | ------------------------------------------ |
| `reflect.TypeOf(i)`                    | 获取变量 `i` 的类型信息（返回 `reflect.Type`）。         |
| `reflect.ValueOf(i)`                   | 获取变量 `i` 的值信息（返回 `reflect.Value`）。         |
| `reflect.Indirect(v)`                  | 如果 `v` 是指针，返回其指向的值。                        |
| `v.Kind()`                             | 返回值的基本类型（Kind）。                            |
| `v.Interface()`                        | 将 `reflect.Value` 转换回普通的 `interface{}` 类型。 |
| `v.Elem()`                             | 获取指针或容器内的元素值。                              |
| `v.CanSet()`                           | 检查是否可修改                               |
| `v.Set()`、`v.SetInt()`、`v.SetString()` | 设置值（需注意是否可修改）。                     |
| `t.NumField()、t.Field(i)、v.Field(i)`   | 结构体字段数量、第i个字段类型和值         |
| `tfield.Tag.Get("json")`   | 结构体字段json标签          |
| `vfield.Interface()`   | 结构体字段的值          |
| `v.MethodByName()`      | 动态调用方法   |
---

## 三、基础示例：查看和修改

### 查看类型和值

```go
package main

import (
	"fmt"
	"reflect"
)

func main() {
	var x int = 100
	t := reflect.TypeOf(x)
	v := reflect.ValueOf(x)

	fmt.Println("Type:", t)            // Type: int
	fmt.Println("Kind:", t.Kind())     // Kind: int
	fmt.Println("Value:", v)           // Value: 100
	fmt.Println("Value Int:", v.Int()) // 100
}
```

**说明：**

* `Type` 表示类型本身（int）
* `Kind` 表示类型的种类（int、struct、slice等）
* `Value` 是运行时存储的具体值。

---

### 修改变量的值（重点）

要修改变量，**必须传递指针**，因为反射默认是对副本操作。

```go
package main

import (
	"fmt"
	"reflect"
)

func main() {
	x := 100
	v := reflect.ValueOf(&x).Elem() // 获取指针所指向的值

	fmt.Println("Before:", x)
	if v.CanSet() {
		v.SetInt(200)
	}
	fmt.Println("After:", x)
}
```

输出：

```
Before: 100
After: 200
```

**要点：**

* `ValueOf(&x)` 获取的是指针类型。
* `Elem()` 获取指针指向的实际值。
* 必须使用 `CanSet()` 检查是否可修改。

---

## 四、结构体反射

### 查看结构体字段和标签

反射最常用的场景之一是操作结构体，比如 ORM 框架、JSON 序列化。

```go
package main

import (
	"fmt"
	"reflect"
)

type User struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

func main() {
	u := User{"Tom", 30}
	t := reflect.TypeOf(u)
	v := reflect.ValueOf(u)

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		value := v.Field(i)

		fmt.Printf("字段名: %s, 类型: %s, 值: %v, 标签: %s\n",
			field.Name, field.Type, value.Interface(), field.Tag.Get("json"))
	}
}
```

输出：

```
字段名: Name, 类型: string, 值: Tom, 标签: name
字段名: Age, 类型: int, 值: 30, 标签: age
```

---

### 调用结构体方法

反射也可以**调用方法**。

```go
package main

import (
	"fmt"
	"reflect"
)

type Person struct {
	Name string
}

func (p Person) Hello(msg string) {
	fmt.Println("Hello,", p.Name, msg)
}

func main() {
	p := Person{"Alice"}
	v := reflect.ValueOf(p)

	m := v.MethodByName("Hello")
	args := []reflect.Value{reflect.ValueOf("Good morning!")}
	m.Call(args)
}
```

输出：

```
Hello, Alice Good morning!
```

---


## 五、反射的注意事项

1. **性能较低**：反射比普通操作慢 10～100 倍（因为要进行类型判断、内存分配等）。
   👉 因此不推荐频繁使用，可在初始化时缓存 `Type` 和 `Value`。

2. **易出错**：反射代码不直观、难调试。

3. **CanSet() 与 Elem()**：

   * 反射修改值时必须传指针；
   * 必须检查 `CanSet()`。

4. **Type vs Kind**：

   * `Type` 是完整的类型（如 `[]int`, `map[string]int`）；
   * `Kind` 是底层类型（如 `Slice`, `Map`）。

| 示例               | Type           | Kind   |
| ---------------- | -------------- | ------ |
| `int`            | int            | int    |
| `[]int`          | []int          | slice  |
| `map[string]int` | map[string]int | map    |
| `struct{}`       | struct{}       | struct |
| `*int`           | *int           | ptr    |

---

## 六、示例：通用打印任意类型的值

```go
package main

import (
	"fmt"
	"reflect"
)

func PrintAny(i interface{}) {
	v := reflect.ValueOf(i)
	t := reflect.TypeOf(i)

	switch v.Kind() {
	case reflect.Int, reflect.Int64:
		fmt.Println("整数:", v.Int())
	case reflect.String:
		fmt.Println("字符串:", v.String())
	case reflect.Struct:
		fmt.Println("结构体:")
		for i := 0; i < v.NumField(); i++ {
			fmt.Printf("  %s = %v\n", t.Field(i).Name, v.Field(i).Interface())
		}
	default:
		fmt.Println("未知类型:", t)
	}
}

type User struct {
	Name string
	Age  int
}

func main() {
	PrintAny(42)
	PrintAny("GoLang")
	PrintAny(User{"Alice", 20})
}
```
---

## 参考文档
- 标准库： https://pkg.go.dev/reflect
- https://go.dev/blog/laws-of-reflection
- https://wizardforcel.gitbooks.io/gopl-zh/content/ch12/ch12-02.html