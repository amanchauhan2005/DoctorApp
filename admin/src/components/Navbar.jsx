import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/Admincontext'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, MessageCircle } from 'lucide-react'
import SymptomChecker from './SymptomChecker'

const Navbar = () => {
    const navigate=useNavigate();
    const {atoken,setatoken}=useContext(AdminContext);
    const [showSymptomChecker, setShowSymptomChecker] = useState(false);
    
    const logout=()=>{
       atoken&& setatoken('');
       atoken&&localStorage.removeItem('atoken')
       navigate('/')
    }
    
  return (
    <>
      <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
        <div className='flex items-center gap-2 text-xs ' >
            <img className='w-36 sm:w-40 cursor-pointer'src={assets.admin_logo} alt=""/>
            <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{atoken?'Admin':'Doctor'}</p>
        </div>
        
        <div className='flex items-center space-x-3'>
          {/* Symptom Checker Button */}
          <button 
            onClick={() => setShowSymptomChecker(true)}
            className='flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors'
          >
            <Stethoscope size={16} />
            <span className='hidden sm:inline'>Symptom Checker</span>
          </button>
          
          {/* AI Chat Button */}
          <button 
            onClick={() => navigate('/ai-chat')}
            className='flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors'
          >
            <MessageCircle size={16} />
            <span className='hidden sm:inline'>AI Chat</span>
          </button>
          
          {/* Logout Button */}
          <button onClick={logout} className='bg-primary text-white px-5 py-3 rounded-full'>Logout</button>
        </div>
      </div>
      
      {/* Symptom Checker Modal */}
      <SymptomChecker 
        isOpen={showSymptomChecker} 
        onClose={() => setShowSymptomChecker(false)} 
      />
    </>
  )
}

export default Navbar