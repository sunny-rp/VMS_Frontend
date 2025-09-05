// Mock API service with realistic delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock users data
const mockUsers = [
  {
    id: 1,
    mobile: "9756934671",
    name: "Adhish Pandit",
    roles: ["super_admin"],
    company: "SHUFAB",
    status: "active",
  },
  {
    id: 2,
    mobile: "9205231705",
    name: "Reception User",
    roles: ["reception"],
    company: "SHUFAB",
    status: "active",
  },
  {
    id: 3,
    mobile: "9876543210",
    name: "Security Guard",
    roles: ["security"],
    company: "SHUFAB",
    status: "active",
  },
  {
    id: 4,
    mobile: "9123456789",
    name: "Admin User",
    roles: ["admin"],
    company: "SHUFAB",
    status: "active",
  },
  {
    id: 5,
    mobile: "9988776655",
    name: "Reception 2",
    roles: ["reception"],
    company: "SHUFAB",
    status: "inactive",
  },
]

// Mock visitors data
const mockVisitors = [
  {
    id: "VST00014",
    name: "Suhail",
    mobile: "9756934671",
    company: "M A Enterprise",
    status: "active",
    checkInTime: "2025-01-09T09:30:00Z",
    hostId: "USR00026",
    hostName: "PRAKASH SHARMA",
    passType: "one_day",
  },
  {
    id: "VST00013",
    name: "Suhail",
    mobile: "9756934671",
    company: "M A Enterprise",
    status: "active",
    checkInTime: "2025-01-09T10:15:00Z",
    hostId: "USR00025",
    hostName: "SACHENDAR SINGH",
    passType: "one_day",
  },
  {
    id: "VST00012",
    name: "Suman Singh",
    mobile: "9953000483",
    company: "Flomic global logistics",
    status: "active",
    checkInTime: "2025-01-09T08:45:00Z",
    hostId: "USR00024",
    hostName: "PUNIT SHARMA",
    passType: "one_day",
  },
  {
    id: "VST00011",
    name: "Arun Parihar",
    mobile: "9205231705",
    company: "Versatile Bonds Pvt Ltd",
    status: "checked_out",
    checkInTime: "2025-01-09T07:30:00Z",
    checkOutTime: "2025-01-09T11:45:00Z",
    hostId: "USR00023",
    hostName: "ASHOK KUMAR BIRLA",
    passType: "one_day",
  },
  {
    id: "VST00010",
    name: "SATISH",
    mobile: "8010979807",
    company: "abc pvt. ltd",
    status: "active",
    checkInTime: "2025-01-09T09:00:00Z",
    hostId: "USR00022",
    hostName: "NEERAJ KUMAR",
    passType: "extended",
  },
  {
    id: "VST00009",
    name: "Ujala",
    mobile: "8700150314",
    company: "jasmine",
    status: "active",
    checkInTime: "2025-01-09T10:30:00Z",
    hostId: "USR00021",
    hostName: "RIDHAM BEHL",
    passType: "one_day",
  },
  {
    id: "VST00008",
    name: "Shivam Pandey",
    mobile: "8240056639",
    company: "bajaj motorcycle",
    status: "checked_out",
    checkInTime: "2025-01-09T08:15:00Z",
    checkOutTime: "2025-01-09T12:30:00Z",
    hostId: "USR00020",
    hostName: "SANJEEV KUMAR",
    passType: "one_day",
  },
  {
    id: "VST00007",
    name: "Sabila Khatun",
    mobile: "7700846446",
    company: "shufab",
    status: "active",
    checkInTime: "2025-01-09T09:45:00Z",
    hostId: "USR00019",
    hostName: "CHITTA RANJAN GADANAYAK",
    passType: "extended",
  },
  {
    id: "VST00006",
    name: "KUNDAN Kumar",
    mobile: "9205231705",
    company: "bajaj motorcycle",
    status: "active",
    checkInTime: "2025-01-09T11:00:00Z",
    hostId: "USR00018",
    hostName: "GURDEEP WALIA",
    passType: "one_day",
  },
  {
    id: "VST00005",
    name: "Nanhe",
    mobile: "9311058383",
    company: "signature syndicate service",
    status: "checked_out",
    checkInTime: "2025-01-09T07:45:00Z",
    checkOutTime: "2025-01-09T10:15:00Z",
    hostId: "USR00017",
    hostName: "RAVI SAXENA",
    passType: "one_day",
  },
  {
    id: "VST00004",
    name: "Santhosh",
    mobile: "9205231705",
    company: "bajaj motorcycle",
    status: "active",
    checkInTime: "2025-01-09T08:30:00Z",
    hostId: "USR00016",
    hostName: "ABHISHEK SINGH JADON",
    passType: "extended",
  },
  {
    id: "VST00003",
    name: "Adhish Pandit",
    mobile: "9756934671",
    company: "SHUFAB",
    status: "checked_out",
    checkInTime: "2025-01-09T06:30:00Z",
    checkOutTime: "2025-01-09T18:00:00Z",
    hostId: "USR00015",
    hostName: "ASHISH KUMAR",
    passType: "one_day",
  },
]

