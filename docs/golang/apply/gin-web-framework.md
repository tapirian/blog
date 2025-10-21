# Gin框架一文速通
Gin是一个用Go编写的高性能Web框架，广泛应用于构建Web应用和API服务。

## 主要特性
- **快速，零分配路由**：Gin 在请求匹配（Routing）阶段，不产生任何额外的内存分配。
- **内置渲染**：支持JSON，XML 和 HTML。
- **Crash 处理**：Catch http请求过程中的panic并recover。
- **中间件**：支持一系列中间件，且可自定义，方便扩展。
- **错误管理**：Gin提供了便捷的错误管理，并支持网络发送。

## 使用Gin框架

### 快速入门
Gin依赖安装：
```bash
go get -u github.com/gin-gonic/gin
```
参考：https://gin-gonic.com/zh-cn/docs/quickstart/


### 引擎初始化与路由
#### 简单示例
```go
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})
```

#### 路由组
```go
func main() {
  router := gin.Default()

  // 简单的路由组: v1
  {
    v1 := router.Group("/v1")
    v1.POST("/login", loginEndpoint)
    v1.POST("/submit", submitEndpoint)
  }

  // 简单的路由组: v2
  {
    v2 := router.Group("/v2")
    v2.POST("/login", loginEndpoint)
    v2.POST("/submit", submitEndpoint)
  }

  router.Run(":8080")
}
```

#### 路由参数
参数组获取：
```go
	r := gin.Default()
	r.GET("/user/:name", func(c *gin.Context) {
		user := c.Params.ByName("name")
	})
```
单独获取和通配符匹配剩余所有：
```go
    r := gin.Default()
    r.GET("/user/:name/*action", func(c *gin.Context) {
        name := c.Param("name")
        action := c.Param("action")
    })
```
- :name  匹配 /user/john中的`john`
- *action 匹配 /user/john/send/email中的 `/send/email`

### 上下文拷贝
goroutine中使用gin上下文， 需要调用`c.Copy()`方法复制，因为如果请求结束，初始上下文会被取消。
```go
  router.GET("/long_async", func(c *gin.Context) {
    // 创建在 goroutine 中使用的副本
    cCp := c.Copy()
    go func() {
      // 用 time.Sleep() 模拟一个长任务。
      time.Sleep(5 * time.Second)
      log.Println("Done! in path " + cCp.Request.URL.Path)
    }()
  })
```

### 请求数据绑定和获取
#### 根据Content-Type自动绑定——bind
使用`Bind`绑定将根据请求的 Content-Type 自动选择绑定方法（JSON、Form、XML 等）。支持绑定 请求体 + query string。底层源码实现：
```go
func (c *Context) Bind(obj any) error {
	b := binding.Default(c.Request.Method, c.ContentType())
	return c.MustBindWith(obj, b)
}

func (c *Context) MustBindWith(obj any, b binding.Binding) error {
	err := c.ShouldBindWith(obj, b)
	if err != nil {
		var maxBytesErr *http.MaxBytesError

		// Note: When using sonic or go-json as JSON encoder, they do not propagate the http.MaxBytesError error
		// https://github.com/goccy/go-json/issues/485
		// https://github.com/bytedance/sonic/issues/800
		switch {
		case errors.As(err, &maxBytesErr):
			c.AbortWithError(http.StatusRequestEntityTooLarge, err).SetType(ErrorTypeBind) //nolint: errcheck
		default:
			c.AbortWithError(http.StatusBadRequest, err).SetType(ErrorTypeBind) //nolint: errcheck
		}
		return err
	}
	return nil
}
```
`MustBindWith`使用指定的绑定引擎，**如果发生任何错误，它将以 HTTP 400 中止请求。**



示例请求：
```
curl "http://localhost:8080/getdata?field1=hh&field2=123"
```
示例数据绑定——结构体添加`form`标签
```go
	type structA struct {
		Field1 string `form:"field1"`
		Field2 int    `form:"field2"`
	}

	r.GET("/getdata", func(c *gin.Context) {
		var formA structA
		c.Bind(&formA)
	})
```
使用`Bind`绑定，如果发生任何错误，它将以 HTTP 400 


