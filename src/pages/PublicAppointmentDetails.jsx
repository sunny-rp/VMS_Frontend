"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Package,
  ShieldCheck,
  Car,
  QrCode,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentsAPI } from "../services/api";
import { Html5Qrcode } from "html5-qrcode";

// ✅ PassType => UI classes + Access labels
const PASS_UI = {
  PURPLE: {
    label: "PURPLE",
    banner: "bg-purple-100 text-purple-900 border-purple-300",
    badge: "bg-white/70 text-purple-800 border-purple-300",
    dot: "bg-purple-600",
  },
  RED: {
    label: "RED",
    banner: "bg-red-100 text-red-900 border-red-300",
    badge: "bg-white/70 text-red-800 border-red-300",
    dot: "bg-red-600",
  },
  GREEN: {
    label: "GREEN",
    banner: "bg-green-100 text-green-900 border-green-300",
    badge: "bg-white/70 text-green-800 border-green-300",
    dot: "bg-green-600",
  },
  YELLOW: {
    label: "YELLOW",
    banner: "bg-yellow-100 text-yellow-900 border-yellow-300",
    badge: "bg-white/70 text-yellow-800 border-yellow-300",
    dot: "bg-yellow-500",
  },
  PENDING: {
    label: "PENDING",
    banner: "bg-gray-100 text-gray-900 border-gray-300",
    badge: "bg-white/70 text-gray-800 border-gray-300",
    dot: "bg-gray-500",
  },
  REJECT: {
    label: "REJECT",
    banner: "bg-gray-200 text-gray-900 border-gray-300",
    badge: "bg-white/70 text-gray-900 border-gray-300",
    dot: "bg-gray-700",
  },
};

const normalizePassType = (v) => {
  const t = String(v || "PENDING").toUpperCase();
  return PASS_UI[t] ? t : "PENDING";
};

