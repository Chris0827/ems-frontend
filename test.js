// --- Helper Functions for Testing ---

function resetLocalStorage() {
    // Clear all data before each test
    localStorage.clear(); 
    // Re-run initApp to set up default Admin and sample Employees
    initApp(); 
}

function assert(condition, message) {
    if (condition) {
        console.log(`✅ Passed: ${message}`);
    } else {
        console.error(`❌ Failed: ${message}`);
    }
}

// Unit Tests

function test1_InitialDataSetup() {
    resetLocalStorage();
    const employees = getEmployees();
    const adminUser = JSON.parse(localStorage.getItem("adminUser"));

    assert(adminUser !== null && adminUser.role === 'Admin', "T1: Admin user initialized.");
    assert(employees.length >= 2, "T1: Sample employees initialized (>= 2).");
}

async function test2_SuccessfulLogin() {
    resetLocalStorage();
    
    // Test Admin Login
    let result = await apiLogin("admin@company.com", "admin");
    assert(result.success && result.user.role === 'Admin', "T2: Admin login successful.");

    // Test Employee Login (use Alice)
    result = await apiLogin("alice@company.com", "employee");
    assert(result.success && result.user.role === 'Employee', "T2: Employee login successful (Alice).");
    
    // Test Failed Login
    result = await apiLogin("bad@company.com", "wrongpass");
    assert(!result.success, "T2: Login failed for invalid credentials.");
}

function test3_AddAndVerifyNewEmployee() {
    resetLocalStorage();
    const initialCount = getEmployees().length;
    
    const newEmployee = { 
        id: generateUniqueId(), 
        firstName: "New", 
        lastName: "Hire", 
        email: "new@comp.com", 
        password: "pass", 
        role: "Employee", 
        salary: 70000 
    };

    let employees = getEmployees();
    employees.push(newEmployee);
    setEmployees(employees);

    const updatedEmployees = getEmployees();
    const newCount = updatedEmployees.length;

    assert(newCount === initialCount + 1, "T3: Employee count increased by 1.");
    assert(updatedEmployees.some(e => e.email === "new@comp.com"), "T3: New employee data found in storage.");
}

function test4_UpdateEmployeeSalary() {
    resetLocalStorage();
    let employees = getEmployees();
    const targetEmail = employees[0].email; // Use the first sample employee (Alice)
    const newSalary = 80000;
    
    // Find employee index and update locally
    const index = employees.findIndex(e => e.email === targetEmail);
    employees[index].salary = newSalary;
    setEmployees(employees);

    const updatedEmployee = getEmployees().find(e => e.email === targetEmail);

    assert(updatedEmployee.salary === newSalary, "T4: Employee salary updated successfully.");
}

// Execution

console.log("--- Running Unit Tests for Employee Management System ---");
test1_InitialDataSetup();
// Since apiLogin is async, we use IIFE to handle the promise
(async () => {
    await test2_SuccessfulLogin();
    test3_AddAndVerifyNewEmployee();
    test4_UpdateEmployeeSalary();
    console.log("------------------ Tests Complete ------------------");
})();
