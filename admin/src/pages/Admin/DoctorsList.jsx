import React from 'react'
import { useContext,useEffect } from 'react'
import { AdminContext } from '../../context/Admincontext'

export const DoctorsList = () => {
    const {setdoctors,doctors,getAllDoctors,atoken,changeAvailability}=useContext(AdminContext)
    useEffect(()=>{
        if(atoken){
           getAllDoctors()
        }
    },[atoken])
  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
        <h1 className='text-lg font-medium '>All Doctors</h1>
        <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
            {
                doctors.map((item,index)=>(
                    <div className='border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group  ' key={index}>
                        <img  className='bg-indigo-50 group-hover:bg-primary *:transition-all duration-300'src={item.image} alt=""/>
                        <div className='p-5'>
                            <p className='text-neural-800 text-lg font-medium '>{item.name}</p>
                            <p className='text-zinc-600 text-sm'>{item.speciality}</p>
                            <div className='mt-2 flex items-center gap-1 text-sm'>
                                <input onChange={()=>changeAvailability(item._id)} type='checkbox' checked={item.available}/>
                                {
                                    item.available&&<p>Available</p>
                                }
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>

    </div>
  )
}