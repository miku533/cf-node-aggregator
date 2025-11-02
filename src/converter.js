import yaml from 'js-yaml';

/**
 * Clash 配置转换器
 */
export class ClashConverter {
  constructor(config) {
    this.config = config;
    this.nameCounter = new Map(); // 用于跟踪重复的名称
  }

  /**
   * 将解析后的节点转换为 Clash 配置
   */
  convert(nodes) {
    this.nameCounter.clear(); // 重置计数器
    const proxies = nodes.map(node => this.convertNode(node)).filter(Boolean);
    
    // 确保所有节点名称唯一
    this.ensureUniqueNames(proxies);
    
    const clashConfig = {
      port: this.config.port || 7890,
      'socks-port': this.config.socks_port || 7891,
      'allow-lan': this.config.allow_lan || false,
      mode: this.config.mode || 'rule',
      'log-level': this.config.log_level || 'info',
      'external-controller': '127.0.0.1:9090',
      proxies: proxies,
      'proxy-groups': this.generateProxyGroups(proxies),
      rules: this.getDefaultRules()
    };

    return yaml.dump(clashConfig, {
      lineWidth: -1,
      noRefs: true
    });
  }

  /**
   * 转换单个节点
   */
  convertNode(node) {
    try {
      switch (node.type) {
        case 'vmess':
          return this.convertVmess(node);
        case 'vless':
          return this.convertVless(node);
        case 'trojan':
          return this.convertTrojan(node);
        case 'ss':
          return this.convertShadowsocks(node);
        case 'ssr':
          return this.convertShadowsocksR(node);
        default:
          return null;
      }
    } catch (error) {
      console.error(`转换节点失败: ${node.name}`, error.message);
      return null;
    }
  }

  /**
   * 转换 VMess 节点
   */
  convertVmess(node) {
    const proxy = {
      name: node.name,
      type: 'vmess',
      server: node.server,
      port: node.port,
      uuid: node.uuid,
      alterId: node.alterId || 0,
      cipher: node.cipher || 'auto',
      tls: node.tls || false,
      network: node.network || 'tcp'
    };

    if (node.network === 'ws' && node.ws) {
      proxy['ws-opts'] = {
        path: node.ws.path || '/',
        headers: node.ws.headers || {}
      };
    }

    return proxy;
  }

  /**
   * 转换 VLESS 节点
   */
  convertVless(node) {
    const proxy = {
      name: node.name,
      type: 'vless',
      server: node.server,
      port: node.port,
      uuid: node.uuid,
      tls: node.tls || false,
      network: node.network || 'tcp'
    };

    if (node.flow) {
      proxy.flow = node.flow;
    }

    if (node.network === 'ws' && node.ws) {
      proxy['ws-opts'] = {
        path: node.ws.path || '/',
        headers: node.ws.headers || {}
      };
    }

    return proxy;
  }

  /**
   * 转换 Trojan 节点
   */
  convertTrojan(node) {
    return {
      name: node.name,
      type: 'trojan',
      server: node.server,
      port: node.port,
      password: node.password,
      sni: node.sni || node.server,
      'skip-cert-verify': node.skipCertVerify || false
    };
  }

  /**
   * 转换 Shadowsocks 节点
   */
  convertShadowsocks(node) {
    return {
      name: node.name,
      type: 'ss',
      server: node.server,
      port: node.port,
      cipher: node.cipher,
      password: node.password
    };
  }

  /**
   * 转换 ShadowsocksR 节点
   */
  convertShadowsocksR(node) {
    return {
      name: node.name,
      type: 'ssr',
      server: node.server,
      port: node.port,
      cipher: node.cipher,
      password: node.password,
      protocol: node.protocol,
      obfs: node.obfs
    };
  }

  /**
   * 确保所有节点名称唯一
   */
  ensureUniqueNames(proxies) {
    const nameCount = new Map();
    
    // 第一遍：统计每个名称出现的次数
    proxies.forEach(proxy => {
      const count = nameCount.get(proxy.name) || 0;
      nameCount.set(proxy.name, count + 1);
    });
    
    // 第二遍：为重复的名称添加编号
    const nameIndex = new Map();
    proxies.forEach(proxy => {
      const originalName = proxy.name;
      const totalCount = nameCount.get(originalName);
      
      if (totalCount > 1) {
        const index = nameIndex.get(originalName) || 0;
        nameIndex.set(originalName, index + 1);
        
        if (index > 0) {
          proxy.name = `${originalName} [${index}]`;
        }
      }
    });
  }

  /**
   * 生成代理组
   */
  generateProxyGroups(proxies) {
    const proxyNames = proxies.map(p => p.name);

    return [
      {
        name: '🚀 节点选择',
        type: 'select',
        proxies: ['♻️ 自动选择', '🔰 故障转移', 'DIRECT', ...proxyNames]
      },
      {
        name: '♻️ 自动选择',
        type: 'url-test',
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300
      },
      {
        name: '🔰 故障转移',
        type: 'fallback',
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300
      },
      {
        name: '🎯 全球直连',
        type: 'select',
        proxies: ['DIRECT', '🚀 节点选择']
      },
      {
        name: '🛑 广告拦截',
        type: 'select',
        proxies: ['REJECT', 'DIRECT']
      }
    ];
  }

  /**
   * 获取默认规则
   */
  getDefaultRules() {
    return [
      'DOMAIN-SUFFIX,local,DIRECT',
      'IP-CIDR,127.0.0.0/8,DIRECT',
      'IP-CIDR,172.16.0.0/12,DIRECT',
      'IP-CIDR,192.168.0.0/16,DIRECT',
      'IP-CIDR,10.0.0.0/8,DIRECT',
      'IP-CIDR,17.0.0.0/8,DIRECT',
      'IP-CIDR,100.64.0.0/10,DIRECT',
      'DOMAIN-SUFFIX,cn,DIRECT',
      'DOMAIN-KEYWORD,baidu,DIRECT',
      'DOMAIN-KEYWORD,alipay,DIRECT',
      'DOMAIN-KEYWORD,taobao,DIRECT',
      'GEOIP,CN,DIRECT',
      'MATCH,🚀 节点选择'
    ];
  }
}