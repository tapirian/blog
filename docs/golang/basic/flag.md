# 标准库之flag包
flag包是 Go 标准库中的一个包，用于处理命令行参数。
它提供了一种简单的方式来定义和解析命令行参数，并且可以方便地获取命令行参数的值。

## 基础示例
```go
package main

import (
    "flag"
    "fmt"   
)

func main() {
    var name string
    var age int

    // 定义命令行参数
    flag.StringVar(&name, "name", "", "姓名")
    flag.IntVar(&age, "age", 0, "年龄")

    // 解析命令行参数
    flag.Parse()

    // 获取命令行参数的值
    fmt.Println("姓名:", name)
    fmt.Println("年龄:", age)
}
```

在上面的示例中，我们定义了两个命令行参数：`name` 和 `age`。
- `flag.StringVar()` 和 `flag.IntVar()` 函数用于定义命令行参数的类型和默认值。
- `flag.Parse()` 函数用于解析命令行参数。

此外，还有也可以直接使用`flag.String()`和`flag.Int()`来获取命令行参数，方法返回值是**指针**，示例：

```go
package main

import (
    "flag"
    "fmt"
)

func main() {    
    name := flag.String("name", "", "姓名")
    age := flag.Int("age", 0, "年龄")

    flag.Parse()

    fmt.Println("姓名:", *name)
    fmt.Println("年龄:", *age)
}
```

## NewFlagSet 示例
可以使用`flag.NewFlagSet()`来创建一个新的标志集，示例：

```go
package main

import (
	"flag"
	"fmt"
	"os"
)

type User struct {
	Name string
	Age  int
}

var currentUser User = User{
	Name: "张三",
	Age:  18,
}

func main() {
	var name string
	var age int
	// 创建新的标志集
	setCmd := flag.NewFlagSet("setUser", flag.ExitOnError)
	setCmd.StringVar(&name, "name", "", "姓名")
	setCmd.IntVar(&age, "age", 0, "年龄")

	getCmd := flag.NewFlagSet("getUser", flag.ExitOnError)

	// 解析命令行参数
	if os.Args[1] == "setUser" {
		setCmd.Parse(os.Args[2:])
		currentUser.Name = name
		currentUser.Age = age
		fmt.Printf("setUser Success: 姓名:%s \t 年龄:%d\n", currentUser.Name, currentUser.Age)
	} else if os.Args[1] == "getUser" {
		getCmd.Parse(os.Args[2:])
		fmt.Printf("getUser: 姓名:%s \t 年龄:%d\n", currentUser.Name, currentUser.Age)
	} else {
		fmt.Println("无效的命令")
		return
	}
}
```

调用示例：

```bash
$ go run 28-flag.go getUser
getUser: 姓名:张三       年龄:18

$ go run 28-flag.go setUser -name zhangsan -age 19
setUser Success: 姓名:zhangsan   年龄:19
```

## 扩展
可以使用`os.Args`来获取命令行参数，示例：

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    fmt.Println("命令行参数:", os.Args)
}
```
调用示例：

```bash
$ go run main.go arg1 arg2
命令行参数: [main.go arg1 arg2]
```

## 参考
- 标准库：https://pkg.go.dev/flag
- https://www.liwenzhou.com/posts/Go/flag/