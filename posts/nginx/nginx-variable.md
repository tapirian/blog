---
# date: 2025-05-09
date: 置顶 
title: Nginx 变量详解
category: Nginx
tags:
- Nginx 
---
# Nginx 变量详解

## 前言
我们使用Docker在Windows运行OpenResty，代理到本机8080端口来测试Nginx相关功能。

大多数实例中，配置文件省略了其他配置，只使用`location`配置块。

很多例子使用ngx_echo 模块的 `echo` 配置指令将变量的值作为当前请求的响应体输出。`echo` 默认 Content-Type 是 `application/octet-stream`，浏览器打开会以 **下载** 的方式进行处理（除非是静态文件后缀，如.html, 会正常显示到浏览器页面）。我这里全部使用curl进行测试。

## 变量的创建和变量插值
Nginx只有一种变量类型，那就是字符串。我们使用`set`指令创建一个变量`$a`, 再基于`$a`使用变量插值创建变量`$b`，最后使用`ngx_echo`模块的`echo`指令输出变量的值。
```nginx
    location / {
        set $a hello;
        set $b "$a world";
        echo "a=$a; b=$b";
        echo "${a}world";
    }
```
执行结果：
```
$ curl http://localhost:8080
a=hello; b=hello world
helloworld
```
- set指令不仅是赋值，还会创建变量
- 如果使用没创建的变量，Nginx会报错，甚至无法启动服务


## 变量的可见范围
### 变量生命周期
Nginx变量一旦创建， 它的可见范围是整个Nginx配置，甚至可以跨越不同虚拟主机的server配置块。

虽然Nginx变量可见范围是整个配置，但是每个请求都有变量的`独立副本`。并不是其他语言中的全局变量。
```nginx
    location /bar {
        set $a hello;
        echo "a=$a";
    }
    
    location /foo {
        echo "a=$a";
    }
```
执行结果：
```
$ curl http://localhost:8080/bar
a=hello
$ curl http://localhost:8080/foo
a=
```
`localtion /foo`中使用`$a`并不会报错，只是输出空值，说明变量已经被创建，只是没有赋值。
- Nginx变量可见范围为整个配置
- 变量的生命周期不会跨越请求边界

### Nginx内部跳转
那么变量的声明周期是不是和`location`绑定的呢？答案是否定的。一个请求在某些情况，会经历多个`location`配置块。来看一个“内部跳转”的例子，我们利用`ngx_echo`模块的`echo_exec`指令或者`ngx_rewrite`模块的`rewrite`指令来实现：
```nginx
    location /bar {
        set $a hello;
        rewrite ^ /foo;
        # echo_exec /foo;
    }
    
    location /foo {
        echo "a=$a";
    }
```
执行结果：
```
$ curl http://localhost:8080/bar
a=hello
```
不能在`echo_exec`之前输出任何东西，包括`echo`指令和`echo_location`发起子请求。因为这样会导致`header/body`状态不一致问题, Nginx会丢弃或关闭连接。


## Nginx预定义变量
预定义变量也叫内建变量，顾名思义，是由Nginx核心模块提供的Nginx内部变量。通常用于获取关于请求和响应的各种信息。

### HTTP 核心模块（ngx_http_core_module)
| 变量                  | 含义                              |
| ------------------- | ------------------------------- |
| `$host`             | 请求头中的 Host，如果没有就用 server_name   |
| `$server_name`      | 当前匹配的 server_name               |
| `$server_port`      | 服务器监听的端口号                       |
| `$server_protocol`  | 请求使用的协议（HTTP/1.0、HTTP/1.1等）     |
| `$remote_addr`      | 客户端 IP 地址                       |
| `$remote_port`      | 客户端端口号                          |
| `$remote_user`      | HTTP Basic Auth 认证的用户名          |
| `$request_method`   | 请求方法（GET、POST 等）                |
| `$request_uri`      | 完整原始 URI（含 querystring，不含 host） |
| `$uri`              | 规范化后的 URI（不含 querystring）       |
| `$document_root`    | 当前请求映射到的根目录                     |
| `$request_filename` | 完整本地文件路径（document_root+uri）     |
| `$scheme`           | 协议（http/https）                  |

```nginx
    location /foo {
        echo "uri: $uri";
        echo "request_uri: $request_uri";
    }
```
执行结果：
```
$ curl 'http://localhost:8080/foo/hello%20world/test?a=123' 
uri: /foo/hello world/test
request_uri: /foo/hello%20world/test?a=123
```

