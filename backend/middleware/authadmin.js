import jwt from 'jsonwebtoken'
const authAdmin=async(req,res,next)=>{
   try {
    console.log('unhappy')
        const {atoken}=req.headers
        console.log(atoken);
        if(!atoken){
            return res.json({sucess:false,message:'Not Authorized Login Again'})
        }
        const token_decode=jwt.verify(atoken,'aman');
        if(token_decode!==process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD){
            return res.json({sucess:false,mesaage:'auth fail'})
        }
        else next()
    } catch (error) {
        console.log(error)
        res.json({sucess:false,message:error})
        
    }
}
export default authAdmin