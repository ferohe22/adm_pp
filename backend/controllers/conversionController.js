const excelService = require('../services/excelService');
const logger = require('../utils/logger');

exports.convertJsonToExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let jsonData;
    try {
      jsonData = JSON.parse(req.file.buffer.toString());
    } catch (parseError) {
      logger.error('Invalid JSON data:', parseError);
      return res.status(400).json({ error: 'Invalid JSON data' });
    }

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return res.status(400).json({ error: 'JSON data must be a non-empty array' });
    }

    const excelBuffer = await excelService.convertJsonToExcel(jsonData);

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `converted_file_${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(excelBuffer);

    logger.info(`Successfully converted JSON to Excel: ${filename}`);
  } catch (error) {
    logger.error('Error in convertJsonToExcel:', error);
    res.status(500).json({ error: 'An error occurred during conversion' });
  }
};