"use client"

import { useState, useEffect } from "react"
import { visitorsAPI } from "../services/api"
import {
  Calendar,
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Building,
  FileText,
  Search,
} from "lucide-react"

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days ago
    endDate: new Date().toISOString().split("T")[0], // today
  })

  const [reportType, setReportType] = useState("overview") // overview, detailed, analytics
  const [visitors, setVisitors] = useState([])
  const [analytics, setAnalytics] = useState({
    totalVisitors: 0,
    activeVisitors: 0,
    averageVisitDuration: 0,
    peakHours: [],
    topCompanies: [],
    dailyStats: [],
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadReportData()
  }, [dateRange, reportType])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const response = await visitorsAPI.getAll()
      const allVisitors = response.data

      // Filter by date range
      const filteredVisitors = allVisitors.filter((visitor) => {
        const checkInDate = new Date(visitor.checkInTime).toISOString().split("T")[0]
        return checkInDate >= dateRange.startDate && checkInDate <= dateRange.endDate
      })

      setVisitors(filteredVisitors)

      // Calculate analytics
      const analytics = calculateAnalytics(filteredVisitors)
      setAnalytics(analytics)
    } catch (error) {
      console.error("Error loading report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (visitors) => {
    const totalVisitors = visitors.length
    const activeVisitors = visitors.filter((v) => v.status === "active").length

    // Calculate average visit duration for checked out visitors
    const checkedOutVisitors = visitors.filter((v) => v.checkOutTime)
    const totalDuration = checkedOutVisitors.reduce((sum, visitor) => {
      const checkIn = new Date(visitor.checkInTime)
      const checkOut = new Date(visitor.checkOutTime)
      return sum + (checkOut - checkIn)
    }, 0)
    const averageVisitDuration =
      checkedOutVisitors.length > 0
        ? Math.round(totalDuration / checkedOutVisitors.length / (1000 * 60)) // in minutes
        : 0

    // Calculate peak hours
    const hourCounts = {}
    visitors.forEach((visitor) => {
      const hour = new Date(visitor.checkInTime).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    const peakHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: Number.parseInt(hour), count }))

    // Calculate top companies
    const companyCounts = {}
    visitors.forEach((visitor) => {
      if (visitor.company) {
        companyCounts[visitor.company] = (companyCounts[visitor.company] || 0) + 1
      }
    })
    const topCompanies = Object.entries(companyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }))

    // Calculate daily stats
    const dailyStats = {}
    visitors.forEach((visitor) => {
      const date = new Date(visitor.checkInTime).toISOString().split("T")[0]
      if (!dailyStats[date]) {
        dailyStats[date] = { date, checkIns: 0, checkOuts: 0 }
      }
      dailyStats[date].checkIns++
      if (visitor.checkOutTime) {
        dailyStats[date].checkOuts++
      }
    })

    return {
      totalVisitors,
      activeVisitors,
      averageVisitDuration,
      peakHours,
      topCompanies,
      dailyStats: Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date)),
    }
  }

  const handleExport = (format) => {
    // Simulate export functionality
    const data = reportType === "detailed" ? visitors : analytics
    console.log(`Exporting ${format.toUpperCase()} report:`, data)
    alert(`${format.toUpperCase()} report exported successfully!`)
  }

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatHour = (hour) => {
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
  }

  const filteredVisitors = visitors.filter(
    (visitor) =>
      visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Visitor management insights and reports</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => handleExport("pdf")} className="btn-secondary flex items-center gap-2">
            <Download size={16} />
            Export PDF
          </button>
          <button onClick={() => handleExport("excel")} className="btn-primary flex items-center gap-2">
            <Download size={16} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input-field w-auto"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input-field w-auto"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field w-auto">
              <option value="overview">Overview</option>
              <option value="detailed">Detailed Report</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Overview Report */}
          {reportType === "overview" && (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Visitors</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalVisitors}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="card p-6 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Currently Active</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.activeVisitors}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="card p-6 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Avg. Visit Duration</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.averageVisitDuration}m</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </div>

                <div className="card p-6 bg-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Companies</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.topCompanies.length}</p>
                    </div>
                    <Building className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Charts section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Peak Hours */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} />
                    Peak Hours
                  </h3>
                  <div className="space-y-3">
                    {analytics.peakHours.map((peak, index) => (
                      <div key={peak.hour} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{formatHour(peak.hour)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${(peak.count / Math.max(...analytics.peakHours.map((p) => p.count))) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{peak.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Companies */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building size={20} />
                    Top Companies
                  </h3>
                  <div className="space-y-3">
                    {analytics.topCompanies.map((company, index) => (
                      <div key={company.company} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 truncate">{company.company}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(company.count / Math.max(...analytics.topCompanies.map((c) => c.count))) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{company.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Daily Stats */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Statistics</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Check-ins</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Check-outs</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Still Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.dailyStats.map((day) => (
                        <tr key={day.date} className="border-b border-gray-100">
                          <td className="py-2 text-sm text-gray-900">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-2 text-sm text-gray-900">{day.checkIns}</td>
                          <td className="py-2 text-sm text-gray-900">{day.checkOuts}</td>
                          <td className="py-2 text-sm text-gray-900">{day.checkIns - day.checkOuts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Report */}
          {reportType === "detailed" && (
            <div className="space-y-6">
              {/* Search */}
              <div className="card p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Detailed visitor table */}
              <div className="card">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText size={20} />
                    Detailed Visitor Log ({filteredVisitors.length} records)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visitor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Host
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-out
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pass Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVisitors.map((visitor) => (
                        <tr key={visitor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                              <div className="text-sm text-gray-500">{visitor.id}</div>
                              <div className="text-sm text-gray-500">{visitor.mobile}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visitor.company}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {visitor.hostName || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(visitor.checkInTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {visitor.checkOutTime ? formatTime(visitor.checkOutTime) : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                visitor.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {visitor.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                visitor.passType === "one_day"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {visitor.passType === "one_day" ? "One Day" : "Extended"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Report */}
          {reportType === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visitor Trends */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Trends</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Visitors</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.totalVisitors}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average per Day</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {Math.round(analytics.totalVisitors / Math.max(analytics.dailyStats.length, 1))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Peak Day</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {analytics.dailyStats.length > 0
                          ? analytics.dailyStats.reduce((max, day) => (day.checkIns > max.checkIns ? day : max))
                              .checkIns
                          : 0}{" "}
                        visitors
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pass Type Distribution */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pass Type Distribution</h3>
                  <div className="space-y-4">
                    {(() => {
                      const oneDayCount = visitors.filter((v) => v.passType === "one_day").length
                      const extendedCount = visitors.filter((v) => v.passType === "extended").length
                      const total = oneDayCount + extendedCount

                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">One Day Pass</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${total > 0 ? (oneDayCount / total) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8">{oneDayCount}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Extended Pass</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-orange-600 h-2 rounded-full"
                                  style={{ width: `${total > 0 ? (extendedCount / total) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8">{extendedCount}</span>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reports
