import fs from 'fs';
import path from 'path';
import { NodeFetcher } from './fetcher.js';
import { NodeParser } from './parser.js';
import { ClashConverter } from './converter.js';
import { NodeDeduplicator } from './deduplicator.js';

/**
 * 主程序
 */
class NodeAggregator {
  constructor(configPath = './config.json') {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    this.fetcher = new NodeFetcher(this.config.sources);
    this.parser = new NodeParser();
    this.converter = new ClashConverter(this.config.clash_config);
    this.deduplicator = new NodeDeduplicator();
  }

  /**
   * 运行主流程
   */
  async run() {
    try {
      console.log('='.repeat(50));
      console.log('CF 节点聚合器启动');
      console.log('='.repeat(50));

      // 1. 抓取节点
      console.log('\n[1/5] 抓取节点...');
      const rawNodes = await this.fetcher.fetchAll();

      if (rawNodes.length === 0) {
        console.error('❌ 未获取到任何节点');
        return;
      }

      // 2. 解析节点
      console.log('\n[2/5] 解析节点...');
      const parsedNodes = this.parser.parseAll(rawNodes);

      if (parsedNodes.length === 0) {
        console.error('❌ 未成功解析任何节点');
        return;
      }

      // 3. 过滤无效节点
      console.log('\n[3/5] 过滤无效节点...');
      const validNodes = this.deduplicator.filterValid(parsedNodes);

      // 4. 去重
      console.log('\n[4/5] 去除重复节点...');
      const uniqueNodes = this.deduplicator.deduplicate(validNodes);

      // 5. 生成配置文件
      console.log('\n[5/5] 生成配置文件...');
      await this.generateOutput(uniqueNodes, rawNodes);

      console.log('\n' + '='.repeat(50));
      console.log('✅ 完成！');
      console.log(`总计: ${uniqueNodes.length} 个可用节点`);
      console.log('='.repeat(50));

    } catch (error) {
      console.error('❌ 运行失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * 生成输出文件
   */
  async generateOutput(nodes, rawNodes) {
    // 确保输出目录存在
    const outputDir = path.dirname(this.config.output.clash);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成 Clash 配置
    const clashConfig = this.converter.convert(nodes);
    fs.writeFileSync(this.config.output.clash, clashConfig, 'utf-8');
    console.log(`✓ Clash 配置: ${this.config.output.clash}`);

    // 生成 Base64 订阅
    const base64Content = Buffer.from(rawNodes.join('\n')).toString('base64');
    fs.writeFileSync(this.config.output.base64, base64Content, 'utf-8');
    console.log(`✓ Base64 订阅: ${this.config.output.base64}`);

    // 生成统计信息
    const stats = this.generateStats(nodes);
    const statsPath = path.join(outputDir, 'stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf-8');
    console.log(`✓ 统计信息: ${statsPath}`);

    // 生成节点详细信息（供前端使用）
    const nodesData = this.generateNodesData(nodes);
    const nodesDataPath = path.join(outputDir, 'nodes.json');
    fs.writeFileSync(nodesDataPath, JSON.stringify(nodesData, null, 2), 'utf-8');
    console.log(`✓ 节点数据: ${nodesDataPath}`);
  }

  /**
   * 生成统计信息
   */
  generateStats(nodes) {
    const stats = {
      total: nodes.length,
      updateTime: new Date().toISOString(),
      updateInterval: '6 小时',
      byType: {},
      byCountry: {},
      byPort: {}
    };

    // 按类型、国家、端口统计
    for (const node of nodes) {
      // 类型统计
      stats.byType[node.type] = (stats.byType[node.type] || 0) + 1;
      
      // 国家统计（从节点名称提取）
      const country = this.extractCountry(node.name);
      if (country) {
        stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
      }
      
      // 端口统计
      const port = node.port;
      if (port) {
        stats.byPort[port] = (stats.byPort[port] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * 从节点名称提取国家信息
   */
  extractCountry(name) {
    const countryMap = {
      '香港': 'HK', 'HK': 'HK', '🇭🇰': 'HK',
      '台湾': 'TW', 'TW': 'TW', '🇹🇼': 'TW',
      '日本': 'JP', 'JP': 'JP', '🇯🇵': 'JP',
      '韩国': 'KR', 'KR': 'KR', '🇰🇷': 'KR',
      '新加坡': 'SG', 'SG': 'SG', '🇸🇬': 'SG',
      '美国': 'US', 'US': 'US', '🇺🇸': 'US',
      '加拿大': 'CA', 'CA': 'CA', '🇨🇦': 'CA',
      '英国': 'GB', 'GB': 'GB', '🇬🇧': 'GB',
      '德国': 'DE', 'DE': 'DE', '🇩🇪': 'DE',
      '法国': 'FR', 'FR': 'FR', '🇫🇷': 'FR',
      '俄罗斯': 'RU', 'RU': 'RU', '🇷🇺': 'RU',
      '印度': 'IN', 'IN': 'IN', '🇮🇳': 'IN',
      '澳大利亚': 'AU', 'AU': 'AU', '🇦🇺': 'AU',
      '中国': 'CN', 'CN': 'CN', '🇨🇳': 'CN'
    };

    for (const [key, value] of Object.entries(countryMap)) {
      if (name.includes(key)) {
        return value;
      }
    }

    return 'Unknown';
  }

  /**
   * 生成节点详细数据
   */
  generateNodesData(nodes) {
    return {
      updateTime: new Date().toISOString(),
      total: nodes.length,
      nodes: nodes.map(node => ({
        name: node.name,
        type: node.type,
        server: node.server,
        port: node.port,
        country: this.extractCountry(node.name)
      }))
    };
  }
}

// 运行程序
const aggregator = new NodeAggregator();
aggregator.run();