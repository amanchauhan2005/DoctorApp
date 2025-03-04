import doctorModel from "../models/doctorModel.js";

export const changeAvailability=async(req,res)=>{
   try {
      const{docId}=req.body
      const docData=await doctorModel.findById(docId)
      await doctorModel.findByIdAndUpdate(docId,{available:!docData.available})
      res.json({sucess:true,message:'Availability Changed'})
   } catch (error) {
      console.log(error);
      res.json({message:error.message,sucess:false})
   }
}
export const doctorList=async(req,res)=>{
   try {
      const doctors=await doctorModel.find({}).select(['-password','-email'])
      res.json({sucess:true,doctors})
   } catch (error) {
      console.log(error);
      res.json({message:error.message,sucess:false})
   }
}