/**函数拆分版:4模式+规则集+去重*/
/**
 * 添加并合并规则
 * @param {object} configObj - Clash配置对象
 * @returns {object} 添加并合并规则后的Clash配置对象
 */
function addAndMergeRules(configObj) {
  // 你的专属规则
  const yourRulesArray = [
    //comp
    "DOMAIN-SUFFIX,comp12345.com,公司内网",
    // 抱脸虫cdn
    "DOMAIN-SUFFIX,hf.co,DIRECT",
    //brave
    "DOMAIN-SUFFIX,brave.com,代理模式",
    "DOMAIN-SUFFIX,archive.ph,代理模式",
    //GPT相关
    "DOMAIN-SUFFIX,cerebras.ai,代理模式",
    "DOMAIN-SUFFIX,whatismyipaddress.com,代理模式",
    "DOMAIN-SUFFIX,chatgpt.com,代理模式",
    "DOMAIN-KEYWORD,aistudio,代理模式",
    "DOMAIN-KEYWORD,generativelanguage,代理模式",
    "DOMAIN-KEYWORD,generative,代理模式",
    "DOMAIN-SUFFIX,chinapress.com.my,代理模式",
    "DOMAIN-KEYWORD,colab,代理模式",
    "DOMAIN-KEYWORD,developerprofiles,代理模式",
    "DOMAIN-SUFFIX,bing.com,代理模式",
    "DOMAIN-SUFFIX,microsoftonline.com,代理模式",
    "DOMAIN-SUFFIX,microsoftapp.net,代理模式",
    // "DOMAIN-SUFFIX,microsoft.com,代理模式",
    "DOMAIN-SUFFIX,openai.com,代理模式",
    "DOMAIN-SUFFIX,auth0.com,代理模式",
    "DOMAIN-SUFFIX,claude.ai,代理模式",
    "DOMAIN-SUFFIX,poe.com,代理模式",
    //隐私浏览
    "DOMAIN-KEYWORD,dafahao,代理模式",
    "DOMAIN-KEYWORD,mingjinglive,代理模式",
    "DOMAIN-KEYWORD,chinaaid,代理模式",
    "DOMAIN-KEYWORD,botanwang,代理模式",
    "DOMAIN-KEYWORD,xinsheng,代理模式",
    "DOMAIN-KEYWORD,rfi,代理模式",
    "DOMAIN-KEYWORD,breakgfw,代理模式",
    "DOMAIN-KEYWORD,chengmingmag,代理模式",
    "DOMAIN-KEYWORD,jinpianwang,代理模式",
    "DOMAIN-KEYWORD,xizang-zhiye,代理模式",
    "DOMAIN-KEYWORD,qi-gong,代理模式",
    "DOMAIN-KEYWORD,voachinese,代理模式",
    "DOMAIN-KEYWORD,mhradio,代理模式",
    "DOMAIN-KEYWORD,rfa,代理模式",
    "DOMAIN-KEYWORD,edoors,代理模式",
    "DOMAIN-KEYWORD,renminbao,代理模式",
    "DOMAIN-KEYWORD,soundofhope,代理模式",
    "DOMAIN-KEYWORD,zhengjian,代理模式",
    "DOMAIN-KEYWORD,minghui,代理模式",
    "DOMAIN-KEYWORD,dongtaiwang,代理模式",
    "DOMAIN-KEYWORD,epochtimes,代理模式",
    "DOMAIN-KEYWORD,ntdtv,代理模式",
    "DOMAIN-KEYWORD,falundafa,代理模式",
    "DOMAIN-KEYWORD,wujieliulan,代理模式",
    "DOMAIN-KEYWORD,aboluowang,代理模式",
    "DOMAIN-KEYWORD,bannedbook,代理模式",
    "DOMAIN-KEYWORD,secretchina,代理模式",
    "DOMAIN-KEYWORD,dajiyuan,代理模式",
    "DOMAIN-KEYWORD,boxun,代理模式",
    "DOMAIN-KEYWORD,chinadigitaltimes,代理模式",
    "DOMAIN-KEYWORD,huaglad,代理模式",
    "DOMAIN-KEYWORD,dwnews,代理模式",
    "DOMAIN-KEYWORD,creaders,代理模式",
    "DOMAIN-KEYWORD,oneplusnews,代理模式",
    "DOMAIN-KEYWORD,talk.news.pts.org,代理模式",
    "DOMAIN-KEYWORD,zhuichaguoji,代理模式",
    "DOMAIN-KEYWORD,efcc.org,代理模式",
    "DOMAIN-KEYWORD,cyberpolice,代理模式",
    "DOMAIN-KEYWORD,tuidang,代理模式",
    "DOMAIN-KEYWORD,nytimes,代理模式",
    "DOMAIN-KEYWORD,falunaz,代理模式",
    "DOMAIN-KEYWORD,mingjingnews,代理模式",
    "DOMAIN-KEYWORD,inmediahk,代理模式",
    "DOMAIN-KEYWORD,falungong,代理模式",
    "DOMAIN-KEYWORD,epochweekly,代理模式",
    "DOMAIN-KEYWORD,cn.rfi,代理模式",
  ];
  /**
   * 全球主流 CDN 规则列表 (Clash DOMAIN-SUFFIX 格式)
   * * 推荐设置为 'DIRECT'（直连）以获得最佳内容加载速度。
   * 如果您希望通过代理访问，请将 'DIRECT' 替换为您的代理组名称，例如 'Proxy'。
   */
  const CDN_RULES = [
    // --- 核心/知名 CDN (已在上次列表中) ---
    // "DOMAIN-SUFFIX,cloudflare.com,代理模式",
    // "DOMAIN-SUFFIX,cloudflare.net,代理模式",
    "DOMAIN-SUFFIX,workers.dev,代理模式", // Cloudflare Workers/Pages
    "DOMAIN-SUFFIX,akamai.com,代理模式", // Akamai 主域名
    "DOMAIN-SUFFIX,akamai.net,代理模式",
    "DOMAIN-SUFFIX,twimg.com,代理模式", //x.com
    "DOMAIN-SUFFIX,x.com,代理模式", //x.com
    "DOMAIN-SUFFIX,akamaized.net,代理模式",
    "DOMAIN-SUFFIX,akamaihd.net,代理模式",
    "DOMAIN-SUFFIX,edgekey.net,代理模式",
    "DOMAIN-SUFFIX,edgesuite.net,代理模式",
    "DOMAIN-SUFFIX,cloudfront.net,代理模式", // Amazon CloudFront
    "DOMAIN-SUFFIX,aws.amazon.com,代理模式", // 亚马逊 AWS 平台（包含 CloudFront）
    "DOMAIN-SUFFIX,s3.amazonaws.com,代理模式", // AWS S3 存储
    "DOMAIN-SUFFIX,fastly.com,代理模式", // Fastly
    "DOMAIN-SUFFIX,fastly.net,代理模式",
    "DOMAIN-SUFFIX,limelight.com,代理模式", // Limelight
    "DOMAIN-SUFFIX,cdnetworks.com,代理模式", // CDNetworks 主域名
    "DOMAIN-SUFFIX,cdnetworks.net,代理模式",
    "DOMAIN-SUFFIX,edgecast.com,代理模式", // Edgecast (现为 Verizon Media/Yahoo的一部分)

    // --- 新增的服务提供商及其主域名 ---
    "DOMAIN-SUFFIX,xycdn.com,代理模式", // ProCDN
    "DOMAIN-SUFFIX,cachefly.com,代理模式", // Cachefly
    "DOMAIN-SUFFIX,cdn77.com,代理模式", // CDN77
    "DOMAIN-SUFFIX,cdnify.com,代理模式", // CDNify
    "DOMAIN-SUFFIX,cdnsun.com,代理模式", // CDNsun
    "DOMAIN-SUFFIX,cdnvideo.com,代理模式", // CDNvideo
    "DOMAIN-SUFFIX,highwinds.com,代理模式", // Highwinds (现为 StackPath)
    "DOMAIN-SUFFIX,incapsula.com,代理模式", // Incapsula (现为 Akamai的一部分)
    "DOMAIN-SUFFIX,internap.com,代理模式", // Internap
    "DOMAIN-SUFFIX,keycdn.com,代理模式", // KeyCDN
    "DOMAIN-SUFFIX,leaseweb.com,代理模式", // Leaseweb
    "DOMAIN-SUFFIX,level3.com,代理模式", // Level 3 (现为 Lumen)
    "DOMAIN-SUFFIX,maxcdn.com,代理模式", // MaxCDN (现为 StackPath)
    "DOMAIN-SUFFIX,gnenix.com,代理模式", // GNENIX
    "DOMAIN-SUFFIX,quantil.com,代理模式", // QUANTIL
    "DOMAIN-SUFFIX,tatacommunications.com,代理模式", // TATA Communications
    //"DOMAIN-SUFFIX,xcdn.cn,代理模式", // XCDN (虽然是.cn，但作为国际列表中的服务商保留)

    // --- 其他Microsoft 静态资源 ---
    "DOMAIN-SUFFIX,azureedge.net,代理模式",
    "DOMAIN-SUFFIX,blob.core.windows.net,代理模式",
  ];
  configObj.rules = [
    "RULE-SET,china_android_app,中国安卓app",
    "RULE-SET,us_ai,美国AI节点",
    ...yourRulesArray,
    ...CDN_RULES,
    // 你的规则添加在上面
    "RULE-SET,private,DIRECT",
    //"RULE-SET,reject,REJECT",
    "RULE-SET,direct,DIRECT",
    "RULE-SET,icloud,DIRECT",
    "RULE-SET,apple,DIRECT",
    //"RULE-SET,google,代理模式",
    "RULE-SET,proxy,代理模式",
    "RULE-SET,lancidr,DIRECT",
    "RULE-SET,cncidr,DIRECT",
    "RULE-SET,telegramcidr,代理模式",
    "RULE-SET,tld-not-cn,代理模式",
    "RULE-SET,gfw,代理模式",
    // 中国直连
    "GEOSITE,cn,DIRECT",
    "GEOSITE,geolocation-cn,DIRECT",
    "GEOSITE,google,代理模式",
    "GEOIP,LAN,DIRECT",
    "GEOIP,CN,DIRECT",
    "MATCH,代理模式",
  ];
  return configObj;
}
/**
 * 处理Clash配置文件的主要函数
 * @param {string} configJsonStr - Clash配置的JSON字符串
 * @returns {string} 优化后的Clash配置JSON字符串
 */
