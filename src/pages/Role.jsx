// src/pages/Role.jsx
"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, X } from "lucide-react"
import { rolesAPI } from "../services/api"

// Display helper
const toDisplayDateTime = (iso) => {
  if (!iso) return "-"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString()
}

// Normalize roles list from various backend shapes
const asRoleArray = (res) => {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.roles)) return res.data.roles
  if (Array.isArray(res?.roles)) return res.roles
  if (res?.data && typeof res.data === "object") return [res.data]
  if (res && typeof res === "object" && (res.roleName || res._id)) return [res]
  return []
}

/** Simple confirmation modal */
const ConfirmDeleteModal = ({ open, title, message, onCancel, onConfirm, loading }) => {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={loading ? undefined : onCancel} />
      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 id="confirm-delete-title" className="text-lg font-semibold text-gray-900">
              {title || "Delete item"}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>
          <p id="confirm-delete-desc" className="mt-3 text-sm text-gray-600">
            {message || "Are you sure you want to delete this item? This action cannot be undone."}
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Trash2 size={16} />
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Role() {
  const [showForm, setShowForm] = useState(false)
  const [roles, setRoles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRole, setEditingRole] = useState(null)
  const [formData, setFormData] = useState({ roleName: "" })
  const [loading, setLoading] = useState(false)   // fetch/save
  const [deleting, setDeleting] = useState(false) // delete action
  const [error, setError] = useState("")

  // delete-modal state
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" })

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await rolesAPI.getAll()
      const list = asRoleArray(response)
      setRoles(Array.isArray(list) ? list : [])
      if (!Array.isArray(list)) {
        console.warn("Unexpected roles response:", response)
        setError("Unexpected roles response format.")
      }
    } catch (err) {
      console.error("Error fetching roles:", err)
      setRoles([])
      setError(err?.message || "Failed to fetch roles")
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      setLoading(true)
      if (editingRole?._id) {
        // ✅ PATCH /user/roles/edit-role/:roleId
        await rolesAPI.update(editingRole._id, { roleName: formData.roleName })
      } else {
        // ✅ POST /user/roles/create-role (assumed)
        await rolesAPI.create({ roleName: formData.roleName })
      }
      await fetchRoles()
      resetForm()
    } catch (err) {
      console.error("Error saving role:", err)
      setError(err?.response?.data?.message || err?.message || "Failed to save role")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (role) => {
    setFormData({ roleName: role?.roleName ?? "" })
    setEditingRole(role)
    setShowForm(true)
  }

  // open confirm modal
  const askDelete = (role) => {
    const id = role?._id || role?.id
    const name = role?.roleName || ""
    setConfirm({ open: true, id, name })
  }

  // perform delete (optimistic + rollback)
  const performDelete = async () => {
    const id = confirm.id
    if (!id) {
      setConfirm({ open: false, id: null, name: "" })
      return
    }
    try {
      setDeleting(true)
      setError("")
      const previous = roles
      // optimistic UI
      setRoles((prev) => prev.filter((r) => (r?._id || r?.id) !== id))
      try {
        // ✅ DELETE /user/roles/delete-role/:roleId
        await rolesAPI.delete(id)
        await fetchRoles() // ensure server truth
      } catch (err) {
        // rollback
        setRoles(previous)
        throw err
      } finally {
        setConfirm({ open: false, id: null, name: "" })
      }
    } catch (err) {
      console.error("Error deleting role:", err)
      setError(err?.response?.data?.message || err?.message || "Failed to delete role")
    } finally {
      setDeleting(false)
    }
  }

  const filteredRoles = (Array.isArray(roles) ? roles : []).filter((role) => {
    const name = (role?.roleName || "").toLowerCase()
    const term = searchTerm.toLowerCase()
    return name.includes(term)
  })

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Role</h1>
          <div className="flex gap-2">
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              disabled={loading || deleting}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || deleting}
              type="button"
            >
              {loading ? "Saving..." : editingRole ? "Update" : "Save"}
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
                disabled={loading || deleting}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || deleting}
            >
              {loading ? "Saving..." : editingRole ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              disabled={loading || deleting}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Decorative cube */}
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
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          disabled={loading || deleting}
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
                placeholder="Search by role name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(Array.isArray(filteredRoles) ? filteredRoles : []).map((role) => {
                const id = role?._id || role?.id
                const nameUpper = (role?.roleName || "").toUpperCase()
                const created = toDisplayDateTime(role?.createdAt)
                const updated = toDisplayDateTime(role?.updatedAt)
                const isActive = !!role?.isRoleActive
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => askDelete(role)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
                          title="Delete"
                          disabled={loading || deleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(role)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                          title="Edit"
                          disabled={loading || deleting}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50" title="View" disabled={loading || deleting}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nameUpper || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{created}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{updated}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                )
              })}
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

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={confirm.open}
        title="Delete role"
        message={
          confirm.name
            ? `Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`
            : "Are you sure you want to delete this role? This action cannot be undone."
        }
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={performDelete}
        loading={deleting}
      />

      {/* Decorative cube */}
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