### Rewrite 模块（ngx_http_rewrite_module）
| 变量                    | 含义                                  |
| --------------------- | ----------------------------------- |
| `$args`               | 原始 querystring                      |
| `$arg_name`           | 单个 query 参数（例如 `$arg_id` 取 ?id=xxx） |
| `$is_args`            | 如果有 querystring 返回“?”，否则空字符串                  |
```nginx
    location /foo {
        echo "args: $args";
        echo "is_args: $is_args";
        echo "arg_id: $arg_id";
        echo "arg_name: $arg_name";
    }
```
请求结果：
```
$ curl 'http://localhost:8080/foo/test?id=123'
args: a=123
is_args: ?
arg_id: 123
arg_name:
```
> $art_XXX 这样的变量获取到的值是没有经过URL解码的，可以使用第三方 ngx_set_misc 模块提供的 set_unescape_uri 配置指令：
```nginx
set_unescape_uri $name $arg_name;
echo "name: $name";
```


### Header / Body 模块
| 变量                    | 含义                                       |
| --------------------- | ---------------------------------------- |
| `$http_<header>`      | 取请求头，如 `$http_user_agent`、`$http_cookie` |
| `$sent_http_<header>` | 取响应头，如 `$sent_http_content_type`         |
| `$content_length`     | 请求体长度                                    |
| `$content_type`       | 请求体类型                                    |

### Proxy 模块（ngx_http_proxy_module）
| 变量                           | 含义                                 |
| ---------------------------- | ---------------------------------- |
| `$proxy_host`                | 代理的主机名                             |
| `$proxy_port`                | 代理的端口                              |
| `$upstream_addr`             | 实际上游服务器 IP:端口                      |
| `$upstream_status`           | 上游返回的状态码                           |
| `$upstream_response_time`    | 上游响应时间                             |

### FastCGI 模块（ngx_http_fastcgi_module）
| 变量                                    | 含义                        |
| ------------------------------------- | ------------------------- |
| `$fastcgi_script_name`                | FastCGI 脚本名（通常是 PHP 文件路径） |
| `$fastcgi_path_info`                  | PATH_INFO 部分              |

- 大多数内建变量都是只读的，应该避免重新赋值
- 有的内建变量可以赋值，比如`$args`，甚至赋值之后可以影响到别的模块，比如`ngx_proxy`

## 变量的存取
在 Nginx 的内部，每个变量都有对应的取处理程序（get handler）和存处理程序（set handler），用于在请求处理过程中获取或设置变量值。

### 取处理程序（get handler）
用来获取变量的值,当 Nginx 需要读取某个变量时，会调用它的取处理程序, 它可以用来计算变量的值（比如 $request_uri、$remote_addr、$upstream_addr 等），每次访问变量时可能动态计算。

### 存处理程序（set handler）
用来设置变量的值，当你用指令给变量赋值时（如 set $a 'value';），会调用存处理程序。有些变量是只读的（例如 `$request_uri`），就没有存处理程序。

## 变量的索引
索引变量和未索引变量主要在于它们内部存储和访问的方式，以及由此带来的性能影响。

### 索引变量（indexed）
访问速度非常快（O(1)），内存地址直接读取，在 Nginx 启动或配置解析阶段，给变量分配了一个索引号（index），常见的有Nginx核心变量和模块变量, 正则捕获组($1~$9)等等。例如：$host、$uri、$request_uri、$args、$remote_addr等。
> 注: nginx1.0版本, 很多常用的变量都是未索引的,nginx1.2.x+版本大量常用变量改为索引变量。

正则捕获组示例:
```nginx
    location ~ ^/user/(\w+)/(\w+)$ {
        echo "param1: $1";
        echo "param2: $2";
    }
```
请求:
```
$ curl http://localhost:8080/user/1/update
param1: 1
param2: update
```
上边示例中$1和$2就是索引变量。

### 未被索引变量（non-indexed）
访问速度较慢，需要遍历哈希表查找，只有在使用时才创建和赋值, 一般是自定义用户变量或者动态的内建变量。例如：$art_name。

