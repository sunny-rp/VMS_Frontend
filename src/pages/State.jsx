// src/pages/State.jsx
"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { statesAPI, countriesAPI } from "../services/api"

// Helpers (module scope)
const toDisplayDateTime = (iso) => {
  if (!iso) return "-"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString()
}
const up = (s) => (s ? String(s).toUpperCase() : "-")

/** Simple confirmation modal (no external libs) */
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
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h2 id="confirm-delete-title" className="text-lg font-semibold text-gray-900">
              {title || "Delete item"}
            </h2>
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
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}

const State = () => {
  const [view, setView] = useState("list") // 'list' or 'form'
  const [states, setStates] = useState([])
  const [countries, setCountries] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingState, setEditingState] = useState(null)
  const [formData, setFormData] = useState({
    countryId: "", // store the country _id
    stateName: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Confirmation modal state
  const [confirm, setConfirm] = useState({
    open: false,
    id: null,
    name: "",
  })

  useEffect(() => {
    fetchStates()
    fetchCountries()
  }, [])

  const fetchStates = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await statesAPI.getAll()
      // Accept common shapes: {data:[...]}, {data:{states:[...]}}
      const list = Array.isArray(res?.data?.states)
        ? res.data.states
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : []
      setStates(list)
      if (!Array.isArray(list)) {
        console.warn("Unexpected states response:", res)
        setError("Unexpected states response format.")
      }
    } catch (e) {
      console.error("Error fetching states:", e)
      setStates([])
      setError(e?.response?.data?.message || e?.message || "Failed to fetch states")
    } finally {
      setLoading(false)
    }
  }

  const fetchCountries = async () => {
    try {
      const res = await countriesAPI.getAll()
      // Countries API: { statusCode, data:[{_id, countryName, ...}], ... }
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : []
      setCountries(list)
      if (!Array.isArray(list)) {
        console.warn("Unexpected countries response:", res)
      }
    } catch (e) {
      console.error("Error fetching countries:", e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      setLoading(true)
      const payload = {
        stateName: formData.stateName,
        country: formData.countryId, // backend expects the id here
      }

      if (editingState?._id) {
        // ✅ PATCH /user/states/edit-state/:stateId
        await statesAPI.update(editingState._id, payload)
        await fetchStates()
      } else {
        await statesAPI.create(payload)
        await fetchStates()
      }
      resetForm()
    } catch (e) {
      console.error("Error saving state:", e)
      setError(e?.response?.data?.message || e?.message || "Failed to save state")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ countryId: "", stateName: "" })
    setEditingState(null)
    setView("list")
    setError("")
  }

  const handleEdit = (state) => {
    setEditingState(state)
    // state.country may be an object ({_id, countryName}) or an id string
    const countryId =
      typeof state?.country === "string" ? state.country : state?.country?._id || ""
    setFormData({
      countryId,
      stateName: state?.stateName || "",
    })
    setView("form")
  }

  /** Open confirmation modal (no alerts) */
  const promptDelete = (id, name = "") => {
    setConfirm({ open: true, id, name })
  }

  /** Actual delete (optimistic + rollback), invoked from the modal confirm button */
  const performDelete = async () => {
    const id = confirm.id
    if (!id) return

    setError("")
    setLoading(true)

    // optimistic update
    const prevStates = states
    setStates((prev) => prev.filter((s) => (s?._id || s?.id) !== id))

    try {
      await statesAPI.delete(id)
      await fetchStates() // ensure truth with backend
      if (editingState?._id === id) {
        resetForm()
      }
      setConfirm({ open: false, id: null, name: "" })
    } catch (e) {
      console.error("Error deleting state:", e)
      setError(e?.response?.data?.message || e?.message || "Failed to delete state")
      // rollback optimistic update
      setStates(prevStates)
      setConfirm({ open: false, id: null, name: "" })
    } finally {
      setLoading(false)
    }
  }

  // country lookup helpers
  const getCountryNameById = (id) => {
    const c = countries.find((x) => x?._id === id)
    return c?.countryName || "-"
  }
  const getDisplayCountryName = (countryField) => {
    if (countryField && typeof countryField === "object") {
      return countryField.countryName || "-"
    }
    if (typeof countryField === "string") {
      return getCountryNameById(countryField)
    }
    return "-"
  }

  const list = Array.isArray(states) ? states : []
  const filteredStates = list.filter((state) => {
    const stateName = (state?.stateName || "").toLowerCase()
    const countryName = getDisplayCountryName(state?.country).toLowerCase()
    const term = searchTerm.toLowerCase()
    return stateName.includes(term) || countryName.includes(term)
  })

  if (view === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {editingState?._id ? "Edit State" : "Create State"}
          </h1>
          <div className="flex space-x-2">
            {/* New state */}
            <button
              onClick={() => {
                setEditingState(null)
                setFormData({ countryId: "", stateName: "" })
              }}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
              title="New state"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Delete current state (opens modal) */}
            <button
              onClick={() =>
                editingState?._id && promptDelete(editingState._id, editingState?.stateName || "")
              }
              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              disabled={!editingState?._id || loading}
              title="Delete this state"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Decorative/search affordance */}
            <button
              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.countryId}
                onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c?._id} value={c?._id}>
                    {up(c?.countryName)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.stateName}
                onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : editingState ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Decorative cube */}
        <div className="fixed bottom-8 right-8">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-xs font-medium">Total Visitors</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform -rotate-12 translate-x-4 translate-y-4 rounded-lg shadow-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-xs font-medium">Check-In Visitors</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
        <ConfirmDeleteModal
          open={confirm.open}
          title="Delete state"
          message={
            confirm.name
              ? `Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`
              : "Are you sure you want to delete this state? This action cannot be undone."
          }
          onCancel={() => setConfirm({ open: false, id: null, name: "" })}
          onConfirm={performDelete}
          loading={loading}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">State</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setView("form")}
            className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
            title="Create state"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by state or country"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredStates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No Data Found</td>
                </tr>
              ) : (
                filteredStates.map((state, idx) => {
                  const id = state?._id || state?.id
                  const stateName = up(state?.stateName)
                  const countryName = up(getDisplayCountryName(state?.country))
                  const created = toDisplayDateTime(state?.createdAt)
                  const updated = toDisplayDateTime(state?.updatedAt)
                  const isActive = !!state?.isStateActive
                  return (
                    <tr key={id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => id && promptDelete(id, state?.stateName || "")}
                            className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
                            title="Delete"
                            disabled={!id || loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(state)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                            title="Edit"
                            disabled={loading}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50"
                            title="View"
                            disabled={loading}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{stateName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{countryName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{created}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{updated}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {filteredStates.length} of {filteredStates.length} Entries
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">«</button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">‹</button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">›</button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">»</button>
          </div>
        </div>
      </div>

      {/* Decorative cube */}
      <div className="fixed bottom-8 right-8">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xs font-medium">Total Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform -rotate-12 translate-x-4 translate-y-4 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xs font-medium">Check-In Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={confirm.open}
        title="Delete state"
        message={
          confirm.name
            ? `Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`
            : "Are you sure you want to delete this state? This action cannot be undone."
        }
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={performDelete}
        loading={loading}
      />
    </div>
  )
}

export default State
