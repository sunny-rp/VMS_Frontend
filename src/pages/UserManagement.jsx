"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { authAPI, usersAPI, departmentsAPI, companiesAPI, plantsAPI, rolesAPI } from "../services/api"

export default function UserManagement() {
  const [showForm, setShowForm] = useState(false)
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [companies, setCompanies] = useState([])
  const [plants, setPlants] = useState([])
  const [roles, setRoles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    fullname: "",
    password: "",
    department: "",
    mobile: "",
    company: "",
    plant: "",
    role: "",
    email: "", // optional
    address: "", // optional
  })

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
    fetchCompanies()
    fetchPlants()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getAll()
      if (response.success) {
        setUsers(response.data || [])
      } else {
        setError("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Error fetching users")
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll()
      if (response.success) {
        setDepartments(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      setDepartments([])
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await companiesAPI.getAll()
      if (response.success) {
        if (response.data) {
          // If it's a single company object, wrap it in an array
          const companyData = Array.isArray(response.data) ? response.data : [response.data]
          setCompanies(companyData)
        } else {
          setCompanies([])
        }
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      setCompanies([])
    }
  }

  const fetchPlants = async () => {
    try {
      const response = await plantsAPI.getAll()
      if (response.success) {
        setPlants(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error("Error fetching plants:", error)
      setPlants([])
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getAll()
      if (response.success) {
        if (response.data && response.data.roles) {
          setRoles(Array.isArray(response.data.roles) ? response.data.roles : [])
        } else if (Array.isArray(response.data)) {
          setRoles(response.data)
        } else {
          setRoles([])
        }
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      setRoles([])
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")

      if (editingUser) {
        // Update functionality would need a separate API endpoint
        console.log("Update user:", formData)
      } else {
        const response = await authAPI.register(formData)
        if (response.success) {
          await fetchUsers() // Refresh the users list
          resetForm()
        } else {
          setError(response.message || "Failed to create user")
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setError(error.message || "Error submitting form")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullname: "",
      password: "",
      department: "",
      mobile: "",
      company: "",
      plant: "",
      role: "",
      email: "",
      address: "",
    })
    setEditingUser(null)
    setShowForm(false)
    setError("")
  }

  const handleEdit = (user) => {
    setFormData({
      fullname: user.fullname || "",
      password: "",
      department: user.department || "",
      mobile: user.mobile || "",
      company: user.company || "",
      plant: user.plant || "",
      role: user.role || "",
      email: user.email || "",
      address: user.address || "",
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
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <button onClick={resetForm} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Back to List
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {(dept.departmentName || dept.name || "").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Company</option>
                {Array.isArray(companies) &&
                  companies.map((company, index) => (
                    <option key={company._id || company.id || index} value={company._id || company.id}>
                      {(company.companyName || company.name || "").toUpperCase()}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.plant}
                onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Plant</option>
                {Array.isArray(plants) &&
                  plants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {(plant.plantName || plant.name || "").toUpperCase()}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Role</option>
                {Array.isArray(roles) &&
                  roles.map((role, index) => (
                    <option key={role._id || role.id || index} value={role._id || role.id}>
                      {(role.roleName || role.name || "").toUpperCase()}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : editingUser ? "Update" : "Save"}
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">Loading users...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id || user._id || Math.random()} className="hover:bg-gray-50">
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {(user.fullname || user.userName || "N/A").toUpperCase()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {(user.mobile || "N/A").toString().toUpperCase()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {user.email || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {typeof user.role === "object" && user.role?.roleName
                          ? user.role.roleName.toUpperCase()
                          : (user.role || user.roleName || "N/A").toUpperCase()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {typeof user.department === "object" && user.department?.departmentName
                          ? user.department.departmentName.toUpperCase()
                          : (user.department || user.departmentName || "N/A").toUpperCase()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {typeof user.company === "object" && user.company?.companyName
                          ? user.company.companyName.toUpperCase()
                          : (user.company || user.companyName || "N/A").toUpperCase()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          )}
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
    </div>
  )
}
