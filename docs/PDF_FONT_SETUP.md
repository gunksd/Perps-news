# PDF中文字体支持 - 安装说明

## 概述

项目已集成中文字体支持，可以在PDF导出中显示中文字符。系统会自动加载字体，如果字体加载失败，会优雅降级到英文显示。

## 快速开始

### 方法1：自动下载（推荐）

运行以下命令自动下载并安装中文字体：

```bash
npm run prepare:pdf-font
```

该命令会：
- 下载 Noto Sans CJK SC Regular 字体（约4MB）
- 保存到 `public/fonts/NotoSansSC-Regular.ttf`
- 自动验证文件完整性

**注意**: 首次下载可能需要1-2分钟，取决于网络速度。

### 方法2：手动下载

如果自动下载失败，请手动下载字体文件：

#### 步骤：

1. **下载字体文件**

   访问以下任意一个链接下载 Noto Sans SC Regular 字体：

   - [Google Fonts - Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC)
   - [GitHub - Noto CJK](https://github.com/notofonts/noto-cjk/tree/main/Sans/OTF/SimplifiedChinese)

   选择 **Regular (常规)** 字重。

2. **重命名文件**

   将下载的字体文件重命名为：
   ```
   NotoSansSC-Regular.ttf
   ```
   (或 `.otf` 格式也可以)

3. **放置文件**

   将文件移动到项目的以下位置：
   ```
   /public/fonts/NotoSansSC-Regular.ttf
   ```

4. **验证安装**

   检查文件是否存在：
   ```bash
   ls -lh public/fonts/NotoSansSC-Regular.ttf
   ```

   文件大小应该在 3-5 MB 左右。

## 使用方法

### PDF导出

1. 确保字体文件已安装（见上方安装步骤）
2. 在应用中点击"导出" → "PDF (.pdf)"
3. 系统会自动加载中文字体并生成PDF

**首次导出**: 需要加载字体文件（约3-4秒），后续导出会使用缓存，速度更快。

### 字体加载状态

系统会在控制台显示字体加载状态：

- ✅ `中文字体加载成功` - 字体可用，PDF will包含中文
- ⚠️ `中文字体加载失败` - 降级到英文显示

## 技术细节

### 字体加载机制

```typescript
import { registerChineseFont } from '@/lib/fonts/chineseFont'

// 自动加载并注册字体
await registerChineseFont(doc)
doc.setFont('NotoSansSC')
```

### 特性

- **动态加载**: 字体文件从 public 目录动态加载，不增加主包体积
- **缓存机制**: 字体数据加载后会缓存，避免重复加载
- **优雅降级**: 字体加载失败时自动使用英文内容
- **完整支持**: 支持简体中文、标点符号和常用字符

### 文件结构

```
project/
├── public/
│   └── fonts/
│       └── NotoSansSC-Regular.ttf  # 中文字体文件（需要下载）
├── lib/
│   ├── fonts/
│   │   └── chineseFont.ts          # 字体加载器
│   └── services/
│       └── pdfExportService.ts     # PDF生成服务
└── scripts/
    └── downloadPdfFont.js          # 自动下载脚本
```

## 常见问题

### Q: 为什么需要单独下载字体文件？

A: 中文字体文件通常较大（3-5MB），直接打包会显著增加应用体积和加载时间。动态加载可以在需要时才下载，保持应用轻量级。

### Q: 字体下载失败怎么办？

A: 请使用手动下载方法（见上方"方法2"）。如果GitHub访问困难，可以从Google Fonts下载。

### Q: 可以使用其他中文字体吗？

A: 可以！只需：
1. 下载TTF/OTF格式的中文字体
2. 将文件命名为 `NotoSansSC-Regular.ttf`
3. 放置到 `public/fonts/` 目录

推荐使用开源字体，如：
- Noto Sans SC（思源黑体简体）
- 阿里巴巴普惠体
- Source Han Sans（思源黑体）

### Q: 字体文件多大？

A: Noto Sans SC Regular 约 3-4 MB。这是一个轻量级的中文字体，包含常用汉字和符号。

### Q: 影响性能吗？

A: 首次导出PDF时需要加载字体（约3-4秒），后续导出会使用内存缓存，几乎没有延迟。字体文件不会影响应用的初始加载速度。

### Q: 如何验证字体是否正常工作？

A:
1. 打开浏览器开发者工具（F12）→ Console
2. 导出PDF
3. 查看控制台消息：
   - ✅ 成功: `✅ 中文字体已启用`
   - ❌ 失败: `⚠️ 中文字体加载失败`

## 故障排除

### 问题：PDF中仍然显示乱码

**解决方案**:
1. 确认字体文件存在：`ls public/fonts/NotoSansSC-Regular.ttf`
2. 检查文件大小：应该在 3-5 MB
3. 清除浏览器缓存并重新加载页面
4. 检查浏览器控制台是否有错误消息

### 问题：字体下载非常慢

**解决方案**:
1. 使用手动下载方法
2. 从 Google Fonts 下载（通常更快）
3. 使用其他镜像源

### 问题：部署后字体无法加载

**解决方案**:
1. 确保 `public/fonts/` 目录被包含在部署中
2. 检查服务器的静态文件配置
3. 验证字体文件的访问权限

## 部署注意事项

### Vercel / Netlify

字体文件会自动部署，无需额外配置。

### Docker

确保 Dockerfile 包含 public 目录：

```dockerfile
COPY public ./public
```

### 自定义服务器

确保静态文件服务正确配置：

```javascript
// Express.js 示例
app.use('/fonts', express.static('public/fonts'))
```

## 许可证

Noto Sans SC 使用 [SIL Open Font License 1.1](https://scripts.sil.org/OFL)，可以免费用于商业和非商业项目。

## 支持

如有问题，请检查：
1. 字体文件是否正确安装
2. 浏览器控制台的错误消息
3. 网络连接是否正常

---

**最后更新**: 2026-01-12
**版本**: 1.0.0
