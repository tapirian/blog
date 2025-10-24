# go-chi框架一文速通
chi 是一个非常轻量但功能强大的 Go Web 框架，它几乎就是`net/http`的超集。它没有第三方依赖，核心代码 `github.com/go-chi/chi` 非常小（小于 1000 行代码）。性能上虽不如Fiber极致，但是和gin和echo也非常相近。另外它还包含了一些子包：middleware, render 和 docgen。


简单来一个启动http服务的示例：
```
go get -u github.com/go-chi/chi/v5
```
```go
package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, World!"))
	})
	http.ListenAndServe(":8080", r)
}

```
接下来我们详细看一下Chi框架支持的诸多功能。



## 参考
- 官网：https://go-chi.io
- github: https://github.com/go-chi/chi/