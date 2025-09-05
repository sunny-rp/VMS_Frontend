"use client"

import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useState, useEffect, useRef } from "react"
import { BarChart3, Settings, Users, UsersRound, Link, CreditCard, FileText } from "lucide-react"

const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth()
  const location = useLocation()
  const [expandedSection, setExpandedSection] = useState(null)
  const sidebarRef = useRef(null)

  const masterItems = [
    {
      name: "Company",
      href: "/company", // Updated Company link to point to the new Company page
      roles: ["admin", "super_admin"],
    },
    {
      name: "Plant",
      href: "/plant", // Updated Plant link to point to the new Plant page
      roles: ["admin", "super_admin"],
    },
    {
      name: "Area",
      href: "/area", // Updated Area link to point to the new Area page
      roles: ["admin", "super_admin"],
    },
    {
      name: "Department",
      href: "/department", // Updated Department link to point to the new Department page
      roles: ["admin", "super_admin"],
    },
    {
      name: "Route",
      href: "/route", // Updated Route link to point to the new Route page
      roles: ["admin", "super_admin"],
    },
    {
      name: "Gate",
      href: "/gate", // Updated Gate link to point to the new Gate page
      roles: ["admin", "super_admin"],
    },
    {
      name: "Shift",
      href: "/shift", // Updated Shift link to point to the new Shift page
      roles: ["admin", "super_admin"],
    },
    {
      name: "Terms & Conditions",
      href: "/master/terms",
      roles: ["admin", "super_admin"],
    },
  ]

  const sidebarSections = [
    {
      id: "analytics",
      name: "ANALYTICS",
      icon: BarChart3, // Bar chart icon (first icon in image)
      items: [
        { name: "Dashboard", href: "/dashboard", roles: ["admin", "super_admin", "reception"] },
        { name: "Reports", href: "/reports", roles: ["admin", "super_admin"] },
      ],
      roles: ["admin", "super_admin", "reception"],
    },
    {
      id: "settings",
      name: "MASTER", // Changed from "SETTINGS" to "MASTER" to match the image
      icon: Settings, // Tools/settings icon (second icon in image)
      items: masterItems,
      roles: ["admin", "super_admin"],
    },
    {
      id: "visitors",
      name: "ADMIN",
      icon: Users, // People icon (third icon in image)
      items: [
        { name: "Country", href: "/country", roles: ["admin", "super_admin"] },
        { name: "State", href: "/state", roles: ["admin", "super_admin"] },
        { name: "City", href: "/city", roles: ["admin", "super_admin"] },
      ],
      roles: ["admin", "super_admin"],
    },
    {
      id: "users",
      name: "USERS",
      icon: UsersRound, // Group/team icon (fourth icon in image)
      items: [
        { name: "User", href: "/user-management", roles: ["admin", "super_admin"] },
        { name: "Role", href: "/role", roles: ["admin", "super_admin"] },
        { name: "Role Wise Screen Mapping", href: "/role-wise-screen-mapping", roles: ["admin", "super_admin"] },
        { name: "User Wise Screen Mapping", href: "/user-wise-screen-mapping", roles: ["admin", "super_admin"] },
      ],
      roles: ["admin", "super_admin"],
    },
    {
      id: "connections",
      name: "APPROVAL", // Changed from "CONNECTIONS" to "APPROVAL" to match the image
      icon: Link, // Connection/link icon (fifth icon in image)
      items: [
        { name: "Approval Configuration", href: "/approval-configuration", roles: ["admin", "super_admin"] }, // Updated to match APPROVAL modules
        { name: "WorkFlow", href: "/workflow", roles: ["admin", "super_admin"] }, // Updated to match APPROVAL modules
      ],
      roles: ["admin", "super_admin"],
    },
    {
      id: "badges",
      name: "VISITOR MANAGEMENT", // Changed from "BADGES" to "VISITOR MANAGEMENT" to match the image
      icon: CreditCard, // ID card/badge icon (sixth icon in image)
      items: [
        {
          name: "Visitor Management",
          href: "/visitors", // Updated to point to the main visitors page
          roles: ["admin", "super_admin", "reception"],
        },
        {
          name: "Check In Check Out",
          href: "/checkinout", // Updated to point to the new CheckInOut page
          roles: ["admin", "super_admin", "reception"],
        },
        {
          name: "Appointments",
          href: "/appointment", // Updated to point to the new Appointment page
          roles: ["admin", "super_admin", "reception"],
        },
      ],
      roles: ["admin", "super_admin", "reception"],
    },
    {
      id: "documents",
      name: "REPORTS", // Changed from "DOCUMENTS" to "REPORTS" to match the image
      icon: FileText, // Document/file icon (seventh icon in image)
      items: [
        { name: "Check In Check Out Report", href: "/checkin-checkout-report", roles: ["admin", "super_admin"] },
        { name: "Feedback Report", href: "/feedback-report", roles: ["admin", "super_admin"] },
        { name: "Vehicle Invoice Report", href: "/vehicle-invoice-report", roles: ["admin", "super_admin"] },
      ],
      roles: ["admin", "super_admin"],
    },
  ]

  const filteredSections = sidebarSections.filter((section) => hasRole(section.roles))

  const handleSectionClick = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setExpandedSection(null)
      }
    }

    if (expandedSection) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [expandedSection])

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex" ref={sidebarRef}>
        <div className="flex w-16 flex-col bg-gray-900">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto px-2 py-4">
            {/* Logo */}
            <div className="flex h-12 shrink-0 items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="space-y-1">
                  <div className="w-4 h-0.5 bg-gray-900 transform rotate-45"></div>
                  <div className="w-4 h-0.5 bg-gray-900 transform -rotate-45 -mt-1"></div>
                  <div className="w-4 h-0.5 bg-gray-900 transform rotate-45 -mt-0.5"></div>
                </div>
              </div>
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-2">
                {filteredSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`group flex w-12 h-12 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        expandedSection === section.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                      title={section.name}
                    >
                      <section.icon size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {expandedSection && (
          <div className="flex w-64 flex-col bg-white border-r border-gray-200">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 py-4">
              {/* Section header */}
              <div className="flex h-12 shrink-0 items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredSections.find((s) => s.id === expandedSection)?.name}
                </h2>
              </div>

              {/* Section items */}
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredSections
                    .find((s) => s.id === expandedSection)
                    ?.items.filter((item) => hasRole(item.roles))
                    .map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <li key={item.name}>
                          <NavLink
                            to={item.href}
                            className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                              isActive
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                          >
                            {item.name}
                          </NavLink>
                        </li>
                      )
                    })}
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      <div className={`lg:hidden fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 px-6 pb-4">
          {/* Header with close button */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="space-y-1">
                  <div className="w-4 h-0.5 bg-white transform rotate-45"></div>
                  <div className="w-4 h-0.5 bg-white transform -rotate-45 -mt-1"></div>
                  <div className="w-4 h-0.5 bg-white transform rotate-45 -mt-0.5"></div>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">VMS</span>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col mt-5">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              {filteredSections.map((section) => (
                <li key={section.id}>
                  <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                    {section.name}
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {section.items
                      .filter((item) => hasRole(item.roles))
                      .map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                          <li key={item.name}>
                            <NavLink
                              to={item.href}
                              onClick={onClose}
                              className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                                isActive
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                              }`}
                            >
                              <section.icon size={20} />
                              {item.name}
                            </NavLink>
                          </li>
                        )
                      })}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar
