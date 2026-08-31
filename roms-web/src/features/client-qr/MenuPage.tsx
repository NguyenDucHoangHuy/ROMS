import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, Sparkles, SlidersHorizontal } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import Footer from '@/components/Footer'
import type {MenuItem, MenuCategory} from '@/types/menu.types'

interface Feedback {
  id: number
  name: string
  title?: string
  text: string
  rating: number
  dishName?: string
  date?: string
  avatar?: string
  dishImage?: string
}

const mockDishes: MenuItem[] = [
  {
    id: '1',
    name: 'Barbecue Sauce Ribs',
    description: 'Slow-Grilled BBQ Ribs with authentic Italian taste',
    price: 19.23,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    avgRating: 4.8,
    categoryId: 'Main',
    category: {
      id: 'Main',
      name: 'Main',
      description: null,
      imageUrl: null,
      sortOrder: 1,
      isActive: true,
    },
    isAvailable: true,
    preparationTime: 20,
    tags: ['24% OFF'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Brief Pizza Margherita',
    description: 'Cheesy Pizza with aromatic fresh thyme',
    price: 15.50,
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    avgRating: 4.9,
    categoryId: 'Main',
    category: {
      id: 'Main',
      name: 'Main',
      description: null,
      imageUrl: null,
      sortOrder: 1,
      isActive: true,
    },
    isAvailable: true,
    preparationTime: 15,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
   id: '3',
    name: 'Fresh Sea Foods Soup',
    description: 'Fresh Sea Foods Soup with a spicy and refreshing taste',
    price: 18.00,
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    avgRating: 4.7,
    categoryId: 'Appetizer',
    category: {
      id: 'Appetizer',
      name: 'Appetizer',
      description: null,
      imageUrl: null,
      sortOrder: 0,
      isActive: true,
    },
    isAvailable: true,
    preparationTime: 10,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
   id: '4',
    name: 'Sashimi Salmon Fish',
    description: 'Fresh Salmon Sashimi prepared in traditional Japanese style',
    price: 22.00,
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    avgRating: 4.9,
    categoryId: 'Appetizer',
    category: {
      id: 'Appetizer',
      name: 'Appetizer',
      description: null,
      imageUrl: null,
      sortOrder: 0,
      isActive: true,
    },
    isAvailable: true,
    preparationTime: 10,
    tags: ['Popular'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
   id: '5',
    name: 'Chicken Creamy Pasta',
    description: 'Cheesy Pasta with creamy chicken and mushrooms',
    price: 16.80,
    imageUrl: 'https://www.loveandoliveoil.com/wp-content/uploads/2023/01/garlic-chicken-pasta-7.jpg',
    avgRating: 4.8,
    categoryId: 'Main',
    category: {
      id: 'Main',
      name: 'Main',
      description: null,
      imageUrl: null,
      sortOrder: 1,
      isActive: true,
    },
    isAvailable: true,
    preparationTime: 15,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
   id: '6',
    name: 'Valrhona Chocolate Dome',
    description: 'Molten dark chocolate Cake with strawberry ream',
    price: 12.00,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    avgRating: 4.7,
    categoryId: 'Desert',
    category: {
      id: 'Desert',
      name: 'Desert',
      description: null,
      imageUrl: null,
      sortOrder: 2,
      isActive: true,
    },
    isAvailable: true,
    preparationTime: 12,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Tropical Cocktail Drink',
    description: 'Cool tropical juice made from fresh fruits',
    price: 8.50,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    avgRating: 4.6,
    categoryId: 'Drink',
    category: {
      id: 'Drink',
      name: 'Drink',
      description: null,
      imageUrl: null,
      sortOrder: 3,
      isActive: true,
    },
    isAvailable: true,
    preparationTime: 5,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const feedbacks: Feedback[] = [
  {
    id: 1,
    name: 'Paul K. Selden',
    title: 'Food Critic',
    dishName: 'Barbecue Sauce Ribs',
    date: '20/08/2026',
    text: 'Tellus ultrices egestas justo duis. Leo sit quam ultrices turpis libero facilisis faucibus. Nulla elementum sed senectus nunc dolor augue.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 2,
    name: 'Sarah M. Jenkins',
    title: 'Regular Customer',
    dishName: 'Chicken Creamy Pasta',
    date: '18/08/2026',
    text: 'Chất lượng món ăn vô cùng tuyệt vời, dịch vụ chu đáo và không gian nhà hàng tạo cảm giác vô cùng ấm cúng tuyệt hảo!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
]

export default function MenuPage() {
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)

  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [maxPrice, setMaxPrice] = useState<number>(30)
  const [selectedTag, setSelectedTag] = useState<string>('')

  const categories = ['All', 'Appetizer', 'Main', 'Desert', 'Drink']
  const popularTags = ['Barbecue', 'Beef Burger', 'Beef Pizza', 'Sea Foods', 'Drinks']

  // Lọc danh sách món ăn
  const filteredDishes = useMemo(() => {
    return mockDishes.filter((dish) => {
      const matchCategory = selectedCategory === 'All' || dish.category.name === selectedCategory
      const matchPrice = dish.price <= maxPrice
      const matchTag =
        !selectedTag ||
        dish.name.toLowerCase().includes(selectedTag.toLowerCase()) ||
        dish.category.name.toLowerCase().includes(selectedTag.toLowerCase())
      return matchCategory && matchPrice && matchTag
    })
  }, [selectedCategory, maxPrice, selectedTag])

  const recommendations = mockDishes.slice(0, 3)

  return (
    <div className="bg-[#fffaf2] min-h-screen text-stone-900">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden bg-stone-950 py-36 text-center text-white">
        {/* Ảnh nền */}
        <img
          src="/Home/header7.jpg"
          alt="Restaurant Banner"
          className="absolute inset-0 h-full w-full object-cover opacity-100"
        />
        {/* Lớp phủ dải màu mờ tạo chiều sâu */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/60" />

        {/* Nội dung chính */}
        <div className="relative z-10 mx-auto max-w-xl px-4">
          <h1 className="font-serif text-4xl font-bold tracking-wide sm:text-5xl drop-shadow-md">
            Food Menu
          </h1>
          <p className="mt-3 text-sm font-medium text-orange-400 sm:text-base drop-shadow">
            Experience the unique and creative flavors from ROMS
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        {/* RECOMMENDED SECTION */}
        <div className="mb-12 rounded-3xl border border-orange-200 bg-orange-500/5 p-6 sm:p-8 backdrop-blur">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-orange-500 fill-orange-500" size={22} />
            <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">Recommended Dishes for You</h2>
            <span className="ml-2 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">AI Recommend</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((dish) => (
              <div
                key={`rec-${dish.id}`}
                onClick={() => navigate(`/dish/${dish.id}`)}
                className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md transition cursor-pointer border border-stone-100"
              >
                <img src={dish.imageUrl || '/Home/default-dish.jpg'} alt={dish.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-stone-900 truncate">{dish.name}</h4>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">{dish.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-orange-500">${dish.price.toFixed(2)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addItem(dish) 
                      }}
                      className="rounded-full bg-orange-500 p-1.5 text-white hover:bg-orange-600 active:scale-95 transition"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN MENU CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT SIDEBAR */}
          <div className="space-y-6">
            {/* CATEGORIES */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
              <h3 className="font-bold text-base text-stone-900 mb-4 border-b border-stone-100 pb-3">Danh Mục (Categories)</h3>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      selectedCategory === cat
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'text-stone-600 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-xs opacity-75">
                      ({cat === 'All' ? mockDishes.length : mockDishes.filter((d) => d.category.name === cat).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE FILTER */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
              <h3 className="font-bold text-base text-stone-900 mb-4 border-b border-stone-100 pb-3 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-orange-500" />
                Price Filter
              </h3>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-stone-600">$5 - ${maxPrice}</span>
                <button
                  onClick={() => setMaxPrice(50)}
                  className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* FOODS COLLECTIONS BANNER */}
            <div className="relative overflow-hidden rounded-2xl bg-stone-950 p-6 text-white shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
                alt="Foods Collection"
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              />
              <div className="relative z-10">
                <span className="text-xs uppercase tracking-widest text-orange-400 font-bold">Special Offer</span>
                <h4 className="mt-2 font-serif text-2xl font-bold">Foods Collections</h4>
                <p className="mt-2 text-xs text-stone-300">Get up to 30% off family party combo packages.</p>
              </div>
            </div>

            {/* POPULAR TAGS */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
              <h3 className="font-bold text-base text-stone-900 mb-4 border-b border-stone-100 pb-3">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selectedTag === tag
                        ? 'bg-orange-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-orange-100 hover:text-orange-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT DISHES GRID */}
          <div className="lg:col-span-3">
            {filteredDishes.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center text-stone-500">
                No dishes match your selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => navigate(`/dish/${dish.id}`)}
                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-stone-100 cursor-pointer"
                  >
                    {/* Ảnh món ăn */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={dish.imageUrl || '/Home/default-dish.jpg'}
                        alt={dish.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      {dish.tags && (
                        <span className="absolute left-3 top-3 rounded-md bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                          {dish.tags[0]}
                        </span>
                      )}
                    </div>

                    {/* Thông tin món ăn */}
                    <div className="p-4 pb-2">
                      <h3 className="font-bold text-stone-900 text-lg group-hover:text-orange-500 transition">
                        {dish.name}
                      </h3>
                      <p className="mt-1 text-xs text-stone-500 line-clamp-2">{dish.description}</p>

                      <div className="mt-2.5 flex items-center gap-1.5">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < Math.floor(dish.avgRating || 0) ? 'currentColor' : 'none'}
                              className={i < Math.floor(dish.avgRating || 0) ? 'text-amber-400' : 'text-stone-300'}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-stone-600">({dish.avgRating?.toFixed(1)})</span>
                      </div>
                    </div>

                    {/* Phần Giá & Giỏ hàng */}
                    <div className="px-4 pb-3 pt-2 flex items-center justify-between border-t border-stone-100 mt-2">
                      <span className="text-xl font-bold text-orange-500">${dish.price.toFixed(2)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addItem(dish)
                        }}
                        className="grid h-10 w-10 place-items-center rounded-full bg-orange-500 text-white shadow-md hover:bg-orange-600 active:scale-95 transition"
                        title="Add to Cart"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CUSTOMER FEEDBACKS SECTION */}
        <div className="mt-24 rounded-3xl bg-stone-100 p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl text-stone-900">
              Our Customer <span className="text-orange-500">Feedbacks</span>
            </h2>
            <p className="mt-2 text-xs text-stone-500">
              Every review reflects our commitment to delivering outstanding cuisine, attentive service, and unforgettable dining experiences.            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="relative rounded-2xl bg-white p-6 shadow-sm border border-stone-200/60 flex flex-col justify-between">
                <div>
                  {/* 1. TOP: Avatar, Tên khách hàng & Ngày giờ */}
                  <div className="flex items-center gap-3 mb-2 pb-1 border-b border-stone-100">
                    <img
                      src={fb.avatar || fb.dishImage}
                      alt={fb.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-orange-500"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">{fb.name}</h4>
                      <span className="text-[11px] text-stone-400 block">{fb.date || '10/08/2026'}</span>
                    </div>
                  </div>

                  {/* 2. MIDDLE: Tên món ăn & Đánh giá sao */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                      {fb.dishName || fb.title || 'Món ăn'}
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(fb.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  {/* 3. BOTTOM: Nội dung feedback */}
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
                    "{fb.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <Footer />
    </div>
  )
}