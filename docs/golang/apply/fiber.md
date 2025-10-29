# Fiber框架一文速通
Fiber框架受Express.js启发，API 设计非常接近 Node.js，所以比较易上手。它的官方定位是简化开发的同时兼顾性能。http引擎使用`Fasthttp`，号称是最快的http引擎。同时，基本的Web框架功能，诸如路由组、JSON解析、模板渲染、中间件等都是支持的。

简单来一个启动http服务的示例：
```
go get github.com/gofiber/fiber/v2
```
```go
package main

import "github.com/gofiber/fiber/v2"

func main() {
	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.Listen(":3000")
}
```
接下来我们详细看一下Fiber框架支持的诸多功能。



## 参考
- 官网：https://gofiber.io/