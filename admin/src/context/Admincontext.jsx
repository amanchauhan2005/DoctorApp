import axios from 'axios';
import React, { createContext, useState } from 'react'
import { toast } from 'react-toastify';
export const AdminContext=createContext()
export const AdminContextProvider=(props)=>{
    const [atoken,setatoken]=useState(localStorage.getItem('atoken')?localStorage.getItem('atoken'):localStorage.getItem('')) 
    const[doctors,setdoctors]=useState([]);
    //this is used
    //so that the admin remains login even if he refreseh the page because when we refresh firtsly in useState we have only used empty string but now itchecks
    //in loicalMachine storage whteher there is something that we can use of
    const backendUrl=import.meta.env.VITE_BACKEND_URL
    const getAllDoctors=async()=>{
      try {
        console.log(atoken);
        const {data}=await axios.post(backendUrl+'/api/admin/all-doctors',{},{headers:{atoken}})
        if(data.sucess){
          setdoctors(data.doctors)
          console.log(data.doctors)
        }
        else {
          console.log('fetch error')
          toast.error(data.message)
        }
      } catch (error) {
        console.log('other error')
        toast.error(error.message)
      }
    }
    const changeAvailability=async(docId)=>{
      console.log('avaliablity started')
      try {
        const{data}=await axios.post(backendUrl+'/api/admin/change-availability',{docId},{headers:{atoken}})
        if(data.sucess){
          toast.success(data.message);
          getAllDoctors()
        }
        else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    } 
    const values={
        atoken,setatoken,
        backendUrl,doctors,
        getAllDoctors,changeAvailability
    }
  return( 
  <AdminContext.Provider value={values}>
    {props.children}
   </AdminContext.Provider>
  )
}

