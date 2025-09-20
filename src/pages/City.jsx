// src/pages/City.jsx
"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { citiesAPI, countriesAPI, statesAPI } from "../services/api"

// Helpers (module scope)
const toDisplayDateTime = (iso) => {
  if (!iso) return "-"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString()
}
const up = (s) => (s ? String(s).toUpperCase() : "-")
const sid = (v) => (v == null ? "" : String(v)) // stringify id safely
const toBool = (v) =>
  v === true || v === "true" || v === 1 || v === "1" || v === "Active" || v === "ACTIVE"

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
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </span>
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

const City = () => {
  const [view, setView] = useState("list") // 'list' or 'form'
  const [cities, setCities] = useState([])
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCity, setEditingCity] = useState(null)
  const [formData, setFormData] = useState({
    countryId: "",
    stateId: "",
    cityName: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Confirmation modal state
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" })

  useEffect(() => {
    fetchCities()
    fetchCountries()
    fetchStates()
  }, [])

  // --- Normalizers ---
  const normalizeCities = (res) =>
    Array.isArray(res?.data?.cities)
      ? res.data.cities
      : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
      ? res
      : []

  const normalizeCountries = (res) =>
    Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []

  const normalizeStates = (res) =>
    Array.isArray(res?.data?.states)
      ? res.data.states
      : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
      ? res
      : []

  // --- Fetchers ---
  const fetchCities = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await citiesAPI.getAll()
      const list = normalizeCities(res)
      setCities(list)
      if (!Array.isArray(list)) {
        console.warn("Unexpected cities response:", res)
        setError("Unexpected cities response format.")
      }
    } catch (e) {
      console.error("Error fetching cities:", e)
      setCities([])
      setError(e?.response?.data?.message || e?.message || "Failed to fetch cities")
    } finally {
      setLoading(false)
    }
  }

  const fetchCountries = async () => {
    try {
      const res = await countriesAPI.getAll()
      setCountries(normalizeCountries(res))
    } catch (e) {
      console.error("Error fetching countries:", e)
    }
  }

  const fetchStates = async () => {
    try {
      const res = await statesAPI.getAll()
      setStates(normalizeStates(res))
    } catch (e) {
      console.error("Error fetching states:", e)
    }
  }

  // --- Form ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      setLoading(true)
      const payload = {
        cityName: formData.cityName,
        country: formData.countryId, // send ID
        state: formData.stateId,     // send ID
      }

      if (editingCity?._id) {
        // ✅ PATCH /user/cities/edit-city/:cityId
        await citiesAPI.update(editingCity._id, payload)
        await fetchCities()
      } else {
        await citiesAPI.create(payload)
        await fetchCities()
      }
      resetForm()
    } catch (e) {
      console.error("Error saving city:", e)
      setError(e?.response?.data?.message || e?.message || "Failed to save city")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ countryId: "", stateId: "", cityName: "" })
    setEditingCity(null)
    setView("list")
    setError("")
  }

  const handleEdit = (city) => {
    setEditingCity(city)
    const countryId =
      typeof city?.country === "string" ? city.country : sid(city?.country?._id)
    const stateId =
      typeof city?.state === "string" ? city.state : sid(city?.state?._id)
    setFormData({
      countryId,
      stateId,
      cityName: city?.cityName || "",
    })
    setView("form")
  }

  // --- Delete flow (modal + optimistic) ---
  const promptDelete = (id, name = "") => setConfirm({ open: true, id, name })

  const performDelete = async () => {
    const id = confirm.id
    if (!id) return

    setError("")
    setLoading(true)

    // optimistic update
    const prevCities = cities
    setCities((prev) => prev.filter((c) => sid(c?._id ?? c?.id) !== sid(id)))

    try {
      await citiesAPI.delete(id)
      await fetchCities() // ensure truth with backend
      if (editingCity?._id && sid(editingCity._id) === sid(id)) {
        resetForm()
      }
      setConfirm({ open: false, id: null, name: "" })
    } catch (e) {
      console.error("Error deleting city:", e)
      setError(e?.response?.data?.message || e?.message || "Failed to delete city")
      // rollback
      setCities(prevCities)
      setConfirm({ open: false, id: null, name: "" })
    } finally {
      setLoading(false)
    }
  }

  // States limited to selected country in dropdown
  const statesForSelectedCountry = states.filter((s) => {
    const stateCountryId =
      typeof s?.country === "string"
        ? s.country
        : s?.country?._id ?? s?.countryId ?? ""
    return !formData.countryId || sid(stateCountryId) === sid(formData.countryId)
  })

  // --- Filtering (search) ---
  const list = Array.isArray(cities) ? cities : []
  const filteredCities = list.filter((city) => {
    const cityName = (city?.cityName || "").toLowerCase()
    const stateName = (getDisplayStateName(city?.state) || "").toLowerCase()
    const countryName = (getDisplayCountryName(city?.country) || "").toLowerCase()
    const term = searchTerm.toLowerCase()
    return cityName.includes(term) || stateName.includes(term) || countryName.includes(term)
  })

  // --- Lookup helpers ---
  function getCountryNameById(id) {
    const idStr = sid(id)
    const c = countries.find((x) => sid(x?._id ?? x?.id) === idStr)
    return c?.countryName || "-"
  }
  function getStateNameById(id) {
    const idStr = sid(id)
    const s = states.find((x) => sid(x?._id ?? x?.id) === idStr)
    return s?.stateName || "-"
  }
  function getDisplayCountryName(countryField) {
    if (!countryField) return "-"
    if (typeof countryField === "object") return countryField.countryName || "-"
    return getCountryNameById(countryField)
  }
  function getDisplayStateName(stateField) {
    if (!stateField) return "-"
    if (typeof stateField === "object") return stateField.stateName || "-"
    return getStateNameById(stateField)
  }

  if (view === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {editingCity?._id ? "Edit City" : "Create City"}
          </h1>
          <div className="flex space-x-2">
            {/* New */}
            <button
              onClick={() => {
                setEditingCity(null)
                setFormData({ countryId: "", stateId: "", cityName: "" })
              }}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
              title="New city"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Delete current (opens modal) */}
            <button
              onClick={() =>
                editingCity?._id && promptDelete(sid(editingCity._id), editingCity?.cityName || "")
              }
              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              disabled={!editingCity?._id || loading}
              title="Delete this city"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.countryId}
                onChange={(e) =>
                  setFormData({ ...formData, countryId: e.target.value, stateId: "" })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Country</option>
                {countries.map((c) => {
                  const id = sid(c?._id ?? c?.id)
                  return (
                    <option key={id} value={id}>
                      {up(c?.countryName)}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.stateId}
                onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading || !formData.countryId}
              >
                <option value="">Select State</option>
                {statesForSelectedCountry.map((s) => {
                  const id = sid(s?._id ?? s?.id)
                  return (
                    <option key={id} value={id}>
                      {up(s?.stateName)}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.cityName}
                onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
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
              {loading ? "Saving..." : editingCity ? "Update" : "Save"}
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
          title="Delete city"
          message={
            confirm.name
              ? `Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`
              : "Are you sure you want to delete this city? This action cannot be undone."
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
        <h1 className="text-2xl font-semibold text-gray-900">City</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setView("form")}
            className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
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
              placeholder="Search by city, state, or country"
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredCities.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No Data Found</td>
                </tr>
              ) : (
                filteredCities.map((city) => {
                  const id = sid(city?._id ?? city?.id)
                  const cityName = up(city?.cityName)
                  const stateName = up(getDisplayStateName(city?.state))
                  const countryName = up(getDisplayCountryName(city?.country))
                  const created = toDisplayDateTime(city?.createdAt)
                  const updated = toDisplayDateTime(city?.updatedAt)
                  // IMPORTANT: your API uses `iscityActive`
                  const isActive = toBool(
                    city?.iscityActive ?? city?.isCityActive ?? city?.isActive ?? city?.status
                  )
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => id && promptDelete(id, city?.cityName || "")}
                            className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
                            title="Delete"
                            disabled={!id || loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(city)}
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
                      <td className="px-4 py-3 text-sm text-gray-900">{cityName}</td>
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
            Showing 1 to {filteredCities.length} of {filteredCities.length} Entries
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
        title="Delete city"
        message={
          confirm.name
            ? `Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`
            : "Are you sure you want to delete this city? This action cannot be undone."
        }
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={performDelete}
        loading={loading}
      />
    </div>
  )
}

export default City
