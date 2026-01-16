// services/api.js
const API_BASE_URL =
  import.meta.env.VITE_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"

// Utility: safe JSON parsing
const parseJsonSafe = async (response) => {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

// Utility: read cookie (for NON-httpOnly cookies only)


// NOTE:
// accessToken/refreshToken cookies are httpOnly (backend-managed).
// Frontend JS CANNOT read or clear them using document.cookie.
// Logout MUST be done via backend endpoint.

export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const method = (options.method || "GET").toUpperCase()
    const hasBody = options.body !== undefined && options.body !== null

    // ✅ Do NOT force Content-Type when no body (avoids CORS preflight on simple requests)
    const headers = { ...(options.headers || {}) }
    if (hasBody && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json"
    }

    const config = {
      ...options,
      method,
      headers,
      credentials: options.credentials ?? "include",
    }

    const response = await fetch(url, config)

    const isAuthEndpoint = endpoint === "/user/login" || endpoint === "/user/logout"

    if (response.status === 401 && !isAuthEndpoint) {
      const err = new Error("UNAUTHORIZED")
      err.status = 401
      throw err
    }

    if (!response.ok) {
      if (endpoint === "/user/logout" && response.status === 404) {
        return { ok: false, status: 404 }
      }

      const errorData = await parseJsonSafe(response)
      const err = new Error(errorData.message || `HTTP error! status: ${response.status}`)
      err.status = response.status
      err.body = errorData
      throw err
    }

    return await parseJsonSafe(response)
  },
}

