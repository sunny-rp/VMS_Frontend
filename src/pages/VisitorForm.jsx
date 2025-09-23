"use client"

import { useState, useEffect, useRef } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import {
  Plus,
  Minus,
  User,
  Package,
  Calendar,
  Printer,
  ArrowLeft,
  Loader2,
  Camera,
  X,
  RotateCcw,
  Check,
  RefreshCcw,
} from "lucide-react"
import { plantsAPI, departmentsAPI, usersAPI, appointmentsAPI, areasAPI } from "../services/api"
import { toast } from "sonner"

/** Helper: normalize many possible API shapes into an array */
const toArray = (res, preferredKeys = []) => {
  if (Array.isArray(res)) return res
  const d = res?.data ?? res
  if (Array.isArray(d)) return d
  const keys = [
    ...preferredKeys,
    "items",
    "results",
    "docs",
    "rows",
    "list",
    "plants",
    "departments",
    "users",
    "areas",
    "data",
  ]
  for (const k of keys) {
    const v = d?.[k]
    if (Array.isArray(v)) return v
  }
  return []
}

const VisitorForm = ({ onSuccess }) => {
  const [plants, setPlants] = useState([])
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [areas, setAreas] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [error, setError] = useState("")

  const { register, control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      plant: "",
      department: "",
      personToVisit: "",
      areaToVisit: "",
      appointmentDate: "",
      appointmentValidTill: "",
      purposeOfVisit: "",
      visitors: [
        {
          mobile: "",
          fullname: "",
          company: "",
          email: "",
          belongings: [],
          photo: "", // selfie data URL
        },
      ],
      honeypot: "",
    },
  })

  const {
    fields: visitorFields,
    append: appendVisitor,
    remove: removeVisitor,
  } = useFieldArray({
    control,
    name: "visitors",
  })

  const watchedDepartment = watch("department")

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [plantsRes, departmentsRes, usersRes, areasRes] = await Promise.all([
          plantsAPI.getAll(),
          departmentsAPI.getAll(),
          usersAPI.getAll(),
          areasAPI.getAll(),
        ])
        setPlants(toArray(plantsRes, ["plants"]))
        setDepartments(toArray(departmentsRes, ["departments"]))
        setUsers(toArray(usersRes, ["users"]))
        setAreas(toArray(areasRes, ["areas"]))
      } catch (error) {
        console.error("Error loading form data:", error)
        toast.error("Failed to load form data", { description: "Please refresh the page and try again" })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Robust filter + safe fallback so list never vanishes
  useEffect(() => {
    if (!watchedDepartment) {
      setFilteredUsers(users)
      return
    }
    const dep = String(watchedDepartment)
    const filtered = users.filter((u) => {
      const d = u.department
      const candidates = [
        u.departmentId,
        d && d._id,
        d && d.id,
        d && d.name,
        d && d.departmentName,
        d, // could be a string id/name
      ]
      return candidates.map((x) => String(x ?? "")).includes(dep)
    })
    setFilteredUsers(filtered.length ? filtered : users)
  }, [watchedDepartment, users])

  const isEmail = (input) => {
    if (!input) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(input)
  }

  const isPhoneNumber = (input) => {
    if (!input) return false
    const phoneRegex = /^\d{10,15}$/
    return phoneRegex.test(input.replace(/\s/g, ""))
  }

  const onSubmit = async (data) => {
    setError("")
    if (!data.plant) return setError("Plant is required")
    if (!data.department) return setError("Department is required")
    if (!data.personToVisit) return setError("Person to visit is required")
    if (!data.areaToVisit) return setError("Area to visit is required")
    if (!data.appointmentDate) return setError("Appointment date is required")
    if (!data.appointmentValidTill) return setError("Valid till date is required")
    if (!data.purposeOfVisit) return setError("Purpose of visit is required")

    if (!data.visitors || data.visitors.length === 0) return setError("At least one visitor is required")

    for (let i = 0; i < data.visitors.length; i++) {
      const visitor = data.visitors[i]
      if (!visitor.fullname?.trim()) return setError(`Visitor ${i + 1}: Full name is required`)
      if (!visitor.mobile?.trim()) return setError(`Visitor ${i + 1}: Mobile number is required`)
      if (!isPhoneNumber(visitor.mobile)) return setError(`Visitor ${i + 1}: Mobile must be 10-15 digits`)
      if (visitor.email && !isEmail(visitor.email)) return setError(`Visitor ${i + 1}: Invalid email format`)
    }

    const appointmentDate = new Date(data.appointmentDate)
    const validTillDate = new Date(data.appointmentValidTill)
    if (validTillDate < appointmentDate) return setError("Valid till date must be after appointment date")
    const daysDiff = (validTillDate.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysDiff > 7) return setError("Valid till date must be within 7 days of appointment date")
    if (data.honeypot) return setError("Bot detected")

    try {
      setSubmitting(true)
      const appointmentData = {
        plant: data.plant,
        department: data.department,
        personToVisit: data.personToVisit,
        areaToVisit: data.areaToVisit,
        appointmentDate: data.appointmentDate,
        appointmentValidTill: data.appointmentValidTill,
        purposeOfVisit: data.purposeOfVisit,
        visitors: data.visitors.map((visitor) => ({
          mobile: Number.parseInt(visitor.mobile.replace(/\s/g, "")),
          fullname: visitor.fullname.trim(),
          company: visitor.company?.trim() || "",
          email: visitor.email?.trim() || "",
          photo: visitor.photo || "",
          belongings:
            visitor.belongings?.filter((b) => b.assetName?.trim()).map((b) => ({ assetName: b.assetName.trim() })) ||
            [],
        })),
      }

      const response = await appointmentsAPI.create(appointmentData)
      if (response?.success || response?.data) {
        toast.success("Appointment created successfully!", {
          description: `Appointment ID: ${response?.data?.appointmentId || "Generated"}`,
        })
        setSuccessData(response.data)
        setSuccess(true)
        onSuccess?.()
      } else {
        toast.error("Failed to create appointment. Please try again.")
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast.error("Error creating appointment", { description: error?.message || "Unknown error occurred" })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => window.print()
  const handleBackToForm = () => {
    setSuccess(false)
    setSuccessData(null)
    reset()
    // Scroll to top on mobile to show the form title
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading form…</p>
        </div>
      </div>
    )
  }

  if (success && successData) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 md:py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow p-5 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Appointment Created!</h1>
              <p className="text-gray-600 text-sm sm:text-base">Your visitor appointment has been scheduled.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Appointment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Detail label="Appointment ID" value={successData?.appointmentId || "N/A"} />
                <Detail
                  label="Plant"
                  value={plants.find((p) => (p._id || p.id || p.name) === successData.plant)?.name || successData.plant}
                />
                <Detail
                  label="Department"
                  value={
                    departments.find((d) => (d._id || d.id || d.name) === successData.department)?.name ||
                    successData.department
                  }
                />
                <Detail
                  label="Person to Visit"
                  value={
                    users.find((u) => (u._id || u.id || u.email) === successData.personToVisit)?.fullname ||
                    successData.personToVisit
                  }
                />
                <Detail label="Area to Visit" value={successData.areaToVisit} />
                <Detail label="Appointment Date" value={new Date(successData.appointmentDate).toLocaleString()} />
                <Detail label="Valid Till" value={new Date(successData.appointmentValidTill).toLocaleString()} />
                <Detail className="md:col-span-2" label="Purpose of Visit" value={successData.purposeOfVisit} />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Visitors</h2>
              {successData.visitors?.map((visitor, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Detail label="Full Name" value={visitor.fullname} />
                    <Detail label="Mobile" value={visitor.mobile} />
                    {visitor.company && <Detail label="Company" value={visitor.company} />}
                    {visitor.email && <Detail label="Email" value={visitor.email} />}
                    {visitor.photo && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Selfie</p>
                        <img
                          src={visitor.photo}
                          alt="Visitor selfie"
                          className="mt-1 w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    {visitor.belongings?.length > 0 && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Belongings</p>
                        <div className="flex flex-wrap gap-2">
                          {visitor.belongings.map((b, i) => (
                            <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm">
                              {b.assetName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden sm:flex gap-3 justify-center">
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print
              </button>
              <button
                onClick={handleBackToForm}
                className="inline-flex items-center justify-center px-5 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Form
              </button>
            </div>

            {/* Mobile actions */}
            <div className="sm:hidden mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Print
              </button>
              <button
                onClick={handleBackToForm}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8"> {/* extra bottom space for sticky bar on mobile */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow md:mt-6">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Visitor Registration</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Please fill out the form below to schedule your visit.
            </p>
          </div>

          <form id="visitor-form" onSubmit={handleSubmit(onSubmit)} className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-6">
            {/* Honeypot */}
            <input
              {...register("honeypot")}
              type="text"
              className="sr-only"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Appointment Details */}
            <section className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Appointment Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Plant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Plant *</label>
                  <select
                    {...register("plant")}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Plant</option>
                    {plants.map((plant) => {
                      const id = plant._id || plant.id || plant.value || plant.code || plant.name
                      const label = plant.name || plant.plantName || plant.title || plant.label || String(id)
                      return (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department *</label>
                  <select
                    {...register("department")}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => {
                      const id = dept._id || dept.id || dept.value || dept.code || dept.name
                      const label = dept.name || dept.departmentName || dept.title || dept.label || String(id)
                      return (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Person to Visit */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Person to Visit *</label>
                  <select
                    {...register("personToVisit")}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Person</option>
                    {filteredUsers.map((user) => {
                      const id = user._id || user.id || user.email || user.username
                      const label = user.fullname || user.name || user.displayName || user.email || String(id)
                      return (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Area to Visit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Area to Visit *</label>
                  <select
                    {...register("areaToVisit")}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Area</option>
                    {areas.map((area) => {
                      const id =
                        area._id || area.id || area.value || area.code || area.name || area.areaName || area.title
                      const label = area.name || area.areaName || area.title || area.label || String(id)
                      return (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointment Date *</label>
                  <input
                    {...register("appointmentDate")}
                    type="datetime-local"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Valid Till *</label>
                  <input
                    {...register("appointmentValidTill")}
                    type="datetime-local"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Purpose */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose of Visit *</label>
                  <select
                    {...register("purposeOfVisit")}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Purpose</option>
                    <option value="Interview">Interview</option>
                    <option value="Service">Service</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Training">Training</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Visitors */}
            <section className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Visitors
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    appendVisitor({
                      mobile: "",
                      fullname: "",
                      company: "",
                      email: "",
                      belongings: [],
                      photo: "",
                    })
                  }
                  className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Visitor
                </button>
              </div>

              <div className="space-y-4">
                {visitorFields.map((visitor, visitorIndex) => (
                  <VisitorCard
                    key={visitor.id}
                    visitorIndex={visitorIndex}
                    register={register}
                    control={control}
                    watch={watch}
                    setValue={setValue}
                    onRemove={() => removeVisitor(visitorIndex)}
                    canRemove={visitorFields.length > 1}
                  />
                ))}
              </div>
            </section>

            {/* Desktop submit */}
            <div className="hidden md:flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="min-w-[240px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Appointment…
                  </>
                ) : (
                  "Create Appointment"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sticky mobile submit bar (outside the card, uses form attribute) */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
        <button
          type="submit"
          form="visitor-form"
          disabled={submitting}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Appointment…
            </>
          ) : (
            "Create Appointment"
          )}
        </button>
      </div>
    </div>
  )
}

/** Simple detail line item */
const Detail = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-xs sm:text-sm text-gray-600">{label}</p>
    <p className="font-semibold break-words">{value}</p>
  </div>
)

/** One visitor card + built-in camera modal using getUserMedia */
const VisitorCard = ({ visitorIndex, register, control, watch, setValue, onRemove, canRemove }) => {
  const {
    fields: belongingFields,
    append: appendBelonging,
    remove: removeBelonging,
  } = useFieldArray({
    control,
    name: `visitors.${visitorIndex}.belongings`,
  })

  // Camera modal state
  const [showCamera, setShowCamera] = useState(false)
  const [facingMode, setFacingMode] = useState("user") // "user" (front) | "environment" (rear)
  const [snapData, setSnapData] = useState("") // temp captured frame before saving
  const [streamError, setStreamError] = useState("")

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const mediaStreamRef = useRef(null)

  const photoValue = watch(`visitors.${visitorIndex}.photo`)

  // Start camera
  const openCamera = async () => {
    setStreamError("")
    setSnapData("")
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      })
      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      console.error("Camera error:", err)
      setStreamError("Unable to access camera. Check permissions and try again.")
    }
  }

  // Stop camera
  const stopCamera = () => {
    const stream = mediaStreamRef.current
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Cleanup on modal close or unmount
  useEffect(() => {
    if (!showCamera) stopCamera()
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCamera])

  // Flip camera
  const flipCamera = async () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
    try {
      stopCamera()
      const next = facingMode === "user" ? "environment" : "user"
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next },
        audio: false,
      })
      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      setStreamError("")
      setSnapData("")
    } catch (err) {
      console.error("Flip camera error:", err)
      setStreamError("Unable to switch camera.")
    }
  }

  // Capture frame to canvas
  const takeSnapshot = () => {
    const video = videoRef.current
    theCanvas(canvasRef.current, video, setSnapData)
  }

  // Use captured photo -> save to form + close modal
  const useSnapshot = () => {
    if (!snapData) return
    setValue(`visitors.${visitorIndex}.photo`, snapData, { shouldDirty: true })
    setShowCamera(false)
  }

  // Retake (clear temp)
  const retake = () => setSnapData("")

  // Clear saved photo from form
  const clearPhoto = () => {
    setValue(`visitors.${visitorIndex}.photo`, "", { shouldDirty: true })
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Visitor {visitorIndex + 1}
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCamera}
            className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Take picture"
          >
            <Camera className="w-4 h-4 mr-1" />
            Take picture
          </button>
          {photoValue && (
            <button
              type="button"
              onClick={clearPhoto}
              className="inline-flex items-center px-2 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              title="Remove picture"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-red-600 hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50"
              title="Remove visitor"
            >
              <Minus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Photo preview (saved to form) */}
      {photoValue && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Selfie</p>
          <img src={photoValue} alt="Selfie" className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border" />
        </div>
      )}

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number *</label>
          <input
            {...register(`visitors.${visitorIndex}.mobile`)}
            type="tel"
            inputMode="numeric"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter mobile number"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
          <input
            {...register(`visitors.${visitorIndex}.fullname`)}
            type="text"
            autoCapitalize="words"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter full name"
          />
        </div>

        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
          <input
            {...register(`visitors.${visitorIndex}.company`)}
            type="text"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter company name"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            {...register(`visitors.${visitorIndex}.email`)}
            type="email"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email address"
          />
        </div>
      </div>

      {/* Belongings */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h4 className="text-md font-semibold text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Belongings
          </h4>
          <button
            type="button"
            onClick={() => appendBelonging({ assetName: "" })}
            className="inline-flex items-center px-3 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
            title="Add belonging"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </button>
        </div>

        {belongingFields.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No belongings added</p>
            <p className="text-xs mt-1">Tap “Add” to include belongings</p>
          </div>
        ) : (
          <div className="space-y-2">
            {belongingFields.map((belonging, belongingIndex) => (
              <div key={belonging.id} className="flex items-center gap-2">
                <input
                  {...register(`visitors.${visitorIndex}.belongings.${belongingIndex}.assetName`)}
                  type="text"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter asset name"
                />
                <button
                  type="button"
                  onClick={() => removeBelonging(belongingIndex)}
                  className="text-red-600 hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50"
                  title="Remove"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCamera(false)} />
          {/* Sheet */}
          <div className="relative z-10 w-full h-full sm:h-auto sm:w-[520px] bg-white sm:rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                <h4 className="font-semibold">Take selfie</h4>
              </div>
              <button
                type="button"
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => setShowCamera(false)}
                title="Close"
                aria-label="Close camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 overflow-auto">
              <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden">
                {!snapData ? (
                  <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <img src={snapData} alt="Preview" className="w-full h-full object-cover" />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {streamError && <p className="text-sm text-red-600 mt-3">{streamError}</p>}
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t bg-white sticky bottom-0">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={flipCamera}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
                  title="Flip camera"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Flip
                </button>

                {!snapData ? (
                  <button
                    type="button"
                    onClick={takeSnapshot}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    title="Capture"
                  >
                    <Camera className="w-4 h-4" />
                    Capture
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={retake}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
                      title="Retake"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={useSnapshot}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                      title="Use photo"
                    >
                      <Check className="w-4 h-4" />
                      Use photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Draw current video frame into canvas and set dataUrl */
function theCanvas(canvas, video, setSnapData) {
  if (!video || !canvas) return
  const w = video.videoWidth
  const h = video.videoHeight
  if (!w || !h) return
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  ctx.drawImage(video, 0, 0, w, h)
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
  setSnapData(dataUrl)
}

export default VisitorForm
