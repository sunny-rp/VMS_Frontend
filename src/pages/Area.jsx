"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, FileText, Download } from "lucide-react"

const Area = () => {
  const [showForm, setShowForm] = useState(false)
  const [areas, setAreas] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    company: "",
    plant: "",
    areaName: "",
    status: "Active",
  })
  const [editingId, setEditingId] = useState(null)

  // Mock data for areas
  useEffect(() => {
    const mockAreas = [
      {
        id: 1,
        company: "SHUFAB",
        plantName: "SHUFAB",
        areaCode: "ARA00002",
        areaName: "PARTNERS OFFICE",
        createdBy: "Super Admin",
        createdOn: "2025-08-30 15:04:36",
        modifiedBy: "Super Admin",
        modifiedOn: "2025-09-01 14:39:11",
        status: "Active",
      },
      {
        id: 2,
        company: "SHUFAB",
        plantName: "SHUFAB",
        areaCode: "ARA00003",
        areaName: "HOD OFFICE",
        createdBy: "Super Admin",
        createdOn: "2025-08-30 15:04:36",
        modifiedBy: "Super Admin",
        modifiedOn: "2025-09-01 14:39:11",
        status: "Active",
      },
      {
        id: 3,
        company: "SHUFAB",
        plantName: "SHUFAB",
        areaCode: "ARE00001",
        areaName: "CONFERENCE ROOM MAIN",
        createdBy: "Super Admin",
        createdOn: "2025-08-30 15:04:36",
        modifiedBy: "Super Admin",
        modifiedOn: "2025-09-01 14:39:11",
        status: "Active",
      },
    ]
    setAreas(mockAreas)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      // Update existing area
      setAreas(
        areas.map((area) =>
          area.id === editingId
            ? {
                ...area,
                ...formData,
                areaCode: `ARE${String(area.id).padStart(5, "0")}`,
                modifiedBy: "Super Admin",
                modifiedOn: new Date().toLocaleString("sv-SE").replace("T", " "),
              }
            : area,
        ),
      )
      setEditingId(null)
    } else {
      // Add new area
      const newArea = {
        id: areas.length + 1,
        ...formData,
        areaCode: `ARE${String(areas.length + 1).padStart(5, "0")}`,
        createdBy: "Super Admin",
        createdOn: new Date().toLocaleString("sv-SE").replace("T", " "),
        modifiedBy: "Super Admin",
        modifiedOn: new Date().toLocaleString("sv-SE").replace("T", " "),
      }
      setAreas([...areas, newArea])
    }

    setFormData({ company: "", plant: "", areaName: "", status: "Active" })
    setShowForm(false)
  }

  const handleEdit = (area) => {
    setFormData({
      company: area.company,
      plant: area.plantName,
      areaName: area.areaName,
      status: area.status,
    })
    setEditingId(area.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setAreas(areas.filter((area) => area.id !== id))
  }

  const filteredAreas = areas.filter(
    (area) =>
      area.areaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.areaCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Area</h1>
          <div className="flex space-x-2">
            <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              <FileText className="w-4 h-4" />
            </button>
            <button className="p-2 bg-red-600 text-white rounded hover:bg-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Company</option>
                <option value="SHUFAB">SHUFAB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.plant}
                onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Plant</option>
                <option value="SHUFAB">SHUFAB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.areaName}
                onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setFormData({ company: "", plant: "", areaName: "", status: "Active" })
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* 3D Cube */}
        <div className="fixed bottom-8 right-8">
          <div className="relative w-32 h-32 transform-gpu perspective-1000">
            <div className="absolute inset-0 transform-style-preserve-3d animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 transform rotateY-0 translateZ-16"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 transform rotateY-90 translateZ-16"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 transform rotateX-90 translateZ-16"></div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs font-semibold z-10">
              <div className="text-center">
                <div>Check-In</div>
                <div>Visitors</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Area</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
                <FileText className="w-4 h-4" />
              </button>
              <button className="p-2 bg-orange-600 text-white rounded hover:bg-orange-700">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plant Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAreas.map((area) => (
                <tr key={area.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(area.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(area)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{area.company}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{area.plantName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{area.areaCode}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{area.areaName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {filteredAreas.length} of {filteredAreas.length} Entries
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">«</button>
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹</button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">›</button>
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">»</button>
            <select className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3D Cube */}
      <div className="fixed bottom-8 right-8">
        <div className="relative w-32 h-32 transform-gpu perspective-1000">
          <div className="absolute inset-0 transform-style-preserve-3d animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 transform rotateY-0 translateZ-16"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 transform rotateY-90 translateZ-16"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 transform rotateX-90 translateZ-16"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold z-10">
            <div className="grid grid-cols-2 gap-1 text-center">
              <div className="bg-blue-600 p-1 rounded">
                <div>Check-In</div>
                <div>Visitors</div>
                <div className="text-lg font-bold">0</div>
              </div>
              <div className="bg-red-600 p-1 rounded">
                <div>Check-Out</div>
                <div>Visitors</div>
                <div className="text-lg font-bold">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Area
