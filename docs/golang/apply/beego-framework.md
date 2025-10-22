# Beego框架一文速通
Beego在设计理念上偏向「全家桶式框架（像 Django、Laravel）」，和 Fiber / Echo / Gin 的「轻量化框架」风格形成鲜明对比。它是“自带轮子”的框架，内置了许多功能，诸如：
- CLI工具
- 日志系统
- ORM
- Session / Cache
- 模板引擎

另外它通过**反射**实现了老派MVC框架的**自动路由**功能，即**不用手写路由表,根据控制器里的方法名，框架自动生成 URL → 方法的映射关系**。

Beego使你**不使用三方库就基本可以完成开发**， 但也正是由于它功能模块较多（反射、自动注册路由、ORM 层等），导致额外开销，又基于标准库 net/http作为底层引擎。所以**性能较差**。

---
## bee 工具
Beego 提供了一个 CLI 工具 `bee`，可以帮助我们快速创建项目、生成代码等。
### 安装bee工具：
```
# go 1.16 以前的版本
go get -u github.com/beego/bee/v2

# go 1.16及以后的版本
go install github.com/beego/bee/v2@latest
```
bee 可执行文件默认存放在 `$GOPATH/bin` 里面，请添加 `$GOPATH/bin` 到环境变量。

### 常用命令

可以先查看bee 工具的常用命令，我们打开帮助：
```bash
bee help
```

#### 新建web项目
创建一个新的 Beego Web 项目：
```bash
bee new myproject
```
可以看到项目下生成了一个完整的web项目，包括下面内容：
- 配置文件
- 控制器
- 模型
- 路由映射
- 静态资源文件
- 视图模板文件
  
我们使用`bee run`运行项目，web服务默认运行在8080端口
#### 运行项目
```bash
cd myproject
bee run
```
> 如果无法运行，请执行`go mod tidy`处理包依赖

浏览器打开`http://localhost:8080/`可以看到初始Beego界面。

#### 新建API项目
如果我们的服务只是用作服务端的接口，或者是做网关转发，那么执行`bee api`命令生成一个api项目。
```bash
bee api apiproject
```
我们看到，自动生成的项目文件夹没有了静态文件和模板文件等等，且接口是REST风格，默认使用JSON返回。

## 参考
- 包：https://pkg.go.dev/github.com/astaxie/beego
- 文档： https://github.com/beego/beego-doc/tree/main/docs/zh/v2.3.x
- 源码： https://github.com/beego/beego
- https://git-books.github.io/books/beego