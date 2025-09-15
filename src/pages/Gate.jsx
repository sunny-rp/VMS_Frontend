"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Plus, Edit, Trash2, Eye, Calendar } from "lucide-react"
import { gatesAPI, plantsAPI, usersAPI } from "../services/api"

// ---------- helpers ----------
const toId = (x) => x?.id || x?._id || x?._id?.toString?.() || ""
const str = (v) => (typeof v === "string" ? v : "")
const up = (v) => str(v).toUpperCase()

const normalizePlant = (p) => ({
  id: toId(p),
  name: str(p?.plantName || p?.name),
})

const normalizeUser = (u) => ({
  id: toId(u),
  name: str(u?.fullname || u?.name || u?.username || u?.email),
})

const normalizeGateForList = (g) => {
  // convert any nested objects to strings for safe rendering
  const getPlantName = () => {
    if (!g?.plant) return ""
    if (typeof g.plant === "string") return g.plant
    return str(g.plant?.plantName || g.plant?.name)
  }

  const getUserName = (u) => {
    if (!u) return ""
    if (typeof u === "string") return u
    return str(u?.fullname || u?.name || u?.username || u?.email)
  }

  return {
    id: toId(g),
    gateName: str(g?.gateName),
    gateNumber: str(g?.gateNumber),
    gateOpenTime: str(g?.gateOpenTime),
    gateCloseTime: str(g?.gateCloseTime),
    plantName: getPlantName(),
    gateInchargeName: getUserName(g?.gateInchargeName || g?.gateIncharge),
    gateSecurity: getUserName(g?.gateSecurity),
    status: g?.status || "Active",
  }
}

// ---------- component ----------
const Gate = () => {
  const [currentView, setCurrentView] = useState("list") // 'list' | 'form'
  const [gates, setGates] = useState([])
  const [plants, setPlants] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [/*error*/, setError] = useState("") // keep state but don't render

  const [searchTerm, setSearchTerm] = useState("")
  const [editingGate, setEditingGate] = useState(null)

  // form fields LIMITED to your list
  const [formData, setFormData] = useState({
    plant: "",            // will store PLANT NAME (string) for create
    gateOpenTime: "",
    gateCloseTime: "",
    gateSecurity: "",     // will store USER NAME (string) for create
    gateName: "",
    gateNumber: "",
    gateInchargeName: "", // will store USER NAME (string) for create
  })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError("")
      const [gRes, pRes, uRes] = await Promise.all([
        gatesAPI.getAll().catch((e) => {
          // tolerate 404 gracefully
          if (e?.response?.status === 404) return { data: [] }
          throw e
        }),
        plantsAPI.getAll().catch((e) => {
          if (e?.response?.status === 404) return { data: [] }
          throw e
        }),
        usersAPI.getAll().catch((e) => {
          if (e?.response?.status === 404) return { data: [] }
          throw e
        }),
      ])

      const normPlants = (pRes?.data || []).map(normalizePlant)
      const normUsers = (uRes?.data || []).map(normalizeUser)
      const normGates = (gRes?.data || []).map(normalizeGateForList)

      setPlants(normPlants)
      setUsers(normUsers)
      setGates(normGates)
    } catch (e) {
      console.warn("Fetch failed:", e?.response?.data ?? e?.message ?? e)
      setError(e?.message || "Failed to load data")
      setPlants([])
      setUsers([])
      setGates([])
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")

      // You asked to send these exact fields on create.
      // We’re sending strings for plant (plant name), gateInchargeName (user name), and gateSecurity (user name),
      // so the backend won’t receive objects.
      const payload = {
        plant: formData.plant,
        gateOpenTime: formData.gateOpenTime,
        gateCloseTime: formData.gateCloseTime,
        gateSecurity: formData.gateSecurity,
        gateName: formData.gateName,
        gateNumber: formData.gateNumber,
        gateInchargeName: formData.gateInchargeName,
      }

      let res
      if (editingGate?.id) {
        // If you later want update, reuse payload:
        res = await gatesAPI.update(editingGate.id, payload)
      } else {
        res = await gatesAPI.create(payload)
      }

      if (res?.success === false) {
        throw new Error(res?.message || "Save failed")
      }

      await fetchAll()
      setEditingGate(null)
      setFormData({
        plant: "",
        gateOpenTime: "",
        gateCloseTime: "",
        gateSecurity: "",
        gateName: "",
        gateNumber: "",
        gateInchargeName: "",
      })
      setCurrentView("list")
    } catch (e) {
      console.warn("Save gate failed:", e?.response?.data ?? e?.message ?? e)
      setError(e?.message || "Failed to save gate")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (row) => {
    setEditingGate(row)
    setFormData({
      plant: row.plantName || "",
      gateOpenTime: row.gateOpenTime || "",
      gateCloseTime: row.gateCloseTime || "",
      gateSecurity: row.gateSecurity || "",
      gateName: row.gateName || "",
      gateNumber: row.gateNumber || "",
      gateInchargeName: row.gateInchargeName || "",
    })
    setCurrentView("form")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this gate?")) return
    try {
      setLoading(true)
      await gatesAPI.delete(id)
      setGates((prev) => prev.filter((g) => g.id !== id))
    } catch (e) {
      console.warn("Delete gate failed:", e?.response?.data ?? e?.message ?? e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingGate(null)
    setFormData({
      plant: "",
      gateOpenTime: "",
      gateCloseTime: "",
      gateSecurity: "",
      gateName: "",
      gateNumber: "",
      gateInchargeName: "",
    })
    setCurrentView("form")
  }

  // dropdown options (UPPERCASE labels)
  const plantOptions = plants.map((p) => (
    <option key={p.id} value={p.name}>
      {up(p.name)}
    </option>
  ))

  const userOptions = users.map((u) => (
    <option key={u.id} value={u.name}>
      {up(u.name)}
    </option>
  ))

  // -------------- FORM VIEW --------------
  if (currentView === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Gate</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView("list")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView("list")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* No on-screen error messages per your request */}

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
              />
            </div>

            {/* Plant (from plants API) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant<span className="text-red-500">*</span>
              </label>
              <select
                name="plant"
                value={formData.plant}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">SELECT PLANT</option>
                {plantOptions}
              </select>
            </div>

            {/* Gate Incharge Name (from users API) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gate Incharge Name</label>
              <select
                name="gateInchargeName"
                value={formData.gateInchargeName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">GATE INCHARGE NAME</option>
                {userOptions}
              </select>
            </div>

            {/* Gate Security (from users API) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gate Security</label>
              <select
                name="gateSecurity"
                value={formData.gateSecurity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">SELECT SECURITY</option>
                {userOptions}
              </select>
            </div>

            {/* Gate Open Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gate Open Time<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  name="gateOpenTime"
                  value={formData.gateOpenTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Gate Close Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gate Close Time<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  name="gateCloseTime"
                  value={formData.gateCloseTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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

  // -------------- LIST VIEW --------------
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gate</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Eye className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2">
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Intentionally not rendering error messages */}

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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.plantName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateInchargeName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateOpenTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateCloseTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.gateSecurity}</td>
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
