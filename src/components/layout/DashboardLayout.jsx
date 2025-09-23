"use client"

import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    console.log("[v0] Route changed to:", location.pathname)
    console.log("[v0] Sidebar was open:", sidebarOpen)
    if (sidebarOpen) {
      console.log("[v0] Closing sidebar due to route change")
      setSidebarOpen(false)
    }
  }, [location.pathname, sidebarOpen])

  const handleSidebarClose = () => {
    console.log("[v0] Manually closing sidebar")
    setSidebarOpen(false)
  }

  const handleSidebarOpen = () => {
    console.log("[v0] Opening sidebar")
    setSidebarOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

      {/* Main content */}
      <div className="lg:pl-16">
        {/* Header */}
        <Header onMenuClick={handleSidebarOpen} />

        {/* Page content */}
        <main className="py-6">
          <div className="px-2 sm:px-4 lg:px-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" onClick={handleSidebarClose} />
      )}
    </div>
  )
}

export default DashboardLayout
