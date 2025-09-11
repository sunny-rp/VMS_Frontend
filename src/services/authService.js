import { authAPI } from "./api.js"

export const loginUser = async (userData) => {
  try {
    console.log("[v0] AuthService loginUser called with:", userData)
    const response = await authAPI.login(userData)
    console.log("[v0] AuthService received response:", response)
    return response
  } catch (error) {
    console.log("[v0] AuthService error:", error.message)
    throw error
  }
}

export const logoutUser = async () => {
  try {
    const response = await authAPI.logout()
    return response
  } catch (error) {
    console.log("[v0] AuthService error:", error.message)
    throw error
  }
}
