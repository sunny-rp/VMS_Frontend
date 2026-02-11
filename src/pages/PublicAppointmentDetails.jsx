"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogIn,
  LogOut,
  Phone,
  Building2,
  BadgeCheck,
  BadgeX,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentsAPI } from "../services/api";

const IST_TZ = "Asia/Kolkata";

// ✅ Real instant (UTC->IST) - good for checkedIn/checkedOut timestamps
const formatDateIST = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: IST_TZ,
  });
};

const formatTimeIST = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: IST_TZ,
  });
};

// ✅ Appointment date/time: parse as IST wall-time if backend stored ISO from datetime-local
// If you are sending toISOString() from frontend (recommended), then normal new Date(iso) is fine.
// We'll handle BOTH safely.
const parseAppointmentDate = (isoString) => {
  if (!isoString) return null;
  const d = new Date(isoString);
  if (!Number.isNaN(d.getTime())) return d;

  // fallback: strip timezone and treat as IST wall time
  const match = isoString.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(\.\d+)?/,
  );
  if (!match) return null;
  const [, datePart, timePart, msPart = ""] = match;
  return new Date(`${datePart}T${timePart}${msPart}+05:30`);
};

const formatApptDateIST = (isoString) => {
  const d = parseAppointmentDate(isoString);
  if (!d) return "N/A";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: IST_TZ,
  });
};

const formatApptTimeIST = (isoString) => {
  const d = parseAppointmentDate(isoString);
  if (!d) return "N/A";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: IST_TZ,
  });
};

const getPassBadge = (type) => {
  const t = (type || "").toUpperCase();

  if (t === "RED") {
    return {
      label: "RED PASS",
      pill: "bg-red-50 text-red-700 ring-red-200",
      dot: "bg-red-500",
    };
  }
  if (t === "YELLOW") {
    return {
      label: "YELLOW PASS",
      pill: "bg-yellow-50 text-yellow-800 ring-yellow-200",
      dot: "bg-yellow-400",
    };
  }
  if (t === "PURPLE") {
    return {
      label: "PURPLE PASS",
      pill: "bg-purple-50 text-purple-700 ring-purple-200",
      dot: "bg-purple-500",
    };
  }
  if (t === "PENDING") {
    return {
      label: "PENDING",
      pill: "bg-blue-50 text-blue-700 ring-blue-200",
      dot: "bg-blue-500",
    };
  }
  if (t === "REJECT") {
    return {
      label: "REJECTED",
      pill: "bg-gray-100 text-gray-700 ring-gray-200",
      dot: "bg-gray-500",
    };
  }

  return {
    label: t || "N/A",
    pill: "bg-gray-100 text-gray-700 ring-gray-200",
    dot: "bg-gray-500",
  };
};

const PublicAppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // supports APIs that return {statusCode, data, success}
      const res = await appointmentsAPI.getPublicById(appointmentId);
      const appt = res?.data?.data ?? res?.data ?? res;
      setAppointment(appt);
    } catch (err) {
      console.error("[PublicAppointmentDetails] fetch error:", err);
      setError(err?.message || "Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) fetchAppointmentDetails();
  }, [appointmentId]);

  const isCheckedIn = !!appointment?.checkedInTime;
  const isCheckedOut = !!appointment?.checkedOutTime;

  const pass = useMemo(
    () => getPassBadge(appointment?.appointmentPassType),
    [appointment?.appointmentPassType],
  );

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);

      const API_BASE_URL =
        import.meta.env.VITE_PUBLIC_API_BASE_URL ||
        "http://localhost:5000/api/v1";

      const r = await fetch(
        `${API_BASE_URL}/visitor-form/appointments/checkin-visitors/${appointmentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      const json = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(json?.message || "Failed to check in");
      }

      toast.success(json?.message || "Checked in successfully!");
      await fetchAppointmentDetails();
    } catch (err) {
      console.error("[PublicAppointmentDetails] checkin error:", err);
      toast.error(err?.message || "Failed to check in");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);

      const API_BASE_URL =
        import.meta.env.VITE_PUBLIC_API_BASE_URL ||
        "http://localhost:5000/api/v1";

      const r = await fetch(
        `${API_BASE_URL}/visitor-form/appointments/checkout-visitors/${appointmentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      const json = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(json?.message || "Failed to check out");
      }

      toast.success(json?.message || "Checked out successfully!");
      await fetchAppointmentDetails();
    } catch (err) {
      console.error("[PublicAppointmentDetails] checkout error:", err);
      toast.error(err?.message || "Failed to check out");
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur rounded-2xl border border-slate-200 shadow-xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-700 font-medium">
              Loading appointment details...
            </p>
            <p className="text-xs text-slate-500">
              Appointment ID: {appointmentId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-slate-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-rose-100 p-4 rounded-full">
              <XCircle className="w-10 h-10 text-rose-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Appointment Not Found
            </h2>
            <p className="text-slate-600">
              {error || "The requested appointment could not be found."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const visitors = Array.isArray(appointment?.visitors)
    ? appointment.visitors
    : [];
  const mainVisitor = visitors[0] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${pass.dot}`} />
            <span
              className={`text-xs font-semibold tracking-wide ${pass.label === "N/A" ? "text-slate-600" : ""}`}
            >
              {pass.label}
            </span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
            Appointment Details
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Keep this page open for check-in / check-out
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {/* Status banner */}
          <div
            className={`p-4 sm:p-6 border-b ${
              appointment.isAppointmentActive
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                {appointment.isAppointmentActive ? (
                  <BadgeCheck className="w-5 h-5" />
                ) : (
                  <BadgeX className="w-5 h-5" />
                )}
                <span className="text-base sm:text-lg font-semibold">
                  {appointment.isAppointmentActive
                    ? "Active Appointment"
                    : "Inactive Appointment"}
                </span>
              </div>

              <div className="flex justify-center sm:justify-end">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ring-1 ${pass.pill}`}
                >
                  <span className={`w-2 h-2 rounded-full ${pass.dot}`} />
                  <span className="text-xs font-semibold">
                    {appointment.appointmentPassType || "N/A"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8 space-y-8">
            {/* Key summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <p className="mt-2 font-semibold text-slate-900">
                  {formatApptDateIST(appointment.appointmentDate)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <p className="mt-2 font-semibold text-slate-900">
                  {formatApptTimeIST(appointment.appointmentDate)} —{" "}
                  {formatApptTimeIST(appointment.appointmentValidTill)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium">Appointment ID</span>
                </div>
                <p className="mt-2 font-semibold text-slate-900 break-all">
                  {appointment.appointmentId || "N/A"}
                </p>
              </div>
            </div>

            {/* Visitor Information */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
                Visitor Information
              </h2>

              {visitors.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
                  No visitor information available.
                </div>
              ) : (
                <div className="space-y-4">
                  {visitors.map((v, idx) => (
                    <div
                      key={v._id || idx}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoRow
                          icon={<User className="w-5 h-5 text-indigo-600" />}
                          label="Visitor Name"
                          value={cap(v.fullname)}
                        />
                        <InfoRow
                          icon={
                            <Building2 className="w-5 h-5 text-indigo-600" />
                          }
                          label="Company"
                          value={v.company || "N/A"}
                        />
                        <InfoRow
                          icon={<Phone className="w-5 h-5 text-indigo-600" />}
                          label="Mobile"
                          value={v.mobile ? String(v.mobile) : "N/A"}
                        />
                        <InfoRow
                          icon={
                            <FileText className="w-5 h-5 text-indigo-600" />
                          }
                          label="Email"
                          value={v.email || "N/A"}
                        />
                        <InfoRow
                          icon={<MapPin className="w-5 h-5 text-indigo-600" />}
                          label="Vehicle No"
                          value={v.vehicleNo || "N/A"}
                        />
                      </div>

                      {/* belongings */}
                      <div className="mt-4">
                        <p className="text-sm text-slate-500">Belongings</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(Array.isArray(v.belongings) ? v.belongings : [])
                            .length === 0 ? (
                            <span className="text-sm text-slate-700">N/A</span>
                          ) : (
                            v.belongings.map((b) => (
                              <span
                                key={b._id || b.assetName}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-sm"
                              >
                                <Package className="w-4 h-4 text-slate-500" />
                                {b.assetName || "N/A"}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Appointment & Company details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Appointment Details
                </h3>

                <div className="space-y-3">
                  <KV
                    icon={<Calendar className="w-4 h-4 text-indigo-600" />}
                    k="Appointment Date"
                    v={formatApptDateIST(appointment.appointmentDate)}
                  />
                  <KV
                    icon={<Clock className="w-4 h-4 text-indigo-600" />}
                    k="Appointment Time"
                    v={formatApptTimeIST(appointment.appointmentDate)}
                  />
                  <KV
                    icon={<Clock className="w-4 h-4 text-indigo-600" />}
                    k="Valid Till"
                    v={formatApptTimeIST(appointment.appointmentValidTill)}
                  />
                  <KV
                    icon={<FileText className="w-4 h-4 text-indigo-600" />}
                    k="Purpose"
                    v={appointment.purposeOfVisit || "N/A"}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Company & Meeting
                </h3>

                <div className="space-y-3">
                  <KV
                    icon={<Building2 className="w-4 h-4 text-indigo-600" />}
                    k="Company"
                    v={appointment.company?.companyName || "N/A"}
                  />
                  <KV
                    icon={<MapPin className="w-4 h-4 text-indigo-600" />}
                    k="Plant"
                    v={appointment.plant?.plantName || "N/A"}
                  />
                  <KV
                    icon={<User className="w-4 h-4 text-indigo-600" />}
                    k="Person to Visit"
                    v={appointment.personToVisit?.fullname || "N/A"}
                  />
                  <KV
                    icon={<MapPin className="w-4 h-4 text-indigo-600" />}
                    k="Area to Visit"
                    v={appointment.areaToVisit?.areaName || "N/A"}
                  />
                </div>
              </div>
            </div>

            {/* Visit Status */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
                Visit Status
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <p className="font-semibold text-slate-900">Checked In</p>
                  </div>
                  <p className="mt-2 text-slate-700">
                    {appointment.checkedInTime ? (
                      <>
                        {formatDateIST(appointment.checkedInTime)} at{" "}
                        <span className="font-semibold">
                          {formatTimeIST(appointment.checkedInTime)}
                        </span>
                      </>
                    ) : (
                      "Not yet"
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <p className="font-semibold text-slate-900">Checked Out</p>
                  </div>
                  <p className="mt-2 text-slate-700">
                    {appointment.checkedOutTime ? (
                      <>
                        {formatDateIST(appointment.checkedOutTime)} at{" "}
                        <span className="font-semibold">
                          {formatTimeIST(appointment.checkedOutTime)}
                        </span>
                      </>
                    ) : (
                      "Not yet"
                    )}
                  </p>
                </div>
              </div>

              {/* Helpful warning */}
              {!appointment.isAppointmentActive && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 flex gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      This appointment is inactive.
                    </p>
                    <p className="text-sm mt-1">
                      If you think this is a mistake, contact the admin/host.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleCheckIn}
                  disabled={
                    isCheckedIn ||
                    checkingIn ||
                    !appointment.isAppointmentActive
                  }
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                    isCheckedIn || !appointment.isAppointmentActive
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  {checkingIn
                    ? "Checking In..."
                    : isCheckedIn
                      ? "Already Checked In"
                      : "Check In"}
                </button>

                <button
                  onClick={handleCheckOut}
                  disabled={
                    !isCheckedIn ||
                    isCheckedOut ||
                    checkingOut ||
                    !appointment.isAppointmentActive
                  }
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                    !isCheckedIn ||
                    isCheckedOut ||
                    !appointment.isAppointmentActive
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-rose-600 text-white hover:bg-rose-700"
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  {checkingOut
                    ? "Checking Out..."
                    : isCheckedOut
                      ? "Already Checked Out"
                      : !isCheckedIn
                        ? "Check In First"
                        : "Check Out"}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-4 sm:px-6 md:px-8 py-5 border-t border-slate-200">
            <p className="text-center text-xs sm:text-sm text-slate-600">
              Please arrive 10 minutes before your scheduled appointment time.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const KV = ({ icon, k, v }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{k}</p>
      <p className="text-sm font-semibold text-slate-900 break-words">{v}</p>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900 break-words">
        {value}
      </p>
    </div>
  </div>
);

const cap = (s) => {
  if (!s) return "N/A";
  return String(s)
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export default PublicAppointmentDetails;
