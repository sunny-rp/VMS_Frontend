"use client"

import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"

import LoginPage from "./pages/LoginPage"
import DashboardLayout from "./components/layout/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import Visitors from "./pages/Visitors"
import CheckIn from "./pages/CheckIn"
import Reports from "./pages/Reports"
import Users from "./pages/Users"
import Profile from "./pages/Profile"
import ProtectedRoute from "./components/ProtectedRoute"
import Company from "./pages/Company"
import Plant from "./pages/Plant"
import Area from "./pages/Area"
import Department from "./pages/Department"
import RoutePage from "./pages/Route"
import Gate from "./pages/Gate"
import Shift from "./pages/Shift"
import Country from "./pages/Country"
import State from "./pages/State"
import City from "./pages/City"
import UserManagement from "./pages/UserManagement"
import Role from "./pages/Role"
import RoleWiseScreenMapping from "./pages/RoleWiseScreenMapping"
import UserWiseScreenMapping from "./pages/UserWiseScreenMapping"
import ApprovalConfiguration from "./pages/ApprovalConfiguration"
import WorkFlow from "./pages/WorkFlow"
import Appointment from "./pages/Appointment"
import CheckInOut from "./pages/CheckInOut"
import CheckInCheckOutReport from "./pages/CheckInCheckOutReport"
import VehicleInvoiceReport from "./pages/VehicleInvoiceReport"
import FeedbackReport from "./pages/FeedbackReport"
import PlantType from "./pages/PlantType"
import VisitorForm from "./pages/VisitorForm"
import PublicAppointmentDetails from "./pages/PublicAppointmentDetails"


const AuthGate = ({ children }) => {
  const { isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="spinner h-8 w-8"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  return children
}

// /login should be accessible only to guests
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname
  if (isAuthenticated) {
    return <Navigate to={from || "/dashboard"} replace />
  }
  return children
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <AuthGate>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        <Route path="/visitorform" element={<VisitorForm />} />
        <Route path="/appointment/:appointmentId" element={<PublicAppointmentDetails />} />

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="visitors" element={<Visitors />} />
          <Route path="visitor" element={<Visitors />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="reports" element={<Reports />} />
          <Route path="company" element={<Company />} />
          <Route path="plant" element={<Plant />} />
          <Route path="plant-type" element={<PlantType />} />
          <Route path="area" element={<Area />} />
          <Route path="department" element={<Department />} />
          <Route path="route" element={<RoutePage />} />
          <Route path="gate" element={<Gate />} />
          <Route path="shift" element={<Shift />} />
          <Route path="country" element={<Country />} />
          <Route path="state" element={<State />} />
          <Route path="city" element={<City />} />
          <Route path="role" element={<Role />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="role-wise-screen-mapping" element={<RoleWiseScreenMapping />} />
          <Route path="user-wise-screen-mapping" element={<UserWiseScreenMapping />} />
          <Route path="approval-configuration" element={<ApprovalConfiguration />} />
          <Route path="workflow" element={<WorkFlow />} />
          <Route path="appointment" element={<Appointment />} />
          <Route path="checkinout" element={<CheckInOut />} />
          <Route path="checkin-checkout-report" element={<CheckInCheckOutReport />} />
          <Route path="vehicle-invoice-report" element={<VehicleInvoiceReport />} />
          <Route path="feedback-report" element={<FeedbackReport />} />

          <Route
            path="users"
            element={
              <ProtectedRoute roles={["admin", "super_admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Unknown URL handling */}
        <Route
          path="*"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </AuthGate>
  )
}

export default App
