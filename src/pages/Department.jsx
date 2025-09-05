"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"

const Department = () => {
  const [view, setView] = useState("list") // 'list' or 'form'
  const [departments, setDepartments] = useState([])
  const [filteredDepartments, setFilteredDepartments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [formData, setFormData] = useState({
    departmentName: "",
    headOfDepartment: "",
    status: "Active",
  })

  // Mock data for departments
  useEffect(() => {
    const mockDepartments = [
      {
        id: 1,
        departmentCode: "DPT00001",
        departmentName: "IT Department",
        headOfDepartment: "John Smith",
        createdBy: "Super Admin",
        createdOn: "2025-08-30 17:25:20",
        modifiedBy: "Super Admin",
        modifiedOn: "2025-09-01 15:45:00",
        status: "Active",
      },
      {
        id: 2,
        departmentCode: "DPT00005",
        departmentName: "ASSEMBLY",
        headOfDepartment: "Mike Johnson",
        createdBy: "Adhish Pandit",
        createdOn: "2025-09-01 14:48:23",
        modifiedBy: "Adhish Pandit",
        modifiedOn: "2025-09-01 15:44:32",
        status: "Active",
      },
      {
        id: 3,
        departmentCode: "DPT00007",
        departmentName: "CUTTING",
        headOfDepartment: "Sarah Wilson",
        createdBy: "Adhish Pandit",
        createdOn: "2025-09-01 14:48:43",
        modifiedBy: "Adhish Pandit",
        modifiedOn: "2025-09-01 15:43:36",
        status: "Active",
      },
      {
        id: 4,
        departmentCode: "DPT00011",
        departmentName: "LAB",
        headOfDepartment: "David Brown",
        createdBy: "Adhish Pandit",
        createdOn: "2025-09-01 14:49:24",
        modifiedBy: "Adhish Pandit",
        modifiedOn: "2025-09-01 15:43:20",
        status: "Active",
      },
      {
        id: 5,
        departmentCode: "DPT00013",
        departmentName: "ME",
        headOfDepartment: "Lisa Davis",
        createdBy: "Adhish Pandit",
        createdOn: "2025-09-01 14:49:43",
        modifiedBy: "Adhish Pandit",
        modifiedOn: "2025-09-01 15:43:04",
        status: "Active",
      },
      {
        id: 6,
        departmentCode: "DPT00008",
        departmentName: "ERP",
        headOfDepartment: "Robert Miller",
        createdBy: "Adhish Pandit",
        createdOn: "2025-09-01 14:48:59",
        modifiedBy: "Adhish Pandit",
        modifiedOn: "2025-09-01 15:42:34",
        status: "Active",
      },
      {
        id: 7,
        departmentCode: "DPT00009",
        departmentName: "HR & ADMIN",
        headOfDepartment: "Jennifer Garcia",
        createdBy: "Adhish Pandit",
        createdOn: "2025-09-01 14:49:05",
        modifiedBy: "Adhish Pandit",
        modifiedOn: "2025-09-01 15:42:15",
        status: "Active",
      },
      {
        id: 8,
        departmentCode: "DPT00015",
        departmentName: "PLANNING",
        headOfDepartment: "Michael Rodriguez",
        createdBy: "Adhish Pandit",
        createdOn: "2025-09-01 14:50:05",
        modifiedBy: "Adhish Pandit",
        modifiedOn: "2025-09-01 15:41:17",
        status: "Active",
      },
      {
        id: 9,
        departmentCode: "DPT00012",
        departmentName: "MAINTENANCE",
        headOfDepartment: "William Martinez",
        createdBy: "Adhish Pandit",
        createdOn: "2025-09-01 14:49:37",
        modifiedBy: "Adhish Pandit",
        modifiedOn: "2025-09-01 15:41:07",
        status: "Active",
      },
      {
        id: 10,
        departmentCode: "DPT00014",
        departmentName: "OPERATION",
        headOfDepartment: "Jessica Anderson",
        createdBy: "Adhish Pandit",
        createdOn: "2025-09-01 14:49:58",
        modifiedBy: "Adhish Pandit",
        modifiedOn: "2025-09-01 15:40:54",
        status: "Active",
      },
    ]
    setDepartments(mockDepartments)
    setFilteredDepartments(mockDepartments)
  }, [])

  // Filter departments based on search
  useEffect(() => {
    const filtered = departments.filter(
      (dept) =>
        dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.departmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredDepartments(filtered)
  }, [searchTerm, departments])

  const handleAddNew = () => {
    setEditingDepartment(null)
    setFormData({
      departmentName: "",
      headOfDepartment: "",
      status: "Active",
    })
    setView("form")
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setFormData({
      departmentName: department.departmentName,
      headOfDepartment: department.headOfDepartment,
      status: department.status,
    })
    setView("form")
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      setDepartments(departments.filter((dept) => dept.id !== id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingDepartment) {
      // Update existing department
      setDepartments(
        departments.map((dept) =>
          dept.id === editingDepartment.id
            ? {
                ...dept,
                ...formData,
                modifiedBy: "Current User",
                modifiedOn: new Date().toLocaleString("sv-SE").replace("T", " "),
              }
            : dept,
        ),
      )
    } else {
      // Add new department
      const newDepartment = {
        id: departments.length + 1,
        departmentCode: `DPT${String(departments.length + 1).padStart(5, "0")}`,
        ...formData,
        createdBy: "Current User",
        createdOn: new Date().toLocaleString("sv-SE").replace("T", " "),
        modifiedBy: "Current User",
        modifiedOn: new Date().toLocaleString("sv-SE").replace("T", " "),
      }
      setDepartments([...departments, newDepartment])
    }

    setView("list")
  }

  const handleCancel = () => {
    setView("list")
    setEditingDepartment(null)
    setFormData({
      departmentName: "",
      headOfDepartment: "",
      status: "Active",
    })
  }

  if (view === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Department</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {editingDepartment ? "Update" : "Save"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.departmentName}
                onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Head Of Department</label>
              <select
                value={formData.headOfDepartment}
                onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Head Of Department</option>
                <option value="John Smith">John Smith</option>
                <option value="Mike Johnson">Mike Johnson</option>
                <option value="Sarah Wilson">Sarah Wilson</option>
                <option value="David Brown">David Brown</option>
                <option value="Lisa Davis">Lisa Davis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </form>
        </div>

        {/* 3D Cube Graphics */}
        <div className="fixed bottom-8 right-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
              <div className="text-xs font-medium">Total Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 transform -rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
              <div className="text-xs font-medium">Check-In</div>
              <div className="text-xs font-medium">Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Department</h1>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(department.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(department)}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{department.departmentCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{department.departmentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{department.createdBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{department.createdOn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{department.modifiedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{department.modifiedOn}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        department.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {department.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing 1 to {Math.min(10, filteredDepartments.length)} of {filteredDepartments.length} Entries
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">«</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹</button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-600 rounded">1</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">2</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">3</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">›</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">»</button>
              <select className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Cube Graphics */}
      <div className="fixed bottom-8 right-8">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 transform rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
          <div className="text-xs font-medium">Check-In</div>
          <div className="text-xs font-medium">Visitors</div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>
    </div>
  )
}

export default Department
