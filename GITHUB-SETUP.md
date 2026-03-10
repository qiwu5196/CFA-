# GitHub 仓库发布下一步

当前已完成：
- 本地 Git 仓库已初始化
- 已添加 `.gitignore`
- 已做首次提交
- 项目已适合静态托管 / GitHub Pages

当前缺口：
- 这台 Mac 没有安装 `gh`（GitHub CLI）
- 因此还不能直接从本机自动创建远程 GitHub 仓库

## 你接下来需要提供/完成的最小事项

请确认这两件事：

1. 你想要的 GitHub 仓库名
   - 建议：`cfa-flashcards`
   - 也可以写你自己的名字：

2. 仓库可见性
   - `public`（别人可看到，适合直接网页访问）
   - `private`（更隐私，但 GitHub Pages 和多设备直接访问方案会受限）

## 推荐方案

如果你的目标是：
- 手机和电脑都能直接通过链接打开

那么最直接的方案通常是：
- 建 **public 仓库**
- 开启 **GitHub Pages**
- 用 Pages 链接访问

## 之后小白会做什么

等你确认完仓库名和可见性后，小白可以继续：

1. 帮你创建远程仓库（前提：本机具备 GitHub 登录能力）
2. 设置 `origin`
3. 推送代码
4. 指导或代你完成 GitHub Pages 打开
5. 给你最终访问链接

## 本地更新方式（以后）

如果你本地更新了代码或单词数据：

```bash
cd "/Users/MSI1/Desktop/CFA/单词卡"
git add .
git commit -m "update flashcards"
git push
```

如果更新来自 Excel，先重新生成：

```bash
/opt/anaconda3/envs/xbx311/bin/python "/Users/MSI1/Desktop/CFA/单词卡/built_from_excel.py" "/Users/MSI1/Desktop/CFA/单词卡.xlsx" "/Users/MSI1/Desktop/CFA/单词卡"
```

再执行 git 提交和 push。
