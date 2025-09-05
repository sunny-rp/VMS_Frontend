"use client"

import { createContext, useContext, useState, useEffect } from "react"
import Cookies from "js-cookie"
import { authAPI } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cookie key for auth data
  const AUTH_COOKIE_KEY = "vms_auth"

  // Get auth data from cookie
  const getAuthFromCookie = () => {
    try {
      const authData = Cookies.get(AUTH_COOKIE_KEY)
      return authData ? JSON.parse(authData) : null
    } catch (error) {
      console.error("Error parsing auth cookie:", error)
      return null
    }
  }

  // Set auth data in cookie
  const setAuthCookie = (authData, rememberMe = false) => {
    const options = {
      secure: window.location.protocol === "https:",
      sameSite: "strict",
    }

    if (rememberMe) {
      options.expires = 30 // 30 days
    }
    // If rememberMe is false, cookie will be session-only (no expires set)

    Cookies.set(AUTH_COOKIE_KEY, JSON.stringify(authData), options)
  }

  // Remove auth cookie
  const removeAuthCookie = () => {
    Cookies.remove(AUTH_COOKIE_KEY)
  }

  // Check if token is expired
  const isTokenExpired = (issuedAt) => {
    const now = Date.now()
    const tokenAge = now - issuedAt
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    return tokenAge > maxAge
  }

  // Initialize auth state from cookie
  useEffect(() => {
    const authData = getAuthFromCookie()

    if (authData && authData.token && authData.user && authData.issuedAt) {
      // Check if token is expired
      if (isTokenExpired(authData.issuedAt)) {
        removeAuthCookie()
        setUser(null)
        setIsAuthenticated(false)
      } else {
        setUser(authData.user)
        setIsAuthenticated(true)
      }
    }

    setLoading(false)
  }, [])

  const login = async (credentials, rememberMe = false) => {
    try {
      const response = await authAPI.login(credentials)
      const { token, user } = response

      const authData = {
        token,
        user,
        issuedAt: Date.now(),
      }

      setAuthCookie(authData, rememberMe)
      setUser(user)
      setIsAuthenticated(true)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      }
    }
  }

  const logout = () => {
    removeAuthCookie()
    setUser(null)
    setIsAuthenticated(false)
  }

  const hasRole = (requiredRoles) => {
    if (!user || !user.roles) return false
    if (!Array.isArray(requiredRoles)) requiredRoles = [requiredRoles]
    return requiredRoles.some((role) => user.roles.includes(role))
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasRole,
    getAuthFromCookie,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
