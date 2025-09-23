"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Users, UserCheck, UserX, RotateCcw, Pause, Plus } from "lucide-react"

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

  useEffect(() => {
    // Mock data - replace with actual API call
    setStats({
      oneDayPass: 0,
      extendedPass: 0,
      visitorsAppointment: 0,
      pendingApprovals: 0,
      checkedInCount: 0,
      checkedOutCount: 0,
      visitorsInside: 0,
    })
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
      {/* Page header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">VMS Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>View On :</span>
          <span className="font-medium">05/09/2025 - 05/09/2025</span>
        </div>
      </div>

      {/* Stats grid */}
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
                <p className="text-2xl font-bold text-gray-900">{stat.isAction ? "" : stat.value}</p>
                <p className={`text-sm font-medium ${stat.textColor}`}>{stat.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity placeholder */}
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
