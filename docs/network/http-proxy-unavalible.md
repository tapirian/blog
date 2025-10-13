# Git Bash中http代理不生效

## 前言
电脑配置了网络代理，并开启了系统代理，可以使用浏览器访问目标网站`https://google.com`，但是使用PowerShell无法ping通，却可以使用curl访问，而在git bash中却无法使用curl获取结果。这里分析一下原因。

## 系统代理和全局代理
**“系统代理” ≠ “全局代理”**。
系统代理是 操作系统级别的 HTTP/HTTPS 代理设置，作用范围是`支持 WinINET API 的程序`，比如浏览器等。

即使开了“系统代理”，Windows 的底层网络行为和浏览器是不一样的。


```
 ┌───────────────────────────────────────┐
 │   代理软件 (Clash / NekoRay / V2RayN)  │
 └──────────┬────────────────────────────┘
            │
      ┌─────┴──────────────┐
      │                    │
┌──────────────────────────────────────┐
│  浏览器 (Chrome) │ ✅ 会自动走系统代理 │
└──────────────────────────────────────┘
      │                    │
┌────────────────────────────────────────┐
│  CMD / ping / weChat │ ❌ 不走代理      │
└────────────────────────────────────────┘
```

## ping 永远不走代理


即使你设置了代理，浏览器可以访问网站，却ping不通：

```bash
ping google.com
Request timed out.
```

因为：

> `ping` 使用的是 ICMP 协议，而代理（HTTP/SOCKS）只代理 TCP/UDP，不代理 ICMP。

👉 所以 “ping 不通” 并不能说明代理没生效。

正确测试代理是否生效的方法是：

```bash
curl https://google.com
```

## Git Bash
在PowerShell使用curl却可以访问，而在git bash中却无法使用curl获取结果。这是因为`PowerShell中的curl内置了别名`
```powershell
Get-Alias curl
```
得到结果：
```
|CommandType |  Name | 
|Alias  |       curl -> Invoke-WebRequest|
```

可见：在PowerShell输入```curl https://google.com```
实际执行的是```Invoke-WebRequest https://google.com```

而`git bash`中却是真正的curl。我们需要设置代理环境变量，让http请求和https请求都走代理：
```bash
# ~/.bashrc 或 ~/.bash_profile
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
```
使文件生效
```
source ~/.bash_profile
```
## 请求google.com发生301重定向
#### Google 的域名重定向策略

 Google 的服务器会 **301 重定向** 到 `https://www.google.com/`。因此，如果你直接用 `curl https://google.com`，curl 会收到一个 **301 Moved Permanently** 响应。


#### 浏览器行为

浏览器和 curl 的行为不同：

1. 浏览器默认会自动跟随 HTTP 重定向（301 / 302）
2. 浏览器会处理 Cookie、TLS 细节和 UA 重写

所以即使你输入 `https://google.com`，浏览器也能直接跳到 `https://www.google.com` 并显示页面。

如果你想让 curl 自动跳转，可以直接请求`curl https://www.google.com`或使用`-L`参数：
- `-L` / `--location` 参数让 curl **自动跟随重定向**

```bash
curl -L https://google.com
```


