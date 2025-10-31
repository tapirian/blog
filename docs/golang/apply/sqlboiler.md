# sqlboiler一文速通 
SQLBoiler 是一个基于 Go 语言的**类型安全** ORM 工具，它与传统 ORM 不同，采用 "数据库优先" 的方式工作：**从已存在的数据库结构生成 Go 代码**。且支持 PostgreSQL、MySQL/MariaDB 和 SQLite，性能接近原生SQL。

## 快速入门

### 安装和配置
1. 首先安装sqlboiler工具，用来生成代码：
```bash
$ go install github.com/aarondl/sqlboiler/v4@latest
```
2. 安装驱动，我们这里就以Mysql为例：
```bash
$ go install github.com/aarondl/sqlboiler/v4/drivers/sqlboiler-mysql@latest
```
3. 编写sqlboiler配置文件，命名`sqlboiler.toml`:
```
output   = "my_models"
wipe     = true
no-tests = true
add-enum-types = true

[mysql]
  dbname  = "test"
  host    = "localhost"
  port    = 3306
  user    = "root"
  pass    = "123456"
  sslmode = "false"
  tinyint_as_int = true
```
4. 连接mysql， 新建数据库`test`, 我们新建个`user`表做测试
```sql
-- test.`user` definition
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

5. 进入项目目录，执行命令生成models：
```bash
sqlboiler mysql
```
可以看到项目下生成了目录`my_models`, 包括`user`表的相关操作。

### 简单示例
写一个简单的CRUD示例：
```go
package main

import (
	"context"
	"database/sql"
	"log"
	models "sqlboiler-demo/my_models"

	"github.com/aarondl/null/v8"
	"github.com/aarondl/sqlboiler/v4/boil"
	"github.com/aarondl/sqlboiler/v4/queries/qm"
	_ "github.com/go-sql-driver/mysql"
)

type User struct {
	Name  string
	Email string
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			log.Fatalf("捕获panic: %v", r)
		}
	}()

	dsn := "root:123456@tcp(localhost:3306)/test?charset=utf8mb4&parseTime=true&loc=Local"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// 测试数据库连接
	if err := db.Ping(); err != nil {
		panic(err)
	}

	// 设置全局默认数据库连接， 并开启调试
	boil.SetDB(db)
	boil.DebugMode = true

	ctx := context.Background()

	// 创建用户
	user := &models.User{
		Name:  null.NewString("zhangsan", true),
		Email: null.NewString("zhangsan@163.com", true),
	}
	if err := user.Insert(ctx, db, boil.Infer()); err != nil {
		panic(err)
	}
	log.Printf("插入数据： %v \n", *user)

	// 查询用户--根据id
	selectUser, err := models.FindUser(ctx, db, user.ID)
	log.Printf("根据id查用户: %v \n", *selectUser)

	// 查询用户--根据条件
	selectUserByCond, err := models.Users(models.UserWhere.Name.EQ(null.StringFrom("zhangsan")),
		qm.OrderBy(models.UserColumns.ID+" DESC"),
	).All(ctx, db)
	if err != nil {
		panic(err)
	}
	log.Printf("根据条件查询用户： %v \n", selectUserByCond)

	// 更新用户
	user.Name = null.StringFrom("lisi")
	_, err = user.Update(ctx, db, boil.Infer())
	if err != nil {
		panic(err)
	}
	log.Printf("修改name=%s \n", user.Name)

	// 删除用户
	_, err = user.Delete(ctx, db)
	if err != nil {
		panic(err)
	}
	log.Printf("删除用户: %v \n", *user)
}
```

注意，相关库需要自行下载，使用`go get`或者`go mod tidy`下载。

## 参考
- github: https://github.com/aarondl/sqlboiler