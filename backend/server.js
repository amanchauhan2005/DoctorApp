import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import mongoose from 'mongoose'
import connectdb from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminroute.js'
import doctorRouter from './routes/doctorroute.js'
import userRouter from './routes/userRoute.js'
//app confing
const app=express()
const PORT=process.env.PORT||4000
connectdb()
connectCloudinary()
//middlewares
app.use(express.json())
app.use(cors())
//api endpoint
app.use('/api/admin',adminRouter)//api/admin/routes
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.get('/',(req,res)=>{
   res.send("api working")
})
app.listen(PORT,()=>console.log("serverstarted",PORT))