import React, { useContext, useState } from 'react'
import {assets} from'../assets/assets'
import {AdminContext} from '../context/Admincontext' 
import axios from 'axios'
import { toast } from 'react-toastify'
const Login = () => {
    const [state,setstate]=useState('Admin')
    const{setatoken,backendUrl}=useContext(AdminContext)
    const[email,setemail]=useState('')
    const[password,setpassword]=useState('')
    const onSubmitHandler=async(event)=>{
        event.preventDefault()
        console.log('Form submitted with:', {email, password})
        try {
            if(state==='Admin'){
                const{data}=await axios.post(backendUrl+'/api/admin/login',{email,password})
                if(data.sucess){
                    localStorage.setItem('atoken',data.token1)
                    setatoken(data.token1); 
                    console.log('miya')
                }
                else{
                    console.log("unhappy")
                    toast.error((data.message))
                }
            }else{ 

            }
        } catch (error) {
            console.log('Error',error)
        }
    }
    

  return (
   <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
    <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm  shadow-lg '>
        <p className='text-2xl font-semibold m-auto'>
            <span className='text-primary'>{state}</span>Login
        </p>
        <div className='w-full'>
            <p>Email</p>
            <input onChange={(e)=>setemail(e.target.value)} value={email} className='border border-[#DADADA] w-full p-2 mt-1' type='email' required/>
        </div>
        <div className='w-full'>
            <p>Password</p>
            <input onChange={(e)=>setpassword(e.target.value)} value={password} className='border border-[#DADADA] w-full p-2 mt-1'  type="password" required></input>
        </div>
        <button onClick={()=>console.log('Test click working')}className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
        {
            state==='Admin'?
            <p>Doctor Login?
            <span className='text-primary underline cursor-pointer' onClick={()=>setstate('Doctor')}>Click here</span></p>
            :<p>Admin Login?
            <span className='text-primary underline cursor-pointer'onClick={()=>setstate('admin')}>Click here</span></p>
        }
    </div>
   </form>
  )
}

export default Login