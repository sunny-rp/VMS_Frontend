"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { rolesAPI } from "../services/api"

export default function Role() {
  const [showForm, setShowForm] = useState(false)
  const [roles, setRoles] = useState([])              // always keep an array here
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRole, setEditingRole] = useState(null)
  const [formData, setFormData] = useState({ roleName: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchRoles()
  }, [])

  const normalizeRoles = (res) => {
    // Accept common shapes: res, res.data, res.data.data, res.results, res.roles, etc.
    const payload = res?.data ?? res
    const list =
      Array.isArray(payload) ? payload :
      Array.isArray(payload?.data) ? payload.data :
      Array.isArray(payload?.results) ? payload.results :
      Array.isArray(payload?.roles) ? payload.roles :
      []
    return list
  }

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await rolesAPI.getAll()
      const list = normalizeRoles(response)
      setRoles(Array.isArray(list) ? list : [])
      if (!Array.isArray(list)) {
        setError("Unexpected response format from roles API.")
        console.warn("rolesAPI.getAll() unexpected shape:", response)
      }
    } catch (err) {
      console.error("Error fetching roles:", err)
      setRoles([]) // ensure roles stays an array
      setError("Failed to fetch roles")
    } finally {
      setLoading(false)
    }
  }

  const filteredRoles = (Array.isArray(roles) ? roles : []).filter((role) => {
    const name = (role?.roleName ?? "").toLowerCase()
    const code = (role?.roleCode ?? "").toLowerCase()
    const term = searchTerm.toLowerCase()
    return name.includes(term) || code.includes(term)
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      setLoading(true)
      if (editingRole) {
        // TODO: implement update when your API is ready
        console.log("Update functionality not implemented yet")
        setError("Update functionality not available")
      } else {
        const response = await rolesAPI.create({ roleName: formData.roleName })
        // Don’t assume a specific shape; just refetch
        await fetchRoles()
        resetForm()
      }
    } catch (err) {
      console.error("Error saving role:", err)
      setError(err?.message || "Failed to save role")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ roleName: "" })
    setEditingRole(null)
    setShowForm(false)
    setError("")
  }

  const handleEdit = (role) => {
    setFormData({ roleName: role?.roleName ?? "" })
    setEditingRole(role)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    console.log("Delete functionality not implemented yet")
    setError("Delete functionality not available")
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Role</h1>
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

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : editingRole ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              disabled={loading}
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
        <h1 className="text-2xl font-semibold text-gray-900">Role</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading roles...</p>
        </div>
      )}

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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.map((role) => (
                <tr key={role?.id ?? role?._id ?? role?.roleCode ?? crypto.randomUUID()} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(role?.id ?? role?._id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(role)} className="p-1 text-green-600 hover:bg-green-100 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{role?.roleCode ?? "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{role?.roleName ?? "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{role?.createdBy ?? "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{role?.createdOn ?? "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{role?.modifiedBy ?? "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{role?.modifiedOn ?? "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        (role?.status ?? "Inactive") === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {role?.status ?? "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {filteredRoles.length} of {filteredRoles.length} Entries
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
