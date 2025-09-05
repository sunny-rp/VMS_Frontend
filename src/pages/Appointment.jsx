"use client"

import { useState } from "react"
import { Search, Calendar, Mail } from "lucide-react"

const Appointment = () => {
  const [viewMode, setViewMode] = useState("table")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock appointment data
  const appointments = [
    {
      id: 1,
      hostName: "Adhish Pandit",
      visitorEntryCode: "VSE00008",
      visitorName: "Nanhe",
      mailId: "nanhekumar739@gmail.com",
      mobileNo: "9310583383",
      validFrom: "9/3/2025, 3:53:37 PM",
      validTo: "9/3/2025, 11:59:59 PM",
      status: "Approved",
      sharedMeal: false,
    },
    {
      id: 2,
      hostName: "Adhish Pandit",
      visitorEntryCode: "VSE00006",
      visitorName: "Santhosh",
      mailId: "santhoshraj.issm@gmail.com",
      mobileNo: "9176149959",
      validFrom: "9/3/2025, 3:41:10 PM",
      validTo: "9/3/2025, 11:59:59 PM",
      status: "Approved",
      sharedMeal: false,
    },
    {
      id: 3,
      hostName: "Adhish Pandit",
      visitorEntryCode: "VSE00004",
      visitorName: "Prashant",
      mailId: "",
      mobileNo: "9643491014",
      validFrom: "9/1/2025, 12:11:20 PM",
      validTo: "9/1/2025, 11:59:59 PM",
      status: "Approved",
      sharedMeal: false,
    },
  ]

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.visitorEntryCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Appointment</h1>

        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Table View</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={viewMode === "calendar"}
                onChange={(e) => setViewMode(e.target.checked ? "calendar" : "table")}
                className="sr-only"
              />
              <div
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  viewMode === "calendar" ? "bg-blue-500" : "bg-gray-300"
                }`}
                onClick={() => setViewMode(viewMode === "table" ? "calendar" : "table")}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    viewMode === "calendar" ? "translate-x-6" : "translate-x-0.5"
                  } mt-0.5`}
                />
              </div>
            </div>
            <span className="text-sm text-gray-600">Calendar View</span>
          </div>

          {/* Search */}
          <div className="relative">
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
      </div>

      {viewMode === "table" ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Host Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor Entry Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mail ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid From
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shared Meal to Visitor/Guest
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appointment.hostName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appointment.visitorEntryCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appointment.visitorName}</td>
                    <td className="px-4 py-3 text-sm text-blue-600">{appointment.mailId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appointment.mobileNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appointment.validFrom}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appointment.validTo}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appointment.sharedMeal ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  Showing 1 to {filteredAppointments.length} of {filteredAppointments.length} Entries
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹‹</button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹</button>
                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">1</button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">›</button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">››</button>
                <select className="ml-2 text-sm border border-gray-300 rounded px-2 py-1">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
          <p className="text-gray-500">Calendar view functionality will be implemented here.</p>
        </div>
      )}

      {/* 3D Cube */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xs font-medium">Check-In</div>
              <div className="text-xs font-medium">Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Appointment
