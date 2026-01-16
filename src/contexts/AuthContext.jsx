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
  const [user, setUser] = useState(null) // user only available after login response
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ On refresh: only verify session via backend cookies (access/refresh are httpOnly)
  useEffect(() => {
    let mounted = true

    const checkAuthStatus = async () => {
      try {
        const authData = await authAPI.checkAuth()
        if (!mounted) return

        if (authData?.success) {
          // ✅ logged in (cookies valid on backend)
          setIsAuthenticated(true)

          // ⚠️ cannot rehydrate user/role without backend user endpoint
          // so keep user null here
          // setUser(null)
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

      if (response?.success && response?.statusCode === 200) {
        // user data only available from login response
        setUser(response.data)
        setIsAuthenticated(true)
        return { success: true, data: response.data }
      }

      throw new Error(response?.message || "Login failed")
    } catch (error) {
      return { success: false, error: error.message || "Login failed" }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout() // backend must clear httpOnly cookies
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

  // ⚠️ role checks will only work after login (because user is null after refresh)
  const hasRole = (requiredRoles) => {
    const roleName =
      user?.role?.roleName ??
      user?.roleName ??
      (typeof user?.role === "string" ? user.role : null) ??
      (Array.isArray(user?.roles) ? user.roles[0] : null)

    if (!roleName) return false

    const current = [String(roleName).toLowerCase()]
    const req = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return req.map((r) => String(r).toLowerCase()).some((r) => current.includes(r))
  }

  const refreshUser = async () => {
    // Without backend /me endpoint we cannot refresh user details.
    // We only re-check authentication validity.
    const authData = await authAPI.checkAuth()
    if (!authData?.success) {
      setUser(null)
      setIsAuthenticated(false)
      return null
    }
    setIsAuthenticated(true)
    return user
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
