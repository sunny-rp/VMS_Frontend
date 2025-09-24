"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Users, UserCheck, UserX, RotateCcw, Pause, Plus } from "lucide-react"
import { dashboardAPI } from "../services/api"
import { toast } from "sonner"

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

  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  const capitalizeFirstLetter = (str) => {
    if (!str) return str
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
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await dashboardAPI.getCountings()
        const data = response.data || response

        setStats({
          oneDayPass: data.oneDayPass || data.passIssued || 0,
          extendedPass: data.extendedPass || 0,
          visitorsAppointment: data.visitorsAppointment || data.appointments || 0,
          pendingApprovals: data.pendingApprovals || data.pending || 0,
          checkedInCount: data.checkedInCount || data.checkedIn || 0,
          checkedOutCount: data.checkedOutCount || data.checkedOut || 0,
          visitorsInside: data.visitorsInside || data.inside || 0,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true)
        const response = await dashboardAPI.getActivities()
        const data = response.data || response

        let processedActivities = []

        if (data.checkedinActivities && Array.isArray(data.checkedinActivities)) {
          const checkinActivities = data.checkedinActivities.flatMap((activity) =>
            activity.visitors.map((visitor) => ({
              id: `${activity._id}-${visitor._id}-checkin`,
              visitorName: capitalizeFirstLetter(visitor.fullname),
              company: visitor.company || "Unknown Company",
              type: "checkin",
              action: "check_in",
              mobile: visitor.mobile,
              email: visitor.email,
              belongings: visitor.belongings,
              createdAt: new Date(activity.updatedAt),
              timeAgo: formatTimeAgo(activity.updatedAt),
            })),
          )
          processedActivities.push(...checkinActivities)
        }

        if (data.checkedOutActivities && Array.isArray(data.checkedOutActivities)) {
          const checkoutActivities = data.checkedOutActivities.flatMap((activity) =>
            activity.visitors.map((visitor) => ({
              id: `${activity._id}-${visitor._id}-checkout`,
              visitorName: capitalizeFirstLetter(visitor.fullname),
              company: visitor.company || "Unknown Company",
              type: "checkout",
              action: "check_out",
              mobile: visitor.mobile,
              email: visitor.email,
              belongings: visitor.belongings,
              createdAt: new Date(activity.updatedAt),
              timeAgo: formatTimeAgo(activity.updatedAt),
            })),
          )
          processedActivities.push(...checkoutActivities)
        }

        processedActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        // Limit to recent activities (e.g., last 10)
        processedActivities = processedActivities.slice(0, 10)

        setActivities(processedActivities)
      } catch (error) {
        console.error("Failed to fetch activities:", error)
        toast.error("Failed to load recent activities")
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">VMS Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>View On :</span>
          <span className="font-medium">05/09/2025 - 05/09/2025</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div
            key={stat.name}
            className={`card p-4 ${stat.bgColor} ${stat.isAction ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
            onClick={stat.isAction ? handleCreateAppointment : undefined}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{stat.isAction ? "" : loading ? "..." : stat.value}</p>
                <p className={`text-sm font-medium ${stat.textColor}`}>{stat.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading activities...</div>
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-center justify-between py-3 border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 ${activity.type === "checkin" || activity.action === "check_in" ? "bg-green-100" : "bg-red-100"} rounded-full flex items-center justify-center`}
                  >
                    {activity.type === "checkin" || activity.action === "check_in" ? (
                      <UserCheck size={16} className="text-green-600" />
                    ) : (
                      <UserX size={16} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.visitorName || capitalizeFirstLetter(activity.visitor_name) || "Unknown Visitor"}{" "}
                      {activity.type === "checkin" || activity.action === "check_in" ? "checked in" : "checked out"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.company || "Unknown Company"} • {activity.timeAgo || "Recently"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">No recent activities</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
