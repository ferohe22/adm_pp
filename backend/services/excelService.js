const ExcelJS = require('exceljs');
const logger = require('../utils/logger');

class ExcelService {
  async convertJsonToExcel(jsonData) {
    try {
      if (!jsonData || typeof jsonData !== 'object' || Object.keys(jsonData).length === 0) {
        throw new Error('Invalid JSON data');
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');

      const records = Object.entries(jsonData).map(([key, value]) => ({
        SUSTENTO: key,
        ...value
      }));

      const headers = Object.keys(records[0]);
      worksheet.addRow(headers);

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };

      // Add data
      records.forEach(record => {
        worksheet.addRow(Object.values(record));
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(15, ...column.values.map(v => String(v).length));
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      logger.error('Error converting JSON to Excel:', error);
      throw new Error('Failed to convert JSON to Excel');
    }
  }

  async convertLargeJsonToExcel(jsonData, chunkSize = 1000) {
    try {
      if (!jsonData || typeof jsonData !== 'object' || Object.keys(jsonData).length === 0) {
        throw new Error('Invalid JSON data');
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');

      const records = Object.entries(jsonData).map(([key, value]) => ({
        SUSTENTO: key,
        ...value
      }));

      const headers = Object.keys(records[0]);
      worksheet.addRow(headers);

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };

      // Add data in chunks
      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        chunk.forEach(record => {
          worksheet.addRow(Object.values(record));
        });
        await new Promise(resolve => setImmediate(resolve)); // Allow event loop to process other events
      }

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(15, ...column.values.map(v => String(v).length));
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      logger.error('Error converting large JSON to Excel:', error);
      throw new Error('Failed to convert large JSON to Excel');
    }
  }
}

module.exports = new ExcelService();