function main(configJsonStr) {
  const configObj = JSON.parse(configJsonStr);
  // 1. 处理代理节点
  const processedConfig = processProxies(configObj);
  // 2. 添加代理组配置
  const configWithProxyGroups = addProxyGroups(processedConfig);
  // 3. 添加远程规则集配置
  const finalConfig = addRuleProviders(configWithProxyGroups);
  // 4. 添加和合并规则
  const configWithRules = addAndMergeRules(finalConfig);
  // 5. 关闭ipv6
  configWithRules["ipv6"] = 'false';
  return JSON.stringify(configWithRules, null, 2); // 使用2个空格美化输出
}
/**
 * 处理代理节点，包括去重和过滤
 * @param {object} configObj - Clash配置对象
 * @returns {object} 处理后的Clash配置对象
 */
function processProxies(configObj) {
  const clonedConfig = JSON.parse(JSON.stringify(configObj)); // 深拷贝，避免修改原始对象

  // 1. 去重并重命名重复的代理节点
  clonedConfig.proxies = renameDuplicateProxyNodes(clonedConfig.proxies);

  // 2. 过滤代理节点
  clonedConfig.proxies = filterProxyNodes(clonedConfig.proxies);

  return clonedConfig;
}

/**
 * 去重并重命名重复的代理节点
 * @param {Array<object>} proxies - 代理节点数组
 * @returns {Array<object>} 去重并重命名后的代理节点数组
 */
