import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, Search, ShoppingBag, X, LogOut, LayoutDashboard, User as UserIcon, Loader2, CalendarDays } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/stores/cartStore'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ClientLocaleProvider, useClientLocale } from '@/contexts/ClientLocaleContext'

/** Public layout cho các trang customer; navbar chuyển thành menu thu gọn ở mobile. */
export default function ClientLayout() {
  return (
    <ClientLocaleProvider>
      <ClientLayoutInner />
    </ClientLocaleProvider>
  )
}

function ClientLayoutInner() {
  const { locale, toggleLocale } = useClientLocale()
  const navItems = [
    { label: locale === 'en' ? 'Home' : 'Trang chủ', to: '/' },
    { label: locale === 'en' ? 'Menu' : 'Thực đơn', to: '/menu' },
    { label: locale === 'en' ? 'About Us' : 'Về chúng tôi', to: '/about' },
    { label: locale === 'en' ? 'Reservation' : 'Đặt bàn', to: '/reservation' },
  ]
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  )
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutConfirm(false)
      navigate('/')
    }
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchTerm.trim()
    if (!query) return
    navigate(`/menu?search=${encodeURIComponent(query)}`)
    setIsSearchOpen(false)
  }

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
            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              title={locale === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
              className="hidden sm:flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 shadow-sm hover:border-orange-400 hover:text-orange-500 transition select-none"
            >
              <span className={locale === 'en' ? 'text-orange-500' : 'text-stone-400'}>EN</span>
              <span className="text-stone-300">|</span>
              <span className={locale === 'vi' ? 'text-orange-500' : 'text-stone-400'}>VI</span>
            </button>
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="grid h-10 w-10 place-items-center rounded-full text-stone-700 transition hover:bg-orange-50 hover:text-orange-500" aria-label="Tìm kiếm"><Search size={20} /></button>
            <button onClick={() => navigate('/table/demo/cart')} className="relative grid h-10 w-10 place-items-center rounded-full text-stone-700 transition hover:bg-orange-50 hover:text-orange-500" aria-label="Giỏ hàng"><ShoppingBag size={20} /><span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">{cartItemCount}</span></button>
            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="grid h-10 w-10 place-items-center rounded-full bg-stone-950 text-sm font-bold text-orange-400 hover:bg-stone-800 transition" title={user.fullName}>
                    {user.fullName?.[0]?.toUpperCase()}
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="z-50 min-w-[200px] overflow-hidden rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95">
                    <div className="px-2 py-2.5 border-b border-stone-100 mb-1">
                      <p className="text-sm font-bold text-stone-800">{user.fullName}</p>
                      <p className="text-xs font-medium text-stone-500">{user.phone}</p>
                    </div>
                    
                    {['ADMIN', 'MANAGER', 'CHEF', 'CASHIER'].includes(user.role) && (
                      <DropdownMenu.Item className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold text-stone-700 outline-none hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-50 focus:text-orange-600" onClick={() => {
                        if (user.role === 'ADMIN' || user.role === 'MANAGER') navigate('/manager/overview')
                        else if (user.role === 'CHEF') navigate('/kitchen')
                        else if (user.role === 'CASHIER') navigate('/cashier')
                      }}>
                        <LayoutDashboard size={16} /> Go to Dashboard
                      </DropdownMenu.Item>
                    )}
                    
                    <DropdownMenu.Item
                      className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold text-stone-700 outline-none hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-50 focus:text-orange-600"
                      onClick={() => navigate('/my-reservations')}
                    >
                      <CalendarDays size={16} /> {locale === 'en' ? 'My Reservations' : 'Đơn đặt bàn của tôi'}
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold text-stone-700 outline-none hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-50 focus:text-orange-600"
                      onClick={() => navigate('/profile')}
                    >
                      <UserIcon size={16} /> {locale === 'en' ? 'My Profile' : 'Hồ sơ cá nhân'}
                    </DropdownMenu.Item>
                    
                    <DropdownMenu.Item
                      className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold text-red-600 outline-none hover:bg-red-50 focus:bg-red-50 mt-1 border-t border-stone-100"
                      onClick={() => setShowLogoutConfirm(true)}
                    >
                      <LogOut size={16} /> Log Out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <button onClick={() => navigate('/login')} className="hidden rounded-full bg-stone-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500 sm:block">{locale === 'en' ? 'Log In' : 'Đăng nhập'}</button>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="grid h-10 w-10 place-items-center rounded-full lg:hidden" aria-label="Mở menu">{isMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
        </div>
        {isMenuOpen && (
          <nav className="border-t border-stone-100 bg-white px-6 py-4 lg:hidden">
            {navItems.map((item) => (
              <NavLink onClick={() => setIsMenuOpen(false)} key={item.to} to={item.to} className="block py-3 text-sm font-semibold text-stone-700">
                {item.label}
              </NavLink>
            ))}
            {/* Mobile language toggle */}
            <button
              onClick={toggleLocale}
              className="mt-2 flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-bold text-stone-700"
            >
              <span className={locale === 'en' ? 'text-orange-500' : 'text-stone-400'}>EN</span>
              <span className="text-stone-300">|</span>
              <span className={locale === 'vi' ? 'text-orange-500' : 'text-stone-400'}>VI</span>
            </button>
          </nav>
        )}
      </header>
      {isSearchOpen && <div className="fixed inset-x-0 top-24 z-50 mx-auto max-w-md px-4"><form onSubmit={handleSearch} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-2xl"><Search size={18} className="text-orange-500" /><input autoFocus value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search dishes and categories" className="w-full outline-none text-sm" /><button type="submit" className="text-xs font-semibold text-orange-600">Search</button><button type="button" onClick={() => setIsSearchOpen(false)} className="text-xs font-semibold text-stone-500">Close</button></form></div>}
      <main>
        <Outlet />
      </main>

      {/* ── Client Logout Confirmation Modal ── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 flex-shrink-0 mt-0.5">
                <LogOut size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-stone-900 tracking-tight">
                  Sign Out Confirmation
                </h3>
                <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                  Are you sure you want to sign out? You will be redirected to the home page as a guest.
                </p>

                {user && (
                  <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                      {(user.fullName || user.name)?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        {user.fullName || user.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {user.phone || user.email || user.role}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-100 text-sm font-semibold text-stone-700 hover:bg-stone-200 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
