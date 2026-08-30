import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Send, UtensilsCrossed, Calendar, MessageSquare, MapPin } from 'lucide-react'
import Footer from '@/components/Footer'

// Data for Trending Slider
const trendingItems = [
  {
    id: 1,
    tag: 'RESTAURANT',
    title: 'NEVER EAT MORE THAN YOU CAN LIVE.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    tag: 'BAR & LOUNGE',
    title: 'CRAFT COCKTAILS & FINE SPIRITS',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    tag: 'DESSERTS',
    title: 'SWEET TREATS FOR EVERY MOMENT',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    tag: 'BAKERY',
    title: 'FRESHLY BAKED ARTISAN BREAD',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  },
]

export default function AboutUsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Slider controls (slides by 1 item, displaying 2 visible at a time)
  const maxIndex = trendingItems.length - 2

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans overflow-hidden">
      {/* 1. HERO HEADER SECTION */}
      <section className="relative bg-stone-900 py-24 text-white">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
            alt="Restaurant Header"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 text-center space-y-4">
          <span className="text-sm font-bold uppercase tracking-widest text-amber-400">Welcome To ROMS</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold">About Our Restaurant</h1>
          <p className="mx-auto max-w-2xl text-stone-300 text-sm sm:text-base leading-relaxed">
            Discover our passion for authentic culinary experiences, fresh local ingredients, and unforgettable dining moments in Da Nang.
          </p>
        </div>
      </section>

      {/* 2. ABOUT RESTAURANT SECTION (Image 1) */}
      <section className="py-10 bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Dish Feature Image - Chiếm 5 cột */}
          <div className="lg:col-span-5 relative flex justify-center">
            <img
              src="/Home/img10.png"
              alt="Seafood Fried Rice"
              className="w-full max-w-[260px] sm:max-w-[280px] lg:max-w-[450px] h-auto object-contain aspect-square"
            />
          </div>

          {/* Content - Chiếm 7 cột */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-serif text-3xl font-bold text-amber-500 italic">About restaurant</h3>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
              Health and safety, along with quality, are the cornerstones of our brand
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              Welcome to Savory, where culinary passion meets exceptional service. Nestled in the heart of Da Nang, we offer a diverse menu inspired by both local flavors and international cuisine. Our talented chefs use only the freshest ingredients to create dishes that delight the senses.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
                <UtensilsCrossed size={18} className="text-amber-500" /> Food Items management
              </div>
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
                <Calendar size={18} className="text-amber-500" /> Table reservation
              </div>
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
                <MessageSquare size={18} className="text-amber-500" /> Customer feedback portal
              </div>
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
                <MapPin size={18} className="text-amber-500" /> Location-based services
              </div>
            </div>

            <button className="mt-4 rounded-xl bg-amber-400 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-900 shadow-md hover:bg-amber-500 transition">
              See Details
            </button>
          </div>

        </div>
      </section>

      {/* 3. OUR STORY SECTION (Image 3) */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image Collage Left */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="/Home/img7.jpg"
                alt="Pasta"
                className="w-full h-48 sm:h-56 object-cover rounded-3xl shadow-sm"
              />
              <img
                src="/Home/sushi.jpg"
                alt="Dining Experience"
                className="w-full h-48 sm:h-56 object-cover rounded-3xl shadow-sm"
              />
            </div>
            <div className="flex items-center">
              <img
                src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80"
                alt="Crispy Chicken"
                className="w-full h-80 sm:h-96 object-cover rounded-3xl shadow-md"
              />
            </div>
          </div>

          {/* Story Content Right */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            <div className="inline-block border-b-2 border-amber-400 pb-1">
              <span className="font-serif text-2xl text-amber-500 italic">Discover</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900">Our Story</h2>
            <h3 className="text-lg font-bold text-stone-800">
              Proud of our start in the restaurant business
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed max-w-xl">
              Welcome to ROMS, where flavor takes center stage. Our menu features exquisite dishes made from fresh, local ingredients. Enjoy a cozy atmosphere and unforgettable dining experiences. Join us and savor the joy of great food!
            </p>
            <button className="rounded-full bg-amber-300 px-8 py-3 text-xs font-bold uppercase tracking-widest text-stone-900 shadow-md hover:bg-amber-400 transition">
              About Us
            </button>
          </div>
        </div>
      </section>

      {/* 4. OUR TRENDING SLIDER SECTION (Image 2 - 2 Images with Slide effect) */}
      <section className="py-20 bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Header & Controls Left */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-8 bg-amber-500"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Our Trending</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-wide text-stone-900">
              Fresh & Better Foods For You
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed">
              Explore our most popular culinary creations and signature drinks carefully crafted by master chefs to fulfill your taste buds.
            </p>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrev}
                className="grid h-12 w-12 place-items-center rounded-full border border-stone-300 bg-white text-stone-700 hover:border-amber-500 hover:bg-amber-500 hover:text-white transition shadow-sm"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="grid h-12 w-12 place-items-center rounded-full border border-stone-300 bg-white text-stone-700 hover:border-amber-500 hover:bg-amber-500 hover:text-white transition shadow-sm"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Carousel Viewport Right (Displays 2 Items) */}
          <div className="lg:col-span-8 overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentIndex * 50}%)` }}
            >
              {trendingItems.map((item) => (
                <div
                  key={item.id}
                  className="w-1/2 flex-shrink-0 relative h-96 rounded-3xl overflow-hidden shadow-lg group"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Tag Header */}
                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-900">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title Footer */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white font-bold text-sm sm:text-base leading-snug uppercase tracking-wide">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. SPECIAL HIGHLIGHT DISH SECTION (Image 4) */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl border border-stone-100 grid grid-cols-1 md:grid-cols-12">
            {/* Image Left */}
            <div className="md:col-span-7 relative min-h-[300px] md:min-h-full">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"
                alt="Ossetian pie with meat"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Content Right */}
            <div className="md:col-span-5 p-8 sm:p-10 flex flex-col justify-center space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Ossetian pie with meat</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Ossetian pies — the theme is delicious, crafted with traditionally seasoned beef wrapped in fragrant baked dough, creating a flavor explosion you cannot resist.
              </p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Fresh pastries filled with selected spices are guaranteed to replace your full lunch or dinner with delight.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-800 bg-stone-50">
                  <UtensilsCrossed size={14} className="text-amber-500" /> $18.50 / Large Size Pie
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FOOTER SECTION */}
      <Footer />
    </div>
  )
}