export const authAPI = {
  login: async (credentials) => {
    const requestBody = { password: credentials.password }
    if (credentials.email) requestBody.email = credentials.email
    if (credentials.mobile) requestBody.mobile = credentials.mobile

    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const err = new Error(errorData.message || `HTTP error! status: ${response.status}`)
      err.status = response.status
      throw err
    }

    return await response.json()
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const err = new Error(errorData.message || `HTTP error! status: ${response.status}`)
      err.status = response.status
      throw err
    }

    return await response.json()
  },

  logout: async () => {
    // ✅ Simple POST (no headers/body) => browser applies Set-Cookie clears reliably
    const res = await fetch(`${API_BASE_URL}/user/logout`, {
      method: "POST",
      credentials: "include",
    })

    if (!res.ok && res.status !== 404) {
      const err = new Error(`Logout failed: ${res.status}`)
      err.status = res.status
      throw err
    }
  },

  // ✅ NO /me, NO /refresh-token
  // Just hit any protected endpoint that exists in your backend.
  // 200/204 => authenticated, 403 => authenticated but not allowed, 401 => not authenticated
  checkAuth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/dashboard/countings`, {
        method: "GET",
        credentials: "include",
      })

      if (res.ok || res.status === 403) return { success: true }
      if (res.status === 401) return { success: false }

      return { success: false }
    } catch (error) {
      console.error("Auth check failed:", error)
      return { success: false }
    }
  },
}


// -------------------- ALL BUSINESS APIs BELOW (UNCHANGED) --------------------
// visitorsAPI, usersAPI, rolesAPI, companiesAPI, countriesAPI, statesAPI,
// citiesAPI, plantTypesAPI, plantsAPI, departmentsAPI, gatesAPI,
// areasAPI, appointmentsAPI, dashboardAPI
// (your existing implementations remain exactly the same)

// ---- Example business APIs (unchanged except they use apiClient.request) ----

export const visitorsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams()
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.status) queryParams.append("status", filters.status)
    if (filters.passType) queryParams.append("passType", filters.passType)

    const endpoint = `/visitors${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return await apiClient.request(endpoint)
  },

  checkIn: async (visitorData) => {
    return await apiClient.request("/visitors/checkin", {
      method: "POST",
      body: JSON.stringify(visitorData),
    })
  },

  checkOut: async (visitorId) => {
    return await apiClient.request(`/visitors/${visitorId}/checkout`, {
      method: "PUT",
    })
  },

  getById: async (visitorId) => {
    return await apiClient.request(`/visitors/${visitorId}`)
  },

  update: async (visitorId, updateData) => {
    return await apiClient.request(`/visitors/${visitorId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  },

  delete: async (visitorId) => {
    return await apiClient.request(`/visitors/${visitorId}`, {
      method: "DELETE",
    })
  },
}

export const usersAPI = {
  getAll: async (companyId = null, filters = {}) => {
    if (companyId) {
      return await apiClient.request(`/visitor-form/fetch-users/?companyId=${companyId}`)
    }

    const queryParams = new URLSearchParams()
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.status) queryParams.append("status", filters.status)
    if (filters.role) queryParams.append("role", filters.role)

    const endpoint = `/user/fetch-users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return await apiClient.request(endpoint)
  },

  getById: async (userId) => {
    return await apiClient.request(`/users/${userId}`)
  },

  create: async (userData) => {
    return await apiClient.request("/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  update: async (userId, updateData) => {
    return await apiClient.request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  },

  delete: async (userId) => {
    return await apiClient.request(`/users/${userId}`, {
      method: "DELETE",
    })
  },

  changePassword: async (userId, passwordData) => {
    return await apiClient.request(`/users/${userId}/password`, {
      method: "PUT",
      body: JSON.stringify(passwordData),
    })
  },
}

export const rolesAPI = {
  create: async (roleData) => {
    return await apiClient.request("/user/roles/create-role", {
      method: "POST",
      body: JSON.stringify(roleData),
    })
  },
  getAll: async () => {
    return await apiClient.request("/user/roles/fetch-roles")
  },
  update: async (roleId, roleData) => {
    return await apiClient.request(`/user/roles/edit-role/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(roleData),
    })
  },
  delete: async (roleId) => {
    return await apiClient.request(`/user/roles/delete-role/${roleId}`, {
      method: "DELETE",
    })
  },
}

export const companiesAPI = {
  create: async (companyData) => {
    return await apiClient.request("/user/companies/create-company", {
      method: "POST",
      body: JSON.stringify(companyData),
    })
  },
  getAll: async () => {
    return await apiClient.request("/user/companies/fetch-companies")
  },
  update: async (companyData) => {
    return await apiClient.request("/user/companies/edit-company", {
      method: "PUT",
      body: JSON.stringify(companyData),
    })
  },
  changeStatus: async (statusData) => {
    return await apiClient.request("/user/companies/change-company-status", {
      method: "PUT",
      body: JSON.stringify(statusData),
    })
  },
  delete: async (companyId) => {
    return await apiClient.request(`/user/companies/delete-company/${companyId}`, {
      method: "DELETE",
    })
  },
}

export const countriesAPI = {
  create: async (countryData) => {
    return await apiClient.request("/user/countries/create-country", {
      method: "POST",
      body: JSON.stringify(countryData),
    })
  },
  getAll: async () => {
    return await apiClient.request("/user/countries/fetch-countries")
  },
  update: async (countryId, countryData) => {
    return await apiClient.request(`/user/countries/edit-country/${countryId}`, {
      method: "PUT",
      body: JSON.stringify(countryData),
    })
  },
  delete: async (countryId) => {
    return await apiClient.request(`/user/countries/delete-country/${countryId}`, {
      method: "DELETE",
    })
  },
}

export const statesAPI = {
  create: async (stateData) => {
    return await apiClient.request("/user/states/create-state", {
      method: "POST",
      body: JSON.stringify(stateData),
    })
  },
  getAll: async () => {
    return await apiClient.request("/user/states/fetch-states")
  },
  update: async (stateId, stateData) => {
    return await apiClient.request(`/user/states/edit-state/${stateId}`, {
      method: "PUT",
      body: JSON.stringify(stateData),
    })
  },
  delete: async (stateId) => {
    return await apiClient.request(`/user/states/delete-state/${stateId}`, {
      method: "DELETE",
    })
  },
}

export const citiesAPI = {
  create: async (cityData) => {
    return await apiClient.request("/user/cities/create-city", {
      method: "POST",
      body: JSON.stringify(cityData),
    })
  },
  getAll: async () => {
    return await apiClient.request("/user/cities/fetch-cities")
  },
  update: async (cityId, cityData) => {
    return await apiClient.request(`/user/cities/edit-city/${cityId}`, {
      method: "PUT",
      body: JSON.stringify(cityData),
    })
  },
  delete: async (cityId) => {
    return await apiClient.request(`/user/cities/delete-city/${cityId}`, {
      method: "DELETE",
    })
  },
}

export const plantTypesAPI = {
  create: async (plantTypeData) => {
    return await apiClient.request("/user/plant-types/create-plant-type", {
      method: "POST",
      body: JSON.stringify(plantTypeData),
    })
  },
  getAll: async () => {
    return await apiClient.request("/user/plant-types/fetch-plant-types")
  },
  update: async (plantTypeId, plantTypeData) => {
    return await apiClient.request(`/user/plant-types/edit-plant-type/${plantTypeId}`, {
      method: "PUT",
      body: JSON.stringify(plantTypeData),
    })
  },
  delete: async (plantTypeId) => {
    return await apiClient.request(`/user/plant-types/delete-plant-type/${plantTypeId}`, {
      method: "DELETE",
    })
  },
}

export const plantsAPI = {
  create: async (plantData) => {
    return await apiClient.request("/user/plants/create-plant", {
      method: "POST",
      body: JSON.stringify(plantData),
    })
  },
  getAll: async (companyId = null) => {
    if (companyId) {
      return await apiClient.request(`/visitor-form/plants/fetch-plants/?companyId=${companyId}`)
    }
    return await apiClient.request("/user/plants/fetch-plants")
  },
  update: async (plantId, plantData) => {
    return await apiClient.request(`/user/plants/edit-plant/${plantId}`, {
      method: "PUT",
      body: JSON.stringify(plantData),
    })
  },
  delete: async (plantId) => {
    return await apiClient.request(`/user/plants/delete-plant/${plantId}`, {
      method: "DELETE",
    })
  },
}

export const departmentsAPI = {
  create: async (departmentData) => {
    return await apiClient.request("/user/departments/create-department", {
      method: "POST",
      body: JSON.stringify(departmentData),
    })
  },
  getAll: async (companyId = null) => {
    if (companyId) {
      return await apiClient.request(`/visitor-form/departments/fetch-departments/?companyId=${companyId}`)
    }
    return await apiClient.request("/user/departments/fetch-departments")
  },
  update: async (departmentId, departmentData) => {
    return await apiClient.request(`/user/departments/edit-department/${departmentId}`, {
      method: "PUT",
      body: JSON.stringify(departmentData),
    })
  },
  delete: async (departmentId) => {
    return await apiClient.request(`/user/departments/delete-department/${departmentId}`, {
      method: "DELETE",
    })
  },
}

export const gatesAPI = {
  create: async (gateData) => {
    return await apiClient.request("/user/gates/create-gate", {
      method: "POST",
      body: JSON.stringify(gateData),
    })
  },
  getAll: async () => {
    return await apiClient.request("/user/gates/fetch-gates")
  },
  update: async (gateId, gateData) => {
    return await apiClient.request(`/user/gates/edit-gate/${gateId}`, {
      method: "PUT",
      body: JSON.stringify(gateData),
    })
  },
  delete: async (gateId) => {
    return await apiClient.request(`/user/gates/delete-gate/${gateId}`, {
      method: "DELETE",
    })
  },
}

export const areasAPI = {
  create: async (areaData) => {
    return await apiClient.request("/user/areas/create-area", {
      method: "POST",
      body: JSON.stringify(areaData),
    })
  },
  getAll: async (companyId = null) => {
    if (companyId) {
      return await apiClient.request(`/visitor-form/areas/fetch-areas/?companyId=${companyId}`)
    }
    return await apiClient.request("/user/areas/fetch-areas")
  },
  update: async (areaId, areaData) => {
    return await apiClient.request(`/user/areas/edit-area/${areaId}`, {
      method: "PUT",
      body: JSON.stringify(areaData),
    })
  },
  delete: async (areaId) => {
    return await apiClient.request(`/user/areas/delete-area/${areaId}`, {
      method: "DELETE",
    })
  },
}

export const appointmentsAPI = {
  create: async (appointmentData) => {
    return await apiClient.request("/user/appointments/create-visitor-appointment", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    })
  },
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams()
    if (filters.search) queryParams.append("search", filters.search)
    if (filters.status) queryParams.append("status", filters.status)

    const endpoint = `/user/appointments/fetch-appointments${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return await apiClient.request(endpoint)
  },
  getById: async (appointmentId) => {
    return await apiClient.request(`/user/appointments/${appointmentId}`)
  },
  getPublicById: async (appointmentId) => {
    const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"
    const response = await fetch(`${API_BASE_URL}/user/appointments/${appointmentId}`)
    if (!response.ok) {
      throw new Error("Appointment not found")
    }
    return await response.json()
  },
  fetchVisitorByAptId: async (appointmentId) => {
    return await apiClient.request(`/user/fetch-visitor-by-aptid/${appointmentId}`)
  },
  update: async (appointmentId, updateData) => {
    return await apiClient.request(`/user/appointments/${appointmentId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  },
  delete: async (appointmentId) => {
    return await apiClient.request(`/user/appointments/${appointmentId}`, {
      method: "DELETE",
    })
  },
  checkIn: async (appointmentId, qrData = null) => {
    const requestData = qrData ? { qrData } : {}
    return await apiClient.request(`/visitor-form/appointments/checkin-visitors/${appointmentId}`, {
      method: "POST",
      body: JSON.stringify(requestData),
    })
  },
  checkOut: async (appointmentId, qrData = null) => {
    const requestData = qrData ? { qrData } : {}
    return await apiClient.request(`/user/appointments/checkout-visitors/${appointmentId}`, {
      method: "POST",
      body: JSON.stringify(requestData),
    })
  },
}

export const dashboardAPI = {
  getCountings: async () => {
    return await apiClient.request("/user/dashboard/countings")
  },
  getActivities: async () => {
    return await apiClient.request("/user/dashboard/activities")
  },
}