const PublicAppointmentDetails = () => {
  const { appointmentId: routeParamId } = useParams(); // can be mongoId in your route
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // ✅ QR modal
  const [showQR, setShowQR] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const qrRef = useRef(null); // holds Html5Qrcode instance
  const qrRegionId = "qr-reader-region";

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await appointmentsAPI.getPublicById(routeParamId);

      // supports both: {data:{...}} OR direct object
      setAppointment(res?.data || res);
    } catch (err) {
      console.error("[PublicAppointmentDetails] fetch error:", err);
      setError(err?.message || "Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeParamId) fetchAppointmentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeParamId]);

  // ✅ Always use appointmentId code like APT-XXXX for checkin/checkout
  const appointmentCodeId = appointment?.appointmentId || routeParamId;

  // ✅ Actual API call after scan
  const callCheckInApi = async () => {
    try {
      setCheckingIn(true);

      const API_BASE_URL =
        import.meta.env.VITE_PUBLIC_API_BASE_URL ||
        "http://localhost:5000/api/v1";

      const response = await fetch(
        `${API_BASE_URL}/visitor-form/appointments/checkin-visitors/${appointmentCodeId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // ✅ if your backend wants QR value, you can send it here
          body: JSON.stringify({ scannedQr: scannedText || "" }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to check in");
      }

      await response.json();
      toast.success("Checked in successfully!");
      await fetchAppointmentDetails();
    } catch (err) {
      console.error("[PublicAppointmentDetails] check-in error:", err);
      toast.error(err?.message || "Failed to check in");
    } finally {
      setCheckingIn(false);
      setScannedText("");
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);

      const API_BASE_URL =
        import.meta.env.VITE_PUBLIC_API_BASE_URL ||
        "http://localhost:5000/api/v1";

      const response = await fetch(
        `${API_BASE_URL}/visitor-form/appointments/checkout-visitors/${appointmentCodeId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to check out");
      }

      await response.json();
      toast.success("Checked out successfully!");
      await fetchAppointmentDetails();
    } catch (err) {
      console.error("[PublicAppointmentDetails] check-out error:", err);
      toast.error(err?.message || "Failed to check out");
    } finally {
      setCheckingOut(false);
    }
  };

  // ✅ OPEN QR on button click (instead of calling API immediately)
  const handleCheckIn = async () => {
    setShowQR(true);
  };

  // ✅ Start/Stop QR scanner when modal opens/closes
  useEffect(() => {
    const startScanner = async () => {
      try {
        // Prevent double init
        if (qrRef.current) return;

        const qr = new Html5Qrcode(qrRegionId);
        qrRef.current = qr;

        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decodedText) => {
            // ✅ scanned ANY QR
            setScannedText(decodedText || "");
            toast.success("QR Scanned!");

            // ✅ stop scanner
            try {
              await qr.stop();
              await qr.clear();
            } catch (e) {
              // ignore
            } finally {
              qrRef.current = null;
            }

            // ✅ close modal
            setShowQR(false);

            // ✅ call your check-in API now
            await callCheckInApi();
          },
          () => {
            // ignore scan errors to avoid spam
          },
        );
      } catch (e) {
        console.error("QR start error:", e);
        toast.error("Unable to access camera. Please allow camera permission.");
        setShowQR(false);
        // cleanup
        try {
          if (qrRef.current) {
            await qrRef.current.stop();
            await qrRef.current.clear();
          }
        } catch (_) {}
        qrRef.current = null;
      }
    };

    const stopScanner = async () => {
      try {
        if (qrRef.current) {
          await qrRef.current.stop();
          await qrRef.current.clear();
        }
      } catch (_) {
        // ignore
      } finally {
        qrRef.current = null;
      }
    };

    if (showQR) startScanner();
    else stopScanner();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQR]);

  const closeQRModal = () => setShowQR(false);

  // ✅ Date handling (show same IST wall time)
  const IST_TZ = "Asia/Kolkata";

  const parseAsISTWallTime = (isoString) => {
    if (!isoString) return null;
    const match = isoString.match(
      /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(\.\d+)?/,
    );
    if (!match) return new Date(isoString);
    const [, datePart, timePart, msPart = ""] = match;
    return new Date(`${datePart}T${timePart}${msPart}+05:30`);
  };

  const formatISTDate = (isoString) => {
    const d = parseAsISTWallTime(isoString);
    if (!d || isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: IST_TZ,
    });
  };

  const formatISTTime = (isoString) => {
    const d = parseAsISTWallTime(isoString);
    if (!d || isNaN(d.getTime())) return "N/A";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: IST_TZ,
    });
  };

  // ✅ checkin/out are real instants
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: IST_TZ,
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: IST_TZ,
    });
  };

  const passType = useMemo(
    () => normalizePassType(appointment?.appointmentPassType),
    [appointment],
  );
  const passUI = PASS_UI[passType];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg text-gray-600 font-medium">
            Loading appointment details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-red-100 p-4 rounded-full">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Appointment Not Found
            </h2>
            <p className="text-gray-600">
              {error || "The requested appointment could not be found."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCheckedIn = !!appointment?.checkedInTime;
  const isCheckedOut = !!appointment?.checkedOutTime;

  // ✅ FULL STRIP COLOR: if active -> pass color, else grey
  const bannerClass = appointment?.isAppointmentActive
    ? passUI.banner
    : "bg-gray-100 text-gray-900 border-gray-300";

  const actionsBlocked = passType === "REJECT";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Appointment Details
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            View your scheduled appointment information
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* ✅ FULL COLORED STRIP */}
          <div className={`w-full p-4 sm:p-6 border-b border ${bannerClass}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {appointment?.isAppointmentActive ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="text-base sm:text-lg font-semibold">
                  {appointment?.isAppointmentActive
                    ? "Active Appointment"
                    : "Inactive Appointment"}
                </span>
              </div>

              {/* ✅ Badge shows Access label */}
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${passUI.badge}`}
              >
                <span className={`w-2 h-2 rounded-full ${passUI.dot}`} />
                {passUI.label}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Visitor Info */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b pb-2">
                Visitor Information
              </h2>

              {appointment.visitors?.length > 0 ? (
                appointment.visitors.map((visitor, idx) => {
                  const belongings = Array.isArray(visitor?.belongings)
                    ? visitor.belongings
                        .map((b) => (typeof b === "string" ? b : b?.assetName))
                        .filter(Boolean)
                    : [];

                  return (
                    <div
                      key={visitor._id || idx}
                      className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500">
                              Visitor Name
                            </p>
                            <p className="font-semibold text-gray-900 capitalize break-words">
                              {visitor.fullname || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500">Company</p>
                            <p className="font-semibold text-gray-900 break-words">
                              {visitor.company || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500">Mobile</p>
                            <p className="font-semibold text-gray-900 break-words">
                              {visitor.mobile || "N/A"}
                            </p>
                          </div>
                        </div>

                        {visitor.email ? (
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-semibold text-gray-900 break-all">
                                {visitor.email}
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {visitor.vehicleNo ? (
                          <div className="flex items-start gap-3 sm:col-span-2">
                            <Car className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm text-gray-500">
                                Vehicle No
                              </p>
                              <p className="font-semibold text-gray-900 break-words">
                                {visitor.vehicleNo}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {belongings.length > 0 && (
                        <div className="mt-4 flex items-start gap-3">
                          <Package className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500">Belongings</p>
                            <p className="font-semibold text-gray-900 break-words">
                              {belongings.join(", ")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">
                  No visitor information available
                </p>
              )}
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b pb-2">
                Appointment Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Appointment Date</p>
                    <p className="font-semibold text-gray-900">
                      {formatISTDate(appointment.appointmentDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Appointment Time</p>
                    <p className="font-semibold text-gray-900">
                      {formatISTTime(appointment.appointmentDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Valid Till</p>
                    <p className="font-semibold text-gray-900">
                      {formatISTDate(appointment.appointmentValidTill)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Appointment ID</p>
                    <p className="font-semibold text-gray-900 break-all">
                      {appointment.appointmentId || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Actions
              </h2>

              {actionsBlocked ? (
                <div className="p-4 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 font-medium">
                  This appointment is <b>REJECTED</b>. Actions are disabled.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={handleCheckIn}
                    disabled={isCheckedIn || checkingIn}
                    className={`w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                      isCheckedIn
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>
                      {checkingIn
                        ? "Checking In..."
                        : isCheckedIn
                          ? "Already Checked In"
                          : "Check In (Scan QR)"}
                    </span>
                  </button>

                  <button
                    onClick={handleCheckOut}
                    disabled={!isCheckedIn || isCheckedOut || checkingOut}
                    className={`w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                      !isCheckedIn || isCheckedOut
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>
                      {checkingOut
                        ? "Checking Out..."
                        : isCheckedOut
                          ? "Already Checked Out"
                          : !isCheckedIn
                            ? "Check In First"
                            : "Check Out"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t border-gray-200">
            <p className="text-center text-xs sm:text-sm text-gray-600">
              Please arrive 10 minutes before your scheduled appointment time.
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* ✅ QR Scanner Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Scan QR to Check In
                </h3>
              </div>
              <button
                onClick={closeQRModal}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="text-sm text-gray-600 mb-3">
                Point your camera at any QR code. After scanning, the system
                will automatically check you in.
              </div>

              <div className="rounded-lg border bg-gray-50 p-3">
                {/* html5-qrcode renders camera here */}
                <div id={qrRegionId} className="w-full" />
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Appointment:{" "}
                <span className="font-semibold">{appointmentCodeId}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicAppointmentDetails;
