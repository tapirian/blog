---
date: 2020-03-27
title: MySQL 实现行列转换（Pivot）
category: MySQL
tags:
- MySQL
- 数据库
---
# MySQL实现行列转换（Pivot）

MySQL行列转换是指：将原本在多行展示的数据，按某种规则汇总成 **一行多列** 的形式。

例如：

**原始表（sales）**

| month | product | amount |
| ----- | ------- | ------ |
| Jan   | A       | 100    |
| Jan   | B       | 200    |
| Feb   | A       | 150    |
| Feb   | B       | 250    |

**目标：按月份显示各产品销售额**

| month | A   | B   |
| ----- | --- | --- |
| Jan   | 100 | 200 |
| Feb   | 150 | 250 |

---

## MySQL实现方法

MySQL **没有内置 PIVOT 函数**（不像 SQL Server），需要使用 **聚合 + CASE** 或 **动态 SQL**。

---

### 方法 1：静态列（固定列名）

```sql
SELECT
    month,
    SUM(CASE WHEN product = 'A' THEN amount ELSE 0 END) AS A,
    SUM(CASE WHEN product = 'B' THEN amount ELSE 0 END) AS B
FROM sales
GROUP BY month
ORDER BY month;
```

解释：

1. `CASE WHEN product='A' THEN amount ELSE 0 END`
   → 判断该行是否属于 A 产品，如果是就取 amount，否则取 0
2. `SUM(...)` 聚合每个月的 A/B 销售额
3. `GROUP BY month` 把每个月汇总到一行

输出效果：

| month | A   | B   |
| ----- | --- | --- |
| Jan   | 100 | 200 |
| Feb   | 150 | 250 |

---

### 方法 2：动态列（列名不固定）

如果产品数量未知或经常变动，需要**动态生成列**：

1. 查询所有不同产品：

```sql
SELECT GROUP_CONCAT(DISTINCT
       CONCAT(
           'SUM(CASE WHEN product = ''',
           product,
           ''' THEN amount ELSE 0 END) AS `',
           product, '`'
       )
) INTO @sql_cols
FROM sales;
```

2. 拼接完整 SQL：

```sql
SET @sql = CONCAT('SELECT month, ', @sql_cols, ' FROM sales GROUP BY month ORDER BY month');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

解释：

* `GROUP_CONCAT` 动态生成每个列的 CASE 语句
* 使用 `PREPARE` + `EXECUTE` 执行动态 SQL

这个方法在产品或指标列经常变动时非常实用。

---

## 总结

1. **列必须固定时** → 用方法1，性能好
2. **列不固定时** → 用方法2，灵活但稍慢
3. `CASE` 聚合必须配合 `SUM()` 或 `MAX()`，否则会报错
4. 如果数据量大，`GROUP_CONCAT` 的长度可能需要调大 `group_concat_max_len`

```sql
SET SESSION group_concat_max_len = 1000000;
```


| 方法            | 优点     | 缺点             |
| ------------- | ------ | -------------- |
| CASE + 聚合     | 简单、性能好 | 列固定，无法动态生成     |
| 动态 SQL + CASE | 列可动态生成 | SQL 写法复杂，调试不方便 |

> 核心思想：**把行条件判断转成列，通过聚合函数汇总**。

---

## 参考
- https://stackoverflow.com/questions/7674786/how-can-i-return-pivot-table-output-in-mysql
- https://www.datacamp.com/doc/mysql/mysql-pivot