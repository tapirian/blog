---
date: 2024-03-17
title: Golang ORM框架Ent一文速通
category: Golang
tags:
- Golang
- ORM 
---
# Golang ORM框架Ent一文速通
Ent 是由 Meta（原 Facebook）开发的 Go 语言 ORM 框架，专注于实体关系建模和代码生成，以类型安全、高性能和简洁的 API 著称。与传统 ORM 依赖反射不同，Ent 基于代码生成机制，在编译期生成类型安全的数据库操作代码，避免了运行时反射的性能损耗，同时提供了清晰的实体关系管理能力。

## 核心特性
- **类型安全**：通过代码生成确保所有数据库操作（查询、更新等）在编译期校验，避免运行时类型错误。
- **实体关系支持**：原生支持一对一、一对多、多对多等复杂关系，关系定义直观。
- **自动迁移**：内置数据库迁移工具，可自动生成和执行 schema 变更 SQL（无需手动写 DDL）。
- **流畅查询 API**：提供链式调用的查询接口，语法简洁易读（类似 WHERE ... AND ... ORDER BY 的自然映射）。
- **多数据库支持**：兼容 MySQL、PostgreSQL、SQLite、MariaDB 等主流数据库。
- **扩展性**：支持自定义钩子（Hooks）、索引、事务等高级特性。

## 快速上手
简单写一个`CRUD`的小例子，方便我们快速上手：

### 1、环境准备和安装
1. 创建项目并初始化Gomokuai 
```bash
mkdir ent-demo && cd ent-demo
go mod init ent-demo  # 初始化模块（模块名自定义）
```
2. 安装Ent
```bash
go get entgo.io/ent@latest  # 安装最新版本
```
3. 使用Ent命令行工具创建实体
```bash
# 创建 User 实体（会生成 ent/schema/user.go）
go run -mod=mod entgo.io/ent/cmd/ent new User
```
4. 定义实体结构(schema/user.go)
```go
// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").Default("unknown"),
		field.Int("age"),
	}
}
```
5. 使用`go generate`生成代码
```bash
go generate ./ent
```
生成结构：
```
ent
├── client.go
├── config.go
├── context.go
├── ent.go
├── generate.go
├── mutation.go
... truncated
├── schema
│   └── user.go
├── tx.go
├── user
│   ├── user.go
│   └── where.go
├── user.go
├── user_create.go
├── user_delete.go
├── user_query.go
└── user_update.go
```
6. 数据库连接和CRUD操作示例：
```go
package main

import (
	"context"
	"ent_demo/ent"
	"ent_demo/ent/user"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	client, err := ent.Open("sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
	if err != nil {
		panic(err)
	}
	defer client.Close()

	ctx := context.Background()
	if err := client.Schema.Create(ctx); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	_, err = CreateUser(ctx, client)
	if err != nil {
		log.Fatalf("failed creating user: %v", err)
	}

	_, err = QueryUser(ctx, client)
	if err != nil {
		log.Fatalf("failed querying user: %v", err)
	}

	_, err = UpdateUser(ctx, client)
	if err != nil {
		log.Fatalf("failed querying user: %v", err)
	}

	_, err = QueryUser(ctx, client)
	if err != nil {
		log.Fatalf("failed querying user: %v", err)
	}

	_, err = DeleteUser(ctx, client)
	if err != nil {
		log.Fatalf("failed querying user: %v", err)
	}
}

func CreateUser(ctx context.Context, client *ent.Client) (*ent.User, error) {
	u, err := client.User.
		Create().
		SetName("James").
		SetAge(19).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	log.Println("User is Created:", u)
	return u, nil
}

func QueryUser(ctx context.Context, client *ent.Client) (*ent.User, error) {
	u, err := client.User.
		Query().
		Where(user.Name("James")).
		Only(ctx)

	if err != nil {
		return nil, err
	}

	log.Println("User returned:", u)
	return u, nil
}

func UpdateUser(ctx context.Context, client *ent.Client) (int, error) {
	u, err := client.User.
		Update().
		Where(user.Name("James")).
		SetAge(20).
		Save(ctx)
	if err != nil {
		return 0, err
	}

	log.Println("User is Updated, affected rows count:", u)
	return u, nil
}

func DeleteUser(ctx context.Context, client *ent.Client) (int, error) {
	u, err := client.User.
		Delete().
		Where(user.Name("James")).
		Exec(ctx)
	if err != nil {
		return 0, err
	}

	log.Println("User is Deleted, affected rows count:", u)
	return u, nil
}
```


## 参考
- 官网：https://entgo.io/
- github: https://github.com/ent/ent