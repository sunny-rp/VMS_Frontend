"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { Plus, Minus, User, Package, Calendar, Loader2 } from "lucide-react"
import { plantsAPI, departmentsAPI, usersAPI, appointmentsAPI, companiesAPI, areasAPI } from "../services/api"
import { toast } from "sonner"

const VisitorForm = () => {
  const [searchParams] = useSearchParams()
  const plantIdFromUrl = searchParams.get("plantId")
  const companyIdFromUrl = searchParams.get("companyId")

  const [plants, setPlants] = useState([])
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [areas, setAreas] = useState([])
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
    setValue,
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

  const filteredUsers = useMemo(() => {
    if (!watchedDepartment || users.length === 0) {
      return users
    }

    const filtered = users.filter((user) => {
      const userDepartment = user.department || user.departmentId || user.dept || user.deptId
      return (
        userDepartment === watchedDepartment ||
        user.department?._id === watchedDepartment ||
        user.departmentId === watchedDepartment
      )
    })

    return filtered
  }, [watchedDepartment, users])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError("")
        console.log("[v0] Loading form data with URL params:", { plantIdFromUrl, companyIdFromUrl })

const dataPromises = [
          plantsAPI.getAll(companyIdFromUrl),
          departmentsAPI.getAll(plantIdFromUrl),
          usersAPI.getAll(plantIdFromUrl),
          areasAPI.getAll(plantIdFromUrl),
        ]

const companiesPromise = companiesAPI.getAll(true).catch((error) => {
          console.warn("[v0] Companies API failed, continuing without company data:", error)
          return { data: { data: [] } }
        })

        const [plantsRes, departmentsRes, usersRes, areasRes, companiesRes] = await Promise.all([
          ...dataPromises,
          companiesPromise,
        ])

        console.log("[v0] Raw API responses:", { plantsRes, departmentsRes, usersRes, companiesRes, areasRes })

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

        const areasData = Array.isArray(areasRes?.data?.areas)
          ? areasRes.data.areas
          : Array.isArray(areasRes?.data?.data)
            ? areasRes.data.data
            : Array.isArray(areasRes?.data)
              ? areasRes.data
              : []

        console.log("[v0] Extracted arrays:", {
          plants: plantsData,
          plantsCount: plantsData.length,
          departments: departmentsData,
          departmentsCount: departmentsData.length,
          users: usersData,
          usersCount: usersData.length,
          companies: companiesData,
          companiesCount: companiesData.length,
          areas: areasData,
          areasCount: areasData.length,
        })

        setPlants(plantsData)
        setDepartments(departmentsData)
        setUsers(usersData)
        setCompanies(companiesData)
        setAreas(areasData)

        if (plantIdFromUrl && plantsData.length > 0) {
          const matchingPlant = plantsData.find((p) => p._id === plantIdFromUrl || p.id === plantIdFromUrl)
          if (matchingPlant) {
            console.log("[v0] Pre-populating plant:", matchingPlant)
            setValue("plant", matchingPlant._id || matchingPlant.id)
            toast.success(`Plant "${matchingPlant.plantName || matchingPlant.name}" pre-selected`)
          } else {
            console.warn("[v0] Plant not found for ID:", plantIdFromUrl)
          }
        }

        if (companyIdFromUrl && companiesData.length > 0) {
          const matchingCompany = companiesData.find((c) => c._id === companyIdFromUrl || c.id === companyIdFromUrl)
          if (matchingCompany) {
            console.log("[v0] Pre-populating company:", matchingCompany)
            setValue("visitors.0.company", matchingCompany.companyName || matchingCompany.name || companyIdFromUrl)
            toast.success(`Company "${matchingCompany.companyName || matchingCompany.name}" pre-selected`)
          } else {
            console.warn("[v0] Company not found for ID:", companyIdFromUrl)
          }
        }

        if (
          plantsData.length === 0 &&
          departmentsData.length === 0 &&
          usersData.length === 0 &&
          areasData.length === 0
        ) {
          console.warn("[v0] No data loaded from any API")
          toast.error("No form data available. Please contact your administrator.")
        } else {
          console.log("[v0] Form data loaded successfully")
        }
      } catch (error) {
        console.error("[v0] Error loading form data:", error)
        toast.error("Failed to load some form data. Please try refreshing.")
        setError("Some form data could not be loaded")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [plantIdFromUrl, companyIdFromUrl, setValue])

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
        setError(`Visitor ${i + 1}: WhatsApp number is required`)
        return
      }
      if (!isPhoneNumber(visitor.mobile)) {
        setError(`Visitor ${i + 1}: WhatsApp must be 10-15 digits`)
        return
      }
      if (visitor.email && !isEmail(visitor.email)) {
        setError(`Visitor ${i + 1}: Invalid email format`)
        return
      }
      if (!visitor.company?.trim()) {
        setError(`Visitor ${i + 1}: Company is required`)
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
          {(plantIdFromUrl || companyIdFromUrl) && (
            <p className="text-xs text-gray-500">Preparing pre-filled data...</p>
          )}
        </div>
      </div>
    )
  }

  if (success && successData) {
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
                    {...register("plant", { required: "Plant is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Plant</option>
                    {plants.map((plant) => (
                      <option key={plant._id || plant.id || plant.plantName} value={plant._id || plant.id}>
                        {(plant.plantName || plant.name || "").toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {errors.plant && <p className="text-red-500 text-sm mt-1">{errors.plant.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select
                    {...register("department", { required: "Department is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id || dept.id || dept.departmentName} value={dept._id || dept.id}>
                        {(dept.departmentName || dept.name || "").toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
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
                        {(user.fullname || user.name || "").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area to Visit *</label>
                  <select
                    {...register("areaToVisit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Area</option>
                    {areas.map((area) => (
                      <option key={area._id || area.id} value={area._id || area.id}>
                        {(area.areaName || "").toUpperCase()}
                      </option>
                    ))}
                  </select>
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
                    <option value="Interview">INTERVIEW</option>
                    <option value="Service">SERVICE</option>
                    <option value="Meeting">MEETING</option>
                    <option value="Training">TRAINING</option>
                    <option value="Others">OTHERS</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number *</label>
            <input
              {...register(`visitors.${visitorIndex}.mobile`)}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Enter WhatsApp number"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
            <input
              {...register(`visitors.${visitorIndex}.company`, {
                required: "Company is required",
              })}
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
