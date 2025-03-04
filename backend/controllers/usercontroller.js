import validator from 'validator'
import bcrypt from 'bcrypt'
import {userModel} from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
// api to register user
 export const registerUser=async(req,res)=>{
    try {
       const{name,email,password}=req.body 
       if(!name||!password||!email){
        return res.json({sucess:false,message:"missing details"})
       }
       //validating email
       if(!validator.isEmail(email)){
        return res.json({sucess:false,message:"enter a valid email"})
       }
       if(password.length<8){
       return  res.json({sucess:false,message:"enter a strong password"})
       }
       //hashing userpassword
       const salt=await bcrypt.genSalt(10);
       const hashedPassword=await bcrypt.hash(password,salt);
       const userData={
        name,
        email,
        password:hashedPassword
       }
       const newuser=new userModel(userData);
       const user=await newuser.save();
       const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
       res.json({sucess:true,token});

    } catch (error) {
        console.log(error)
        res.json({sucess:false,message:error.message})
    }
}
//api to login
export const loginuser=async(req,res)=>{
    try {
        const{email,password}=req.body
        const user=await userModel.findOne({email})
        if(!user){
    
            return res.json({sucess:false,message:error.message})
        }
        const isMatch=await bcrypt.compare(password,user.password)
        if(isMatch){
           const token=jwt.sign({id:user._id},process.env.JWT_SECRET) 
           return res.json({sucess:true,token})
        }
        else{
           return  res.json({sucess:false,message:"invalid credentials"})
        }
    } catch (error) {
        console.log(error);
       return  res.json({sucess:false,message:error.message})
    }
}
//api to get userdata
export const getProfile=async(req,res)=>{
    try {
        const{userId}=req.body
        const userdata=await userModel.findById(userId).select('-password')
        res.json({sucess:true,userdata})

    } catch (error) {
        console.log(error);
        res.json({sucess:false,message:error.message});

    }
}
//api to update user profile
export const updateProfile=async(req,res)=>{
    try {
        const {userId,name,phone,address,dob,gender}=req.body;
        const imageFile=req.file
        if(!name||!phone||!address||!dob||!gender){
            return res.json({sucess:false,message:"Data Missing"})
        }
        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})
        if(imageFile){
            //upload image
            const imageUpload=await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL=imageUpload.secure_url;
            await userModel.findByIdAndUpdate(userId,{image:imageURL})


        }
        res.json({sucess:true,meassage:"Profile Updated"})

    } catch (error) {
        console.log(error)
        res.json({sucess:false,message:error.message})
    }
}