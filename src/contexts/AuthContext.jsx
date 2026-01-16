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

  // ✅ We cannot read/clear httpOnly accessToken/refreshToken from JS.
  // ✅ For role/name persistence without localStorage, we store ONLY UI info in a non-httpOnly cookie.
  const APP_USER_COOKIE = "vms_user"

  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
    return null
  }

  const setCookie = (name, value) => {
    const isProd = window.location.protocol === "https:"
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax${
      isProd ? "; Secure" : ""
    }`
  }

  const deleteCookie = (name) => {
    const isProd = window.location.protocol === "https:"
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${isProd ? "; Secure" : ""}`
  }

  const safeJson = (val) => {
    try {
      return JSON.parse(val)
    } catch {
      return null
    }
  }

  const normalizeRole = (u) => {
    const roleName =
      u?.role?.roleName ??
      u?.roleName ??
      (typeof u?.role === "string" ? u.role : null) ??
      (Array.isArray(u?.roles) ? u.roles[0] : null)

    return roleName ? String(roleName).toLowerCase() : null
  }

  const normalizeUser = (raw) => {
    if (!raw) return null
    const u = raw?.user ?? raw
    const r = normalizeRole(u)
    return { ...u, roles: r ? [r] : [] }
  }

  const loadUserFromAppCookie = () => {
    const raw = getCookie(APP_USER_COOKIE)
    if (!raw) return null
    const parsed = safeJson(decodeURIComponent(raw))
    return normalizeUser(parsed)
  }

  const saveUserToAppCookie = (u) => {
    if (!u) return
    const safeUser = {
      name: u.name,
      mobile: u.mobile,
      email: u.email,
      role: normalizeRole(u),
    }
    setCookie(APP_USER_COOKIE, JSON.stringify(safeUser))
  }

  // ✅ On refresh: verify session via backend cookies (no /me), then load role from our UI cookie
  useEffect(() => {
    let mounted = true

    const checkAuthStatus = async () => {
      try {
        const authData = await authAPI.checkAuth()
        if (!mounted) return

        if (authData?.success) {
          const cookieUser = loadUserFromAppCookie()
          setUser(cookieUser)
          setIsAuthenticated(true)
        } else {
          deleteCookie(APP_USER_COOKIE)
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (e) {
        console.error("Auth check failed:", e)
        deleteCookie(APP_USER_COOKIE)
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
        const userData = response.data
        const normalizedUser = normalizeUser(userData)

        setUser(normalizedUser)
        setIsAuthenticated(true)

        // ✅ role persists across refresh (no localStorage)
        saveUserToAppCookie(userData)

        return { success: true, data: userData }
      }

      throw new Error(response?.message || "Login failed")
    } catch (error) {
      return { success: false, error: error.message || "Login failed" }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout() // backend clears httpOnly cookies
    } catch (e) {
      console.warn("Logout API failed:", e)
    } finally {
      // clear UI cookie
      deleteCookie(APP_USER_COOKIE)
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
    const current = user.roles.map((r) => String(r).toLowerCase())
    return req.map((r) => String(r).toLowerCase()).some((r) => current.includes(r))
  }

  const refreshUser = async () => {
    try {
      const authData = await authAPI.checkAuth()
      if (!authData?.success) {
        deleteCookie(APP_USER_COOKIE)
        setUser(null)
        setIsAuthenticated(false)
        return null
      }

      const cookieUser = loadUserFromAppCookie()
      setUser(cookieUser)
      setIsAuthenticated(true)
      return cookieUser
    } catch (error) {
      console.error("User refresh failed:", error)
      deleteCookie(APP_USER_COOKIE)
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
