---
date: 2020-06-06
title: Ubuntu卡死如何kill相关进程
category: Linux 
tags:
- Linux
---

# Ubuntu卡死如何kill相关进程
使用下列方法进行尝试：

1. ctrl+alt+T打开一个终端
2. 输入 gnome-system-monitor 打开监控
3. 找到卡死的进程，右键杀死进程。如果鼠标也卡死了，请看步骤4
4. 按Tab键，选到进程列表，然后按方向下移键。找到卡死进程的名字。然后再ctrl+alt+T打开另一个终端，输入killall 你的进程名字，杀死进程。如果键盘也卡死了。那就重启吧。重启可以解决99%的问题，剩下的1%需要重装系统。