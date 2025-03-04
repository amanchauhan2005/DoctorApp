import mongoose from "mongoose";
const connectdb=async()=>{
    mongoose.connection.on('connected',()=>console.log('mongo db connected'))
    await mongoose.connect(`${process.env.MONGODB_URL}/pres`)
}
export default connectdb