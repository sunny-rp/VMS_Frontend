"use client"

import { useState } from "react"
import { Search, Plus, Trash2 } from "lucide-react"

export default function UserWiseScreenMapping() {
  const [formData, setFormData] = useState({
    userRole: "",
    userName: "",
    moduleName: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [mappings, setMappings] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">User Wise Screen Mapping</h1>
        <div className="flex gap-2">
          <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-2 bg-red-600 text-white rounded hover:bg-red-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.userRole}
              onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Role</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="HOD">HOD</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Name <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select User</option>
              <option value="Adhish Pandit">Adhish Pandit</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module Name <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.moduleName}
              onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Modules</option>
              <option value="Master">Master</option>
              <option value="Admin">Admin</option>
              <option value="Users">Users</option>
              <option value="Approval">Approval</option>
              <option value="Visitor Management">Visitor Management</option>
              <option value="Reports">Reports</option>
            </select>
          </div>
        </form>

        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    Screen
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    Create
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    Update
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    Delete
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    View
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    Print
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No Data found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Showing 0 to 0 of 0 Entries</div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">‹</button>
              <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">50</button>
              <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Cube */}
      <div className="fixed bottom-8 right-8">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xs font-medium">Total Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-700 transform -rotate-12 rounded-lg shadow-lg flex items-center justify-center">
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
