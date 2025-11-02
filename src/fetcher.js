import axios from 'axios';

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
      
      // 如果是 base64 编码，先解码
      if (this.isBase64(content)) {
        content = Buffer.from(content, 'base64').toString('utf-8');
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