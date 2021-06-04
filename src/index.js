require('./db/mongoose')
const userRouter=require('./router/user')
const taskRouter=require('./router/task')

const port =process.env.PORT||3000
const express=require('express')
const app=express()
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)





app.listen(port,()=>{
    console.log("Listening @ port ",port)
})
