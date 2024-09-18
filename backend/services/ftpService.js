const ftp = require('basic-ftp');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const { decrypt } = require('../utils/cryptUtils');
require('dotenv').config();

class FtpService {
    constructor() {
        this.client = new ftp.Client();
        this.client.ftp.verbose = false;
        this.connectionPool = [];
        this.maxConnections = 5;
    }

    async getConnection() {
        if (this.connectionPool.length > 0) {
            return this.connectionPool.pop();
        }
        const client = new ftp.Client();
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: decrypt(process.env.FTP_PASS),
                secure: false
            });
            return client;
        } catch (error) {
            logger.error('Failed to establish FTP connection', { error: error.message });
            throw new Error('Failed to establish FTP connection');
        }
    }

    async releaseConnection(client) {
        if (this.connectionPool.length < this.maxConnections) {
            this.connectionPool.push(client);
        } else {
            client.close();
        }
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

    async uploadFile(file) {
        const client = await this.getConnection();
        try {
            await client.cd(process.env.REMOTE_DIRECTORY);
            const tempFilePath = path.join(__dirname, `temp_${file.originalname}`);
            await fs.writeFile(tempFilePath, file.buffer);
            await this.withRetry(() => client.uploadFrom(tempFilePath, file.originalname));
            await fs.unlink(tempFilePath);
            logger.info(`File uploaded successfully: ${file.originalname}`);
        } catch (error) {
            logger.error(`Error uploading file ${file.originalname}:`, { error: error.message });
            throw new Error(`Failed to upload file ${file.originalname}`);
        } finally {
            await this.releaseConnection(client);
        }
    }

    async uploadLargeFile(file, chunkSize = 1024 * 1024) {
        const client = await this.getConnection();
        try {
            await client.cd(process.env.REMOTE_DIRECTORY);
            const tempFilePath = path.join(__dirname, `temp_${file.originalname}`);
            await fs.writeFile(tempFilePath, file.buffer);

            const fileSize = (await fs.stat(tempFilePath)).size;
            const fileStream = fs.createReadStream(tempFilePath);

            let uploadedBytes = 0;
            while (uploadedBytes < fileSize) {
                const chunk = fileStream.read(chunkSize);
                if (chunk === null) break;
                await this.withRetry(() => client.uploadFrom(chunk, `${file.originalname}.part${uploadedBytes}`));
                uploadedBytes += chunk.length;
                logger.info(`Uploaded ${uploadedBytes}/${fileSize} bytes of ${file.originalname}`);
            }

            await client.rename(`${file.originalname}.part0`, file.originalname);
            await fs.unlink(tempFilePath);
            logger.info(`Large file uploaded successfully: ${file.originalname}`);
        } catch (error) {
            logger.error(`Error uploading large file ${file.originalname}:`, { error: error.message });
            throw new Error(`Failed to upload large file ${file.originalname}`);
        } finally {
            await this.releaseConnection(client);
        }
    }

    async listPDFs() {
        const client = await this.getConnection();
        try {
            await client.cd(process.env.REMOTE_DIRECTORY);
            const list = await this.withRetry(() => client.list());
            const pdfFiles = list.filter(item => item.name.toLowerCase().endsWith('.pdf')).map(item => item.name);
            logger.info('PDF files found:', { count: pdfFiles.length });
            return pdfFiles;
        } catch (error) {
            logger.error('Error listing PDFs:', { error: error.message });
            throw new Error('Failed to list PDF files');
        } finally {
            await this.releaseConnection(client);
        }
    }

    async deletePDFs() {
        const client = await this.getConnection();
        try {
            await client.cd(process.env.REMOTE_DIRECTORY);
            const list = await this.withRetry(() => client.list());
            const pdfFiles = list.filter(item => item.name.toLowerCase().endsWith('.pdf'));
            for (const file of pdfFiles) {
                await this.withRetry(() => client.remove(file.name));
            }
            logger.info(`PDF files deleted`, { count: pdfFiles.length });
            return pdfFiles.length;
        } catch (error) {
            logger.error('Error deleting PDFs:', { error: error.message });
            throw new Error('Failed to delete PDF files');
        } finally {
            await this.releaseConnection(client);
        }
    }
}

module.exports = new FtpService();