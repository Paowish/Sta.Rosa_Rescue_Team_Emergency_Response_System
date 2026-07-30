import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import NotificationBell from "../../components/layout/NotificationBell";

export default function CivilianDashboard({ children }) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const loadUserData = () => {
    const user = localStorage.getItem('user');
    console.log("Loading user data from localStorage:", user);

    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(`${userData.firstName} ${userData.lastName}`);

        if (userData.profileImage && userData.profileImage !== "") {
          if (userData.profileImage.startsWith('http')) {
            setProfileImage(userData.profileImage);
          } else {
            setProfileImage(`http://localhost:5000/${userData.profileImage}`);
          }
        } else {
          setProfileImage("");
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
        setUserName("Juan Dela Cruz");
        setProfileImage("");
      }
    }
  };

  useEffect(() => {
    loadUserData();

    const handleStorageChange = () => {
      loadUserData();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Trigger the modal when clicking logout
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Perform the actual logout with a 2-second UX delay
  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);

    try {
      // 1. Clear client-side data immediately
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('profileImage');

      // 2. Simulate a 2-second network delay for UX consistency
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Redirect to login
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Show full-screen spinner when logging out
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
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

      {/* LOGOUT CONFIRMATION MODAL */}
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
      <div className="h-16 bg-[#1f6b75] flex items-center justify-between px-4 text-white">

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="block md:hidden text-2xl"
          >
            ☰
          </button>

          <img src="/logo.png" className="w-10 h-10" alt="logo" />

          <div className="hidden sm:block">
            {/* ✅ CHANGED: Capitalized "Civilian" */}
            <h1 className="font-semibold">Civilian</h1>
            <p className="text-xs opacity-70">
              Municipality of Santa Rosa
            </p>
          </div>
        </div>

        <NotificationBell />
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden relative">

        {open && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <div
          className={`
            fixed md:static z-50 top-0 left-0 h-full w-64 bg-[#F5F4FF] p-5 flex flex-col justify-between
            transform transition-transform duration-300
            ${open ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
        >
          <div>

            <div className="flex justify-between items-center mb-6 md:hidden">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* PROFILE */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500 overflow-hidden bg-gray-200 flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Image failed to load:", profileImage);
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg class="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                      parent.appendChild(icon);
                    }}
                  />
                ) : (
                  <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>

              <div>
                {/* ✅ CHANGED: Capitalized "Civilian" */}
                <p className="text-xs text-gray-500">
                  {localStorage.getItem('userRole') === 'civilian' ? 'Civilian' : 'Civilian'}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {userName || "Civilian User"}
                </p>
              </div>
            </div>

            {/* MENU */}
            <div className="space-y-2 text-gray-600 text-sm">
              <NavLink
                to="/overview"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                }
              >
                <Icon icon="material-symbols-light:home-rounded" className="w-5 h-5" />
                Overview
              </NavLink>

              <NavLink
                to="/report"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                }
              >
                <Icon icon="mdi:report" className="w-5 h-5" />
                Report Incident
              </NavLink>

              <NavLink
                to="/track-reports"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                }
              >
                <Icon icon="material-symbols:track-changes" className="w-5 h-5" />
                Track Reports
              </NavLink>

              <NavLink
                to="/edit-profile"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                }
              >
                <Icon icon="material-symbols:settings" className="w-5 h-5" />
                Profile
              </NavLink>
            </div>
          </div>

          {/* LOGOUT */}
          <div
            onClick={handleLogoutClick}
            className="text-gray-500 text-sm cursor-pointer hover:text-red-600 flex items-center gap-3"
          >
            <Icon icon="material-symbols:logout" className="w-5 h-5" />
            Logout
          </div>
        </div>

        <div className="flex-1 bg-[#EEF2F6] overflow-y-auto p-4 md:p-6 z-0">
          {children}
        </div>

      </div>
    </div>
  );
}