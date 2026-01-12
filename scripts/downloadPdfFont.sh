#!/bin/bash

# PDF中文字体下载脚本
# 使用更可靠的方式下载Noto Sans SC字体

set -e

echo "🚀 开始下载PDF中文字体..."
echo ""

# 字体URL - 使用jsDelivr CDN (更稳定)
FONT_URL="https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf"

# 备用URL
BACKUP_URL="https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf"

# 输出目录和文件
OUTPUT_DIR="public/fonts"
OUTPUT_FILE="$OUTPUT_DIR/NotoSansSC-Regular.ttf"

# 创建目录
mkdir -p "$OUTPUT_DIR"

# 检查文件是否已存在
if [ -f "$OUTPUT_FILE" ]; then
    SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ 字体文件已存在: $OUTPUT_FILE ($SIZE)"
    echo ""
    echo "如需重新下载，请先删除该文件："
    echo "  rm $OUTPUT_FILE"
    exit 0
fi

echo "📥 下载地址: $FONT_URL"
echo "💾 保存位置: $OUTPUT_FILE"
echo ""
echo "正在下载... (约3-4MB，可能需要1-2分钟)"
echo ""

# 尝试使用 curl 下载
if command -v curl &> /dev/null; then
    echo "使用 curl 下载..."
    if curl -L --progress-bar -o "$OUTPUT_FILE" "$FONT_URL"; then
        echo ""
        echo "✅ 下载完成！"
    else
        echo ""
        echo "⚠️  主URL下载失败，尝试备用URL..."
        if curl -L --progress-bar -o "$OUTPUT_FILE" "$BACKUP_URL"; then
            echo ""
            echo "✅ 使用备用URL下载完成！"
        else
            echo ""
            echo "❌ 下载失败"
            rm -f "$OUTPUT_FILE"
            exit 1
        fi
    fi
# 尝试使用 wget 下载
elif command -v wget &> /dev/null; then
    echo "使用 wget 下载..."
    if wget --show-progress -O "$OUTPUT_FILE" "$FONT_URL"; then
        echo ""
        echo "✅ 下载完成！"
    else
        echo ""
        echo "⚠️  主URL下载失败，尝试备用URL..."
        if wget --show-progress -O "$OUTPUT_FILE" "$BACKUP_URL"; then
            echo ""
            echo "✅ 使用备用URL下载完成！"
        else
            echo ""
            echo "❌ 下载失败"
            rm -f "$OUTPUT_FILE"
            exit 1
        fi
    fi
else
    echo "❌ 错误: 未找到 curl 或 wget 命令"
    echo ""
    echo "请手动下载字体文件："
    echo "1. 访问: https://fonts.google.com/noto/specimen/Noto+Sans+SC"
    echo "2. 下载 Noto Sans SC Regular"
    echo "3. 保存为: $OUTPUT_FILE"
    exit 1
fi

# 验证文件
if [ -f "$OUTPUT_FILE" ]; then
    SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    echo "📊 文件大小: $SIZE"
    echo "📁 文件位置: $OUTPUT_FILE"
    echo ""
    echo "🎉 PDF中文字体已准备就绪！"
    echo ""
    echo "现在可以在PDF导出中使用中文字符了。"
else
    echo ""
    echo "❌ 文件验证失败"
    exit 1
fi
