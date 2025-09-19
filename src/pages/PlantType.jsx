"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, X } from "lucide-react"
import { plantTypesAPI } from "../services/api"

// --- helpers ---
const isValidObjectId = (s) => /^[0-9a-fA-F]{24}$/.test(s || "")

const asArray = (res) => {
  // Normalize common shapes to an array
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.plantTypes)) return res.data.plantTypes
  if (Array.isArray(res?.items)) return res.items
  if (Array.isArray(res?.results)) return res.results
  if (res?.data && typeof res.data === "object") return [res.data]
  if (res && typeof res === "object" && (res._id || res.plantType || res.name)) return [res]
  return []
}

export default function PlantType() {
  const [plantTypes, setPlantTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ plantType: "" })
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // --- data load ---
  const fetchPlantTypes = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await plantTypesAPI.getAll()
      const list = asArray(response)

      // normalize id and common fields
      const items = list.map((p) => ({
        ...p,
        id: p.id || p._id || p?._id?.toString?.(),
        plantType: p.plantType || p.name || "",
        isActive: typeof p.isPlantTypeActive === "boolean" ? p.isPlantTypeActive : true,
      }))

      setPlantTypes(items)
    } catch (err) {
      console.error("Error fetching plant types:", err)
      setError(err?.message || "Failed to fetch plant types")
      setPlantTypes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlantTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- actions ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.plantType.trim()) {
      setError("Plant type is required")
      return
    }

    try {
      setSubmitting(true)
      setError("")

      if (editingId) {
        if (!isValidObjectId(editingId)) throw new Error("Invalid plant type id")
        // ✅ PATCH /user/plant-types/edit-plant-type/:plantTypeId
        await plantTypesAPI.update(editingId, { plantType: formData.plantType })
      } else {
        await plantTypesAPI.create({ plantType: formData.plantType })
      }

      await fetchPlantTypes()
      handleCancel()
    } catch (err) {
      console.error("Error saving plant type:", err)
      setError(err?.message || "Failed to save plant type")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (plantType) => {
    setFormData({ plantType: plantType.plantType || "" })
    setEditingId(plantType.id)
    setShowForm(true)
    setError("")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plant type?")) return
    try {
      if (!isValidObjectId(id)) throw new Error("Invalid plant type id")
      await plantTypesAPI.delete(id)
      await fetchPlantTypes()
    } catch (err) {
      console.error("Error deleting plant type:", err)
      setError(err?.message || "Failed to delete plant type")
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setFormData({ plantType: "" })
    setEditingId(null)
    setError("")
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStartCreate = () => {
    setEditingId(null)
    setFormData({ plantType: "" })
    setShowForm(true)
    setError("")
  }

  // --- render ---
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Plant Type Management</h1>
        <button
          onClick={handleStartCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          disabled={submitting}
        >
          <Plus size={20} />
          Add Plant Type
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingId ? "Edit Plant Type" : "Add New Plant Type"}</h2>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600" disabled={submitting}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Plant Type *</label>
                <input
                  type="text"
                  name="plantType"
                  value={formData.plantType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter plant type"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plant Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : plantTypes.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  No plant types found
                </td>
              </tr>
            ) : (
              plantTypes.map((plantType) => (
                <tr key={plantType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {plantType.plantType.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        plantType.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {plantType.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(plantType)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded disabled:opacity-50"
                        disabled={submitting}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(plantType.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                        disabled={submitting}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
