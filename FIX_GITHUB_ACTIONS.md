# 修复 GitHub Actions 权限问题

## 🐛 问题描述

GitHub Actions 运行时出现 403 错误：
```
remote: Permission to miku533/cf-node-aggregator.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/miku533/cf-node-aggregator/': The requested URL returned error: 403
Error: Process completed with exit code 128.
```

## ✅ 解决方案

### 方法 1：修改仓库 Workflow 权限（推荐）

1. **进入 GitHub 仓库设置**
   - 打开你的仓库：`https://github.com/miku533/cf-node-aggregator`
   - 点击 **Settings**（设置）

2. **找到 Actions 权限设置**
   - 在左侧菜单中找到 **Actions**
   - 点击 **General**

3. **修改 Workflow 权限**
   - 滚动到页面底部
   - 找到 **Workflow permissions** 部分
   - 选择 **Read and write permissions** （读写权限）
   - ✅ 勾选 **Allow GitHub Actions to create and approve pull requests**
   - 点击 **Save** 保存

4. **重新运行 Workflow**
   - 进入 **Actions** 标签
   - 选择失败的 workflow
   - 点击 **Re-run all jobs**

### 方法 2：使用 Personal Access Token（备选）

如果方法 1 不起作用，使用 PAT：

1. **创建 Personal Access Token**
   - 访问：https://github.com/settings/tokens
   - 点击 **Generate new token** → **Generate new token (classic)**
   - 设置名称：`cf-node-aggregator-actions`
   - 勾选权限：
     - ✅ `repo` (完整仓库访问)
     - ✅ `workflow` (更新 GitHub Actions workflows)
   - 点击 **Generate token**
   - **复制生成的 token**（只显示一次！）

2. **添加 Secret 到仓库**
   - 进入仓库 **Settings** → **Secrets and variables** → **Actions**
   - 点击 **New repository secret**
   - Name: `PAT_TOKEN`
   - Secret: 粘贴刚才复制的 token
   - 点击 **Add secret**

3. **修改 Workflow 文件**
   
   编辑 `.github/workflows/update-nodes.yml`，修改 checkout 步骤：
   
   ```yaml
   - name: 检出代码
     uses: actions/checkout@v4
     with:
       token: ${{ secrets.PAT_TOKEN }}  # 使用 PAT 而不是 GITHUB_TOKEN
   ```

4. **提交并推送**
   ```bash
   git add .github/workflows/update-nodes.yml
   git commit -m "fix: 使用 PAT token"
   git push
   ```

### 方法 3：不自动提交（最简单）

如果你不需要自动提交到 GitHub，可以只生成文件不推送：

修改 `.github/workflows/update-nodes.yml`：

```yaml
- name: 提交更新
  run: |
    git config --local user.email "github-actions[bot]@users.noreply.github.com"
    git config --local user.name "github-actions[bot]"
    git add output/
    git diff --quiet && git diff --staged --quiet || git commit -m "🔄 自动更新节点 $(date '+%Y-%m-%d %H:%M:%S')"
    # 不执行 git push，只生成文件
```

然后使用 **Upload Artifact** 保存文件：

```yaml
- name: 上传生成的文件
  uses: actions/upload-artifact@v3
  with:
    name: node-configs
    path: output/
```

## 🎯 推荐方案

**强烈推荐使用方法 1**，因为：
- ✅ 最简单，只需在网页上点几下
- ✅ 不需要创建 token
- ✅ 不需要修改代码
- ✅ GitHub 官方推荐的方式

## 📝 详细步骤截图说明

### 步骤 1：进入仓库设置
```
GitHub 仓库页面 → Settings（右上角）
```

### 步骤 2：找到 Actions 设置
```
左侧菜单 → Actions → General
```

### 步骤 3：修改权限
```
滚动到底部 → Workflow permissions
选择：Read and write permissions
勾选：Allow GitHub Actions to create and approve pull requests
点击：Save
```

### 步骤 4：重新运行
```
Actions 标签 → 选择失败的 workflow → Re-run all jobs
```

## ✨ 验证成功

运行成功后，你应该看到：
- ✅ 所有步骤显示绿色勾号
- ✅ `output/` 目录有新的提交
- ✅ 提交信息：`🔄 自动更新节点 2025-11-02 15:25:24`
- ✅ 没有 403 错误

## 🔍 常见问题

### Q: 为什么会出现这个问题？

A: GitHub 在 2023 年更改了默认设置，新仓库的 Actions 默认只有读权限，需要手动开启写权限。

### Q: 这样安全吗？

A: 是的，这是 GitHub 官方推荐的方式。GitHub Actions 的 GITHUB_TOKEN 只对当前仓库有效，不会影响其他仓库。

### Q: 我应该选择哪个方法？

A: 
- 个人项目：方法 1（最简单）
- 组织项目：方法 2（更安全）
- 不需要自动提交：方法 3

## 📞 需要帮助？

如果还有问题，请检查：
1. 仓库是否是你自己的（不是 Fork 的）
2. 是否有仓库的管理员权限
3. GitHub Actions 是否已启用

---

按照上面的步骤操作后，问题应该就解决了！🎉