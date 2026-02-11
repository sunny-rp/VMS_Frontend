"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { Plus, Minus, User, Package, Calendar, Loader2 } from "lucide-react"
import { plantsAPI, departmentsAPI, usersAPI, appointmentsAPI, companiesAPI } from "../services/api"
import { toast } from "sonner"

const VisitorForm = ({ onSuccess } = {}) => {
  const [searchParams] = useSearchParams()
  const plantIdFromUrl = searchParams.get("plantId")
  const companyIdFromUrl = searchParams.get("companyId")

  const [plants, setPlants] = useState([])
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [error, setError] = useState("")

  const [departmentAutoFilled, setDepartmentAutoFilled] = useState(false)
  const [lastAutoFilledPerson, setLastAutoFilledPerson] = useState("")

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      plant: "",
      department: "",
      personToVisit: "",
      appointmentDate: "",
      appointmentValidTill: "",
      purposeOfVisit: "",
      visitors: [
        {
          mobile: "",
          fullname: "",
          company: "",
          email: "",
          vehicleNo: "", // ✅ backend expects vehicleNo here
          belongings: [], // ✅ [{assetName}]
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

  const watchedPersonToVisit = watch("personToVisit")

  // ---------------------------
  // Helpers
  // ---------------------------
  const isEmail = (input) => {
    if (!input) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(input)
  }

  const isPhoneNumber = (input) => {
    if (!input) return false
    const phoneRegex = /^\d{10,15}$/
    return phoneRegex.test(String(input).replace(/\s/g, ""))
  }

  // ---------------------------
  // Auto-fill department by personToVisit
  // ---------------------------
  useEffect(() => {
    if (!watchedPersonToVisit || users.length === 0) {
      if (!watchedPersonToVisit && departmentAutoFilled) {
        setValue("department", "", { shouldValidate: true, shouldDirty: true })
        setDepartmentAutoFilled(false)
        setLastAutoFilledPerson("")
      }
      return
    }

    if (departmentAutoFilled && watchedPersonToVisit === lastAutoFilledPerson) return

    const selectedUser = users.find((u) => u._id === watchedPersonToVisit)
    if (!selectedUser) return

    const userDept = selectedUser.department
    const userDeptId =
      userDept?._id ||
      selectedUser.departmentId ||
      selectedUser.dept?._id ||
      selectedUser.deptId ||
      (typeof userDept === "string" ? userDept : "")

    // Strategy 1: Match by department id
    let matchedDept = null
    if (userDeptId) {
      const deptIdStr = String(userDeptId)
      matchedDept = departments.find((d) => String(d._id || d.id) === deptIdStr)
    }

    // Strategy 2: headOfDepartment match
    if (!matchedDept) {
      matchedDept = departments.find(
        (d) =>
          d.headOfDepartment?._id === watchedPersonToVisit ||
          String(d.headOfDepartment) === watchedPersonToVisit,
      )
    }

    // Strategy 3: departmentCreator match
    if (!matchedDept) {
      matchedDept = departments.find(
        (d) =>
          d.departmentCreator?._id === watchedPersonToVisit ||
          String(d.departmentCreator) === watchedPersonToVisit,
      )
    }

    if (matchedDept) {
      const matchedId = String(matchedDept._id || matchedDept.id)
      setValue("department", matchedId, { shouldValidate: true, shouldDirty: true })
      setDepartmentAutoFilled(true)
      setLastAutoFilledPerson(watchedPersonToVisit)

      toast.success(`Department "${(matchedDept.departmentName || matchedDept.name || "").toUpperCase()}" auto-selected`)
      return
    }

    // If not found in list but exists on user object, add it dynamically
    if (userDeptId) {
      const newDeptId = String(userDeptId)
      const newDeptName = userDept?.departmentName || userDept?.name || "Unknown Department"

      setDepartments((prev) => {
        if (prev.some((d) => String(d._id || d.id) === newDeptId)) return prev
        return [...prev, { _id: newDeptId, departmentName: newDeptName }]
      })

      setTimeout(() => {
        setValue("department", newDeptId, { shouldValidate: true, shouldDirty: true })
      }, 0)

      setDepartmentAutoFilled(true)
      setLastAutoFilledPerson(watchedPersonToVisit)
      toast.success(`Department "${newDeptName.toUpperCase()}" auto-selected`)
    }
  }, [
    watchedPersonToVisit,
    users,
    departments,
    setValue,
    departmentAutoFilled,
    lastAutoFilledPerson,
  ])

  // ---------------------------
  // Load dropdown data
  // ---------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError("")

        const dataPromises = [
          plantsAPI.getAll(companyIdFromUrl),
          departmentsAPI.getAll(plantIdFromUrl),
          usersAPI.getAll(plantIdFromUrl),
        ]

        const companiesPromise = companiesAPI.getAll(true).catch((err) => {
          console.warn("Companies API failed, continuing without company data:", err)
          return { data: { data: [] } }
        })

        const [plantsRes, departmentsRes, usersRes, companiesRes] = await Promise.all([
          ...dataPromises,
          companiesPromise,
        ])

        const plantsData = Array.isArray(plantsRes?.data?.data)
          ? plantsRes.data.data
          : Array.isArray(plantsRes?.data)
            ? plantsRes.data
            : []

        const departmentsData = Array.isArray(departmentsRes?.data?.data)
          ? departmentsRes.data.data
          : Array.isArray(departmentsRes?.data)
            ? departmentsRes.data
            : []

        const usersData = Array.isArray(usersRes?.data?.data)
          ? usersRes.data.data
          : Array.isArray(usersRes?.data)
            ? usersRes.data
            : []

        const companiesData = Array.isArray(companiesRes?.data?.data)
          ? companiesRes.data.data
          : Array.isArray(companiesRes?.data)
            ? companiesRes.data
            : []

        setPlants(plantsData)
        setDepartments(departmentsData)
        setUsers(usersData)
        setCompanies(companiesData)

        // Preselect plant if in URL
        if (plantIdFromUrl && plantsData.length > 0) {
          const matchingPlant = plantsData.find((p) => p._id === plantIdFromUrl || p.id === plantIdFromUrl)
          if (matchingPlant) {
            setValue("plant", matchingPlant._id || matchingPlant.id)
            toast.success(`Plant "${matchingPlant.plantName || matchingPlant.name}" pre-selected`)
          }
        }

        // Pre-fill company name for first visitor if companyId in URL
        if (companyIdFromUrl && companiesData.length > 0) {
          const matchingCompany = companiesData.find((c) => c._id === companyIdFromUrl || c.id === companyIdFromUrl)
          if (matchingCompany) {
            setValue("visitors.0.company", matchingCompany.companyName || matchingCompany.name || companyIdFromUrl)
            toast.success(`Company "${matchingCompany.companyName || matchingCompany.name}" pre-selected`)
          }
        }

        if (plantsData.length === 0 && departmentsData.length === 0 && usersData.length === 0) {
          toast.error("No form data available. Please contact your administrator.")
        }
      } catch (err) {
        console.error("Error loading form data:", err)
        toast.error("Failed to load some form data. Please try refreshing.")
        setError("Some form data could not be loaded")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [plantIdFromUrl, companyIdFromUrl, setValue])

  // ---------------------------
  // Submit
  // ---------------------------
  const onSubmit = async (data) => {
    setError("")

    // Required checks
    if (!data.plant) return setError("Plant is required")
    if (!data.personToVisit) return setError("Person to visit is required")
    if (!data.department) return setError("Department is required")
    if (!data.appointmentDate) return setError("Appointment date is required")
    if (!data.appointmentValidTill) return setError("Valid till date is required")
    if (!data.purposeOfVisit) return setError("Purpose of visit is required")

    if (!data.visitors || data.visitors.length === 0) return setError("At least one visitor is required")

    // Visitor validations
    for (let i = 0; i < data.visitors.length; i++) {
      const v = data.visitors[i]
      if (!v.fullname?.trim()) return setError(`Visitor ${i + 1}: Full name is required`)
      if (!v.mobile?.trim()) return setError(`Visitor ${i + 1}: WhatsApp number is required`)
      if (!isPhoneNumber(v.mobile)) return setError(`Visitor ${i + 1}: WhatsApp must be 10-15 digits`)
      if (v.email && !isEmail(v.email)) return setError(`Visitor ${i + 1}: Invalid email format`)
      if (!v.company?.trim()) return setError(`Visitor ${i + 1}: Company is required`)
    }

    // Date checks
    const appointmentDate = new Date(data.appointmentDate)
    const validTillDate = new Date(data.appointmentValidTill)
    if (validTillDate < appointmentDate) return setError("Valid till date must be after appointment date")

    const daysDiff = (validTillDate - appointmentDate) / (1000 * 60 * 60 * 24)
    if (daysDiff > 7) return setError("Valid till date must be within 7 days of appointment date")

    // Honeypot
    if (data.honeypot) return setError("Bot detected")

    try {
      setSubmitting(true)

      // ✅ Payload exactly as backend expects:
      // - visitor.vehicleNo
      // - belongings: [{ assetName }]
      const payload = {
        plant: data.plant,
        department: data.department,
        personToVisit: data.personToVisit,
        areaToVisit: data.areaToVisit || null,
        appointmentDate: data.appointmentDate,
        appointmentValidTill: data.appointmentValidTill,
        purposeOfVisit: data.purposeOfVisit,
        visitors: data.visitors.map((visitor) => ({
          mobile: Number.parseInt(String(visitor.mobile).replace(/\s/g, "")) || 0,
          fullname: visitor.fullname.trim(),
          company: visitor.company.trim(),
          email: visitor.email?.trim() || "",
          vehicleNo: visitor.vehicleNo?.trim() || "",

          belongings:
            visitor.belongings
              ?.filter((b) => b.assetName?.trim())
              .map((b) => ({
                assetName: b.assetName.trim(),
              })) || [],
        })),
      }

      console.log("[VisitorForm] Payload:", payload)

      const response = await appointmentsAPI.create(payload)

      setSuccessData(response?.data || null)
      setSuccess(true)
      toast.success("Appointment created successfully!")

      onSuccess?.(response?.data)
    } catch (err) {
      console.error("Error creating appointment:", err)
      setError(err?.message || "Failed to create appointment. Please try again.")
      toast.error("Failed to create appointment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToForm = () => {
    setSuccess(false)
    setSuccessData(null)
    setDepartmentAutoFilled(false)
    setLastAutoFilledPerson("")
    reset()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading form...</p>
          {(plantIdFromUrl || companyIdFromUrl) && <p className="text-xs text-gray-500">Preparing pre-filled data...</p>}
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Created Successfully!</h1>

              <button
                type="button"
                onClick={handleBackToForm}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Visitor Registration Form</h1>
            <p className="text-gray-600">Please fill out the form below to schedule your visit</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <input
              {...register("honeypot")}
              type="text"
              style={{ position: "absolute", left: "-9999px", opacity: 0 }}
              tabIndex={-1}
              autoComplete="off"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
            )}

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Appointment Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plant *</label>
                  <select
                    {...register("plant", { required: "Plant is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Plant</option>
                    {plants.map((plant) => (
                      <option key={plant._id || plant.id} value={plant._id || plant.id}>
                        {(plant.plantName || plant.name || "").toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {errors.plant && <p className="text-red-500 text-sm mt-1">{errors.plant.message}</p>}
                </div>

                {/* Person to Visit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Person to Visit *</label>
                  <select
                    {...register("personToVisit", { required: "Person to visit is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Person</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {(user.fullname || user.name || "").toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {errors.personToVisit && <p className="text-red-500 text-sm mt-1">{errors.personToVisit.message}</p>}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                    {departmentAutoFilled && (
                      <span className="ml-2 text-xs font-normal text-green-600">(Auto-filled)</span>
                    )}
                  </label>
                  <select
                    {...register("department", { required: "Department is required" })}
                    disabled={departmentAutoFilled}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      departmentAutoFilled ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={String(dept._id || dept.id)} value={String(dept._id || dept.id)}>
                        {(dept.departmentName || dept.name || "").toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
                </div>

                {/* Appointment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date *</label>
                  <input
                    {...register("appointmentDate", { required: "Appointment date is required" })}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.appointmentDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.appointmentDate.message}</p>
                  )}
                </div>

                {/* Valid Till */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Till *</label>
                  <input
                    {...register("appointmentValidTill", { required: "Valid till date is required" })}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.appointmentValidTill && (
                    <p className="text-red-500 text-sm mt-1">{errors.appointmentValidTill.message}</p>
                  )}
                </div>

                {/* Purpose */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit *</label>
                  <select
                    {...register("purposeOfVisit", { required: "Purpose of visit is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Purpose</option>
                    <option value="Interview">INTERVIEW</option>
                    <option value="Service">SERVICE</option>
                    <option value="Meeting">MEETING</option>
                    <option value="Training">TRAINING</option>
                    <option value="Others">OTHERS</option>
                  </select>
                  {errors.purposeOfVisit && (
                    <p className="text-red-500 text-sm mt-1">{errors.purposeOfVisit.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Visitors */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2" />
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
                      vehicleNo: "",
                      belongings: [],
                    })
                  }
                  className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Visitor
                </button>
              </div>

              {visitorFields.map((visitor, visitorIndex) => (
                <VisitorCard
                  key={visitor.id}
                  visitorIndex={visitorIndex}
                  register={register}
                  control={control}
                  errors={errors}
                  onRemove={() => removeVisitor(visitorIndex)}
                  canRemove={visitorFields.length > 1}
                />
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-center px-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Appointment...
                  </>
                ) : (
                  "Create Appointment"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const VisitorCard = ({ visitorIndex, register, control, errors, onRemove, canRemove }) => {
  const {
    fields: belongingFields,
    append: appendBelonging,
    remove: removeBelonging,
  } = useFieldArray({
    control,
    name: `visitors.${visitorIndex}.belongings`,
  })

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <User className="w-4 h-4 mr-2" />
          Visitor {visitorIndex + 1}
        </h3>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="self-start sm:self-center text-red-600 hover:text-red-800 transition-colors p-1"
          >
            <Minus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Visitor fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number *</label>
          <input
            {...register(`visitors.${visitorIndex}.mobile`, { required: "WhatsApp number is required" })}
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Enter WhatsApp number"
          />
          {errors?.visitors?.[visitorIndex]?.mobile && (
            <p className="text-red-500 text-xs mt-1">{errors.visitors[visitorIndex].mobile.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            {...register(`visitors.${visitorIndex}.fullname`, { required: "Full name is required" })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Enter full name"
          />
          {errors?.visitors?.[visitorIndex]?.fullname && (
            <p className="text-red-500 text-xs mt-1">{errors.visitors[visitorIndex].fullname.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
          <input
            {...register(`visitors.${visitorIndex}.company`, { required: "Company is required" })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Enter company name"
          />
          {errors?.visitors?.[visitorIndex]?.company && (
            <p className="text-red-500 text-xs mt-1">{errors.visitors[visitorIndex].company.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            {...register(`visitors.${visitorIndex}.email`)}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Enter email address"
          />
        </div>

        {/* ✅ vehicleNo (backend expects this) */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle No (optional)</label>
          <input
            {...register(`visitors.${visitorIndex}.vehicleNo`)}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Enter vehicle number"
          />
        </div>
      </div>

      {/* Belongings */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <h4 className="text-md font-medium text-gray-900 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Belongings
          </h4>

          <button
            type="button"
            onClick={() => appendBelonging({ assetName: "" })}
            className="flex items-center px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </button>
        </div>

        {belongingFields.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No belongings added</p>
          </div>
        ) : (
          <div className="space-y-2">
            {belongingFields.map((belonging, belongingIndex) => (
              <div key={belonging.id} className="flex items-center gap-2">
                <input
                  {...register(`visitors.${visitorIndex}.belongings.${belongingIndex}.assetName`)}
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Enter asset name"
                />

                <button
                  type="button"
                  onClick={() => removeBelonging(belongingIndex)}
                  className="text-red-600 hover:text-red-800 transition-colors p-1"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VisitorForm
