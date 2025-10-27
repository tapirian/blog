// import { defineConfig } from "vitepress";
import { withMermaid }  from "vitepress-plugin-mermaid";
export default withMermaid({
  mermaid: {

  },
  mermaidPlugin: {
    class: "mermaid my-class",
  },
  cleanUrls: true,
  ignoreDeadLinks: true,
  title: "一介白衣ing",
  description: "everything will be fine",
  base: "/blog/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      // { text: "主页", link: "/homepage" },
      // { text: "关于", link: "/about" },
    ],
    sidebar: [ 
      {
        text: "计算机基础",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "进制转换", link: "/computer/decimal-conversion" },
        ],
      },
      {
        text: "网络安全",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "研发安全攻防", link: "/security/attack_and_guard" },
          { text: "对称加密和非对称加密", link: "/security/encryption" },
          { text: "OpenSSL介绍", link: "/security/openssl" },
          { text: "使用Let'Encrypt生成SSL证书", link: "/network/ssl-cert-generate" },
          { text: "http代理git bash没有生效", link: "/network/http-proxy-unavalible" },
        ],
      },
      {
        text: "算法数据结构",
        collapsible: true,
        collapsed: true,
        items: [
          {
            text: "排序算法",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "快速排序", link: "/algorithm/sort/quick-sort" },
            ]
          },
          {
            text: "力扣",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "两数之和", link: "/algorithm/leetcode/two-sum" },
            ]
          }
        ],
      },
      {
        text: "Nginx",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "Nginx简介", link: "/nginx/nginx-readme" },
          { text: "Docker运行Nginx", link: "/nginx/docker-nginx" },
          { text: "Nginx变量", link: "/nginx/nginx-variable" },
          { text: "Nginx配置指令执行顺序", link: "/nginx/nginx-exec-order" },
        ],
      }, 
      {
        text: "PHP",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "从0到1实现一个php框架", link: "/php/build-framework" },
          // { text: "php中的打印", link: "/php/print-different" },
        ],
      },
      {
        text: "Golang",
        collapsible: true, 
        collapsed: true,
        items: [
          {
            text: "基础",
            items: [
              { text: "基础知识点", link: "/golang/basic/lesser-known-points" },
              { text: "Golang中的通道", link: "/golang/basic/channel" },
              { text: "Golang泛型", link: "/golang/basic/generics" },
              { text: "Golang反射", link: "/golang/basic/reflect" },
              { text: "Golang中的锁", link: "/golang/basic/mutex" },
              { text: "实现TCP通信", link: "/golang/basic/net-tcp" },
              { text: "实现UDP通信", link: "/golang/basic/net-udp" },
              { text: "实现HTTP通信", link: "/golang/basic/net-http" },
              { text: "实现WebSocket通信", link: "/golang/basic/websocket" },
              { text: "Golang版本管理", link: "/golang/basic/version-management" },
              { text: "VSCode调试Golang程序", link: "/golang/basic/vscode-debugging" },
              { text: "性能剖析工具pprof", link: "/golang/basic/pprof" },
              { text: "expvar实现运行时状态导出", link: "/golang/basic/expvar" },
              { text: "sync.WaitGroup的noCopy机制", link: "/golang/basic/waitGroup-noCopy" },
              { text: "使用fsnotify监听文件", link: "/golang/apply/fsnotify" },
              { text: "Golang控制协程的并发量", link: "/golang/apply/control-concurrency" },
              { text: "Gin框架速通", link: "/golang/apply/gin-framework" },
              { text: "Echo框架速通", link: "/golang/apply/echo-framework" },
              { text: "Fiber框架速通", link: "/golang/apply/fiber-framework" },
              { text: "Beego框架速通", link: "/golang/apply/beego-framework" },
              { text: "Chi框架速通", link: "/golang/apply/chi-framework" },
              { text: "grpc-go框架速通", link: "/golang/apply/grpc-go-framework" },
              { text: "go-zero框架速通", link: "/golang/apply/zero-framework" },
              { text: "go-micro框架速通", link: "/golang/apply/go-micro-framework" },
            ],
          },
          {
            text: "问题日志",
            items: [
              { text: "【rpc error】code = canceled desc = context canceled", link: "/golang/errlog/context-canceled" },
            ],
          }
        ],
      },
      {
        text: "Nodejs",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "Nodejs事件循环", link: "/nodejs/eventloop" },
          { text: "Nodejs包管理器", link: "/nodejs/package-management" },
          { text: "node-addon开发C++插件", link: "/nodejs/node-addon-call-c-library" },
        ],
      },
      {
        text: "C && C++",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "C语言数组", link: "/c/array" },
          { text: "C++的内存动态分配", link: "/cpp/cpp" },
        ],
      },
      {
        text: "Rust",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "Dioxus VS Tauri", link: "/rust/dioxus-tauri-comparison" },
        ],
      },
      {
        text: "大前端",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "Vue双向绑定的原理", link: "/web/vue-binding" },
          { text: "Micro-app入门指南", link: "/web/micro-app-start" },
          { text: "Puppeteer VS Playwright", link: "/web/puppeteer-playwright-comparison" },
        ],
      },
      {
        text: "Docker",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "Docker项目部署全流程", link: "/docker/docker-deploy" },
        ],
      },
      {
        text: "操作系统",
        collapsible: true, 
        collapsed: true,
        items: [
          {
            text: "Linux && Shell",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "Linux最常用命令总结", link: "/os/linux/command-usage" },
            ],
          },
          {
            text: "Windows",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "共享网络打印机凭证冲突", link: "/os/windows/print-share-conflict" },
              { text: "windows查看磁盘情况的工具", link: "/os/windows/scan-disk-tools" },
              { text: "windows释放C盘空间", link: "/os/windows/release-system-disk" },
            ],
          },
        ],
      },
      {
        text: "数据库",
        collapsible: true, 
        collapsed: true,
        items: [    
          {
            text: "MySQL",
            collapsible: true,    // ✅ 启用折叠功能
            collapsed: true,       // ✅ 初始折叠状态
            items: [
              { text: "MySQL安装与配置", link: "/database/mysql/config" },
              { text: "MySQL索引", link: "/database/mysql/index" },
              { text: "MySQL索引核心概念", link: "/database/mysql/index-concept" },
              { text: "MySQL事务机制", link: "/database/mysql/transaction" },
              { text: "MySQL视图", link: "/database/mysql/view" },
              { text: "MySQL用户与权限", link: "/database/mysql/privileges" },
              { text: "MySQL架构", link: "/database/mysql/structure" },
              { text: "MySQL主从同步", link: "/database/mysql/master-slave" },
              { text: "MySQL慢日志定位", link: "/database/mysql/slow-query-log" },
              { text: "MySQL Binlog日志与数据恢复", link: "/database/mysql/binlog" },
              { text: "MySQL性能监控", link: "/database/mysql/monitor" }, 
              { text: "MySQL flush与redo log", link: "/database/mysql/flush" }, 
            ],
          },
          {
            text: "Redis",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "Redis基本数据类型", link: "/database/redis/type" },
            ],
          },
          {
            text: "国产数据库",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "达梦数据库兼容Mysql", link: "/database/native/dameng-mysql" },
              { text: "GoldenDB兼容Mysql", link: "/database/native/goldendb-mysql" },
            ],
          },
        ],
      },
      {
        text: "消息队列",
        collapsible: true, 
        collapsed: true,
        items: [
          {
            text: "RabbitMQ",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "RabbitMQ简介", link: "/mq/rabbitmq/start" },
            ],
          },
          {
            text: "Pulsar",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "Pulsar简介", link: "/mq/pulsar/start" },
            ],
          },
        ],
      },
      {
        text: "搜索引擎",
        collapsible: true, 
        collapsed: true,
        items: [
          {
            text: "Elasticsearch",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "Elasticsearch简介", link: "/se/elasticsearch/start" },
            ],
          },
          {
            text: "OpenObserve",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "OpenObserve简介", link: "/se/openobserve/start" },
            ],
          },
        ],
      },
      {
        text: "UE",
        collapsible: true,
        collapsed: true,
        items: [
          {
            text: "基础",
            items: [
              { text: "UE术语概览", link: "/ue/basic/start" },
              { text: "静态网格体设置碰撞", link: "/ue/basic/collision" },
              { text: "静态网格体合并", link: "/ue/basic/staticMeshMerge" },
              { text: "使用关卡蓝图实现开关门", link: "/ue/basic/openDoor" },
              { text: "使用类蓝图实现开关门", link: "/ue/basic/openDoorClass" },
              { text: "按键和鼠标实现开关门", link: "/ue/basic/openDoorClick" },
              { text: "拾取钥匙开关门", link: "/ue/basic/openDoorByKey" },
              { text: "实现角色经过某一区域加速", link: "/ue/basic/characterSpeed" },
              { text: "按键实现物体自转", link: "/ue/basic/actorRotation" },
              { text: "切换关卡中角色控制权", link: "/ue/basic/possessPawn" },
              { text: "蓝图中添加蓝图组件", link: "/ue/basic/addBlueprintComponent" },
              { text: "蓝图通信总结", link: "/ue/basic/blueprintCommunicate" },
              { text: "蓝图中各种组织方式对比", link: "/ue/basic/blueprintOrganization" },
              { text: "实现一个解谜小游戏（第一关）", link: "/ue/basic/roomEscape1" },
              { text: "实现一个解谜小游戏（第二关）", link: "/ue/basic/roomEscape2" },
            ],
          },
          {
            text: "建筑可视化",
            items: [
              { text: "视角平移和缩放", link: "/ue/building-visualization/cameraMovement" },
              { text: "物体阴影移动效果", link: "/ue/building-visualization/shadowMovement" },
              { text: "物体沿着样条线移动", link: "/ue/building-visualization/splineMovement" },
            ],
          }
        ],
      },
      {
        text: "AI",
        collapsible: true, 
        collapsed: true,
        items: [
          {
            text: "stableDiffusion",
            // collapsible: true, 
            // collapsed: true,
            items: [
              { text: "controlNet让stableDiffusion更可控", link: "/ai/sd/sd-controlnet" },
              { text: "stableDiffusion提示词模板", link: "/ai/sd/sd-prompt-templates" },
            ],
          },
          {
            text: "MCP",
            // collapsible: true, 
            // collapsed: true,
            items: [
              { text: "高德MCP+Cursor生成旅游攻略", link: "/ai/mcp/gaode-cursor-travel-guide" },
            ],
          },
          { text: "claude根据效果图生成web页面", link: "/ai/claude" },
        ],
      },
      {
        text: "工具",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "VSCode异机同步已安装扩展", link: "/tools/vscode-install-extensions" },
          { text: "Cursor VS Trae", link: "/tools/cursor-vs-trae" },
          { text: "Cursor无限续杯", link: "/tools/cursor-infinite-cup" },
        ],
      },
      {
        text: "项目部署",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "实现gitlab CI/CD工作流", link: "/project/ci-cd" },
        ],
      },
      {
        text: "Git",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "远程项目关联到本地", link: "/git/remote-to-local" },
          { text: "git tag实现发布版本", link: "/git/tag" },
          { text: "cherry-pick如何解决冲突", link: "/git/cherry-pick" },
        ],
      },
      {
        text: "关于",
        link: "/about"
      },
    ],