如果错误需要手动处理，使用`ShouldBind`替换。源码实现：
```go
func (c *Context) ShouldBind(obj any) error {
	b := binding.Default(c.Request.Method, c.ContentType())
	return c.ShouldBindWith(obj, b)
}
```
使用`ShouldBind`:
```go
	err := c.Bind(&formA)
    if err != nil {
        // ....
    }
```

#### 指定Content-Type绑定——BindJSON
如果需要绑定特定请求Content-type的数据，则使用BindXXX系列方法，例如：
- BindJSON
- BindQuery
- BindUri
- BindHeader
- BindXML
- BindYAML
  
来看BindJSON源码实现，其他方法类似：
```go
func (c *Context) BindJSON(obj any) error {
	return c.MustBindWith(obj, binding.JSON)
}
```
因为底层调用了`MustBindWith`方法，所以发生任何错误，它将以 HTTP 400响应到客户端，如果想避免，则使用`ShouldBindXXX`系列，如：`ShouldBindJSON`。

#### 绑定多次：绑定到不同的结构体——ShouldBindBodyWith
如果想要绑定到不同结构体，使用`c.ShouldBindBodyWith`，这会在绑定之前将 body 存储到上下文中，方便多次绑定，这会对性能造成轻微影响。

官网示例代码：
```go
func SomeHandler(c *gin.Context) {
  objA := formA{}
  objB := formB{}
  // 读取 c.Request.Body 并将结果存入上下文。
  if errA := c.ShouldBindBodyWith(&objA, binding.JSON); errA == nil {
    c.String(http.StatusOK, `the body should be formA`)
  // 这时, 复用存储在上下文中的 body。
  } else if errB := c.ShouldBindBodyWith(&objB, binding.JSON); errB == nil {
    c.String(http.StatusOK, `the body should be formB JSON`)
  // 可以接受其他格式
  } else if errB2 := c.ShouldBindBodyWith(&objB, binding.XML); errB2 == nil {
    c.String(http.StatusOK, `the body should be formB XML`)
  } else {
    ...
  }
}
``` 
也可以使用快捷方法：
```go
c.ShouldBindBodyWithJSON(&objA)
```

#### 单独获取查询字符串和表单参数
```
POST /post?id=1234&page=1 HTTP/1.1
Content-Type: application/x-www-form-urlencoded

name=manu&message=this_is_great
```

```go
func main() {
  router := gin.Default()

  router.POST("/post", func(c *gin.Context) {

    id := c.Query("id")
    page := c.DefaultQuery("page", "0")
    name := c.PostForm("name")
    message := c.PostForm("message")
  })
  router.Run(":8080")
}
```

### JSON数据响应
Gin框架支持JSON数据的快捷渲染，调用`c.JSON()`方法。
#### JSON官方示例：
```go
  router := gin.Default()
  // gin.H 是 map[string]interface{} 的一种快捷方式
  router.GET("/someJSON", func(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"message": "hey", "status": http.StatusOK})
  })
```
也可以使用结构体：
```go
 router.GET("/moreJSON", func(c *gin.Context) {
    // 你也可以使用一个结构体
    var msg struct {
      Name    string `json:"user"`
      Message string
      Number  int
    }
    msg.Name = "Lena"
    msg.Message = "hey"
    msg.Number = 123
    // 注意 msg.Name 在 JSON 中变成了 "user"
    // 将输出：{"user": "Lena", "Message": "hey", "Number": 123}
    c.JSON(http.StatusOK, msg)
```
> yaml、xml、protoBuf更多示例参见：https://gin-gonic.com/zh-cn/docs/examples/rendering/

#### 原始JSON展示（不解析HTML）
通常json使用unicode替换特殊的HTML字符：
```go
	r.GET("/json", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"html": "<b>Hello, 中国!</b>",
		})
	})
```
```
$ curl "http://localhost:8080/json"
{"html":"\u003cb\u003eHello, 中国!\u003c/b\u003e"}
```
如何保持HTML标签原样输出呢？使用`PureJSON`方法：
```
	r.GET("/purejson", func(c *gin.Context) {
		c.PureJSON(200, gin.H{
			"html": "<b>Hello, 中国!</b>",
		})
	})
```
```
$ curl "http://localhost:8080/purejson"
{"html":"<b>Hello, 中国!</b>"}
```
#### JSON劫持防止
为了防止JSON劫持攻击，可以使用`c.SecureJSON`方法，会在JSON响应前添加`while(1);`前缀：
```go
    r.GET("/securejson", func(c *gin.Context) {
        data := []string{"one", "two", "three"}
        c.SecureJSON(200, data)
    })
```
```
$ curl "http://localhost:8080/securejson"
while(1);["one","two","three"]
```

