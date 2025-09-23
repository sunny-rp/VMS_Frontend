"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Users, UserCheck, UserX, RotateCcw, Pause, Plus } from "lucide-react"
import { dashboardAPI } from "../services/api"
import { toast } from "sonner"

// ---------- helpers (plain JS) ----------
const toNumber = (v) => {
  if (typeof v === "number" && !Number.isNaN(v)) return v
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v)
  return 0
}

/**
 * Safely pull a numeric count from various API shapes:
 * - number
 * - string number
 * - object with one of `keys`
 * - array of objects/numbers (use the first matching)
 */
const pickCount = (node, keys = []) => {
  if (node == null) return 0

  // If it's already a primitive
  if (typeof node !== "object") return toNumber(node)

  // If it's an array, scan items
  if (Array.isArray(node)) {
    for (const item of node) {
      if (typeof item !== "object") {
        const n = toNumber(item)
        if (n || n === 0) return n
      } else {
        for (const k of keys) {
          if (k in item) {
            const n = toNumber(item[k])
            if (n || n === 0) return n
          }
        }
      }
    }
    return 0
  }

  // Plain object: try keys
  for (const k of keys) {
    if (k in node) return toNumber(node[k])
  }
  return 0
}

const Dashboard = () => {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    oneDayPass: 0,
    extendedPass: 0,
    visitorsAppointment: 0,
    pendingApprovals: 0,
    checkedInCount: 0,
    checkedOutCount: 0,
    visitorsInside: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await dashboardAPI.getCountings()

        // Your sample payload has shape: { statusCode, data: {...}, ... }
        const payload =
          (response && response.data && response.data.data) ||
          (response && response.data) ||
          response

        setStats({
          // e.g. data.totalPassIssued: [{ totalVisitorsPassIssued: 2 }]
          oneDayPass: pickCount(payload?.totalPassIssued, [
            "totalVisitorsPassIssued",
            "passIssued",
            "totalPassIssued",
            "count",
          ]),

          // not in sample; keep 0 or map if your API adds it later
          extendedPass: pickCount(payload?.extendedPass, ["extendedPass"]),

          // e.g. data.totalAppointments: [{ totalAppointments: 4 }]
          visitorsAppointment: pickCount(payload?.totalAppointments, ["totalAppointments", "appointments"]),

          // e.g. data.pendingAppointments: [{ totalPendingAppointments: 4 }]
          pendingApprovals: pickCount(payload?.pendingAppointments, ["totalPendingAppointments", "pending"]),

          // e.g. data.totalCheckedInVisitors: [{ checkedInVisitors: 3 }]
          checkedInCount: pickCount(payload?.totalCheckedInVisitors, ["checkedInVisitors", "checkedIn"]),

          // e.g. data.totalCheckedOutVisitors: [{ checkedOutVisitors: 2 }]
          checkedOutCount: pickCount(payload?.totalCheckedOutVisitors, ["checkedOutVisitors", "checkedOut"]),

          // e.g. data.totalVisitorsInsideCompany: [] -> 0
          visitorsInside: pickCount(payload?.totalVisitorsInsideCompany, ["visitorsInside", "inside"]),
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleCreateAppointment = () => navigate("/visitor")

  const statCards = [
    {
      name: "Pass Issued",
      value: stats.oneDayPass,
      icon: Users,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      name: "Visitors Appointment",
      value: stats.visitorsAppointment,
      icon: UserCheck,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      name: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: Pause,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
    },
    {
      name: "Checked In Count",
      value: stats.checkedInCount,
      icon: RotateCcw,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      name: "Checked Out Count",
      value: stats.checkedOutCount,
      icon: RotateCcw,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      name: "Visitors inside the company",
      value: stats.visitorsInside,
      icon: Pause,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      name: "Create Appointment",
      value: "",
      icon: Plus,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      isAction: true,
    },
  ]

  const today = new Date()
  const dateStr = today.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900">VMS Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>View On :</span>
          <span className="font-medium">{dateStr} - {dateStr}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className={`card p-4 ${stat.bgColor} ${
              stat.isAction ? "cursor-pointer hover:shadow-md transition-shadow" : ""
            }`}
            onClick={stat.isAction ? handleCreateAppointment : undefined}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.isAction ? "" : loading ? "..." : stat.value}
                </p>
                <p className={`text-sm font-medium ${stat.textColor}`}>{stat.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Suhail checked in</p>
                <p className="text-xs text-gray-500">M A Enterprise • 2 minutes ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <UserX size={16} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Arun Parihar checked out</p>
                <p className="text-xs text-gray-500">Versatile Bonds Pvt Ltd • 15 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
