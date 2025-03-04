import React, { createContext } from 'react'
const DoctorContext=createContext()
const DoctorContextProvider=(props)=>{
    const values={

    }
  return( <DoctorContext.Provider value={values}>
    {props.children}
   </DoctorContext.Provider>
  )
}

export default DoctorContextProvider