# 部署指南

本项目支持通过 GitHub Actions 实现完全云端自动化运行，无需本地服务器或 VPS。

## 云端部署步骤

### 1. Fork 仓库

1. 访问本项目的 GitHub 页面
2. 点击右上角的 "Fork" 按钮
3. 将仓库 Fork 到你的 GitHub 账号下

### 2. 启用 GitHub Actions

1. 进入你 Fork 的仓库
2. 点击 "Actions" 标签
3. 如果看到提示，点击 "I understand my workflows, go ahead and enable them"

### 3. 配置节点源（可选）

编辑 `config.json` 文件，添加或修改你想要抓取的节点源：

```json
{
  "sources": [
    "https://raw.githubusercontent.com/xxx/xxx/main/nodes.txt",
    "你的其他节点源..."
  ]
}
```

提交更改后，GitHub Actions 会自动运行。

### 4. 手动触发运行（可选）

1. 进入仓库的 "Actions" 标签
2. 选择 "更新节点" workflow
3. 点击 "Run workflow" 按钮
4. 点击绿色的 "Run workflow" 确认

### 5. 获取订阅链接

运行完成后，你可以使用以下链接订阅：

**Clash 订阅链接：**
```
https://raw.githubusercontent.com/你的用户名/仓库名/main/output/clash.yaml
```

**Base64 订阅链接：**
```
https://raw.githubusercontent.com/你的用户名/仓库名/main/output/nodes.txt
```

将 `你的用户名` 和 `仓库名` 替换为实际值。

## 自动更新说明

GitHub Actions 配置为：
- ⏰ 每 6 小时自动运行一次
- 🔄 修改配置文件或源代码时自动运行
- 🖱️ 支持手动触发运行

## 使用 GitHub Pages（可选）

如果你想要更短的订阅链接，可以启用 GitHub Pages：

1. 进入仓库设置 (Settings)
2. 找到 "Pages" 部分
3. Source 选择 "main" 分支
4. 文件夹选择 "/ (root)"
5. 点击 "Save"

启用后，你的订阅链接将变为：
```
https://你的用户名.github.io/仓库名/output/clash.yaml
```

## 本地测试

如果你想在本地测试：

```bash
# 安装依赖
npm install

# 运行程序
npm start
```

生成的文件将保存在 `output/` 目录下。

## 故障排查

### Actions 运行失败

1. 检查 Actions 标签页的错误日志
2. 确认节点源 URL 是否可访问
3. 检查 `config.json` 格式是否正确

### 订阅链接无法访问

1. 确认 Actions 已成功运行
2. 检查 `output/` 目录是否有生成的文件
3. 确认仓库是公开的（Private 仓库需要 token）

### 节点数量为 0

1. 检查节点源是否有效
2. 查看 Actions 日志中的详细错误信息
3. 尝试更换其他节点源

## 安全建议

- 不要在公开仓库中存储敏感信息
- 定期检查节点源的可靠性
- 建议使用私有仓库（需要配置访问 token）

## 高级配置

### 修改更新频率

编辑 `.github/workflows/update-nodes.yml` 文件中的 cron 表达式：

```yaml
schedule:
  - cron: '0 */6 * * *'  # 每6小时运行一次
```

常用的 cron 表达式：
- `0 */3 * * *` - 每3小时
- `0 */12 * * *` - 每12小时
- `0 0 * * *` - 每天午夜

### 添加节点测速

可以集成节点测速功能，在 `src/index.js` 中添加测速逻辑。

## 许可证

MIT License - 请遵守当地法律法规使用