const axios = require('axios');
const cheerio = require('cheerio');

class MSYS2Scraper {
  constructor() {
    this.baseUrl = 'https://www.msys2.org/';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * 获取 MSYS2 下载链接
   * @returns {Promise<Object>} 包含下载链接的对象
   */
  async getDownloadLinks() {
    try {
      console.log(`🌐 Fetching MSYS2 download page from: ${this.baseUrl}`);
      
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // 查找下载区域
      const downloadSection = $('.download-section');
      
      if (downloadSection.length === 0) {
        throw new Error('Download section not found on the page');
      }

      const links = [];
      
      // 提取所有下载链接
      downloadSection.find('a.button').each((index, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        
        if (href && href.includes('.exe')) {
          links.push({
            url: href,
            filename: this.extractFilename(href),
            architecture: this.detectArchitecture(text),
            text: text,
            isArm64: text.toLowerCase().includes('arm64')
          });
        }
      });

      // 提取 GitHub 发布链接模式
      const githubPatterns = this.extractGithubPatterns(links);
      
      return {
        success: true,
        timestamp: new Date().toISOString(),
        source: this.baseUrl,
        links: links,
        githubPatterns: githubPatterns,
        summary: {
          total: links.length,
          x86_64: links.filter(link => link.architecture === 'x86_64').length,
          arm64: links.filter(link => link.architecture === 'arm64').length,
          latest: links.length > 0 ? links[0] : null
        }
      };

    } catch (error) {
      console.error('❌ Error fetching MSYS2 download links:', error.message);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        suggestion: 'Please check if https://www.msys2.org/ is accessible'
      };
    }
  }

  /**
   * 从 URL 中提取文件名
   * @param {string} url - 下载 URL
   * @returns {string} 文件名
   */
  extractFilename(url) {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  /**
   * 检测架构类型
   * @param {string} text - 链接文本
   * @returns {string} 架构类型 (x86_64 或 arm64)
   */
  detectArchitecture(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('arm64') || lowerText.includes('aarch64')) {
      return 'arm64';
    } else if (lowerText.includes('x86_64') || lowerText.includes('x64') || lowerText.includes('amd64')) {
      return 'x86_64';
    } else if (lowerText.includes('i686') || lowerText.includes('x86') || lowerText.includes('32-bit')) {
      return 'x86';
    } else {
      return 'unknown';
    }
  }

  /**
   * 提取 GitHub 发布链接模式
   * @param {Array} links - 下载链接数组
   * @returns {Object} GitHub 模式信息
   */
  extractGithubPatterns(links) {
    const patterns = {
      x86_64: null,
      arm64: null
    };

    links.forEach(link => {
      if (link.url.includes('github.com/msys2/msys2-installer/releases/download/')) {
        // 提取 GitHub 发布模式
        const urlParts = link.url.split('/');
        const dateIndex = urlParts.findIndex(part => part.includes('-') && part.length === 10);
        
        if (dateIndex !== -1 && dateIndex < urlParts.length - 1) {
          const date = urlParts[dateIndex];
          const filename = urlParts[urlParts.length - 1];
          
          // 创建模式
          const pattern = `https://github.com/msys2/msys2-installer/releases/download/${date}/${filename.replace(date, '*')}`;
          
          if (link.architecture === 'x86_64') {
            patterns.x86_64 = pattern;
          } else if (link.architecture === 'arm64') {
            patterns.arm64 = pattern;
          }
        }
      }
    });

    return patterns;
  }

  /**
   * 获取健康状态
   * @returns {Promise<Object>} 健康状态信息
   */
  async getHealth() {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 5000
      });
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: response.headers['request-duration'] || 'unknown',
        statusCode: response.status
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

module.exports = new MSYS2Scraper();