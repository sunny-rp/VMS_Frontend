"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, XCircle } from "lucide-react"
import { appointmentsAPI } from "../services/api"

const CheckInOut = () => {
  const [visitorEntryType, setVisitorEntryType] = useState("Check In")
  const [visitorEntryCode, setVisitorEntryCode] = useState("")
  const [visitorName, setVisitorName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true)
      const response = await appointmentsAPI.getAll()
      if (response.success && response.data) {
        setAppointments(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
      setError("Failed to load appointments data")
    } finally {
      setAppointmentsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filteredData = appointments
    .filter((appointment) => {
      if (!appointment.visitors || !Array.isArray(appointment.visitors)) return false

      return appointment.visitors.some(
        (visitor) =>
          visitor.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.appointmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.personToVisit?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    })
    .flatMap((appointment) =>
      appointment.visitors.map((visitor) => ({
        visitorEntryCode: appointment.appointmentId || "-",
        visitorName: visitor.fullname || "-",
        personToVisit: appointment.personToVisit?.fullname || "-",
        checkedIn: appointment.checkedInTime || "-",
        checkedInBy: appointment.personToVisit?.fullname || "-", // Same as person to visit as requested
        checkedOut: appointment.checkedOutTime || "-",
      })),
    )

  const handleCheckInOut = async () => {
    if (!visitorEntryCode.trim()) {
      setError("Visitor Entry Code is required")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      let response
      if (visitorEntryType === "Check In") {
        response = await appointmentsAPI.checkIn(visitorEntryCode.trim(), visitorName.trim() || null)
      } else {
        response = await appointmentsAPI.checkOut(visitorEntryCode.trim(), visitorName.trim() || null)
      }

      setSuccess(`${visitorEntryType} successful for ${visitorEntryCode}`)
      // Clear form after successful operation
      setVisitorEntryCode("")
      setVisitorName("")
      fetchAppointments()
    } catch (error) {
      console.error(`${visitorEntryType} failed:`, error)
      setError(error.message || `${visitorEntryType} failed. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setVisitorEntryCode("")
    setVisitorName("")
    setError("")
    setSuccess("")
  }

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("")
        setSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Check In / Check Out</h1>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">{success}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Entry Type</label>
              <select
                value={visitorEntryType}
                onChange={(e) => setVisitorEntryType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option>Check In</option>
                <option>Check Out</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visitor Entry Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Please Enter Visitor Entry Code"
                value={visitorEntryCode}
                onChange={(e) => setVisitorEntryCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Name (Optional)</label>
              <input
                type="text"
                placeholder="Enter Visitor Name"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleCheckInOut}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{loading ? "Processing..." : "CHECK IN / CHECK OUT"}</span>
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>CLEAR</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {appointmentsLoading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Loading appointments...</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visitor Entry Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visitor Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Person to Visit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Checked In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Checked In By
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Checked Out
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.visitorEntryCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.visitorName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.personToVisit}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.checkedIn !== "-" ? new Date(item.checkedIn).toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.checkedInBy}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.checkedOut !== "-" ? new Date(item.checkedOut).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No appointments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700">
                      Showing 1 to {filteredData.length} of {filteredData.length} Entries
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹‹</button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹</button>
                    <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">1</button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">›</button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">››</button>
                    <select className="ml-2 text-sm border border-gray-300 rounded px-2 py-1">
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3D Cube */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xs font-medium">Check-In</div>
              <div className="text-xs font-medium">Visitors</div>
              <div className="text-2xl font-bold">
                {filteredData.filter((item) => item.checkedIn !== "-" && item.checkedOut === "-").length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckInOut
