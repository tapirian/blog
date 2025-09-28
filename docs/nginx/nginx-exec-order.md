# Nginx 配置指令执行顺序

## 前言
Nginx配置文件使用的语言本质上是**声明式**的， 而不是过程式的。所以Nginx配置指令的执行和配置文件中书写的先后关系毫无关系，而是看声明的指令所属在Nginx配置解析的哪个阶段。来看例子：
```nginx
    location / {
        set $a hello;
        echo $a;
        set $a world;
        echo $a;
    }
```
执行结果：
```
$ curl http://localhost:8080
world
world
```
通过上边的例子，我们可以看到， 只有最后一条`set`指令生效，两条`echo`指令的结果都是最后`set`的值，这是因为两条指令在Nginx不同的运行阶段。现在我们详细来看一下各个阶段的指令。

## Nginx请求处理的11个阶段

### 1. POST_READ阶段 - 请求头处理之后

**功能描述**：此阶段在读取完请求头后立即执行，常用于获取真实客户端IP地址。

**常用模块与示例**：
```nginx
# 真实IP模块配置
set_real_ip_from 192.168.1.0/24;
set_real_ip_from 10.0.0.0/8;
real_ip_header X-Forwarded-For;
real_ip_recursive on;
```

*适用于Nginx前方有代理服务器的情况，从X-Forwarded-For头中提取真实客户端IP*

### 2. SERVER_REWRITE阶段 - 服务器级别重写

**功能描述**：在匹配location之前，在server上下文中执行重写规则。

**常用模块与示例**：
```nginx
server {
    listen 80;
    server_name example.com;
    
    # 强制HTTPS重定向
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
    
    # 域名规范化
    rewrite ^ https://www.example.com$request_uri permanent;
    
    # 设置变量供后续使用
    set $my_var "value";
}
```


### 3. FIND_CONFIG阶段 - 查找匹配的location

**功能描述**：Nginx核心内部阶段，根据请求URI寻找匹配的location块，开发者无法配置。

### 4. REWRITE阶段 - 位置级别重写

**功能描述**：在匹配的location上下文中执行重写规则，这是最常用的重写阶段。

**常用模块与示例**：
```nginx
location /api/ {
    # 重写URL路径
    rewrite ^https://files.metaso.cn/api/v1/(.*)$ /app/api.php?endpoint=$1 last;
    rewrite ^https://files.metaso.cn/api/v2/(.*)$ /app/api_v2.php?method=$1 last;
    
    # 条件判断与变量设置
    if ($arg_debug = "true") {
        set $debug_mode 1;
    }
    
    # 直接返回响应
    return 200 "API endpoint moved";
}
```


### 5. POST_REWRITE阶段 - 重写后处理

**功能描述**：内部阶段，处理重写后的内部跳转和循环检测。

### 6. PREACCESS阶段 - 访问预处理

**功能描述**：在访问控制前进行预处理，常用于限流限速。

**常用模块与示例**：
```nginx
# 定义连接数限制区域
limit_conn_zone $binary_remote_addr zone=addr:10m;

# 定义请求频率限制区域
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

server {
    location /download/ {
        # 限制每个IP最多10个并发连接
        limit_conn addr 10;
        
        # 限制请求频率：每秒10个请求，突发不超过20个
        limit_req zone=one burst=20 nodelay;
    }
}
```


### 7. ACCESS阶段 - 访问控制

**功能描述**：实施访问权限控制，包括IP限制、密码认证等。

**常用模块与示例**：
```nginx
location /admin/ {
    # IP访问控制
    allow 192.168.1.0/24;
    allow 10.0.0.1;
    deny all;
    
    # 基本认证
    auth_basic "Administrator Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    # 满足任意条件即可访问
    satisfy any;
}

location /private/ {
    # 认证请求模块 - 委托到其他服务认证
    auth_request /auth;
    auth_request_set $user $upstream_http_x_user;
}

location = /auth {
    internal;
    proxy_pass http://auth-service/validate;
}
```


