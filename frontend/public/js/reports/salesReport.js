import { api } from '../utils/api.js';

$(document).ready(function () {
    let reportTable;
    let salesChart = echarts.init(document.getElementById("salesChart"));

    // Load slicers
    function loadSlicers() {
        api.get('/api/reports/sales/slicers')
            .then(response => {
                $("#productFilter").append(
                    response.data.products.map(p => `<option value="${p.product_name}">${p.product_name}</option>`)
                );    
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });

            let startDateInput = document.getElementById("startDate");
            let endDateInput = document.getElementById("endDate");
            
            let today = new Date();
            let sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 30);
            let formatDate = (date) => date.toISOString().split("T")[0];
            startDateInput.value = formatDate(sevenDaysAgo);
            endDateInput.value = formatDate(today);
        /* $.get("/api/reports/sales/slicers", function (data) {
            $("#productFilter").append(
                data.products.map(p => `<option value="${p.product_name}">${p.product_name}</option>`)
            );
        }); */
    }

    // Fetch and render report data
    function fetchReportData() {
        let startDate = $("#startDate").val();
        let endDate = $("#endDate").val();
        let product = $("#productFilter").val();

        api.post("/api/reports/sales/data", { startDate, endDate, product })
            .then(response => {
                if (response.data.success) {
                    let data = response.data.data;
                    updateChart(data);
                    updateTable(data);
                } else {
                    console.error("Failed to fetch report data");
                }
            })
            .catch(error => console.error("Error fetching report data:", error));
    }
    
    /* function fetchReportData() {
        let startDate = $("#startDate").val();
        let endDate = $("#endDate").val();
        let product = $("#productFilter").val();

        $.get("/api/reports/sales/data", { startDate, endDate, product }, function (data) {
            updateChart(data);
            updateTable(data);
        });
    } */

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

        /* let table = $("#salesTable").DataTable();
        table.clear();
        data.forEach(d => {
            table.row.add([d.date, d.product_name, d.quantity, d.total_price]);
        });
        table.draw(); */
    }

    // Event listener for filter changes
    $("#applyFilters").click(fetchReportData);

    // Initialize
    loadSlicers();
    fetchReportData();
    //$("#salesTable").DataTable();
});
