# UE静态网格体设置碰撞

### 不设置碰撞
有的静态网格体模型没有设置碰撞，角色移动会导致穿模：
<!-- 原生视频嵌入示例 -->
<!-- <video src="./video/collision-1.mp4" controls width="600"></video> -->

<!-- B站嵌入示例 -->
<!-- <iframe src="//player.bilibili.com/player.html?bvid=BV18dK3edEGR" scrolling="no" border="0" frameborder="no" width="800" height="450" framespacing="0" allowfullscreen="true"></iframe> -->

<!-- 优酷嵌入 -->
<iframe src="https://player.youku.com/embed/XNjQ2MjE4NDYxNg" scrolling="no" border="0" frameborder="no" width="800" height="450" framespacing="0" allowfullscreen="true"></iframe>

### 设置碰撞
我们可以选中模型之后双击点开，到模型的编辑页面，找到碰撞（collision）这一栏，设置碰撞预设为`BlockAll`，设置碰撞复杂度为`Use Complex Collision As Simple`
<!-- <video src="./video/collision-2.mp4" controls width="600"></video> -->
<iframe src="https://player.youku.com/embed/XNjQ2OTg3NzYxMg" scrolling="no" border="0" frameborder="no" width="800" height="450" framespacing="0" allowfullscreen="true"></iframe>

还可以选择模型编辑器界面上方菜单栏，选中collision，添加一个简单碰撞。我们这里选择盒体碰撞

<!-- <video src="./video/collision-3.mp4" controls width="600"></video> -->
<iframe src="https://player.youku.com/embed/XNjQ2MjE5MjAxMg" scrolling="no" border="0" frameborder="no" width="800" height="450" framespacing="0" allowfullscreen="true"></iframe>
