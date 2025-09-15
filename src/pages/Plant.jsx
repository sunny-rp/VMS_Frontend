"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Edit, Trash2, Eye, Printer } from "lucide-react"
import { plantsAPI, plantTypesAPI, companiesAPI, countriesAPI, statesAPI, citiesAPI } from "../services/api"

// ---------- helpers ----------
const toId = (x) => x?.id || x?._id || x?._id?.toString?.() || ""
const safeStr = (s) => (typeof s === "string" ? s : "")

const normalizePlantType = (t) => ({ id: toId(t), name: t?.plantType || t?.name || "" })
const normalizeCountry   = (c) => ({ id: toId(c), name: c?.countryName || c?.name || "" })
const normalizeState     = (s) => ({ id: toId(s), name: s?.stateName || s?.name || "", countryId: toId(s?.country ?? s?.countryId) })
const normalizeCity      = (c) => ({ id: toId(c), name: c?.cityName  || c?.name || "", countryId: toId(c?.country ?? c?.countryId), stateId: toId(c?.state ?? c?.stateId) })

const normalizePlantRow = (p) => {
  const plantTypeId = toId(p?.plantType ?? p?.plantTypeId)
  const countryId   = toId(p?.plantCountry ?? p?.plantCountryId)
  const stateId     = toId(p?.plantState ?? p?.plantStateId)
  const cityId      = toId(p?.plantCity ?? p?.plantCityId)

  const plantTypeName = (p?.plantType && (p?.plantType.plantType || p?.plantType.name)) || p?.plantTypeName || ""
  const countryName   = (p?.plantCountry && (p?.plantCountry.countryName || p?.plantCountry.name)) || p?.plantCountryName || ""
  const stateName     = (p?.plantState && (p?.plantState.stateName || p?.plantState.name)) || p?.plantStateName || ""
  const cityName      = (p?.plantCity && (p?.plantCity.cityName || p?.plantCity.name)) || p?.plantCityName || ""

  return {
    id: toId(p),
    plantName: safeStr(p?.plantName),
    status: p?.status || "Active",
    plantTypeId, countryId, stateId, cityId,
    plantTypeName: safeStr(plantTypeName),
    countryName:   safeStr(countryName),
    stateName:     safeStr(stateName),
    cityName:      safeStr(cityName),
  }
}

// Fetch one list safely; never throws — returns [] on failure
async function safeFetch(listFn, normalizer, label) {
  try {
    const res = await listFn()
    return (res?.data || []).map(normalizer)
  } catch (e) {
    console.warn(`${label} fetch failed:`, e?.response?.data ?? e?.message ?? e)
    return []
  }
}

// ---------- component ----------
const Plant = () => {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    plantName: "",
    plantTypeId: "",
    countryId: "",
    stateId: "",
    cityId: "",
  })

  const [plants, setPlants] = useState([])
  const [plantTypes, setPlantTypes] = useState([])
  const [companies, setCompanies] = useState([]) // not shown yet
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      // fetch each independently so one failure doesn't wipe all
      const [p, t, co, ctry, st, ci] = await Promise.all([
        safeFetch(plantsAPI.getAll, normalizePlantRow, "plants"),
        safeFetch(plantTypesAPI.getAll, normalizePlantType, "plantTypes"),
        safeFetch(companiesAPI.getAll, (c) => ({ id: toId(c), name: c?.name || "" }), "companies"),
        safeFetch(countriesAPI.getAll, normalizeCountry, "countries"),
        safeFetch(statesAPI.getAll, normalizeState, "states"),
        safeFetch(citiesAPI.getAll, normalizeCity, "cities"),
      ])
      setPlants(p)
      setPlantTypes(t)
      setCompanies(co)
      setCountries(ctry)
      setStates(st)
      setCities(ci)
      setLoading(false)
    })()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      if (name === "countryId") return { ...prev, countryId: value, stateId: "", cityId: "" }
      if (name === "stateId")   return { ...prev, stateId: value,   cityId: "" }
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await plantsAPI.create({
        plantName: formData.plantName,
        plantType: formData.plantTypeId,
        plantCountry: formData.countryId,
        plantState: formData.stateId,
        plantCity: formData.cityId,
      })
      // Refresh lists
      const p = await safeFetch(plantsAPI.getAll, normalizePlantRow, "plants")
      setPlants(p)
      // Close form & reset
      setShowForm(false)
      setFormData({ plantName: "", plantTypeId: "", countryId: "", stateId: "", cityId: "" })
    } catch (e) {
      console.warn("create plant failed:", e?.response?.data ?? e?.message ?? e)
    } finally {
      setLoading(false)
    }
  }

  // Derived lists
  const filteredStates = useMemo(
    () => states.filter((s) => !formData.countryId || s.countryId === formData.countryId),
    [states, formData.countryId],
  )
  const filteredCities = useMemo(
    () =>
      cities.filter(
        (c) =>
          (!formData.countryId || c.countryId === formData.countryId) &&
          (!formData.stateId || c.stateId === formData.stateId),
      ),
    [cities, formData.countryId, formData.stateId],
  )

  const filteredPlants = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return plants.filter(
      (p) =>
        p.plantName?.toLowerCase().includes(q) ||
        p.plantTypeName?.toLowerCase().includes(q) ||
        p.countryName?.toLowerCase().includes(q) ||
        p.stateName?.toLowerCase().includes(q) ||
        p.cityName?.toLowerCase().includes(q),
    )
  }, [plants, searchTerm])

  // ---------- form view ----------
  if (showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Plant</h1>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            ← Back to List
          </button>
        </div>

        {/* No on-screen error banner per your request. Errors log to console. */}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Plant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="plantName"
                value={formData.plantName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Plant Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Type<span className="text-red-500">*</span>
              </label>
              <select
                name="plantTypeId"
                value={formData.plantTypeId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="">Select Plant Type</option>
                {plantTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country<span className="text-red-500">*</span>
              </label>
              <select
                name="countryId"
                value={formData.countryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State<span className="text-red-500">*</span>
              </label>
              <select
                name="stateId"
                value={formData.stateId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!formData.countryId || loading}
              >
                <option value="">Select State</option>
                {filteredStates.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City<span className="text-red-500">*</span>
              </label>
              <select
                name="cityId"
                value={formData.cityId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!formData.stateId || loading}
              >
                <option value="">Select City</option>
                {filteredCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Plant"}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ---------- list view ----------
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Plant</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Print</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">Loading…</td>
                </tr>
              ) : filteredPlants.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">No plants found</td>
                </tr>
              ) : (
                filteredPlants.map((plant) => (
                  <tr key={plant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button className="p-1 text-gray-600 hover:bg-gray-50 rounded" title="View"><Eye className="w-4 h-4" /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plant.plantName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plant.plantTypeName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plant.countryName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plant.stateName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plant.cityName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${plant.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{plant.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><button className="p-1 text-orange-600 hover:bg-orange-50 rounded" title="Print"><Printer className="w-4 h-4" /></button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">1</span> of{" "}
                <span className="font-medium">{filteredPlants.length}</span> Entries
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">««</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹</button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-600 rounded">1</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">›</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">»»</button>
              <select className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded" defaultValue="10">
                <option>10</option><option>25</option><option>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Plant
