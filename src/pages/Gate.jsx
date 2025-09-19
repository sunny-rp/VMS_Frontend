"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { gatesAPI, plantsAPI, usersAPI } from "../services/api"

/* ======================== helpers ======================== */

// generic id getter
const toId = (x) => x?.id || x?._id || x?._id?.toString?.() || ""

// string-safe
const str = (v) => (typeof v === "string" ? v : "")

// UPPER label
const up = (v) => str(v).toUpperCase()

// normalize plant/user for dropdowns (id + label)
const normalizePlant = (p) => ({
  id: toId(p),
  name: str(p?.plantName || p?.name),
})

const normalizeUser = (u) => ({
  id: toId(u),
  name: str(u?.fullname || u?.name || u?.username || u?.email),
})

// normalize gate rows for list + keep nested IDs for edit
const normalizeGateForList = (g) => {
  const readNameFrom = (o, fields) => {
    if (!o) return ""
    if (typeof o === "string") return o
    for (const f of fields) {
      if (o[f]) return str(o[f])
    }
    return ""
  }
  return {
    // identifiers
    id: toId(g),

    // editable fields (names for display)
    gateName: str(g?.gateName),
    gateNumber: str(g?.gateNumber),

    // time fields come back as strings like "11:30 AM" — display as-is
    gateOpenTime: str(g?.gateOpenTime),
    gateCloseTime: str(g?.gateCloseTime),

    // display labels
    plantName: readNameFrom(g?.plant, ["plantName", "name"]),
    gateInchargeName: readNameFrom(g?.gateInchargeName ?? g?.gateIncharge, ["fullname", "name", "username", "email"]),
    gateSecurity: readNameFrom(g?.gateSecurity, ["fullname", "name", "username", "email"]),

    // keep the IDs so edit form can preselect
    plantId: toId(g?.plant),
    gateInchargeId: toId(g?.gateInchargeName ?? g?.gateIncharge),
    gateSecurityId: toId(g?.gateSecurity),

    status: g?.status || (g?.isgateActive === false ? "Inactive" : "Active"),
  }
}

/* ======================== component ======================== */

