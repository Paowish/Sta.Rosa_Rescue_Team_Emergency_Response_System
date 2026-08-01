import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Auth Pages
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";

// RESCUE TEAM LAYOUT
import DashboardLayout from "./components/layout/dashboardlayout";

// NEW Admin / Rescue Team Pages
import AdminOverview from './pages/admin/adminoverview';
import UserAccount from './pages/admin/useraccount';
import IncidentReports from './pages/admin/incidentreport';
import SystemMaintenance from './pages/admin/systemmaintenance';
import Profile from './pages/admin/profile';
import Units from './pages/admin/Units';
import SystemSettings from './pages/admin/systemsettings';
import AdminLayout from "./pages/admin/AdminLayout.jsx";

// Legacy Admin Pages (Keep for backward compatibility)
import Dashboard from "./pages/admin/dashboard";
import IncidentManagement from "./pages/admin/incidentmanagement";

// ✅ FIXED: Separate Route for Volunteers
import VolunteerApproval from "./pages/admin/volunteerapproval";
import ApplicantDetails from "./pages/admin/applicantdetails";

// Civilian Pages
import CivilianDashboard from "./pages/civilian/civiliandashboard";
import Overview from "./pages/civilian/overview";
import TrackReports from "./pages/civilian/trackreports";
import EditProfile from "./pages/civilian/editprofile";

// ✅ NEW: Unified Incident Reporting Flow (Replaces 5 old files)
import ReportIncident from "./pages/civilian/reportIncident/ReportIncident";
import SubmitSuccess from "./pages/civilian/reportIncident/submit";

// Volunteer Pages
import VolunteerApplication from "./pages/volunteer/volunteerapplication";
import VolunteerDashboard from "./pages/volunteer/volunteerdashboard";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/volunteer-application" element={<VolunteerApplication />} />

          {/* ==================== ADMIN DASHBOARD REDIRECT ==================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'responder']}>
                <Navigate to="/admin/overview" replace />
              </ProtectedRoute>
            }
          />

          {/* ========================================================== */}
          {/* ✅ NEW ADMIN ROUTES (RENDERED DIRECTLY)                    */}
          {/* ========================================================== */}
          <Route
            path="/admin/overview"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'responder']}>
                <AdminOverview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/useraccounts"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserAccount />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/incidentreports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'responder']}>
                <IncidentReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/systemmaintenance"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemMaintenance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/systemsettings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>  {/* <-- ADD THIS LINE */}
                  <SystemSettings />
                </AdminLayout> {/* <-- ADD THIS LINE */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ========================================================== */}
          {/* ✅ RESCUE TEAM ROUTES (WRAPPED IN DASHBOARD LAYOUT)        */}
          {/* ========================================================== */}
          <Route
            path="/units"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'responder']}>
                <DashboardLayout>
                  <Units />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'responder']}>
                <DashboardLayout>
                  {(onIncidentClick) => <Dashboard onIncidentClick={onIncidentClick} />}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'responder']}>
                <DashboardLayout>
                  {(onIncidentClick) => <IncidentManagement onIncidentClick={onIncidentClick} />}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ FIXED: When you click "Volunteers", it goes here */}
          <Route
            path="/volunteer-approval"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'responder']}>
                <DashboardLayout>
                  <VolunteerApproval />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/applicant-details/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <ApplicantDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'responder']}>
                <DashboardLayout>
                  <EditProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== CIVILIAN ROUTES ==================== */}
          <Route
            path="/civilian-dashboard"
            element={
              <ProtectedRoute allowedRoles={['civilian']}>
                <CivilianDashboard>
                  <Overview />
                </CivilianDashboard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/overview"
            element={
              <ProtectedRoute allowedRoles={['civilian']}>
                <CivilianDashboard>
                  <Overview />
                </CivilianDashboard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/track-reports"
            element={
              <ProtectedRoute allowedRoles={['civilian']}>
                <CivilianDashboard>
                  <TrackReports />
                </CivilianDashboard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute allowedRoles={['civilian']}>
                <CivilianDashboard>
                  <EditProfile />
                </CivilianDashboard>
              </ProtectedRoute>
            }
          />

          {/* ==================== ✅ UNIFIED INCIDENT REPORTING FLOW ==================== */}
          <Route
            path="/report"
            element={
              <ProtectedRoute allowedRoles={['civilian']}>
                <CivilianDashboard>
                  <ReportIncident />
                </CivilianDashboard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/submit"
            element={
              <CivilianDashboard>
                <SubmitSuccess />
              </CivilianDashboard>
            }
          />

          {/* ==================== DEFAULT REDIRECT ==================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;