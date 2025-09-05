"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

const Company = () => {
  const [showForm, setShowForm] = useState(false)
  const [companies, setCompanies] = useState([
    {
      id: 1,
      code: "CMP00001",
      name: "SHUFAB",
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      status: "Active",
      createdBy: "Super Admin",
      createdOn: "2025-08-30 15:04:36",
      modifiedBy: "Super Admin",
      modifiedOn: "2025-09-01 13:46:30",
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    state: "",
    city: "",
    status: "Active",
  })
  const [editingId, setEditingId] = useState(null)

  const countries = ["India", "USA", "UK", "Canada", "Australia"]
  const states = ["Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Delhi"]
  const cities = ["Mumbai", "Pune", "Bangalore", "Chennai", "Ahmedabad"]

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      setCompanies(
        companies.map((company) =>
          company.id === editingId
            ? {
                ...company,
                ...formData,
                modifiedBy: "Super Admin",
                modifiedOn: new Date().toLocaleString("sv-SE").replace("T", " "),
              }
            : company,
        ),
      )
      setEditingId(null)
    } else {
      const newCompany = {
        id: companies.length + 1,
        code: `CMP${String(companies.length + 1).padStart(5, "0")}`,
        ...formData,
        createdBy: "Super Admin",
        createdOn: new Date().toLocaleString("sv-SE").replace("T", " "),
        modifiedBy: "Super Admin",
        modifiedOn: new Date().toLocaleString("sv-SE").replace("T", " "),
      }
      setCompanies([...companies, newCompany])
    }
    setFormData({ name: "", country: "", state: "", city: "", status: "Active" })
    setShowForm(false)
  }

  const handleEdit = (company) => {
    setFormData({
      name: company.name,
      country: company.country,
      state: company.state,
      city: company.city,
      status: company.status,
    })
    setEditingId(company.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setCompanies(companies.filter((company) => company.id !== id))
  }

  if (showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Company</h1>
          <div className="flex gap-2">
            <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <Plus size={16} />
            </button>
            <button className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
              <Trash2 size={16} />
            </button>
            <button className="p-2 bg-green-500 text-white rounded hover:bg-green-600">
              <Search size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">State</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setFormData({ name: "", country: "", state: "", city: "", status: "Active" })
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* 3D Cube - Total Visitors */}
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Company</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  Company Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
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
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(company)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-500 hover:bg-gray-50 rounded">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{company.code}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{company.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{company.createdBy}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{company.createdOn}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{company.modifiedBy}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{company.modifiedOn}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {company.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {filteredCompanies.length} of {filteredCompanies.length} Entries
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronsLeft size={16} />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded">1</span>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronRight size={16} />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronsRight size={16} />
            </button>
            <select className="ml-4 px-2 py-1 border border-gray-300 rounded text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3D Cube - Check-Out Visitors */}
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
