const ftpService = require('../services/ftpService');
const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const XLSX = require('xlsx');
const logger = require('../utils/logger');

let fetch;

(async () => {
    const module = await import('node-fetch');
    fetch = module.default;
})();

exports.searchAndDeletePDFs = async (req, res) => {
    try {
        const pdfs = await ftpService.listPDFs();
        let message;
        let deletedCount = 0;
        
        if (pdfs.length > 0) {
            deletedCount = await ftpService.deletePDFs();
            message = `${deletedCount} archivo(s) encontrado(s) y eliminado(s).`;
        } else {
            message = 'No se encontraron archivos PDF.';
        }
        
        res.json({ message, foundFiles: pdfs.length > 0 });
    } catch (error) {
        logger.error('Error in searchAndDeletePDFs:', error);
        res.status(500).json({ error: 'Error al buscar y eliminar archivos PDF' });
    }
};

exports.uploadPDF = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se han subido archivos' });
        }
        
        for (const file of req.files) {
            await ftpService.uploadFile(file);
        }
        
        const message = `${req.files.length} archivo(s) PDF subido(s) exitosamente`;
        res.json({ message, success: true });
    } catch (error) {
        logger.error('Error al subir PDFs:', error);
        res.status(500).json({ error: 'Error al subir los archivos PDF', success: false });
    }
};

exports.generatePdfLinks = async (req, res) => {
    try {
        const pdfFiles = await ftpService.listPDFs();

        if (pdfFiles.length === 0) {
            return res.json({ links: [], message: 'No se encontraron archivos PDF para generar enlaces' });
        }

        const baseUrl = 'https://chatbot.fernandorodriguezh.com/wp-content/uploads/2024/08/';
        const links = pdfFiles.map(file => `${baseUrl}${file}`);

        res.json({ links, message: `${links.length} enlaces generados exitosamente` });
    } catch (error) {
        logger.error('Error al generar enlaces:', error);
        res.status(500).json({ error: 'Error al generar enlaces de PDF' });
    }
};

exports.convertPdfsToText = async (req, res) => {
    try {
        if (!fetch) {
            throw new Error('fetch module is not initialized');
        }
        
        const pdfFiles = await ftpService.listPDFs();
        const baseUrl = 'https://chatbot.fernandorodriguezh.com/wp-content/uploads/2024/08/';
        const links = pdfFiles.map(file => `${baseUrl}${file}`);

        const convertedTexts = [];
        const documentAnalysis = {};
        const headers = [
            "Orden de servicio",
            "Conformidad de servicio",
            "Memorándum de desistimiento de orden de servicio",
            "RECIBO POR HONORARIOS ELECTRONICO",
            "Suspensiones de 4ta Categoría",
            "Evaluación de Ficha de Proyecto",
            "ACTA DEL COMITÉ TÉCNICO DE EVALUACIÓN",
            "FICHA DE EVALUACIÓN TÉCNICA DEL PROYECTO",
            "DECLARACIÓN JURADA",
            "DECLARACIÓN JURADA DE ACUERDO DE CONFIDENCIALIDAD",
            "CARTA DE AUTORIZACIÓN",
            "REGISTRO NACIONAL DE PROVEEDORES", 
            "Ficha RUC",
            "DNI:",
            "CERTIFICACIÓN DE CREDITO PRESUPUESTARIO",
            "DATOS DEL FORMATO"
        ];

        for (const link of links) {
            const jinaUrl = `http://r.jina.ai/${link}`;
            const response = await fetch(jinaUrl);
            const text = await response.text();
            const fileName = path.basename(link, '.pdf');
            convertedTexts.push({ 
                originalName: fileName, 
                text 
            });

            documentAnalysis[fileName] = headers.map(header => ({
                Documento: header,
                Encontrado: text.toLowerCase().includes(header.toLowerCase()) ? 'SI' : 'NO'
            }));
        }

        const workbook = XLSX.utils.book_new();
        for (const [fileName, analysis] of Object.entries(documentAnalysis)) {
            const worksheet = XLSX.utils.json_to_sheet(analysis);
            XLSX.utils.book_append_sheet(workbook, worksheet, fileName.substring(0, 31));
        }
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        const zip = new AdmZip();
        convertedTexts.forEach(({ originalName, text }) => {
            const txtFileName = `${originalName}.txt`;
            zip.addFile(txtFileName, Buffer.from(text));
        });
        zip.addFile('CHECKLIST.xlsx', excelBuffer);

        const zipBuffer = zip.toBuffer();
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=converted_texts_and_checklist.zip');
        res.send(zipBuffer);

    } catch (error) {
        logger.error('Error al convertir PDFs a texto y crear CHECKLIST:', error);
        res.status(500).json({ error: 'Error al convertir PDFs a texto y crear CHECKLIST' });
    }
};

