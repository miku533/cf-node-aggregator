# CF 节点聚合器

自动从多个来源抓取 Cloudflare 节点并转换为 Clash 格式的工具。

## 功能特性

- 🚀 自动从 GitHub 等来源抓取节点
- 🔄 支持多种节点格式解析（vmess, vless, trojan, ss 等）
- 📦 自动转换为 Clash 配置格式
- 🔍 节点去重和可用性检测
- ⚡ 使用 GitHub Actions 云端自动运行
- 📊 生成订阅链接
- 🌐 精美的 Web 界面展示节点统计
- 🔎 支持按端口查询节点

## 快速开始

### 本地使用

1. 安装依赖：
```bash
npm install
```

2. 配置节点源（编辑 `config.json`）

3. 运行抓取：
```bash
npm start
```

### 云端部署方式

#### 方式一：Cloudflare Pages（推荐，支持 IPv6）

**优势**：
- ✅ 完全免费，无限带宽
- ✅ 全球 CDN 加速
- ✅ 原生支持 IPv6
- ✅ 可设置访问密码保护
- ✅ 支持私有仓库

**快速部署**：
1. Fork 本仓库（可设为私有）
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 **Workers & Pages** → **Create** → **Connect to Git**
4. 选择你的仓库，配置构建命令：`npm install && npm start`
5. 部署完成！访问：`https://你的项目名.pages.dev`

详细教程：[CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md) | [QUICK_START.md](QUICK_START.md)

#### 方式二：GitHub Pages

1. Fork 本仓库到你的 GitHub 账号
2. 在仓库设置中启用 GitHub Actions
3. 启用 GitHub Pages（Settings → Pages）
4. 修改 `config.json` 配置你的节点源
5. 订阅链接：`https://你的用户名.github.io/仓库名/output/clash.yaml`

## Web 界面

项目包含一个精美的 Web 界面，可以查看：

- 📊 总节点数和国家/地区分布
- ⏰ 更新频率和最后更新时间
- 📈 节点类型统计图表
- 🌍 国家/地区分布图表
- 🔍 按端口查询节点功能
- 📋 一键复制订阅链接

访问方式：
- 本地：`http://localhost:8080`（运行 `npx http-server`）
- GitHub Pages：`https://你的用户名.github.io/仓库名/`

## 配置说明

编辑 `config.json` 文件：

```json
{
  "sources": [
    "https://raw.githubusercontent.com/xxx/xxx/main/nodes.txt"
  ],
  "output": {
    "clash": "output/clash.yaml",
    "base64": "output/nodes.txt"
  }
}
```

## 订阅使用

将生成的订阅链接导入到 Clash 客户端：

```
https://raw.githubusercontent.com/你的用户名/仓库名/main/output/clash.yaml
```

## 注意事项

- 请遵守当地法律法规
- 节点仅供学习交流使用
- 不保证节点可用性

## License

MIT