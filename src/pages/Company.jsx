// src/pages/Company.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { companiesAPI, countriesAPI, statesAPI, citiesAPI } from "../services/api"

// ---------- Helpers ----------
const sid = (v) => (v == null ? "" : String(v)) // stringify id safely
const up = (s) => (s ? String(s).toUpperCase() : "-")
const fmt = (iso) => {
  if (!iso) return "-"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString()
}

// Normalizers that handle many API shapes
const normalizeCompanies = (res) => {
  if (Array.isArray(res?.data?.companies)) return res.data.companies
  if (Array.isArray(res?.data)) return res.data
  if (res?.data && typeof res.data === "object") return [res.data]
  if (Array.isArray(res)) return res
  if (res && typeof res === "object") return [res]
  return []
}
const normalizeCountries = (res) => {
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res)) return res
  if (res?.data && typeof res.data === "object") return [res.data]
  return []
}
const normalizeStates = (res) => {
  if (Array.isArray(res?.data?.states)) return res.data.states
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res)) return res
  if (res?.data && typeof res.data === "object") return [res.data]
  return []
}
const normalizeCities = (res) => {
  if (Array.isArray(res?.data?.cities)) return res.data.cities
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res)) return res
  if (res?.data && typeof res.data === "object") return [res.data]
  return []
}

// Display helpers for nested/object-or-id fields
const extractCountryName = (val, countries) => {
  if (!val) return "-"
  if (typeof val === "object") return val.countryName ?? "-"
  const match = countries.find((c) => sid(c?._id ?? c?.id) === sid(val))
  return match?.countryName ?? match?.name ?? "-"
}
const extractStateName = (val, states) => {
  if (!val) return "-"
  if (typeof val === "object") return val.stateName ?? "-"
  const match = states.find((s) => sid(s?._id ?? s?.id) === sid(val))
  return match?.stateName ?? match?.name ?? "-"
}
const extractCityName = (val, cities) => {
  if (!val) return "-"
  if (typeof val === "object") return val.cityName ?? "-"
  const match = cities.find((c) => sid(c?._id ?? c?.id) === sid(val))
  return match?.cityName ?? match?.name ?? "-"
}

