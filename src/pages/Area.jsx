// src/pages/Area.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Search, Edit, Trash2, Eye, FileText, Download, X } from "lucide-react"
import { areasAPI, plantsAPI } from "../services/api"

/* ---------------- helpers ---------------- */
const toId = (x) => x?.id || x?._id || x?._id?.toString?.() || ""
const safeStr = (s) => (typeof s === "string" ? s : "")
const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(v || "")

const asArray = (res) => {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.items)) return res.items
  if (Array.isArray(res?.results)) return res.results
  if (res?.data && typeof res.data === "object") return [res.data] // tolerate single object
  return []
}

const normalizePlant = (p) => ({
  id: toId(p),
  name: safeStr(p?.plantName || p?.name),
})

const normalizeArea = (a) => {
  const id = toId(a)
  const plantId = toId(a?.plant ?? a?.plantId)
  const plantName =
    (a?.plant && (a.plant.plantName || a.plant.name)) ||
    a?.plantName ||
    ""
  return {
    id,
    areaName: safeStr(a?.areaName),
    status: a?.status || (a?.isAreaActive === false ? "Inactive" : "Active"),
    plantId,
    plantName: safeStr(plantName),
  }
}

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
const Area = () => {
  const [showForm, setShowForm] = useState(false)
  const [areas, setAreas] = useState([])
  const [plants, setPlants] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)   // used for fetch/save
  const [deleting, setDeleting] = useState(false) // used for delete flow
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ areaName: "", plantId: "" })
  const [editingId, setEditingId] = useState(null)

  // delete-confirmation modal state
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" })

  useEffect(() => {
    fetchAreas()
    fetchPlants()
  }, [])

  const fetchAreas = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await areasAPI.getAll()
      // Accept {data:[...]}, {data:{areas:[...]}}, array, or single object
      const listRaw = Array.isArray(response?.data?.areas)
        ? response.data.areas
        : asArray(response)
      setAreas(listRaw.map(normalizeArea))
    } catch (e) {
      console.error("Error fetching areas:", e)
      setError("Failed to fetch areas")
      setAreas([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPlants = async () => {
    try {
      const response = await plantsAPI.getAll()
      const listRaw = Array.isArray(response?.data?.plants)
        ? response.data.plants
        : asArray(response)
      setPlants(listRaw.map(normalizePlant))
    } catch (e) {
      console.error("Error fetching plants:", e)
      setPlants([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.areaName.trim()) {
      setError("Area name is required")
      return
    }
    if (!formData.plantId) {
      setError("Please select a plant")
      return
    }
    if (!isObjectId(formData.plantId)) {
      setError("Selected plant id is invalid")
      return
    }

    try {
      setLoading(true)
      setError("")
      // ✅ Backend expects: { areaName, plant }
      const payload = {
        areaName: formData.areaName,
        plant: formData.plantId,
      }

      if (editingId) {
        await areasAPI.update(editingId, payload) // PATCH /user/areas/edit-area/:areaId
      } else {
        await areasAPI.create(payload) // POST /user/areas/create-area
      }

      await fetchAreas()
      setEditingId(null)
      setFormData({ areaName: "", plantId: "" })
      setShowForm(false)
    } catch (e) {
      console.error("Error saving area:", e)
      setError(e?.response?.data?.message || e?.message || "Failed to save area")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (area) => {
    setFormData({
      areaName: area.areaName || "",
      plantId: area.plantId || "",
    })
    setEditingId(area.id)
    setShowForm(true)
    setError("")
  }

  // open confirmation modal (instead of alert)
  const promptDelete = (id, name = "") => setConfirm({ open: true, id, name })

  // delete action from modal
  const performDelete = async () => {
    const id = confirm.id
    if (!id) return
    try {
      setDeleting(true)
      setError("")
      if (!isObjectId(id)) throw new Error("Invalid area id")

      // optimistic update
      const prev = areas
      setAreas((list) => list.filter((a) => a.id !== id))

      try {
        await areasAPI.delete(id)
        await fetchAreas() // ensure server truth
      } catch (e) {
        // rollback on failure
        setAreas(prev)
        throw e
      } finally {
        setConfirm({ open: false, id: null, name: "" })
      }
    } catch (e) {
      console.error("Error deleting area:", e)
      setError(e?.response?.data?.message || e?.message || "Failed to delete area")
    } finally {
      setDeleting(false)
    }
  }

  const filteredAreas = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return areas.filter(
      (a) =>
        a.areaName?.toLowerCase().includes(q) ||
        a.plantName?.toLowerCase().includes(q),
    )
  }, [areas, searchTerm])

  /* ---------------- form view ---------------- */
  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Area</h1>
          <div className="flex space-x-2">
            <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" type="button" disabled={loading || deleting}>
              <FileText className="w-4 h-4" />
            </button>
            <button className="p-2 bg-orange-600 text-white rounded hover:bg-orange-700" type="button" disabled={loading || deleting}>
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                disabled={loading || deleting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.plantId}
                onChange={(e) => setFormData({ ...formData, plantId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading || deleting}
              >
                <option value="">Select Plant</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p.name || "Unnamed").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading || deleting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setFormData({ areaName: "", plantId: "" })
                setError("")
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              disabled={loading || deleting}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Decorative cube (unchanged) */}
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

        {/* Delete confirmation modal (available in form view as well) */}
        <ConfirmDeleteModal
          open={confirm.open}
          title="Delete area"
          message={
            confirm.name
              ? `Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`
              : "Are you sure you want to delete this area? This action cannot be undone."
          }
          onCancel={() => setConfirm({ open: false, id: null, name: "" })}
          onConfirm={performDelete}
          loading={deleting}
        />
      </div>
    )
  }

  /* ---------------- list view ---------------- */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Area</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          disabled={loading || deleting}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

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
              <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50" type="button" disabled={loading || deleting}>
                <FileText className="w-4 h-4" />
              </button>
              <button className="p-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50" type="button" disabled={loading || deleting}>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No areas found</td>
                </tr>
              ) : (
                filteredAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => promptDelete(area.id, area.areaName)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
                          title="Delete"
                          disabled={loading || deleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(area)}
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{area.areaName.toUpperCase()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{area.plantName.toUpperCase() || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          area.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {area.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {filteredAreas.length} of {filteredAreas.length} Entries
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>«</button>
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>‹</button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>›</button>
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>»</button>
            <select className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded" disabled>
              <option>10</option><option>25</option><option>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={confirm.open}
        title="Delete area"
        message={
          confirm.name
            ? `Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`
            : "Are you sure you want to delete this area? This action cannot be undone."
        }
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={performDelete}
        loading={deleting}
      />
    </div>
  )
}

export default Area
