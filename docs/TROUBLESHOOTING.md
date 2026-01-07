# 常见问题解决方案

## 环境变量问题

### 问题：脚本找不到环境变量

**错误信息**：`❌ 错误：未找到 OPENAI_API_KEY 环境变量`

**原因**：
- Node.js 脚本（tsx）默认不会自动加载 `.env.local` 文件
- 需要使用 `dotenv` 包显式加载

**解决方案**（已修复✅）：
项目脚本已自动集成环境变量加载，无需额外配置。

如果仍有问题，请确保：
1. `.env.local` 文件存在于项目根目录
2. API Key 正确填写（无多余空格）
3. 文件格式正确：
   ```bash
   OPENAI_API_KEY=sk-xxxxxx
   # 注意：等号两边不要有空格
   ```

---

## TypeScript 找不到模块

### 问题：`找不到模块"next-intl/server"或其相应的类型声明`

**解决步骤**：

1. **安装依赖**（首次运行必须）
   ```bash
   npm install
   ```

2. **重启 TypeScript 服务器**（VS Code）
   - 按 `Ctrl/Cmd + Shift + P`
   - 输入 "TypeScript: Restart TS Server"
   - 或者直接重启 VS Code

3. **清理缓存**（如果问题仍存在）
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

4. **检查 tsconfig.json**
   确保配置正确：
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "bundler",
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

---

## 其他常见问题

### 问题：环境变量不生效

**解决方案**：
1. 确保 `.env.local` 文件存在于项目根目录
2. 重启开发服务器 `npm run dev`
3. 环境变量名必须以 `NEXT_PUBLIC_` 开头才能在客户端使用

### 问题：API 请求失败

**解决方案**：
1. 运行 API 测试：`npm run test:api`
2. 检查 DeepSeek API Key 是否正确
3. 确认网络连接正常
4. 查看控制台错误信息

### 问题：数据采集失败

**解决方案**：
1. 检查数据源是否可访问
2. RSS/HTML 结构可能已变化，需要更新选择器
3. 查看 `data/` 目录权限

### 问题：端口被占用

**错误信息**：`Port 3000 is already in use`

**解决方案**：
```bash
# 方案 1: 使用其他端口
PORT=3001 npm run dev

# 方案 2: 杀死占用进程（Linux/Mac）
lsof -ti:3000 | xargs kill -9

# 方案 3: 杀死占用进程（Windows）
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F
```

---

## 开发流程

### 首次运行
```bash
# 1. 克隆项目
git clone https://github.com/gunksd/Perps-news.git
cd Perps-news

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 DeepSeek API Key

# 4. 测试 API
npm run test:api

# 5. 启动开发服务器
npm run dev
```

### 日常开发
```bash
# 启动开发服务器
npm run dev

# 执行数据采集（可选）
npm run collect

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## IDE 配置建议

### VS Code 推荐插件
- **ESLint** - 代码规范检查
- **Prettier** - 代码格式化
- **Tailwind CSS IntelliSense** - Tailwind 自动完成
- **TypeScript Vue Plugin (Volar)** - 更好的 TypeScript 支持

### VS Code 设置
创建 `.vscode/settings.json`：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 性能优化

### 开发环境慢
1. 启用 SWC 编译器（Next.js 默认）
2. 减少不必要的文件监听
3. 使用更快的包管理器（pnpm/yarn）

### 生产构建慢
1. 检查是否有大文件未被 .gitignore
2. 使用增量构建
3. 考虑使用 Turbopack（实验性）

---

## 联系支持

如果问题仍未解决：
1. 查看项目 Issues：https://github.com/gunksd/Perps-news/issues
2. 提供完整的错误信息和环境信息
3. 包含复现步骤

**环境信息收集**：
```bash
node --version
npm --version
cat package.json | grep "next"
```
