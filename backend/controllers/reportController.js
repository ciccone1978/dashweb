const reportService = require("../services/reportService");

exports.getSlicers = async (req, res) => {
  try {
    const slicers = await reportService.getSlicerData();
    res.json(slicers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReportData = async (req, res) => {
  try {
    const { startDate, endDate, product } = req.body;
    const reportData = await reportService.getReportData(startDate, endDate, product);
    res.json({ success: true, data : reportData });
  } catch (error) {
      console.error("Error fetching report data:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
