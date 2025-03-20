# 按键实现物体自转

## 效果说明
当角色按下键盘1键，场景中某个Actor就会自转。我们可以直接在同一个蓝图实现这个功能。

## 实现思路
使用两个蓝图类来实现，用到`蓝图通信`。

### 蓝图1：新建自身旋转蓝图BP_RotateSelf
<br/>
<br/>

#### 自身旋转逻辑
```mermaid
graph TD
A[新建蓝图，添加组件] ---> B[新增判断旋转变量CanRotate] ---> C[添加EventTick，判断CanRotate] --true--> D[AddLocalRotation添加旋转角度]
C --false-->E[输出错误]
```

<br/>
<br/>

#### 旋转自定义事件
```mermaid
graph TD
A[新建事件RotateOrNot] ---> B[判断CanRotate] --true--> C[Set CanRotate=false] 
B--false--> J[Set CanRotate=true]
```


### 蓝图2：现有的第三人称角色蓝图 `ThirdPersonCharacter`
```mermaid
graph TD
A[新建事件图标，新建变量RotateRef] ---> B[关联RotateRef为BP_RotateSelf引用] ---> C[判断RotateRef是否合法] --Is Valid--> D[调用RotateOrNot]
C--IsNotValid-->E[输出错误]
F[添加按键事件1] --->C
B--->F
```

## 实现效果
<iframe src="https://player.youku.com/embed/XNjQ3MDQ0MzE4NA" scrolling="no" border="0" frameborder="no" width="800" height="450" framespacing="0" allowfullscreen="true"></iframe>



