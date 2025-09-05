"use client"

import { useState, useEffect } from "react"
import { usersAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { Search, Plus, Edit, Trash2, Shield, User, Phone, Building, CheckCircle, XCircle, X, Save } from "lucide-react"

const Users = () => {
  const { hasRole } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    company: "",
    roles: ["reception"],
    status: "active",
  })

  const roleOptions = [
    { value: "super_admin", label: "Super Admin", color: "bg-red-100 text-red-800" },
    { value: "admin", label: "Admin", color: "bg-blue-100 text-blue-800" },
    { value: "reception", label: "Reception", color: "bg-green-100 text-green-800" },
    { value: "security", label: "Security", color: "bg-orange-100 text-orange-800" },
  ]

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getAll()
      setUsers(response.data)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      name: "",
      mobile: "",
      company: "",
      roles: ["reception"],
      status: "active",
    })
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      mobile: user.mobile,
      company: user.company,
      roles: user.roles,
      status: user.status,
    })
    setShowModal(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.mobile) {
      alert("Please fill in required fields")
      return
    }

    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, formData)
      } else {
        await usersAPI.create(formData)
      }
      setShowModal(false)
      loadUsers()
    } catch (error) {
      alert("Error saving user: " + error.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await usersAPI.delete(userId)
      loadUsers()
    } catch (error) {
      alert("Error deleting user: " + error.message)
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      await usersAPI.update(userId, { status: newStatus })
      loadUsers()
    } catch (error) {
      alert("Error updating user status: " + error.message)
    }
  }

  const getRoleColor = (role) => {
    const roleOption = roleOptions.find((r) => r.value === role)
    return roleOption ? roleOption.color : "bg-gray-100 text-gray-800"
  }

  const getRoleLabel = (role) => {
    const roleOption = roleOptions.find((r) => r.value === role)
    return roleOption ? roleOption.label : role
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile.includes(searchTerm) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roles.some((role) => role.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>

        {hasRole(["super_admin"]) && (
          <button onClick={handleAddUser} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Add User
          </button>
        )}
      </div>

      {/* Search and filters */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name, mobile, company, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Users grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or add a new user.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="card p-6 hover:shadow-md transition-shadow">
              {/* User header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      user.status === "active" ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    <User className={`w-6 h-6 ${user.status === "active" ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">ID: {user.id}</p>
                  </div>
                </div>

                {hasRole(["super_admin", "admin"]) && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    {hasRole(["super_admin"]) && user.roles[0] !== "super_admin" && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* User details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{user.mobile}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building size={14} />
                  <span>{user.company}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={14} />
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span key={role} className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(role)}`}>
                        {getRoleLabel(role)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status and actions */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user.status === "active" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${user.status === "active" ? "text-green-600" : "text-red-600"}`}
                  >
                    {user.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                {hasRole(["super_admin", "admin"]) && user.roles[0] !== "super_admin" && (
                  <button
                    onClick={() => handleToggleStatus(user.id, user.status)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                      user.status === "active"
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {user.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{editingUser ? "Edit User" : "Add New User"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="input-field"
                  placeholder="Enter mobile number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.roles[0]}
                  onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                  className="input-field"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Save size={16} />
                  {editingUser ? "Update" : "Create"} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
