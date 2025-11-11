---
date: 2020-01-02
title: Linux 常用命令总结
category: Linux 
tags:
- Linux 
---
# Linux 常用命令总结

## 文件操作

### 文件浏览与导航
- `ls`: 列出目录内容
  ```bash
  ls -la  # 显示所有文件（包括隐藏文件）的详细信息
  ```
- `cd`: 切换目录
  ```bash
  cd /home/user  # 切换到指定目录
  cd ..          # 返回上一级目录
  cd ~           # 返回用户主目录
  ```
- `pwd`: 显示当前工作目录

### 文件操作
- `cp`: 复制文件或目录
  ```bash
  cp file.txt destination/  # 复制单个文件
  cp -r folder/ backup/     # 递归复制目录
  ```
- `mv`: 移动文件或重命名
  ```bash
  mv file.txt newname.txt   # 重命名文件
  mv file.txt folder/       # 移动文件
  ```
- `rm`: 删除文件或目录
  ```bash
  rm file.txt               # 删除文件
  rm -r folder/             # 递归删除目录
  rm -rf folder/            # 强制递归删除目录（谨慎使用）
  ```
- `mkdir`: 创建目录
  ```bash
  mkdir new_folder          # 创建单个目录
  mkdir -p dir1/dir2/dir3   # 创建多级目录
  ```
- `touch`: 创建空文件或更新时间戳
  ```bash
  touch newfile.txt         # 创建新文件或更新已有文件的时间戳
  ```

## 文件内容操作

- `cat`: 查看文件内容
  ```bash
  cat file.txt              # 显示整个文件内容
  ```
- `less`: 逐页查看文件内容
  ```bash
  less large_file.txt       # 分页查看，按q退出
  ```
- `head`: 查看文件开头
  ```bash
  head -n 10 file.txt       # 显示文件前10行
  ```
- `tail`: 查看文件结尾
  ```bash
  tail -n 20 file.txt       # 显示文件最后20行
  tail -f log.txt           # 实时查看文件更新（常用于日志）
  ```
- `grep`: 文件内容搜索
  ```bash
  grep "pattern" file.txt             # 在文件中搜索匹配项
  grep -r "pattern" directory/        # 递归搜索目录中所有文件
  grep -i "pattern" file.txt          # 忽略大小写搜索
  ```

## 系统与进程管理

- `ps`: 显示进程状态
  ```bash
  ps aux                    # 显示所有进程
  ps -ef | grep process     # 查找特定进程
  ```
- `top`: 动态显示进程信息
  ```bash
  top                       # 实时监视系统进程
  ```
- `htop`: 增强版top命令（需先安装）
  ```bash
  htop                      # 交互式进程查看器
  ```
- `kill`: 终止进程
  ```bash
  kill PID                  # 终止指定PID的进程
  kill -9 PID               # 强制终止进程
  ```
- `df`: 显示磁盘空间使用情况
  ```bash
  df -h                     # 以人类可读格式显示磁盘使用情况
  ```
- `du`: 显示目录或文件大小
  ```bash
  du -sh directory/         # 显示目录总大小
  du -h --max-depth=1 /     # 显示根目录下各子目录大小
  ```

## 用户和权限

- `chmod`: 更改文件权限
  ```bash
  chmod 755 file.txt        # 使用数字模式设置权限
  chmod u+x script.sh       # 给所有者添加执行权限
  ```
- `chown`: 更改文件所有者
  ```bash
  chown user:group file.txt # 更改文件的用户和组
  ```
- `sudo`: 以管理员权限执行命令
  ```bash
  sudo apt update           # 以root权限运行命令
  ```
- `su`: 切换用户
  ```bash
  su - username             # 切换到其他用户
  ```

## 网络操作

- `ifconfig`/`ip`: 网络接口配置
  ```bash
  ifconfig                  # 显示网络接口信息
  ip addr show              # 现代版本，显示IP地址
  ```
- `ping`: 测试网络连接
  ```bash
  ping google.com           # 测试与服务器的连接
  ```
- `netstat`: 网络统计
  ```bash
  netstat -tuln             # 显示所有监听端口
  ```
- `ss`: 查看网络连接状态（新版netstat）
  ```bash
  ss -tuln                  # 显示所有监听端口
  ```
- `curl`: 发送HTTP请求
  ```bash
  curl https://example.com  # 获取网页内容
  ```
- `wget`: 下载文件
  ```bash
  wget https://example.com/file.zip  # 从网络下载文件
  ```

## 文本处理

- `awk`: 文本处理工具
  ```bash
  awk '{print $1}' file.txt # 打印每行的第一列
  ```
- `sed`: 流编辑器
  ```bash
  sed 's/old/new/g' file.txt # 替换文本
  ```
- `sort`: 对文本行排序
  ```bash
  sort file.txt             # 按字母顺序排序文件内容
  ```
- `uniq`: 去除重复行
  ```bash
  sort file.txt | uniq      # 删除重复行（需先排序）
  ```
- `wc`: 统计行数、字数和字符数
  ```bash
  wc -l file.txt            # 统计文件行数
  ```

## 压缩与解压

- `tar`: 打包文件
  ```bash
  tar -czvf archive.tar.gz directory/  # 创建gzip压缩归档
  tar -xzvf archive.tar.gz             # 解压gzip归档
  ```
- `zip`/`unzip`: zip格式压缩/解压
  ```bash
  zip -r archive.zip directory/        # 压缩目录
  unzip archive.zip                    # 解压zip文件
  ```

## 软件包管理

### Debian/Ubuntu
- `apt`/`apt-get`: 包管理器
  ```bash
  apt update                # 更新包索引
  apt upgrade               # 升级已安装的包
  apt install package       # 安装软件包
  apt remove package        # 移除软件包
  ```

### Red Hat/CentOS
- `yum`/`dnf`: 包管理器
  ```bash
  yum update                # 更新包索引并升级
  yum install package       # 安装软件包
  dnf install package       # 新版CentOS/RHEL使用dnf
  ```

## 其他常用命令

- `find`: 查找文件
  ```bash
  find /path -name "*.txt"  # 查找指定类型的文件
  find / -type f -size +100M # 查找大于100MB的文件
  ```
- `history`: 显示命令历史
  ```bash
  history                   # 显示历史命令
  history | grep command    # 搜索特定命令
  ```
- `man`: 查看命令手册
  ```bash
  man ls                    # 显示ls命令的手册
  ```
- `echo`: 输出文本
  ```bash
  echo "Hello World"        # 输出文本到标准输出
  ```
- `crontab`: 定时任务
  ```bash
  crontab -e                # 编辑当前用户的定时任务
  ```
- `alias`: 创建命令别名
  ```bash
  alias ll='ls -la'         # 创建命令别名
  ```

## 重定向与管道
- `>`: 输出重定向（覆盖）
  ```bash
  ls > file_list.txt        # 将输出写入文件（覆盖原内容）
  ```
- `>>`: 输出重定向（追加）
  ```bash
  echo "text" >> file.txt   # 将输出追加到文件末尾
  ```
- `|`: 管道
  ```bash
  cat file.txt | grep "pattern" | sort  # 组合多个命令
  ```