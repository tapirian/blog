# UE使用类蓝图实现开关门

## 效果说明
当玩家靠近目标门的时候，门会自动打开，当玩家离开的时候，门自动关闭。并且当前这个门及开关门效果可以在关卡其他地方复用。

## 实现思路
我们使用类蓝图来实现可以复用的功能。实现思路同关卡蓝图一样，只不过我们把门和相关操作封装到蓝图类中方便复用。
```mermaid
graph LR
A[新建类蓝图] ---> B(添加门和碰撞盒组件) ---> C(新建碰撞盒开始&结束重叠事件) ---> D(添加时间线，设置旋转角度)
```
## 实现过程
### 1. 首先我们新建一个蓝图类，然后添加两个组件静态网格体（`static mesh`）, 选择实例为门、门框
<video src="./video/openDoorClass-1.mp4" controls width="600"></video>

### 2. 添加组件碰撞盒（`box collision`）, 新建碰撞盒的触发重叠开始事件（`EventActorBeginOverlap`），输出引脚连接到设置门的旋转度（`SetRelativeRotation`），将蓝图类拖放到场景中测试开门动作。
<video src="./video/openDoorClass-2.mp4" controls width="600"></video>

### 3. 设置时间线，完成开关门
<video src="./video/openDoorClass-3.mp4" controls width="600"></video>

## 说明

- 碰撞盒必须和门同级，不能放在门下级，不然会随着门的旋转而旋转，这不是我们想要的效果。
- 设置旋转角度方法为`SetRelativeRotation`，表示相对坐标（模型本身），这样如果我们把模型拖动到场景中，不会因为拖放角度不同而改变。