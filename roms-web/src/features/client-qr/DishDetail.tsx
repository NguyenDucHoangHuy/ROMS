import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, Plus, Minus, ArrowLeft, Heart, Share2 } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import type { MenuItem } from '@/types/menu.types'

const mockDishDetails: MenuItem & { ingredients: string[]; reviewsCount: number } = {
  id: '1',
  name: 'Barbecue Sauce Ribs',
  description: 'A full rack of pork ribs marinated in a rich BBQ sauce and blended with Italian herbs, served with crispy French fries and a fresh garden salad.',
  price: 19.23,
  imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
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
  preparationTime: 20,
  tags: ['24% OFF'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  reviewsCount: 128,
  ingredients: ['Imported pork ribs', 'Traditional BBQ sauce', 'Cherry tomatoes', 'Italian potatoes', 'Thyme'],
}

const relatedDishes = [
  {
    id: '2',
    name: 'Brief Pizza Margherita',
    category: 'Main',
    price: 15.50,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '5',
    name: 'Chicken Creamy Pasta',
    category: 'Main',
    price: 16.80,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281288?auto=format&fit=crop&w=600&q=80',
  },
]

export default function DishDetail() {
  const { dishId } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)

  // Giữ thông tin món ăn hiện tại
  const currentDish = useMemo(() => {
    return mockDishDetails
  }, [dishId])

  const handleAddToCart = () => {
    // Thêm món ăn vào giỏ với số lượng đã chọn
    for (let i = 0; i < quantity; i++) {
      addItem(currentDish)
    }
  }

  return (
    <div className="bg-[#fffaf2] min-h-screen py-12 text-stone-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-orange-500 transition"
        >
          <ArrowLeft size={18} /> Back to Menu
        </button>

        {/* MAIN DETAIL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-100">
          {/* IMAGE GALLERY */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl h-[380px] sm:h-[450px]">
              <img
                src={currentDish.imageUrl || '/Home/default-dish.jpg'}
                alt={currentDish.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* DISH INFO */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                  {currentDish.category.name}
                </span>
                <div className="flex items-center gap-3 text-stone-400">
                  <button className="hover:text-orange-500 transition"><Heart size={20} /></button>
                  <button className="hover:text-orange-500 transition"><Share2 size={20} /></button>
                </div>
              </div>

              <h1 className="mt-4 font-serif text-3xl font-bold sm:text-4xl text-stone-900">{currentDish.name}</h1>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(currentDish.avgRating || 0) ? 'currentColor' : 'none'}
                      className={i < Math.floor(currentDish.avgRating || 0) ? 'text-amber-400' : 'text-stone-300'}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-600">
                  {currentDish.avgRating?.toFixed(1)} ({currentDish.reviewsCount} reviews)
                </span>
              </div>

              <div className="mt-6 text-3xl font-bold text-orange-500">${currentDish.price.toFixed(2)}</div>

              <p className="mt-4 text-sm leading-relaxed text-stone-600">{currentDish.description}</p>

              {/* INGREDIENTS */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Main ingredients</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentDish.ingredients.map((ing) => (
                    <span key={ing} className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 pt-6 border-t border-stone-100 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-white rounded-lg text-stone-600 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-white rounded-lg text-stone-600 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 px-6 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition"
                >
                  <ShoppingCart size={18} />
                  Add to Cart (${(currentDish.price * quantity).toFixed(2)})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED DISHES SECTION */}
        <div className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-stone-900 mb-6">You may also like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedDishes.map((dish) => (
              <div
                key={dish.id}
                onClick={() => navigate(`/dish/${dish.id}`)}
                className="overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-stone-100 cursor-pointer hover:shadow-md transition"
              >
                <img src={dish.image} alt={dish.name} className="h-40 w-full rounded-xl object-cover" />
                <h4 className="mt-3 font-bold text-stone-900 text-sm">{dish.name}</h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-bold text-orange-500 text-sm">${dish.price.toFixed(2)}</span>
                  <span className="text-xs text-amber-500 font-bold">★ {dish.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}