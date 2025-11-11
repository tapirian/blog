---
date: 2025-08-19
title: Golang ORM框架XORM一文速通 
category: Golang
tags:
- Golang
- ORM 
---
# XORM一文速通
XORM 是一个简单而强大的 Go 语言 ORM 库，它支持多种数据库（MySQL、PostgreSQL、SQLite 等），提供了简洁的 API 来操作数据库，同时保留了 SQL 的灵活性。它不仅支持数据库迁移、支持缓存、事务等功能，还有**查询构建器工具**`builder`可以来构建复杂查询、**数据库反转工具**`reverse`可以根据现有的数据库结构生成代码。

## 快速入门
### 安装
```
go get xorm.io/xorm 
```

### 简单示例
简单实现以下功能
- 数据库连接
- 同步结构到数据库
- CRUD操作
示例代码：
```go
package main

import (
	"log"

	_ "github.com/mattn/go-sqlite3"
	"xorm.io/xorm"
)

type User struct {
	Id   int64
	Name string `xorm:"varchar(25) notnull unique 'usr_name' comment('姓名')"`
}

func main() {
	// 连接数据库（创建引擎）
	engine, err := xorm.NewEngine("sqlite3", "./test.db")
	if err != nil {
		panic(err)
	}

	user := new(User)
	user.Name = "Putin"

	// 同步结构体到数据库
	err = engine.Sync(new(User))
	if err != nil {
		panic(err)
	}

	// 新增数据
	affected, err := engine.Insert(user)
	if err != nil {
		panic(err)
	}
	println("affected rows: ", affected)
	log.Printf("insert user: %+v \n", *user)

	// 修改数据
	user.Name = "Red"
	_, err = engine.ID(user.Id).Update(user)
	if err != nil {
		panic(err)
	}
	log.Printf("update user: %+v \n", *user)

	// 查询数据
	var selectUser User
	has, err := engine.ID(user.Id).Get(&selectUser)
	if err != nil {
		panic(err)
	}
	if has {
		log.Printf("select user: %+v \n ", selectUser)
	} else {
		println("没有数据")
	}

	// 删除数据
	_, err = engine.ID(user.Id).Delete(new(User))
	if err != nil {
		panic(err)
	}
	println("deleted!!")
}
```

### reverse 工具
`reverse`工具可以根据现有的数据库表结构反向生成程序代码结构。

参考：https://gitea.com/xorm/reverse/src/branch/main/README_CN.md

1. 安装
```bash
go get xorm.io/reverse
```

2. 编写配置文件，以sqlite数据库配置文件为示例`custom.yml`：
```yml
kind: reverse
name: test
source:
  database: sqlite3
  conn_str: "./test.db"
targets:
  - type: codes
    language: golang
    output_dir: ./models
```
3. 执行命令，生成数据表结构映射的代码
```bash
reverse -f ./custom.yml
```
根据配置文件，在当前目录生成`models/models.go`:
```go
package models

type User struct {
	Id      int    `xorm:"not null pk autoincr INTEGER"`
	UsrName string `xorm:"not null unique TEXT"`
}
```

## 参考
- 官网：https://xorm.io 
- gitea: https://gitea.com/xorm/xorm