"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Search, ChevronDown, Menu, LogOut, User } from "lucide-react"

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <header className="bg-primary-600 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button onClick={onMenuClick} className="lg:hidden p-2 text-white hover:bg-primary-700 rounded-lg">
            <Menu size={20} />
          </button>

          {/* SHUFAB dropdown */}
          <div className="relative">
            <button className="flex items-center gap-2 text-white hover:bg-primary-700 px-3 py-2 rounded-lg transition-colors">
              <span className="font-semibold">SHUFAB</span>
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Main Gate dropdown */}
          <div className="relative hidden sm:block">
            <button className="flex items-center gap-2 text-white hover:bg-primary-700 px-3 py-2 rounded-lg transition-colors">
              <span>Main Gate</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Time display */}
          <div className="hidden sm:flex items-center gap-1 text-white font-mono">
            <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold">
              {currentTime.getHours().toString().padStart(2, "0")}
            </div>
            <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold">
              {currentTime.getMinutes().toString().padStart(2, "0")}
            </div>
            <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold">
              {currentTime.getSeconds().toString().padStart(2, "0")}
            </div>
            <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold">
              {currentTime.getHours() >= 12 ? "PM" : "AM"}
            </div>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 text-white hover:bg-primary-700 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold">{user?.name}</div>
                <div className="text-xs text-white/80 capitalize">{user?.roles?.[0]?.replace("_", " ")}</div>
              </div>
              <ChevronDown size={16} />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.mobile}</div>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    // Navigate to profile - you can implement this
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile time display */}
      <div className="sm:hidden px-4 pb-2">
        <div className="text-center text-white font-mono text-sm">{formatTime(currentTime)}</div>
      </div>
    </header>
  )
}

export default Header
