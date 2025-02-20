// frontend/public/js/users.js
import { api } from '../utils/api.js';

$(document).ready(function() {
    
    let requestsTable;

    function initializeRequestsTable() {
        api.get('/admin/requests') // Use the Axios instance
            .then(response => {
                if ($.fn.DataTable.isDataTable('#requests-table')) {
                    requestsTable.clear().rows.add(response.data).draw();
                } else {
                    requestsTable = $('#requests-table').DataTable({
                        data: response.data,
                        columns: [
                            { data: 'first_name' },
                            { data: 'last_name' },
                            { data: 'username' },
                            { data: 'email' },
                            {
                                data: "status",
                                render: function (data) {
                                    return data === "approved" 
                                        ? '<span class="badge badge-success">Approved</span>' 
                                        : data === "pending" 
                                            ? '<span class="badge badge-warning">Pending</span>' 
                                            : '<span class="badge badge-danger">Rejected</span>';
                                }
                            },
                            {
                                data: "id",
                                render: function (data) {
                                    return `
                                        <button class="btn btn-success btn-xs approve-btn" data-id="${data}">
                                            <i class="fas fa-check"></i> Approve
                                        </button>
                                        <button class="btn btn-danger btn-xs reject-btn" data-id="${data}">
                                            <i class="fas fa-times"></i> Reject
                                        </button>
                                    `;
                                }
                                
                            }
                        ],
                        searching: false,
                        autoWidth: false
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }

    // Call the function to initialize the DataTable
    initializeRequestsTable();

    //Approve request
    $("#requests-table tbody").on("click", ".approve-btn", function () {
        const userId = $(this).data("id");

        api.post(`/admin/requests/${userId}/approve`)
            .then(() => initializeRequestsTable())
            .catch(error => console.error("Error on approval request:", error));
    });

    //Reject request
    $("#requests-table tbody").on("click", ".reject-btn", function () {
        const userId = $(this).data("id");
        console.log(userId);

        api.post(`/admin/requests/${userId}/reject`)
            .then(() => initializeRequestsTable())
            .catch(error => console.error("Error on rejecting request:", error));
    });
    
});