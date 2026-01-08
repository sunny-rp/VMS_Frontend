"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Calendar, Clock, MapPin, User, FileText, CheckCircle, XCircle, AlertCircle, LogIn, LogOut } from "lucide-react"
import { toast } from "sonner"
import { appointmentsAPI } from "../services/api"

const PublicAppointmentDetails = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching appointment:", appointmentId)
      const data = await appointmentsAPI.getPublicById(appointmentId)
      console.log("[v0] API Response:", data)
      setAppointment(data.data || data)
    } catch (err) {
      console.error("[v0] Error fetching appointment:", err)
      setError(err.message || "Failed to load appointment details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails()
    }
  }, [appointmentId])

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true)
      console.log("[v0] Checking in appointment:", appointmentId)
      const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"
      const response = await fetch(`${API_BASE_URL}/visitor-form/appointments/checkin-visitors/${appointmentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to check in")
      }

      const result = await response.json()
      console.log("[v0] Check-in response:", result)
      toast.success("Checked in successfully!")
      await fetchAppointmentDetails()
    } catch (err) {
      console.error("[v0] Check-in error:", err)
      toast.error(err.message || "Failed to check in")
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true)
      console.log("[v0] Checking out appointment:", appointmentId)
      const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"
      const response = await fetch(`${API_BASE_URL}/user/appointments/checkout-visitors/${appointmentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to check out")
      }

      const result = await response.json()
      console.log("[v0] Check-out response:", result)
      toast.success("Checked out successfully!")
      await fetchAppointmentDetails()
    } catch (err) {
      console.error("[v0] Check-out error:", err)
      toast.error(err.message || "Failed to check out")
    } finally {
      setCheckingOut(false)
    }
  }

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      completed: "bg-blue-100 text-blue-800 border-blue-300",
      cancelled: "bg-gray-100 text-gray-800 border-gray-300",
    }
    return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === "approved" || statusLower === "completed") return <CheckCircle className="w-5 h-5" />
    if (statusLower === "rejected" || statusLower === "cancelled") return <XCircle className="w-5 h-5" />
    return <AlertCircle className="w-5 h-5" />
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600 font-medium">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-red-100 p-4 rounded-full">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Appointment Not Found</h2>
            <p className="text-gray-600">{error || "The requested appointment could not be found."}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isCheckedIn = !!appointment?.checkedInTime
  const isCheckedOut = !!appointment?.checkedOutTime

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Appointment Details</h1>
          <p className="text-sm sm:text-base text-gray-600">View your scheduled appointment information</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Status Banner */}
          <div
            className={`p-4 sm:p-6 border-b ${appointment.isAppointmentActive ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-800 border-gray-300"} border`}
          >
            <div className="flex items-center justify-center space-x-3">
              {appointment.isAppointmentActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="text-base sm:text-lg font-semibold capitalize">
                {appointment.isAppointmentActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Visitor Information */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b pb-2">Visitor Information</h2>
              {appointment.visitors && appointment.visitors.length > 0 ? (
                appointment.visitors.map((visitor, index) => (
                  <div
                    key={visitor._id || index}
                    className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">Visitor Name</p>
                          <p className="font-semibold text-gray-900 capitalize break-words">
                            {visitor.fullname || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">Company</p>
                          <p className="font-semibold text-gray-900 break-words">{visitor.company || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">Mobile</p>
                          <p className="font-semibold text-gray-900 break-words">{visitor.mobile || "N/A"}</p>
                        </div>
                      </div>
                      {visitor.email && (
                        <div className="flex items-start space-x-3">
                          <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-semibold text-gray-900 break-all">{visitor.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {visitor.belongings && visitor.belongings.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">Belongings</p>
                        <p className="font-semibold text-gray-900 break-words">{visitor.belongings.join(", ")}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No visitor information available</p>
              )}
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b pb-2">Appointment Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Appointment Date</p>
                    <p className="font-semibold text-gray-900 break-words">{formatDate(appointment.appointmentDate)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Appointment Time</p>
                    <p className="font-semibold text-gray-900">{formatTime(appointment.appointmentDate)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Valid Till</p>
                    <p className="font-semibold text-gray-900 break-words">
                      {formatDate(appointment.appointmentValidTill)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Appointment ID</p>
                    <p className="font-semibold text-gray-900 break-all">{appointment.appointmentId || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company & Plant Information */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b pb-2">Company & Plant Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-semibold text-gray-900 break-words">
                      {appointment.company?.companyName || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Plant</p>
                    <p className="font-semibold text-gray-900 break-words">{appointment.plant?.plantName || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Details */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b pb-2">Meeting Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Person to Visit</p>
                    <p className="font-semibold text-gray-900 capitalize break-words">
                      {appointment.personToVisit?.fullname || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Area to Visit</p>
                    <p className="font-semibold text-gray-900 break-words">
                      {appointment.areaToVisit?.areaName || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purpose/Notes */}
            {appointment.purposeOfVisit && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b pb-2">Purpose of Visit</h2>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed break-words">{appointment.purposeOfVisit}</p>
                </div>
              </div>
            )}

            {/* Check-in/Check-out Status */}
            {(appointment.checkedInTime || appointment.checkedOutTime) && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b pb-2">Visit Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {appointment.checkedInTime && (
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Checked In</p>
                        <p className="font-semibold text-gray-900 break-words">
                          {formatDate(appointment.checkedInTime)} at {formatTime(appointment.checkedInTime)}
                        </p>
                      </div>
                    </div>
                  )}
                  {appointment.checkedOutTime && (
                    <div className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Checked Out</p>
                        <p className="font-semibold text-gray-900 break-words">
                          {formatDate(appointment.checkedOutTime)} at {formatTime(appointment.checkedOutTime)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Check-in Button */}
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckedIn || checkingIn}
                  className={`w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                    isCheckedIn
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>{checkingIn ? "Checking In..." : isCheckedIn ? "Already Checked In" : "Check In"}</span>
                </button>

                {/* Check-out Button */}
                <button
                  onClick={handleCheckOut}
                  disabled={!isCheckedIn || isCheckedOut || checkingOut}
                  className={`w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                    !isCheckedIn || isCheckedOut
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  <span>
                    {checkingOut
                      ? "Checking Out..."
                      : isCheckedOut
                        ? "Already Checked Out"
                        : !isCheckedIn
                          ? "Check In First"
                          : "Check Out"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t border-gray-200">
            <p className="text-center text-xs sm:text-sm text-gray-600">
              Please arrive 10 minutes before your scheduled appointment time.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublicAppointmentDetails
