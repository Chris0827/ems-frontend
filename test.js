function testAddEmployee() {
  localStorage.clear();
  let testEmployees = [];
  localStorage.setItem("employees", JSON.stringify(testEmployees));

  employees = JSON.parse(localStorage.getItem("employees"));
  employees.push({ firstName: "Test", lastName: "User", salary: 50000 });
  localStorage.setItem("employees", JSON.stringify(employees));

  const saved = JSON.parse(localStorage.getItem("employees"));
  if (saved.length === 1 && saved[0].firstName === "Test") {
    console.log("✅ testAddEmployee passed");
  } else {
    console.error("❌ testAddEmployee failed");
  }
}

testAddEmployee();
