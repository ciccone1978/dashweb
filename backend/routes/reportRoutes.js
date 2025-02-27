const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const path = require('path');

router.get("/sales", (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/views/reports/salesReport.html'));
});

router.get("/sales/slicers", reportController.getSlicers);
router.post("/sales/data", reportController.getReportData);

module.exports = router;
