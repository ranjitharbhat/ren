const exp = require('constants')
const express = require('express')
const fs = require("fs")
const morgan= require("morgan")
// creating express app 
const app = express()
const port = 8000

app.use(express.json())

app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString()
    next()
})
const employees = JSON.parse(fs.readFileSync(`${__dirname}/data/employeeinfo.json`))
// Handler methods
const getAllEmployees=(req,res)=>{
    res.status(200)
       .json(
        {
            status:"Success",
            results: employees.length,
            requestTime:req.requestTime,
            data:{
                employeesinfo :employees
            }
        }
       )
     
}

const getEmployee=(req,res)=>{
    const eid = req.params.id *1
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
}
const removeEmployee=(req,res)=>{
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
    
}
const addNewEmployee=(req,res)=>{
    //  console.log(req.body)
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
      //console.log(newEmpId)
    //  res.send("Added successfully")
}
// Routes - mounting of multiple routers
const employeeRouter =express.Router()
app.use("/api/v1/employees",employeeRouter)


employeeRouter.route("/")
.get(getAllEmployees)
.post(addNewEmployee)

employeeRouter.route("/:id")
.get(getEmployee)
.delete(removeEmployee)


app.listen(port,()=>{
    console.log(`Express app is running in ${port}`)
})