const Company = () => {
  // ----------- State -----------
  const [showForm, setShowForm] = useState(false)
  const [companies, setCompanies] = useState([])

  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCompany, setEditingCompany] = useState(null)

  // Use ids in the form so we can POST ids to backend
  const [formData, setFormData] = useState({
    companyName: "",
    countryId: "",
    stateId: "",
    cityId: "",
  })

  // ----------- Effects -----------
  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [coRes, cRes, sRes, ciRes] = await Promise.all([
        companiesAPI.getAll(),
        countriesAPI.getAll(),
        statesAPI.getAll(),
        citiesAPI.getAll(),
      ])
      setCompanies(normalizeCompanies(coRes))
      setCountries(normalizeCountries(cRes))
      setStates(normalizeStates(sRes))
      setCities(normalizeCities(ciRes))
    } catch (e) {
      console.error(e)
      setError("Failed to load data")
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  // Filter states/cities dropdowns by selected parent
  const statesForSelectedCountry = useMemo(() => {
    return states.filter((s) => {
      const stateCountryId =
        typeof s?.country === "string" ? s.country : s?.country?._id ?? s?.countryId ?? ""
      return !formData.countryId || sid(stateCountryId) === sid(formData.countryId)
    })
  }, [states, formData.countryId])

  const citiesForSelectedState = useMemo(() => {
    return cities.filter((c) => {
      const cityStateId = typeof c?.state === "string" ? c.state : c?.state?._id ?? ""
      return !formData.stateId || sid(cityStateId) === sid(formData.stateId)
    })
  }, [cities, formData.stateId])

  // ----------- CRUD -----------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const payload = {
        companyName: formData.companyName,
        companyCountry: formData.countryId, // send IDs
        companyState: formData.stateId,
        companyCity: formData.cityId,
      }

      if (editingCompany) {
        // TODO: implement update when API is ready
        console.log("Update company payload:", payload)
      } else {
        await companiesAPI.create(payload)
      }

      await fetchAll()
      resetForm()
    } catch (err) {
      console.error("Error saving company:", err)
      setError(err?.message || "Failed to save company")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ companyName: "", countryId: "", stateId: "", cityId: "" })
    setEditingCompany(null)
    setShowForm(false)
    setError("")
  }

  const handleEdit = (company) => {
    setEditingCompany(company)
    const countryId =
      typeof company?.companyCountry === "string"
        ? company.companyCountry
        : company?.companyCountry?._id || ""
    // state is sometimes nested in companyCity.state
    const stateId =
      typeof company?.companyState === "string"
        ? company.companyState
        : typeof company?.companyCity?.state === "string"
        ? company.companyCity.state
        : company?.companyState?._id || company?.companyCity?.state?._id || ""
    const cityId =
      typeof company?.companyCity === "string" ? company.companyCity : company?.companyCity?._id || ""

    setFormData({
      companyName: company?.companyName || company?.name || "",
      countryId: sid(countryId),
      stateId: sid(stateId),
      cityId: sid(cityId),
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    const idStr = sid(id)
    setCompanies((prev) => prev.filter((x) => sid(x?._id ?? x?.id) !== idStr))
  }

  // ----------- List + Search -----------
  const filteredCompanies = (Array.isArray(companies) ? companies : []).filter((company) => {
    const name = (company?.companyName || company?.name || "").toLowerCase()
    const country = extractCountryName(company?.companyCountry, countries).toLowerCase()
    const city = extractCityName(company?.companyCity, cities).toLowerCase()
    const stateFromCity =
      typeof company?.companyCity === "object"
        ? extractStateName(company.companyCity.state, states).toLowerCase()
        : extractStateName(company?.companyState, states).toLowerCase()
    const term = searchTerm.toLowerCase()
    return name.includes(term) || country.includes(term) || city.includes(term) || stateFromCity.includes(term)
  })

  // SHOW "Add Company" ONLY WHEN THERE ARE ZERO COMPANIES
  const showAddButton = !loading && Array.isArray(companies) && companies.length === 0

  // ----------- Render -----------
  if (showForm) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Company</h1>
          <div className="flex gap-2">
            {/* Decorative buttons */}
            <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </button>
            <button className="p-2 bg-red-600 text-white rounded hover:bg-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.countryId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    countryId: e.target.value,
                    stateId: "",
                    cityId: "",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Country</option>
                {countries.map((c) => {
                  const id = sid(c?._id ?? c?.id)
                  const label = up(c?.countryName ?? c?.name)
                  return (
                    <option key={id || label} value={id}>
                      {label}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.stateId}
                onChange={(e) => setFormData({ ...formData, stateId: e.target.value, cityId: "" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading || !formData.countryId}
              >
                <option value="">Select State</option>
                {statesForSelectedCountry.map((s) => {
                  const id = sid(s?._id ?? s?.id)
                  const label = up(s?.stateName ?? s?.name)
                  return (
                    <option key={id || label} value={id}>
                      {label}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading || !formData.stateId}
              >
                <option value="">Select City</option>
                {citiesForSelectedState.map((c) => {
                  const id = sid(c?._id ?? c?.id)
                  const label = up(c?.cityName ?? c?.name)
                  return (
                    <option key={id || label} value={id}>
                      {label}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : editingCompany ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Decorative cubes */}
        <div className="fixed bottom-8 right-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
              <div className="text-xs font-medium">Total Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
            <div className="absolute -top-2 -right-2 w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 transform -rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
              <div className="text-xs font-medium">Check-In</div>
              <div className="text-xs font-medium">Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ----------- List View -----------
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Company</h1>

        {/* Add Company button only when there are zero companies */}
        {showAddButton && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {loading && (
        <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">Loading companies...</div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by company, country, state, or city"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">No Data Found</td>
                </tr>
              ) : (
                filteredCompanies.map((company, idx) => {
                  const id = sid(company?._id ?? company?.id ?? idx)
                  const name = up(company?.companyName ?? company?.name)
                  const countryName = up(extractCountryName(company?.companyCountry, countries))
                  const cityName = up(extractCityName(company?.companyCity, cities))
                  const stateName =
                    typeof company?.companyState !== "undefined"
                      ? up(extractStateName(company.companyState, states))
                      : up(
                          typeof company?.companyCity === "object"
                            ? extractStateName(company.companyCity.state, states)
                            : "-"
                        )
                  const created = fmt(company?.createdAt)
                  const updated = fmt(company?.updatedAt)
                  const isActive = !!(company?.isCompanyActive ?? false)

                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(company)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{countryName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{stateName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{cityName}</td>
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
            Showing 1 to {filteredCompanies.length} of {filteredCompanies.length} Entries
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">«</button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">‹</button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">›</button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">»</button>
          </div>
        </div>
      </div>

      {/* Decorative cubes */}
      <div className="fixed bottom-8 right-8">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
            <div className="text-xs font-medium">Total Visitors</div>
            <div className="text-2xl font-bold">0</div>
          </div>
          <div className="absolute -top-2 -right-2 w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 transform -rotate-12 rounded-lg shadow-lg flex flex-col items-center justify-center text-white">
            <div className="text-xs font-medium">Check-Out</div>
            <div className="text-xs font-medium">Visitors</div>
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Company
