import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  ChefHat,
  Clock3,
  Sparkles,
  Star,
  UtensilsCrossed,
  ShoppingCart,
  Leaf,
  Utensils,
  Users,
  ChevronLeft,
  ChevronRight,
  Play,
  Search,
  X,
  Phone,
  Mail,
  MapPin,
  Lock, 
  MessageSquare,
} from 'lucide-react'

import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from 'react-icons/fa'

import Footer from '../../components/Footer.tsx'

// Danh sách ảnh slide cho phần Header
const heroImages = [
 '/Home/header0.jfif',
 '/Home/header1.jpg',
 '/Home/header2.jpg',
 '/Home/header3.jpg',
 '/Home/header4.jpg',
 '/Home/header5.jpg',
]

const featureItems = [
  { icon: UtensilsCrossed, title: 'Fresh Ingredients', detail: 'Carefully selected every day' },
  { icon: ChefHat, title: 'Dedicated Chefs', detail: 'Over 10 years of experience' },
  { icon: Star, title: 'Cozy Atmosphere', detail: 'Perfect for every gathering' },
]

const popularDishes = [
  {
    id: 1,
    name: 'Creamy Alfredo Pasta',
    price: '$12.99',
    rating: 5,
    tag: 'Best Seller',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR26_Qrxmnqa87MO9ijZvxIuITlbdsmlMyJl80t9q6R3ySCN--8Pput2FN-&s=10',
  },
  {
    id: 2,
    name: 'Grilled Chicken Steak',
    price: '$15.99',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Margherita Pizza',
    price: '$11.99',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: 'Chocolate Lava Cake',
    price: '$7.99',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
  },
]

