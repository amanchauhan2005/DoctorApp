import React from "react"
import { ToastContainer, toast } from 'react-toastify';
import {Route,Routes} from 'react-router-dom'
import Home from './pages/Home'
import Doctor from './pages/Doctor'
import Login from './pages/Login'
import Contact from './pages/Contact'
import About from './pages/About'
import Appointement from './pages/Appointement'
import Myappointement from './pages/Myappointement'
import Myprofile from './pages/Myprofile'
import ChatbotPage from './pages/ChatbotPage'
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ChatbotWidget from "./components/ChatbotWidget"
function App() {

  return (
    <> 
    <div className="mx-4 sm:mx-[10%]">
      <ToastContainer/>
      <Navbar></Navbar>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/Doctor' element={<Doctor/>}/>
        <Route path='/Doctor/:speciality' element={<Doctor/>}/>
        <Route path='/About' element={<About/>}/>
        <Route path='/Appointement' element={<Appointement/>}/>
        <Route path='/Myappointement' element={<Myappointement/>}/>
        <Route path='/Myprofile' element={<Myprofile/>}/>
        <Route path='/Login' element={<Login/>}/>
        <Route path='/Contact' element={<Contact/>}/>
        <Route path='/Myappointement/:id' element={<Appointement/>}/>
        <Route path='/ai-chat' element={<ChatbotPage/>}/>
      </Routes>
      <Footer/>
      <ChatbotWidget/>
    </div>
    </>
  )
}

export default App
