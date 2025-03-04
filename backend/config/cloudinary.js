import {v2 as cloudinary} from 'cloudinary'
  const connectCloudinary=async()=>{
  try{  cloudinary.config({
        cloud_name:process.env.CLOUD_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_SECRET_KEY
    })
    console.log('cloudinary connected')
}catch(error){
    console.log('cloudinary connection error',error.message)
}
}
export default connectCloudinary