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
- 同步处理，多协程操作使用sync.WaitGroup异步等待。
- 新建独立的上下文