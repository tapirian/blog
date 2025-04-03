# 使用使用Let's Encrypt获取免费SSL证书

我来为您提供生成HTTPS证书并配置Nginx服务器的详细步骤：

## 1. 安装必要的软件

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx
```

## 2. 生成SSL证书

```bash
# 获取证书
sudo certbot --nginx -d example.com -d www.example.com
```

## 3. 配置Nginx

### 创建或编辑网站配置文件

```bash
sudo nano /etc/nginx/sites-available/example.com
```

### 添加以下配置

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    
    # 将HTTP请求重定向到HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com www.example.com;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/example.com.crt;      # 证书路径
    ssl_certificate_key /etc/nginx/ssl/example.com.key;  # 私钥路径
    
    # 安全设置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 网站根目录
    root /var/www/example.com/html;
    index index.html index.htm index.nginx-debian.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 创建符号链接并激活配置

```bash
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # 可选：删除默认配置
```

## 4. 验证配置并重启Nginx

```bash
# 验证配置文件语法
sudo nginx -t

# 重启Nginx服务
sudo systemctl restart nginx
```

## 5. 配置防火墙（如果有）

```bash
# UFW防火墙(Ubuntu)
sudo ufw allow 'Nginx Full'

# Firewalld(CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 6. 测试HTTPS配置

在浏览器中访问 https://example.com 验证HTTPS是否正常工作。

## 注意事项

1. 将所有 `example.com` 替换为您的实际域名
2. 自签名证书在浏览器中会显示不安全警告，生产环境建议使用Let's Encrypt或购买商业SSL证书
3. 确保服务器上的域名已正确解析到您的服务器IP
4. 使用Let's Encrypt时，证书会自动续期，自签名证书需要手动更新

以上步骤完成后，您的网站应该可以通过HTTPS安全访问了。