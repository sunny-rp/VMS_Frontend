"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth()
  const location = useLocation()

  // 🔒 IMPORTANT: Wait for auth hydration (cookies / refresh)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // 🔒 NOT authenticated → redirect to login
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 🔒 Authenticated but role not allowed
  if (roles.length > 0 && !hasRole(roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  // ✅ Authorized
  return children
}

export default ProtectedRoute
