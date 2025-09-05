"use client"

import { useState } from "react"
import { Search, Calendar } from "lucide-react"

export default function VehicleInvoiceReport() {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    vehicleType: "",
    purposeOfVisit: "",
    vehicleEntryType: "",
    gate: "",
  })

  const [searchTerm, setSearchTerm] = useState("")

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleSearch = () => {
    console.log("Searching with filters:", filters)
  }

  const handleClear = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      vehicleType: "",
      purposeOfVisit: "",
      vehicleEntryType: "",
      gate: "",
    })
    setSearchTerm("")
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Vehicle Invoice Report</h1>
        </div>

        {/* Filter Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Select date"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange("toDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Select date"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type<span className="text-red-500">*</span>
              </label>
              <select
                value={filters.vehicleType}
                onChange={(e) => handleFilterChange("vehicleType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Vehicle Type</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Truck">Truck</option>
              </select>
            </div>

            {/* Vehicle Count Cards */}
            <div className="col-span-3 flex gap-4">
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-6 h-6 border-2 border-green-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full transform rotate-45"></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Checkin Vehicle Count</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-6 h-6 border-2 border-red-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-600 rounded-full transform -rotate-45"></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">CheckOut Vehicle Count</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose Of Visit</label>
              <select
                value={filters.purposeOfVisit}
                onChange={(e) => handleFilterChange("purposeOfVisit", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Purpose Of Visit</option>
                <option value="Business">Business</option>
                <option value="Meeting">Meeting</option>
                <option value="Interview">Interview</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Entry Type<span className="text-red-500">*</span>
              </label>
              <select
                value={filters.vehicleEntryType}
                onChange={(e) => handleFilterChange("vehicleEntryType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Vehicle Entry Type</option>
                <option value="Check In">Check In</option>
                <option value="Check Out">Check Out</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gate<span className="text-red-500">*</span>
              </label>
              <select
                value={filters.gate}
                onChange={(e) => handleFilterChange("gate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Gate</option>
                <option value="Main Gate">Main Gate</option>
                <option value="Side Gate">Side Gate</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              SEARCH
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              CLEAR
            </button>
          </div>
        </div>

        {/* Search and Export Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">📊</button>
              <button className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm">📋</button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  View
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Vehicle Entry Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Vehicle No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Vehicle Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Driver Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Driver MobileNo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Vehicle Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Purpose Of Visit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Entry Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Exit Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                  No Data Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium text-blue-600">0</span> to{" "}
              <span className="font-medium text-blue-600">0</span> of{" "}
              <span className="font-medium text-blue-600">0</span> Entries
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-2 py-1 text-gray-400 hover:text-gray-600">«</button>
              <button className="px-2 py-1 text-gray-400 hover:text-gray-600">‹</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
              <button className="px-2 py-1 text-gray-400 hover:text-gray-600">›</button>
              <button className="px-2 py-1 text-gray-400 hover:text-gray-600">»</button>
              <select className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Cube */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs">Total Visitors</div>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 transform -rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs">Check-In Visitors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
