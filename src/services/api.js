// services/api.js
// API Configuration
const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"

// Utility: safe JSON parsing for responses that may not have a body
const parseJsonSafe = async (response) => {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

// Utility function to read cookies directly
export const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(";").shift()
  return null
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
    }

    const token = getCookie("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)

      // Avoid refresh flow for login, refresh-token, and logout endpoints
      const isAuthEndpoint =
        endpoint === "/user/login" || endpoint === "/user/refresh-token" || endpoint === "/user/logout"

      // Centralized 401 handling WITHOUT hard redirect
      if (response.status === 401 && !isAuthEndpoint) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Retry original request with new token (if backend returned it)
          config.headers.Authorization = `Bearer ${refreshed}`
          const retryResponse = await fetch(url, config)
          if (retryResponse.ok) {
            return await parseJsonSafe(retryResponse)
          }
        }
        // Throw a typed error; let UI/router decide
        const err = new Error("UNAUTHORIZED")
        err.status = 401
        throw err
      }

      if (!response.ok) {
        // Tolerate 404 on logout specifically (some backends return 404 if already logged out)
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
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  },

  async getValidToken() {
    return getCookie("accessToken")
  },

  async refreshToken() {
    try {
      const refreshToken = getCookie("refreshToken")
      if (!refreshToken) return null

      const response = await fetch(`${API_BASE_URL}/user/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await parseJsonSafe(response)
        // Some APIs return { token }, others { accessToken }
        // Also, if server sets httpOnly cookie, that's already handled via credentials: 'include'
        return data.token || data.accessToken || null
      }
      return null
    } catch (error) {
      console.error("Token refresh failed:", error)
      return null
    }
  },

  async getAuthData() {
    const token = getCookie("accessToken")
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
    // Prepare the request body based on what credentials are provided
    const requestBody = { password: credentials.password }

    if (credentials.email) {
      requestBody.email = credentials.email
    } else if (credentials.mobile) {
      requestBody.mobile = credentials.mobile
    }

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

    return await response.json() // expect { success, statusCode, data }
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
    try {
      await apiClient.request("/user/logout", {
        method: "POST",
        // If your API requires refreshToken too, you can send it:
        // body: JSON.stringify({ refreshToken: getCookie("refreshToken") }),
      })
    } catch (error) {
      console.warn("Logout API call failed (proceeding to local logout):", error)
    }
  },

  // ✅ Always return normalized shape
  checkAuth: async () => {
    // There is no /user/me endpoint in this backend.
    // We'll verify authentication by calling a lightweight protected endpoint.
    try {
      const res = await fetch(`${API_BASE_URL}/user/roles/fetch-roles`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        const data = await parseJsonSafe(res)
        return { success: true, data }
      }
      return { success: false, data: null }
    } catch (error) {
      console.error("Auth check failed:", error)
      return { success: false, data: null }
    }
  },
}

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
  getAll: async (filters = {}) => {
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
  update: async (id, plantTypeData) => {
    return await apiClient.request(`/user/plant-types/update-plant-type/${id}`, {
      method: "PUT",
      body: JSON.stringify(plantTypeData),
    })
  },
  delete: async (id) => {
    return await apiClient.request(`/user/plant-types/delete-plant-type/${id}`, {
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
  getAll: async () => {
    return await apiClient.request("/user/plants/fetch-plants")
  },
}

export const departmentsAPI = {
  create: async (departmentData) => {
    return await apiClient.request("/user/departments/create-department", {
      method: "POST",
      body: JSON.stringify(departmentData),
    })
  },
  getAll: async () => {
    return await apiClient.request("/user/departments/fetch-departments")
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
}

export const areasAPI = {
  create: async (areaData) => {
    return await apiClient.request("/user/areas/create-area", {
      method: "POST",
      body: JSON.stringify(areaData),
    })
  },
  getAll: async () => {
    return await apiClient.request("/user/areas/fetch-areas")
  },
  update: async (id, areaData) => {
    return await apiClient.request(`/user/areas/update-area/${id}`, {
      method: "PUT",
      body: JSON.stringify(areaData),
    })
  },
  delete: async (id) => {
    return await apiClient.request(`/user/areas/delete-area/${id}`, {
      method: "DELETE",
    })
  },
}

export const appointmentsAPI = {
  create: async (appointmentData) => {
    return await apiClient.request("/user/appointments/create-appointment", {
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
    const requestData = { appointmentId }
    if (qrData) {
      requestData.qrData = qrData
    }
    return await apiClient.request(`/user/appointments/checkin-visitors/${appointmentId}`, {
      method: "POST",
      body: JSON.stringify(requestData),
    })
  },
  checkOut: async (appointmentId, qrData = null) => {
    const requestData = { appointmentId }
    if (qrData) {
      requestData.qrData = qrData
    }
    return await apiClient.request(`/user/appointments/checkout-visitors/${appointmentId}`, {
      method: "POST",
      body: JSON.stringify(requestData),
    })
  },
}
