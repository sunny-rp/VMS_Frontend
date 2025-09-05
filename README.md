# Visitor Management System (VMS)

A comprehensive visitor management system built with React 18 + Vite, featuring cookie-based authentication, role management, and real-time visitor tracking.

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

## 🔐 Demo Credentials

- **Mobile:** 9756934671
- **Password:** password123
- **Role:** Super Admin

## 📋 Features

### ✅ Authentication System
- Cookie-based session management (no localStorage/sessionStorage)
- Role-based access control (Super Admin, Admin, Reception, Security)
- "Remember me" functionality with configurable cookie expiry
- Automatic token expiration handling

### ✅ Visitor Management
- Pre-appointment toggle and pass type selection
- Dual search functionality (visitor name and host)
- Real-time visitor status tracking
- Pass type management (One Day, Extended)
- Visitor check-in/check-out workflows

### ✅ Check-in/Check-out System
- QR code scanning simulation
- Manual check-in forms with validation
- Quick check-out for active visitors
- Real-time activity tracking

### ✅ Reports & Analytics
- Overview dashboard with key metrics
- Detailed visitor logs with search/filter
- Analytics with trends and distributions
- Export functionality (PDF/Excel simulation)
- Peak hours and company analytics

### ✅ User Management
- CRUD operations for system users
- Role assignment and management
- User status control (Active/Inactive)
- Permission-based UI access

### ✅ Dashboard & Layout
- Responsive sidebar navigation
- Real-time clock display
- User profile management
- Role-based menu filtering

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18 with Vite
- **Language:** JavaScript (.jsx files only)
- **Styling:** Tailwind CSS with custom components
- **Routing:** React Router v6 with protected routes
- **State:** React Context for authentication
- **Icons:** Lucide React

### Project Structure
\`\`\`
src/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.jsx
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   └── ProtectedRoute.jsx
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Visitors.jsx
│   ├── CheckIn.jsx
│   ├── Reports.jsx
│   ├── Users.jsx
│   ├── Profile.jsx
│   ├── LoginPage.jsx
│   └── NotFound.jsx
├── services/
│   └── api.js
├── App.jsx
├── main.jsx
└── index.css
\`\`\`

## 🔒 Security Implementation

### Cookie-Based Authentication
- **Development:** Uses non-HttpOnly cookies for demo purposes
- **Production Ready:** Designed for HttpOnly, Secure, SameSite=Strict cookies
- **CSRF Protection:** Architecture supports double-submit CSRF tokens
- **Token Expiration:** Automatic cleanup of expired sessions

### Role-Based Access Control
- **Super Admin:** Full system access
- **Admin:** User management and reports
- **Reception:** Visitor management and check-in/out
- **Security:** Basic visitor monitoring

## 📊 Mock Data & APIs

The application includes comprehensive mock APIs with realistic delays:

- **Users API:** CRUD operations with role management
- **Visitors API:** Check-in/out workflows with status tracking
- **Auth API:** Login with cookie session management

### Sample Data
- 5+ system users with different roles
- 12+ visitor records with various statuses
- Realistic company and contact information

## 🎨 Design System

### Color Palette
- **Primary:** Blue (#3B82F6) for main actions and branding
- **Success:** Green for active states and confirmations
- **Warning:** Orange for pending states
- **Error:** Red for inactive states and deletions
- **Neutral:** Gray scale for backgrounds and text

### Components
- Consistent button styles (primary, secondary)
- Form inputs with validation states
- Status badges with semantic colors
- Loading skeletons and empty states
- Modal dialogs with proper accessibility

## 🔄 State Management

### Authentication Flow
1. User enters credentials on login page
2. API validates and returns user data + token
3. AuthContext stores data in cookie with expiry
4. Protected routes check authentication status
5. Role-based components filter UI elements

### Data Flow
- Mock APIs simulate real backend delays
- Optimistic updates for better UX
- Error handling with user feedback
- Loading states for all async operations

## 📱 Responsive Design

- **Mobile First:** Optimized for mobile devices
- **Tablet:** Responsive grid layouts
- **Desktop:** Full sidebar navigation
- **Touch Friendly:** Appropriate button sizes
- **Accessibility:** Semantic HTML and ARIA labels

## 🚀 Production Deployment

### Environment Setup
1. Configure HttpOnly cookies on server
2. Set up CSRF protection
3. Enable HTTPS with Secure cookie flags
4. Configure SameSite=Strict for security

### Build Process
\`\`\`bash
npm run build
npm run preview  # Test production build locally
\`\`\`

## 📋 Route Map

| Route | Component | Roles Required | Description |
|-------|-----------|----------------|-------------|
| `/` | Redirect | - | Redirects to dashboard or login |
| `/login` | LoginPage | - | Authentication page |
| `/dashboard` | Dashboard | All | Main overview with statistics |
| `/visitors` | Visitors | All | Visitor management interface |
| `/checkin` | CheckIn | All | Check-in/out workflows |
| `/reports` | Reports | Admin+ | Analytics and reporting |
| `/users` | Users | Admin+ | User management system |
| `/profile` | Profile | All | User profile management |

## 🔧 Development Notes

### Cookie Implementation
- Uses `js-cookie` library for client-side cookie management
- Supports both session and persistent cookies
- Automatic expiry handling with cleanup
- Ready for server-side HttpOnly implementation

### Mock API Design
- Realistic network delays (300-1000ms)
- Proper error handling and validation
- Consistent response formats
- Easy to replace with real backend

### Code Quality
- ESLint configuration for consistency
- Component-based architecture
- Reusable utility classes
- Semantic HTML structure

## 📄 License

This project is built as a demonstration of visitor management system capabilities following the provided specifications and screenshot requirements.
