"use client";

import { useState, useEffect } from "react";
import { appointmentsAPI } from "../services/api";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import VisitorForm from "./VisitorForm";

const IST_TZ = "Asia/Kolkata";

const PASS_BADGE = {
  PURPLE: "bg-purple-100 text-purple-800",
  RED: "bg-red-100 text-red-800",
  GREEN: "bg-green-100 text-green-800",
  YELLOW: "bg-yellow-100 text-yellow-800",
  PENDING: "bg-gray-100 text-gray-800",
  REJECT: "bg-gray-100 text-gray-800",
  DEFAULT: "bg-gray-100 text-gray-800",
};

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchVisitor, setSearchVisitor] = useState("");
  const [searchPersonToVisit, setSearchPersonToVisit] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTimeIST = (isoString) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: IST_TZ,
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const appointmentsResponse = await appointmentsAPI.getAll({
        search: searchVisitor || searchPersonToVisit,
      });

      // supports either {data: []} OR {data:{data:[]}}
      const raw =
        appointmentsResponse?.data?.data ?? appointmentsResponse?.data ?? [];
      const appointmentsData = Array.isArray(raw) ? raw : [];

      const activeAppointments = appointmentsData.filter(
        (a) => a?.isAppointmentActive === true,
      );

      const transformedVisitors = activeAppointments.map(
        (appointment, index) => {
          const v0 = appointment?.visitors?.[0] || {};
          const passType = String(
            appointment?.appointmentPassType || "PENDING",
          ).toUpperCase();

          return {
            id:
              appointment?.appointmentId ||
              appointment?._id ||
              `APP${index + 1}`,
            appointmentId: appointment?.appointmentId || appointment?._id,

            name: v0?.fullname
              ? String(v0.fullname).toUpperCase()
              : "UNKNOWN VISITOR",
            mobile: v0?.mobile ?? "N/A",
            company: v0?.company ?? "N/A",

            personToVisit:
              appointment?.personToVisit?.fullname ||
              appointment?.personToVisit?.name
                ? String(
                    appointment?.personToVisit?.fullname ||
                      appointment?.personToVisit?.name,
                  ).toUpperCase()
                : "UNKNOWN",

            purpose: appointment?.purposeOfVisit || "N/A",

            // card badge
            passType,

            // show appointment time (NOT check-in time)
            appointmentTime: formatTimeIST(appointment?.appointmentDate),

            appointmentDate: appointment?.appointmentDate,
            appointmentValidTill: appointment?.appointmentValidTill,
          };
        },
      );

      setAppointments(activeAppointments);
      setVisitors(transformedVisitors);
    } catch (error) {
      console.error("[Visitors] Error loading appointments:", error);
      setAppointments([]);
      setVisitors([]);
      toast.error("Failed to load visitors");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleCheckoutClick = (visitor) => {
    setSelectedVisitor(visitor);
    setShowCheckoutModal(true);
  };

  const handleCheckoutConfirm = async () => {
    if (!selectedVisitor) return;

    try {
      setCheckingOut(true);

      // If your API expects Mongo _id, this will work because we fallback to _id above.
      // If it expects appointmentId like "APT-XXXX", this will also work because we prefer appointmentId.
      const response = await appointmentsAPI.checkOut(
        selectedVisitor.appointmentId,
      );

      if (response?.success) {
        toast.success(
          `${selectedVisitor.name} has been checked out successfully!`,
        );
        setShowCheckoutModal(false);
        setSelectedVisitor(null);
        loadData();
      } else {
        toast.error(
          response?.message || "Failed to check out visitor. Please try again.",
        );
      }
    } catch (error) {
      console.error("[Visitors] Error checking out visitor:", error);
      toast.error(
        "Error checking out visitor: " + (error.message || "Unknown error"),
      );
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCheckoutCancel = () => {
    setShowCheckoutModal(false);
    setSelectedVisitor(null);
  };

  return (
    <div className="p-6">
      {!showForm ? (
        <>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Visitor Management
              </h1>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Visitor
              </button>
            </div>

            {/* Search */}
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Visitor Name"
                  value={searchVisitor}
                  onChange={(e) => setSearchVisitor(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Person to Visit"
                  value={searchPersonToVisit}
                  onChange={(e) => setSearchPersonToVisit(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Visitors List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Active Visitors
            </h2>

            {loading ? (
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center">
                Loading visitors...
              </div>
            ) : visitors.length === 0 ? (
              <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center">
                <div className="text-4xl mb-2">👥</div>
                <p className="font-medium">No Active Visitors</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click "Add Visitor" to register a new visitor
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visitors
                  .filter((v) => {
                    const matchesVisitorName = v.name
                      .toLowerCase()
                      .includes(searchVisitor.toLowerCase());
                    const matchesPersonToVisit = v.personToVisit
                      .toLowerCase()
                      .includes(searchPersonToVisit.toLowerCase());
                    return matchesVisitorName && matchesPersonToVisit;
                  })
                  .map((visitor) => {
                    const badgeClass =
                      PASS_BADGE[visitor.passType] || PASS_BADGE.DEFAULT;

                    return (
                      <div
                        key={visitor.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {visitor.name}
                            </h3>

                            {/* ✅ Pass Type badge */}
                            <span
                              className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${badgeClass}`}
                            >
                              {visitor.passType}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium">
                              {visitor.id}
                            </p>
                            <p className="text-xs text-gray-400">
                              {visitor.appointmentTime}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">📱</span>
                            <span className="text-gray-700">
                              {visitor.mobile}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">🏢</span>
                            <span className="text-gray-700">
                              {visitor.company}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">👤</span>
                            <span className="text-gray-700">
                              {visitor.personToVisit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">📋</span>
                            <span className="text-gray-700">
                              {visitor.purpose}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex gap-2">
                            {/* If you have a route, replace with navigate(...) */}
                            <button
                              type="button"
                              className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded text-sm font-medium hover:bg-blue-100 transition-colors"
                            >
                              View Details
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCheckoutClick(visitor)}
                              className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                              Check Out
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Stats card (optional) */}
          <div className="fixed bottom-6 right-6">
            <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg min-w-[140px] text-center">
              <div className="text-sm font-medium">Pending</div>
              <div className="text-sm font-medium">Check-Outs</div>
              <div className="text-3xl font-bold mt-2">0</div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Visitor Entry
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <VisitorForm
              onSuccess={() => {
                setShowForm(false);
                loadData();
              }}
            />
          </div>
        </div>
      )}

      {/* Checkout confirmation modal */}
      {showCheckoutModal && selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Check Out
                </h3>
                <button
                  onClick={handleCheckoutCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to check out the following visitor?
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">
                    {selectedVisitor.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    ID: {selectedVisitor.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Company: {selectedVisitor.company}
                  </p>
                  <p className="text-sm text-gray-600">
                    Person to Visit: {selectedVisitor.personToVisit}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCheckoutCancel}
                  disabled={checkingOut}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCheckoutConfirm}
                  disabled={checkingOut}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {checkingOut ? "Checking Out..." : "Yes, Check Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitors;