// "https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/6c61ae65d1c41ae8221a670fa32d05aa.svg"
    socialLinks: [
      { icon: "github", link: "https://github.com/tapirian" },
      {
        icon: {
          svg: `<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.5875 6.77268L21.8232 3.40505L17.5875 0.00748237L17.5837 0L13.3555 3.39757L17.5837 6.76894L17.5875 6.77268ZM17.5863 17.3955H17.59L28.5161 8.77432L25.5526 6.39453L17.59 12.6808H17.5863L17.5825 12.6845L9.61993 6.40201L6.66016 8.78181L17.5825 17.3992L17.5863 17.3955ZM17.5828 23.2891L17.5865 23.2854L32.2133 11.7456L35.1768 14.1254L28.5238 19.3752L17.5865 28L0.284376 14.3574L0 14.1291L2.95977 11.7531L17.5828 23.2891Z" fill="#1E80FF"/></svg>`
        },
        link: "https://juejin.cn/user/4416058258381213"
      },
    ],
    search: {
      provider: "local", // 启用本地搜索
      options: {
        // 搜索选项（可选）
        fuzzy: true,      // 模糊匹配
        prefix: true,     // 前缀匹配
        boost: { title: 2 }, // 标题权重更高
        locales: {
          zh: {
            translations: {
              button: { buttonText: "搜索文档" },
              modal: { noResultsText: "无结果" }
            }
          },
          en: { /* 英文配置 */ }
        }
      }
    }
  },
});
