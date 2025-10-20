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


### 路由和路由组

### 请求上下文和上下文拷贝


### 请求数据绑定


### JSON数据验证


### 错误处理

### 中间件使用

### 模板渲染

## 参考文档
- 官网： https://gin-gonic.com/
- 依赖包：https://pkg.go.dev/github.com/gin-gonic/gin