function renameDuplicateProxyNodes(proxies) {
  const nameCountMap = {};
  const processedProxies = [];

  proxies.forEach((proxyNode) => {
    let originalName = proxyNode.name;
    if (nameCountMap[originalName] === undefined) {
      nameCountMap[originalName] = 0;
    } else {
      nameCountMap[originalName]++;
      proxyNode.name = `${originalName}-(重名${nameCountMap[originalName]})`;
    }
    processedProxies.push(proxyNode);
  });
  return processedProxies;
}

/**
 * 过滤代理节点
 * @param {Array<object>} proxies - 代理节点数组
 * @returns {Array<object>} 过滤后的代理节点数组
 */
function filterProxyNodes(proxies) {
  // 全局排除过滤器,只要包含这些字符就会被排除
  const regxExclude = /伊朗|德黑兰|乌克兰/;
  // 可以添加 regxInclude 过滤器，如果需要启用
  // const regxInclude = /USA|美国|我的|MY|波兰|日本|香港|新加坡|英国|挪威|荷兰|奥地利|爱尔兰|西班牙|匈牙利|冰岛/;

  return proxies.filter((proxyNode) => {
    // 如果有包含过滤器，在这里添加逻辑
    // if (regxInclude && !regxInclude.test(proxyNode.name)) {
    //     return false;
    // }
    return !regxExclude.test(proxyNode.name);
  });
}

