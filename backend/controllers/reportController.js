const logger = require('../utils/logger');
const reportService = require("../services/reportService");

exports.getSlicers = async (req, res) => {
  const requestId = req.headers['x-request-id'] || 'No Request ID';
  try {
      const slicers = await reportService.getSlicerData(req.params.slicer);
      res.status(200).json(slicers);
  } catch (error) {
      logger.error(`[${requestId}] Error getting slicers: ${error.message}`, error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getReportData = async (req, res) => {
  try {
    const { startDate, endDate, product } = req.body;
    const reportData = await reportService.getReportData(startDate, endDate, product);
    res.status(200).json(reportData);
  } catch (error) {
    logger.error(`[${requestId}] Error getting report data: ${error.message}`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
