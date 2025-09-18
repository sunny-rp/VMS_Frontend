"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Search, ChevronDown, Menu, LogOut, User } from "lucide-react"
import { toast } from "sonner"

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()

  const companyDropdownRef = useRef(null)
  const gateDropdownRef = useRef(null)
  const userDropdownRef = useRef(null)

  // State management for time, dropdowns, and selections
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCompanyMenu, setShowCompanyMenu] = useState(false)
  const [showGateMenu, setShowGateMenu] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState("SHUFAB")
  const [selectedGate, setSelectedGate] = useState("Main Gate")
  const [searchQuery, setSearchQuery] = useState("")

  // Dropdown options data
  const companies = ["SHUFAB", "TECH CORP", "MANUFACTURING LTD", "GLOBAL INDUSTRIES"]
  const gates = ["Main Gate", "Gate 1", "Gate 2", "Side Gate", "Emergency Gate"]

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close company dropdown if clicked outside
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setShowCompanyMenu(false)
      }
      // Close gate dropdown if clicked outside
      if (gateDropdownRef.current && !gateDropdownRef.current.contains(event.target)) {
        setShowGateMenu(false)
      }
      // Close user dropdown if clicked outside
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside)

    // Cleanup event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update time every second for real-time clock display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format time for mobile display (simple 12-hour format with AM/PM)
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  // Format time for desktop display (separate components for styling)
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
      ampm: ampm,
    }
  }

  // Handle user logout and close dropdown
  const handleLogout = () => {
    toast.promise(logout(), {
      loading: "Logging out...",
      success: "Logged out successfully!",
      error: "Failed to logout",
    })
    setShowUserMenu(false)
  }

  // Handle company selection and close dropdown
  const handleCompanySelect = (company) => {
    setSelectedCompany(company)
    setShowCompanyMenu(false)
  }

  // Handle gate selection and close dropdown
  const handleGateSelect = (gate) => {
    setSelectedGate(gate)
    setShowGateMenu(false)
  }

  const timeData = formatTimeForDesktop(currentTime)

  return (
    <header className="bg-primary-600 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section - Mobile menu and dropdowns */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button onClick={onMenuClick} className="lg:hidden p-2 text-white hover:bg-primary-700 rounded-lg">
            <Menu size={20} />
          </button>

          <div className="relative" ref={companyDropdownRef}>
            <button
              onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              className="flex items-center gap-2 text-white hover:bg-primary-700 px-3 py-2 rounded-lg transition-colors"
            >
              <span className="font-semibold">{selectedCompany}</span>
              <ChevronDown size={16} />
            </button>

            {/* Company dropdown menu */}
            {showCompanyMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {companies.map((company) => (
                  <button
                    key={company}
                    onClick={() => handleCompanySelect(company)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedCompany === company ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                    }`}
                  >
                    {company}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative hidden sm:block" ref={gateDropdownRef}>
            <button
              onClick={() => setShowGateMenu(!showGateMenu)}
              className="flex items-center gap-2 text-white hover:bg-primary-700 px-3 py-2 rounded-lg transition-colors"
            >
              <span>{selectedGate}</span>
              <ChevronDown size={16} />
            </button>

            {/* Gate dropdown menu */}
            {showGateMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {gates.map((gate) => (
                  <button
                    key={gate}
                    onClick={() => handleGateSelect(gate)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedGate === gate ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                    }`}
                  >
                    {gate}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center section - Search bar */}
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

        {/* Right section - Time display and user menu */}
        <div className="flex items-center gap-4">
          {/* Desktop time display - 12-hour format with AM/PM in separate styled boxes */}
          <div className="hidden sm:flex items-center gap-1 text-white font-mono">
            <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold">{timeData.hours}</div>
            <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold">{timeData.minutes}</div>
            <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold">{timeData.seconds}</div>
            <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold">{timeData.ampm}</div>
          </div>

          <div className="relative" ref={userDropdownRef}>
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

      {/* Mobile time display - Simple 12-hour format */}
      <div className="sm:hidden px-4 pb-2">
        <div className="text-center text-white font-mono text-sm">{formatTime(currentTime)}</div>
      </div>
    </header>
  )
}

export default Header
