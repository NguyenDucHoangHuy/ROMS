import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/stores/cartStore'

/** Public layout cho các trang customer; navbar chuyển thành menu thu gọn ở mobile. */
const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/table/demo/menu' },
  { label: 'About Us', to: '/about' },
  { label: 'Reservation', to: '/reservation' },
]

export default function ClientLayout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  )
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/95 text-stone-900 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" className="flex items-center gap-2.5" aria-label="ROMS Restaurant trang chủ">
            {/* <span className="grid h-10 w-10 place-items-center rounded-xl bg-stone-950 font-serif text-xl font-bold text-orange-400">R</span> */}
              <div className="flex items-center text-orange-500">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 10.58 0A4 4 0 0 1 18 13.87V21H6z" />
                <line x1="6" y1="17" x2="18" y2="17" />
              </svg>
            </div>
            <span className="leading-tight"><strong className="block font-serif text-lg tracking-wide">ROMS</strong><small className="block text-[10px] font-bold uppercase tracking-[0.15em] text-orange-500">Restaurant</small></span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.label} to={item.to} className={({ isActive }) => `text-sm font-semibold transition ${isActive ? 'text-orange-500' : 'text-stone-600 hover:text-orange-500'}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="grid h-10 w-10 place-items-center rounded-full text-stone-700 transition hover:bg-orange-50 hover:text-orange-500" aria-label="Tìm kiếm"><Search size={20} /></button>
            <button onClick={() => navigate('/table/demo/cart')} className="relative grid h-10 w-10 place-items-center rounded-full text-stone-700 transition hover:bg-orange-50 hover:text-orange-500" aria-label="Giỏ hàng"><ShoppingBag size={20} /><span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">{cartItemCount}</span></button>
            {user ? (
              <button className="grid h-10 w-10 place-items-center rounded-full bg-stone-950 text-sm font-bold text-orange-400" title={user.name}>{user.name[0]?.toUpperCase()}</button>
            ) : (
              <button onClick={() => navigate('/login')} className="hidden rounded-full bg-stone-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500 sm:block">Đăng nhập</button>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="grid h-10 w-10 place-items-center rounded-full lg:hidden" aria-label="Mở menu">{isMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
        </div>
        {isMenuOpen && <nav className="border-t border-stone-100 bg-white px-6 py-4 lg:hidden">{navItems.map((item) => <NavLink onClick={() => setIsMenuOpen(false)} key={item.label} to={item.to} className="block py-3 text-sm font-semibold text-stone-700">{item.label}</NavLink>)}</nav>}
      </header>
      {isSearchOpen && <div className="fixed inset-x-0 top-24 z-50 mx-auto max-w-md px-4"><div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-2xl"><Search size={18} className="text-orange-500" /><input autoFocus placeholder="Tìm món bạn yêu thích..." className="w-full outline-none text-sm" /><button onClick={() => setIsSearchOpen(false)} className="text-xs font-semibold text-stone-500">Đóng</button></div></div>}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
