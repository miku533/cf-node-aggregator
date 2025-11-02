import axios from 'axios';
import yaml from 'js-yaml';

/**
 * 节点抓取器
 */
export class NodeFetcher {
  constructor(sources) {
    this.sources = sources;
  }

  /**
   * 从所有源抓取节点
   */
  async fetchAll() {
    console.log(`开始从 ${this.sources.length} 个源抓取节点...`);
    const results = await Promise.allSettled(
      this.sources.map(source => this.fetchFromSource(source))
    );

    const allNodes = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allNodes.push(...result.value);
        console.log(`✓ 源 ${index + 1}: 获取 ${result.value.length} 个节点`);
      } else {
        console.error(`✗ 源 ${index + 1}: 失败 - ${result.reason.message}`);
      }
    });

    console.log(`总共获取 ${allNodes.length} 个节点`);
    return allNodes;
  }

  /**
   * 从单个源抓取节点
   */
  async fetchFromSource(source) {
    try {
      const response = await axios.get(source, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      let content = response.data;
      
      // 检查是否为 Clash 配置文件
      if (this.isClashConfig(content)) {
        return this.parseClashConfig(content);
      }
      
      // 如果是 base64 编码，先解码
      if (this.isBase64(content)) {
        content = Buffer.from(content, 'base64').toString('utf-8');
        
        // 解码后再次检查是否为 Clash 配置
        if (this.isClashConfig(content)) {
          return this.parseClashConfig(content);
        }
      }

      // 按行分割并过滤空行
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && this.isValidNode(line));

      return lines;
    } catch (error) {
      throw new Error(`抓取失败: ${error.message}`);
    }
  }

  /**
   * 检查是否为 Clash 配置文件
   */
  isClashConfig(content) {
    if (typeof content !== 'string') return false;
    
    // 检查是否包含 Clash 配置的关键字
    const clashKeywords = ['proxies:', 'proxy-groups:', 'rules:'];
    return clashKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * 解析 Clash 配置文件，提取节点链接
   */
  parseClashConfig(content) {
    try {
      const config = yaml.load(content);
      const nodes = [];

      if (config && config.proxies && Array.isArray(config.proxies)) {
        // 将 Clash 代理配置转换回节点链接
        config.proxies.forEach(proxy => {
          const nodeUrl = this.proxyToNodeUrl(proxy);
          if (nodeUrl) {
            nodes.push(nodeUrl);
          }
        });
      }

      console.log(`从 Clash 配置中提取 ${nodes.length} 个节点`);
      return nodes;
    } catch (error) {
      console.error('解析 Clash 配置失败:', error.message);
      return [];
    }
  }

  /**
   * 将 Clash 代理配置转换为节点链接
   */
  proxyToNodeUrl(proxy) {
    try {
      switch (proxy.type) {
        case 'vmess':
          return this.vmessToUrl(proxy);
        case 'vless':
          return this.vlessToUrl(proxy);
        case 'trojan':
          return this.trojanToUrl(proxy);
        case 'ss':
          return this.ssToUrl(proxy);
        default:
          return null;
      }
    } catch (error) {
      console.error(`转换节点失败: ${proxy.name}`, error.message);
      return null;
    }
  }

  /**
   * VMess 配置转 URL
   */
  vmessToUrl(proxy) {
    const config = {
      v: '2',
      ps: proxy.name,
      add: proxy.server,
      port: proxy.port.toString(),
      id: proxy.uuid,
      aid: (proxy.alterId || 0).toString(),
      net: proxy.network || 'tcp',
      type: 'none',
      host: '',
      path: '',
      tls: proxy.tls ? 'tls' : ''
    };

    if (proxy['ws-opts']) {
      config.path = proxy['ws-opts'].path || '/';
      config.host = proxy['ws-opts'].headers?.Host || '';
    }

    const jsonStr = JSON.stringify(config);
    const base64 = Buffer.from(jsonStr).toString('base64');
    return `vmess://${base64}`;
  }

  /**
   * VLESS 配置转 URL
   */
  vlessToUrl(proxy) {
    const params = new URLSearchParams();
    params.set('type', proxy.network || 'tcp');
    params.set('security', proxy.tls ? 'tls' : 'none');
    
    if (proxy.flow) {
      params.set('flow', proxy.flow);
    }
    
    if (proxy['ws-opts']) {
      params.set('path', proxy['ws-opts'].path || '/');
      if (proxy['ws-opts'].headers?.Host) {
        params.set('host', proxy['ws-opts'].headers.Host);
      }
    }

    return `vless://${proxy.uuid}@${proxy.server}:${proxy.port}?${params.toString()}#${encodeURIComponent(proxy.name)}`;
  }

  /**
   * Trojan 配置转 URL
   */
  trojanToUrl(proxy) {
    const params = new URLSearchParams();
    params.set('sni', proxy.sni || proxy.server);
    if (proxy['skip-cert-verify']) {
      params.set('allowInsecure', '1');
    }

    return `trojan://${proxy.password}@${proxy.server}:${proxy.port}?${params.toString()}#${encodeURIComponent(proxy.name)}`;
  }

  /**
   * Shadowsocks 配置转 URL
   */
  ssToUrl(proxy) {
    const userInfo = `${proxy.cipher}:${proxy.password}`;
    const base64 = Buffer.from(userInfo).toString('base64');
    return `ss://${base64}@${proxy.server}:${proxy.port}#${encodeURIComponent(proxy.name)}`;
  }

  /**
   * 检查是否为 base64 编码
   */
  isBase64(str) {
    if (typeof str !== 'string') return false;
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return base64Regex.test(str.replace(/\s/g, '')) && str.length % 4 === 0;
  }

  /**
   * 检查是否为有效节点
   */
  isValidNode(line) {
    const protocols = ['vmess://', 'vless://', 'trojan://', 'ss://', 'ssr://'];
    return protocols.some(protocol => line.startsWith(protocol));
  }
}