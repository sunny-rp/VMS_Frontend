"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Eye, EyeOff, LogIn } from "lucide-react"

const LoginPage = () => {
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.mobile || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    const result = await login(formData, rememberMe)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background illustration area */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl">
          {/* Isometric illustration placeholder - matching the screenshot style */}
          <div className="relative">
            {/* Main building blocks */}
            <div className="absolute top-20 right-1/4 w-32 h-32 bg-blue-500 transform rotate-12 opacity-20"></div>
            <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-blue-400 transform -rotate-12 opacity-15"></div>
            <div className="absolute top-32 left-1/4 w-28 h-28 bg-indigo-400 transform rotate-45 opacity-10"></div>

            {/* Visitor Management System text */}
            <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 rotate-12">
              <h1 className="text-6xl font-bold text-red-500 opacity-30 select-none">VISITOR</h1>
              <h1 className="text-6xl font-bold text-red-500 opacity-30 select-none -mt-4">MANAGEMENT</h1>
              <h1 className="text-6xl font-bold text-red-500 opacity-30 select-none -mt-4">SYSTEM</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {/* SHUFAB logo placeholder - matching the diagonal lines from screenshot */}
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="space-y-1">
                  <div className="w-6 h-1 bg-white transform rotate-45"></div>
                  <div className="w-6 h-1 bg-white transform -rotate-45 -mt-2"></div>
                  <div className="w-6 h-1 bg-white transform rotate-45 -mt-1"></div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">SHUFAB</h2>
            <p className="text-gray-600 mt-1">Visitor Management System</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mobile Number field */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile No <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your mobile number"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
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

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-500">Mobile: 9756934671</p>
            <p className="text-xs text-gray-500">Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
