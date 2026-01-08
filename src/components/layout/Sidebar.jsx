"use client"

import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useState, useEffect, useRef } from "react"
import { BarChart3, Settings, Users, UsersRound, CreditCard, FileText } from "lucide-react"

const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth()
  const location = useLocation()
  const [expandedSection, setExpandedSection] = useState(null)
  const sidebarRef = useRef(null)

  // ---------- helpers ----------
  const hasAnyRole = (roles) => {
    if (!roles || roles.length === 0) return true
    if (typeof roles === "string") return hasRole ? hasRole(roles) : true
    return hasRole ? roles.some((r) => hasRole(r)) : true
  }

  // ---------- data ----------
  const masterItems = [
    { name: "Company", href: "/company", roles: ["admin", "super_admin"] },
    { name: "Plant", href: "/plant", roles: ["admin", "super_admin"] },
    { name: "Plant Type", href: "/plant-type", roles: ["admin", "super_admin"] },
    { name: "Area", href: "/area", roles: ["admin", "super_admin"] },
    {
      name: "Department",
      href: "/department",
      roles: ["admin", "super_admin"],
    },
    { name: "Route", href: "/route", roles: ["admin", "super_admin"] },
    { name: "Gate", href: "/gate", roles: ["admin", "super_admin"] },
    { name: "Shift", href: "/shift", roles: ["admin", "super_admin"] },
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
      icon: BarChart3,
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          roles: ["admin", "super_admin", "reception"],
        },
        { name: "Reports", href: "/reports", roles: ["admin", "super_admin"] },
      ],
      roles: ["admin", "super_admin", "reception"],
    },
    {
      id: "settings",
      name: "MASTER",
      icon: Settings,
      items: masterItems,
      roles: ["admin", "super_admin"],
    },
    {
      id: "visitors",
      name: "ADMIN",
      icon: Users,
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
      icon: UsersRound,
      items: [
        {
          name: "User",
          href: "/user-management",
          roles: ["admin", "super_admin"],
        },
        { name: "Role", href: "/role", roles: ["admin", "super_admin"] },
        {
          name: "Role Wise Screen Mapping",
          href: "/role-wise-screen-mapping",
          roles: ["admin", "super_admin"],
        },
        {
          name: "User Wise Screen Mapping",
          href: "/user-wise-screen-mapping",
          roles: ["admin", "super_admin"],
        },
      ],
      roles: ["admin", "super_admin"],
    },
    // {
    //   id: "connections",
    //   name: "APPROVAL",
    //   icon: LinkIcon,
    //   items: [
    //     {
    //       name: "Approval Configuration",
    //       href: "/approval-configuration",
    //       roles: ["admin", "super_admin"],
    //     },
    //     {
    //       name: "WorkFlow",
    //       href: "/workflow",
    //       roles: ["admin", "super_admin"],
    //     },
    //   ],
    //   roles: ["admin", "super_admin"],
    // },
    {
      id: "badges",
      name: "VISITOR MANAGEMENT",
      icon: CreditCard,
      items: [
        {
          name: "Visitor Management",
          href: "/visitors",
          roles: ["admin", "super_admin", "reception"],
        },
        {
          name: "Check In Check Out",
          href: "/checkinout",
          roles: ["admin", "super_admin", "reception"],
        },
        {
          name: "Appointments",
          href: "/appointment",
          roles: ["admin", "super_admin", "reception"],
        },
      ],
      roles: ["admin", "super_admin", "reception"],
    },
    {
      id: "documents",
      name: "REPORTS",
      icon: FileText,
      items: [
        {
          name: "Check In Check Out Report",
          href: "/checkin-checkout-report",
          roles: ["admin", "super_admin"],
        },
        {
          name: "Feedback Report",
          href: "/feedback-report",
          roles: ["admin", "super_admin"],
        },
        {
          name: "Vehicle Invoice Report",
          href: "/vehicle-invoice-report",
          roles: ["admin", "super_admin"],
        },
      ],
      roles: ["admin", "super_admin"],
    },
  ]

  // ---------- role-based filtering with safe fallback ----------
  const rolesReady = !!user && typeof hasRole === "function"
  const filteredSections = rolesReady ? sidebarSections.filter((section) => hasAnyRole(section.roles)) : sidebarSections
  const visibleSections = filteredSections.length ? filteredSections : sidebarSections

  // ---------- UI handlers ----------
  const handleSectionClick = (sectionId) => setExpandedSection((prev) => (prev === sectionId ? null : sectionId))

  // Validate expandedSection whenever visibility/roles change
  useEffect(() => {
    if (expandedSection && !visibleSections.some((s) => s.id === expandedSection)) {
      setExpandedSection(null)
      localStorage.removeItem("sidebar.expandedSection")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(visibleSections)])

  // Auto-open section for current route + restore from localStorage safely
  useEffect(() => {
    const stored = localStorage.getItem("sidebar.expandedSection")
    const current = visibleSections.find((sec) => (sec.items || []).some((it) => it.href === location.pathname))

    if (current && current.id !== expandedSection) {
      setExpandedSection(current.id)
      localStorage.setItem("sidebar.expandedSection", current.id)
    } else if (!expandedSection) {
      if (stored && visibleSections.some((s) => s.id === stored)) {
        setExpandedSection(stored)
      } else {
        localStorage.removeItem("sidebar.expandedSection")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, JSON.stringify(visibleSections)])

  // Persist expanded section
  useEffect(() => {
    if (expandedSection) localStorage.setItem("sidebar.expandedSection", expandedSection)
  }, [expandedSection])

  // Collapse when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setExpandedSection(null)
      }
    }
    if (expandedSection) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [expandedSection])

  // ---------- derived: items for current expanded section with fallback ----------
  const expanded = visibleSections.find((s) => s.id === expandedSection)
  const filteredItems = (expanded?.items || []).filter((item) => hasAnyRole(item.roles))
  const itemsToRender = filteredItems.length > 0 ? filteredItems : expanded?.items || []
  // ^ If roles are still loading / hasRole temporarily says false for all, we still show items.

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
                  <div className="w-4 h-0.5 bg-gray-900 rotate-45"></div>
                  <div className="w-4 h-0.5 bg-gray-900 -rotate-45 -mt-1"></div>
                  <div className="w-4 h-0.5 bg-gray-900 rotate-45 -mt-0.5"></div>
                </div>
              </div>
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-2">
                {visibleSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`group flex w-12 h-12 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        expandedSection === section.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                      title={section.name}
                      type="button"
                      aria-expanded={expandedSection === section.id}
                      aria-label={section.name}
                    >
                      <section.icon size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Submenu panel — render only if expandedSection is visible */}
        {expanded && (
          <div className="flex w-64 flex-col bg-white border-r border-gray-200">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 py-4">
              {/* Section header */}
              <div className="flex h-12 shrink-0 items-center">
                <h2 className="text-lg font-semibold text-gray-900">{expanded.name}</h2>
              </div>

              {/* Section items (with fallback) */}
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="-mx-2 space-y-1">
                  {itemsToRender.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                            isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
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

      {/* Mobile drawer */}
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="bg-white border-r border-gray-200 px-6 pb-4 h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="space-y-1">
                  <div className="w-4 h-0.5 bg-white rotate-45"></div>
                  <div className="w-4 h-0.5 bg-white -rotate-45 -mt-1"></div>
                  <div className="w-4 h-0.5 bg-white rotate-45 -mt-0.5"></div>
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

          {/* Navigation (scrollable) */}
          <nav className="flex-1 mt-5 overflow-y-auto min-h-0">
            <ul role="list" className="flex flex-col gap-y-7">
              {visibleSections.map((section) => (
                <li key={section.id}>
                  <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                    {section.name}
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {(section.items || [])
                      .filter((item) => {
                        // same fallback behaviour for mobile
                        const ok = hasAnyRole(item.roles)
                        return ok || true // always show; filter only hides after roles are truly ready
                      })
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
