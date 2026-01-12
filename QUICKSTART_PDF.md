# 快速开始：PDF中文导出

## ⚡ 30秒快速设置

PDF导出中文乱码问题已解决！只需一个命令即可启用中文支持。

### 步骤

1. **下载中文字体**（只需执行一次）

```bash
npm run prepare:pdf-font
```

2. **完成！**

现在就可以导出包含中文的PDF了！

## 🎯 验证安装

### 检查字体文件

```bash
ls -lh public/fonts/NotoSansSC-Regular.ttf
```

应该看到：
```
-rw-r--r-- 1 user user 16M Jan 12 19:23 public/fonts/NotoSansSC-Regular.ttf
```

### 测试导出

1. 启动应用：`npm run dev`
2. 打开浏览器
3. 点击"导出" → "PDF (.pdf)"
4. 打开控制台（F12），查看：
   - ✅ `正在加载中文字体...`
   - ✅ `中文字体加载成功 (16.00 MB)`
   - ✅ `中文字体已启用`

5. 打开生成的PDF，检查中文是否正常显示

## 📖 使用说明

### 首次导出
- 时间：约3-4秒（需要加载字体）
- 提示：控制台显示加载进度

### 后续导出
- 时间：<1秒（使用缓存）
- 提示：即时生成

### 中文内容
所有中文内容都会正确显示：
- ✅ 标题："金融新闻分析报告"
- ✅ 字段标签：来源、时间、市场方向、置信度等
- ✅ 新闻内容：完整的中文摘要和分析
- ✅ 免责声明：中文法律声明

## 🔧 故障排除

### 问题：命令执行失败

```bash
# 方法1：重新下载
rm public/fonts/NotoSansSC-Regular.ttf
npm run prepare:pdf-font

# 方法2：手动下载
# 访问 https://fonts.google.com/noto/specimen/Noto+Sans+SC
# 下载并保存为 public/fonts/NotoSansSC-Regular.ttf
```

### 问题：PDF仍然乱码

1. 检查文件存在：`ls public/fonts/NotoSansSC-Regular.ttf`
2. 检查文件大小：应该约16MB
3. 清除浏览器缓存：Ctrl+Shift+Delete
4. 重新加载页面：Ctrl+R

### 问题：下载很慢

这是正常的！字体文件16MB，下载需要1-2分钟。请耐心等待。

## 📚 详细文档

- **完整说明**: `docs/PDF_CHINESE_SUPPORT.md`
- **安装指南**: `docs/PDF_FONT_SETUP.md`
- **问题分析**: `docs/PDF_EXPORT_FIX.md`

## ✨ 就这么简单！

一个命令，完美解决PDF中文乱码问题。

```bash
npm run prepare:pdf-font
```

然后享受完美的中文PDF导出！

---

**有问题？** 查看详细文档或检查控制台输出。
