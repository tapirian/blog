---
date: 2024-11-26
title: 多项目开发环境配置文件切换的探讨
category: Golang
tags:
- 架构设计
- Golang
---

# 多项目开发环境配置文件切换的探讨
公司有非常多的项目环境，每个项目环境又有不同的配置，在开发环境处理生产问题的时候，就需要不停地去切换不同的配置文件。那么如何进行优雅的配置切换呢？因此就有了这个探讨。

## 环境模拟
假设我们有三个项目环境，使用同一套工程文件。三个项目环境分别是`ch`、`en`、`jp`。我们的项目结构如下（Golang）：
```
/config
-- ch.ini
-- en.ini
-- jp.ini
-- global.ini
/project
-- main.go
-- go.mod
-- go.sum
```

我们的各个环境的配置为（ch.ini为例）:
```ini
[database]
host = "localhost"
port = "3307"
user = "root"   
password = "123456"
database = "english"
```

我们要做的就是，比较方便、快速地切换到不同地配置文件去运行

## 实现方法
首先，因为所有的配置中的环境都是测试环境，所以应该将其纳入git版本控制中。我们有以下几种方法来实现版本的切换：

### 方法一：使用全局配置
全局配置来配置当前属于哪个环境，以此来决定加载的项目配置：

global.ini: 
```ini
[app]
app_name = "Japan日本"
app_code = "jp"
```
我们根据这个配置来加载：
```go
package main

import (
	"fmt"
	"os"

	"gopkg.in/ini.v1"
)

func main() {
	// 加载全局变量， 获取全局变量信息， 主要是区分不同项目环境
	globalIniPath := "../config/global.ini"
	cfg, err := ini.Load(globalIniPath)
	if err != nil {
		fmt.Printf("Fail to read file: %v", err)
		os.Exit(1)
	}
	fmt.Println("app name:", cfg.Section("app").Key("app_name").String())
	appCode := cfg.Section("app").Key("app_code").String()

	// 根据全局变量， 加载不同的项目配置
	projectConfigPath := fmt.Sprintf("../config/%s.ini", appCode)
	if _, err := os.Stat(projectConfigPath); os.IsNotExist(err) {
		fmt.Printf("Fail to read project config file: %v", err)
		os.Exit(1)
	}

	cfg, err = ini.Load(projectConfigPath)
	if err != nil {
		fmt.Printf("Fail to read project config file: %v", err)
		os.Exit(1)
	}
	fmt.Println("db database:", cfg.Section("database").Key("database").String())
}

```
修改`global.ini`中的`APP_CODE`, 对应配置文件的名称，即可切换到不同的配置文件。

### 方法二：使用命令行参数
如果命令行参数大于等于2，那么第二个是他的配置文件名称。修改方法一中`appCode`的值：
```go
	if len(os.Args) > 1 {
		appCode = os.Args[1]
	}
```
运行：

```bash
 go run main.go en
```
可以看到结果：
```
db database: english
```
> 注：也可以使用flag来实现

### 方法三：使用环境变量
在`main.go`中，可以使用`os.Getenv("APP_CODE")`来获取当前环境变量的值，然后根据不同的环境变量来加载不同的配置文件。

```go
	if envAppCode := os.Getenv("APP_CODE"); envAppCode != "" {
		appCode = envAppCode
		fmt.Println("Using APP_CODE from environment:", appCode)
	}
```
运行：
```bash
APP_CODE=en go run main.go
```

## 扩展
`Nodejs`项目如何实现配置文件的切换呢？可以配置package.json的脚本命令：

```json
{
  "name": "config_load",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "dependencies": {
  },
  "devDependencies": {
  },
  "scripts": {
    "en": "APP_CODE=en node main.js",
    "ch": "APP_CODE=ch node main.js",
    "jp": "APP_CODE=jp node main.js"
  },
  "author": "",
  "license": "GPL"
}
```
程序中可以使用`process.env.APP_CODE`来获取当前环境变量的值，然后根据不同的环境变量来加载不同的配置文件。