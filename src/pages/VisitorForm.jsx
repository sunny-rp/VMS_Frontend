"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { Plus, Minus, User, Package, Calendar, Printer, ArrowLeft, Loader2 } from "lucide-react"
import { plantsAPI, departmentsAPI, usersAPI, appointmentsAPI } from "../services/api"

const VisitorForm = () => {
  const [plants, setPlants] = useState([])
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [error, setError] = useState("")

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
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
        const [plantsRes, departmentsRes, usersRes] = await Promise.all([
          plantsAPI.getAll(),
          departmentsAPI.getAll(),
          usersAPI.getAll(),
        ])

        setPlants(plantsRes.data || [])
        setDepartments(departmentsRes.data || [])
        setUsers(usersRes.data || [])
      } catch (error) {
        console.error("Error loading form data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (watchedDepartment && users.length > 0) {
      const filtered = users.filter(
        (user) => user.department === watchedDepartment || user.departmentId === watchedDepartment,
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
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

    if (!data.plant) {
      setError("Plant is required")
      return
    }
    if (!data.department) {
      setError("Department is required")
      return
    }
    if (!data.personToVisit) {
      setError("Person to visit is required")
      return
    }
    if (!data.areaToVisit) {
      setError("Area to visit is required")
      return
    }
    if (!data.appointmentDate) {
      setError("Appointment date is required")
      return
    }
    if (!data.appointmentValidTill) {
      setError("Valid till date is required")
      return
    }
    if (!data.purposeOfVisit) {
      setError("Purpose of visit is required")
      return
    }

    if (!data.visitors || data.visitors.length === 0) {
      setError("At least one visitor is required")
      return
    }

    for (let i = 0; i < data.visitors.length; i++) {
      const visitor = data.visitors[i]
      if (!visitor.fullname?.trim()) {
        setError(`Visitor ${i + 1}: Full name is required`)
        return
      }
      if (!visitor.mobile?.trim()) {
        setError(`Visitor ${i + 1}: Mobile number is required`)
        return
      }
      if (!isPhoneNumber(visitor.mobile)) {
        setError(`Visitor ${i + 1}: Mobile must be 10-15 digits`)
        return
      }
      if (visitor.email && !isEmail(visitor.email)) {
        setError(`Visitor ${i + 1}: Invalid email format`)
        return
      }
    }

    const appointmentDate = new Date(data.appointmentDate)
    const validTillDate = new Date(data.appointmentValidTill)

    if (validTillDate < appointmentDate) {
      setError("Valid till date must be after appointment date")
      return
    }

    const daysDiff = (validTillDate - appointmentDate) / (1000 * 60 * 60 * 24)
    if (daysDiff > 7) {
      setError("Valid till date must be within 7 days of appointment date")
      return
    }

    if (data.honeypot) {
      setError("Bot detected")
      return
    }

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
          belongings:
            visitor.belongings
              ?.filter((b) => b.assetName?.trim())
              .map((b) => ({
                assetName: b.assetName.trim(),
              })) || [],
        })),
      }

      const response = await appointmentsAPI.create(appointmentData)
      setSuccessData(response.data)
      setSuccess(true)
    } catch (error) {
      console.error("Error creating appointment:", error)
      setError("Failed to create appointment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleBackToForm = () => {
    setSuccess(false)
    setSuccessData(null)
    reset()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (success && successData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Created Successfully!</h1>
              <p className="text-gray-600">Your visitor appointment has been scheduled.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Appointment ID</p>
                  <p className="font-semibold">{successData.appointmentId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plant</p>
                  <p className="font-semibold">
                    {plants.find((p) => p._id === successData.plant)?.name || successData.plant}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold">
                    {departments.find((d) => d._id === successData.department)?.name || successData.department}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Person to Visit</p>
                  <p className="font-semibold">
                    {users.find((u) => u._id === successData.personToVisit)?.fullname || successData.personToVisit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Area to Visit</p>
                  <p className="font-semibold">{successData.areaToVisit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Appointment Date</p>
                  <p className="font-semibold">{new Date(successData.appointmentDate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valid Till</p>
                  <p className="font-semibold">{new Date(successData.appointmentValidTill).toLocaleString()}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Purpose of Visit</p>
                  <p className="font-semibold">{successData.purposeOfVisit}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Visitors</h2>
              {successData.visitors?.map((visitor, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold">{visitor.fullname}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mobile</p>
                      <p className="font-semibold">{visitor.mobile}</p>
                    </div>
                    {visitor.company && (
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-semibold">{visitor.company}</p>
                      </div>
                    )}
                    {visitor.email && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{visitor.email}</p>
                      </div>
                    )}
                    {visitor.belongings?.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Belongings</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {visitor.belongings.map((belonging, bIndex) => (
                            <span key={bIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {belonging.assetName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print
              </button>
              <button
                onClick={handleBackToForm}
                className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Form
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

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Appointment Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plant *</label>
                  <select
                    {...register("plant")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Plant</option>
                    {plants.map((plant) => (
                      <option key={plant._id || plant.name} value={plant._id || plant.name}>
                        {plant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select
                    {...register("department")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id || dept.name} value={dept._id || dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Person to Visit *</label>
                  <select
                    {...register("personToVisit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Person</option>
                    {filteredUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.fullname || user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area to Visit *</label>
                  <input
                    {...register("areaToVisit")}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter area to visit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date *</label>
                  <input
                    {...register("appointmentDate")}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Till *</label>
                  <input
                    {...register("appointmentValidTill")}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit *</label>
                  <select
                    {...register("purposeOfVisit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4 space-y-4 sm:space-y-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
            <input
              {...register(`visitors.${visitorIndex}.mobile`)}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Enter mobile number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              {...register(`visitors.${visitorIndex}.fullname`)}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Enter full name"
            />
          </div>
        </div>

        <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4 space-y-4 sm:space-y-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input
              {...register(`visitors.${visitorIndex}.company`)}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Enter company name"
            />
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
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <h4 className="text-md font-medium text-gray-900 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Belongings
          </h4>
          {belongingFields.length === 0 ? (
            <button
              type="button"
              onClick={() => appendBelonging({ assetName: "" })}
              className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors self-start sm:self-center"
              title="Add belonging"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => appendBelonging({ assetName: "" })}
              className="flex items-center px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </button>
          )}
        </div>

        {belongingFields.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No belongings added</p>
            <p className="text-xs mt-1">Click the + icon above to add belongings</p>
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
