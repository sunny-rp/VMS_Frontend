"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"

const Country = () => {
  const [view, setView] = useState("list") // 'list' or 'form'
  const [countries, setCountries] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCountry, setEditingCountry] = useState(null)
  const [formData, setFormData] = useState({
    countryName: "",
    countryShortform: "",
    nationality: "",
    status: "Active",
  })

  // Mock data
  useEffect(() => {
    setCountries([
      {
        id: 1,
        countryCode: "CNT00001",
        countryName: "INDIA",
        countryShortform: "IND",
        nationality: "Indian",
        createdBy: "Super Admin",
        createdOn: "2025-08-30 15:04:36",
        modifiedBy: "Super Admin",
        modifiedOn: "2025-08-30 15:04:36",
        status: "Active",
      },
    ])
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingCountry) {
      setCountries(
        countries.map((country) =>
          country.id === editingCountry.id
            ? { ...country, ...formData, modifiedOn: new Date().toLocaleString() }
            : country,
        ),
      )
    } else {
      const newCountry = {
        id: Date.now(),
        countryCode: `CNT${String(countries.length + 1).padStart(5, "0")}`,
        ...formData,
        createdBy: "Super Admin",
        createdOn: new Date().toLocaleString(),
        modifiedBy: "Super Admin",
        modifiedOn: new Date().toLocaleString(),
      }
      setCountries([...countries, newCountry])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      countryName: "",
      countryShortform: "",
      nationality: "",
      status: "Active",
    })
    setEditingCountry(null)
    setView("list")
  }

  const handleEdit = (country) => {
    setEditingCountry(country)
    setFormData({
      countryName: country.countryName,
      countryShortform: country.countryShortform,
      nationality: country.nationality,
      status: country.status,
    })
    setView("form")
  }

  const handleDelete = (id) => {
    setCountries(countries.filter((country) => country.id !== id))
  }

  const filteredCountries = countries.filter(
    (country) =>
      country.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.countryShortform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.nationality.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (view === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Country</h1>
          <div className="flex space-x-2">
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

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.countryName}
                onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country Shortform<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.countryShortform}
                onChange={(e) => setFormData({ ...formData, countryShortform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {editingCountry ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* 3D Cube */}
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Country</h1>
        <div className="flex space-x-2">
          <button onClick={() => setView("form")} className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-2 bg-orange-600 text-white rounded hover:bg-orange-700">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country Shortform
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nationality
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created On
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified On
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCountries.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                    No Data Found
                  </td>
                </tr>
              ) : (
                filteredCountries.map((country) => (
                  <tr key={country.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(country.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(country)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{country.countryCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{country.countryName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{country.countryShortform}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{country.nationality}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{country.createdBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{country.createdOn}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{country.modifiedBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{country.modifiedOn}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          country.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {country.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {filteredCountries.length} of {filteredCountries.length} Entries
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

      {/* 3D Cube */}
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
    </div>
  )
}

export default Country
