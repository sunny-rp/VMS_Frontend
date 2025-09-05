"use client"

import { useState, useEffect } from "react"
import { visitorsAPI } from "../services/api"
import { Plus } from "lucide-react"

const Visitors = () => {
  const [visitors, setVisitors] = useState([])
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [preAppointment, setPreAppointment] = useState(false)
  const [selectedPassType, setSelectedPassType] = useState("one_day")
  const [searchVisitor, setSearchVisitor] = useState("")
  const [searchHost, setSearchHost] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [visitorsResponse, hostsResponse] = await Promise.all([
        visitorsAPI.getAll({ search: searchVisitor }),
        visitorsAPI.getHosts({ search: searchHost }),
      ])
      setVisitors(visitorsResponse.data)
      setHosts(
        hostsResponse.data || [
          { id: 1, name: "PRAKASH SHARMA", userId: "USR00026", phone: "8950910790", company: "SHUFAB" },
          { id: 2, name: "SACHENDAR SINGH", userId: "USR00025", phone: "9818290470", company: "SHUFAB" },
          { id: 3, name: "PUNIT SHARMA", userId: "USR00024", phone: "9813147278", company: "SHUFAB" },
          { id: 4, name: "NEERAJ KUMAR", userId: "USR00022", phone: "9350502027", company: "SHUFAB" },
          { id: 5, name: "ASHOK KUMAR BIRLA", userId: "USR00023", phone: "7888323991", company: "SHUFAB" },
          { id: 6, name: "RIDHAM BEHL", userId: "USR00021", phone: "8744000239", company: "SHUFAB" },
          { id: 7, name: "SANJEEV KUMAR", userId: "USR00020", phone: "9810867384", company: "SHUFAB" },
          { id: 8, name: "CHITTA RANJAN GADANAYAK", userId: "USR00019", phone: "9810980157", company: "SHUFAB" },
          { id: 9, name: "RAVI SARASWAT", userId: "USR00018", phone: "9560639157", company: "SHUFAB" },
          { id: 10, name: "GURDEEP WALIA", userId: "USR00018", phone: "", company: "SHUFAB" },
          { id: 11, name: "ABHISHEK SINGH JADON", userId: "USR00016", phone: "", company: "SHUFAB" },
          { id: 12, name: "ASHISH KUMAR", userId: "USR00015", phone: "", company: "SHUFAB" },
        ],
      )
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadData()
  }

  const handleCheckOut = async (visitorId) => {
    try {
      await visitorsAPI.checkOut(visitorId)
      loadData() // Reload the list
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
    <div>
      {/* Pre-Appointment toggle */}
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-medium text-lg">Pre-Appointment?</span>
          <button
            onClick={() => setPreAppointment(!preAppointment)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preAppointment ? "bg-blue-500" : "bg-gray-300"
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
      <div className="flex justify-center gap-6 mb-8">
        <button
          onClick={() => setSelectedPassType("one_day")}
          className={`flex flex-col items-center p-6 rounded-lg transition-colors min-w-[200px] ${
            selectedPassType === "one_day"
              ? "bg-blue-100 border-2 border-blue-300"
              : "bg-white border-2 border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <div className="text-2xl">👨‍💼</div>
          </div>
          <span className="font-bold text-gray-900">ONE DAY PASS</span>
        </button>

        <button
          onClick={() => setSelectedPassType("extended")}
          className={`flex flex-col items-center p-6 rounded-lg transition-colors min-w-[200px] ${
            selectedPassType === "extended"
              ? "bg-blue-100 border-2 border-blue-300"
              : "bg-white border-2 border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <div className="text-2xl">👷‍♂️</div>
          </div>
          <span className="font-bold text-gray-900">EXTENDED PASS</span>
        </button>
      </div>

      {/* Search fields */}
      <div className="flex justify-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search Visitor Name"
            value={searchVisitor}
            onChange={(e) => setSearchVisitor(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600">
          <Plus className="w-6 h-6 text-white" />
        </div>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search Person to Visit"
            value={searchHost}
            onChange={(e) => setSearchHost(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left column - Visitors */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-blue-100 text-blue-800 p-4 rounded-lg text-center">Loading visitors...</div>
          ) : visitors.length === 0 ? (
            <div className="bg-blue-100 text-blue-800 p-4 rounded-lg text-center font-medium">No Visitors Found</div>
          ) : (
            visitors.map((visitor) => (
              <div key={visitor.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-blue-600">{visitor.name} - Active</h3>
                    <p className="text-sm text-gray-600">{visitor.id}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{visitor.mobile}</p>
                <p className="text-sm text-gray-600">{visitor.company}</p>
              </div>
            ))
          )}
        </div>

        {/* Right column - Hosts */}
        <div className="space-y-4">
          {hosts.map((host) => (
            <div key={host.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-blue-600 mb-1">{host.name}</h3>
              <p className="text-sm text-gray-600">{host.userId}</p>
              <p className="text-sm text-gray-600">{host.phone}</p>
              <p className="text-sm text-gray-600">{host.company}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Check-Out Visitors cube */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg min-w-[120px] text-center">
          <div className="text-sm font-medium">Check-Out</div>
          <div className="text-sm font-medium">Visitors</div>
          <div className="text-3xl font-bold mt-2">0</div>
        </div>
      </div>
    </div>
  )
}

export default Visitors
