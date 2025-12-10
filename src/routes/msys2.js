const express = require('express');
const router = express.Router();
const scraper = require('../utils/scraper');

// 缓存设置 - 简化版本
let downloadCache = {
  x86_64: null,
  arm64: null,
  timestamp: null,
  ttl: 10 * 60 * 1000 // 10分钟缓存
};

/**
 * 获取最新下载链接并更新缓存
 */
async function getLatestDownloadUrl(architecture = 'x86_64') {
  const now = Date.now();
  
  // 检查缓存是否有效
  if (downloadCache.timestamp && (now - downloadCache.timestamp) < downloadCache.ttl) {
    const cachedUrl = downloadCache[architecture];
    if (cachedUrl) {
      console.log(`📦 使用缓存链接 (${architecture}): ${cachedUrl}`);
      return cachedUrl;
    }
  }
  
  console.log(`🔄 从 MSYS2 网站获取最新下载链接 (${architecture})...`);
  
  try {
    const result = await scraper.getDownloadLinks();
    
    if (result.success && result.links.length > 0) {
      // 更新缓存
      downloadCache.timestamp = now;
      
      // 提取各种架构的链接
      result.links.forEach(link => {
        if (link.architecture === 'x86_64') {
          downloadCache.x86_64 = link.url;
        } else if (link.architecture === 'arm64') {
          downloadCache.arm64 = link.url;
        }
      });
      
      // 返回请求的架构链接
      const url = downloadCache[architecture] || downloadCache.x86_64;
      if (url) {
        console.log(`✅ 获取到最新链接 (${architecture}): ${url}`);
        return url;
      }
    }
    
    // 如果获取失败，使用硬编码的备用链接
    console.log('⚠️ 使用备用链接');
    return getFallbackUrl(architecture);
    
  } catch (error) {
    console.error('❌ 获取下载链接失败:', error.message);
    return getFallbackUrl(architecture);
  }
}

/**
 * 获取备用链接
 */
function getFallbackUrl(architecture) {
  const fallbackUrls = {
    x86_64: 'https://github.com/msys2/msys2-installer/releases/download/2025-08-30/msys2-x86_64-20250830.exe',
    arm64: 'https://github.com/msys2/msys2-installer/releases/download/2025-08-30/msys2-arm64-20250830.exe'
  };
  return fallbackUrls[architecture] || fallbackUrls.x86_64;
}

/**
 * 主重定向路由 - 默认重定向到最新 x86_64 版本
 */
router.get('/', async (req, res) => {
  try {
    const { arch = 'x86_64' } = req.query;
    const architecture = arch.toLowerCase() === 'arm64' ? 'arm64' : 'x86_64';
    
    console.log(`🔗 请求重定向到 ${architecture} 版本`);
    
    const downloadUrl = await getLatestDownloadUrl(architecture);
    
    // 记录重定向
    console.log(`↪️ 重定向到: ${downloadUrl}`);
    
    // 302 重定向
    res.redirect(302, downloadUrl);
    
  } catch (error) {
    console.error('❌ 重定向失败:', error.message);
    // 出错时重定向到备用链接
    res.redirect(302, getFallbackUrl('x86_64'));
  }
});

/**
 * 中国代理重定向路由 - 通过 gh-proxy.com 加速下载
 */
router.get('/cn', async (req, res) => {
  try {
    const { arch = 'x86_64' } = req.query;
    const architecture = arch.toLowerCase() === 'arm64' ? 'arm64' : 'x86_64';
    
    console.log(`🔗 请求中国代理重定向到 ${architecture} 版本`);
    
    const downloadUrl = await getLatestDownloadUrl(architecture);
    const proxiedUrl = `https://gh-proxy.com/${downloadUrl}`;
    
    // 记录重定向
    console.log(`↪️ 重定向到代理: ${proxiedUrl}`);
    
    // 302 重定向
    res.redirect(302, proxiedUrl);
    
  } catch (error) {
    console.error('❌ 中国代理重定向失败:', error.message);
    // 出错时重定向到代理备用链接
    res.redirect(302, `https://gh-proxy.com/${getFallbackUrl('x86_64')}`);
  }
});

/**
 * x86_64 架构专用路由
 */
router.get('/x64', async (req, res) => {
  try {
    console.log('🔗 请求 x86_64 版本');
    const downloadUrl = await getLatestDownloadUrl('x86_64');
    console.log(`↪️ 重定向到 x86_64: ${downloadUrl}`);
    res.redirect(302, downloadUrl);
  } catch (error) {
    console.error('❌ x86_64 重定向失败:', error.message);
    res.redirect(302, getFallbackUrl('x86_64'));
  }
});

/**
 * ARM64 架构专用路由
 */
router.get('/arm64', async (req, res) => {
  try {
    console.log('🔗 请求 ARM64 版本');
    const downloadUrl = await getLatestDownloadUrl('arm64');
    console.log(`↪️ 重定向到 ARM64: ${downloadUrl}`);
    res.redirect(302, downloadUrl);
  } catch (error) {
    console.error('❌ ARM64 重定向失败:', error.message);
    res.redirect(302, getFallbackUrl('arm64'));
  }
});

/**
 * 中国代理 x86_64 架构专用路由
 */
router.get('/cn/x64', async (req, res) => {
  try {
    console.log('🔗 请求中国代理 x86_64 版本');
    const downloadUrl = await getLatestDownloadUrl('x86_64');
    const proxiedUrl = `https://gh-proxy.com/${downloadUrl}`;
    console.log(`↪️ 重定向到代理 x86_64: ${proxiedUrl}`);
    res.redirect(302, proxiedUrl);
  } catch (error) {
    console.error('❌ 中国代理 x86_64 重定向失败:', error.message);
    res.redirect(302, `https://gh-proxy.com/${getFallbackUrl('x86_64')}`);
  }
});

/**
 * 中国代理 ARM64 架构专用路由
 */
router.get('/cn/arm64', async (req, res) => {
  try {
    console.log('🔗 请求中国代理 ARM64 版本');
    const downloadUrl = await getLatestDownloadUrl('arm64');
    const proxiedUrl = `https://gh-proxy.com/${downloadUrl}`;
    console.log(`↪️ 重定向到代理 ARM64: ${proxiedUrl}`);
    res.redirect(302, proxiedUrl);
  } catch (error) {
    console.error('❌ 中国代理 ARM64 重定向失败:', error.message);
    res.redirect(302, `https://gh-proxy.com/${getFallbackUrl('arm64')}`);
  }
});

module.exports = router;