/**
 * 生成代理组的通用配置
 * @returns {object} 包含各种代理组类型通用配置的对象
 */
function getProxyGroupConfigs() {
  // 可选测试地址(按需切换)
  // "https://www.gstatic.com/generate_204"
  // "https://cp.cloudflare.com/generate_204"
  const TEST_URL = "https://www.google.com/generate_204";
  // 公共参数
  const base = {
    url: TEST_URL,
    timeout: 1500,          // 测试超时 (ms)
    lazy: true,             // 仅在被使用时才测试
    "disable-udp": false,
  };
  // 各类型独有参数
  const INTERVAL_DEFAULT = 120;   // url-test 测试间隔 (s)
  const INTERVAL_FAST = 30;       // fallback / load-balance 测试间隔 (s)
  const TOLERANCE = 200;          // 切换容忍度 (ms)
  return {
    handSelectConfig: { ...base, type: "select" },
    urlTestConfig: {
      ...base,
      type: "url-test",
      interval: INTERVAL_DEFAULT,
      tolerance: TOLERANCE,
    },
    fallbackTestConfig: {
      ...base,
      type: "fallback",
      interval: INTERVAL_FAST,
    },
    loadBalanceConfig: {
      ...base,
      type: "load-balance",
      interval: INTERVAL_FAST,
      strategy: "consistent-hashing",
    },
  };
}

/* 查询节点 */
function queryProxyNodesNameArray(configObj, filterRegex = null) {
  let proxyNodes = configObj.proxies || [];
  if (filterRegex) {
    proxyNodes = proxyNodes.filter((node) => filterRegex.test(node.name));
  }
  const proxyNodeNames = proxyNodes.map((proxyNode) => proxyNode.name);
  if (proxyNodeNames.length === 0) {
    //console.warn("警告: 没有可用的代理节点，代理组将为空。");
    proxyNodeNames.push("DIRECT");
  }
  return proxyNodeNames;
}

/**
 * 添加代理组配置
 * @param {object} configObj - Clash配置对象
 * @returns {object} 添加代理组后的Clash配置对象
 */