### 总结
| 类型     | get handler | set handler    | 索引情况  | 访问速度    |
| ------ | ----------- | -------------- | ----- | ------- |
| 核心内建变量 | 有           | 有/无（取决于变量是否可写） | 索引变量  | 快（数组访问） |
| 自定义变量  | 有           | 有              | 未索引变量 | 慢（哈希查找） |

## Map变量缓存和惰性求值
`ngx_map`模块的`map`配置指令，可以定义两个Nginx变量之间的映射关系。例如：我们可以将$args变量的值映射到$foo变量上。例如：
```nginx
map $args $foo {
    default 0;
    pig     1;
    dog     2;
}
```
这个例子的意思是：如果$args的值是pig, $foo的值就是1；如果$args的值是dog，$foo的值就是2，否则$foo的值就是0。map指令的工作原理是为用户变量注册`get handler`，只有变量在被读取时，才会执行`get handler`（惰性求值）；且计算完值之后，map变量会缓存这个值，后续读取就会读取缓存的值。例如上边的例子中：已经计算的map变量`$foo`不会受后续`$args`修改的影响。

此外，map指令在`server`配置块之外。来看一个值缓存的例子：
```nginx
map $args $foo {
    default 0;
    dog     1;
}

server {
    listen       80;
    server_name  localhost;

    location /test {
        set $orgFoo $foo;
        set $args dog;
        echo $orgFoo;
        echo $foo;
    }
}
```
测试执行：
```
$ curl 'http://localhost:8080/test'
0
0
```
因为先读取`$foo`，后设置`$args`，所以$foo的值已经被缓存了，后设置`$args`无效，不会影响到`$foo`；如果先设置`$args`，后读取`$foo`；则设置会生效。
```nginx
    location /test {
        set $args dog;
        set $orgFoo $foo;
        echo $orgFoo;
        echo $foo;
    }
```
结果：
```
$ curl 'http://localhost:8080/test'
1
1
```
## 主请求和子请求
所谓“主请求”，是由HTTP客户端从Nginx外部发起的请求，包括前面内部跳转的例子（`rewrite`和`echo_exec`）。而子请求和HTTP协议乃至网络通信没有一点儿关系，它是Nginx内部为了处理主请求，将任务分解为多个较小粒度的“内部请求”，并发或串行地访问多个location接口。子请求有独立的URI、args、headers、phase处理流程，可以跑完整的location配置链。发起子请求可以使用`auth_request`模块、`ssi`模块、`echo_location`等等。

此外，“子请求”的调用是“有去有回”的，而“内部跳转”是“有去无回”。不能在`echo_exec`之前输出任何东西，包括`echo`指令和`echo_location`发起子请求。因为这样会导致`header/body`状态不一致问题, Nginx会丢弃或关闭连接，报错：`Empty reply from server`。

子请求示例：
```nginx
location / {
        set $var main;
        echo_location /foo;
        echo_location /bar;
        echo "main: $var";
    }
    
    location /foo {
        set $var foo;
        echo "foo: $var";
    }

    location /bar {
        set $var bar;
        echo "bar: $var";
    }
```
执行结果：
```
$ curl 'http://localhost:8080'
foo: foo
bar: bar
main: main
```
从例子可以看出，变量$var在各自请求中拥有独立的值副本容器，各自修改不会影响主请求。

## 变量共享
但是，一些 Nginx 模块发起的“子请求”却会自动共享其“父请求”的变量值容器，比如第三方模块 `ngx_auth_request`
```nginx
location / {
        set $var main;
        auth_request /foo;
        echo "main: $var";
    }
    
    location /foo {
        set $var foo;
        echo "foo: $var";
    }
```
执行结果：
```
$ curl 'http://localhost:8080'
main: foo
```
可以看到，因为`变量共享`的原因， 主请求的变量被改变了。使用`变量共享`的模块指令时，需要额外小心，避免意外的bug。

### auth_request 指令
前面我们可以看到， /foo 中的输出没有执行， 这是因为`auth_request`指令会自动忽略指定“子请求”的响应体，而只检查“子请求”的状态码，当状态码为2XX时，会忽略子请求，让Nginx继续处理当前请求；如果不是2XX，会立即中断当前主请求的执行，返回错误页。

`auth_request`一般用来实现**访问控制和鉴权**，它一般用在处理主请求之前，发起一个子请求去指定URI（认证服务），根据返回的状态码来判断主请求是否允许访问。状态码：

