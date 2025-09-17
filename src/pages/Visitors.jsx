"use client"

import { useState, useEffect } from "react"
import { appointmentsAPI, usersAPI, plantsAPI, departmentsAPI, areasAPI } from "../services/api"
import { Plus, Search, X, Calendar, Camera } from "lucide-react"

const Visitors = () => {
  const [visitors, setVisitors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchVisitor, setSearchVisitor] = useState("")
  const [searchPersonToVisit, setSearchPersonToVisit] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    plant: "",
    department: "",
    personToVisit: "",
    areaToVisit: "",
    appointmentDate: "",
    appointmentValidTill: "",
    purposeOfVisit: "",
    visitors: [
      {
        mobile: "",
        fullname: "",
        company: "",
        email: "",
        belongings: [],
      },
    ],
  })

  const [dropdownData, setDropdownData] = useState({
    plants: [],
    departments: [],
    users: [],
    areas: [],
  })

  const [belongings, setBelongings] = useState([])

  useEffect(() => {
    loadData()
    loadDropdownData()
  }, [])

  const loadDropdownData = async () => {
    try {
      const [plantsRes, departmentsRes, usersRes, areasRes] = await Promise.all([
        plantsAPI.getAll(),
        departmentsAPI.getAll(),
        usersAPI.getAll(),
        areasAPI.getAll(),
      ])

      setDropdownData({
        plants: Array.isArray(plantsRes.data) ? plantsRes.data : [],
        departments: Array.isArray(departmentsRes.data) ? departmentsRes.data : [],
        users: Array.isArray(usersRes.data) ? usersRes.data : [],
        areas: Array.isArray(areasRes.data) ? areasRes.data : [],
      })
    } catch (error) {
      console.error("Error loading dropdown data:", error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const appointmentsResponse = await appointmentsAPI.getAll({
        search: searchVisitor || searchPersonToVisit,
      })

      console.log("[v0] Appointments response:", appointmentsResponse)

      const appointmentsData = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : []

      const activeAppointments = appointmentsData.filter((appointment) => appointment.isAppointmentActive === true)

      const transformedVisitors = activeAppointments.map((appointment, index) => ({
        id: appointment.appointmentId || appointment._id || `APP${index + 1}`,
        name: appointment.visitors?.[0]?.fullname?.toUpperCase() || "UNKNOWN VISITOR",
        mobile: appointment.visitors?.[0]?.mobile || "N/A",
        company: appointment.visitors?.[0]?.company || "N/A",
        status: "Active", // You can add status logic based on appointment dates
        checkInTime: new Date(appointment.appointmentDate).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        personToVisit:
          appointment.personToVisit?.fullname?.toUpperCase() ||
          appointment.personToVisit?.name?.toUpperCase() ||
          "UNKNOWN",
        purpose: appointment.purposeOfVisit || "N/A",
        appointmentDate: appointment.appointmentDate,
        appointmentValidTill: appointment.appointmentValidTill,
        plant: appointment.plant,
        department: appointment.department,
        areaToVisit: appointment.areaToVisit,
      }))

      setAppointments(activeAppointments)
      setVisitors(transformedVisitors)
    } catch (error) {
      console.error("[v0] Error loading appointments:", error)
      setAppointments([])
      setVisitors([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadData()
  }

  const handleInputChange = (field, value) => {
    if (field.startsWith("visitor.")) {
      const visitorField = field.replace("visitor.", "")
      setFormData((prev) => ({
        ...prev,
        visitors: [
          {
            ...prev.visitors[0],
            [visitorField]: value,
          },
        ],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const addBelonging = () => {
    const newBelonging = {
      id: Date.now(),
      assetName: "",
    }
    setBelongings([...belongings, newBelonging])
  }

  const removeBelonging = (id) => {
    setBelongings(belongings.filter((item) => item.id !== id))
  }

  const updateBelonging = (id, field, value) => {
    setBelongings(belongings.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSave = async () => {
    try {
      const appointmentData = {
        plant: formData.plant,
        department: formData.department,
        personToVisit: formData.personToVisit,
        areaToVisit: formData.areaToVisit,
        appointmentDate: formData.appointmentDate,
        appointmentValidTill: formData.appointmentValidTill,
        purposeOfVisit: formData.purposeOfVisit,
        visitors: [
          {
            mobile: Number.parseInt(formData.visitors[0].mobile) || 0,
            fullname: formData.visitors[0].fullname,
            company: formData.visitors[0].company,
            email: formData.visitors[0].email,
            belongings: belongings.map((item) => ({
              assetName: item.assetName,
            })),
          },
        ],
      }

      console.log("[v0] Saving appointment:", appointmentData)

      const response = await appointmentsAPI.create(appointmentData)

      if (response.success) {
        console.log("[v0] Appointment created successfully:", response)
        alert("Appointment created successfully!")
        setShowForm(false)
        handleClear()
        loadData() // Reload the appointments list
      } else {
        console.error("[v0] Failed to create appointment:", response)
        alert("Failed to create appointment. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error creating appointment:", error)
      alert("Error creating appointment: " + (error.message || "Unknown error"))
    }
  }

  const handleClear = () => {
    setFormData({
      plant: "",
      department: "",
      personToVisit: "",
      areaToVisit: "",
      appointmentDate: "",
      appointmentValidTill: "",
      purposeOfVisit: "",
      visitors: [
        {
          mobile: "",
          fullname: "",
          company: "",
          email: "",
          belongings: [],
        },
      ],
    })
    setBelongings([])
  }

  return (
    <div className="p-6">
      {!showForm ? (
        <>
          {/* Header with search and add button */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Visitor
              </button>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Visitor Name"
                  value={searchVisitor}
                  onChange={(e) => setSearchVisitor(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Person to Visit"
                  value={searchPersonToVisit}
                  onChange={(e) => setSearchPersonToVisit(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Visitors</h2>

            {loading ? (
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center">Loading visitors...</div>
            ) : visitors.length === 0 ? (
              <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center">
                <div className="text-4xl mb-2">👥</div>
                <p className="font-medium">No Active Visitors</p>
                <p className="text-sm text-gray-500 mt-1">Click "Add Visitor" to register a new visitor</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visitors
                  .filter((visitor) => {
                    const matchesVisitorName = visitor.name.toLowerCase().includes(searchVisitor.toLowerCase())
                    const matchesPersonToVisit = visitor.personToVisit
                      .toLowerCase()
                      .includes(searchPersonToVisit.toLowerCase())
                    return matchesVisitorName && matchesPersonToVisit
                  })
                  .map((visitor) => (
                    <div
                      key={visitor.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">{visitor.name}</h3>
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            {visitor.status || "Active"}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 font-medium">{visitor.id}</p>
                          <p className="text-xs text-gray-400">{visitor.checkInTime}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📱</span>
                          <span className="text-gray-700">{visitor.mobile}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">🏢</span>
                          <span className="text-gray-700">{visitor.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">👤</span>
                          <span className="text-gray-700">{visitor.personToVisit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📋</span>
                          <span className="text-gray-700">{visitor.purpose}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                          <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded text-sm font-medium hover:bg-blue-100 transition-colors">
                            View Details
                          </button>
                          <button className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded text-sm font-medium hover:bg-red-100 transition-colors">
                            Check Out
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Stats card */}
          <div className="fixed bottom-6 right-6">
            <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg min-w-[140px] text-center">
              <div className="text-sm font-medium">Pending</div>
              <div className="text-sm font-medium">Check-Outs</div>
              <div className="text-3xl font-bold mt-2">0</div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Form Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Visitor Entry</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left side - Form fields */}
              <div className="lg:col-span-3 space-y-6">
                {/* Top row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plant <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.plant}
                      onChange={(e) => handleInputChange("plant", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Plant</option>
                      {dropdownData.plants.map((plant) => (
                        <option key={plant._id} value={plant._id}>
                          {(plant.plantName || plant.name || "").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {dropdownData.departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {(dept.departmentName || dept.name || "").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Person to Visit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.personToVisit}
                      onChange={(e) => handleInputChange("personToVisit", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Person to Visit</option>
                      {dropdownData.users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {(user.fullname || user.name || "").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Second row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area To Visit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.areaToVisit}
                      onChange={(e) => handleInputChange("areaToVisit", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Area To Visit</option>
                      {dropdownData.areas.map((area) => (
                        <option key={area._id} value={area._id}>
                          {(area.areaName || area.name || "").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={formData.appointmentDate}
                        onChange={(e) => handleInputChange("appointmentDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Valid Till <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={formData.appointmentValidTill}
                        onChange={(e) => handleInputChange("appointmentValidTill", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Third row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose Of Visit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.purposeOfVisit}
                      onChange={(e) => handleInputChange("purposeOfVisit", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Purpose Of Visit</option>
                      <option value="Interview">INTERVIEW</option>
                      <option value="Service">SERVICE</option>
                      <option value="Meeting">MEETING</option>
                      <option value="Training">TRAINING</option>
                      <option value="Others">OTHERS</option>
                    </select>
                  </div>
                </div>

                {/* Visitor Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.visitors[0]?.mobile || ""}
                        onChange={(e) => handleInputChange("visitor.mobile", e.target.value)}
                        placeholder="Enter Mobile No"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.visitors[0]?.fullname || ""}
                        onChange={(e) => handleInputChange("visitor.fullname", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={formData.visitors[0]?.company || ""}
                        onChange={(e) => handleInputChange("visitor.company", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.visitors[0]?.email || ""}
                        onChange={(e) => handleInputChange("visitor.email", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Belongings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Belongings</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {belongings.length === 0 ? (
                      <div className="text-center py-8">
                        <button
                          onClick={addBelonging}
                          className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-600 mx-auto"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <p className="text-gray-500 text-sm mt-2">Click + to add belongings</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-blue-50">
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Asset Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {belongings.map((item) => (
                              <tr key={item.id} className="border-b border-gray-200">
                                <td className="px-4 py-2">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={addBelonging}
                                      className="bg-green-500 text-white w-6 h-6 rounded flex items-center justify-center hover:bg-green-600"
                                    >
                                      +
                                    </button>
                                    <button
                                      onClick={() => removeBelonging(item.id)}
                                      className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    value={item.assetName}
                                    onChange={(e) => updateBelonging(item.id, "assetName", e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-4 text-sm text-blue-600">
                          Showing 1 to {belongings.length} of {belongings.length} Entries
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Photo placeholder */}
              <div className="lg:col-span-1">
                <div className="bg-gray-100 rounded-lg p-6 text-center h-64 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">NO IMAGE</p>
                  <button className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-600">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleClear}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                CLEAR
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Visitors
