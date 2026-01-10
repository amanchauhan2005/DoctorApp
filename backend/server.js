import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import connectdb from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminroute.js'
import doctorRouter from './routes/doctorroute.js'
import userRouter from './routes/userRoute.js'
import chatRouter from './routes/chatRoute.js'
import aiRouter from './routes/aiRoute.js'

//app confing
const app=express()
const PORT=process.env.PORT||4000
connectdb()
connectCloudinary()
//middlewares
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cors({
  origin: true,
  credentials: true
}))
//api endpoint
app.use('/api/admin',adminRouter)//api/admin/routes
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.use('/api/chat',chatRouter)
app.use('/api/ai', aiRouter)

app.get('/',(req,res)=>{
   res.send("api working")
})
app.listen(PORT,()=>console.log("serverstarted",PORT))
