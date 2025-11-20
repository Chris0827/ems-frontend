// Utility Functions

function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

function getEmployees() {
    return JSON.parse(localStorage.getItem("employees")) || [];
}

function setEmployees(employees) {
    localStorage.setItem("employees", JSON.stringify(employees));
}

function getLeaves() {
    return JSON.parse(localStorage.getItem("leaveRequests")) || [];
}

function setLeaves(leaves) {
    localStorage.setItem("leaveRequests", JSON.stringify(leaves));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

function setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function checkAuth(role) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    if (role === 'Admin' && user.role !== 'Admin') {
        alert("Access denied.");
        window.location.href = "dashboard.html";
        return;
    }
    if (role === 'Employee' && user.role !== 'Employee') {
        alert("Access denied.");
        window.location.href = "dashboard.html";
        return;
    }
}

// --- Initialization ---

function initApp() {
    const adminExists = localStorage.getItem("adminUser");
    const employeesExist = localStorage.getItem("employees");
    const leavesExist = localStorage.getItem("leaveRequests");

    if (!adminExists) {
        const adminUser = { id: generateUniqueId(), firstName: "System", lastName: "Admin", email: "admin@company.com", password: "admin", role: "Admin", salary: 0 };
        localStorage.setItem("adminUser", JSON.stringify(adminUser));
    }

    if (!employeesExist) {
        const sampleEmployees = [
            { id: generateUniqueId(), firstName: "Alice", lastName: "Wang", email: "alice@company.com", password: "employee", role: "Employee", salary: 60000, missedDays: 2 },
            { id: generateUniqueId(), firstName: "Bob", lastName: "Smith", email: "bob@company.com", password: "employee", role: "Employee", salary: 55000, missedDays: 1 },
        ];
        setEmployees(sampleEmployees);
    }
    
    if (!leavesExist) {
        const currentEmployees = getEmployees(); 
        const initialLeaves = [
            { id: generateUniqueId(), employeeId: currentEmployees[0].id, employeeName: "Alice Wang", type: "Vacation", startDate: "2025-12-01", endDate: "2025-12-05", reason: "Annual leave.", status: "Pending" },
            { id: generateUniqueId(), employeeId: currentEmployees[1].id, employeeName: "Bob Smith", type: "Sick", startDate: "2025-11-25", endDate: "2025-11-25", reason: "Flu.", status: "Approved" },
        ];
        setLeaves(initialLeaves);
    }
}
// Initialize application data structure
initApp();


// Authentication Functions

async function apiLogin(username, password) {
    // Gets user credentials from local storage. Replace with HTTP request after u guys finish backend and database.
    const adminUser = JSON.parse(localStorage.getItem("adminUser"));
    const employees = getEmployees();

    let user = null;

    if (username === adminUser.email && password === adminUser.password) {
        user = adminUser;
    } else {
        user = employees.find(emp => emp.email === username && emp.password === password);
    }

    if (user) {
        return { success: true, user: user };
    } else {
        return { success: false, message: "Invalid email or password." };
    }
}


async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("loginError");
    errorMsg.textContent = "Logging in..."; 

    const result = await apiLogin(username, password);

    if (result.success) {
        setCurrentUser(result.user);
        errorMsg.textContent = "";
        window.location.href = "dashboard.html";
    } else {
        errorMsg.textContent = result.message;
    }
}

function handleLogout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// --- Dashboard Logic ---

function loadDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("dashboardTitle").textContent = user.role === 'Admin' ? 'Admin Dashboard' : 'Employee Portal';

    if (user.role === 'Admin') {
        document.getElementById("adminView").style.display = 'block';
        document.getElementById("employeeView").style.display = 'none';
        displayEmployees();
        displayLeaveRequestsAdmin();
    } else {
        document.getElementById("adminView").style.display = 'none';
        document.getElementById("employeeView").style.display = 'block';
        displayMyLeaveHistory(user.id);
    }
}

// Admin Views

