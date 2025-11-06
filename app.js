let employees = JSON.parse(localStorage.getItem("employees")) || [
  { firstName: "Alice", lastName: "Wang", salary: 60000 },
  { firstName: "Bob", lastName: "Chen", salary: 70000 },
  { firstName: "Carol", lastName: "Zhang", salary: 55000 }
];

function handleLogin() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  if (u === "admin" && p === "1234" || u === "employee" && p === "abcd") {
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } else alert("Invalid credentials.");
}

function displayEmployees() {
  const t = document.querySelector("#employeeTable tbody");
  if (!t) return;
  employees = JSON.parse(localStorage.getItem("employees")) || employees;
  t.innerHTML = "";
  employees.forEach(e => {
    t.innerHTML += `<tr><td>${e.firstName}</td><td>${e.lastName}</td><td>${e.salary}</td></tr>`;
  });
}

function addEmployee() {
  const f = document.getElementById("firstName").value.trim();
  const l = document.getElementById("lastName").value.trim();
  const s = parseFloat(document.getElementById("salary").value);
  if (!f || !l || isNaN(s) || s <= 0) { alert("Fill all fields correctly."); return; }
  employees.push({ firstName: f, lastName: l, salary: s });
  localStorage.setItem("employees", JSON.stringify(employees));
  alert("Employee added.");
  window.location.href = "dashboard.html";
}

function displayReports() {
  const list = document.getElementById("reportList");
  if (!list) return;
  const reports = [
    { name: "Payroll Summary Report" },
    { name: "Attendance Report" },
    { name: "Leave Requests Overview" },
    { name: "Annual Salary Statistics" }
  ];
  list.innerHTML = "";
  reports.forEach(r => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.textContent = r.name + " ⬇️";
    link.href = "#";
    link.onclick = () => alert(`${r.name} downloaded (mock)`);
    item.appendChild(link);
    list.appendChild(item);
  });
}
