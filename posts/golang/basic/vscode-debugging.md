---
date: 2024-05-27
title: VsCode调试Golang程序
category: Golang 
tags:
- Golang
- VSCode
---
# VSCode 调试Golang程序

## 准备条件

- 安装Go、VSCode
- 安装VSCode Golang插件
- 安装Golang Delve调试器
```bash
go install github.com/go-delve/delve/cmd/dlv@latest
```

## 开始调试
### 1. 创建 `launch.json`

* 打开 VSCode → **Run and Debug** → **create a launch.json** → 选择 **Go**
* 一个典型示例：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Go Program",
            "type": "go",
            "request": "launch",
            "program": "${workspaceFolder}",
            "env": {},
            "args": [],
            "showLog": true
        }
    ]
}
```

* `program` 可以是：

  * `${workspaceFolder}`：整个项目
  * `${fileDirname}`：当前文件夹
  * `${file}`：当前文件
  * 也可以自定义

### 2. 设置断点

* 在代码左侧点击灰色栏 → 出现红点 → 表示断点
* 条件断点：

  * 右键断点 → **Edit Breakpoint** → 输入条件，例如：

    ```text
    i > 5
    ```
  * 只有满足条件才会停

### 3. 启动调试

* **按 F5** 或点击 **Run** 按钮
* **调试面板**：

  * **Variables**：查看局部变量
  * **Watch**：监视表达式
  * **Call Stack**：调用栈
  * **Breakpoints**：断点管理

### 4. 调试操作

* **继续执行 (F5)**
* **单步跳过 (F10)**：执行当前行，不进入函数
* **单步进入 (F11)**：进入函数内部
* **单步退出 (Shift+F11)**：退出当前函数
* **重启 (Ctrl+Shift+F5)**
* **停止 (Shift+F5)**
---

### 5. 调试技巧

#### **1. 使用 `dlvFlags`**

* 可以传递 Delve 参数
* 例如跳过 Go 版本检查：

```json
"dlvFlags": ["--check-go-version=false"]
```

#### **2. 日志断点**

* 不停程序，只打印信息：

```text
fmt.Println("Reached here", i)
```

* 在 VSCode 可以右键断点 → **Log Message**，打印变量而不中断执行

#### **3. Remote Debug（远程调试）**

* 在服务器启动 Delve：

```bash
dlv --headless --listen=:2345 --api-version=2 --accept-multiclient exec ./myapp
```

* VSCode launch.json：

```json
{
    "name": "Remote Debug",
    "type": "go",
    "request": "attach",
    "mode": "remote",
    "remotePath": "/path/to/app",
    "port": 2345,
    "host": "127.0.0.1"
}
```


### 6. launch.json样例
可以支持同一工作区多服务调试，多服务样例：
```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "userServer",
            "type": "go",
            "request": "launch",
            "mode": "auto",
            "program": "./user/main.go",
            "dlvFlags": ["--check-go-version=false"]
        },
        {
            "name": "mapServer",
            "type": "go",
            "request": "launch",
            "mode": "auto",
            "program": "./map/map.go",
            "dlvFlags": ["--check-go-version=false"]
        }
    ]
}
```

1. Go mod 项目最好启用 `go.mod`，路径问题容易出错
2. Windows 用户注意防火墙和管理员权限，否则 Delve 可能启动失败
3. 调试多线程/异步代码时，goroutine 可能跳过断点 → 建议使用条件断点或日志断点

---

## 参考链接
- https://code.visualstudio.com/docs/debugtest/debugging
- https://www.digitalocean.com/community/tutorials/debugging-go-code-with-visual-studio-code
