"use client"

import { useState } from "react"
import { Search, Calendar, XCircle } from "lucide-react"

const CheckInOut = () => {
  const [visitorEntryType, setVisitorEntryType] = useState("Check Out")
  const [visitorEntryCode, setVisitorEntryCode] = useState("")
  const [visitorName, setVisitorName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock check-in/out data
  const checkInOutData = [
    {
      visitorEntryCode: "VSE00021",
      visitorType: "One Day Pass",
      visitorName: "Shyamlal",
      personToVisit: "ARPANA KUMARI ANU",
      checkedIn: "2025-09-05 15:13:07",
      checkedInBy: "ARPANA KUMARI ANU",
      checkedOut: "",
      checkedOutBy: "",
    },
    {
      visitorEntryCode: "VSE00020",
      visitorType: "One Day Pass",
      visitorName: "Kuldeep singh",
      personToVisit: "ARPANA KUMARI ANU",
      checkedIn: "2025-09-05 14:59:26",
      checkedInBy: "ARPANA KUMARI ANU",
      checkedOut: "",
      checkedOutBy: "",
    },
    {
      visitorEntryCode: "VSE00019",
      visitorType: "One Day Pass",
      visitorName: "Baljeet Singh",
      personToVisit: "RAJPAL",
      checkedIn: "2025-09-05 13:56:20",
      checkedInBy: "RAJPAL",
      checkedOut: "2025-09-05 14:45:16",
      checkedOutBy: "RAJPAL",
    },
    {
      visitorEntryCode: "VSE00016",
      visitorType: "One Day Pass",
      visitorName: "Arun Parihar",
      personToVisit: "FURKAN QURESHI",
      checkedIn: "2025-09-04 12:01:34",
      checkedInBy: "FURKAN QURESHI",
      checkedOut: "2025-09-04 16:56:46",
      checkedOutBy: "FURKAN QURESHI",
    },
    {
      visitorEntryCode: "VSE00018",
      visitorType: "One Day Pass",
      visitorName: "Suhail",
      personToVisit: "FURKAN QURESHI",
      checkedIn: "2025-09-04 12:52:17",
      checkedInBy: "FURKAN QURESHI",
      checkedOut: "2025-09-04 13:58:25",
      checkedOutBy: "FURKAN QURESHI",
    },
    {
      visitorEntryCode: "VSE00013",
      visitorType: "One Day Pass",
      visitorName: "Shivam Pandey",
      personToVisit: "ARPANA KUMARI ANU",
      checkedIn: "2025-09-03 16:37:22",
      checkedInBy: "ARPANA KUMARI ANU",
      checkedOut: "2025-09-03 16:40:17",
      checkedOutBy: "ARPANA KUMAR ANU",
    },
    {
      visitorEntryCode: "VSE00012",
      visitorType: "One Day Pass",
      visitorName: "Nanhe",
      personToVisit: "ARPANA KUMARI ANU",
      checkedIn: "2025-09-03 16:26:37",
      checkedInBy: "ARPANA KUMARI ANU",
      checkedOut: "2025-09-03 16:32:08",
      checkedOutBy: "ARPANA KUMAR ANU",
    },
    {
      visitorEntryCode: "VSE00010",
      visitorType: "One Day Pass",
      visitorName: "Sabila Khatun",
      personToVisit: "ARPANA KUMARI ANU",
      checkedIn: "2025-09-03 16:19:32",
      checkedInBy: "ARPANA KUMARI ANU",
      checkedOut: "2025-09-03 16:20:47",
      checkedOutBy: "ARPANA KUMAR ANU",
    },
    {
      visitorEntryCode: "VSE00008",
      visitorType: "One Day Pass",
      visitorName: "Nanhe",
      personToVisit: "Adhish Pandit",
      checkedIn: "2025-09-03 15:56:48",
      checkedInBy: "Adhish Pandit",
      checkedOut: "2025-09-03 15:57:16",
      checkedOutBy: "Adhish Pandit",
    },
    {
      visitorEntryCode: "VSE00005",
      visitorType: "One Day Pass",
      visitorName: "Adhish Pandit",
      personToVisit: "MANISH SATIJA",
      checkedIn: "2025-09-03 15:33:18",
      checkedInBy: "MANISH SATIJA",
      checkedOut: "2025-09-03 15:50:53",
      checkedOutBy: "Adhish Pandit",
    },
    {
      visitorEntryCode: "VSE00007",
      visitorType: "One Day Pass",
      visitorName: "Nanhe",
      personToVisit: "ARPANA KUMARI ANU",
      checkedIn: "2025-09-03 15:43:52",
      checkedInBy: "ARPANA KUMARI ANU",
      checkedOut: "2025-09-03 15:50:24",
      checkedOutBy: "ARPANA KUMAR ANU",
    },
    {
      visitorEntryCode: "VSE00006",
      visitorType: "One Day Pass",
      visitorName: "Santhosh",
      personToVisit: "Adhish Pandit",
      checkedIn: "2025-09-03 15:45:54",
      checkedInBy: "Adhish Pandit",
      checkedOut: "2025-09-03 15:48:44",
      checkedOutBy: "Adhish Pandit",
    },
    {
      visitorEntryCode: "VSE00004",
      visitorType: "One Day Pass",
      visitorName: "Prashant",
      personToVisit: "Adhish Pandit",
      checkedIn: "2025-09-01 13:05:36",
      checkedInBy: "Adhish Pandit",
      checkedOut: "2025-09-01 14:50:34",
      checkedOutBy: "Adhish Pandit",
    },
  ]

  const filteredData = checkInOutData.filter(
    (item) =>
      item.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.visitorEntryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.personToVisit.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCheckInOut = () => {
    // Handle check-in/out logic
    console.log("Check In/Out:", { visitorEntryType, visitorEntryCode, visitorName })
  }

  const handleClear = () => {
    setVisitorEntryCode("")
    setVisitorName("")
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Check In / Check Out</h1>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Entry Type</label>
              <select
                value={visitorEntryType}
                onChange={(e) => setVisitorEntryType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Check In</option>
                <option>Check Out</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visitor Entry Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Please Enter Visitor Entry Code"
                value={visitorEntryCode}
                onChange={(e) => setVisitorEntryCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visitors / Worker Name</label>
              <select
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Visitors / Worker Name</option>
                <option>Shyamlal</option>
                <option>Kuldeep singh</option>
                <option>Baljeet Singh</option>
                <option>Arun Parihar</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleCheckInOut}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>CHECK IN / CHECK OUT</span>
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>CLEAR</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor Entry Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Person to Visit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Checked In
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Checked In By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Checked Out
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Checked Out By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.visitorEntryCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.visitorType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.visitorName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.personToVisit}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.checkedIn}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.checkedInBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.checkedOut}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.checkedOutBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  Showing 1 to {filteredData.length} of {filteredData.length} Entries
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹‹</button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹</button>
                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">1</button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">›</button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">››</button>
                <select className="ml-2 text-sm border border-gray-300 rounded px-2 py-1">
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Cube */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
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

export default CheckInOut
