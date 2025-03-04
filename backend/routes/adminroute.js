import express from 'express'
import {addDoctor,loginAdmin,allDoctors} from '../controllers/admincontroller.js'
import authadmin from '../middleware/authadmin.js'
import upload from '../middleware/multer.js'
import { changeAvailability } from '../controllers/doctorcontroller.js'
const adminRouter=express.Router()
adminRouter.post('/add-doctor',authadmin,upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors',authadmin,allDoctors)
adminRouter.post('/change-availability',authadmin,changeAvailability)
export default adminRouter
//here whenever client hit on this path then our addDoctor function runs but whenever this runs particular function runs we always want that the form data
//image file will upload first on the local server and this uploadiing of file on local server is done by multer so we create a middleware
//using multer.