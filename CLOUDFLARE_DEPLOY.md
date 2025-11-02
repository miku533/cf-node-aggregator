# Cloudflare Pages 部署指南

使用 Cloudflare Pages 部署可以获得更好的隐私保护和访问速度，支持 IPv6。

## 方式一：通过 Cloudflare Pages 部署（推荐）

### 1. 准备工作

确保你有：
- Cloudflare 账号
- GitHub 账号
- 本项目的 GitHub 仓库（可以是私有仓库）

### 2. 连接 GitHub 仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权 Cloudflare 访问你的 GitHub
6. 选择你的项目仓库

### 3. 配置构建设置

在构建配置页面：

```
Framework preset: None
Build command: npm install && npm start
Build output directory: /
Root directory: /
```

**环境变量**（可选）：
```
NODE_VERSION=20
```

### 4. 部署

1. 点击 **Save and Deploy**
2. 等待首次部署完成（约 1-2 分钟）
3. 部署成功后会获得一个 `.pages.dev` 域名

### 5. 配置自定义域名（可选）

如果你有自己的域名：

1. 在 Pages 项目设置中点击 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（例如：`nodes.yourdomain.com`）
4. 按照提示添加 DNS 记录
5. 等待 SSL 证书自动配置完成

### 6. 访问你的站点

部署完成后，你可以通过以下方式访问：

- Cloudflare Pages 域名：`https://你的项目名.pages.dev`
- 自定义域名：`https://nodes.yourdomain.com`（如果配置了）

订阅链接：
```
https://你的项目名.pages.dev/output/clash.yaml
```

## 方式二：使用 Cloudflare Workers（高级）

如果你想要更多控制，可以使用 Workers：

### 1. 创建 Worker

创建 `worker.js` 文件：

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 从 GitHub 获取最新数据
    const githubUrl = 'https://raw.githubusercontent.com/你的用户名/仓库名/main' + url.pathname;
    
    const response = await fetch(githubUrl);
    const data = await response.text();
    
    return new Response(data, {
      headers: {
        'Content-Type': response.headers.get('Content-Type'),
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
};
```

### 2. 部署 Worker

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

## 方式三：直接上传静态文件

### 1. 生成静态文件

```bash
npm install
npm start
```

### 2. 上传到 Cloudflare Pages

1. 在 Cloudflare Pages 中选择 **Direct Upload**
2. 将整个项目文件夹拖拽上传
3. 等待部署完成

## 自动化部署

### 配置 GitHub Actions 自动部署到 Cloudflare Pages

修改 `.github/workflows/update-nodes.yml`：

```yaml
name: 更新节点并部署到 Cloudflare

on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  update-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
        
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: 安装依赖
        run: npm install
        
      - name: 运行节点聚合
        run: npm start
        
      - name: 部署到 Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: 你的项目名
          directory: .
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 配置 Secrets

在 GitHub 仓库设置中添加：

1. `CLOUDFLARE_API_TOKEN`：
   - 登录 Cloudflare
   - 进入 **My Profile** → **API Tokens**
   - 创建 Token，权限选择 **Cloudflare Pages - Edit**

2. `CLOUDFLARE_ACCOUNT_ID`：
   - 在 Cloudflare Pages 项目设置中找到

## 隐私保护建议

### 1. 使用私有仓库

- 将 GitHub 仓库设置为 Private
- Cloudflare Pages 仍然可以访问私有仓库

### 2. 添加访问密码保护

在 Cloudflare Pages 项目中：

1. 进入 **Settings** → **Access Policy**
2. 启用 **Cloudflare Access**
3. 配置访问规则（例如：需要邮箱验证）

### 3. 限制访问地区

在 Cloudflare 中配置 WAF 规则：

```
(ip.geoip.country ne "CN") and (http.request.uri.path contains "/output/")
```

这会阻止非中国 IP 访问订阅文件。

### 4. 添加 Rate Limiting

防止滥用：

1. 进入 **Security** → **Rate Limiting**
2. 创建规则：
   - 路径：`/output/*`
   - 限制：每分钟 10 次请求

### 5. 使用自定义域名

使用自己的域名而不是 `.pages.dev`，更难被发现。

## 订阅链接示例

部署完成后，你的订阅链接将是：

```
https://你的项目名.pages.dev/output/clash.yaml
```

或使用自定义域名：

```
https://nodes.yourdomain.com/output/clash.yaml
```

## IPv6 支持

Cloudflare Pages 原生支持 IPv6：

- 自动启用 IPv6
- 无需额外配置
- 支持 IPv4/IPv6 双栈访问

测试 IPv6 访问：
```bash
curl -6 https://你的项目名.pages.dev/output/clash.yaml
```

## 性能优化

### 1. 启用缓存

Cloudflare 会自动缓存静态文件，但你可以自定义：

在 `_headers` 文件中：

```
/output/*
  Cache-Control: public, max-age=3600
  X-Robots-Tag: noindex
```

### 2. 启用 Brotli 压缩

Cloudflare 自动启用，无需配置。

### 3. 使用 CDN

Cloudflare 的全球 CDN 会自动加速你的内容。

## 故障排查

### 部署失败

1. 检查构建日志
2. 确认 `package.json` 配置正确
3. 验证 Node.js 版本兼容性

### 无法访问

1. 检查 DNS 配置
2. 验证 SSL 证书状态
3. 查看 Cloudflare 防火墙规则

### 数据未更新

1. 检查 GitHub Actions 是否运行成功
2. 验证 Cloudflare API Token 权限
3. 清除 Cloudflare 缓存

## 成本

Cloudflare Pages 免费套餐包括：

- ✅ 无限带宽
- ✅ 无限请求
- ✅ 500 次构建/月
- ✅ 自动 SSL
- ✅ 全球 CDN
- ✅ IPv6 支持

完全免费，无需担心费用！

## 安全建议

1. ✅ 使用私有 GitHub 仓库
2. ✅ 启用 Cloudflare Access 保护
3. ✅ 配置 Rate Limiting
4. ✅ 定期更换订阅链接
5. ✅ 不要在公开场合分享链接
6. ✅ 使用自定义域名增加隐蔽性

## 总结

使用 Cloudflare Pages 部署的优势：

- 🚀 全球 CDN 加速
- 🔒 免费 SSL 证书
- 🌐 原生 IPv6 支持
- 💰 完全免费
- 🔐 可配置访问控制
- 📊 实时分析统计
- ⚡ 自动化部署

推荐使用 Cloudflare Pages，既安全又快速！