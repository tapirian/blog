# grpc-go框架一文速通
grpc是谷歌开发的一款高性能、开源的通用 RPC 框架。它有包括Go、Js、PHP、Java、Python、C++在内的多语言实现，可以跨语言和平台工作，并支持负载平衡、跟踪、健康检查和身份验证等。它使用[Protocol Buffers](https://protobuf.dev/)通信。

## 快速入门
首先保证你安装了`Protocol Buffers`pb文件生成工具`protoc`，以及Go语言环境。然后我们按照步骤来实现一个最简单的grpc服务端和客户端。

### 服务端实现

#### 1.编写proto文件，生成pb文件
proto文件是`Protocol Buffers`的规范约束，是服务端和客户端通信的协议文件。

我们定义hello服务，包含一个SayHello的服务实现方法。
```proto
syntax = "proto3";

package hello;

option go_package = "./;hello";

service HelloGRPC {
  rpc SayHello(SayHelloRequest) returns (SayHelloReply);
}
message SayHelloRequest { 
    string name = 1; 
}
message SayHelloReply {
    string content = 1;
}
```
使用`protoc`工具生成pb文件， pb文件是生成的proto文件对应的结构定义等。
```bash
protoc --go_out=plugins=grpc:. *.proto
```

#### 2. 服务端实现（go mod模式）
服务端实现有以下几步：
- 打开**TCP监听**端口，预备监听grpc服务
- 创建grpc服务，并调用pb文件的注册方法，**注册自定义的服务实现**
- **启动grpc服务**
- **编写自定义实现方法**

```go
package main

import (
	"context"
	"fmt"
	hello "grpc-go-demo/proto"
	"net"

	"google.golang.org/grpc"
)

func main() {
	grpcAddr := "127.0.0.1:40001"
	listener, err := net.Listen("tcp", grpcAddr)
	if err != nil {
		panic(fmt.Sprintf("failed to listen: %v", err))
	}

	grpcServer := grpc.NewServer()
	hello.RegisterHelloGRPCServer(grpcServer, &HelloServer{})
	if err := grpcServer.Serve(listener); err != nil {
		listener.Close()
		panic(fmt.Sprintf("failed to serve: %v", err))
	}
}

type HelloServer struct {
}

func (s *HelloServer) SayHello(ctx context.Context, req *hello.SayHelloRequest) (*hello.SayHelloReply, error) {
	return &hello.SayHelloReply{
		Content: "Hello " + req.Name,
	}, nil
}
```
- 当前服务端没有启用任何拦截器（中间件）、认证或流控。
- 当服务端自定义的服务实现结构体，必须实现proto定义的`SayHello`方法

#### 3. 模拟客户端调用
我们使用工具`grpcurl`来进行客户端调用上述服务端的方法`SayHello`：
```bash
grpcurl -plaintext -d {"name":"World"} -import-path ./proto -proto hello.proto 127.0.0.1:40001 hello.HelloGRPC.SayHello
```
> -d是我们传输的数据内容，-import-path是proto文件所在路径。

结果：
```
{
  "content": "Hello World"
}
```

### 客户端实现（可以不同语言）
#### 1、复制proto文件，并生成pb文件
```bash
copy -r ./proto  ../client/
```
#### 2、编写客户端实现代码
主要有以下几步：
- 连接到 gRPC 服务端
- 创建客户端实例（使用pb文件的方法）
- 设置超时
- 发起 RPC 调用（调用SayHello方法）

```go
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	hello "grpc-go-demo-client/proto"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	conn, err := grpc.NewClient("127.0.0.1:40001", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("failed to connect: %v", err)
	}
	defer conn.Close()

	client := hello.NewHelloGRPCClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	resp, err := client.SayHello(ctx, &hello.SayHelloRequest{
		Name: "World",
	})
	if err != nil {
		log.Fatalf("could not greet: %v", err)
	}

	fmt.Printf("Response: %s\n", resp.Content)
}
```

`grpc.WithTransportCredentials(insecure.NewCredentials()) `表示禁用`TLS/SSL`安全凭证。
- **grpc.WithTransportCredentials()** 返回DialOptions, 用来配置连接安全凭证
- **insecure.NewCredentials()** 返回一个禁用传输安全的凭证


## 参考
- grpc官网：https://grpc.io
- Protocol Buffers：https://protobuf.dev/
- grpc-go： https://grpc.io/docs/languages/go
- grpc-go github： https://github.com/grpc/grpc-go
- https://github.com/grpc/grpc-go/tree/master/Documentation