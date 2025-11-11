---
date: 2025-03-29
title: UE实现一个解谜小游戏（第二关）
category: UE
tags:
- UE
- 游戏
---
# 实现一个解谜小游戏（第二关）

## 效果说明
角色需要先踩到岩石地板上边，触发地板旁边的射灯，射灯照在墙上，同时显现墙上的按钮开关。角色需要到餐桌上吃掉汉堡，角色会变高变大，然后再去墙上鼠标点击开关，开启魔界之门，进入下一关。

## 效果展示
<iframe src="https://player.youku.com/embed/XNjQ2Mzc2MDAxMg" scrolling="no" border="0" frameborder="no" width="800" height="450" framespacing="0" allowfullscreen="true"></iframe>


## 相关事件
| 节点名称 | 含义 |
|-------------|---------------|
| SetActorScale3D  |设置Actor缩放大小|
| DestroyComponent  |销毁组件|
| SetVisibility  |设置组件是否可见|
