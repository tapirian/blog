---
date: 2018-10-11
title: C语言基础之数组 
category: C 
tags:
- C
---
# C语言基础之数组

## 一、简介
数组是一组相同类型的值，按照顺序储存在一起。

### 声明和赋值
#### 声明
声明了一个数组scores，里面包含100个成员，每个成员都是int类型
```c
int scores[100];
```
#### 赋值
```c
scores[0] = 13;
scores[99] = 42;
```
越界访问不会报错， 容易发生错误，需要特别小心
```c
int scores[100];
scores[100] = 1001;
```

#### 声明并赋值
自动计算长度
```c
int scores[] = {22, 37, 3490};
```
固定下标赋值，其他自动设置为0
```
int scores[100] = {[2] = 4, [10] = 27, [99] = 28};
```

大括号赋值，只能声明的时候用，已经声明过的数组使用大括号赋值会报错。
```c
int scores[5];
scores = {12, 123, 34, 2, 1}; // ❌ 错误
```

## 二、获取数组长度

### 1、静态数组

当你定义了一个“普通数组”时，如：

```c
int arr[10];
```

可以使用 `sizeof` 来计算数组长度：

```c
int len = sizeof(arr) / sizeof(arr[0]);
```

#### 🧠 原理解析：

* `sizeof(arr)` 得到的是整个数组的字节大小（例如 `4 * 10 = 40` 字节）
* `sizeof(arr[0])` 是数组中一个元素的大小（`int` 通常为 4 字节）
* 所以数组长度为：`40 / 4 = 10`

#### ⚠️ 注意：

此方法只适用于**定义数组的当前作用域**，如果你把数组作为参数传递到函数中，它将不再有效！

---

### 2、动态数组

当你使用 `malloc` 动态分配数组时，例如：

```c
int* p = malloc(sizeof(int) * 10);
```

你 **不能用** `sizeof(p)` 来获取数组长度：

```c
int len = sizeof(p) / sizeof(int);  // ❌ 错误
```

因为 `p` 是一个指针，`sizeof(p)` 只是指针的大小（通常是 4 字节或 8 字节），并不是数组的长度！

#### ✅ 正确做法：

你应该手动保存数组长度：

```c
int len = 10;
int* p = malloc(sizeof(int) * len);
```

然后使用这个 `len` 变量来遍历或操作数组。

---

### 3、函数参数
**函数参数中的数组自动退化为指针**

当数组作为函数参数传递时，即使你写的是 `int arr[]`，它也会被编译器视为指针 `int*`。

```c
void printArray(int arr[]) {
    int len = sizeof(arr) / sizeof(arr[0]);  // ❌ 错误
}
```

这段代码中 `sizeof(arr)` 实际是 `sizeof(int*)`，你无法通过它得到真实数组长度。

#### ✅ 正确写法：

最好的办法是 **在函数参数中传递数组长度**：

```c
void printArray(int arr[], int len) {
    for (int i = 0; i < len; i++) {
        printf("%d ", arr[i]);
    }
}
```

调用时：

```c
int arr[5] = {1, 2, 3, 4, 5};
printArray(arr, sizeof(arr) / sizeof(arr[0]));
```

---

### 🧠 总结

| 使用方式           | 能否通过 `sizeof` 获取长度 | 正确获取方法                       |
| -------------- | ------------------ | ---------------------------- |
| 静态数组           | ✅ 可以               | `sizeof(arr)/sizeof(arr[0])` |
| 动态数组（`malloc`） | ❌ 不行               | 手动记录长度                       |
| 函数参数中的数组       | ❌ 不行               | 传入数组长度作为参数                   |

---

### ✨更优雅的封装方式

如果你经常需要处理动态数组，推荐封装一个结构体来存储数组和长度：

```c
typedef struct {
    int* data;
    int length;
} IntArray;
```

使用时：

```c
IntArray arr;
arr.length = 10;
arr.data = malloc(sizeof(int) * arr.length);
```

不仅更清晰，还方便传参、扩展、管理内存。

---
