"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Search, Menu, LogOut, User } from "lucide-react"
import { toast } from "sonner"

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()

  const userMenuRef = useRef(null)

  const [currentTime, setCurrentTime] = useState(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  /* -------------------- TIME -------------------- */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  /* -------------------- CLOSE DROPDOWN ON OUTSIDE CLICK -------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatTimeForDesktop = (date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12

    return {
      hours: displayHours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      ampm,
    }
  }

  const handleLogout = () => {
    toast.promise(logout(), {
      loading: "Logging out...",
      success: "Logged out successfully!",
      error: "Logout failed",
    })
    setShowUserMenu(false)
  }

  const timeData = formatTimeForDesktop(currentTime)

  return (
    <header className="bg-primary-600 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ---------------- LEFT ---------------- */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-white hover:bg-primary-700 rounded-lg"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-white text-lg font-bold tracking-wide">
            VMS
          </h1>
        </div>

        {/* ---------------- CENTER ---------------- */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>

        {/* ---------------- RIGHT ---------------- */}
        <div className="flex items-center gap-4">

          {/* TIME */}
          <div className="hidden sm:flex items-center gap-1 text-white font-mono">
            <div className="bg-white/20 px-2 py-1 rounded">{timeData.hours}</div>
            <div className="bg-white/20 px-2 py-1 rounded">{timeData.minutes}</div>
            <div className="bg-white/20 px-2 py-1 rounded">{timeData.seconds}</div>
            <div className="bg-white/20 px-2 py-1 rounded">{timeData.ampm}</div>
          </div>

          {/* USER MENU */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 text-white hover:bg-primary-700 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User size={16} />
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold">{user?.name || "User"}</p>
                <p className="text-xs text-white/80 capitalize">
                  {user?.roles?.[0]?.replace("_", " ")}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">

                {/* USER INFO */}
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.mobile}
                  </p>
                </div>

                {/* PROFILE */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={16} />
                  Profile
                </button>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
