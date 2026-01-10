import React, { useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {


    const navigate=useNavigate()
    const{backendUrl,token,settoken}=useContext(AppContext)
    const [state,setstate]=useState('signup')
    const[email,setEmail]=useState('')
    const[password,setPassword]=useState('')
    const[name,setName]=useState('')
    const onSubmitHandler=async(event)=>{
        event.preventDefault()
        try {
            if(state==='signup'){
                const {data}=await axios.post(backendUrl+'/api/user/register',{name,password,email});
                if(data.sucess){
                    console.log("hamesha")
                   localStorage.setItem ('token',data.token);
                   settoken(data.token)
                }
                else{
                    console.log("unhappy");
                    toast.error(data.message)
                }
            }
            else{
                const {data}=await axios.post(backendUrl+'/api/user/login',{password,email});
                if(data.sucess){
                    console.log("i am login")
                   localStorage.setItem ('token', data.token);
                   console.log(data.token);
                   settoken(data.token)
                   console.log("how you are navigating ")
                   settoken(data.token)
                }
                else{
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(()=>{
        if(token){
            navigate('/')
        }
    },[token])
  return (
   <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex'>
    <div  className='flex flex-col m-auto gap-3 p-8 items-start min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm  shadow-lg'>
        <p className='text-2xl font-semibold mt-3 '>{state==='signup'?"create Account":"Login"}</p>
        <p>
            Please{state==='signup'?"signup":"Login"} to book appointement
        </p>
       { state==='signup'&&<div className='w-full'>
            <p>FullName</p>
            <input className='border border-zinc-300 rounded-md w-full p-2 mt-1' type='text' onChange={(e)=>setName(e.target.value)} value={name}></input>
        </div>}
        <div className='w-full'>
            <p>Email</p>
            <input className='border border-zinc-300 rounded-md w-full p-2 mt-1' type='email' onChange={(e)=>setEmail(e.target.value)} value={email}></input>
        </div>
        <div className='w-full'>
            <p>Password</p>
            <input  className='border border-zinc-300 rounded-md w-full p-2 mt-1' type='password' onChange={(e)=>setPassword(e.target.value)} value={password}></input>
        </div>
        <button  type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>{state==='signup'?"Create Account":"Login"}</button>
        {
            state==='signup'?
            <p>Already Have An account,<span onClick={()=>setstate("")} className='text-primary underline cursor-pointer'>Login Here</span></p>:
            <p>For account creation,<span onClick={()=>setstate("signup")} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
    </div>
   
   </form>
  )
}

export default Login