- 2xx ——> 认证通过，继续处理主请求；
- 401/403 ——> 认证失败，终止主请求，返回对应状态码；
- 其他状态码：默认失败

例如:
```nginx
        location /api/user {
                auth_request /api/auth;
                proxy_pass http://UserServer;
        }

        location /api/auth {
                proxy_pass http://AuthServer;
                proxy_pass_request_body off;
                proxy_set_header Content-Length "";
                proxy_set_header X-Original-URI $request_uri;
        }
```
访问`/api/user`相关的接口，会先发起子请求：`/api/auth`来进行验证是否有权限访问。验证通过则可以继续访问。


## 主请求变量的继承和不继承
前面的例子，我们已经看到自定义变量是不会继承主请求的，那么还有哪些内建变量是不继承主请求的呢？哪些又是继承主请求的呢？它们又有什么规律呢？
我们先来试一下变量`$request_uri`和变量`$args`:
```nginx
    location / {
        echo_location /foo;
        echo_location /bar "a=12&b=34"; 
        echo "main-args: $args, main-request_uri: $request_uri";
    }
    
    location /foo {
        echo "foo-args: $args, foo-request_uri: $request_uri";
    }

    location /bar {
        echo "bar-args: $args, bar-request_uri: $request_uri";
    }
```
执行结果：
```
$ curl 'http://localhost:8080?a=1&b=2'
foo-args: , foo-request_uri: /?a=1&b=2
bar-args: a=12&b=34, bar-request_uri: /?a=1&b=2
main-args: a=1&b=2, main-request_uri: /?a=1&b=2
```

根据结果可以看到，`$args`没有继承主请求， `$request_uri`则继承了主请求。

Nginx 的子请求创建时，会把主请求中 核心 request 数据结构 的相关字段拷贝/引用给子请求，这些一般是只读变量，所以子请求里的 $request_method、$scheme 等不会因为子请求 URI 改变而变化。

### 总结
| 变量类别     | 可写性 | 子请求继承        | 示例                                                |
| -------- | --- | ------------ | ------------------------------------------------- |
| 核心只读系统变量 | 只读  | ✅            | `$server_name`, `$server_port`, `$request_method`, `$request_uri` |
| 请求相关可写变量 | 可写  | ❌ 不继承        | `$args`, `$uri`                           |
| 自定义变量    | 可写  | ❌ 不继承        | `set $var ...`, `map $args $foo`                  |

## Nginx变量存放数组
Nginx虽然只有字符串这一种类型，但是我们可以借助`ngx_array_var`这样的第三方模块来存储字符串。例如：
```nginx
    location /test {
        array_split "," $arg_names to=$array;
        array_map "[$array_it]" $array;
        array_join " " $array to=$res;
        echo $res;
    }
```
执行结果：
```
$ curl 'http://localhost:8080/test?names=James,John,Lili'
[James] [John] [Lili]
```

上面的配置，首先使用`array_split`指令，将$arg_names变量的值，用逗号分隔为多个元素存储到数组$array中，然后使用`array_map`指令遍历数组$array, 并给$array中的每个元素包裹方括号“[]”, 并重新赋值给$array, `$array_it`变量为模块内建的变量，表示数组中每个元素。最后使用`array_join`指令，将变量`$array`以空格连接，并使用echo输出。

## 判断变量是空值还是不存在
Nginx中的变量我们怎么判断它是空字符串还是变量不存在（没有被创建）呢？答案是使用`ngx_lua`模块。
来看例子：
```nginx
    location /test {
        content_by_lua '
            if ngx.var.arg_name == nil then
                ngx.say("name: 不存在")
            else 
                ngx.say("name: ", ngx.var.arg_name)
            end
        ';
    }
```
发起请求：
```
$ curl 'http://localhost:8080/test'
name: 不存在

$ curl 'http://localhost:8080/test?name='
name: 
```

上边的lua脚本中， 使用`ngx.var`来获取nginx变量， 使用`ngx.say`来输出。我们还可以来判断$cookie_XXX变量：
```nginx
    location /test {
        content_by_lua '
            if ngx.var.cookie_name == nil then
                ngx.say("name: 不存在")
            else 
                ngx.say("name: ", ngx.var.cookie_name)
            end
        ';
    }
```
请求示例：
```
$ curl 'http://localhost:8080/test'
name: 不存在

$ curl --cookie name= 'http://localhost:8080/test'
name:
```

