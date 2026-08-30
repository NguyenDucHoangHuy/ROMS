import React from 'react'
import { Link } from 'react-router-dom'
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaChevronRight,
} from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="relative bg-[#111111] text-gray-300 py-12 px-6 sm:px-10 lg:px-16 font-sans overflow-hidden">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        
        {/* Cột 1: Logo, About & Social Icons */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center text-orange-500">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 10.58 0A4 4 0 0 1 18 13.87V21H6z" />
                <line x1="6" y1="17" x2="18" y2="17" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-orange-500 tracking-wide leading-none">ROMS</h2>
              <p className="text-[10px] tracking-[0.25em] text-white uppercase font-semibold">RESTAURANT</p>
            </div>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            A cozy restaurant serving delicious homemade dishes. Enjoy friendly service and a warm, welcoming atmosphere</p>

          {/* Social Icons */}
          <div className="mt-5 flex items-center gap-3">
            <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-gray-800 text-white hover:bg-orange-500 hover:text-black transition duration-200">
              <FaFacebookF size={15} />
            </a>
            <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-gray-800 text-white hover:bg-orange-500 hover:text-black transition duration-200">
              <FaTwitter size={15} />
            </a>
            <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-gray-800 text-white hover:bg-orange-500 hover:text-black transition duration-200">
              <FaLinkedinIn size={15} />
            </a>
            <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-gray-800 text-white hover:bg-orange-500 hover:text-black transition duration-200">
              <FaInstagram size={15} />
            </a>
          </div>
        </div>

        {/* Cột 2: Our Menus */}
        <div>
          <h3 className="text-lg font-bold text-orange-500 mb-4 pb-1 border-b-2 border-orange-500 inline-block">
            Our Menus
          </h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>
              <Link to="/menu#appetizers" className="flex items-center gap-2 hover:text-orange-500 transition">
                <FaChevronRight className="text-orange-500 text-xs" />
                <span>Appetizers</span>
              </Link>
            </li>
            <li>
              <Link to="/menu#main-course" className="flex items-center gap-2 hover:text-orange-500 transition">
                <FaChevronRight className="text-orange-500 text-xs" />
                <span>Main course</span>
              </Link>
            </li>
            <li>
              <Link to="/menu#dessert" className="flex items-center gap-2 hover:text-orange-500 transition">
                <FaChevronRight className="text-orange-500 text-xs" />
                <span>Dessert</span>
              </Link>
            </li>
            <li>
              <Link to="/menu#drink" className="flex items-center gap-2 hover:text-orange-500 transition">
                <FaChevronRight className="text-orange-500 text-xs" />
                <span>Drink</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3: Opening Hours */}
        <div>
          <h3 className="text-lg font-bold text-orange-500 mb-4 pb-1 border-b-2 border-orange-500 inline-block">
            Opening Hours
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-white">Monday - Friday</p>
              <p className="text-gray-400">08:00 AM - 10:00 PM</p>
            </div>
            <div>
              <p className="font-medium text-white">Saturday - Sunday</p>
              <p className="text-gray-400">07:00 AM - 11:00 PM</p>
            </div>
            <div className="pt-1">
              <p className="italic text-orange-500 font-serif decoration-1 underline-offset-4 text-base">
                We are Open Everyday!
              </p>
            </div>
          </div>
        </div>

        {/* Cột 4: Contact Us */}
        <div>
          <h3 className="text-lg font-bold text-orange-500 mb-4 pb-1 border-b-2 border-orange-500 inline-block">
            Contact Us
          </h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500 text-black">
                <FaPhoneAlt size={13} />
              </span>
              <span>0123456789</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500 text-black">
                <FaEnvelope size={13} />
              </span>
              <span>roms470@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500 text-black">
                <FaMapMarkerAlt size={14} />
              </span>
              <span>470 VKU, Da Nang</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Ảnh trang trí nền bên phải */}
      <div className="absolute right-0 top-2/3 -translate-y-1/2 h-[150%] w-[45%] opacity-20 lg:opacity-100 pointer-events-none flex items-center justify-end">
      <img 
        src="Home/img9.png" 
        alt="Decor" 
        className="h-full w-auto object-contain object-right"
        style={{
          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
        }}
      />
    </div>
    </footer>
  )
}