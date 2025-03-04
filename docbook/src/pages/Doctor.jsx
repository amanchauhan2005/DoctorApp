import React, { useContext } from 'react'
import { useParams,useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useState,useEffect } from 'react'


const Doctor = () => {
  
  const{speciality}=useParams()
  console.log(speciality);
  const [filterDoc,setFilterDoc]=useState([])
  const [showfilter,setshowfilter]=useState(false)
   const navigate=useNavigate()
  const{doctors}=useContext(AppContext)
  console.log("Doctors from context:", doctors);
  const applyFilter=()=>{
    if(speciality){
      setFilterDoc(doctors.filter(doc=>doc.speciality===speciality))
      console.log('speciality is here after')
    }else{
      setFilterDoc(doctors)
      console.log('speciality is not here')
    }
  }
  useEffect(()=>{
    console.log("Starting filter with doctors:", doctors);
     applyFilter()
  },[doctors,speciality])
  return (
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5' >
        <button className={`py-1 px-2  rounded text-sm transition-all sm:hidden ${showfilter}?'bg-primary text-white: h-0 w-0`} onClick={()=>setshowfilter(prev=>!prev)}>Filters</button>
        <div className={`flex-col text-gray-600 text-sm gap-3 ${showfilter?'flex':'hidden sm:flex'}`}>
          <p onClick={()=>speciality==='Dermatologist'?navigate('/Doctor'):navigate('/Doctor/Dermatologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer`}>Dermatologist </p> 
          <p onClick={()=>speciality==='Gynecologist'?navigate('/Doctor'):navigate('/Doctor/Gynecologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer`}>Gynecologist</p>
          <p onClick={()=>speciality==='General physician'?navigate('/Doctor'):navigate('/Doctor/General physician')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer`}>General physician</p>
          <p onClick={()=>speciality==='Pediatricians'?navigate('/Doctor'):navigate('/Doctor/Pediatricians')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer`}>Pediatricians</p>
          <p onClick={()=>speciality==='Neurologist'?navigate('/Doctor'):navigate('/Doctor/Neurologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer`}>Neurologist</p>
          <p onClick={()=>speciality==='Gastroenterologist'?navigate('/Doctor'):navigate('/Doctor/Gastroenterologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer`}>Gastroenterologist</p>
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6 mb-8'>
          {
            filterDoc.map((item,index)=>(
              <div onClick={()=>(navigate(`/Myappointement/${item._id}`))}className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'key={index}>
                  <img className='bg-blue-50'src={item.image} alt="" />
                  <div className='p-4'>
                      <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                      <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
                      </div>
                  </div>
                  <p className='text-gray-900 text-lg font-medium '>{item.name}</p>
                  <p className='text-gray-600 text-sm'>{item.speciality}</p>
              </div>
          ))
          }
        </div>
      </div>
    </div>
  )
}

export default Doctor