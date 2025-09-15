"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Search, Edit, Trash2, Eye, FileText, Download } from "lucide-react"
import { areasAPI, plantsAPI } from "../services/api"

// ---------- helpers ----------
const toId = (x) => x?.id || x?._id || x?._id?.toString?.() || ""
const safeStr = (s) => (typeof s === "string" ? s : "")

const normalizePlant = (p) => ({
  id: toId(p),
  name: safeStr(p?.plantName || p?.name),
})

const normalizeArea = (a) => {
  const id = toId(a)
  const plantId = toId(a?.plant ?? a?.plantId)
  const plantName =
    (a?.plant && (a.plant.plantName || a.plant.name)) || a?.plantName || ""
  return {
    id,
    areaName: safeStr(a?.areaName),
    status: a?.status || "Active",
    plantId,
    plantName: safeStr(plantName),
  }
}

// ---------- component ----------
const Area = () => {
  const [showForm, setShowForm] = useState(false)
  const [areas, setAreas] = useState([])
  const [plants, setPlants] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    areaName: "",
    plantId: "",
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchAreas()
    fetchPlants()
  }, [])

  const fetchAreas = async () => {
    try {
      setLoading(true)
      const response = await areasAPI.getAll()
      const list = (response?.data || []).map(normalizeArea)
      setAreas(list)
      setError("")
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
      const list = (response?.data || []).map(normalizePlant)
      setPlants(list)
    } catch (e) {
      console.error("Error fetching plants:", e)
      setPlants([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")
      const payload = {
        areaName: formData.areaName,
        // backend should receive the ID, not the whole object or name
        plant: formData.plantId,
      }

      if (editingId) {
        await areasAPI.update(editingId, payload)
      } else {
        await areasAPI.create(payload)
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
      areaName: area.areaName,
      plantId: area.plantId, // use the normalized id
    })
    setEditingId(area.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      await areasAPI.delete(id)
      await fetchAreas()
    } catch (e) {
      console.error("Error deleting area:", e)
      setError(e?.response?.data?.message || "Failed to delete area")
    } finally {
      setLoading(false)
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

  // ---------- form view ----------
  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Area</h1>
          <div className="flex space-x-2">
            <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              <FileText className="w-4 h-4" />
            </button>
            <button className="p-2 bg-red-600 text-white rounded hover:bg-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
              <Search className="w-4 h-4" />
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
              >
                <option value="">Select Plant</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
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
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* 3D Cube (unchanged) */}
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
      </div>
    )
  }

  // ---------- list view ----------
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Area</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
                <FileText className="w-4 h-4" />
              </button>
              <button className="p-2 bg-orange-600 text-white rounded hover:bg-orange-700">
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
                        <button onClick={() => handleDelete(area.id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(area)} className="p-1 text-green-600 hover:bg-green-100 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{area.areaName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{area.plantName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        area.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
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
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">«</button>
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹</button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">›</button>
            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">»</button>
            <select className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded">
              <option>10</option><option>25</option><option>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Area
