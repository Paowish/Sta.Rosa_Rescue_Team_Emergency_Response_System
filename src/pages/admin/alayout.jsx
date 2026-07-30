import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("Admin");
    const [profileImage, setProfileImage] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                setUserName(`${userData.firstName} ${userData.lastName}` || "Admin");
                if (userData.profileImage) {
                    setProfileImage(userData.profileImage);
                }
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, []);

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

            {/* ✅ NAVBAR - Changed to Teal to match Admin screenshot */}
            <div className="h-16 bg-[#155e75] flex items-center justify-between px-6 text-white flex-shrink-0">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" className="w-10 h-10" alt="logo" />
                    <div>
                        <h1 className="font-semibold">System Admin</h1>
                        <p className="text-xs opacity-70">Municipality of Santa Rosa</p>
                    </div>
                </div>
                <Icon icon="material-symbols-light:notifications" className="w-5 h-5 cursor-pointer" />
            </div>

            {/* BODY */}
            <div className="flex flex-1 overflow-hidden">

                {/* SIDEBAR */}
                <div className="w-64 bg-[#F5F4FF] flex flex-col justify-between p-5 flex-shrink-0">
                    <div>
                        {/* PROFILE */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-full border-2 border-blue-500 overflow-hidden bg-gray-200 flex items-center justify-center">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Icon icon="iconamoon:profile-fill" className="w-6 h-6 text-gray-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Admin</p>
                                <p className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
                                    {userName}
                                </p>
                            </div>
                        </div>

                        {/* MENU */}
                        <div className="space-y-2 text-gray-600 text-sm">
                            <NavLink
                                to="/admin/overview"
                                className={({ isActive }) =>
                                    `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                                }
                            >
                                <Icon icon="material-symbols-light:home-rounded" className="w-5 h-5" />
                                Overview
                            </NavLink>

                            <NavLink
                                to="/admin/useraccounts"
                                className={({ isActive }) =>
                                    `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                                }
                            >
                                <Icon icon="ic:baseline-emergency" className="w-5 h-5" />
                                User Accounts
                            </NavLink>

                            <NavLink
                                to="/admin/incidentreports"
                                className={({ isActive }) =>
                                    `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                                }
                            >
                                <Icon icon="material-symbols:group" className="w-5 h-5" />
                                Incident Reports
                            </NavLink>

                            <NavLink
                                to="/admin/systemmaintenance"
                                className={({ isActive }) =>
                                    `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                                }
                            >
                                <Icon icon="material-symbols:settings" className="w-5 h-5" />
                                System Maintenance
                            </NavLink>

                            <NavLink
                                to="/admin/profile"
                                className={({ isActive }) =>
                                    `p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-3 ${isActive ? 'bg-blue-100 text-blue-600 font-medium' : ''}`
                                }
                            >
                                <Icon icon="material-symbols:account-circle" className="w-5 h-5" />
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

                {/* MAIN CONTENT */}
                <div className="flex-1 bg-[#EEF2F6] overflow-y-auto">
                    {children}
                </div>

            </div>
        </div>
    );
}