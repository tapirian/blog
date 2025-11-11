---
date: 2025-02-14
title: go-zero框架一文速通 
category: Golang
tags:
- Golang
- web framework
- 微服务 
---
# go-zero框架一文速通
go-zero是字节开发的开源的web 和 rpc 框架。它有内建级联超时控制、限流、自适应熔断、自适应降载等微服务治理能力，原生支持 RPC、服务发现、注册、配置中心等，且可以通过代码生成器 goctl，自动生成接口、RPC、Model 等代码。入门简单，结构清晰。


## 快速上手
go-zero项目一般先定义好api文件，然后通过代码生成器`goctl`来生成，我们简单来生成一个http服务。

### 安装goctl
1. 安装：`go install github.com/zeromicro/go-zero/tools/goctl@latest`
2. 验证：`goctl --version`


### 安装go-zero
我们使用go module模式：
1. 创建文件夹`go-zero-demo`
2. 进入文件夹，运行`go mod init go-zero-demo`
3. 安装go-zero: `go get -u github.com/zeromicro/go-zero@latest`

### 编写api文件，并自动生成代码
api 是 go-zero 自研的领域特性语言，用来生成 HTTP 服务最基本的描述语言。

api 领域特性语言包含语法版本，info 块，结构体声明，服务描述等几大块语法组成，其中结构体和 Golang 结构体 语法几乎一样，只是移出了 struct 关键字。

详见末尾参考： [api语法](https://go-zero.dev/docs/tutorials)、[api规范](https://go-zero.dev/docs/tutorials)

我们新建一个`user.api`文件，内容如下：
```
syntax = "v1"

info (
	title:   "User API"
	desc:    "用户服务接口"
	author:  "HAITUO"
	version: "1.0"
)

type (
	UserReq {
		Name string `form:"name"`
	}
	UserResp {
		Message string `json:"message"`
	}
)

service user-api {
	@handler Greet
	get /api/user/greet (UserReq) returns (UserResp)
}
```
然后我们使用goctl生成完整的项目结构：
```bash
goctl api go -api user.api -dir .
```
生成后会看到如下目录结构：
```
.
├── go.mod
├── go.sum
├── user.api
├── user.go
├── etc
│   └── user-api.yaml
├── internal
│   ├── config
│   │   └── config.go
│   ├── logic
│   │   └── greetlogic.go
│   ├── handler
│   │   └── greethandler.go
│   │   └── routes.go
│   ├── svc
│   │   └── servicecontext.go
│   └── types
│   |   └── types.go

```
然后需要运行go mod tidy解决依赖
```bash
go mod tidy
```

### 修改生成代码，并启动服务
接下来，我们修改一下`/api/user/greet`的返回：
修改`GreenLogic.Greet`方法:
```go
func (l *GreetLogic) Greet(req *types.UserReq) (resp *types.UserResp, err error) {
	// todo: add your logic here and delete this line
	resp = &types.UserResp{
		Message: "Hello, " + req.Name + "!",
	}
	return
}
```
启动并测试：
```bash
go run user.go
```
因为我们的参数结构体`tag`是`form`不是`json`， 所以querystring传参：
```
$ curl http://localhost:8888/api/user/greet?name=james
{"message":"Hello, james!"}
```



## 参考
- 官网：https://go-zero.dev
- github: https://github.com/zeromicro/go-zero
- go-zero api语法：https://go-zero.dev/docs/tasks/dsl/api
- go-zero api规范：https://go-zero.dev/docs/tutorials