### 数据验证
数据验证基于库：https://pkg.go.dev/github.com/go-playground/validator/v10

#### 基本使用
我们可以用 binding:"required" 等标签在结构体上直接声明验证规则。
```go
type RegisterForm struct {
    Username string `json:"username" binding:"required,min=3,max=20"`
    Password string `json:"password" binding:"required,min=6"`
    Age      int    `json:"age" binding:"gte=1,lte=120"`
}
func main() {
    r := gin.Default()
    r.POST("/register", func(c *gin.Context) {
        var form RegisterForm
        // 绑定并自动验证
        if err := c.ShouldBindJSON(&form); err != nil {
            c.JSON(400, gin.H{"error": err.Error()})
            return
        }

        c.JSON(200, gin.H{"message": "注册成功"})
    })

    r.Run()
}
```
#### 常见验证标签
| 标签                          | 说明              | 示例                            |
| --------------------------- | --------------- | ----------------------------- |
| `required`                  | 必填字段            | `binding:"required"`          |
| `min` / `max`               | 字符串长度或数值大小      | `binding:"min=3,max=20"`      |
| `len`                       | 长度必须等于某值        | `binding:"len=6"`             |
| `eq` / `ne`                 | 必须等于 / 不等于某值    | `binding:"eq=1"`              |
| `gt` / `gte` / `lt` / `lte` | 大于（等于） / 小于（等于） | `binding:"gte=1,lte=100"`     |
| `email`                     | 邮箱格式验证          | `binding:"required,email"`    |
| `url`                       | URL 格式验证        | `binding:"url"`               |
| `oneof`                     | 必须是给定值之一        | `binding:"oneof=male female"` |
| `uuid`                      | UUID 格式         | `binding:"uuid"`              |
| `omitempty`                 | 若为空则跳过验证        | `binding:"omitempty,email"`   |

#### 错误处理
验证失败时的错误返回一般是一个 validator.ValidationErrors 类型
```go
if err := c.ShouldBindJSON(&form); err != nil {
    var verrs validator.ValidationErrors
    if errors.As(err, &verrs) {
        errs := make(map[string]string)
        for _, e := range verrs {
            errs[e.Field()] = e.ActualTag() // 比如 "required", "email"
        }
        c.JSON(400, gin.H{"validation_errors": errs})
        return
    }
    c.JSON(400, gin.H{"error": err.Error()})
}
```

输出示例：
```
{
  "validation_errors": {
    "Username": "required",
    "Password": "min"
  }
}
```

#### 自定义验证规则
可以通过 `validator.RegisterValidation` 注册自定义验证函数:

示例：验证用户名不包含"admin"
```go
import (
    "github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
    validate = validator.New()
    // 注册自定义规则
    validate.RegisterValidation("noadmin", func(fl validator.FieldLevel) bool {
        return !strings.Contains(fl.Field().String(), "admin")
    })
}

type User struct {
    Name string `json:"name" binding:"required,noadmin"`
}
```
在 gin 中也可以全局注册：
```go
if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
    v.RegisterValidation("noadmin", func(fl validator.FieldLevel) bool {
        return !strings.Contains(fl.Field().String(), "admin")
    })
}
```

#### 验证信息多语言实现
Gin 默认返回英文错误，你可以结合 validator/v10/translations 使用多语言支持：
```go
import (
    ut "github.com/go-playground/universal-translator"
    "github.com/go-playground/locales/zh"
    zh_translations "github.com/go-playground/validator/v10/translations/zh"
)

func initValidator() {
    zhT := zh.New()
    uni := ut.New(zhT)
    trans, _ := uni.GetTranslator("zh")

    if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
        zh_translations.RegisterDefaultTranslations(v, trans)
    }
}
```
然后在错误处理中使用 Translate(trans) 输出中文提示。

### 中间件使用

### 错误处理

### 日志记录

### 静态文件和模板渲染

## 参考文档
- 官网： https://gin-gonic.com/
- 依赖包：https://pkg.go.dev/github.com/gin-gonic/gin
- 验证器：https://pkg.go.dev/github.com/go-playground/validator/v10