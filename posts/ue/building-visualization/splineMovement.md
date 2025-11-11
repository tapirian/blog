---
date: 2025-04-05
title: UE实现物体沿着样条线移动
category: UE
tags:
- UE
- 可视化
---
# 物体沿着样条线移动

## 实现效果
物体沿着我们绘制好的样条线移动。可以用来做车流、抛物等等效果。

**效果预览**

![图片](./image/splineMovement.gif)


## 实现思路
- 新建一个物体+样条蓝图
- 场景中绘制样条线。
- 每帧变化物体的位置。
- 获取样条线一定距离，用时间轴来循环设置物体位置。

## 实现过程
### 1. 创建蓝图，添加物品和样条
![图片](./image/splineMovement%20(3).png)
> 注意， 开启`closedLoop`使样条线自动闭合

### 2. 在场景中绘制样条线
![图片](./image/splineMovement%20(2).png)
> 选中样条点，按`alt`可以复制另一个点

### 3. 编写蓝图实现
实现：
![图片](./image/splineMovement%20(4).png)

时间轴设置循环播放：
![图片](./image/splineMovement%20(1).png)

> 时间轴的作用是从0秒到N秒，实现物体从位置0到样条线总长度的变化。`Set Play Rate`可以控制播放速率，比如时间轴设置1秒，播放速率为0.2，则5秒才会使物体移动一周。

## 相关节点
| 节点名称 | 含义 |
|-------------|---------------|
| SetPlayRate  | 设置时间轴播放速率|
| GetTransformatDistanceAlongSpline  | 获取某段距离处样条线的变换|
| SetRelativeLocationAndRotation  |设置物体相对旋转和位置 |
