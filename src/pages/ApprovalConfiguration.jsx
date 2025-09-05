"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"

const ApprovalConfiguration = () => {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    plantName: "",
    documentName: "",
    operationActivity: "",
    status: "Active",
    isOnlyNotification: false,
    isDepartmentSpecific: false,
  })
  const [approvalDetails, setApprovalDetails] = useState([])
  const [approvalForm, setApprovalForm] = useState({
    levelName: "Level 1",
    departmentName: "",
    primaryUserName: "",
    isHostUser: false,
    isAssetBasedApproval: false,
  })

  const mockData = [
    {
      id: 1,
      companyName: "SHUFAB",
      plantName: "SHUFAB",
      documentName: "Visitor Management",
      activity: "Create",
      createdBy: "Super Admin",
    },
  ]

  const handleAddApprovalDetail = () => {
    if (approvalForm.departmentName && approvalForm.primaryUserName) {
      setApprovalDetails([...approvalDetails, { ...approvalForm, id: Date.now() }])
      setApprovalForm({
        levelName: "Level 1",
        departmentName: "",
        primaryUserName: "",
        isHostUser: false,
        isAssetBasedApproval: false,
      })
    }
  }

  const handleClearApprovalDetail = () => {
    setApprovalForm({
      levelName: "Level 1",
      departmentName: "",
      primaryUserName: "",
      isHostUser: false,
      isAssetBasedApproval: false,
    })
  }

  const filteredData = mockData.filter(
    (item) =>
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Approval Configuration</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Clear</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Name<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.plantName}
                onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">SHUFAB</option>
                <option value="SHUFAB">SHUFAB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Name<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.documentName}
                onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Document Name</option>
                <option value="Visitor Management">Visitor Management</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation / Activity<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.operationActivity}
                onChange={(e) => setFormData({ ...formData, operationActivity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Create</option>
                <option value="Create">Create</option>
                <option value="Update">Update</option>
                <option value="Delete">Delete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOnlyNotification"
                checked={formData.isOnlyNotification}
                onChange={(e) => setFormData({ ...formData, isOnlyNotification: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isOnlyNotification" className="ml-2 text-sm font-medium text-gray-700">
                Is Only Notification ?
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDepartmentSpecific"
                checked={formData.isDepartmentSpecific}
                onChange={(e) => setFormData({ ...formData, isDepartmentSpecific: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDepartmentSpecific" className="ml-2 text-sm font-medium text-gray-700">
                Is Department Specific ?
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Detail</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level Name<span className="text-red-500">*</span>
                </label>
                <select
                  value={approvalForm.levelName}
                  onChange={(e) => setApprovalForm({ ...approvalForm, levelName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Level 1">Level 1</option>
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name<span className="text-red-500">*</span>
                </label>
                <select
                  value={approvalForm.departmentName}
                  onChange={(e) => setApprovalForm({ ...approvalForm, departmentName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Department Name</option>
                  <option value="IT Department">IT Department</option>
                  <option value="HR Department">HR Department</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary User Name<span className="text-red-500">*</span>
                </label>
                <select
                  value={approvalForm.primaryUserName}
                  onChange={(e) => setApprovalForm({ ...approvalForm, primaryUserName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Primary User Name</option>
                  <option value="Adhish Pandit">Adhish Pandit</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isHostUser"
                  checked={approvalForm.isHostUser}
                  onChange={(e) => setApprovalForm({ ...approvalForm, isHostUser: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isHostUser" className="ml-2 text-sm font-medium text-gray-700">
                  Is Host User
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAssetBasedApproval"
                  checked={approvalForm.isAssetBasedApproval}
                  onChange={(e) => setApprovalForm({ ...approvalForm, isAssetBasedApproval: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isAssetBasedApproval" className="ml-2 text-sm font-medium text-gray-700">
                  Is Asset Based Approval
                </label>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={handleAddApprovalDetail}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                ADD
              </button>
              <button
                onClick={handleClearApprovalDetail}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                CLEAR
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Primary User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Asset Based Approval
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvalDetails.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No Data Found.
                      </td>
                    </tr>
                  ) : (
                    approvalDetails.map((detail) => (
                      <tr key={detail.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.levelName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.departmentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.primaryUserName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {detail.isAssetBasedApproval ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">«</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">‹</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">›</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">»</button>
                <select className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Cube */}
        <div className="fixed bottom-6 right-6">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-xs font-medium">Check-In</div>
                <div className="text-xs font-medium">Visitors</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Approval Configuration</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plant Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.companyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.plantName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.documentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.activity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Showing 1 to 1 of 1 Entries</div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">«</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">‹</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">›</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">»</button>
              <select className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Cube */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xs font-medium">Check-In</div>
              <div className="text-xs font-medium">Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApprovalConfiguration
