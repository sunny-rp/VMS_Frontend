"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { User, Phone, Building, Shield, Edit, Save, X } from "lucide-react"

const Profile = () => {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    mobile: user?.mobile || "",
    company: user?.company || "",
  })

  const handleSave = () => {
    // In a real app, you would update the user profile via API
    console.log("Saving profile:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      mobile: user?.mobile || "",
      company: user?.company || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600 capitalize">{user?.roles?.[0]?.replace("_", " ")}</p>
            </div>
          </div>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
              <Edit size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleCancel} className="btn-secondary flex items-center gap-2">
                <X size={16} />
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                Save
              </button>
            </div>
          )}
        </div>

        {/* Profile form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <User size={16} className="text-gray-400" />
                <span>{user?.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="input-field"
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Phone size={16} className="text-gray-400" />
                <span>{user?.mobile}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input-field"
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Building size={16} className="text-gray-400" />
                <span>{user?.company}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Shield size={16} className="text-gray-400" />
              <span className="capitalize">{user?.roles?.[0]?.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
