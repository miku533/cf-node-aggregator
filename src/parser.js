/**
 * 节点解析器 - 将各种格式的节点解析为统一格式
 */
export class NodeParser {
  /**
   * 解析节点链接
   */
  parse(nodeUrl) {
    try {
      if (nodeUrl.startsWith('vmess://')) {
        return this.parseVmess(nodeUrl);
      } else if (nodeUrl.startsWith('vless://')) {
        return this.parseVless(nodeUrl);
      } else if (nodeUrl.startsWith('trojan://')) {
        return this.parseTrojan(nodeUrl);
      } else if (nodeUrl.startsWith('ss://')) {
        return this.parseShadowsocks(nodeUrl);
      } else if (nodeUrl.startsWith('ssr://')) {
        return this.parseShadowsocksR(nodeUrl);
      }
      return null;
    } catch (error) {
      console.error(`解析节点失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 解析 VMess 节点
   */
  parseVmess(url) {
    const base64Str = url.replace('vmess://', '');
    const jsonStr = Buffer.from(base64Str, 'base64').toString('utf-8');
    const config = JSON.parse(jsonStr);

    return {
      type: 'vmess',
      name: config.ps || config.add || 'VMess',
      server: config.add,
      port: parseInt(config.port),
      uuid: config.id,
      alterId: parseInt(config.aid || 0),
      cipher: config.scy || 'auto',
      network: config.net || 'tcp',
      tls: config.tls === 'tls',
      ws: config.net === 'ws' ? {
        path: config.path || '/',
        headers: config.host ? { Host: config.host } : {}
      } : undefined
    };
  }

  /**
   * 解析 VLESS 节点
   */
  parseVless(url) {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    return {
      type: 'vless',
      name: decodeURIComponent(urlObj.hash.slice(1)) || 'VLESS',
      server: urlObj.hostname,
      port: parseInt(urlObj.port),
      uuid: urlObj.username,
      network: params.get('type') || 'tcp',
      tls: params.get('security') === 'tls',
      flow: params.get('flow') || undefined,
      ws: params.get('type') === 'ws' ? {
        path: params.get('path') || '/',
        headers: params.get('host') ? { Host: params.get('host') } : {}
      } : undefined
    };
  }

  /**
   * 解析 Trojan 节点
   */
  parseTrojan(url) {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    return {
      type: 'trojan',
      name: decodeURIComponent(urlObj.hash.slice(1)) || 'Trojan',
      server: urlObj.hostname,
      port: parseInt(urlObj.port),
      password: urlObj.username,
      sni: params.get('sni') || urlObj.hostname,
      skipCertVerify: params.get('allowInsecure') === '1'
    };
  }

  /**
   * 解析 Shadowsocks 节点
   */
  parseShadowsocks(url) {
    const base64Str = url.replace('ss://', '').split('#')[0];
    const decoded = Buffer.from(base64Str, 'base64').toString('utf-8');
    const [methodAndPass, serverAndPort] = decoded.split('@');
    const [method, password] = methodAndPass.split(':');
    const [server, port] = serverAndPort.split(':');
    
    const name = url.includes('#') 
      ? decodeURIComponent(url.split('#')[1]) 
      : 'Shadowsocks';

    return {
      type: 'ss',
      name,
      server,
      port: parseInt(port),
      cipher: method,
      password
    };
  }

  /**
   * 解析 ShadowsocksR 节点
   */
  parseShadowsocksR(url) {
    const base64Str = url.replace('ssr://', '');
    const decoded = Buffer.from(base64Str, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length < 6) return null;

    const [server, port, protocol, method, obfs, passwordAndParams] = parts;
    const [passwordBase64, ...params] = passwordAndParams.split('/?');
    const password = Buffer.from(passwordBase64, 'base64').toString('utf-8');

    return {
      type: 'ssr',
      name: 'ShadowsocksR',
      server,
      port: parseInt(port),
      cipher: method,
      password,
      protocol,
      obfs
    };
  }

  /**
   * 批量解析节点
   */
  parseAll(nodeUrls) {
    const parsed = [];
    for (const url of nodeUrls) {
      const node = this.parse(url);
      if (node) {
        parsed.push(node);
      }
    }
    console.log(`成功解析 ${parsed.length}/${nodeUrls.length} 个节点`);
    return parsed;
  }
}