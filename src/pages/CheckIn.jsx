"use client"

import { useState, useEffect } from "react"
import { visitorsAPI } from "../services/api"
import { QrCode, UserPlus, UserMinus, Search, Camera, X, Check, Clock, User, Building, Phone } from "lucide-react"

const CheckIn = () => {
  const [activeTab, setActiveTab] = useState("scan") // scan, manual, checkout
  const [qrCode, setQrCode] = useState("")
  const [showQrModal, setShowQrModal] = useState(false)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(false)

  // Manual check-in form state
  const [checkInForm, setCheckInForm] = useState({
    name: "",
    mobile: "",
    company: "",
    hostName: "",
    passType: "one_day",
    purpose: "",
  })

  // Check-out search state
  const [checkOutSearch, setCheckOutSearch] = useState("")
  const [activeVisitors, setActiveVisitors] = useState([])

  useEffect(() => {
    loadActiveVisitors()
    loadRecentActivity()
  }, [])

  const loadActiveVisitors = async () => {
    try {
      const response = await visitorsAPI.getAll({ status: "active" })
      setActiveVisitors(response.data)
    } catch (error) {
      console.error("Error loading active visitors:", error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      const response = await visitorsAPI.getAll()
      // Get recent check-ins and check-outs (last 10)
      const recent = response.data.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)).slice(0, 10)
      setRecentActivity(recent)
    } catch (error) {
      console.error("Error loading recent activity:", error)
    }
  }

  const handleQrScan = async () => {
    if (!qrCode.trim()) return

    setLoading(true)
    try {
      // Simulate QR code processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo, assume QR code contains visitor ID for check-out
      if (qrCode.startsWith("VST")) {
        await visitorsAPI.checkOut(qrCode)
        setQrCode("")
        setShowQrModal(false)
        loadActiveVisitors()
        loadRecentActivity()
        alert("Visitor checked out successfully!")
      } else {
        alert("Invalid QR code format")
      }
    } catch (error) {
      alert("Error processing QR code: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheckIn = async (e) => {
    e.preventDefault()

    if (!checkInForm.name || !checkInForm.mobile) {
      alert("Please fill in required fields")
      return
    }

    setLoading(true)
    try {
      await visitorsAPI.checkIn(checkInForm)
      setCheckInForm({
        name: "",
        mobile: "",
        company: "",
        hostName: "",
        passType: "one_day",
        purpose: "",
      })
      loadActiveVisitors()
      loadRecentActivity()
      alert("Visitor checked in successfully!")
    } catch (error) {
      alert("Error checking in visitor: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickCheckOut = async (visitorId) => {
    setLoading(true)
    try {
      await visitorsAPI.checkOut(visitorId)
      loadActiveVisitors()
      loadRecentActivity()
    } catch (error) {
      alert("Error checking out visitor: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const filteredActiveVisitors = activeVisitors.filter(
    (visitor) =>
      visitor.name.toLowerCase().includes(checkOutSearch.toLowerCase()) ||
      visitor.mobile.includes(checkOutSearch) ||
      visitor.id.toLowerCase().includes(checkOutSearch.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Check In / Check Out</h1>
        <p className="text-gray-600">Manage visitor entry and exit</p>
      </div>

      {/* Tab navigation */}
      <div className="card">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("scan")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "scan"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <QrCode size={16} />
              QR Code Scan
            </div>
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "manual"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <UserPlus size={16} />
              Manual Check-In
            </div>
          </button>
          <button
            onClick={() => setActiveTab("checkout")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "checkout"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <UserMinus size={16} />
              Quick Check-Out
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* QR Code Scan Tab */}
          {activeTab === "scan" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h3>
                <p className="text-gray-600 mb-4">Position the QR code within the frame to scan</p>
                <button onClick={() => setShowQrModal(true)} className="btn-primary">
                  Open QR Scanner
                </button>
              </div>

              {/* Recent scans */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentActivity.slice(0, 5).map((visitor) => (
                    <div key={visitor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            visitor.status === "active" ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium text-gray-900">{visitor.name}</p>
                          <p className="text-sm text-gray-600">{visitor.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {visitor.status === "active" ? "Checked In" : "Checked Out"}
                        </p>
                        <p className="text-xs text-gray-500">{formatTime(visitor.checkInTime)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Manual Check-In Tab */}
          {activeTab === "manual" && (
            <form onSubmit={handleManualCheckIn} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visitor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={checkInForm.name}
                    onChange={(e) => setCheckInForm({ ...checkInForm, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter visitor name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={checkInForm.mobile}
                    onChange={(e) => setCheckInForm({ ...checkInForm, mobile: e.target.value })}
                    className="input-field"
                    placeholder="Enter mobile number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={checkInForm.company}
                    onChange={(e) => setCheckInForm({ ...checkInForm, company: e.target.value })}
                    className="input-field"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Person to Visit</label>
                  <input
                    type="text"
                    value={checkInForm.hostName}
                    onChange={(e) => setCheckInForm({ ...checkInForm, hostName: e.target.value })}
                    className="input-field"
                    placeholder="Enter host name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pass Type</label>
                  <select
                    value={checkInForm.passType}
                    onChange={(e) => setCheckInForm({ ...checkInForm, passType: e.target.value })}
                    className="input-field"
                  >
                    <option value="one_day">One Day Pass</option>
                    <option value="extended">Extended Pass</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit</label>
                  <input
                    type="text"
                    value={checkInForm.purpose}
                    onChange={(e) => setCheckInForm({ ...checkInForm, purpose: e.target.value })}
                    className="input-field"
                    placeholder="Enter purpose"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <UserPlus size={16} />
                  )}
                  Check In Visitor
                </button>
              </div>
            </form>
          )}

          {/* Quick Check-Out Tab */}
          {activeTab === "checkout" && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search active visitors..."
                  value={checkOutSearch}
                  onChange={(e) => setCheckOutSearch(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Active visitors list */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredActiveVisitors.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active visitors found</p>
                  </div>
                ) : (
                  filteredActiveVisitors.map((visitor) => (
                    <div
                      key={visitor.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{visitor.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {visitor.mobile}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building size={12} />
                              {visitor.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatTime(visitor.checkInTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickCheckOut(visitor.id)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <UserMinus size={16} />
                        Check Out
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Instant Check In / Out</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check In/ Out <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  className="input-field"
                  placeholder="Please Scan the QR Code"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowQrModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleQrScan}
                  disabled={loading || !qrCode.trim()}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Check size={16} />
                  )}
                  Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckIn
