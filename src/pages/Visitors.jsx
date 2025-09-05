"use client"

import { useState, useEffect } from "react"
import { visitorsAPI } from "../services/api"
import { Search, Plus, User, Building, Phone, Clock, UserX, Users } from "lucide-react"

const Visitors = () => {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [preAppointment, setPreAppointment] = useState(false)
  const [selectedPassType, setSelectedPassType] = useState("one_day")
  const [searchVisitor, setSearchVisitor] = useState("")
  const [searchHost, setSearchHost] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
  })

  useEffect(() => {
    loadVisitors()
  }, [])

  const loadVisitors = async () => {
    try {
      setLoading(true)
      const response = await visitorsAPI.getAll({
        search: searchVisitor,
        status: filters.status === "all" ? null : filters.status,
      })
      setVisitors(response.data)
    } catch (error) {
      console.error("Error loading visitors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadVisitors()
  }

  const handleCheckOut = async (visitorId) => {
    try {
      await visitorsAPI.checkOut(visitorId)
      loadVisitors() // Reload the list
    } catch (error) {
      console.error("Error checking out visitor:", error)
    }
  }

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "checked_out":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
          <p className="text-gray-600">Manage and track all visitors</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Visitor
        </button>
      </div>

      {/* Controls section */}
      <div className="card p-6 space-y-6">
        {/* Pre-Appointment toggle */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Pre-Appointment?</span>
            <button
              onClick={() => setPreAppointment(!preAppointment)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preAppointment ? "bg-primary-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preAppointment ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Pass type selection */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => setSelectedPassType("one_day")}
            className={`flex flex-col items-center p-6 rounded-lg border-2 transition-colors ${
              selectedPassType === "one_day"
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">ONE DAY PASS</span>
          </button>

          <button
            onClick={() => setSelectedPassType("extended")}
            className={`flex flex-col items-center p-6 rounded-lg border-2 transition-colors ${
              selectedPassType === "extended"
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <Building className="w-8 h-8 text-orange-600" />
            </div>
            <span className="font-semibold text-gray-900">EXTENDED PASS</span>
          </button>
        </div>

        {/* Search fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Visitor Name"
              value={searchVisitor}
              onChange={(e) => setSearchVisitor(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="input-field pl-10"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search Person to Visit"
              value={searchHost}
              onChange={(e) => setSearchHost(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setFilters({ ...filters, status: "all" })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.status === "all" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Visitors
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: "active" })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.status === "active" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: "checked_out" })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.status === "checked_out"
                ? "bg-gray-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Checked Out
          </button>
        </div>
      </div>

      {/* Visitors grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : visitors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visitors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or add a new visitor.</p>
          </div>
        ) : (
          visitors.map((visitor) => (
            <div key={visitor.id} className="card p-4 hover:shadow-md transition-shadow">
              {/* Visitor header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {visitor.name}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(visitor.status)}`}>
                      {visitor.status}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600">{visitor.id}</p>
                </div>
                {visitor.status === "active" && (
                  <button
                    onClick={() => handleCheckOut(visitor.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Check Out"
                  >
                    <UserX size={16} />
                  </button>
                )}
              </div>

              {/* Visitor details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} />
                  <span>{visitor.mobile}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building size={14} />
                  <span>{visitor.company}</span>
                </div>
                {visitor.hostName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} />
                    <span>{visitor.hostName}</span>
                  </div>
                )}
                {visitor.checkInTime && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={14} />
                    <span>Check-in: {formatTime(visitor.checkInTime)}</span>
                  </div>
                )}
              </div>

              {/* Pass type indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    visitor.passType === "one_day" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {visitor.passType === "one_day" ? "One Day Pass" : "Extended Pass"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total visitors counter */}
      {!loading && visitors.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span className="font-medium">Total Visitors: {visitors.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Visitors
