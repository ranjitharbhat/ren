const express = require('express')
const fs = require("fs") 
const app = express()
const port = 8000

app.use(express.json())
const employees = JSON.parse(fs.readFileSync(`${__dirname}/data/employeeinfo.json`))

app.get("/api/v1/employees",(req,res)=>{
    res.status(200)
       .json(
        {
            status:"Success",
            results: employees.length,
            data:{
                employeesinfo :employees
            }
        }
       )
     
})

app.get("/api/v1/employees/:empId/:name?/",(req,res)=>{
    const eid = req.params.empId *1
    const employee = employees.find(emp=>emp.id===eid)

    if(!employee)
    {
       return res.status(404)
       .json({
          status:"Employee Not Found",
          desc : "Employee id is invalid please check again"
       })
    }
   res.status(200)
   .json(
    {
        status:"Employee found",
        data:{
            employee
        }
    }
   )
})

app.post("/api/v1/employees",(req,res)=>{
    
      const newEmpId =employees[employees.length-1].id +1
      const newEmployee = Object.assign(
        {
            id:newEmpId,
           
        }, req.body
      )
      employees.push(newEmployee)
      fs.writeFile(`${__dirname}/data/employeeinfo.json`,JSON.stringify(employees),
        (err)=>{
            res.status(201)
            .json(
                {
                    status:"successfully added",
                    employees:newEmployee
                }
            )
        }
      )
     
})

app.delete("/api/v1/employees/:id",(req,res)=>{
    const empid = req.params.id*1
    const index =  employees.findIndex(emp=>emp.id==empid)
    console.log(index)
    if(empid>employees.length)
         {
            return res.status(404)
            .json({
               status:"Employee Not Found",
               desc : "Employee id is invalid please check again"
            })

         }
    employees.splice(index,1)
     fs.writeFile(`${__dirname}/data/employeeinfo.json`,JSON.stringify(employees),(err)=>{
          res.status(202).json(
             {
                status:"deleted",
                msg:"Employee removed successfully"
             }
          )
     })
    
})

app.listen(port,()=>{
    console.log(`Express app is running in ${port}`)
})