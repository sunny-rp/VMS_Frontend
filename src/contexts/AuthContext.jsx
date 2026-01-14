"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"
import { toast } from "sonner"

const AuthContext = createContext()

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 🔴 CRITICAL: force-clear cookies (fixes Vercel issue)
  const clearAuthCookies = () => {
    document.cookie = "accessToken=; Max-Age=0; path=/"
    document.cookie = "refreshToken=; Max-Age=0; path=/"
  }

  // 🔹 Check auth on app load / refresh
  useEffect(() => {
    let mounted = true

    const checkAuthStatus = async () => {
      try {
        const authData = await authAPI.checkAuth()
        if (!mounted) return

        if (authData?.success && authData?.data) {
          const userData = authData.data
          const normalizedUser = {
            ...userData,
            roles: [userData?.role?.roleName || "user"],
          }

          setUser(normalizedUser)
          setIsAuthenticated(true)
        } else {
          clearAuthCookies()
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (e) {
        console.error("Auth check failed:", e)
        clearAuthCookies()
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    checkAuthStatus()

    return () => {
      mounted = false
    }
  }, [])

  // 🔹 Login
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)

      if (response?.success && response?.statusCode === 200) {
        const userData = response.data
        const normalizedUser = {
          ...userData,
          roles: [userData?.role?.roleName || "user"],
        }

        setUser(normalizedUser)
        setIsAuthenticated(true)

        return { success: true, data: userData }
      }

      throw new Error(response?.message || "Login failed")
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      }
    }
  }

  // 🔹 LOGOUT — FIXED FOR PRODUCTION
 const logout = async () => {
  try {
    await authAPI.logout() // backend clears cookies
  } catch (e) {
    console.warn("Logout API failed:", e)
  } finally {
    setUser(null)
    setIsAuthenticated(false)

    toast.success("Logged out successfully", {
      description: "You have been safely logged out",
    })
  }
}


  // 🔹 Register (unchanged)
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Registration failed",
      }
    }
  }

  // 🔹 Role check (unchanged)
  const hasRole = (requiredRoles) => {
    if (!user?.roles) return false
    const req = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return req.some((r) => user.roles.includes(r))
  }

  // 🔹 Refresh user safely
  const refreshUser = async () => {
    try {
      const authData = await authAPI.checkAuth()

      if (authData?.success && authData?.data) {
        const userData = authData.data
        const normalizedUser = {
          ...userData,
          roles: [userData?.role?.roleName || "user"],
        }

        setUser(normalizedUser)
        setIsAuthenticated(true)
        return normalizedUser
      } else {
        clearAuthCookies()
        setUser(null)
        setIsAuthenticated(false)
        return null
      }
    } catch (error) {
      console.error("User refresh failed:", error)
      clearAuthCookies()
      setUser(null)
      setIsAuthenticated(false)
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
