import React from 'react'
import {useState} from 'react'
import { assets } from '../assets/assets_frontend/assets'
const Myprofile = () => {
  const [userData,setuserData]=useState({
    name:"Edward Vincent",
    image:assets.profile_pic,
    email:"richardjameswap@gmail.com",
    phone:'+1 123 456 768',
    address:{
      line1:"57th Cross,Richgmond",
      line2:"Circle,Church Road,London"
    },
    gender:'Male',
    dob:'2000-01-20'
  })
  const [isEdit,setisEdit]=useState(false)
  console.log(isEdit);
  return (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>
      <img className='w-36 rounded' src={userData.image}/>
      {
       isEdit?
       (<input className='bg-gray-50 text-3xl font-medium max-w-60 mt-4' type='text' value={userData.name} onChange={e=>setuserData(prev=>({...prev,name:e.target.value}))}></input>)
       :
       (<p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>)
      }
      <hr className='bg-zinc-300 h-[3px] border-none'/>
      <div>
        <p className='text-gray-500 text-xl underline mt-2 mb-2'>Contact Information</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-4'>
          <p className='font-medium'>Email id:</p>
          <p className='text-blue-500'>{userData.email}</p>
          <p className='font-medium'>Phone:</p>
          {
       isEdit?
       (<input className='bg-gray-100 max-w-52' type='text' value={userData.phone} onChange={e=>setuserData(prev=>({...prev,phone:e.target.value}))}></input>)
       :
       (<p className='text-blue-500'>{userData.phone}</p>)
      }
      <p>Adress:</p>
      {
        isEdit?
        <p className='font-medium'>
          <input className='bg-gray-50'type='text' onChange={(e)=>setuserData(prev=>({...prev,adress:{...prev.address,line1:e.target.value}}))} value={userData.address.line1}/>
          <br/> 
          <input  className='bg-gray-50'type='text' onChange={(e)=>setuserData(prev=>({...prev,adress:{...prev.address,line2:e.target.value}}))} value={userData.address.line2}/>
        </p>
        :<p  className='text-blue-500' >
          {userData.address.line1}
          <br />
          {userData.address.line2}
        </p>
      }
        </div>
      </div>
      <div>
        <p className='text-gray-500 text-xl underline mt-2 mb-2'>Basic Information</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2 mt-3 text-neutral-400'>
          <p className='font-medium text-gray-800'>Gender:</p>
          {
            isEdit?
            <select className='max-w-20 bg-gray-100' onChange={(e)=>setuserData({...prev,gender:e.target.value})}>
              <option value="Male"> Male</option>
              <option value="female">Female</option>
            </select>:
            <p className='text-gray-400'>{userData.gender}</p>
          }
          <p className='font-medium text-gray-800'>Birthday:</p>
          {
            isEdit?
            <input className='max-w-40' type='date' onChange={(e)=>setuserData(prev=>({...prev,dob:e.target.value}))} value={userData.dob}></input>
            :
            <p className='text-gray-400'>{userData.dob}</p>
          }
        </div>
      </div>
      <div className='mt-5 mb-10'>
        {
          isEdit?
          <button className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition all duration-300 'onClick={()=>setisEdit(false)}>Save Information</button>:
          <button className='border border-primary px-8 py-2 rounded-full  hover:bg-primary hover:text-white transition all duration-300'onClick={()=>setisEdit(true)}>Edit</button>
        }
      </div>
    </div>
  )
}

export default Myprofile