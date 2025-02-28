import { api } from '../utils/api.js';
import { loadSlicer } from "../utils/helpers.js";

$(document).ready(function () {
    let reportTable;
    let salesChart = echarts.init(document.getElementById("salesChart"));
            
    // Fetch and render report data
    function fetchReportData() {
        let startDate = $("#startDate").val();
        let endDate = $("#endDate").val();
        let product = $("#productFilter").val();

        api.post("/api/reports/sales/data", { startDate, endDate, product })
            .then(response => {
                let data = response.data;
                updateChart(data);
                updateTable(data);
            })
            .catch(error => console.error("Error fetching report data:", error));
    }

    // Update ECharts visualization
    function updateChart(data) {
        let dates = data.map(d => d.date);
        let values = data.map(d => d.total_price);

        let option = {
            title: { text: "Sales Trend" },
            xAxis: { type: "category", data: dates },
            yAxis: { type: "value" },
            series: [{ type: "line", data: values }]
        };

        salesChart.setOption(option);
    }

    // Update jQuery DataTable
    function updateTable(data) {
        if ($.fn.DataTable.isDataTable('#salesTable')) {
            reportTable.clear().rows.add(data).draw(); // Refresh existing DataTable
        } else {
            reportTable = $('#salesTable').DataTable({
                data: data,
                columns: [
                    { data: 'date' },
                    { data: 'product_name' },
                    { data: 'quantity' },
                    { data: 'total_price' }
                ],
                searching: false,
                autoWidth: false
            });
        }

    }

    // Event listener for filter changes
    $("#applyFilters").click(fetchReportData);

    // Initialize
    loadSlicer("products", "productFilter");
    //fetchReportData();
    //$("#salesTable").DataTable();
});
