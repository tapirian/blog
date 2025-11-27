---
date: 2020-03-15
title: MySQL sql_mode的作用和配置 
category: MySQL
tags:
- MySQL
- 数据库
---


# 一文彻底搞懂 MySQL 中的 sql_mode：作用、配置与实战影响

在 MySQL 中，同一条 SQL 在不同环境执行结果可能完全不同：

* 开发环境可以插入, 测试环境报错
* 开发环境可以查询, 测试环境报错
* 生产环境直接截断数据

**罪魁祸首，往往就是：`sql_mode` 不一致。**


## 一、什么是 sql_mode？

`sql_mode` 是 MySQL 的 **SQL 行为控制开关集合**，它决定了：

* SQL 语法是否严格校验
* 数据是否允许自动截断
* 日期是否合法
* `GROUP BY` 是否严格
* 是否允许隐式类型转换
* 除零是报错还是返回 NULL

你可以把它理解为：

> **MySQL 的“SQL 运行规则集合”，不同规则组合会直接改变数据库的行为。**

查看当前模式：

```sql
SELECT @@sql_mode;
```

示例输出：

```text
ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,
NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

---

## 二、sql_mode 的配置方式（全局 & 会话）

### 查看当前值

```sql
-- 当前会话
SELECT @@SESSION.sql_mode;

-- 全局配置
SELECT @@GLOBAL.sql_mode;
```

或者使用`SHOW`来查看：
```sql
-- 当前会话
-- 查询当前会话生效的变量可以省略SESSION, 即SHOW VARIABLES LIKE 'sql_mode';
SHOW SESSION VARIABLES LIKE 'sql_mode';

-- 全局配置
SHOW GLOBAL VARIABLES LIKE 'sql_mode';
```

---

### 会话修改（只对当前连接生效）

```sql
SET SESSION sql_mode = 'STRICT_TRANS_TABLES';
SET SESSION sql_mode = '';
```

> 连接断开即失效。

---

### 全局修改（立即生效，重启失效）

```sql
SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY';
```

> 全局修改需要 `SUPER` 或 `SYSTEM_VARIABLES_ADMIN` 权限。

---

### 永久修改（推荐方式）

修改 `my.cnf` 或 `my.ini`：

```ini
[mysqld]
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_DATE,ONLY_FULL_GROUP_BY
```

然后重启 MySQL：

```bash
systemctl restart mysqld
```

---

## 三、最常见的 sql_mode 详解

下面是生产环境中最重要的几个模式。

### 1. STRICT_TRANS_TABLES（严格模式）

作用：**禁止“脏数据”自动写入**

```sql
INSERT INTO user(age) VALUES ('abc');
```
- 未开启时（宽松）：age 自动变成 0，插入成功
- 开启后（严格）：ERROR 1366: Incorrect integer value: 'abc'

> **建议生产环境必须开启**

---

### 2. ONLY_FULL_GROUP_BY（GROUP BY 严格模式）

控制 `GROUP BY` 是否符合 SQL 标准。

```sql
SELECT id, name FROM user GROUP BY name;
```

- 未开启（MySQL 特色宽松行为）, 允许执行，但是相同的name, id往往是第一条数据：
- 开启后（标准 SQL）报错： Expression #1 of SELECT list is not in GROUP BY clause and contains nonaggregated ...in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by

开启后必须这样写：
```sql
SELECT name, MAX(id) FROM user GROUP BY name;
```
---

### 3. NO_ZERO_DATE / NO_ZERO_IN_DATE（禁止 0000-00-00）

```sql
INSERT INTO t VALUES ('0000-00-00');
```

- 未开启：插入成功 ✅（隐患巨大）
- 开启：ERROR 1292: Incorrect date value

> 避免“假时间”污染数据

---

### 4. ERROR_FOR_DIVISION_BY_ZERO（除零报错）

```sql
SELECT 10 / 0;
```

* 未开启：返回 `NULL` + warning
* 开启后：**直接报错**

> 防止“业务悄悄返回 NULL”

---

### 5. NO_ENGINE_SUBSTITUTION（存储引擎强校验）

```sql
CREATE TABLE t1 (...) ENGINE=InnoDB1;
```

* 未开启：自动降级为 InnoDB
* 开启后：直接报错 

>防止数据库“悄悄帮你改配置”

---

### 6. ALLOW_INVALID_DATES（允许非法日期）

例如：

```text
2019-02-31
```

* 默认是 **不允许**
* 只在极少数历史数据兼容场景使用

---

## 四、常见的报错和建议

### sql_mode导致的常见的报错
| 报错信息                       | 可能的 sql_mode               |
| -------------------------- | -------------------------- |
| Incorrect integer value    | STRICT_TRANS_TABLES        |
| Expression not in GROUP BY | ONLY_FULL_GROUP_BY         |
| Incorrect date value       | NO_ZERO_DATE               |
| Division by 0              | ERROR_FOR_DIVISION_BY_ZERO |
| Invalid engine             | NO_ENGINE_SUBSTITUTION     |


### 建议

MySQL8.0默认值：
```text
ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION 
```

`my.cnf` 或 `my.ini`：
```ini
[mysqld]
sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,
NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,
NO_ENGINE_SUBSTITUTION
```

若是历史系统升级，可临时关闭：

```sql
SET GLOBAL sql_mode = REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY','');
```
---

## 参考
- https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html