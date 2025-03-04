import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const Footer = () => {
  return (
    <div className='flex justify-between items-center mb-7 mt-44 '>
        <div className='flex-1 text-gray-500'>
            {/*---left section */}
            <img src={assets.logo}></img>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nihil ut vero quod ex enim next </p>
        </div>
        <div className='flex-1 text-center text-gray-500'>
            {/*---center section */}
            <p>Company</p>
            <ul>
                <li>Home</li>
                <li>About Us</li>
                <li>Contact Us</li>
                <li>Privacy policy</li>
            </ul>
        </div>
        <div className='flex-1 text-center text-gray-500'>
            {/*---right section */}
            <p>GET IN TOUCH</p>
            <ul>
                <li>+1-212-456-9079</li>
                <li>amanzln2005@gmail.com</li>
            </ul>
        </div>
    </div>
  )
}

export default Footer