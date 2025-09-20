// src/pages/Department.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Edit, Trash2, Eye, X } from "lucide-react"
import { departmentsAPI, usersAPI } from "../services/api"

/* ---------------- helpers ---------------- */
const toId = (x) => x?.id || x?._id || x?._id?.toString?.() || ""
const s = (v) => (typeof v === "string" ? v : "")
const isObjectId = (str) => /^[0-9a-fA-F]{24}$/.test(str || "")

const asArray = (res) => {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.items)) return res.items
  if (Array.isArray(res?.results)) return res.results
  if (res?.data && typeof res.data === "object") return [res.data]
  return []
}

const normalizeUser = (u) => ({
  id: toId(u),
  name: s(u?.fullname || u?.name || u?.username || u?.email),
})

const normalizeDepartment = (d) => {
  const id = toId(d)
  const hodId = toId(d?.headOfDepartment ?? d?.headOfDepartmentId)
  const hodName =
    (d?.headOfDepartment &&
      (d.headOfDepartment.fullname || d.headOfDepartment.name || d.headOfDepartment.email)) ||
    d?.headOfDepartmentName ||
    ""
  return {
    id,
    departmentName: s(d?.departmentName),
    status: d?.status || (d?.isDepartmentActive === false ? "Inactive" : "Active"),
    headOfDepartmentId: hodId,
    headOfDepartmentName: s(hodName),
  }
}

/* If your services/api.js doesn't expose departmentsAPI.delete yet, set this false to hide the delete UI. */
const HAS_DELETE_API = !!(departmentsAPI && departmentsAPI.delete)

/* ---------------- confirmation modal ---------------- */
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

