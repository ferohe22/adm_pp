const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const RateLimit = require('axios-rate-limit');
const { decrypt } = require('../../server');
require('dotenv').config();

class PdfService {
  constructor() {
    this.axiosInstance = RateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1000 });
    this.jinaApiKey = decrypt(process.env.JINA_API_KEY);
  }

  async withRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        logger.warn(`Operation failed, retrying (${attempt}/${maxRetries}):`, { error: error.message });
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async convertPdfToText(pdfUrl) {
    try {
      const jinaUrl = `${process.env.URL_PREFIX}${pdfUrl}`;
      const response = await this.withRetry(() => this.axiosInstance.get(jinaUrl, {
        headers: {
          'Authorization': `Bearer ${this.jinaApiKey}`
        }
      }));

      if (response.status !== 200) {
        throw new Error(`Failed to convert PDF: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Error converting PDF to text:', { error: error.message });
      throw new Error(`Failed to convert PDF: ${error.message}`);
    }
  }

  async convertMultiplePdfs(pdfUrls) {
    const results = [];
    for (const url of pdfUrls) {
      try {
        const text = await this.convertPdfToText(url);
        results.push({ url, text });
      } catch (error) {
        logger.error(`Error converting ${url}:`, { error: error.message });
        results.push({ url, error: error.message });
      }
    }
    return results;
  }

  async convertLargePdf(pdfUrl, chunkSize = 5) {
    try {
      const jinaUrl = `${process.env.URL_PREFIX}${pdfUrl}`;
      const response = await this.withRetry(() => this.axiosInstance.get(jinaUrl, {
        headers: {
          'Authorization': `Bearer ${this.jinaApiKey}`,
          'Range': `pages=1-${chunkSize}`
        }
      }));

      if (response.status !== 200 && response.status !== 206) {
        throw new Error(`Failed to convert PDF: ${response.statusText}`);
      }

      let fullText = response.data;
      let nextChunk = chunkSize + 1;

      while (response.status === 206) {
        const nextResponse = await this.withRetry(() => this.axiosInstance.get(jinaUrl, {
          headers: {
            'Authorization': `Bearer ${this.jinaApiKey}`,
            'Range': `pages=${nextChunk}-${nextChunk + chunkSize - 1}`
          }
        }));

        if (nextResponse.status !== 206 && nextResponse.status !== 200) {
          throw new Error(`Failed to convert PDF chunk: ${nextResponse.statusText}`);
        }

        fullText += nextResponse.data;
        nextChunk += chunkSize;

        if (nextResponse.status === 200) break;
      }

      return fullText;
    } catch (error) {
      logger.error('Error converting large PDF to text:', { error: error.message });
      throw new Error(`Failed to convert large PDF: ${error.message}`);
    }
  }
}

module.exports = new PdfService();