import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (activeTab === 'login') {
      await login({ email: formData.email, password: formData.password })
      navigate('/')
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!')
        return
      }
      alert('Đăng ký thành công! Vui lòng đăng nhập.')
      setActiveTab('login')
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-stone-50">
      {/* ── BÊN TRÁI: Ảnh nền ẩm thực & Logo Floating ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 items-center justify-center p-12 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
          alt="Delicious Culinary"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* ── BÊN PHẢI: Form Đăng nhập / Đăng ký ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-8 py-6 sm:px-12 sm:py-8 lg:px-16 lg:py-8 bg-white">
        <div className="flex justify-end">
          <Link
            to="/"
            className="text-stone-400 hover:text-stone-600 transition text-sm font-medium"
          >
            ✕ Đóng
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto mt-8 mb-auto space-y-8">
          {/* Toggle Switch */}
          <div className="flex justify-end gap-2 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`px-5 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/20'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`px-5 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/20'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Registration
            </button>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-stone-800 tracking-tight">
              Welcome to ROMS
            </h1>
            <p className="text-stone-400 text-sm mt-2">
              Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            {activeTab === 'register' && (
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="User Name"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border-b border-stone-200 py-3 text-stone-800 placeholder-stone-300 focus:border-orange-500 focus:outline-none transition bg-transparent text-sm"
                />
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-b border-stone-200 py-3 text-stone-800 placeholder-stone-300 focus:border-orange-500 focus:outline-none transition bg-transparent text-sm"
              />
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-b border-stone-200 py-3 text-stone-800 placeholder-stone-300 focus:border-orange-500 focus:outline-none transition bg-transparent text-sm"
              />
            </div>

            {activeTab === 'register' && (
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border-b border-stone-200 py-3 text-stone-800 placeholder-stone-300 focus:border-orange-500 focus:outline-none transition bg-transparent text-sm"
                />
              </div>
            )}

            {/* ── Hàng dưới cùng: Forgot password bên trái & Button Log in bên phải ── */}
            <div className="pt-6 flex items-center justify-between">
              {activeTab === 'login' ? (
                <a
                  href="#forgot"
                  className="text-xs text-stone-400 hover:text-orange-500 transition"
                >
                  Forgot password?
                </a>
              ) : (
                <div /> /* Element trống để giữ button luôn ở bên phải khi ở tab Register */
              )}

              <button
                type="submit"
                className="w-full sm:w-36 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-orange-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
              >
                {activeTab === 'login' ? 'Log in' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}