"use client"

import { createContext, useContext, useState, useEffect } from "react"
import {
  authAPI,
  persistTokens,
  clearPersistedTokens,
  getStoredUser,
  persistUser,
  clearStoredUser,
} from "../services/api"
import { toast } from "sonner"

const AuthContext = createContext()

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}

export const AuthProvider = ({ children }) => {
  const normalizeUser = (raw) => {
    const userData = raw?.user || raw?.data || raw
    const roleName = userData?.role?.roleName || userData?.roleName || userData?.role || "user"
    const roles = Array.isArray(userData?.roles)
      ? userData.roles
      : Array.isArray(userData?.role)
        ? userData.role
        : [roleName]

    return {
      ...userData,
      roleName,
      roles,
    }
  }

  // ✅ COOKIE-ONLY session rehydration (NO fetch-roles)
  // Your backend is already cookie-based. So we:
  // 1) Persist a small user snapshot in a cookie on login (vms_user)
  // 2) Rehydrate from that cookie synchronously on refresh
  // This removes the need to call /user/roles/fetch-roles during login/refresh.
  const [user, setUser] = useState(() => {
    const stored = getStoredUser()
    return stored ? normalizeUser(stored) : null
  })

  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredUser()))

  // No global auth-check network call => no "Loading..." stuck on refresh
  const [isLoading, setIsLoading] = useState(false)

  // Keep state in sync if someone manually clears cookies while app is open
  useEffect(() => {
    const handleVisibility = () => {
      const stored = getStoredUser()
      if (!stored) {
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  const login = async (credentials, rememberMe = true) => {
    try {
      const response = await authAPI.login(credentials)

      if (response?.success && response?.statusCode === 200) {
        const raw = response.data
        const userData = raw?.user || raw?.data || raw

        // Persist tokens if backend returns them in body.
        // Support multiple shapes: {accessToken}, {token}, {data: {accessToken}}, etc.
        const accessToken =
          response?.accessToken ||
          response?.token ||
          response?.data?.accessToken ||
          response?.data?.token ||
          response?.data?.tokens?.accessToken ||
          response?.data?.tokens?.token ||
          response?.data?.token?.accessToken ||
          response?.data?.token?.token ||
          null

        const refreshToken =
          response?.refreshToken ||
          response?.data?.refreshToken ||
          response?.data?.tokens?.refreshToken ||
          response?.data?.token?.refreshToken ||
          null
        // ✅ COOKIE MODE: if backend returns tokens in JSON, store them in cookies.
        // If backend uses httpOnly cookies, it will ignore this and still work.
        if (accessToken || refreshToken) persistTokens({ accessToken, refreshToken, rememberMe })

        const normalizedUser = normalizeUser(userData)
        setUser(normalizedUser)
        setIsAuthenticated(true)
        persistUser(normalizedUser, { rememberMe })
        return { success: true, data: userData }
      }

      throw new Error(response?.message || "Login failed")
    } catch (error) {
      return { success: false, error: error.message || "Login failed" }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (e) {
      console.warn("API logout failed, clearing local:", e)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      clearStoredUser()
      clearPersistedTokens()
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
    // No network calls here; just refresh UI state from cookie.
    const stored = getStoredUser()
    if (stored) {
      const normalizedUser = normalizeUser(stored)
      setUser(normalizedUser)
      setIsAuthenticated(true)
      return normalizedUser
    }
    setUser(null)
    setIsAuthenticated(false)
    return null
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
