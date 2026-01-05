"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  UserCheck,
  UserX,
  RotateCcw,
  Pause,
  Plus,
} from "lucide-react"
import { dashboardAPI } from "../services/api"
import { toast } from "sonner"

const Dashboard = () => {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    oneDayPass: 0,
    visitorsAppointment: 0,
    pendingApprovals: 0,
    checkedInCount: 0,
    checkedOutCount: 0,
    visitorsInside: 0,
  })

  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  const capitalizeFirstLetter = (str) => {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMs = now - activityTime
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  /* =========================
     FETCH DASHBOARD COUNTS
  ========================= */
  useEffect(() => {
   const fetchDashboardData = async () => {
  try {
    setLoading(true)

    const response = await dashboardAPI.getCountings()

    // ✅ FIXED RESPONSE HANDLING
    const apiData = response?.data || response

    setStats({
      oneDayPass: apiData?.totalPassIssued?.length || 0,

      visitorsAppointment:
        apiData?.totalAppointments?.[0]?.totalAppointments || 0,

      pendingApprovals:
        apiData?.pendingAppointments?.length || 0,

      checkedInCount:
        apiData?.totalCheckedInVisitors?.[0]?.checkedInVisitors || 0,

      checkedOutCount:
        apiData?.totalCheckedOutVisitors?.[0]?.checkedOutVisitors || 0,

      visitorsInside:
        apiData?.totalVisitorsInsideCompany?.[0]?.visitorsInsideCompany || 0,
    })
  } catch (error) {
    console.error("Dashboard count error:", error)
    toast.error("Failed to load dashboard data")
  } finally {
    setLoading(false)
  }
}


    /* =========================
       FETCH RECENT ACTIVITIES
    ========================= */
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true)
        const response = await dashboardAPI.getActivities()
        const data = response?.data

        let processedActivities = []

        if (data?.checkedinActivities?.length) {
          const checkins = data.checkedinActivities.flatMap((activity) =>
            activity.visitors.map((visitor) => ({
              id: `${activity._id}-${visitor._id}-in`,
              visitorName: capitalizeFirstLetter(visitor.fullname),
              company: visitor.company || "Unknown Company",
              type: "checkin",
              createdAt: activity.updatedAt,
              timeAgo: formatTimeAgo(activity.updatedAt),
            }))
          )
          processedActivities.push(...checkins)
        }

        if (data?.checkedOutActivities?.length) {
          const checkouts = data.checkedOutActivities.flatMap((activity) =>
            activity.visitors.map((visitor) => ({
              id: `${activity._id}-${visitor._id}-out`,
              visitorName: capitalizeFirstLetter(visitor.fullname),
              company: visitor.company || "Unknown Company",
              type: "checkout",
              createdAt: activity.updatedAt,
              timeAgo: formatTimeAgo(activity.updatedAt),
            }))
          )
          processedActivities.push(...checkouts)
        }

        processedActivities.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )

        setActivities(processedActivities.slice(0, 10))
      } catch (error) {
        console.error("Activity fetch error:", error)
        toast.error("Failed to load activities")
        setActivities([])
      } finally {
        setActivitiesLoading(false)
      }
    }

    fetchDashboardData()
    fetchActivities()
  }, [])

  const handleCreateAppointment = () => {
    navigate("/visitor")
  }

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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">VMS Dashboard</h1>
        <div className="text-sm text-gray-600">
          View On : <span className="font-medium">05/09/2025 - 05/09/2025</span>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className={`p-4 rounded-lg ${stat.bgColor} ${
              stat.isAction ? "cursor-pointer hover:shadow-md" : ""
            }`}
            onClick={stat.isAction ? handleCreateAppointment : undefined}
          >
            <div className="flex items-center">
              <div
                className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="text-white w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold">
                  {stat.isAction ? "" : loading ? "..." : stat.value}
                </p>
                <p className={`text-sm font-medium ${stat.textColor}`}>
                  {stat.name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

        {activitiesLoading ? (
          <p className="text-center text-gray-500">Loading activities...</p>
        ) : activities.length ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex justify-between py-3 border-b"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === "checkin"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {activity.type === "checkin" ? (
                    <UserCheck className="text-green-600" size={16} />
                  ) : (
                    <UserX className="text-red-600" size={16} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {activity.visitorName}{" "}
                    {activity.type === "checkin"
                      ? "checked in"
                      : "checked out"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.company} • {activity.timeAgo}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
