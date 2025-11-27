---
date: 2020-06-02
title: apt包管理器添加镜像源
category: Linux 
tags:
- Linux 
---

# apt包管理器添加镜像源

ubuntu使用apt包管理器的时候，安装不存在的包会报错，比如查看服务状态：sysv-rc-conf的安装

```bash
sudo apt install sysv-rc-conf
E:无法定位软件包 sysv-rc-conf
```
我们需要修改镜像源列表，添加镜像源。

## 添加镜像源
镜像源列表一般位于`/etc/apt/sources.list`:

编辑它，添加一行：

```bash
deb http://archive.ubuntu.com/ubuntu/ trusty main universe restricted multiverse
```
- `deb` 表示这是一个 二进制软件包仓库（已经编译好的程序）
- `http://archive.ubuntu.com/ubuntu/` 表示软件源服务器地址, 这是 Ubuntu 官方主服务器之一，用来下载软件包。
- `trusty` 这是 Ubuntu 发行版代号, trusty = Ubuntu 14.04 LTS
- `main universe restricted multiverse` 软件来源分类，这里表示同时启用了 全部四类软件源（最完整配置）


| 名称           | 是否官方支持 | 是否免费    | 说明          |
| ------------ | ------ | ------- | ----------- |
| `main`       | ✅ 官方支持 | ✅ 免费    | 核心系统软件      |
| `restricted` | ✅ 官方支持 | ❌ 非完全开源 | 官方驱动（如显卡驱动） |
| `universe`   | ❌ 社区维护 | ✅ 免费    | 大量第三方软件     |
| `multiverse` | ❌ 非官方  | ❌ 不完全免费 | 有版权或专利限制    |

## 重新操作

```bash
sudo apt install sysv-rc-conf
```
测试：

```bash
sudo sysv-rc-conf
```