function addProxyGroups(configObj) {
  const {
    handSelectConfig,
    urlTestConfig,
    fallbackTestConfig,
    loadBalanceConfig,
  } = getProxyGroupConfigs();
  const proxyNodeNames = queryProxyNodesNameArray(configObj);
  const localProxyNodeNames = queryProxyNodesNameArray(
    configObj,
    /本地节点|本地/,
  );
  const usAiProxyNodeNames = queryProxyNodesNameArray(configObj, /美国AI节点|US|美国/);
  configObj["proxy-groups"] = [
    {
      name: "代理模式",
      type: "select",
      proxies: ["超时自动换", "手工选择", "速度最快", "负载均衡"],
    },
    {
      name: "手工选择",
      ...handSelectConfig,
      proxies: proxyNodeNames,
    },
    {
      name: "超时自动换",
      ...fallbackTestConfig,
      proxies: proxyNodeNames,
    },
    {
      name: "速度最快",
      ...urlTestConfig,
      proxies: proxyNodeNames,
    },
    {
      name: "负载均衡",
      ...loadBalanceConfig,
      proxies: proxyNodeNames,
    },
    {
      name: "公司内网",
      ...handSelectConfig,
      proxies: ["DIRECT", ...localProxyNodeNames],
    },
    {
      name: "中国安卓app",
      ...handSelectConfig,
      proxies: ["DIRECT", "代理模式"],
    },
    {
      name: "美国AI节点",
      ...fallbackTestConfig,
      proxies: [...usAiProxyNodeNames],
    },
  ];
  return configObj;
}

/**
 * 添加远程规则集配置（优化版）
 * @param {object} configObj - Clash配置对象
 * @returns {object} 添加远程规则集后的Clash配置对象
 */
function addRuleProviders(configObj) {
  // 定义规则集的基础信息：[名称, URL 文件名, 行为类型]
  // 行为类型 (behavior) 默认为 "domain"，如果是 "ipcidr" 或 "classical" 则需指定。
  // [规则名称, URL 文件名, 行为类型]
  const ruleDefinitions = [
    // Domain 规则集 (behavior: domain)
    ["reject", "reject", "domain"],
    ["icloud", "icloud", "domain"],
    ["apple", "apple", "domain"],
    ["google", "google", "domain"],
    ["proxy", "proxy", "domain"],
    ["direct", "direct", "domain"],
    ["private", "private", "domain"],
    ["gfw", "gfw", "domain"],
    ["tld-not-cn", "tld-not-cn", "domain"],

    // IPCIDR 规则集 (behavior: ipcidr)
    ["telegramcidr", "telegramcidr", "ipcidr"],
    ["cncidr", "cncidr", "ipcidr"],
    ["lancidr", "lancidr", "ipcidr"],

    // Classical 规则集 (behavior: classical)
    ["applications", "applications", "classical"],
  ];

  const base_url =
    "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/";
  const providers = {};

  for (const [name, filename, behavior] of ruleDefinitions) {
    // 规则集名称包含连字符时，需要用方括号访问，但这里作为 key 可以直接使用。
    providers[name] = {
      type: "http",
      // 根据定义设置行为类型
      behavior: behavior,
      // 完整的 URL
      url: `${base_url}${filename}.txt`,
      // 路径名
      path: `./ruleset/${name}.yaml`,
      // 更新间隔 (86400 秒 = 24 小时)
      interval: 86400,
    };
  }

  const china_android_app = {
    type: "http",
    behavior: "classical",
    url: "https://raw.githubusercontent.com/whp98/CHINA-MAINLAND-ANDROID-APP/refs/heads/main/clash_android_rules.yaml",
    // 更新间隔 (86400 秒 = 24 小时)
    interval: 86400,
    path: `./ruleset/china_android_app.yaml`,
  };
  const us_ai = {
    type: "http",
    behavior: "classical",
    url: "https://raw.githubusercontent.com/whp98/CLASH-US-AI-RULESET/main/US-AI.yaml",
    // 更新间隔 (86400 秒 = 24 小时)
    interval: 86400,
    path: `./ruleset/us_ai.yaml`,
  };
  providers["china_android_app"] = china_android_app;
  providers["us_ai"] = us_ai;
  // 将生成的规则集对象赋值给 configObj["rule-providers"]
  configObj["rule-providers"] = providers;
  return configObj;
}
