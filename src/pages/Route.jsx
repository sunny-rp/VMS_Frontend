"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

const Route = () => {
  const [view, setView] = useState("list") // 'list' or 'form'
  const [routes, setRoutes] = useState([])
  const [filteredRoutes, setFilteredRoutes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRoute, setEditingRoute] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    routeName: "",
    fromLocation: "",
    toLocation: "",
    routeDescription: "",
    distance: "",
    status: "Active",
  })

  // Mock data - empty initially as shown in screenshot
  useEffect(() => {
    const mockRoutes = []
    setRoutes(mockRoutes)
    setFilteredRoutes(mockRoutes)
  }, [])

  // Filter routes based on search term
  useEffect(() => {
    const filtered = routes.filter(
      (route) =>
        route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.routeCode.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRoutes(filtered)
    setCurrentPage(1)
  }, [searchTerm, routes])

  // Pagination
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRoutes = filteredRoutes.slice(startIndex, endIndex)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingRoute) {
      // Update existing route
      const updatedRoutes = routes.map((route) =>
        route.id === editingRoute.id
          ? {
              ...route,
              ...formData,
              modifiedBy: "Super Admin",
              modifiedOn: new Date()
                .toLocaleString("en-GB", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
                .replace(/(\d+)\/(\d+)\/(\d+),/, "$3-$2-$1"),
            }
          : route,
      )
      setRoutes(updatedRoutes)
    } else {
      // Add new route
      const newRoute = {
        id: Date.now(),
        routeCode: `RTE${String(routes.length + 1).padStart(5, "0")}`,
        ...formData,
        createdBy: "Super Admin",
        createdOn: new Date()
          .toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
          .replace(/(\d+)\/(\d+)\/(\d+),/, "$3-$2-$1"),
        modifiedBy: "Super Admin",
        modifiedOn: new Date()
          .toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
          .replace(/(\d+)\/(\d+)\/(\d+),/, "$3-$2-$1"),
      }
      setRoutes([...routes, newRoute])
    }

    // Reset form
    setFormData({
      routeName: "",
      fromLocation: "",
      toLocation: "",
      routeDescription: "",
      distance: "",
      status: "Active",
    })
    setEditingRoute(null)
    setView("list")
  }

  const handleEdit = (route) => {
    setEditingRoute(route)
    setFormData({
      routeName: route.routeName,
      fromLocation: route.fromLocation,
      toLocation: route.toLocation,
      routeDescription: route.routeDescription || "",
      distance: route.distance || "",
      status: route.status,
    })
    setView("form")
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      setRoutes(routes.filter((route) => route.id !== id))
    }
  }

  const handleAdd = () => {
    setEditingRoute(null)
    setFormData({
      routeName: "",
      fromLocation: "",
      toLocation: "",
      routeDescription: "",
      distance: "",
      status: "Active",
    })
    setView("form")
  }

  if (view === "form") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Route</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView("list")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>📊</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <span>🗑️</span>
            </button>
            <button
              onClick={() => setView("list")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <span>🔍</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="routeName"
                  value={formData.routeName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Location<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fromLocation"
                  value={formData.fromLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Location<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="toLocation"
                  value={formData.toLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route Description</label>
                <input
                  type="text"
                  name="routeDescription"
                  value={formData.routeDescription}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance(in Kms)<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status<span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setView("list")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {editingRoute ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>

        {/* 3D Cube */}
        <div className="fixed bottom-8 right-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
              <div className="text-xs font-medium mb-1">Total Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
            <div className="absolute -top-2 -right-2 w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-700 transform -rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
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
        <h1 className="text-2xl font-semibold text-gray-900">Route</h1>
        <button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2">
            <span>📊</span>
          </button>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center space-x-2">
            <span>📄</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Route Code
                  <span className="ml-1">↕️</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Route Name
                  <span className="ml-1">↕️</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  From Location
                  <span className="ml-1">↕️</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  To Location
                  <span className="ml-1">↕️</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Created By
                  <span className="ml-1">↕️</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Created On
                  <span className="ml-1">↕️</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Modified By
                  <span className="ml-1">↕️</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Modified On
                  <span className="ml-1">↕️</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Status
                  <span className="ml-1">↕️</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRoutes.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                    No Data Found
                  </td>
                </tr>
              ) : (
                currentRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleDelete(route.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleEdit(route)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.routeCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.routeName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.fromLocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.toLocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.createdBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.createdOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.modifiedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.modifiedOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          route.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {route.status}
                      </span>
                    </td>
                  </tr>
                ))
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
                <span className="font-medium">{Math.min(endIndex, filteredRoutes.length)}</span> of{" "}
                <span className="font-medium">{filteredRoutes.length}</span> Entries
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? "z-10 bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>

              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="ml-2 border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Cube */}
      <div className="fixed bottom-8 right-8">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
            <div className="text-xs font-medium mb-1">Total Visitors</div>
            <div className="text-2xl font-bold">0</div>
          </div>
          <div className="absolute -top-2 -right-2 w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-700 transform -rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
            <div className="text-xs font-medium mb-1">Check-In</div>
            <div className="text-xs font-medium mb-1">Visitors</div>
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Route