exports.processTxtFilesToExcel = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se han subido archivos' });
        }

        const processedData = {};

        for (const file of req.files) {
            const content = file.buffer.toString('utf8');
            const fileName = file.originalname;
            const extractedData = extractDataFromTxt(content, fileName);
            
            if (extractedData.name) {
                processedData[extractedData.name] = extractedData;
            } else {
                processedData[fileName] = extractedData;
            }
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(Object.values(processedData));
        XLSX.utils.book_append_sheet(workbook, worksheet, "Datos Procesados");

        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=datos_procesados.xlsx');
        res.send(excelBuffer);

    } catch (error) {
        logger.error('Error al procesar archivos TXT:', error);
        res.status(500).json({ error: 'Error al procesar los archivos TXT' });
    }
};

exports.convertJsonToExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo JSON' });
        }

        const jsonContent = JSON.parse(req.file.buffer.toString());
        
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(Object.values(jsonContent));
        XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=datos_convertidos.xlsx');
        res.send(excelBuffer);

    } catch (error) {
        logger.error('Error al convertir JSON a Excel:', error);
        res.status(500).json({ error: 'Error al convertir JSON a Excel' });
    }
};

function extractDataFromTxt(content, fileName) {
    const data = {};

    const nameMatch = fileName.match(/Evaluador OS \d+ SIAF \d+ (.+)\.txt/);
    if (nameMatch) {
        data.name = nameMatch[1].trim();
    }

    const extractors = [
        { regex: /(\d+)\s*ORDEN DE SERVICIO Nº/, key: 'Orden de Servicio', transform: parseInt },
        { regex: /(\d+)\s*Nº Exp. SIAF :/, key: 'Nº Exp. SIAF', transform: parseInt },
        { regex: /Actividades y productos a realizar\s*:\s*([\s\S]*?)(?:\n\n|\z)/, key: 'Actividades y productos a realizar', transform: s => s.trim() },
        { regex: /Numero de formato\s*:\s*(\S+)/, key: 'Numero de formato' },
        { regex: /CÓDIGO DE CUENTA INTERBANCARIO \(CCI\).*?:\s*(\d+)/, key: 'CÓDIGO DE CUENTA INTERBANCARIO (CCI)' },
        { regex: /número de Cuenta es el Siguiente:\s*(\d+)/, key: 'Número de cuenta' },
        { regex: /R\.U\.C\.\s*(\d+)/, key: 'R.U.C.' },
        { regex: /RECIBO POR HONORARIOS ELECTRÓNICO\s*(\S+)/, key: 'Nro del RECIBO POR HONORARIOS ELECTRONICOS' },
        { regex: /Total por Honorarios\s*(\d+\.\d+)/, key: 'Total por Honorarios', transform: parseFloat },
        { regex: /Total Neto Recibido:\s*(\d+\.\d+)/, key: 'Total Neto Recibido', transform: parseFloat },
        { regex: /Retención \(8 %\) IR:\s*(\d+\.\d+)/, key: 'Retención (8 %) IR', transform: parseFloat }
    ];

    extractors.forEach(({ regex, key, transform }) => {
        const match = content.match(regex);
        if (match) {
            data[key] = transform ? transform(match[1]) : match[1];
        }
    });

    if (content.includes('RECURSOS ORDINARIOS')) {
        data['RECURSOS ORDINARIOS'] = "191-9410098-0-93";
    }

    return data;
}

module.exports = {
    searchAndDeletePDFs: exports.searchAndDeletePDFs,
    uploadPDF: exports.uploadPDF,
    generatePdfLinks: exports.generatePdfLinks,
    convertPdfsToText: exports.convertPdfsToText,
    convertJsonToExcel: exports.convertJsonToExcel,
    processTxtFilesToExcel: exports.processTxtFilesToExcel
};