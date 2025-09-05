"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, Eye, Calendar } from "lucide-react"

const Gate = () => {
  const [currentView, setCurrentView] = useState("list") // 'list' or 'form'
  const [gates, setGates] = useState([
    {
      id: 1,
      gateCode: "GAT0001",
      gateName: "Main Gate",
      gateNo: "1",
      inchargeName: "Super Admin",
      companyName: "SHUFAB",
      plantName: "SHUFAB",
      gateOpenTime: "08:00",
      gateCloseTime: "18:00",
      status: "Active",
      createdBy: "Super Admin",
      createdOn: "2025-08-30 15:04:36",
      modifiedBy: "Super Admin",
      modifiedOn: "2025-08-30 15:04:36",
      securityDetails: [],
    },
    {
      id: 2,
      gateCode: "GAT00001",
      gateName: "Main Gate",
      gateNo: "G1",
      inchargeName: "Super Admin",
      companyName: "SHUFAB",
      plantName: "SHUFAB",
      gateOpenTime: "08:00",
      gateCloseTime: "18:00",
      status: "Active",
      createdBy: "Super Admin",
      createdOn: "2025-08-30 15:04:36",
      modifiedBy: "Super Admin",
      modifiedOn: "2025-08-30 15:04:36",
      securityDetails: [],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [editingGate, setEditingGate] = useState(null)
  const [formData, setFormData] = useState({
    gateName: "",
    gateNo: "",
    gateInchargeName: "",
    companyName: "",
    plantName: "",
    gateOpenTime: "",
    gateCloseTime: "",
    status: "Active",
  })

  const [securityForm, setSecurityForm] = useState({
    securityName: "",
    email: "",
    phoneNumber: "",
    address: "",
  })

  const [securityDetails, setSecurityDetails] = useState([])

  const companies = ["SHUFAB", "Company 2", "Company 3"]
  const plants = ["SHUFAB", "Plant 2", "Plant 3"]
  const inchargeNames = ["Super Admin", "Admin 1", "Admin 2"]
  const securityNames = ["Security 1", "Security 2", "Security 3"]

  const filteredGates = gates.filter(
    (gate) =>
      gate.gateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gate.gateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gate.companyName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSecurityInputChange = (e) => {
    const { name, value } = e.target
    setSecurityForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddSecurity = () => {
    if (securityForm.securityName && securityForm.email && securityForm.phoneNumber) {
      const newSecurity = {
        id: Date.now(),
        ...securityForm,
      }
      setSecurityDetails((prev) => [...prev, newSecurity])
      setSecurityForm({
        securityName: "",
        email: "",
        phoneNumber: "",
        address: "",
      })
    }
  }

  const handleDeleteSecurity = (id) => {
    setSecurityDetails((prev) => prev.filter((security) => security.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const gateData = {
      ...formData,
      securityDetails,
      id: editingGate ? editingGate.id : Date.now(),
      gateCode: editingGate ? editingGate.gateCode : `GAT${String(gates.length + 1).padStart(4, "0")}`,
      createdBy: editingGate ? editingGate.createdBy : "Super Admin",
      createdOn: editingGate ? editingGate.createdOn : new Date().toLocaleString(),
      modifiedBy: "Super Admin",
      modifiedOn: new Date().toLocaleString(),
    }

    if (editingGate) {
      setGates((prev) => prev.map((gate) => (gate.id === editingGate.id ? gateData : gate)))
    } else {
      setGates((prev) => [...prev, gateData])
    }

    // Reset form
    setFormData({
      gateName: "",
      gateNo: "",
      gateInchargeName: "",
      companyName: "",
      plantName: "",
      gateOpenTime: "",
      gateCloseTime: "",
      status: "Active",
    })
    setSecurityDetails([])
    setEditingGate(null)
    setCurrentView("list")
  }

  const handleEdit = (gate) => {
    setEditingGate(gate)
    setFormData({
      gateName: gate.gateName,
      gateNo: gate.gateNo,
      gateInchargeName: gate.inchargeName,
      companyName: gate.companyName,
      plantName: gate.plantName,
      gateOpenTime: gate.gateOpenTime,
      gateCloseTime: gate.gateCloseTime,
      status: gate.status,
    })
    setSecurityDetails(gate.securityDetails || [])
    setCurrentView("form")
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this gate?")) {
      setGates((prev) => prev.filter((gate) => gate.id !== id))
    }
  }

  const handleAddNew = () => {
    setEditingGate(null)
    setFormData({
      gateName: "",
      gateNo: "",
      gateInchargeName: "",
      companyName: "",
      plantName: "",
      gateOpenTime: "",
      gateCloseTime: "",
      status: "Active",
    })
    setSecurityDetails([])
    setCurrentView("form")
  }

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

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Gate Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gate No<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="gateNo"
                value={formData.gateNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gate Incharge Name</label>
              <select
                name="gateInchargeName"
                value={formData.gateInchargeName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Gate Incharge Name</option>
                {inchargeNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name<span className="text-red-500">*</span>
              </label>
              <select
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Company Name</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant Name<span className="text-red-500">*</span>
              </label>
              <select
                name="plantName"
                value={formData.plantName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Plant Name</option>
                {plants.map((plant) => (
                  <option key={plant} value={plant}>
                    {plant}
                  </option>
                ))}
              </select>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status<span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Security Details Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Name<span className="text-red-500">*</span>
                </label>
                <select
                  name="securityName"
                  value={securityForm.securityName}
                  onChange={handleSecurityInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Security Name</option>
                  {securityNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={securityForm.email}
                  onChange={handleSecurityInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={securityForm.phoneNumber}
                  onChange={handleSecurityInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={securityForm.address}
                  onChange={handleSecurityInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={handleAddSecurity}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>ADD</span>
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>DELETE</span>
              </button>
            </div>

            {/* Security Details Table */}
            <div className="bg-white rounded-lg border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Security Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mail ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {securityDetails.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No Data Found.
                        </td>
                      </tr>
                    ) : (
                      securityDetails.map((security) => (
                        <tr key={security.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteSecurity(security.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{security.securityName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{security.phoneNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{security.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{security.address}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination for security table */}
              <div className="bg-white px-4 py-3 flex items-center justify-center border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button className="px-2 py-1 text-gray-400 hover:text-gray-600">
                    <span>«</span>
                  </button>
                  <button className="px-2 py-1 text-gray-400 hover:text-gray-600">
                    <span>‹</span>
                  </button>
                  <button className="px-2 py-1 text-gray-400 hover:text-gray-600">
                    <span>›</span>
                  </button>
                  <button className="px-2 py-1 text-gray-400 hover:text-gray-600">
                    <span>»</span>
                  </button>
                  <select className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm">
                    <option>5</option>
                    <option>10</option>
                    <option>25</option>
                  </select>
                </div>
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
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {editingGate ? "Update" : "Save"}
            </button>
          </div>
        </form>

        {/* 3D Cube */}
        
      </div>
    )
  }

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gate Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gate Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gate No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incharge Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plant Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGates.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-6 py-4 text-center text-gray-500">
                    No Data Found
                  </td>
                </tr>
              ) : (
                filteredGates.map((gate) => (
                  <tr key={gate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(gate.id)}
                          className="p-1 text-red-600 hover:text-red-900 bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(gate)}
                          className="p-1 text-green-600 hover:text-green-900 bg-green-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-blue-600 hover:text-blue-900 bg-blue-100 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gate.gateCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gate.gateName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gate.gateNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gate.inchargeName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gate.companyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gate.plantName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gate.createdBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gate.createdOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gate.modifiedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gate.modifiedOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          gate.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {gate.status}
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

      {/* 3D Cube */}
      {/* <div className="fixed bottom-8 right-8">
        <div className="relative">
          <div className="w-32 h-32 relative transform-gpu perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 skew-y-12 rounded-lg shadow-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 transform -rotate-12 skew-y-12 rounded-lg shadow-lg translate-x-4"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold z-10">
              <div className="text-xs mb-1">Total Visitors</div>
              <div className="text-2xl mb-1">0</div>
              <div className="text-xs">Check-In</div>
              <div className="text-xs">Visitors</div>
              <div className="text-lg">0</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default Gate
