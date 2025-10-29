# go-micro框架一文速通
Go Micro 满足分布式系统开发的核心需求，包括 **RPC 和事件驱动通信(pub/sub)**。Go Micro的主要特点是可插拔的架构，每个分布式系统都是**可插拔的**，有合理的默认值，且可以轻松替换。此外，它的消息编码支持`protobuf和json`，有诸如服务注册和发现、负载均衡等功能，且支持异步消息传递的**发布订阅**模式。

## 快速入门
```bash
go get "go-micro.dev/v5"
```

### 服务注册
简单创建一个服务并注册处理程序：
```go
package main

import (
	"context"

	"go-micro.dev/v5"
)

type Request struct {
	Name string `json:"name"`
}

type Response struct {
	Greeting string `json:"greeting"`
}

type Say struct{}

func (s *Say) Hello(ctx context.Context, req *Request, rsp *Response) error {
	rsp.Greeting = "Hello " + req.Name
	return nil
}

func main() {
	service := micro.New("helloworld")
	service.Handle(new(Say))
	service.Run()

}
```
运行之后输出日志：
```
2025-10-27 10:11:42  file=go-micro-demo/main.go:31 level=info Starting [service] helloworld
2025-10-27 10:11:42  file=service/service.go:95 level=info Transport [http] Listening on [::]:41184
2025-10-27 10:11:42  file=service/service.go:95 level=info Broker [http] Connected to 127.0.0.1:41185
2025-10-27 10:11:43  file=server/rpc_server.go:561 level=info Registry [mdns] Registering node: helloworld-165cd449-0a4d-4bf9-9eae-75b5894ef7e3
```
可以看到自动分配了两个端口:
- **服务的网络监听端口**（Transport [http] Listening on [::]:41184）： **微服务**（Server）真正接收 RPC 调用的地址，默认HTTP协议，其他服务通过注册中心（如etcd/consul）可以发现这个地址，进行调用。
- **消息代理使用的端口**（Broker [http] Connected to 127.0.0.1:41185）：**Broker** 是 go-micro 中的消息总线（Pub/Sub 发布订阅系统），默认使用 HTTP Broker；负责接收或转发消息事件（异步通信）

遗憾的是自动分配的端口无法获取，所以推荐**设置默认端口**：
```go
func main() {
	service := micro.NewService(
		micro.Name("helloworld"),
		micro.Address(":8080"),
	)
	service.Handle(new(Say))
	service.Run()
}
```
当然，broker也可以设置：
```go
func main() {
	b := broker.NewHttpBroker(broker.Addrs(":8082"))
	if err := b.Connect(); err != nil {
		log.Fatal(err)
	}

	service := micro.NewService(
		micro.Name("greeter"),
		micro.Address(":8081"),
		micro.Broker(b), // 使用我们自定义的 Broker
	)
	service.Handle(new(Say))
	service.Run()
}
```

我们使用curl来模拟一下http客户端请求：
```bash
curl -XPOST -H 'Content-Type: application/json'-H 'Micro-Endpoint: Say.Hello' -d '{"name": "John"}' http://localhost:8081
```
结果：
```json
{"greeting":"Hello John"}
```

### 发布订阅
前面的示例中，我们简单实现了一个自定义的`http broker`，监听8082端口。我们通过它来实现发布订阅。需要说明的是：
**http broker 不会接收自己发布的消息**，因为go-micro 的设计是广播模型，不做本地回环，故而**单进程内的 Pub/Sub** 无效。
所以我们需要启动两个进程，来分别实现发布和订阅

发布者：
```go
package main

import (
	"encoding/json"
	"log"
	"time"

	"go-micro.dev/v5/broker"
)

type Message struct {
	Name string `json:"name"`
}

func PubMsg(b broker.Broker, topic string, msg any) (err error) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("消息序列化失败%v: \n", err)
		return err
	}

	err = b.Publish(topic, &broker.Message{
		Header: map[string]string{"Content-Type": "application/json"},
		Body:   data,
	})
	if err != nil {
		log.Printf("发布消息失败%v: \n", err)
		return err
	}
	println("发布消息: ", string(data))
	return
}

func main() {
	b := broker.NewHttpBroker(broker.Addrs(":8082"))
	if err := b.Connect(); err != nil {
		log.Fatal(err)
	}
	defer b.Disconnect()

	for {
		msg := Message{Name: "World" + time.Now().Format("15:04:05")}
		PubMsg(b, "greeter.topic", msg)
		time.Sleep(5 * time.Second)
	}
}
```

订阅者：
```go
package main

import (
	"log"

	"go-micro.dev/v5/broker"
)

func main() {
	b := broker.NewHttpBroker(broker.Addrs("127.0.0.1:8082"))
	if err := b.Connect(); err != nil {
		log.Fatal(err)
	}
	defer b.Disconnect()

	// 订阅主题
	println("sub2开始订阅主题 greeter.topic")
	_, err := b.Subscribe("greeter.topic", func(p broker.Event) error {
		msg := p.Message()
		log.Printf("收到消息: %s\n", string(msg.Body))
		return nil
	})
	if err != nil {
		log.Fatalf("订阅失败: %v", err)
	}

	<-make(chan struct{})
}
```
如果要实现多订阅，`v5`版本可能需要使用其他 broker（如 NATS、RabbitMQ、MQTT）。

## 参考
- github：https://github.com/micro/go-micro 