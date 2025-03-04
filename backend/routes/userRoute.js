import express from 'express'
import { Router } from 'express'
import { registerUser,loginuser, getProfile,updateProfile} from '../controllers/usercontroller.js'
import { authUser } from '../middleware/authuser.js'
import upload from '../middleware/multer.js'
const userRouter=express.Router()
userRouter.post('/register',registerUser)
userRouter.post('/login',loginuser)
userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)

export default userRouter