function displayEmployees() {
    const tableBody = document.getElementById("employeeTableBody");
    if (!tableBody) return;

    const employees = getEmployees().filter(e => e.role === 'Employee'); 
    tableBody.innerHTML = "";

    employees.forEach((emp, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${emp.firstName} ${emp.lastName}</td>
            <td>${emp.email}</td>
            <td>$${emp.salary.toLocaleString()}</td>
            <td>
                <button class="button-edit" onclick="editEmployee('${emp.id}')">Edit</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function displayLeaveRequestsAdmin() {
    const tableBody = document.getElementById("leaveTableBody");
    if (!tableBody) return;
    
    const pendingLeaves = getLeaves().filter(l => l.status === 'Pending');
    tableBody.innerHTML = "";

    if (pendingLeaves.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No pending leave requests.</td></tr>';
        return;
    }

    pendingLeaves.forEach((leave) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${leave.employeeName}</td>
            <td>${leave.type}</td>
            <td>${leave.startDate} to ${leave.endDate}</td>
            <td>${leave.reason}</td>
            <td>
                <button class="button-approve" onclick="updateLeaveStatus('${leave.id}', 'Approved')">Approve</button>
                <button class="button-reject" onclick="updateLeaveStatus('${leave.id}', 'Rejected')">Reject</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function updateLeaveStatus(leaveId, status) {
    // Asynchronous update of leave status
    let leaves = getLeaves();
    const index = leaves.findIndex(l => l.id === leaveId);

    if (index !== -1) {
        leaves[index].status = status;
        setLeaves(leaves);
        alert(`Leave request ${leaveId} has been ${status.toLowerCase()}.`);
        loadDashboard(); 
    }
}

// Employee Views

function displayMyLeaveHistory(employeeId) {
    const tableBody = document.getElementById("myLeaveTableBody");
    if (!tableBody) return;

    const myLeaves = getLeaves().filter(l => l.employeeId === employeeId);
    tableBody.innerHTML = "";
    
    if (myLeaves.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">You have no submitted leave requests.</td></tr>';
        return;
    }

    myLeaves.forEach((leave) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${leave.type}</td>
            <td>${leave.startDate}</td>
            <td>${leave.endDate}</td>
            <td><span class="status-badge status-${leave.status}">${leave.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// Leave Request Form

async function submitLeaveRequest(event) {
    // Asynchronous submission of a new leave request
    event.preventDefault();
    const form = event.target;
    const user = getCurrentUser();

    const newRequest = {
        employeeId: user.id,
        employeeName: `${user.firstName} ${user.lastName}`,
        type: form.leaveType.value,
        startDate: form.startDate.value,
        endDate: form.endDate.value,
        reason: form.reason.value,
        status: 'Pending'
    };

    let leaves = getLeaves();
    leaves.push({ id: generateUniqueId(), ...newRequest });
    setLeaves(leaves);
    
    alert("Leave request submitted successfully. Waiting for admin approval.");
    window.location.href = "dashboard.html";
}

// Employee Form (Add/Edit)

function editEmployee(id) {
    localStorage.setItem("editEmployeeId", id);
    window.location.href = "employee-form.html";
}

function loadEmployeeForm() {
    checkAuth('Admin'); 
    const id = localStorage.getItem("editEmployeeId");
    const form = document.getElementById("employeeForm");
    
    if (!id) {
        document.querySelector('h1').textContent = "Add New Employee";
        form.querySelector('button[type="submit"]').textContent = "Add Employee";
        return; 
    }

    const employees = getEmployees();
    const emp = employees.find(e => e.id === id);

    if (emp) {
        document.querySelector('h1').textContent = "Edit Employee";
        form.firstName.value = emp.firstName;
        form.lastName.value = emp.lastName;
        form.email.value = emp.email;
        form.password.value = emp.password;
        form.salary.value = emp.salary;
        form.missedDays.value = emp.missedDays || 0;
        form.querySelector('button[type="submit"]').textContent = "Save Changes";
    } else {
        localStorage.removeItem("editEmployeeId");
    }
}

async function saveEmployee(event) {
    // Asynchronous save/update of employee data
    event.preventDefault();
    const form = event.target;
    let employees = getEmployees();
    const id = localStorage.getItem("editEmployeeId");

    const employeeData = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        password: form.password.value,
        salary: parseFloat(form.salary.value),
        missedDays: parseInt(form.missedDays.value) || 0,
        role: "Employee"
    };

    if (id) {
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...employeeData };
            localStorage.removeItem("editEmployeeId");
        }
    } else {
        if (employees.some(e => e.email === employeeData.email)) {
            alert("Error: An employee with this email already exists.");
            return;
        }
        
        employees.push({ id: generateUniqueId(), ...employeeData });
    }

    setEmployees(employees);
    window.location.href = "dashboard.html";
}

// Report Viewer

function generateReport(type) {
    checkAuth('Admin');
    const employees = getEmployees();
    const leaves = getLeaves();
    let csvContent = "data:text/csv;charset=utf-8,";
    let fileName = "";
    let data = [];
    
    switch (type) {
        case "EmployeeList":
            fileName = "Employee_List.csv";
            data = employees.map(e => ({
                ID: e.id,
                Name: `${e.firstName} ${e.lastName}`,
                Email: e.email,
                Role: e.role,
                Salary: e.salary,
                MissedDays: e.missedDays || 0
            }));
            break;

        case "LeaveSummary":
            fileName = "All_Leave_Summary.csv";
            data = leaves.map(l => ({
                ID: l.id,
                Employee: l.employeeName,
                Type: l.type,
                StartDate: l.startDate,
                EndDate: l.endDate,
                Reason: l.reason.replace(/,/g, ';'), 
                Status: l.status
            }));
            break;
            
        case "PendingLeaves":
            fileName = "Pending_Leave_Summary.csv";
            data = leaves.filter(l => l.status === 'Pending').map(l => ({
                ID: l.id,
                Employee: l.employeeName,
                Type: l.type,
                StartDate: l.startDate,
                EndDate: l.endDate,
                Reason: l.reason.replace(/,/g, ';'),
                Status: l.status
            }));
            break;
    }

    if (data.length === 0) {
        alert("No data available for this report.");
        return;
    }

    const headers = Object.keys(data[0]);
    csvContent += headers.join(',') + "\n";
    data.forEach(row => {
        csvContent += headers.map(header => row[header]).join(',') + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
