# Go kit 一文速通

Go kit 是一个用于构建微服务的工具包，旨在帮助开发者创建可扩展、可靠且易于维护的服务。它提供了一套丰富的组件和最佳实践，涵盖了服务发现、负载均衡、日志记录、追踪等方面。它的主要理念是**互操作性**，就是开发者可以轻松地选择数据库、组件、平台和架构。

## 设计理念
Go Kit 遵循 “Clean Architecture”（整洁架构）的思想，将系统分为三层：
- **Service层（业务层）**：纯粹的业务逻辑，不依赖框架，可以独立单元测试；定义接口和实现类。

- **Endpoint层（端点层）**：负责请求的业务处理入口，通常做请求验证、日志、度量、限流等；把每个 service 方法包装成可调用的函数对象。

- **Transport层（传输层）**：把 `endpoint` 暴露成 HTTP/gRPC/NATS 等，处理输入输出，不关心业务逻辑。
```
┌──────────────────────────┐
│        Transport          │ ← HTTP/gRPC/Thrift等协议层
└────────────▲────────────┘
             │
┌────────────┴────────────┐
│        Endpoint           │ ← 请求封装、校验、限流、熔断等
└────────────▲────────────┘
             │
┌────────────┴────────────┐
│         Service           │ ← 核心业务逻辑
└──────────────────────────┘
```

这种分层模式使得：
- 同一业务逻辑可以同时暴露为 HTTP 和 gRPC；
- 测试时不用依赖网络层；
- 中间件（日志、监控、熔断、限流）可以方便地插入。

## 快速入门
我们简单写一个最小的可运行的`Go kit`微服务示例：
提供一个Sum/接口，接收两个int参数，返回他们的和。

### 1. Service 业务层
```go
// service.go
package main

import (
	"context"
)

// 服务层， 定义接口
type AddService interface {
	Sum(ctx context.Context, a, b int) (int, error)
}

// 实现接口
type addService struct{}

func (addService) Sum(ctx context.Context, a, b int) (int, error) {
	return a + b, nil
}

// 创建服务实例
func NewAddService() AddService {
	return addService{}
}
```
### 2. Endpoint 端点层
```go
// endpoint.go
package main

import (
	"context"

	"github.com/go-kit/kit/endpoint"
)

// 请求和响应结构
type SumRequest struct {
	A int `json:"a"`
	B int `json:"b"`
}

type SumResponse struct {
	Result int    `json:"result"`
	Err    string `json:"err,omitempty"`
}

func MakeSumEndpoint(svc AddService) endpoint.Endpoint {
	return func(ctx context.Context, request any) (any, error) {
		req := request.(SumRequest)
		result, err := svc.Sum(ctx, req.A, req.B)
		if err != nil {
			return SumResponse{Result: 0, Err: err.Error()}, nil
		}
		return SumResponse{Result: result}, nil
	}
}
```

### 3. Transport传输层（协议层）
```go
// transport.go
package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-kit/kit/endpoint"
	kithttp "github.com/go-kit/kit/transport/http"
)

// 请求编码
func decodeSumRequest(_ context.Context, r *http.Request) (any, error) {
	var req SumRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		return nil, err
	}
	return req, nil
}

// 响应编码
func encodeSumResponse(_ context.Context, w http.ResponseWriter, response any) error {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	return json.NewEncoder(w).Encode(response)
}

// HTTP 处理器
func MakeHTTPHandler(endpoints endpoint.Endpoint) http.Handler {
	return kithttp.NewServer(
		endpoints,
		decodeSumRequest,
		encodeSumResponse,
	)
}
```

> `err := json.NewDecoder(r.Body).Decode(&req)`是在 Go语言中解析（反序列化）HTTP请求体中的 JSON 数据 的标准写法。调用`NewDecoder`创建一个新的 JSON 解码器（*json.Decoder），调用`Decode` 方法从 JSON 数据中解析内容。

### 4. 入口文件
```go
// main.go
package main

import "net/http"

func main() {
	svc := NewAddService()
	endpoint := MakeSumEndpoint(svc)
	handler := MakeHTTPHandler(endpoint)

	http.ListenAndServe(":8080", handler)
}
```

运行服务：
```bash
go run .
```
> 注意运行服务不要指定文件，使用点`.`代替，因为main包有多个文件，也可以分别把他们都写到命令参数里。

测试请求:
```bash
$ curl -X POST -d '{"a":3,"b":5}' \
>   -H "Content-Type: application/json" \
>   http://localhost:8080
```
结果：
```
{"result":8}
```

## 参考
- 官方：https://gokit.io
- github: https://github.com/go-kit/kit
- go package: https://pkg.go.dev/github.com/go-kit/kit
- https://www.liwenzhou.com/tags/go-kit
