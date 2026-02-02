"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { useLocation, useNavigate, Navigate } from "react-router-dom"
import { toast } from "sonner"

const LoginPage = () => {
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // 🔴 IMPORTANT: get auth state
  const { login, isAuthenticated, isLoading } = useAuth()

  const location = useLocation()
  const navigate = useNavigate()

  // 🔒 BLOCK redirect until auth check finishes
  if (isLoading) return null

  // 🔒 If already logged in, go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const isEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(input)
  }

  const isPhoneNumber = (input) => {
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/
    return phoneRegex.test(input.replace(/\s/g, ""))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.emailOrPhone || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    if (!isEmail(formData.emailOrPhone) && !isPhoneNumber(formData.emailOrPhone)) {
      setError("Please enter a valid email address or phone number")
      return
    }

    setLoading(true)
    setError("")

    const loginData = { password: formData.password }

    if (isEmail(formData.emailOrPhone)) {
      loginData.email = formData.emailOrPhone
    } else {
      loginData.mobile = formData.emailOrPhone
    }

    const result = await login(loginData, rememberMe)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      toast.error("Login failed", {
        description: result.error,
      })
      return
    }

    const displayName =
      result.data?.fullname ||
      result.data?.fullName ||
      result.data?.name ||
      "User";

    toast.success("Login successful!", {
      description: `Welcome back, ${displayName}!`,
    });


    const from = location.state?.from?.pathname || "/dashboard"
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl">
          <div className="relative">
            <div className="absolute top-20 right-1/4 w-32 h-32 bg-blue-500 transform rotate-12 opacity-20"></div>
            <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-blue-400 transform -rotate-12 opacity-15"></div>
            <div className="absolute top-32 left-1/4 w-28 h-28 bg-indigo-400 transform rotate-45 opacity-10"></div>
            <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 rotate-12">
              <h1 className="text-6xl font-bold text-red-500 opacity-30 select-none">VISITOR</h1>
              <h1 className="text-6xl font-bold text-red-500 opacity-30 select-none -mt-4">MANAGEMENT</h1>
              <h1 className="text-6xl font-bold text-red-500 opacity-30 select-none -mt-4">SYSTEM</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="space-y-1">
                  <div className="w-6 h-1 bg-white transform rotate-45"></div>
                  <div className="w-6 h-1 bg-white transform -rotate-45 -mt-2"></div>
                  <div className="w-6 h-1 bg-white transform rotate-45 -mt-1"></div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">NATH ARTS</h2>
            <p className="text-gray-600 mt-1">Visitor Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Mobile No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your email or mobile number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Remember me</label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  LOGIN
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