### 8. POST_ACCESS阶段 - 访问后处理

**功能描述**：内部阶段，处理访问控制的结果。

### 9. PRECONTENT阶段 - 内容预处理

**功能描述**：在生成内容前进行最后预处理。

**常用模块与示例**：
```nginx
location / {
    # try_files指令尝试寻找文件
    try_files $uri $uri/ @backend;
    
    # 错误页面处理
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}

location @backend {
    # 内部重定向到后端
    proxy_pass http://backend-server;
}
```


### 10. CONTENT阶段 - 内容生成

**功能描述**：核心阶段，生成返回给客户端的内容。

**常用模块与示例**：
```nginx
# 静态文件服务
location /static/ {
    alias /var/www/static/;
    expires 30d;
    add_header Cache-Control public;
}

# 反向代理
location /app/ {
    proxy_pass http://app-server;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# FastCGI处理PHP
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}

# 内容生成
location /hello {
    # 使用echo模块直接生成内容
    echo "Hello, World!";
    echo "Current time: $time_local";
}

# Lua内容处理
location /lua {
    content_by_lua_block {
        ngx.say("Hello from Lua!")
        ngx.say("URI: " .. ngx.var.uri)
    }
}
```


### 11. LOG阶段 - 日志记录

**功能描述**：请求处理完成后记录日志。

**常用模块与示例**：
```nginx
# 自定义日志格式
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
               '$status $body_bytes_sent "$http_referer" '
               '"$http_user_agent" "$http_x_forwarded_for" '
               'rt=$request_time uct="$upstream_connect_time"';

log_format json_log escape=json
    '{'
    '"time_local":"$time_local",'
    '"remote_addr":"$remote_addr",'
    '"request":"$request",'
    '"status":$status,'
    '"body_bytes_sent":$body_bytes_sent,'
    '"request_time":$request_time,'
    '"upstream_response_time":"$upstream_response_time"'
    '}';

# 应用日志配置
access_log /var/log/nginx/access.log main;
access_log /var/log/nginx/access.json json_log;

# 条件日志记录
map $status $loggable {
    ~^[23]  0;
    default 1;
}

access_log /var/log/nginx/errors.log main if=$loggable;
```


## 实战：完整配置示例

```nginx
# 在http块中定义共享配置
http {
    # 限流限速区域定义
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
    limit_conn_zone $binary_remote_addr zone=conn:10m;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" "$http_user_agent"';
    
    # upstream配置
    upstream backend {
        server 10.0.0.1:8080 weight=3;
        server 10.0.0.2:8080 weight=2;
        server 10.0.0.3:8080 weight=1;
        keepalive 32;
    }
    
    server {
        listen 80;
        server_name example.com;
        
        # POST_READ阶段：获取真实IP
        set_real_ip_from 10.0.0.0/8;
        real_ip_header X-Forwarded-For;
        
        # SERVER_REWRITE阶段：全局重写
        rewrite ^/old-path$ /new-path permanent;
        
        # 静态文件服务
        location /static/ {
            alias /var/www/static/;
            access_log off;
            expires max;
        }
        
        # API接口 - 包含多个阶段的配置
        location /api/ {
            # PREACCESS阶段：限流限速
            limit_req zone=api burst=10 nodelay;
            limit_conn conn 20;
            
            # ACCESS阶段：访问控制
            allow 192.168.1.0/24;
            deny all;
            auth_basic "API Access";
            auth_basic_user_file /etc/nginx/api.htpasswd;
            
            # REWRITE阶段：URL重写
            rewrite ^https://files.metaso.cn/api/v1/(.*)$ /v1/index.php?endpoint=$1 last;
            
            # CONTENT阶段：代理到后端
            proxy_pass http://backend;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # LOG阶段：记录日志
            access_log /var/log/nginx/api.access.log main;
        }
        
        # 错误页面
        error_page 404 /404.html;
        error_page 500 502 503 504 /50x.html;
    }
}
```

