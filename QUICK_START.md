# 快速开始指南

## 🚀 5 分钟部署到 Cloudflare Pages

### 步骤 1：准备 GitHub 仓库

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit"

# 4. 创建 GitHub 仓库并推送
# 在 GitHub 上创建新仓库（可以是私有仓库）
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

### 步骤 2：部署到 Cloudflare Pages

#### 方法 A：通过 Cloudflare Dashboard（推荐，最简单）

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击左侧 **Workers & Pages**
3. 点击 **Create application** → **Pages** → **Connect to Git**
4. 选择你的 GitHub 仓库
5. 配置构建设置：
   ```
   Build command: npm install && npm start
   Build output directory: /
   ```
6. 点击 **Save and Deploy**
7. 等待 1-2 分钟，完成！

#### 方法 B：通过 GitHub Actions 自动部署

1. 获取 Cloudflare API Token：
   - 访问 [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - 点击 **Create Token**
   - 使用 **Edit Cloudflare Workers** 模板
   - 复制生成的 Token

2. 获取 Account ID：
   - 在 Cloudflare Pages 项目页面
   - 右侧可以看到 **Account ID**

3. 在 GitHub 仓库设置 Secrets：
   - 进入仓库 **Settings** → **Secrets and variables** → **Actions**
   - 添加以下 Secrets：
     - `CLOUDFLARE_API_TOKEN`: 你的 API Token
     - `CLOUDFLARE_ACCOUNT_ID`: 你的 Account ID

4. 推送代码，GitHub Actions 会自动部署！

### 步骤 3：访问你的站点

部署完成后：

- **Web 界面**: `https://你的项目名.pages.dev`
- **订阅链接**: `https://你的项目名.pages.dev/output/clash.yaml`

## 🔒 隐私保护设置

### 1. 使用私有仓库

在 GitHub 上将仓库设置为 Private：
- 仓库 **Settings** → **Danger Zone** → **Change visibility** → **Make private**

### 2. 添加访问密码（推荐）

在 Cloudflare Pages 中启用 Access：

1. 进入你的 Pages 项目
2. 点击 **Settings** → **Access Policy**
3. 点击 **Enable Access Policy**
4. 选择认证方式：
   - **One-time PIN**: 通过邮箱验证码
   - **GitHub**: 通过 GitHub 账号登录
   - **Google**: 通过 Google 账号登录

配置示例（只允许特定邮箱访问）：
```
Policy name: 订阅访问控制
Path: /output/*
Action: Allow
Include: Emails ending in @yourdomain.com
```

### 3. 限制访问频率

防止滥用，在 Cloudflare 中配置 Rate Limiting：

1. 进入 **Security** → **WAF**
2. 创建 Rate Limiting 规则：
   ```
   If: (http.request.uri.path contains "/output/")
   Then: Rate limit
   Requests: 10 requests per minute
   ```

### 4. 使用自定义域名

使用自己的域名更隐蔽：

1. 在 Pages 项目中点击 **Custom domains**
2. 添加你的域名（如：`nodes.yourdomain.com`）
3. 按提示配置 DNS
4. 等待 SSL 证书自动配置

## 📱 导入订阅到 Clash

### Windows / macOS

1. 打开 Clash 客户端
2. 点击 **Profiles** / **配置**
3. 点击 **Import from URL** / **从 URL 导入**
4. 粘贴订阅链接：
   ```
   https://你的项目名.pages.dev/output/clash.yaml
   ```
5. 点击 **Download** / **下载**
6. 选择该配置并启用

### Android

1. 打开 Clash for Android
2. 点击 **配置**
3. 点击右上角 **+**
4. 选择 **URL**
5. 输入订阅链接
6. 点击保存并选择该配置

### iOS

1. 打开 Shadowrocket / Quantumult X
2. 点击右上角 **+**
3. 选择 **Subscribe** / **订阅**
4. 输入订阅链接
5. 保存并更新订阅

## 🔄 自动更新

项目已配置自动更新：

- ⏰ 每 6 小时自动运行一次
- 🔄 修改配置文件时自动运行
- 🖱️ 可在 GitHub Actions 页面手动触发

查看运行状态：
- 进入 GitHub 仓库
- 点击 **Actions** 标签
- 查看最新的 workflow 运行记录

## 🛠️ 自定义配置

### 修改节点源

编辑 `config.json`：

```json
{
  "sources": [
    "https://raw.githubusercontent.com/xxx/xxx/main/nodes.txt",
    "你的其他节点源..."
  ]
}
```

提交后会自动更新。

### 修改更新频率

编辑 `.github/workflows/deploy-cloudflare.yml`：

```yaml
schedule:
  - cron: '0 */3 * * *'  # 改为每 3 小时
```

常用频率：
- `0 */3 * * *` - 每 3 小时
- `0 */12 * * *` - 每 12 小时
- `0 0 * * *` - 每天午夜

## 📊 查看统计

访问 Web 界面查看：

- 总节点数
- 国家/地区分布
- 节点类型统计
- 按端口查询节点

## ❓ 常见问题

### Q: 部署失败怎么办？

A: 检查以下几点：
1. GitHub Actions 日志中的错误信息
2. 确认 Cloudflare API Token 权限正确
3. 验证 `package.json` 配置正确

### Q: 订阅链接无法访问？

A: 可能原因：
1. 部署还未完成，等待几分钟
2. 检查 Cloudflare Pages 部署状态
3. 确认 DNS 配置正确（如果使用自定义域名）

### Q: 节点数量为 0？

A: 检查：
1. 节点源是否有效
2. GitHub Actions 运行日志
3. 尝试更换其他节点源

### Q: 如何完全隐藏项目？

A: 建议：
1. ✅ 使用私有 GitHub 仓库
2. ✅ 启用 Cloudflare Access 密码保护
3. ✅ 使用自定义域名
4. ✅ 不要在公开场合分享链接
5. ✅ 定期更换域名或路径

## 🎉 完成！

现在你已经成功部署了自己的节点聚合器！

- 🌐 Web 界面：`https://你的项目名.pages.dev`
- 📋 订阅链接：`https://你的项目名.pages.dev/output/clash.yaml`
- 🔄 自动更新：每 6 小时
- 🔒 隐私保护：私有仓库 + 访问控制

享受你的私人节点服务吧！🚀