import { createContext } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'
import { useState,useEffect } from "react";
export const AppContext=createContext()
export const AppContextProvider=(props)=>{
    const [token,settoken]= useState(localStorage.getItem('token')?localStorage.getItem('token'):false)
    const currency='$'
    const backendUrl=import.meta.env.VITE_BACKEND_URL
    const [doctors,setdoctors]=useState([])
    const getDoctorsData=async()=>{
        try {
            console.log('Attempting to fetch from:', backendUrl + "/api/doctor/list")
            const{data}=await axios.get(backendUrl+"/api/doctor/list")
            if(data.sucess){
                setdoctors(data.doctors)
            }else{
                console.log("hiaman2");
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    const value={
        doctors:doctors,
        currency:currency,
        token,settoken,
        backendUrl
    }
    useEffect(()=>{
        getDoctorsData()
    },[])
    return(
        <AppContext.Provider value={value} >
            {props.children}
        </AppContext.Provider>
      )
}