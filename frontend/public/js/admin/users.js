// frontend/public/js/users.js
import { api } from '../utils/api.js';

$(document).ready(function() {
    
    let usersTable; // Define in a higher scope

    function initializeUserTable() {
        api.post('/admin/users') // Use the Axios instance
            .then(response => {
                if ($.fn.DataTable.isDataTable('#users-table')) {
                    usersTable.clear().rows.add(response.data).draw(); // Refresh existing DataTable
                } else {
                    usersTable = $('#users-table').DataTable({
                        data: response.data,
                        columns: [
                            { data: 'first_name' },
                            { data: 'last_name' },
                            { data: 'username' },
                            { data: 'email' },
                            {
                                data: "status",
                                render: function (data) {
                                    return data === "active" 
                                        ? '<span class="badge badge-success">Active</span>' 
                                        : '<span class="badge badge-danger">Disabled</span>';
                                }
                            },
                            {
                                data: "id",
                                render: function (data, type, row) {
                                    return `
                                        <button class="btn btn-warning btn-sm edit-user" data-id="${data}">Edit</button>
                                        <button class="btn btn-danger btn-sm toggle-status" data-id="${data}" data-status="${row.status}">
                                            ${row.status === "active" ? "Disable" : "Enable"}
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
    initializeUserTable();

    //Open ADD user modal window
    $("#addUserBtn").click(function () {
        $("#modalTitle").text("Add User");
        $("#userForm")[0].reset();
        $("#userId").val("");
        $("#userModal").modal("show");
    });  
    
    //SAVE new user
    $("#saveUserBtn").click(function () {
        /* const userData = {
            id: $("#userId").val(),
            username: $("#username").val(),
            email: $("#email").val(),
            role: $("#role").val(),
            password: $("#password").val()
        };
        const method = userData.id ? "put" : "post";
        const url = userData.id ? `/api/admin/users/${userData.id}` : "/api/admin/users";
        
        axios[method](url, userData)
            .then(() => {
                $("#userModal").modal("hide");
                usersTable.ajax.reload();
            })
            .catch(error => console.error("Error saving user:", error)); */
        $("#userModal").modal("hide");
    });

    //EDIT user
    $("#users-table tbody").on("click", ".edit-user", function () {
        const userId = $(this).data("id");
        console.log(userId);
        /* api.get(`/admin/users/${userId}`)
            .then(response => {
                const user = response.data;
                $("#modalTitle").text("Edit User");
                $("#userId").val(user.id);
                $("#username").val(user.username);
                $("#email").val(user.email);
                $("#role").val(user.role);
                $("#password").val("");
                $("#userModal").modal("show");
            })
            .catch(error => console.error("Error fetching user details:", error)); */
    });

    //Enable/Disable user
    $("#users-table tbody").on("click", ".toggle-status", function () {
        const userId = $(this).data("id");
        const newStatus = $(this).data("status") === "active" ? "disabled" : "active";

        api.patch(`/admin/users/${userId}/status`, { status: newStatus })
            .then(() => initializeUserTable())
            .catch(error => console.error("Error updating status:", error));
    });


    
});