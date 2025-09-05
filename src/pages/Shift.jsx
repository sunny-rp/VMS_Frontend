"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, Calendar } from "lucide-react"

const Shift = () => {
  const [view, setView] = useState("list") // 'list' or 'form'
  const [shifts, setShifts] = useState([])
  const [filteredShifts, setFilteredShifts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [editingShift, setEditingShift] = useState(null)
  const [formData, setFormData] = useState({
    shiftName: "",
    fromTime: "",
    toTime: "",
    shiftHours: "",
    status: "Active",
  })

  // Mock data for shifts
  const mockShifts = []

  useEffect(() => {
    setShifts(mockShifts)
    setFilteredShifts(mockShifts)
  }, [])

  useEffect(() => {
    const filtered = shifts.filter(
      (shift) =>
        shift.shiftName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.fromTime?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.toTime?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredShifts(filtered)
    setCurrentPage(1)
  }, [searchTerm, shifts])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleAddNew = () => {
    setEditingShift(null)
    setFormData({
      shiftName: "",
      fromTime: "",
      toTime: "",
      shiftHours: "",
      status: "Active",
    })
    setView("form")
  }

  const handleEdit = (shift) => {
    setEditingShift(shift)
    setFormData({
      shiftName: shift.shiftName,
      fromTime: shift.fromTime,
      toTime: shift.toTime,
      shiftHours: shift.shiftHours,
      status: shift.status,
    })
    setView("form")
  }

  const handleDelete = (shiftId) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      setShifts(shifts.filter((shift) => shift.id !== shiftId))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingShift) {
      // Update existing shift
      setShifts(
        shifts.map((shift) =>
          shift.id === editingShift.id
            ? { ...shift, ...formData, modifiedOn: new Date().toISOString(), modifiedBy: "Super Admin" }
            : shift,
        ),
      )
    } else {
      // Add new shift
      const newShift = {
        id: Date.now(),
        shiftCode: `SHT${String(shifts.length + 1).padStart(5, "0")}`,
        ...formData,
        createdBy: "Super Admin",
        createdOn: new Date().toISOString(),
        modifiedBy: "Super Admin",
        modifiedOn: new Date().toISOString(),
      }
      setShifts([...shifts, newShift])
    }

    setView("list")
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const calculateShiftHours = () => {
    if (formData.fromTime && formData.toTime) {
      const from = new Date(`2000-01-01 ${formData.fromTime}`)
      const to = new Date(`2000-01-01 ${formData.toTime}`)

      if (to < from) {
        to.setDate(to.getDate() + 1) // Next day
      }

      const diffMs = to - from
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

      const hours = `${String(diffHours).padStart(2, "0")}:${String(diffMinutes).padStart(2, "0")}`
      setFormData((prev) => ({ ...prev, shiftHours: hours }))
    }
  }

  useEffect(() => {
    calculateShiftHours()
  }, [formData.fromTime, formData.toTime])

  // Pagination
  const totalPages = Math.ceil(filteredShifts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentShifts = filteredShifts.slice(startIndex, endIndex)

  if (view === "form") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Shift</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView("list")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View List</span>
            </button>
            <button
              type="submit"
              form="shift-form"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={() => setView("list")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form id="shift-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift Name</label>
                <input
                  type="text"
                  name="shiftName"
                  value={formData.shiftName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Time<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="fromTime"
                    value={formData.fromTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Time<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="toTime"
                    value={formData.toTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shift Hours<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="shiftHours"
                    value={formData.shiftHours}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status<span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* 3D Cube */}
        <div className="fixed bottom-8 right-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
              <div className="text-xs font-medium mb-1">Check-In</div>
              <div className="text-xs font-medium mb-1">Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Shift</h1>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* Search and Export */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <span>📊</span>
            <span>Excel</span>
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2">
            <span>📄</span>
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Shift Name ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  From Time ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  To Time ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Shift Hours ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Created By ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Created On ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Modified By ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Modified On ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Status ↕
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentShifts.length > 0 ? (
                currentShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDelete(shift.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(shift)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.shiftName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.fromTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.toTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.shiftHours}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.createdBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(shift.createdOn).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.modifiedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(shift.modifiedOn).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          shift.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {shift.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-blue-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredShifts.length)}</span> of{" "}
                <span className="font-medium">{filteredShifts.length}</span> Entries
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                ««
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                ‹
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index
                if (pageNumber <= totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNumber
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                }
                return null
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                »»
              </button>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Cube */}
      <div className="fixed bottom-8 right-8">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
            <div className="text-xs font-medium mb-1">Total Visitors</div>
            <div className="text-2xl font-bold mb-1">0</div>
            <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium">
              Check-In Visitors: 0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shift
