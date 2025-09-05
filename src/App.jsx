"use client"

import { Routes, Route, Navigate } from "react-router-dom"
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
import NotFound from "./pages/NotFound"
import Company from "./pages/Company"
import Plant from "./pages/Plant"
import Area from "./pages/Area"
import Department from "./pages/Department"
import RoutePage from "./pages/Route" // Added Route import
import Gate from "./pages/Gate" // Added Gate import
import Shift from "./pages/Shift" // Added Shift import
import Country from "./pages/Country" // Added Country import
import State from "./pages/State" // Added State import
import City from "./pages/City" // Added City import
import UserManagement from "./pages/UserManagement" // Added UserManagement import
import Role from "./pages/Role" // Added Role import
import RoleWiseScreenMapping from "./pages/RoleWiseScreenMapping" // Added RoleWiseScreenMapping import
import UserWiseScreenMapping from "./pages/UserWiseScreenMapping" // Added UserWiseScreenMapping import
import ApprovalConfiguration from "./pages/ApprovalConfiguration" // Added ApprovalConfiguration import
import WorkFlow from "./pages/WorkFlow" // Added WorkFlow import
import Appointment from "./pages/Appointment" // Added Appointment import
import CheckInOut from "./pages/CheckInOut" // Added CheckInOut import
import CheckInCheckOutReport from "./pages/CheckInCheckOutReport" // Added CheckInCheckOutReport import
import VehicleInvoiceReport from "./pages/VehicleInvoiceReport" // Added VehicleInvoiceReport import
import FeedbackReport from "./pages/FeedbackReport" // Added FeedbackReport import

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
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
        <Route path="checkin" element={<CheckIn />} />
        <Route path="reports" element={<Reports />} />
        <Route path="company" element={<Company />} />
        <Route path="plant" element={<Plant />} />
        <Route path="area" element={<Area />} />
        <Route path="department" element={<Department />} />
        <Route path="route" element={<RoutePage />} />
        <Route path="gate" element={<Gate />} />
        <Route path="shift" element={<Shift />} />
        <Route path="country" element={<Country />} />
        <Route path="state" element={<State />} />
        <Route path="city" element={<City />} />
        <Route path="role" element={<Role />} /> {/* Added Role route */}
        <Route path="user-management" element={<UserManagement />} /> {/* Added UserManagement route */}
        <Route path="role-wise-screen-mapping" element={<RoleWiseScreenMapping />} />{" "}
        {/* Added RoleWiseScreenMapping route */}
        <Route path="user-wise-screen-mapping" element={<UserWiseScreenMapping />} />{" "}
        {/* Added UserWiseScreenMapping route */}
        <Route path="approval-configuration" element={<ApprovalConfiguration />} />{" "}
        {/* Added ApprovalConfiguration route */}
        <Route path="workflow" element={<WorkFlow />} /> {/* Added WorkFlow route */}
        <Route path="appointment" element={<Appointment />} /> {/* Added Appointment route */}
        <Route path="checkinout" element={<CheckInOut />} /> {/* Added CheckInOut route */}
        <Route path="checkin-checkout-report" element={<CheckInCheckOutReport />} />{" "}
        {/* Added CheckInCheckOutReport route */}
        <Route path="vehicle-invoice-report" element={<VehicleInvoiceReport />} />{" "}
        {/* Added VehicleInvoiceReport route */}
        <Route path="feedback-report" element={<FeedbackReport />} /> {/* Added FeedbackReport route */}
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

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
