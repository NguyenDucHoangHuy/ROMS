import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()
  
  const redirectInfo = location.state as { redirectTo?: string; reservationDraft?: any; message?: string } | null
  const redirectMessage = redirectInfo?.message

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    if (!/^\+?[0-9]{9,15}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
      setErrorMessage('Enter a valid phone number (9–15 digits).')
      return
    }

    if (activeTab === 'register' && formData.password !== formData.confirmPassword) {
      setErrorMessage('The passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      let user;
      if (activeTab === 'login') {
        user = await login({ phone: formData.phone.replace(/[\s()-]/g, ''), password: formData.password })
      } else {
        user = await register({ fullName: formData.fullName.trim(), phone: formData.phone.replace(/[\s()-]/g, ''), password: formData.password })
      }
      
      const requestedRedirect = redirectInfo?.redirectTo
      const draft = redirectInfo?.reservationDraft
      if (requestedRedirect) {
        navigate(requestedRedirect, { replace: true, state: draft })
      } else if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
        navigate('/manager/overview', { replace: true })
      } else if (user?.role === 'CASHIER') {
        navigate('/cashier', { replace: true })
      } else if (user?.role === 'CHEF') {
        navigate('/kitchen', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string | string[] } } })
        .response?.data?.message
      setErrorMessage(Array.isArray(responseMessage) ? responseMessage.join(' ') : responseMessage || 'Unable to authenticate. Please check your details and try again.')
    } finally {
      setIsSubmitting(false)
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
            ✕ Close
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

          {redirectMessage && (
            <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 text-xs font-semibold text-orange-800">
              {redirectMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            {activeTab === 'register' && (
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border-b border-stone-200 py-3 text-stone-800 placeholder-stone-300 focus:border-orange-500 focus:outline-none transition bg-transparent text-sm"
                />
              </div>
            )}

            <div className="relative">
              <input
                  type="tel"
                  name="phone"
                required
                  autoComplete="tel"
                  placeholder="Phone number"
                  value={formData.phone}
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
                  autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
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

            {errorMessage && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

            {/* Submit action */}
            <div className="pt-6 flex items-center justify-between">
              {activeTab === 'login' ? (
                <span />
              ) : (
                <div /> /* Element trống để giữ button luôn ở bên phải khi ở tab Register */
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-36 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-orange-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer"
              >
                {isSubmitting ? 'Please wait…' : activeTab === 'login' ? 'Log in' : 'Register'}
              </button>
            </div>

            {/* Quick Demo Accounts for Development / Testing */}
            {activeTab === 'login' && (
              <div className="mt-8 pt-6 border-t border-stone-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                  Quick Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: '0905222333',
                        password: 'Admin@123',
                      }))
                    }
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-orange-50 hover:border-orange-300 text-stone-700 text-left transition cursor-pointer"
                  >
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Manager
                    </div>
                    <div className="text-[11px] text-stone-500 truncate mt-0.5">Trần Thị Lan</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: '0905123456',
                        password: 'Admin@123',
                      }))
                    }
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-orange-50 hover:border-orange-300 text-stone-700 text-left transition cursor-pointer"
                  >
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Admin
                    </div>
                    <div className="text-[11px] text-stone-500 truncate mt-0.5">System Admin</div>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
