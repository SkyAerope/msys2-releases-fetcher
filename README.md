# MSYS2 下载重定向服务

一个 Node.js + Express 服务，自动抓取最新的 MSYS2 安装程序下载链接并重定向客户端。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSkyAerope%2Fmsys2-releases-fetcher)

## 功能特性

- 🏗️ **架构支持**：支持 x86_64 和 ARM64 架构
- 🛡️ **容错机制**：网络失败时使用备用链接
- ☁️ **Vercel 支持**：一键部署到 Vercel

## 快速开始

### 本地运行

#### 1. 安装依赖

```bash
pnpm install
```

#### 2. 启动服务

```bash
pnpm start
```

服务将在 http://localhost:3000 启动。

#### 3. 使用服务

在浏览器中访问：
- http://localhost:3000/ - 自动下载最新 x86_64 版本
- http://localhost:3000/arm64 - 自动下载最新 ARM64 版本
- http://localhost:3000/cn - 中国用户使用代理加速下载

## API 端点

### 重定向端点

| 端点 | 说明 | 示例 |
|------|------|------|
| `/` | 重定向到最新 x86_64 版本 | http://localhost:3000/ |
| `/x64` | x86_64 专用路由 | http://localhost:3000/x64 |
| `/arm64` | ARM64 专用路由 | http://localhost:3000/arm64 |
| `/?arch=arm64` | 通过参数指定 ARM64 | http://localhost:3000/?arch=arm64 |
| `/cn` | 中国代理加速（默认 x86_64） | http://localhost:3000/cn |
| `/cn?arch=arm64` | 中国代理 ARM64 版本 | http://localhost:3000/cn?arch=arm64 |
| `/cn/x64` | 中国代理 x86_64 专用 | http://localhost:3000/cn/x64 |
| `/cn/arm64` | 中国代理 ARM64 专用 | http://localhost:3000/cn/arm64 |

## 技术实现

1. **网页抓取**：使用 Axios + Cheerio 从 https://www.msys2.org/ 抓取下载链接
2. **容错处理**：网络失败时自动使用硬编码的备用链接
3. **重定向**：使用 HTTP 302 状态码进行临时重定向

## 项目结构

```
msys2-releases-fetcher/
├── src/
│   ├── index.js          # 主应用文件
│   ├── routes/
│   │   └── msys2.js      # 重定向路由
│   └── utils/
│       └── scraper.js    # 网页抓取工具
├── vercel.json           # Vercel 配置
├── package.json
└── README.md
```

## 部署指南

### Vercel 部署（推荐）

本项目已配置好 Vercel 部署支持：

1. 点击上方的 "Deploy with Vercel" 按钮
2. 连接你的 GitHub 账号
3. 点击 "Deploy"

或者clone本仓库后使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

部署后，你会得到一个类似 `https://your-app.vercel.app` 的 URL。

### PM2 部署

```bash
# 安装 PM2
pnpm add -g pm2

# 启动服务
pm2 start src/index.js --name msys2-redirect

# 设置开机自启
pm2 startup
pm2 save
```

### Docker 部署

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
```

构建和运行：

```bash
docker build -t msys2-redirect .
docker run -p 3000:3000 msys2-redirect
```

## 使用场景

### 场景 1：在文档中提供最新下载链接

在 README 或文档中，可以这样写：

```markdown
## 下载 MSYS2

点击以下链接下载最新版本：

- [x86_64 版本](http://your-server:3000/)
- [ARM64 版本](http://your-server:3000/arm64)
- [中国加速 x86_64](http://your-server:3000/cn)
- [中国加速 ARM64](http://your-server:3000/cn/arm64)
```

用户点击链接时，会自动重定向到最新的 GitHub 发布页面。

### 场景 2：在脚本中自动下载

```bash
# 使用 curl 下载最新 x86_64 版本
curl -L http://localhost:3000/ -o msys2-latest.exe

# 使用 curl 下载最新 ARM64 版本
curl -L http://localhost:3000/arm64 -o msys2-latest-arm64.exe

# 中国用户使用代理加速下载
curl -L http://localhost:3000/cn -o msys2-latest.exe

# 使用 wget 下载
wget --content-disposition http://localhost:3000/
```

## 环境变量

- `PORT` - 服务器端口（默认：3000）

## 技术栈

- **Node.js** - 运行时环境
- **Express** - Web 框架
- **Axios** - HTTP 客户端
- **Cheerio** - HTML 解析
- **Vercel** - Serverless 部署平台

## 许可证

Apache License 2.0 - 详见 LICENSE 文件

## 联系支持

如有问题，请：
1. 查看服务日志
2. 提交 [GitHub Issues](https://github.com/SkyAerope/msys2-releases-fetcher/issues)