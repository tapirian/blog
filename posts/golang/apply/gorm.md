---
date: 2025-02-12
title: Golang最流行的ORM框架GROM一文速通
category: Golang
tags:
- Golang
- ORM 
---
# GORM 一文速通
GORM是一个受欢迎的全功能ORM，它支持关联、支持钩子方法、支持预加载、支持自动迁移。扩展方便、社区活跃。是Go语言中最流行、最成熟的 ORM 框架之一。

## 二、安装与初始化

### 安装 GORM 与 数据库驱动
我们这里给出`mysql`驱动的安装，其他类型的数据库驱动安装类似。
```bash
go get -u gorm.io/gorm
go get -u gorm.io/driver/mysql
```

### 初始化连接
数据库连接采用`dsn`的格式。示例代码：
```go
package main

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
)

func main() {
	dsn := "root:password@tcp(127.0.0.1:3306)/demo_db?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("connect database failed: %v", err)
	}

	log.Println("Database connected successfully")
}
```

---

## 三、模型定义与映射规则

GORM 使用结构体映射数据库表。
常用 tag：

* `gorm:"primaryKey"` — 主键
* `gorm:"column:name"` — 指定列名
* `gorm:"unique"` — 唯一索引
* `gorm:"index"` — 普通索引
* `gorm:"size:255"` — 字符串长度
* `gorm:"default:xxx"` — 默认值

### 示例模型：

```go
type User struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"size:100;not null;index"`
	Email     string `gorm:"unique"`
	Age       int
	CreatedAt time.Time
	UpdatedAt time.Time
}
```

### 自动迁移（自动建表）

```go
db.AutoMigrate(&User{})
```

> 会根据模型结构自动创建或更新数据库表结构。自动迁移推荐测试环境使用，**生产环境不建议**。
---

## 四、常见 CRUD 用法

### API风格
GORM提供两种风格的api：
- Generics API： 泛型 API，类型安全的查询和操作（Go 1.18+）
- Traditional API：传统的api方式

区别对比：
| 对比项     | Traditional API（传统 API） | Generics API（泛型 API）                |
| ------- | ----------------------- | ----------------------------------- |
| 定义方式    | 使用接口类型 `interface{}`    | 使用 Go 泛型（`gorm.DB[T]`）              |
| 类型安全    | 不安全，很多类型要手动转换           | 编译期类型安全，避免反射错误                      |
| 自动推导    | 需要手动指定模型类型              | 可以通过泛型自动推导模型类型                      |
| 语法风格    | `db.Model(&User{})`     | `db.WithContext(ctx).Model[User]()` |
| GORM 版本 | v1 / v2 传统模式            | v2.5+ 引入（需 Go 1.18+）                |
| 反射开销    | 有                       | 少，编译期已确定类型                          |


### 示例代码
我们这里给出Generics API的 CURD 示例代码。[例子参考](https://gorm.io/zh_CN/docs/#Generics-API-v1-30-0)

```go
package main

import (
	"context"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// 定义数据表结构
type User struct {
	gorm.Model
	Name  string
	Email string
}

func main() {
	db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	ctx := context.Background()

	// 自动迁移模式
	db.AutoMigrate(&User{})

	// 创建
	err = gorm.G[User](db).Create(ctx, &User{Name: "John", Email: "john@gmail.com"})
	if err != nil {
		panic("failed to create user")
	}

	// 读取
	user, err := gorm.G[User](db).Where("name = ?", "John").First(ctx)
	if err != nil {
		panic("failed to read user")
	}
	println("User:", user.Name, user.Email)

	// 更新
	affectRows, err := gorm.G[User](db).Where("name = ?", "John").Updates(ctx, User{Email: "123@gmail.com"})
	if err != nil {
		panic("failed to update user")
	}
	println("Updated rows:", affectRows)

	// 查询
	var users []User
	users, err = gorm.G[User](db).Where("name = ?", "John").Find(ctx)
	if err != nil {
		panic("failed to query users")
	}
	println("Queried users count:", len(users))

	for _, u := range users {
		println("User:", u.Name, u.Email)
	}

	// 删除
	affectRows, err = gorm.G[User](db).Where("name = ?", "John").Delete(ctx)
	if err != nil {
		panic("failed to delete user")
	}
	println("Deleted rows:", affectRows)
}
```

## 五、高级功能示例

### 1、关联关系

就像许多其他的ORM一样，也支持关联其他表查询：

#### 一对多

```go
type User struct {
	ID    uint
	Name  string
	Posts []Post
}

type Post struct {
	ID     uint
	Title  string
	UserID uint
}

db.AutoMigrate(&User{}, &Post{})

// 查询带关联数据
var user User
db.Preload("Posts").First(&user)
```

#### 多对多

```go
type User struct {
	ID     uint
	Name   string
	Roles  []Role `gorm:"many2many:user_roles;"`
}

type Role struct {
	ID   uint
	Name string
}

db.AutoMigrate(&User{}, &Role{})
```
> 我个人不喜欢关联查询，因为本质上性能也没有提升且，且不方便数据的处理，查询结果也不够明确。如果使用错误（比如循环里面查询），有时候会带来灾难性后果。
---

### ️2、事务（Transaction）

```go
err := db.Transaction(func(tx *gorm.DB) error {
	if err := tx.Create(&User{Name: "Tom"}).Error; err != nil {
		return err
	}
	if err := tx.Create(&User{Name: "Jerry"}).Error; err != nil {
		return err
	}
	return nil
})
```

---

### 3️、钩子（Hooks）

GORM 提供生命周期钩子，可以在操作执行之前或之后处理数据等。例如：

* `BeforeCreate`, `AfterCreate`
* `BeforeUpdate`, `AfterUpdate`

```go
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.Name = strings.ToUpper(u.Name)
	return
}
```

---

## 参考
- 官方：https://gorm.io/
- github: https://github.com/go-gorm/gorm

