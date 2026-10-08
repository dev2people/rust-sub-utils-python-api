/**DNS配置 */
function main(configJsonStr) {
    const config = JSON.parse(configJsonStr);
    const US_DNS_IP = [
        "tls://1.1.1.1",
        "tls://1.0.0.1",
        "tls://8.8.4.4",
        "tls://8.8.8.8",
        "https://1.1.1.1/dns-query",
        "https://1.0.0.1/dns-query",
        "https://8.8.8.8/dns-query",
        "https://8.8.4.4/dns-query",
    ];
    const US_DNS_NAME = [
        "https://dns.cloudflare.com/dns-query",
        "https://dns.google/dns-query",
        "https://dns.google/resolve",
        "https://dns.quad9.net/dns-query",
    ];
    const COMP_IP = [
        //XX
        "1.1.1.1"
    ];
    const CN_DNS_IP = [
        //阿里
        "223.5.5.5",
        "223.6.6.6",
        //百度
        "180.76.76.76",
        //字节
        "180.184.1.1",
        "180.184.2.2",
        //114
        "114.114.114.114",
        "114.114.115.115",
        //CNNIC
        "1.2.4.8",
        "210.2.4.8",
        //腾讯
        "119.28.28.28",
        "119.29.29.29",
        "https://1.12.12.12/dns-query",
        "https://120.53.53.53/dns-query",
    ];
    const CN_DNS_NAME = [
        //alibaba
        "https://dns.alidns.com/dns-query",
        //360
        "https://doh.360.cn/dns-query",
        //腾讯
        "https://doh.pub/dns-query",
        "tls://dot.pub",
    ];
    /**
     * DNS 配置对象
     * 对应提供的 YAML 配置结构
     */
    config["dns"] = {
        // 启用 DNS 模块
        enable: true,
        // DNS 增强模式：["fake-ip","redir-host"] 模式，用于绕过 SNI 阻断等，
        // 许多代理软件使用此模式fake-ip用于增强性能，redir-host可以提高兼容性，就是慢一些
        "enhanced-mode": "fake-ip",
        //"enhanced-mode": "redir-host",
        // // DNS 缓存算法：'arc' (Adaptive Replacement Cache)
        // // 另一种常见算法是 'lru'
        // "cache-algorithm": "arc",
        // // 不优先使用 HTTP/3 (H3) 进行 DoH (DNS-over-HTTPS) 查询
        // "prefer-h3": false,
        // // 启用使用 hosts 文件进行 DNS 解析
        // "use-hosts": true,
        // // 启用使用系统 hosts 文件进行 DNS 解析
        // "use-system-hosts": true,
        // // DNS 查询是否遵循规则链（respect-rules）
        // // false 表示 DNS 查询不走规则链，直接由 DNS 模块处理
        // "respect-rules": false,
        // // DNS 监听地址和端口
        // // 0.0.0.0 表示监听所有网络接口的 1053 端口
        listen: "0.0.0.0:1053",
        // 禁用 IPv6 DNS 解析
        ipv6: false,
        //  默认 DNS (用于解析[DNS服务器]本身的域名)
        // 默认的上游 nameserver（通常用于直接查询）
        // 在 enhanced-mode 不为 fake-ip 时，这可能是主要使用的 nameserver
        // "default-nameserver": [...CN_DNS_IP],
        // fake-ip 的 IP 地址范围（IPv4）
        // 198.18.0.1/16 是 IANA 建议用于网络测试和基准测试的保留范围
        "fake-ip-range": "198.18.0.1/16",
        // fake-ip-range6: 'fdfe:dcba:9876::1/64' (IPv6 范围，被注释掉)
        // Fake-IP: 只能用于代理流量,不能用于 DIRECT 直连!
        // Fake-IP:【黑名单模式】的域名走真实 IP 解析其他全部走 fake-ip
        // Fake-IP:【白名单模式】则相反，只有名单内的域名走 fake-ip
        "fake-ip-filter-mode": "blacklist",
        // fake-ip 黑名单列表，这些域名将不会使用 fake-ip
        // '*.lan' 表示所有以 .lan 结尾的域名
        // 假 IP 过滤 (这些域名返回真实 IP)
        "fallback-filter": {
            geoip: true,
            "geoip-code": 'CN',
            ipcidr: ["240.0.0.0/4"],
            geosite: ["gfw"],
            domain: [
                '+.google.cn',
                '+.apple.com'
            ]
        },
        "fake-ip-filter": [
            // 白名单配置如下
            // 只有国外域名使用 fake-ip,国内和内网全部真实 IP
            //"geosite:geolocation-!cn",
            //   黑名单配置如下,
            "localhost",
            "+.lan",
            "+.comp12345.com",
            "falogin.cn",
            "+.localdomain",
            "+.localhost",
            "+.local",
            "+.home",
            "+.wifi",
            "+.dhcp",
            "+.router",
            "localhost.ptlogin2.qq.com",
            "dns.msftncsi.com",
            "www.msftncsi.com",
            "www.msftconnecttest.com",
            "+.xboxlive.com",
            "msxbox.com",
            // "geosite:geolocation-cn",
            // "geosite:google-cn",
            // "geosite:cn",
            // "geosite:category-ai-cn",
            // "geosite:category-games-cn",
        ],
        // 域名服务器策略（Nameserver Policy）
        // 根据域名后缀或规则集，指定不同的 nameserver
        // 这是 Mihomo 的杀手锏，比传统的 fallback 更精准
        "nameserver-policy": {
            // // 规则：geosite 为 cn (国内) 和 private (私有) 的域名 -> 走国内 DNS
            // "geosite:cn,google-cn,private": [...CN_DNS_IP, ...CN_DNS_NAME],
            // // 规则：其他所有域名 (默认) -> 走国外 DNS (DoH/DoT 防污染)
            // "geosite:geolocation-!cn": [
            //     ...US_DNS_IP,
            //     //...us_dns_name
            // ],
            "+.comp12345.com": [
                ...COMP_IP
            ]
        },
        // 主要的上游 nameserver 列表
        // 除非被 policy 覆盖，否则通常使用这些服务器进行查询
        // 兜底 DNS (如果 policy 没匹配到，虽然上面几乎覆盖了所有)
        nameserver: [
            ...COMP_IP,
            ...CN_DNS_IP,
            ...CN_DNS_NAME,
            ...US_DNS_IP,
            ...US_DNS_NAME
        ],
        // 备用 nameserver 列表 (Fallback)
        // 当主要 nameserver 查询失败或返回不可用结果时使用
        fallback: [
            ...COMP_IP,
            ...CN_DNS_IP,
            ...CN_DNS_NAME,
            ...US_DNS_IP,
            ...US_DNS_NAME
        ],
        // 用于代理节点（ProxyNode）域名解析流量的 nameserver
        // 代理节点域名解析服务器，仅用于解析代理节点的域名，
        // 如果不填则遵循 nameserver-policy、nameserver 和 fallback 的配置
        // "proxy-server-nameserver": [
        //     ...CN_DNS_IP,
        //     // ...cn_dns_name
        // ],
        // // 用于直连（Direct）流量的 nameserver
        // "direct-nameserver": [
        //     ...COMP_IP,
        //     "system", // 使用操作系统内置的 DNS
        //     ...CN_DNS_IP,
        // ],
        // // 直连 nameserver 是否遵循 nameserver-policy
        // // false 表示直连 nameserver 不使用 nameserver-policy，而是直接使用 'direct-nameserver'
        //"direct-nameserver-follow-policy": true,
    };
    config["hosts"] = {
        // "www.baidu.com":"google.com"
    };
    return JSON.stringify(config);
}
