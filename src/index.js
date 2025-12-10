const express = require('express');
const msys2Routes = require('./routes/msys2');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件 - 简化，只记录请求
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// 路由
app.use('/', msys2Routes);

// 404 处理 - 重定向到默认下载
app.use((req, res) => {
  console.log(`404: ${req.url} - 重定向到默认下载`);
  res.redirect(302, '/');
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).send('服务器内部错误');
});

// 启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 MSYS2 下载重定向服务已启动`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`📥 默认重定向: http://localhost:${PORT}/ (最新 x86_64 版本)`);
    console.log(`📥 ARM64 重定向: http://localhost:${PORT}/?arch=arm64`);
    console.log(`📥 直接链接: http://localhost:${PORT}/direct`);
  });
}

module.exports = app;