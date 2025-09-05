"use client"

import { useState } from "react"
import { Search, CheckCircle, AlertTriangle, XCircle, X, Plus } from "lucide-react"

const WorkFlow = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const mockData = [
    {
      id: 1,
      plantName: "SHUFAB",
      documentType: "Visitor Management",
      documentNo: "VSE00008",
      stages: "Level 1",
      requestedDate: "2025-09-03 15:55:49",
      approverName: "Adhish Pandit",
      initiatedBy: "Adhish Pandit",
      documentStatus: "Approved",
    },
    {
      id: 2,
      plantName: "SHUFAB",
      documentType: "Visitor Management",
      documentNo: "VSE00006",
      stages: "Level 1",
      requestedDate: "2025-09-03 15:42:41",
      approverName: "Adhish Pandit",
      initiatedBy: "Adhish Pandit",
      documentStatus: "Approved",
    },
    {
      id: 3,
      plantName: "SHUFAB",
      documentType: "Visitor Management",
      documentNo: "VSE00004",
      stages: "Level 1",
      requestedDate: "2025-09-01 12:12:21",
      approverName: "Adhish Pandit",
      initiatedBy: "Adhish Pandit",
      documentStatus: "Approved",
    },
  ]

  const filteredData = mockData.filter(
    (item) =>
      item.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentNo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = [
    {
      icon: CheckCircle,
      count: 0,
      label: "No. Of Approved",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: AlertTriangle,
      count: 0,
      label: "No. Of Pending",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: XCircle,
      count: 0,
      label: "No. Of Rejected",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      icon: X,
      count: 0,
      label: "No. Of cancelled",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Plus,
      count: 0,
      label: "OverAll",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Approval Workflow</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Export</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Print</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Clear</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        {/* Top row - 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {stats.slice(0, 4).map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{stat.count}</div>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom row - 1 card (OverAll) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${stats[4].bgColor} rounded-lg p-6 border border-gray-200`}>
            <div className="flex items-center gap-3">
              <Plus className={`w-8 h-8 ${stats[4].color}`} />
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats[4].count}</div>
                <p className="text-sm text-gray-600 mt-1">{stats[4].label}</p>
              </div>
            </div>
          </div>
        </div>
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
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Export</button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Print</button>
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
                  Plant Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approver Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Initiated By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.plantName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.documentType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.documentNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.stages}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.requestedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.approverName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.initiatedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      {item.documentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Showing 1 to 3 of 3 Entries</div>
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

export default WorkFlow