export const authAPI = {
  login: async ({ mobile, password }) => {
    await delay(1000) // Simulate network delay

    const user = mockUsers.find((u) => u.mobile === mobile)

    if (!user || password !== "password123") {
      throw new Error("Invalid mobile number or password")
    }

    return {
      token: `mock_token_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        roles: user.roles,
        company: user.company,
      },
    }
  },
}

export const visitorsAPI = {
  getAll: async (filters = {}) => {
    await delay(500)
    let filteredVisitors = [...mockVisitors]

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filteredVisitors = filteredVisitors.filter(
        (v) =>
          v.name.toLowerCase().includes(search) ||
          v.mobile.includes(search) ||
          v.company.toLowerCase().includes(search) ||
          (v.hostName && v.hostName.toLowerCase().includes(search)),
      )
    }

    if (filters.status) {
      filteredVisitors = filteredVisitors.filter((v) => v.status === filters.status)
    }

    if (filters.passType) {
      filteredVisitors = filteredVisitors.filter((v) => v.passType === filters.passType)
    }

    return {
      data: filteredVisitors,
      total: filteredVisitors.length,
    }
  },

  checkIn: async (visitorData) => {
    await delay(800)
    const newVisitor = {
      id: `VST${String(Date.now()).slice(-5)}`,
      ...visitorData,
      status: "active",
      checkInTime: new Date().toISOString(),
    }
    mockVisitors.unshift(newVisitor)
    return newVisitor
  },

  checkOut: async (visitorId) => {
    await delay(500)
    const visitor = mockVisitors.find((v) => v.id === visitorId)
    if (visitor) {
      visitor.status = "checked_out"
      visitor.checkOutTime = new Date().toISOString()
    }
    return visitor
  },

  getById: async (visitorId) => {
    await delay(300)
    return mockVisitors.find((v) => v.id === visitorId)
  },

  update: async (visitorId, updateData) => {
    await delay(500)
    const visitorIndex = mockVisitors.findIndex((v) => v.id === visitorId)
    if (visitorIndex !== -1) {
      mockVisitors[visitorIndex] = { ...mockVisitors[visitorIndex], ...updateData }
      return mockVisitors[visitorIndex]
    }
    throw new Error("Visitor not found")
  },

  delete: async (visitorId) => {
    await delay(400)
    const visitorIndex = mockVisitors.findIndex((v) => v.id === visitorId)
    if (visitorIndex !== -1) {
      const deletedVisitor = mockVisitors.splice(visitorIndex, 1)[0]
      return deletedVisitor
    }
    throw new Error("Visitor not found")
  },
}

export const usersAPI = {
  getAll: async (filters = {}) => {
    await delay(500)
    let filteredUsers = [...mockUsers]

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.mobile.includes(search) ||
          u.company.toLowerCase().includes(search) ||
          u.roles.some((role) => role.toLowerCase().includes(search)),
      )
    }

    if (filters.status) {
      filteredUsers = filteredUsers.filter((u) => u.status === filters.status)
    }

    if (filters.role) {
      filteredUsers = filteredUsers.filter((u) => u.roles.includes(filters.role))
    }

    return {
      data: filteredUsers,
      total: filteredUsers.length,
    }
  },

  getById: async (userId) => {
    await delay(300)
    return mockUsers.find((u) => u.id === userId)
  },

  create: async (userData) => {
    await delay(800)
    const newUser = {
      id: Math.max(...mockUsers.map((u) => u.id)) + 1,
      ...userData,
    }
    mockUsers.push(newUser)
    return newUser
  },

  update: async (userId, updateData) => {
    await delay(500)
    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updateData }
      return mockUsers[userIndex]
    }
    throw new Error("User not found")
  },

  delete: async (userId) => {
    await delay(400)
    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex !== -1) {
      const deletedUser = mockUsers.splice(userIndex, 1)[0]
      return deletedUser
    }
    throw new Error("User not found")
  },

  changePassword: async (userId, passwordData) => {
    await delay(600)
    // In a real app, this would handle password changes
    console.log("Password change for user:", userId, passwordData)
    return { success: true }
  },
}
