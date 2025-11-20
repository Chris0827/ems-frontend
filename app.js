// ---------------------
// Login
// ---------------------
function initLogin() {
  if (!localStorage.getItem("adminUser")) {
    const admin = { username: "admin", password: "1234" };
    localStorage.setItem("adminUser", JSON.stringify(admin));
  }
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("loginError");
  const storedUser = JSON.parse(localStorage.getItem("adminUser"));

  if (storedUser && username === storedUser.username && password === storedUser.password) {
    localStorage.setItem("loggedIn", "true");
    errorMsg.textContent = "";
    window.location.href = "dashboard.html";
  } else {
    errorMsg.textContent = "Invalid username or password.";
  }
}

// ---------------------
// Dashboard
// ---------------------
function initSampleData() {
  if (!localStorage.getItem("employees")) {
    const sampleEmployees = [
      { firstName: "Alice", lastName: "Wang", salary: 60000, missedDays: 2 },
      { firstName: "Bob", lastName: "Smith", salary: 55000, missedDays: 1 },
      { firstName: "Carol", lastName: "Johnson", salary: 58000, missedDays: 3 },
      { firstName: "David", lastName: "Brown", salary: 62000, missedDays: 0 }
    ];
    localStorage.setItem("employees", JSON.stringify(sampleEmployees));
  }
}

function loadDashboard() {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
    return;
  }
  initSampleData();
  displayEmployees();
}

function displayEmployees() {
  const tableBody = document.getElementById("employeeTableBody");
  if (!tableBody) return;

  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  tableBody.innerHTML = "";

  employees.forEach((emp, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${emp.firstName} ${emp.lastName}</td>
      <td>${emp.salary}</td>
      <td>${emp.missedDays}</td>
      <td>
        <button class="button-edit" onclick="editEmployee(${index})">Edit</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function editEmployee(index) {
  localStorage.setItem("editIndex", index);
  window.location.href = "employee-form.html";
}

// ---------------------
// Employee Form
// ---------------------
function loadEmployeeForm() {
  const index = localStorage.getItem("editIndex");
  const form = document.getElementById("employeeForm");
  const employees = JSON.parse(localStorage.getItem("employees")) || [];

  if (index !== null && employees[index]) {
    const emp = employees[index];
    form.firstName.value = emp.firstName;
    form.lastName.value = emp.lastName;
    form.salary.value = emp.salary;
    form.missedDays.value = emp.missedDays;
  }
}

function saveEmployee(event) {
  event.preventDefault();
  const form = event.target;
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const index = localStorage.getItem("editIndex");

  const newEmployee = {
    firstName: form.firstName.value,
    lastName: form.lastName.value,
    salary: parseFloat(form.salary.value),
    missedDays: parseInt(form.missedDays.value) || 0
  };

  if (index !== null && employees[index]) {
    employees[index] = newEmployee;
    localStorage.removeItem("editIndex");
  } else {
    employees.push(newEmployee);
  }

  localStorage.setItem("employees", JSON.stringify(employees));
  window.location.href = "dashboard.html";
}

// ---------------------
// Report Viewer
// ---------------------
function initReportViewer() {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
    return;
  }
  loadEmployeeOptions();
  displayReports();
}

function loadEmployeeOptions() {
  const select = document.getElementById("employeeSelect");
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  select.innerHTML = '<option value="">-- Choose an Employee --</option>';
  employees.forEach((e, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${e.firstName} ${e.lastName}`;
    select.appendChild(option);
  });
}

function displayReports() {
  const list = document.getElementById("reportList");
  if (!list) return;

  const reports = [
    { name: "Payroll Summary Report", type: "payroll" },
    { name: "Attendance Report", type: "attendance" },
    { name: "Leave Requests Overview", type: "leave" },
    { name: "Annual Salary Statistics", type: "salary" }
  ];

  list.innerHTML = "";
  reports.forEach(r => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.textContent = r.name + " ⬇️";
    link.href = "#";
    link.onclick = () => generateReport(r.type);
    item.appendChild(link);
    list.appendChild(item);
  });
}

function generateReport(type) {
  const select = document.getElementById("employeeSelect");
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const idx = select.value;

  if (idx === "") {
    alert("Please select an employee first.");
    return;
  }

  const emp = employees[idx];
  let csvContent = "data:text/csv;charset=utf-8,";
  let fileName = "";

  switch (type) {
    case "payroll":
      fileName = "Payroll_Summary.csv";
      csvContent += "Employee,Annual Salary,Missed Days\n";
      csvContent += `${emp.firstName} ${emp.lastName},${emp.salary},${emp.missedDays}\n`;
      break;
    case "attendance":
      fileName = "Attendance_Report.csv";
      csvContent += "Employee,Attendance Rate (%)\n";
      const rate = emp.missedDays ? (100 - emp.missedDays * 2) : 100;
      csvContent += `${emp.firstName} ${emp.lastName},${rate}\n`;
      break;
    case "leave":
      fileName = "Leave_Overview.csv";
      csvContent += "Employee,Leave Requests,Approved\n";
      csvContent += `${emp.firstName} ${emp.lastName},1,Yes\n`;
      break;
    case "salary":
      fileName = "Salary_Statistics.csv";
      csvContent += "Employee,Base Salary,Annual Bonus (10%)\n";
      csvContent += `${emp.firstName} ${emp.lastName},${emp.salary},${(emp.salary * 0.1).toFixed(2)}\n`;
      break;
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
