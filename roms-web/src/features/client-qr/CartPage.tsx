import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem } = useCartStore()

  const subtotal = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  const tax = subtotal * 0.08

  return (
    <div className="bg-[#fffaf2] min-h-screen py-12 text-stone-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingBag className="text-orange-500" /> Your cart
        </h1>

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-stone-100">
            <Utensils className="mx-auto text-stone-300 mb-4" size={48} />
            <p className="text-stone-500 font-medium">Your cart is currently empty.</p>
            <button
              onClick={() => navigate('/table/demo/menu')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-bold text-white shadow-md hover:bg-orange-600 transition"
            >
              Explore the menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ITEM LIST */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-stone-100 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img src={item.menuItem.imageUrl || ''} alt={item.menuItem.name} className="h-20 w-20 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">{item.menuItem.name}</h3>
                      <p className="text-sm font-semibold text-orange-500 mt-1">${item.menuItem.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-white rounded-md text-stone-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white rounded-md text-stone-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="font-bold text-stone-900 text-sm hidden sm:block">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      onClick={() => removeItem(item.menuItem.id)}
                      className="text-stone-400 hover:text-red-500 transition p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-stone-100 h-fit space-y-6">
              <h2 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-4">Order summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-stone-900">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between text-base font-bold text-stone-900">
                  <span>Total</span>
                  <span className="text-orange-500">${(subtotal + tax).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/reservation')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition"
              >
                Proceed to Checkout<ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}