const Gate = () => {
  const [view, setView] = useState("list") // 'list' | 'form'
  const [gates, setGates] = useState([])
  const [plants, setPlants] = useState([])
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [editingGate, setEditingGate] = useState(null)

  // Form state — now stores **IDs** for plant/incharge/security
  const [formData, setFormData] = useState({
    gateName: "",
    gateNumber: "",
    plantId: "",          // ObjectId string required by backend
    gateInchargeId: "",   // ObjectId string
    gateSecurityId: "",   // ObjectId string
    gateOpenTime: "",     // datetime-local string (we'll convert to ISO)
    gateCloseTime: "",    // datetime-local string (we'll convert to ISO)
  })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError("")
      const [gRes, pRes, uRes] = await Promise.all([
        gatesAPI.getAll().catch(() => ({ data: [] })),   // tolerate empty/404
        plantsAPI.getAll().catch(() => ({ data: [] })),
        usersAPI.getAll().catch(() => ({ data: [] })),
      ])
      setGates((gRes?.data || []).map(normalizeGateForList))
      setPlants((pRes?.data || []).map(normalizePlant))
      setUsers((uRes?.data || []).map(normalizeUser))
    } catch (e) {
      setError(e?.message || "Failed to load data")
      setGates([]); setPlants([]); setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredGates = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return gates.filter(
      (g) =>
        g.gateName.toLowerCase().includes(q) ||
        g.gateNumber.toLowerCase().includes(q) ||
        g.plantName.toLowerCase().includes(q) ||
        g.gateInchargeName.toLowerCase().includes(q) ||
        g.gateSecurity.toLowerCase().includes(q),
    )
  }, [gates, searchTerm])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Convert datetime-local -> ISO. If your API wants plain text, replace with the raw value.
  const toISO = (v) => (v ? new Date(v).toISOString() : null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")

      // EXACT KEYS backend expects; now with **IDs**
      const payload = {
        gateName: formData.gateName,
        gateNumber: formData.gateNumber,
        plant: formData.plantId,                 // send ObjectId
        gateOpenTime: toISO(formData.gateOpenTime),
        gateCloseTime: toISO(formData.gateCloseTime),
        gateInchargeName: formData.gateInchargeId, // send ObjectId
        gateSecurity: formData.gateSecurityId,     // send ObjectId
      }

      if (editingGate?.id) {
        await gatesAPI.update(editingGate.id, payload)
      } else {
        await gatesAPI.create(payload)
      }

      await fetchAll()
      resetForm()
      setView("list")
    } catch (e) {
      setError(e?.message || "Failed to save gate")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingGate(null)
    setFormData({
      gateName: "",
      gateNumber: "",
      plantId: "",
      gateInchargeId: "",
      gateSecurityId: "",
      gateOpenTime: "",
      gateCloseTime: "",
    })
  }

  const handleAddNew = () => {
    resetForm()
    setView("form")
  }

  const handleEdit = (row) => {
    setEditingGate(row)
    // We kept the related IDs during normalization; prefill them here
    setFormData({
      gateName: row.gateName || "",
      gateNumber: row.gateNumber || "",
      plantId: row.plantId || "",
      gateInchargeId: row.gateInchargeId || "",
      gateSecurityId: row.gateSecurityId || "",
      // Editing times: if API returns "11:30 AM", we can’t prefill datetime-local.
      // Leave blank or you may parse to a datetime here if you store ISO in your backend.
      gateOpenTime: "",
      gateCloseTime: "",
    })
    setView("form")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this gate?")) return
    try {
      setLoading(true)
      await gatesAPI.delete(id)
      setGates((prev) => prev.filter((g) => g.id !== id))
    } catch (e) {
      setError(e?.message || "Failed to delete gate")
    } finally {
      setLoading(false)
    }
  }

  const plantOptions = plants.map((p) => (
    <option key={p.id} value={p.id}>
      {up(p.name)}
    </option>
  ))

  const userOptions = users.map((u) => (
    <option key={u.id} value={u.id}>
      {up(u.name)}
    </option>
  ))

  /* ======================== form view ======================== */
  if (view === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{editingGate ? "Edit Gate" : "Add Gate"}</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setView("list")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : editingGate ? "Update" : "Save"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gate Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gate Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="gateName"
                value={formData.gateName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Gate Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gate Number<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="gateNumber"
                value={formData.gateNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Plant (ID) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant<span className="text-red-500">*</span>
              </label>
              <select
                name="plantId"
                value={formData.plantId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">SELECT PLANT</option>
                {plantOptions}
              </select>
            </div>

            {/* Gate Incharge (ID) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gate Incharge</label>
              <select
                name="gateInchargeId"
                value={formData.gateInchargeId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">SELECT INCHARGE</option>
                {userOptions}
              </select>
            </div>

            {/* Gate Security (ID) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gate Security</label>
              <select
                name="gateSecurityId"
                value={formData.gateSecurityId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">SELECT SECURITY</option>
                {userOptions}
              </select>
            </div>

            {/* Gate Open Date/Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gate Open Date/Time<span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="gateOpenTime"
                value={formData.gateOpenTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Gate Close Date/Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gate Close Date/Time<span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="gateCloseTime"
                value={formData.gateCloseTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setView("list")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : editingGate ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    )
  }

  /* ======================== list view ======================== */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gate</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gate Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gate Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incharge Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gate Security</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredGates.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">No Data Found</td>
                </tr>
              ) : (
                filteredGates.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="p-1 text-red-600 hover:text-red-900 bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(g)}
                          className="p-1 text-green-600 hover:text-green-900 bg-green-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-blue-600 hover:text-blue-900 bg-blue-100 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateName.toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateNumber.toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.plantName.toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateInchargeName.toUpperCase()}</td>
                    {/* display whatever the API returned (e.g., "11:30 AM") */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateOpenTime || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateCloseTime || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateSecurity.toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          g.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-center">
            <p className="text-sm text-blue-600">
              Showing 1 to {filteredGates.length} of {filteredGates.length} Entries
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-2 py-1 text-gray-400 hover:text-gray-600">«</button>
            <button className="px-2 py-1 text-gray-400 hover:text-gray-600">‹</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-2 py-1 text-gray-400 hover:text-gray-600">›</button>
            <button className="px-2 py-1 text-gray-400 hover:text-gray-600">»</button>
            <select className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Gate
