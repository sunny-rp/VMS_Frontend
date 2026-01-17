// services/api.js
// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"

// -------------------- Utilities --------------------

// Utility: safe JSON parsing
const parseJsonSafe = async (response) => {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

// Utility: read cookie
export const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(";").shift()
  return null
}

// Utility: set/delete cookies from the frontend.
// NOTE: httpOnly cookies CANNOT be set/read from JS (server only).
// We only set cookies here if the backend returns tokens in the JSON response.
export const setCookie = (name, value, { maxAgeSeconds } = {}) => {
  if (value == null) return
  const encoded = encodeURIComponent(String(value))
  const parts = [`${name}=${encoded}`, "Path=/", "SameSite=Lax"]
  // Do NOT set Secure on localhost over http.
  if (typeof maxAgeSeconds === "number") parts.push(`Max-Age=${maxAgeSeconds}`)
  document.cookie = parts.join("; ")
}

export const deleteCookie = (name) => {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

// ---- Cookie-first auth helpers ----
// We are using COOKIES for session persistence.
// - If backend uses httpOnly cookies, the browser will send them automatically (credentials: 'include').
// - If backend returns tokens in JSON, we store them in non-httpOnly cookies here.
const COOKIE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
}

// Minimal user cookie (UI persistence). Keep it small (cookie size limit ~4KB).
const USER_COOKIE_KEY = "vms_user"

export const getStoredUser = () => {
  try {
    const raw = getCookie(USER_COOKIE_KEY)
    if (!raw) return null
    return JSON.parse(decodeURIComponent(raw))
  } catch {
    return null
  }
}

export const persistUser = (user, { rememberMe = false } = {}) => {
  if (!user) return
  const maxAgeSeconds = rememberMe ? 60 * 60 * 24 * 7 : undefined
  // Store only safe/minimal fields
  const minimal = {
    id: user.id || user._id || user.userId,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    roleName: user.roleName || user.role?.roleName,
    roles: user.roles,
  }
  setCookie(USER_COOKIE_KEY, JSON.stringify(minimal), { maxAgeSeconds })
}

export const clearStoredUser = () => {
  deleteCookie(USER_COOKIE_KEY)
}

export const getStoredToken = () => getCookie(COOKIE_KEYS.accessToken) || null

export const getStoredRefreshToken = () => getCookie(COOKIE_KEYS.refreshToken) || null

export const persistTokens = ({ accessToken, refreshToken, rememberMe = false } = {}) => {
  // If rememberMe is false: session cookie (no Max-Age)
  // If true: persist for 7 days by default (adjust if your backend TTL differs)
  const maxAgeSeconds = rememberMe ? 60 * 60 * 24 * 7 : undefined
  if (accessToken) setCookie(COOKIE_KEYS.accessToken, accessToken, { maxAgeSeconds })
  if (refreshToken) setCookie(COOKIE_KEYS.refreshToken, refreshToken, { maxAgeSeconds })
}

export const clearPersistedTokens = () => {
  deleteCookie(COOKIE_KEYS.accessToken)
  deleteCookie(COOKIE_KEYS.refreshToken)
}

// HTTP client utility
export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
      credentials: options.credentials ?? "include",
      // Prevent browser caching of API responses (fixes unexpected 304 + empty body on refresh)
      cache: options.cache ?? "no-store",
    }

    // If a readable token cookie exists (non-httpOnly), attach it.
    // If backend uses httpOnly cookies, it will authenticate via cookie automatically.
    const token = getStoredToken()
    if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`

    try {
      const response = await fetch(url, config)

      const isAuthEndpoint =
        endpoint === "/user/login" ||
        endpoint === "/user/refresh-token" ||
        endpoint === "/user/logout"

      // 🔒 Centralized 401 handling (NO forced redirect)
      if (response.status === 401 && !isAuthEndpoint) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          config.headers.Authorization = `Bearer ${refreshed}`
          const retryResponse = await fetch(url, config)
          if (retryResponse.ok) {
            return await parseJsonSafe(retryResponse)
          }
        }

        const err = new Error("UNAUTHORIZED")
        err.status = 401
        throw err
      }

      if (!response.ok) {
        // tolerate logout 404
        if (endpoint === "/user/logout" && response.status === 404) {
          return { ok: false, status: 404 }
        }

        const errorData = await parseJsonSafe(response)
        const err = new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
        err.status = response.status
        err.body = errorData
        throw err
      }

      return await parseJsonSafe(response)
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  },

  async getValidToken() {
    return getStoredToken()
  },

  async refreshToken() {
    try {
      const refreshToken = getStoredRefreshToken()
      // Some backends use httpOnly cookies and don't expose refreshToken to JS.
      // In that case we still try the refresh endpoint with credentials.
      const response = await fetch(`${API_BASE_URL}/user/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: refreshToken ? { "Content-Type": "application/json" } : undefined,
        body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      })

      if (response.ok) {
        const data = await parseJsonSafe(response)
        // Some APIs return { token }, others { accessToken }
        // Also, if server sets httpOnly cookie, that's already handled via credentials: 'include'
        const newAccessToken = data.token || data.accessToken || null
        if (newAccessToken) {
          // If backend returns token in body, keep cookie in sync.
          persistTokens({ accessToken: newAccessToken, rememberMe: true })
        }
        return newAccessToken
      }

      return null
    } catch (error) {
      console.error("Token refresh failed:", error)
      return null
    }
  },

  async getAuthData() {
    const token = getStoredToken()
    if (!token) return null

    try {
      const response = await fetch(`${API_BASE_URL}/user/roles/fetch-roles`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await parseJsonSafe(response)
        return {
          user: data.user || data.data || data,
          token,
        }
      }
      return null
    } catch (error) {
      console.error("Error getting auth data from backend:", error)
      return null
    }
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
      const err = new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      )
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
      const err = new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      )
      err.status = response.status
      throw err
    }

    return await response.json()
  },

  logout: async () => {
    try {
      await apiClient.request("/user/logout", {
        method: "POST",
      })
    } catch (error) {
      console.warn(
        "Logout API call failed (continuing local logout):",
        error
      )
    } finally {
      // 🔥 FRONTEND SAFETY NET
      clearAuthCookies()
    }
  },

  // ✅ Always return normalized shape
  checkAuth: async () => {
    // IMPORTANT:
    // The user requested that we do NOT call /user/roles/fetch-roles for auth checks.
    // So checkAuth becomes a cookie-only rehydration helper.
    const stored = getStoredUser()
    return stored ? { success: true, data: stored } : { success: false, data: null }
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
