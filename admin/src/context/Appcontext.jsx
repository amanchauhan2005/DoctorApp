import React, { createContext } from 'react'
const AppContext=createContext()
const AppContextProvider=(props)=>{
    const values={

    }
  return( <AppContext.Provider value={values}>
    {props.children}
   </AppContext.Provider>
  )
}

export default AppContextProvider