/* ---------------- component ---------------- */
const Department = () => {
  const [view, setView] = useState("list")
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [formData, setFormData] = useState({ departmentName: "", headOfDepartmentId: "" })
  const [loading, setLoading] = useState(false)   // fetch/save
  const [deleting, setDeleting] = useState(false) // delete flow
  const [error, setError] = useState("")
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" }) // modal state

  /* ------- data fetch ------- */
  const fetchDepartments = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await departmentsAPI.getAll()
      const listRaw =
        Array.isArray(res?.data?.departments)
          ? res.data.departments
          : asArray(res)
      const list = listRaw.map(normalizeDepartment)
      setDepartments(list)
    } catch (e) {
      console.error("Error fetching departments:", e)
      setError("Failed to fetch departments")
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAll()
      const listRaw = Array.isArray(res?.data?.users) ? res.data.users : asArray(res)
      setUsers(listRaw.map(normalizeUser))
    } catch (e) {
      console.error("Error fetching users:", e)
      setUsers([])
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchUsers()
  }, [])

  /* ------- filtering ------- */
  const filteredDepartments = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return departments.filter(
      (d) =>
        d.departmentName?.toLowerCase().includes(q) ||
        d.headOfDepartmentName?.toLowerCase().includes(q),
    )
  }, [departments, searchTerm])

  /* ------- actions ------- */
  const handleAddNew = () => {
    setEditingDepartment(null)
    setFormData({ departmentName: "", headOfDepartmentId: "" })
    setError("")
    setView("form")
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setFormData({
      departmentName: department.departmentName || "",
      headOfDepartmentId: department.headOfDepartmentId || "",
    })
    setError("")
    setView("form")
  }

  // open confirmation modal instead of alert
  const promptDelete = (id, name = "") => {
    if (!HAS_DELETE_API) return
    setConfirm({ open: true, id, name })
  }

  // perform delete (optimistic + rollback)
  const performDelete = async () => {
    const id = confirm.id
    if (!id || !HAS_DELETE_API) return
    try {
      setDeleting(true)
      setError("")
      if (!isObjectId(id)) throw new Error("Invalid department id")

      // optimistic
      const prev = departments
      setDepartments((list) => list.filter((d) => d.id !== id))

      try {
        await departmentsAPI.delete(id)
        await fetchDepartments() // ensure truth with backend
        if (editingDepartment?.id === id) {
          handleCancel()
        }
      } catch (e) {
        setDepartments(prev) // rollback
        throw e
      } finally {
        setConfirm({ open: false, id: null, name: "" })
      }
    } catch (e) {
      console.error("Error deleting department:", e)
      setError(e?.response?.data?.message || e?.message || "Failed to delete department")
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.departmentName.trim()) {
      setError("Department name is required")
      return
    }
    if (formData.headOfDepartmentId && !isObjectId(formData.headOfDepartmentId)) {
      setError("Head Of Department id is invalid")
      return
    }

    try {
      setLoading(true)
      setError("")
      const payload = {
        departmentName: formData.departmentName,
        headOfDepartment: formData.headOfDepartmentId || null,
      }

      if (editingDepartment?.id) {
        await departmentsAPI.update(editingDepartment.id, payload)
      } else {
        await departmentsAPI.create(payload)
      }

      await fetchDepartments()
      setView("list")
      setEditingDepartment(null)
      setFormData({ departmentName: "", headOfDepartmentId: "" })
    } catch (e) {
      console.error("Error saving department:", e)
      setError(e?.response?.data?.message || e?.message || "Failed to save department")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setView("list")
    setEditingDepartment(null)
    setFormData({ departmentName: "", headOfDepartmentId: "" })
    setError("")
  }

  /* ------- render ------- */
  if (view === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Department</h1>
          <div className="flex space-x-2">
            {HAS_DELETE_API && editingDepartment?.id && (
              <button
                onClick={() => promptDelete(editingDepartment.id, editingDepartment.departmentName)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={loading || deleting}
                type="button"
                title="Delete this department"
              >
                <Trash2 className="inline w-4 h-4 mr-1" />
                Delete
              </button>
            )}
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              disabled={loading || deleting}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || deleting}
              type="button"
            >
              {loading ? "Saving..." : editingDepartment ? "Update" : "Save"}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                disabled={loading || deleting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Head Of Department</label>
              <select
                value={formData.headOfDepartmentId}
                onChange={(e) => setFormData({ ...formData, headOfDepartmentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || deleting}
              >
                <option value="">Select Head Of Department</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Decorative cards */}
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

        {/* Delete confirmation modal (available in form view) */}
        {HAS_DELETE_API && (
          <ConfirmDeleteModal
            open={confirm.open}
            title="Delete department"
            message={
              confirm.name
                ? `Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`
                : "Are you sure you want to delete this department? This action cannot be undone."
            }
            onCancel={() => setConfirm({ open: false, id: null, name: "" })}
            onConfirm={performDelete}
            loading={deleting}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Department</h1>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
          disabled={loading || deleting}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

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
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Loading departments...</div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head Of Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No departments found</td>
                  </tr>
                ) : (
                  filteredDepartments.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {HAS_DELETE_API && (
                            <button
                              onClick={() => promptDelete(d.id, d.departmentName)}
                              className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                              title="Delete"
                              disabled={loading || deleting}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(d)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Edit"
                            disabled={loading || deleting}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-blue-600 hover:text-blue-800" title="View" disabled={loading || deleting}>
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.departmentName.toUpperCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.headOfDepartmentName.toUpperCase() || "Not assigned"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          d.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
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
                <option>10</option><option>25</option><option>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative cards */}
      <div className="fixed bottom-8 right-8">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 transform rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
          <div className="text-xs font-medium">Check-In</div>
          <div className="text-xs font-medium">Visitors</div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>

      {/* Delete confirmation modal (available in list view) */}
      {HAS_DELETE_API && (
        <ConfirmDeleteModal
          open={confirm.open}
          title="Delete department"
          message={
            confirm.name
              ? `Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`
              : "Are you sure you want to delete this department? This action cannot be undone."
          }
          onCancel={() => setConfirm({ open: false, id: null, name: "" })}
          onConfirm={performDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}

export default Department
