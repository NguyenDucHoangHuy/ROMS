import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, Plus, Minus, ArrowLeft, Heart, Share2 } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { menuService } from '@/services/modules/menuService'
import { queryKeys } from '@/constants/queryKeys'

export default function DishDetail() {
  const { dishId } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)
  const { data: dish, isLoading, isError } = useQuery({
    queryKey: queryKeys.menu.byId(dishId ?? ''),
    queryFn: () => menuService.getById(dishId!),
    enabled: Boolean(dishId),
  })
  const { data: menuItems = [] } = useQuery({
    queryKey: queryKeys.menu.all(),
    queryFn: menuService.getAll,
  })

  if (isLoading) return <div className="min-h-screen bg-[#fffaf2] p-12 text-center text-stone-500">Loading dish…</div>
  if (isError || !dish) return (
    <div className="min-h-screen bg-[#fffaf2] p-12 text-center text-stone-600">
      <p>Unable to load this dish.</p>
      <button onClick={() => navigate('/menu')} className="mt-4 font-semibold text-orange-600">Back to Menu</button>
    </div>
  )

  const relatedDishes = menuItems.filter((item) => item.categoryId === dish.categoryId && item.id !== dish.id).slice(0, 4)
  const canOrder = dish.isAvailable && !dish.isLowStock
  const handleAddToCart = () => addItem(dish, quantity)

  return (
    <div className="min-h-screen bg-[#fffaf2] py-12 text-stone-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-orange-500">
          <ArrowLeft size={18} /> Back to Menu
        </button>
        <div className="grid grid-cols-1 gap-12 rounded-3xl border border-stone-100 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl">
            <img src={dish.imageUrl || '/Home/default-dish.jpg'} alt={dish.name} className="h-[380px] w-full object-cover sm:h-[450px]" />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">{dish.category.name}</span>
                <div className="flex items-center gap-3 text-stone-400">
                  <button aria-label="Add to favorites" className="hover:text-orange-500"><Heart size={20} /></button>
                  <button aria-label="Share dish" className="hover:text-orange-500"><Share2 size={20} /></button>
                </div>
              </div>
              <h1 className="mt-6 font-serif text-3xl font-bold sm:text-4xl">{dish.name}</h1>
              <div className="mt-4 text-3xl font-bold text-orange-500">${dish.price.toFixed(2)}</div>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">{dish.description || 'No description available.'}</p>
              {!!dish.recipes?.length && (
                <div className="mt-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Ingredients</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dish.recipes.map((recipe) => <span key={recipe.id} className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">{recipe.itemName}</span>)}
                  </div>
                </div>
              )}
              {!canOrder && <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">This dish is currently unavailable.</p>}
            </div>
            <div className="mt-8 space-y-4 border-t border-stone-100 pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1">
                  <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded-lg p-2 text-stone-600 hover:bg-white"><Minus size={16} /></button>
                  <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                  <button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="rounded-lg p-2 text-stone-600 hover:bg-white"><Plus size={16} /></button>
                </div>
                <button disabled={!canOrder} onClick={handleAddToCart} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white shadow-lg hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300">
                  <ShoppingCart size={18} /> Add to Cart (${(dish.price * quantity).toFixed(2)})
                </button>
              </div>
            </div>
          </div>
        </div>
        {relatedDishes.length > 0 && <section className="mt-16">
          <h2 className="mb-6 font-serif text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedDishes.map((related) => <button key={related.id} onClick={() => navigate(`/dish/${related.id}`)} className="rounded-2xl border border-stone-100 bg-white p-4 text-left shadow-sm hover:shadow-md">
              <img src={related.imageUrl || '/Home/default-dish.jpg'} alt={related.name} className="h-40 w-full rounded-xl object-cover" />
              <h3 className="mt-3 text-sm font-bold">{related.name}</h3>
              <span className="mt-2 block text-sm font-bold text-orange-500">${related.price.toFixed(2)}</span>
            </button>)}
          </div>
        </section>}
      </div>
    </div>
  )
}
