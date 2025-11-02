# 订阅源使用指南

## 📋 订阅源类型

### 1. 原始节点链接 ✅ 前端支持

**格式**：每行一个节点链接
```
vmess://...
vless://...
trojan://...
ss://...
```

**示例**：
```
https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list.txt
https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2
```

**使用方式**：
- ✅ 可以在前端添加
- ✅ 可以在后端配置文件添加

### 2. 订阅转换链接 ⚠️ 仅后端支持

**格式**：返回 Clash 配置文件的链接
```
https://url.v1.mk/sub?target=clash&url=...
https://sub.xeton.dev/sub?target=clash&url=...
https://api.dler.io/sub?target=clash&url=...
```

**示例**：
```
https://url.v1.mk/sub?target=clash&url=https%3A%2F%2Fisha.e.e.d.0.4.2.0.0.0.7.4.0.1.0.0.2.ip6.arpa%2Fadmin%2Fsub&insert=false
```

**使用方式**：
- ❌ 不能在前端添加（CORS 限制）
- ✅ 可以在后端配置文件添加

**原因**：
- 订阅转换服务通常不允许跨域访问
- 浏览器会阻止跨域请求
- 需要在服务器端（Node.js）访问

### 3. Clash 配置文件 ⚠️ 仅后端支持

**格式**：YAML 格式的 Clash 配置
```yaml
proxies:
  - name: 节点1
    type: vmess
    server: example.com
    ...
```

**使用方式**：
- ❌ 不能在前端添加（CORS 限制）
- ✅ 可以在后端配置文件添加

## 🔧 使用方法

### 方法 1：后端配置文件（推荐）

**适用于**：所有类型的订阅源

**步骤**：

1. 编辑 `config.json`：
```json
{
  "sources": [
    "https://raw.githubusercontent.com/xxx/xxx/main/nodes.txt",
    "https://url.v1.mk/sub?target=clash&url=...",
    "其他订阅源..."
  ]
}
```

2. 运行程序：
```bash
npm start
```

3. 推送到 GitHub：
```bash
git add config.json output/
git commit -m "更新订阅源"
git push
```

4. GitHub Actions 会自动运行并更新节点

**优点**：
- ✅ 支持所有类型的订阅源
- ✅ 没有 CORS 限制
- ✅ 自动定时更新
- ✅ 稳定可靠

### 方法 2：前端页面添加

**适用于**：原始节点链接（GitHub raw 等）

**步骤**：

1. 打开网页
2. 找到"订阅源管理"
3. 输入订阅源 URL
4. 点击"添加订阅源"
5. 点击"立即抓取并合并节点"

**限制**：
- ❌ 不支持订阅转换链接（CORS 限制）
- ❌ 不支持 Clash 配置文件（CORS 限制）
- ✅ 仅支持允许跨域的原始节点链接

**适用场景**：
- 临时测试节点
- 快速添加简单的订阅源
- 不需要自动更新

## 🎯 推荐方案

### 场景 1：长期使用

**推荐**：后端配置文件

**原因**：
- 支持所有类型订阅源
- 自动定时更新
- 稳定可靠

**步骤**：
1. 编辑 `config.json`
2. 添加所有订阅源
3. 推送到 GitHub
4. 让 GitHub Actions 自动运行

### 场景 2：临时测试

**推荐**：前端页面

**原因**：
- 快速添加
- 立即查看结果
- 不需要修改代码

**步骤**：
1. 打开网页
2. 添加订阅源
3. 立即抓取
4. 下载节点文件

### 场景 3：订阅转换链接

**必须**：后端配置文件

**原因**：
- 前端无法访问（CORS 限制）
- 只能在服务器端运行

**步骤**：
1. 编辑 `config.json`
2. 添加订阅转换链接
3. 运行 `npm start`
4. 推送到 GitHub

## ❓ 常见问题

### Q: 为什么前端抓取显示 0 个节点？

A: 可能的原因：

1. **CORS 限制**
   - 订阅转换链接不允许跨域
   - 解决：使用后端配置文件

2. **网络问题**
   - 无法访问订阅源
   - 解决：检查网络连接

3. **链接格式错误**
   - URL 不正确
   - 解决：检查链接是否有效

### Q: 如何判断订阅源类型？

A: 

**原始节点链接**：
- 返回纯文本
- 每行一个节点链接
- 以 `vmess://`, `vless://` 等开头

**订阅转换链接**：
- URL 包含 `target=clash`
- 返回 YAML 格式的 Clash 配置
- 包含 `proxies:`, `proxy-groups:` 等

**Clash 配置文件**：
- 直接的 YAML 文件
- 包含完整的 Clash 配置结构

### Q: 如何使用订阅转换链接？

A: 

1. **获取订阅转换链接**：
   - 访问订阅转换网站（如 url.v1.mk）
   - 输入原始订阅链接
   - 选择 Clash 格式
   - 生成转换链接

2. **添加到配置文件**：
   ```json
   {
     "sources": [
       "https://url.v1.mk/sub?target=clash&url=..."
     ]
   }
   ```

3. **运行程序**：
   ```bash
   npm start
   ```

### Q: 前端和后端有什么区别？

A:

**前端（网页）**：
- 在浏览器中运行
- 受 CORS 限制
- 适合临时测试
- 数据保存在浏览器

**后端（Node.js）**：
- 在服务器上运行
- 没有 CORS 限制
- 适合长期使用
- 自动定时更新

## 📝 总结

| 订阅源类型 | 前端支持 | 后端支持 | 推荐方式 |
|-----------|---------|---------|---------|
| 原始节点链接 | ✅ | ✅ | 后端 |
| 订阅转换链接 | ❌ | ✅ | 后端 |
| Clash 配置 | ❌ | ✅ | 后端 |

**建议**：
- 长期使用：使用后端配置文件
- 临时测试：使用前端页面（仅限原始节点链接）
- 订阅转换：必须使用后端配置文件

---

如有问题，请查看其他文档：
- `README.md` - 项目概述
- `QUICK_START.md` - 快速开始
- `CLOUDFLARE_DEPLOY.md` - Cloudflare 部署
- `CLASH_USAGE.md` - Clash 使用说明