---
date: 2025-04-04
title: UE实现视角平移、旋转和缩放
category: UE
tags:
- UE
- 可视化
---
# 实现视角平移、旋转和缩放

## 引言
建筑可视化项目中，视角平移、旋转和缩放是非常常见的，比如一些智慧城市、智慧园区项目中，经常用到。这里讲一下实现过程。

## 功能说明
- `W`、`A`、 `S`、 `D`四个键控制镜头前后左右移动
- 按住鼠标左键拖动画面实现镜头前后左右移动
- 按住鼠标右键拖动画面实现镜头旋转
- 滑动鼠标滚轮实现画面缩放

## 实现思路
- 新建角色、控制器、游戏模式
- 在项目设置中`input`选项可以添加按键轴映射`Axis mappings`
- 调用鼠标左键滑动和右键滑动的事件，触发修改角色位置信息或旋转信息
- 添加弹簧臂，控制弹簧臂长度来控制画面缩放

## 实现过程
### 1. 创建角色类、玩家控制器类、游戏模式类，并应用到关卡
![图片](./image/cameraMovement%20(1).png){data-original="/original.jpg"}

注意，角色需要设置控制玩家0 `player0`，角色类中需要添加一个摄像机`camera`
![图片](./image/cameraMovement%20(2).png)

### 2. 新建项目如果是第三人称游戏模板，会自带轴映射
![图片](./image/cameraMovement%20(3).png)
如果没有相关轴映射，需要自己添加设置。

### 3. 开启鼠标显示事件和点击事件
![图片](./image/cameraMovement%20(4).png)

### 4. 实现按键`WASD`移动

![图片](./image/cameraMovement%20(5).png)
不添加Z轴的值，是为了限制不随着视角移动改变高度。
> `InputAxis MoveForward` 就是我们设置好的前后移动轴映射；
> `AddMovementInput` 为添加移动距离的事件；
> `GetActorForwardVector` 为获取前后方向距离的向量;

### 5. 实现按住鼠标左键移动
左右移动：
![图片](./image/cameraMovement%20(6).png)
前后移动：
![图片](./image/cameraMovement%20(7).png)


### 6. 实现按住右键旋转
当角色（摄像机）左右旋转的时候，Z轴会发生变化，所以我们只需要设置Z轴的旋转值就可以了。同理，上下旋转的时候，只修改Y值就可以了
![图片](./image/cameraMovement%20(8).png)
> 注意：这里需使用`SetWorldRotation`而不是`AddWorldRotation`，因为浮点数0.0不绝对为0，所以`AddWorldRotation`会使X轴不断变化。
`SetWorldRotation`节点的`Target`需要是`SceneRoot`，不能是`camera`，不然会影响缩放功能，同理，也不能用`SetActorRotation`

### 7. 实现滑轮缩放画面
添加弹簧臂，并设置相机旋转完成后有个滞后效果。
![图片](./image/cameraMovement%20(9).png)

实现缩放逻辑
![图片](./image/cameraMovement%20(10).png)