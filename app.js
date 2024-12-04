const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Use dynamic port for Render
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Load employees data
const filePath = path.join(__dirname, 'data', 'employeeinfo.json');
let employees = [];

try {
  const data = fs.readFileSync(filePath, 'utf-8');
  employees = JSON.parse(data);
} catch (err) {
  console.error('Error reading employee data file:', err.message);
}

// Root endpoint
app.get('/', (req, res) => {
  res.send('Employee API is running!');
});

// Get all employees
app.get('/api/v1/employees', (req, res) => {
  res.status(200).json({
    status: 'Success',
    results: employees.length,
    data: {
      employeesinfo: employees,
    },
  });
});

// Get a specific employee by ID
app.get('/api/v1/employees/:empId/:name?', (req, res) => {
  const eid = parseInt(req.params.empId, 10);
  const employee = employees.find((emp) => emp.id === eid);

  if (!employee) {
    return res.status(404).json({
      status: 'Employee Not Found',
      desc: 'Employee ID is invalid. Please check again.',
    });
  }

  res.status(200).json({
    status: 'Employee Found',
    data: {
      employee,
    },
  });
});

// Add a new employee
app.post('/api/v1/employees', (req, res) => {
  const { name, position } = req.body;

  if (!name || !position) {
    return res.status(400).json({
      status: 'Fail',
      desc: 'Name and position are required fields.',
    });
  }

  const newEmpId = employees.length > 0 ? employees[employees.length - 1].id + 1 : 1;
  const newEmployee = Object.assign({ id: newEmpId }, req.body);
  employees.push(newEmployee);

  fs.writeFile(filePath, JSON.stringify(employees), (err) => {
    if (err) {
      return res.status(500).json({
        status: 'Error',
        desc: 'Failed to save new employee data.',
      });
    }

    res.status(201).json({
      status: 'Success',
      data: {
        newEmployee,
      },
    });
  });
});

// Delete an employee by ID
app.delete('/api/v1/employees/:id', (req, res) => {
  const empid = parseInt(req.params.id, 10);
  const index = employees.findIndex((emp) => emp.id === empid);

  if (index === -1) {
    return res.status(404).json({
      status: 'Employee Not Found',
      desc: 'Employee ID is invalid. Please check again.',
    });
  }

  employees.splice(index, 1);

  fs.writeFile(filePath, JSON.stringify(employees), (err) => {
    if (err) {
      return res.status(500).json({
        status: 'Error',
        desc: 'Failed to update employee data.',
      });
    }

    res.status(202).json({
      status: 'Deleted',
      msg: 'Employee removed successfully.',
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Express app is running on port ${port}`);
});
