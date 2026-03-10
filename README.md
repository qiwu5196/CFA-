# CFA 单词卡

一个可在电脑和手机浏览器中直接打开的静态单词卡项目。

## 当前功能

- 单词列表浏览
- 搜索（英文 / 中文 / 注释）
- 随机抽卡
- 翻面查看注释
- 收藏（保存在浏览器 localStorage）
- 适配桌面与手机浏览器

## 文件结构

- `index.html` — 页面入口
- `styles.css` — 样式
- `app.js` — 交互逻辑
- `cards_data.js` — 单词卡数据
- `built_from_excel.py` — 从 Excel 生成 `cards_data.js`

## 本地更新流程

如果你更新了 Excel，可重新生成数据：

```bash
/opt/anaconda3/envs/xbx311/bin/python "/Users/MSI1/Desktop/CFA/单词卡/built_from_excel.py" "/Users/MSI1/Desktop/CFA/单词卡.xlsx" "/Users/MSI1/Desktop/CFA/单词卡"
```

## GitHub / 多设备使用目标

后续建议：

1. 将本项目推到 GitHub 仓库
2. 打开 GitHub Pages
3. 通过网页链接在不同设备直接打开
4. 本地有更新时，重新生成 `cards_data.js`，再提交并推送到 GitHub

## 注意

- 收藏状态保存在各设备自己的浏览器里，不会自动云同步
- 如果以后需要跨设备同步收藏，需要单独加后端或账号系统
