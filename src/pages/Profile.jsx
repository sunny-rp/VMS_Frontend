"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Building,
  Shield,
  Edit,
  Save,
  X,
  MapPin,
  Factory,
  Mail,
  LogOut,
} from "lucide-react";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
    <div className="mt-0.5 w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
      <Icon size={16} className="text-gray-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 break-words">
        {value ?? "-"}
      </p>
    </div>
  </div>
);

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const profile = useMemo(() => {
    const fullName = (
      user?.fullname ||
      user?.fullName ||
      user?.name ||
      ""
    ).trim();
    const firstName = fullName ? fullName.split(/\s+/)[0] : "User";

    const roleText =
      user?.role?.roleName || user?.roleName || user?.roles?.[0] || "user";

    const companyText =
      user?.company?.companyName ||
      (typeof user?.company === "string" ? user.company : "") ||
      "";

    const deptText =
      user?.department?.departmentName ||
      (typeof user?.department === "string" ? user.department : "") ||
      "";

    const plantText =
      user?.plant?.plantName ||
      (typeof user?.plant === "string" ? user.plant : "") ||
      "";

    return {
      fullName: fullName || "User",
      firstName,
      mobile: user?.mobile || "",
      email: user?.email || "",
      address: user?.address || "",
      roleText,
      companyText,
      deptText,
      plantText,
      createdAt: user?.createdAt || "",
      updatedAt: user?.updatedAt || "",
    };
  }, [user]);

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    company: "",
    address: "",
  });

  // keep form synced when user changes (refresh rehydrate)
  useEffect(() => {
    setFormData({
      fullName: profile.fullName,
      mobile: profile.mobile,
      company: profile.companyText,
      address: profile.address,
    });
  }, [profile.fullName, profile.mobile, profile.companyText, profile.address]);

  const handleSave = async () => {
    // TODO: call API later
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: profile.fullName,
      mobile: profile.mobile,
      company: profile.companyText,
      address: profile.address,
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await logout();
    } finally {
      setIsSigningOut(false);
      navigate("/login", { replace: true });
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-white border rounded-2xl p-6 max-w-xl">
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            No user found. Please login again.
          </p>

          <button
            onClick={() => navigate("/login", { replace: true })}
            className="mt-4 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        )}
      </div> */}

      {/* Top card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-500">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white truncate">
                  {profile.fullName}
                </h2>
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                  {profile.firstName}
                </span>
              </div>

              <p className="text-white/90 capitalize">
                {String(profile.roleText).replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="input-field"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <User size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {profile.fullName}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  className="input-field"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Phone size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {profile.mobile || "-"}
                  </span>
                </div>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="input-field"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Building size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {profile.companyText || "-"}
                  </span>
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Shield size={16} className="text-gray-400" />
                <span className="font-semibold text-gray-900 capitalize">
                  {String(profile.roleText).replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Address (full width) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input-field"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {profile.address || "-"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InfoRow icon={Mail} label="Email" value={profile.email || "-"} />
        <InfoRow
          icon={Building}
          label="Department"
          value={profile.deptText || "-"}
        />
        <InfoRow
          icon={Factory}
          label="Plant"
          value={profile.plantText || "-"}
        />
      </div>

      {/* Account actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900">Account Actions</h3>
        <p className="text-sm text-gray-600 mt-1">
          You can sign out from your account here.
        </p>

        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="mt-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          {isSigningOut ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <LogOut size={18} />
          )}
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
