/**
 * 节点去重器
 */
export class NodeDeduplicator {
  /**
   * 去除重复节点
   */
  deduplicate(nodes) {
    const seen = new Set();
    const unique = [];

    for (const node of nodes) {
      const key = this.generateKey(node);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(node);
      }
    }

    console.log(`去重: ${nodes.length} -> ${unique.length} (移除 ${nodes.length - unique.length} 个重复节点)`);
    return unique;
  }

  /**
   * 生成节点唯一标识
   */
  generateKey(node) {
    // 使用服务器地址、端口和类型作为唯一标识
    return `${node.type}:${node.server}:${node.port}`;
  }

  /**
   * 过滤无效节点
   */
  filterValid(nodes) {
    const valid = nodes.filter(node => {
      // 检查必要字段
      if (!node.server || !node.port) {
        return false;
      }

      // 检查端口范围
      if (node.port < 1 || node.port > 65535) {
        return false;
      }

      // 检查服务器地址
      if (!this.isValidServer(node.server)) {
        return false;
      }

      return true;
    });

    console.log(`过滤无效节点: ${nodes.length} -> ${valid.length} (移除 ${nodes.length - valid.length} 个无效节点)`);
    return valid;
  }

  /**
   * 检查服务器地址是否有效
   */
  isValidServer(server) {
    // 检查是否为空或包含非法字符
    if (!server || server.includes(' ')) {
      return false;
    }

    // 简单的域名或 IP 地址验证
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

    return domainRegex.test(server) || ipRegex.test(server);
  }

  /**
   * 按延迟排序（如果有延迟数据）
   */
  sortByLatency(nodes) {
    return nodes.sort((a, b) => {
      const latencyA = a.latency || Infinity;
      const latencyB = b.latency || Infinity;
      return latencyA - latencyB;
    });
  }
}