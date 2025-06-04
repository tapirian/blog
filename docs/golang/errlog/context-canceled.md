# rpc error: code = canceled desc = context canceled

## 错误说明
调用rpc接口时上下文被取消，报错。

## 场景复现
rpc方法中，在协程调用了另一个rpc方法，并将主协程context作为参数传递。当主协程结束之后，context被取消，子协程中调用rpc失败。

### 错误代码
```go
// rpc方法
func (s *Server) Find(ctx context.Context, request *pb.FindRequest) (result *pb.FindReply, err error) {
	result = &pb.FindReply{}
	// ....
    // ....
    go FindUser(ctx)
	return
}

func FindUser(ctx context.Context) {
    rpcClient.Query(ctx)
    // ...
}

```

### 处理办法
- 法1： 同步处理，多协程操作使用sync.WaitGroup异步等待。
- 法2： 新建独立的上下文，内容和源context保持一致
```go
package user

import (
	pb "grpc/pb"
	"context"
	"time"

	"google.golang.org/grpc/metadata"
)

type ContextKey string
const ContextReqUUid     = "uuid"
const ContextReqUUidKey  = ContextKey(ContextReqUUid)

func (s *Server) Find(originalCtx context.Context, request *pb.FindRequest) (result *pb.FindReply, err error) {
	uuid := GetUuid(originalCtx)
	go func( uuid string) {
		// 创建基础 context
		ctx := context.Background()
		ctx, cancel := context.WithTimeout(ctx, 10*time.Minute)
		defer cancel()

		// 同时设置 context value 和 outgoing metadata
		ctx = context.WithValue(ctx, ContextReqUUidKey, []string{uuid})

		// 创建 outgoing metadata 用于 gRPC 请求
		md := metadata.New(map[string]string{
			ContextReqUUid:     uuid,
		})
		ctx = metadata.NewOutgoingContext(ctx, md) 
        FindUser(ctx)
		// ...
	}(uuid)
	result = &pb.FindReply{}
	return
}

// GetUuid ...
func GetUuid(ctx context.Context) string {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		md = metadata.MD{}
	}
	uuids := md.Get(ContextReqUUid)
	if len(uuids) == 0 {
		return ""
	}
	return uuids[0]
}

```
> 推荐使用法2， 这样即使因为web服务器超时，也不影响我们的协程请求。