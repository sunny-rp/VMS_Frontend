"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, Camera, Upload } from "lucide-react"

export default function UserManagement() {
  const [showForm, setShowForm] = useState(false)
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    employeeName: "",
    userName: "",
    password: "",
    department: "",
    email: "",
    mobileNumber: "",
    secondaryMobileNumber: "",
    companyName: "",
    defaultCompany: "",
    plantName: "",
    defaultPlant: "",
    roleName: "",
    defaultRole: "",
    address: "",
    gateName: "",
    defaultGate: "",
    status: "Active",
  })

  // Mock data
  useEffect(() => {
    setUsers([
      { id: 1, userName: "PRAKASH SHARMA", roleName: "HOD", companyName: "SHUFAB", plantName: "SHUFAB" },
      { id: 2, userName: "SACHENDAR SINGH", roleName: "HOD", companyName: "SHUFAB", plantName: "SHUFAB" },
      { id: 3, userName: "PUNIT SHARMA", roleName: "HOD", companyName: "SHUFAB", plantName: "SHUFAB" },
      { id: 4, userName: "ASHOK KUMAR BIRLA", roleName: "HOD", companyName: "SHUFAB", plantName: "SHUFAB" },
      { id: 5, userName: "RAHUL DIXIT", roleName: "HOD", companyName: "SHUFAB", plantName: "SHUFAB" },
      { id: 6, userName: "CHITTA RANJAN GADANAYAK", roleName: "HOD", companyName: "SHUFAB", plantName: "SHUFAB" },
      { id: 7, userName: "NEERAJ KUMAR", roleName: "HOD", companyName: "SHUFAB", plantName: "SHUFAB" },
      { id: 8, userName: "RIDHAM BEHL", roleName: "OWNER", companyName: "SHUFAB", plantName: "SHUFAB" },
      { id: 9, userName: "SANJEEV KUMAR", roleName: "HOD", companyName: "SHUFAB", plantName: "SHUFAB" },
      { id: 10, userName: "RAVI SARASWAT", roleName: "HOD", companyName: "SHUFAB", plantName: "SHUFAB" },
    ])
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roleName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingUser) {
      setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...formData } : user)))
    } else {
      const newUser = {
        id: Date.now(),
        ...formData,
      }
      setUsers([...users, newUser])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      employeeName: "",
      userName: "",
      password: "",
      department: "",
      email: "",
      mobileNumber: "",
      secondaryMobileNumber: "",
      companyName: "",
      defaultCompany: "",
      plantName: "",
      defaultPlant: "",
      roleName: "",
      defaultRole: "",
      address: "",
      gateName: "",
      defaultGate: "",
      status: "Active",
    })
    setEditingUser(null)
    setShowForm(false)
  }

  const handleEdit = (user) => {
    setFormData({
      employeeName: user.employeeName || "",
      userName: user.userName,
      password: "",
      department: user.department || "",
      email: user.email || "",
      mobileNumber: user.mobileNumber || "",
      secondaryMobileNumber: user.secondaryMobileNumber || "",
      companyName: user.companyName,
      defaultCompany: user.defaultCompany || "",
      plantName: user.plantName,
      defaultPlant: user.defaultPlant || "",
      roleName: user.roleName,
      defaultRole: user.defaultRole || "",
      address: user.address || "",
      gateName: user.gateName || "",
      defaultGate: user.defaultGate || "",
      status: user.status || "Active",
    })
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">User</h1>
          <div className="flex gap-2">
            <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </button>
            <button className="p-2 bg-red-600 text-white rounded hover:bg-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex gap-6">
            {/* Profile Image Section */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center relative">
                <div className="text-center text-gray-500">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-xs font-medium">NO IMAGE</div>
                </div>
                <button className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  ×
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Employee Name</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Jane Smith">Jane Smith</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail ID</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Digital Sign Upload */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Digital Sign Upload</label>
              <button
                type="button"
                className="w-12 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="w-12 h-8 bg-red-600 text-white rounded flex items-center justify-center hover:bg-red-700 mt-1"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Mobile Number</label>
              <input
                type="tel"
                value={formData.secondaryMobileNumber}
                onChange={(e) => setFormData({ ...formData, secondaryMobileNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Company Name</option>
                <option value="SHUFAB">SHUFAB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Company <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.defaultCompany}
                onChange={(e) => setFormData({ ...formData, defaultCompany: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default Company</option>
                <option value="SHUFAB">SHUFAB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Name <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.plantName}
                onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Plant Name</option>
                <option value="SHUFAB">SHUFAB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Plant <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.defaultPlant}
                onChange={(e) => setFormData({ ...formData, defaultPlant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default Plant</option>
                <option value="SHUFAB">SHUFAB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Role Name</option>
                <option value="HOD">HOD</option>
                <option value="OWNER">OWNER</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.defaultRole}
                onChange={(e) => setFormData({ ...formData, defaultRole: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default Role</option>
                <option value="HOD">HOD</option>
                <option value="OWNER">OWNER</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gate Name</label>
              <select
                value={formData.gateName}
                onChange={(e) => setFormData({ ...formData, gateName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Gate Name</option>
                <option value="Main Gate">Main Gate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Gate</label>
              <select
                value={formData.defaultGate}
                onChange={(e) => setFormData({ ...formData, defaultGate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default Gate</option>
                <option value="Main Gate">Main Gate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
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

          <div className="flex gap-4">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {editingUser ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">User</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
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
            <div className="flex gap-2">
              <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                <Edit className="w-4 h-4" />
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
                  User Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plant Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.userName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.roleName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.companyName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.plantName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {Math.min(10, filteredUsers.length)} of {filteredUsers.length} Entries
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">‹</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">›</button>
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
