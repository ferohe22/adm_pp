const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { validatePdfUpload, validateJsonUpload, validateTxtUpload } = require('../middleware/validation');
const errorHandler = require('../middleware/errorHandler');

// GET routes
router.get('/search-delete-pdfs', fileController.searchAndDeletePDFs);
router.get('/generate-pdf-links', fileController.generatePdfLinks);
router.get('/convert-pdfs-to-text', fileController.convertPdfsToText);

// POST routes
router.post('/upload-pdf', upload.array('pdfs', 10), validatePdfUpload, fileController.uploadPDF);
router.post('/json-to-excel', upload.single('file'), validateJsonUpload, fileController.convertJsonToExcel);
router.post('/process-txt', upload.array('txtFiles'), validateTxtUpload, fileController.processTxtFilesToExcel);

router.use(errorHandler);

module.exports = router;