const services = [
  {
    icon: Leaf,
    title: 'Fresh Ingredients',
    description: 'Fresh, high-quality ingredients carefully selected every day from trusted suppliers.',
  },
  {
    icon: ChefHat,
    title: 'Skilled Chefs',
    description: 'Skilled chefs with over 10 years of experience, bringing passion and expertise to every dish.',
    highlighted: true,
  },
  {
    icon: Utensils,
    title: 'Fast & Friendly Service',
    description: 'Professional, fast, and attentive service that delivers an exceptional dining experience.',
  },
  {
    icon: Users,
    title: 'Happy Customers',
    description: 'Customer satisfaction and smiles are the ultimate measures of our success.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  // State quản lý slide hình ảnh cho Hero Header
  const [currentSlide, setCurrentSlide] = useState(0)

  // State quản lý việc ẩn/hiện thanh tìm kiếm
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Tự động chuyển slide background mỗi 4 giây (4000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.play().catch((error) => {
        console.log('Autoplay bị ngăn chặn bởi trình duyệt:', error)
      })
    }
  }, [])

  return (
    <>
      {/* HERO / HEADER SECTION SLIDER */}
      <section className="relative isolate overflow-hidden bg-stone-950 text-white">
        {/* Render danh sách ảnh background với hiệu ứng transition mượt mà */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 -z-20 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-70' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Slide món ăn ROMS Restaurant ${index + 1}`}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}

        {/* Lớp phủ Gradient mờ tối để chữ hiển thị rõ nét hơn */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/30 to-transparent." />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-stone-950 to-transparent" />

        <div className="mx-auto flex min-h-[660px] max-w-7xl items-center px-6 py-24 sm:px-10 lg:px-16">
          <div className="max-w-2xl">
            <p className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">
              <Sparkles size={16} /> A table full of stories
            </p>
            <h1 className="font-serif text-2xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Delicious food,
              <span className="font-['Dancing_Script'] block text-orange-400 italic">made with love.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-stone-300 sm:text-lg">
            Every dish at ROMS combines fresh ingredients, creative inspiration, and the joy of dining together.            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/table/demo/menu')}
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/60 transition hover:bg-orange-400"
              >
                <UtensilsCrossed size={18} />  Explore Our Menu
              </button>
              <button
                onClick={() => navigate('/reservation')}
                className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                <CalendarDays size={18} /> Book a Table now
              </button>
            </div>

            <div className="mt-14 grid gap-5 border-t border-white/20 pt-6 sm:grid-cols-3">
              {featureItems.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-orange-400/50 text-orange-400">
                    <Icon size={19} />
                  </span>
                  <span>
                    <strong className="block text-sm">{title}</strong>
                    <small className="text-xs text-stone-400">{detail}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nút chỉ số Dots hiển thị vị trí Slide hiện tại */}
        <div className="absolute bottom-6 right-6 z-10 flex gap-2 sm:right-16">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-orange-500' : 'w-2 bg-white/50 hover:bg-white'
              }`}
              aria-label={`Chuyển tới slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="bg-[#fffaf2] px-6 py-20 text-stone-900 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-orange-500">About ROMS Restaurant</p>
            <h2 className="mt-4 max-w-md font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              We serve<span className="text-orange-500 italic"> Happiness.</span>
            </h2>
            <p className="mt-6 max-w-lg leading-7 text-stone-600">
              ROMS is a place where delicious meals bring people closer together. We pay attention to every detail, from flavors to atmosphere, creating memorable moments for you and your loved ones.
            </p>
            <Link
              to="#about"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
            >
              Learn More About Us <ArrowRight size={17} />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <img
              src="../../../public/Home/img7.jpg"
              alt="Không gian ấm cúng tại nhà hàng ROMS"
              className="h-[360px] w-full rounded-[2rem] object-cover shadow-2xl shadow-stone-900/15 sm:h-[420px]"
            />
            <div className="absolute -bottom-7 -left-3 flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-xl sm:-left-10 sm:px-7">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-orange-100 text-orange-500"><ChefHat size={25} /></span>
              <span>
                <strong className="block text-2xl leading-none text-orange-500">10+</strong>
                <small className="mt-1 block text-xs font-semibold text-stone-500">Years of Culinary Excellence</small>
              </span>
            </div>
            <div className="absolute -right-3 top-8 hidden items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold text-white shadow-lg sm:flex">
              <Clock3 size={15} className="text-orange-400" /> Open every day
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR DISHES SECTION */}
      <section className="bg-[#fffaf2] px-6 py-10 text-stone-900 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="font-serif italic text-orange-500 text-lg">Our Menu</p>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              Popular Dishes
            </h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="h-[1px] w-12 bg-orange-400"></span>
              <UtensilsCrossed size={16} className="text-orange-500" />
              <span className="h-[1px] w-12 bg-orange-400"></span>
            </div>
          </div>

          <div className="relative mt-12">
            <button className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 text-stone-700 shadow-md transition hover:bg-orange-500 hover:text-white hidden md:block">
              <ChevronLeft size={20} />
            </button>
            <button className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 text-stone-700 shadow-md transition hover:bg-orange-500 hover:text-white hidden md:block">
              <ChevronRight size={20} />
            </button>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {dish.tag && (
                      <span className="absolute left-3 top-3 rounded-md bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
                        {dish.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-stone-900 text-lg">{dish.name}</h3>

                    <div className="mt-2 flex items-center gap-1.5 text-amber-500">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={15} fill="currentColor" className="text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-stone-600">({dish.rating})</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xl font-bold text-orange-500">{dish.price}</span>
                      <button
                        title="Thêm vào giỏ hàng"
                        className="grid h-10 w-10 place-items-center rounded-full bg-orange-500 text-white shadow-md transition hover:bg-orange-600 active:scale-95"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    {/* OUR SERVICE SECTION */}
      <section className="bg-[#fffaf2] px-6 py-12 text-stone-900 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {/* Tiêu đề phần */}
          <div className="text-center">
            <p className="font-serif italic text-orange-500 text-lg">Our Service</p>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              What we focus on
            </h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="h-[1px] w-12 bg-orange-400"></span>
              <span className="h-2 w-2 rounded-full bg-orange-500"></span>
              <span className="h-[1px] w-12 bg-orange-400"></span>
            </div>
          </div>

          {/* Bố cục chính: Bên trái 4 thẻ (2x2), Bên phải là Hình ảnh */}
          <div className="mt-1 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            
            {/* BÊN TRÁI: Cụm 4 đặc trưng xếp theo lưới 2 hàng x 2 cột */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {services.map((service, index) => {
                const IconComponent = service.icon
                return (
                  <div
                    key={index}
                    className="group flex flex-col items-center text-center p-6 rounded-3xl bg-white text-stone-800 shadow-sm transition-all duration-300 hover:bg-orange-500 hover:text-white hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1"
                  >
                    {/* Khối Icon - Mặc định nền cam nhạt, hover đổi sang nền trắng chữ cam */}
                    <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-orange-100 text-orange-500 transition-colors duration-300 group-hover:bg-white group-hover:text-orange-500">
                      <IconComponent size={28} />
                    </div>

                    {/* Tiêu đề */}
                    <h3 className="text-lg font-bold mb-3 transition-colors duration-300">
                      {service.title}
                    </h3>

                    {/* Mô tả - Mặc định xám, hover chuyển trắng */}
                    <p className="text-sm leading-relaxed text-stone-600 transition-colors duration-300 group-hover:text-orange-50">
                      {service.description}
                    </p>
                  </div>
                )
              })}
            </div>

           {/* BÊN PHẢI: Hình ảnh minh họa */}
            <div className="relative mx-auto flex items-center justify-center w-full">
              <div className="overflow-hidden bg-transparent">
                <img
                  src="../../../public/Home/img6.png"
                  alt="Dịch vụ nhà hàng ROMS"
                  /* Tăng h-[480px] lên h-[580px] hoặc h-[650px] để phóng to ảnh mà vẫn giữ trọn vẹn chi tiết */
                  className="h-[650px] w-full object-contain transition duration-500 hover:scale-105"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

     {/* OPENING HOURS & VIDEO SECTION */}
      <section className="relative overflow-hidden bg-stone-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400"> Opening Hours</p>
              <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
                Restaurant <span className="text-orange-400 italic">Hours</span>
              </h2>
              <p className="mt-4 text-stone-400">
                We are always ready to welcome you with freshly prepared dishes and an exceptional dining experience.
              </p>

              <div className="mt-8 space-y-4 border-t border-stone-800 pt-6">
                <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
                  <span className="font-semibold text-stone-200">Monday - Friday</span>
                  <span className="font-mono text-orange-400">08:00 AM - 10:00 PM</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
                  <span className="font-semibold text-stone-200">Saturday - Sunday</span>
                  <span className="font-mono text-orange-400">07:00 AM - 11:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-200">Public Holidays / Tet</span>
                  <span className="font-semibold text-emerald-400">Open as Usual</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/reservation')}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-orange-400"
              >
                Make a Reservation
              </button>
            </div>

            {/* KHỐI VIDEO TỪ THƯ MỤC CỦA BẠN */}
            <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 shadow-2xl">
              <div className="relative aspect-video w-full overflow-hidden">
                <video
                  controls
                  controlsList="nodownload"
                  poster="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
                  className="h-full w-full object-cover"
                >
                  <source src="../../public/Home/OpenHours.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="p-4 text-center bg-stone-900">
                <p className="text-xs font-medium text-stone-400">Discover the Space & Atmosphere of ROMS Restaurant</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CONTACT FORM & MAP SECTION */}
      <section className="bg-[#f8f5f0] py-8 px-6 sm:px-10 lg:px-16 text-stone-900">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* 1. GET IN TOUCH FORM SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Image (Rectangular without extra card/borders) */}
            <div className="lg:col-span-5">
              <img
                src="/Home/img12.png"
                alt="Lusso Food Box"
                className="w-full h-[380px] object-contain"
              />
            </div>

            {/* Right Form Container */}
            <div className="lg:col-span-7 space-y-6">
              {/* Header Titles */}
              <div className="text-center">
                <p className="font-serif italic text-xl text-amber-800">Contact Us</p>
                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 mt-1">
                  Get In Touch with ROMS
                </h2>
                {/* Decorative Divider */}
                <div className="flex items-center justify-center gap-2 mt-3 opacity-60">
                  <span className="h-[1px] w-8 bg-amber-800"></span>
                  <span className="text-xs text-amber-800">🍂</span>
                  <span className="h-[1px] w-8 bg-amber-800"></span>
                </div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                {/* Top Row: Full Name, Email, Phone (3 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <Users size={16} className="absolute left-3 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-2.5 text-xs text-stone-800 outline-none focus:border-amber-600 transition shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Your email
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={16} className="absolute left-3 text-stone-400" />
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-2.5 text-xs text-stone-800 outline-none focus:border-amber-600 transition shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Your phone
                    </label>
                    <div className="relative flex items-center">
                      <Phone size={16} className="absolute left-3 text-stone-400" />
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-2.5 text-xs text-stone-800 outline-none focus:border-amber-600 transition shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Message & Submit Button */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Message Textarea */}
                  <div className="sm:col-span-7">
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Your message
                    </label>
                    <div className="relative">
                      <MessageSquare size={16} className="absolute left-3 top-3 text-stone-400" />
                      <textarea
                        rows={4}
                        placeholder="Enter your message here"
                        className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-2.5 text-xs text-stone-800 outline-none focus:border-amber-600 transition shadow-sm resize-none"
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="sm:col-span-5 mt-5 sm:mt-5">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#e65100] hover:bg-[#d84300] py-3.5 text-sm font-semibold text-white shadow-md transition flex items-center justify-center gap-2"
                    >
                      Send Message <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Security Note */}
                <div className="flex items-center gap-1.5 text-stone-500 text-xs mt-2">
                  <Lock size={13} />
                  <span>Your information is secure.</span>
                </div>
              </form>
            </div>
          </div>

          {/* 2. GOOGLE MAP SECTION */}
          <div className="overflow-hidden rounded-3xl border border-stone-200 shadow-xl h-[250px] sm:h-[300px] w-full">
            <iframe
              title="ROMS Restaurant Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.802548083818!2d108.2208003!3d16.0648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDAzJzUzLjMiTiAxMDHCsDEzJzE0LjkiRQ!5e0!3m2!1sen!2svn!4v1680000000000!5m2!1sen!2svn"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

        </div>
      </section>

     {/* FOOTER SECTION */}
      <Footer />
    </>
  )
}