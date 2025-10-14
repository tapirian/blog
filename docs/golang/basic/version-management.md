# Golang 版本管理

如果有多个项目， 且使用了不同的golang版本，如何优雅得进行版本切换呢？有以下几种方法

## 方法一：GVM
GVM (Go Version Manager) 是一个用于管理多个 Go 版本的工具。它允许你轻松地安装、卸载和切换不同的 Go 版本。

### 安装 GVM
```bash
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
``` 
### 使用 GVM
```bash
# 安装特定版本的 Go
gvm install go1.16.3
# 切换到特定版本的 Go
gvm use go1.16.3
# 设置默认版本
gvm use go1.16.3 --default
# 查看已安装的 Go 版本
gvm list
```
### 系统支持情况
只支持类UNIX系统， Windows不支持。

### 参考链接
https://github.com/moovweb/gvm


## 方法二：golang.org/dl
这个包提供了一个简单的方式来下载和安装不同版本的 Go。

### 安装特定版本的 Go
```bash
go install golang.org/dl/go1.16@latest
go1.16 download
```

### 使用特定版本的 Go
```bash
go1.16 run your_program.go
```
### 系统支持情况
支持所有主要操作系统，包括 Windows、macOS 和 Linux。

### 参考链接
[golang.org/dl](https://pkg.go.dev/golang.org/dl)

## 方法三：asdf
asdf 是一个多语言版本管理工具，支持多种编程语言，包括 Go。

### 安装 asdf
```bash
git clone 
```

### 使用asdf
```bash
# 添加 Go 插件
asdf plugin-add golang
# 安装特定版本的 Go
asdf install golang 1.16.3
# 设置全局版本
asdf global golang 1.16.3
# 设置本地版本（在项目目录下）
asdf local golang 1.16.3
# 查看已安装的 Go 版本
asdf list golang
```
### 系统支持情况
只支持类UNIX系统， Windows不支持

### 参考链接
https://asdf-vm.com/


## 方法四：Windows使用Scoop
Scoop 是一个 Windows 下的命令行安装工具，可以用来安装和管理各种软件包，包括 Go。

### 安装 Scoop
```powershell
Set-ExecutionPolicy RemoteSigned -scope CurrentUser
iwr -useb get.scoop.sh | iex
```

### 使用 Scoop 安装 Go
```powershell
# 安装 Go
scoop install go
# 安装特定版本的 Go
scoop install go@1.16.3
# 切换到特定版本的 Go
scoop reset go@1.16.3
# 查看已安装的 Go 版本
scoop list
```

### 系统支持情况
只支持 Windows 系统。

### 参考链接
https://scoop.sh/


## 方法五：手动安装
你也可以手动下载并安装不同版本的 Go，然后通过修改环境变量来切换版本。

### 下载 Go
访问 [Go 官方下载页面](https://golang.org/dl/) 下载所需版本

### 安装 Go
解压下载的文件到你想安装的位置，例如 `C:\go\Go1.16.3` 或 `/usr/local/go1.16.3`。建议可以将所有golang版本安装到统一目录

### 修改环境变量
将 `GOPATH` 和 `GOROOT` 环境变量指向你想使用的 Go 版本目录。切换脚本（bash）：
```bash
export GOROOT=/usr/local/go1.22.6
export PATH=$GOROOT/bin:$PATH
source ~/.bashrc
go version
```

### 参考链接
[Go 官方下载页面](https://golang.org/dl/)
