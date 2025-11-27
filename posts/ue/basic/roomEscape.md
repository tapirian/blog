---
# date: 2025-03-27
date: 置顶
title: 使用UE实现一个解谜小游戏
category: UE
tags:
- UE
- 游戏
---
# 实现一个解谜小游戏
我们使用UE来实现一个解谜小游戏，一共两关。

## 第一关
角色想要从复活点进入房间，需要找到房间钥匙。找到钥匙进入房间，然后把壁灯全部打开，后门打开。然后坐电梯上二楼（按数字键`2`键上二楼，按数字键`1`键回一楼）。

### 效果展示
<iframe src="https://player.youku.com/embed/XNjQ3MDY0MjU1Ng" scrolling="no" border="0" frameborder="no" width="800" height="450" framespacing="0" allowfullscreen="true"></iframe>


### 相关事件
| 节点名称 | 含义 |
|-------------|---------------|
| Execute Console Command  |执行控制台命令，可以执行关卡蓝图的事件：Command: ce 事件名称|


## 第二关 
角色需要先踩到岩石地板上边，触发地板旁边的射灯，射灯照在墙上，同时显现墙上的按钮开关。角色需要到餐桌上吃掉汉堡，角色会变高变大，然后再去墙上鼠标点击开关，开启魔界之门，进入下一关。

### 效果展示
<iframe src="https://player.youku.com/embed/XNjQ2Mzc2MDAxMg" scrolling="no" border="0" frameborder="no" width="800" height="450" framespacing="0" allowfullscreen="true"></iframe>


### 相关事件
| 节点名称 | 含义 |
|-------------|---------------|
| SetActorScale3D  |设置Actor缩放大小|
| DestroyComponent  |销毁组件|
| SetVisibility  |设置组件是否可见|
