import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import NotificationBell from "./NotificationBell";

// ✅ FIX: Correct path to the civilian incidentdetails.jsx
import IncidentDetails from "../../pages/civilian/incidentdetails";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Added Logout States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 1. Open the confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // 2. Cancel logout
  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // 3. Confirm logout with 2-second delay
  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);

    try {
      // Clear client-side data immediately
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');

      // Simulate a 2-second UX delay for a smooth transition
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedIncident(null);
  };

  // Show full-screen spinner when logging out
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-700 font-medium text-lg">Logging out...</p>
          <p className="text-gray-400 text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* ✅ LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/40">
          <div className="bg-white rounded-lg shadow-2xl w-[400px] max-w-[90vw] p-6 flex flex-col">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <Icon icon="material-symbols:logout" className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Logout</h3>
            <p className="text-gray-600 text-center text-sm mb-6">
              Are you sure you want to logout from your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <div className="h-16 bg-[#1f6b75] flex items-center justify-between px-6 text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/src/assets/logo.png" className="w-10 h-10" alt="logo" />
          <div>
            <h1 className="font-semibold">Rescue Team</h1>
            <p className="text-xs opacity-70">
              Municipality of Santa Rosa
            </p>
          </div>
        </div>
        <NotificationBell />
      </div>

      {/* BODY WITH SIDEBARS */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-[#F5F4FF] flex flex-col justify-between p-5 flex-shrink-0">
          <div>
            {/* PROFILE */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <Icon icon="iconamoon:profile-fill" className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Rescuer</p>
                <p className="text-sm font-medium text-gray-700">
                  Rescue member 01
                </p>
              </div>
            </div>

            {/* MENU */}
            <div className="space-y-2 text-gray-600 text-sm">
              <NavLink to="/dashboard" className={({ isActive }) => `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`}>
                <Icon icon="material-symbols-light:home-rounded" className="w-5 h-5" />
                Dashboard
              </NavLink>
              <NavLink to="/incidents" className={({ isActive }) => `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`}>
                <Icon icon="ic:baseline-emergency" className="w-5 h-5" />
                Incidents
              </NavLink>
              <NavLink
                to="/units"
                className={({ isActive }) =>
                  `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                }
              >
                <Icon icon="material-symbols:group" className="w-5 h-5" />
                Units
              </NavLink>
              <NavLink to="/volunteer-approval" className={({ isActive }) => `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`}>
                <Icon icon="material-symbols:groups" className="w-5 h-5" />
                Volunteers
              </NavLink>

              {/* ✅ Profile Link */}
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                }
              >
                <Icon icon="material-symbols:account-circle" className="w-5 h-5" />
                Profile
              </NavLink>
            </div>
          </div>

          {/* ✅ LOGOUT */}
          <div
            onClick={handleLogoutClick}
            className="text-gray-500 text-sm cursor-pointer hover:text-red-600 flex items-center gap-3"
          >
            <Icon icon="material-symbols:logout" className="w-5 h-5" />
            Logout
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-[#EEF2F6] overflow-y-auto">
          <div className="p-6">
            {/* Pass the incident click handler to children */}
            {typeof children === 'function' ? children(handleIncidentClick) : children}
          </div>
        </div>

        {/* ========================================================== */}
        {/* ✅ CHANGED: RIGHT SIDEBAR WITH AUTO-CLOSE OVERLAY */}
        {/* ========================================================== */}
        {isSidebarOpen && selectedIncident && (
          <>
            {/* 1. The Clickable Overlay (Closes when clicked) */}
            <div
              className="fixed inset-0 z-10 bg-black/20"
              onClick={handleCloseSidebar}
            ></div>

            {/* 2. The Sidebar Panel */}
            <div className="absolute top-0 right-0 h-full w-[450px] bg-white border-l border-gray-200 shadow-lg flex flex-col animate-slideIn z-20">
              <IncidentDetails
                data={selectedIncident}
                onClose={handleCloseSidebar}
                onDispatch={() => {
                  console.log('Dispatched');
                  handleCloseSidebar();
                }}
                onResolve={() => {
                  console.log('Resolved');
                  handleCloseSidebar();
                }}
                onViewReport={(incident) => console.log('View Report:', incident)}
              />
            </div>
          </>
        )}
        {/* ========================================================== */}

      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}