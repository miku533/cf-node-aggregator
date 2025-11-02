# 使用指南

## 快速开始

### 方式一：云端部署（推荐，无需本地环境）

这是最简单的方式，完全在 GitHub 上运行，无需任何本地配置。

1. **Fork 本仓库**
   - 访问本项目 GitHub 页面
   - 点击右上角 "Fork" 按钮

2. **启用 GitHub Actions**
   - 进入你 Fork 的仓库
   - 点击 "Actions" 标签
   - 点击 "I understand my workflows, go ahead and enable them"

3. **获取订阅链接**
   
   等待 Actions 自动运行完成后（约 1-2 分钟），使用以下链接：
   
   ```
   https://raw.githubusercontent.com/你的用户名/仓库名/main/output/clash.yaml
   ```
   
   将链接中的 `你的用户名` 和 `仓库名` 替换为实际值。

4. **导入到 Clash**
   - 打开 Clash 客户端
   - 添加配置 → 从 URL 导入
   - 粘贴上面的订阅链接
   - 点击下载/更新

### 方式二：本地运行

如果你想在本地测试或自定义：

```bash
# 1. 克隆仓库
git clone https://github.com/你的用户名/仓库名.git
cd 仓库名

# 2. 安装依赖
npm install

# 3. 运行程序
npm start
```

生成的文件在 `output/` 目录：
- `clash.yaml` - Clash 配置文件
- `nodes.txt` - Base64 编码的节点列表
- `stats.json` - 统计信息

## 配置节点源

编辑 [`config.json`](config.json) 文件来自定义节点源：

```json
{
  "sources": [
    "https://raw.githubusercontent.com/xxx/xxx/main/nodes.txt",
    "你的节点源URL"
  ],
  "output": {
    "clash": "output/clash.yaml",
    "base64": "output/nodes.txt"
  },
  "clash_config": {
    "port": 7890,
    "socks_port": 7891,
    "allow_lan": false,
    "mode": "rule",
    "log_level": "info"
  }
}
```

### 节点源格式

支持以下格式的节点源：
- 纯文本（每行一个节点）
- Base64 编码的节点列表
- 支持的协议：vmess, vless, trojan, ss, ssr

### 推荐的公开节点源

```json
{
  "sources": [
    "https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list.txt",
    "https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2",
    "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub"
  ]
}
```

## 自动更新

GitHub Actions 配置为自动更新：

- ⏰ **定时更新**：每 6 小时自动运行
- 🔄 **配置更新**：修改 `config.json` 时自动运行
- 🖱️ **手动触发**：在 Actions 页面手动运行

### 修改更新频率

编辑 [`.github/workflows/update-nodes.yml`](.github/workflows/update-nodes.yml)：

```yaml
schedule:
  - cron: '0 */6 * * *'  # 每6小时
```

常用频率：
- `0 */3 * * *` - 每 3 小时
- `0 */12 * * *` - 每 12 小时
- `0 0 * * *` - 每天午夜
- `0 0 * * 0` - 每周日午夜

## Clash 客户端配置

### Windows

1. 下载 [Clash for Windows](https://github.com/Fndroid/clash_for_windows_pkg/releases)
2. 打开软件 → Profiles
3. 粘贴订阅链接 → Download
4. 选择配置文件 → 启用系统代理

### macOS

1. 下载 [ClashX](https://github.com/yichengchen/clashX/releases)
2. 打开软件 → 配置 → 托管配置 → 管理
3. 添加订阅链接
4. 更新配置 → 选择配置

### Android

1. 下载 [Clash for Android](https://github.com/Kr328/ClashForAndroid/releases)
2. 打开软件 → 配置 → 新配置 → URL
3. 输入订阅链接 → 保存
4. 选择配置 → 启动

### iOS

1. 下载 Shadowrocket 或 Quantumult X（需美区账号）
2. 添加订阅 → 输入订阅链接
3. 更新订阅 → 连接

## 代理规则说明

生成的配置包含以下代理组：

- **🚀 节点选择**：手动选择节点
- **♻️ 自动选择**：自动选择延迟最低的节点
- **🔰 故障转移**：当前节点不可用时自动切换
- **🎯 全球直连**：直接连接，不走代理
- **🛑 广告拦截**：拦截广告域名

### 默认规则

- 国内网站和 IP：直连
- 局域网地址：直连
- 其他流量：通过代理

## 常见问题

### 1. 订阅链接无法访问

**原因**：仓库可能是私有的或 Actions 未运行成功

**解决**：
- 确保仓库是公开的
- 检查 Actions 是否运行成功
- 查看 Actions 日志排查错误

### 2. 节点数量为 0

**原因**：节点源失效或格式不支持

**解决**：
- 更换其他节点源
- 查看 Actions 日志中的详细错误
- 确认节点源 URL 可访问

### 3. 所有节点都无法连接

**原因**：节点可能已失效

**解决**：
- 等待自动更新（每 6 小时）
- 手动触发 Actions 更新
- 更换节点源

### 4. Actions 运行失败

**原因**：网络问题或配置错误

**解决**：
- 检查 `config.json` 格式是否正确
- 查看 Actions 错误日志
- 重新运行 workflow

### 5. 如何使用私有仓库

如果使用私有仓库，订阅链接需要添加 token：

```
https://raw.githubusercontent.com/用户名/仓库名/main/output/clash.yaml?token=你的token
```

获取 token：
1. GitHub Settings → Developer settings
2. Personal access tokens → Generate new token
3. 勾选 `repo` 权限
4. 生成并复制 token

## 性能优化

### 节点测速

可以添加节点测速功能，在 [`src/index.js`](src/index.js) 中实现。

### 节点过滤

在 [`src/deduplicator.js`](src/deduplicator.js) 中可以添加更多过滤条件：
- 按地区过滤
- 按协议过滤
- 按延迟过滤

## 安全建议

1. ⚠️ 不要在公开仓库中存储敏感信息
2. 🔒 定期检查节点源的可靠性
3. 🛡️ 建议使用私有仓库（需配置 token）
4. 📝 遵守当地法律法规

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License