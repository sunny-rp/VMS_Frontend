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

  // ✅ Normalize user/role in one place.
  // ✅ NO default "user" role (this is what causes Admin → User after refresh)
  const normalizeUser = (raw) => {
    if (!raw) return null

    // Some APIs send { data: { user: {...} } } and we pass user wrapper around
    const u = raw?.user ?? raw

    const roleName =
      u?.role?.roleName ??
      u?.roleName ??
      (typeof u?.role === "string" ? u.role : null) ??
      (Array.isArray(u?.roles) ? u.roles[0] : null)

    // ✅ force lowercase so your checks like ["admin","super_admin"] always match
    const normalizedRole = roleName ? String(roleName).toLowerCase() : null

    return {
      ...u,
      roles: normalizedRole ? [normalizedRole] : [],
    }
  }

  // ✅ Auth hydration on refresh from backend session state
  useEffect(() => {
    let mounted = true

    const checkAuthStatus = async () => {
      try {
        const authData = await authAPI.checkAuth()
        if (!mounted) return

        if (authData?.success && authData?.data) {
          setUser(normalizeUser(authData.data))
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (e) {
        console.error("Auth check failed:", e)
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

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)

      if (response?.success) {
        setUser(normalizeUser(response.data))
        setIsAuthenticated(true)
        return { success: true, data: response.data }
      }

      throw new Error(response?.message || "Login failed")
    } catch (error) {
      return { success: false, error: error.message || "Login failed" }
    }
  }

  // ✅ Logout: backend clears cookies, frontend clears state
  const logout = async () => {
    try {
      await authAPI.logout()
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

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" }
    }
  }

  const hasRole = (requiredRoles) => {
    if (!user?.roles) return false
    const req = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return req.some((r) => user.roles.includes(String(r).toLowerCase()))
  }

  const refreshUser = async () => {
    try {
      const authData = await authAPI.checkAuth()
      if (authData?.success && authData?.data) {
        const u = normalizeUser(authData.data)
        setUser(u)
        setIsAuthenticated(true)
        return u
      }
      setUser(null)
      setIsAuthenticated(false)
      return null
    } catch (error) {
      console.error("User refresh failed:", error)
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
