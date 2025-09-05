"use client"

import { useState } from "react"
import { Search, Eye } from "lucide-react"

export default function FeedbackReport() {
  const [searchTerm, setSearchTerm] = useState("")

  const feedbackData = [
    {
      id: 1,
      visitorCode: "VST00013",
      feedbackUser: "Suhail",
      mobileNo: "9756934671",
      feedbackDescription: "Very good person",
      submittedAt: "2025-09-04 13:59:23",
      status: "Active",
    },
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Feedback Report</h1>
        </div>

        {/* Search and Export Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">📊</button>
              <button className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm">📋</button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Visitor Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Feedback User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Mobile No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Feedback Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Submitted At
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbackData.map((feedback) => (
                <tr key={feedback.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap border-r border-gray-200">
                    <button className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                    {feedback.visitorCode}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                    {feedback.feedbackUser}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                    {feedback.mobileNo}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                    {feedback.feedbackDescription}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                    {feedback.submittedAt}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {feedback.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium text-blue-600">1</span> to{" "}
              <span className="font-medium text-blue-600">1</span> of{" "}
              <span className="font-medium text-blue-600">1</span> Entries
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

      {/* 3D Cube */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs">Total Visitors</div>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 transform -rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs">Check-In Visitors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
