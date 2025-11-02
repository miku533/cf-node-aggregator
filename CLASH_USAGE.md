# Clash 订阅使用说明

## ❓ 为什么导入后没有节点？

### 可能的原因

1. **订阅链接不正确**
2. **文件还未推送到 GitHub**
3. **Clash 客户端版本问题**
4. **网络问题**

## ✅ 正确的订阅链接格式

### GitHub Pages 部署
```
https://raw.githubusercontent.com/miku533/cf-node-aggregator/main/output/clash.yaml
```

### Cloudflare Pages 部署
```
https://你的项目名.pages.dev/output/clash.yaml
```

## 🔍 检查步骤

### 1. 确认文件已推送到 GitHub

访问这个链接，看是否能看到配置文件：
```
https://raw.githubusercontent.com/miku533/cf-node-aggregator/main/output/clash.yaml
```

如果看不到或显示 404，说明文件还没推送成功。

### 2. 检查配置文件内容

打开上面的链接，应该看到类似这样的内容：
```yaml
port: 7890
socks-port: 7891
allow-lan: false
mode: rule
log-level: info
proxies:
  - name: 香港|@ripaojiedian
    type: vmess
    server: v9.heduian.link
    ...
```

### 3. 确认节点数量

当前配置文件有 **44 个节点**，其中：
- VMess: 14 个
- Trojan: 14 个
- VLESS: 16 个

**注意**：前 10 个"防范境外势力渗透"节点是无效的（测试节点），实际可用节点是 34 个。

## 📱 Clash 客户端导入方法

### Windows - Clash for Windows

1. 打开 Clash for Windows
2. 点击左侧 **Profiles**
3. 在顶部输入框粘贴订阅链接：
   ```
   https://raw.githubusercontent.com/miku533/cf-node-aggregator/main/output/clash.yaml
   ```
4. 点击 **Download**
5. 等待下载完成
6. 点击配置文件名称激活
7. 回到 **General** 页面
8. 开启 **System Proxy**

### macOS - ClashX

1. 打开 ClashX
2. 点击菜单栏图标
3. **配置** → **托管配置** → **管理**
4. 点击 **添加**
5. 输入：
   - URL: `https://raw.githubusercontent.com/miku533/cf-node-aggregator/main/output/clash.yaml`
   - 名称: `CF节点聚合器`
6. 点击 **确定**
7. 选择刚添加的配置
8. 点击 **更新配置**
9. 开启 **设置为系统代理**

### Android - Clash for Android

1. 打开 Clash for Android
2. 点击 **配置**
3. 点击右上角 **+**
4. 选择 **URL**
5. 输入：
   - 名称: `CF节点聚合器`
   - URL: `https://raw.githubusercontent.com/miku533/cf-node-aggregator/main/output/clash.yaml`
   - 自动更新: 开启
   - 更新间隔: 1440 分钟（24小时）
6. 点击 **保存**
7. 选择该配置
8. 点击 **启动**

### iOS - Shadowrocket

1. 打开 Shadowrocket
2. 点击右上角 **+**
3. 选择 **Subscribe**
4. 输入：
   - URL: `https://raw.githubusercontent.com/miku533/cf-node-aggregator/main/output/clash.yaml`
   - 备注: `CF节点聚合器`
5. 点击 **完成**
6. 点击订阅右侧的 **i** 图标
7. 点击 **更新订阅**
8. 返回主页面，选择一个节点
9. 开启连接

## 🐛 故障排查

### 问题 1：导入后显示 0 个节点

**原因**：
- 订阅链接错误
- 文件格式问题
- 网络无法访问 GitHub

**解决**：
1. 检查订阅链接是否正确
2. 在浏览器中打开订阅链接，看是否能访问
3. 尝试使用 VPN 后再导入
4. 使用 Cloudflare Pages 部署（国内访问更快）

### 问题 2：节点全部超时

**原因**：
- 节点已失效
- 网络环境问题

**解决**：
1. 等待自动更新（每 6 小时）
2. 手动触发 GitHub Actions 更新
3. 更换节点源
4. 尝试不同的节点

### 问题 3：无法下载配置

**原因**：
- GitHub 访问受限
- 网络问题

**解决**：
1. 使用 Cloudflare Pages 部署
2. 使用代理后再导入
3. 下载配置文件后手动导入

## 💡 推荐配置

### 使用 Cloudflare Pages（推荐）

Cloudflare Pages 在国内访问更快更稳定：

1. 按照 `CLOUDFLARE_DEPLOY.md` 部署到 Cloudflare
2. 使用 Cloudflare 的订阅链接：
   ```
   https://你的项目名.pages.dev/output/clash.yaml
   ```

### 本地文件导入

如果网络问题无法在线导入：

1. 下载配置文件：
   ```bash
   # 在项目目录
   cat output/clash.yaml
   ```

2. 复制全部内容

3. 在 Clash 中：
   - Windows: Profiles → 点击文件图标 → 粘贴内容 → 保存
   - macOS: 配置 → 编辑配置 → 粘贴内容 → 保存
   - Android: 配置 → 新建配置 → 粘贴内容 → 保存

## 📊 节点说明

当前配置包含的节点：

| 类型 | 数量 | 说明 |
|------|------|------|
| VMess | 14 | 包括香港、美国、加拿大节点 |
| Trojan | 14 | 包括香港、日本、新加坡、美国节点 |
| VLESS | 16 | 包括美国、加拿大、俄罗斯等节点 |

**注意**：前 10 个"防范境外势力渗透"节点是测试节点，无法使用。

## 🔄 更新订阅

### 自动更新
- Clash 会根据设置的间隔自动更新
- 建议设置为 24 小时更新一次

### 手动更新
- Clash for Windows: Profiles → 点击配置右侧的刷新图标
- ClashX: 配置 → 更新配置
- Clash for Android: 配置 → 点击配置 → 更新

## 🎯 使用建议

1. **选择节点**：
   - 优先选择香港、日本、新加坡节点（延迟低）
   - 美国节点适合访问美国网站
   - 避免使用"防范境外势力渗透"节点

2. **代理模式**：
   - 规则模式：自动分流（推荐）
   - 全局模式：所有流量走代理
   - 直连模式：不使用代理

3. **定期更新**：
   - 每天更新一次订阅
   - 节点失效时手动更新

## 📞 需要帮助？

如果还有问题：
1. 检查 GitHub Actions 是否运行成功
2. 确认配置文件已推送到 GitHub
3. 尝试使用 Cloudflare Pages 部署
4. 查看 Clash 日志了解详细错误

---

祝使用愉快！🎉