import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { incidentService, notificationService } from "../../services/api";
import io from 'socket.io-client';

export default function Overview() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, resolved: 0 });
    const [recentIncidents, setRecentIncidents] = useState([]);
    const [userName, setUserName] = useState("");
    const [greeting, setGreeting] = useState("Good Morning");
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        loadUserData();
        loadData();
        setGreetingByTime();
        setupSocketConnection();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const setupSocketConnection = () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            console.log("Setting up socket connection for user:", user._id);

            if (token && user._id) {
                socketRef.current = io('http://localhost:5000', {
                    auth: { token },
                    transports: ['websocket', 'polling']
                });

                socketRef.current.on('connect', () => {
                    console.log('✅ Overview socket connected');
                    socketRef.current.emit('join', user._id);
                });

                socketRef.current.on('new_notification', (notif) => {
                    console.log('🔔 New notification received in Overview:', notif);
                    setNotification(notif);
                    setShowNotification(true);

                    // Refresh data
                    loadData();

                    // Auto-hide after 5 seconds
                    setTimeout(() => {
                        setShowNotification(false);
                    }, 5000);
                });

                socketRef.current.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                });
            } else {
                console.log("No token or user ID found for socket connection");
            }
        } catch (error) {
            console.error("Failed to setup socket:", error);
        }
    };

    const loadUserData = () => {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                setUserName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || "Civilian User");
            } else {
                setUserName("Civilian User");
            }
        } catch (e) {
            console.error("Error parsing user data:", e);
            setUserName("Civilian User");
        }
    };

    const setGreetingByTime = () => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    };

    const loadData = async () => {
        try {
            const response = await incidentService.getAllIncidents();
            if (response && response.success) {
                const incidents = response.data || [];
                setRecentIncidents(incidents.slice(0, 5));
                setStats({
                    total: incidents.length,
                    active: incidents.filter(i => i.status === 'Active').length,
                    pending: incidents.filter(i => i.status === 'Pending').length,
                    resolved: incidents.filter(i => i.status === 'Resolved').length
                });
            }
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-600';
            case 'Active': return 'bg-red-100 text-red-600';
            case 'Pending': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Notification Popup */}
            {showNotification && notification && (
                <div className="fixed top-20 right-4 z-50 bg-blue-500 text-white rounded-lg shadow-lg p-4 animate-slide-in max-w-sm">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">📢</div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{notification.title || "Status Update"}</p>
                            <p className="text-xs opacity-90 mt-1">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => setShowNotification(false)}
                            className="text-white opacity-75 hover:opacity-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-[#DFF1FF] w-full px-6 py-2 -mt-[34px] mb-4 rounded-lg">
                <h1 className="text-[#474C53] text-4xl font-semibold mb-1">
                    {greeting}, {userName}
                </h1>
                <p className="text-[#5D7285] text-base font-normal">
                    File incident reports, track status updates, and connect directly with the Rescue Team.
                </p>
            </div>

            {/* Report Incident Card */}
            <div
                onClick={() => navigate("/report")}
                className="bg-gradient-to-r from-red-700 to-red-500 rounded-xl p-6 py-2 mb-6 flex items-center justify-between cursor-pointer hover:shadow-lg transition"
            >
                <div className="flex items-center gap-4">
                    <Icon icon="solar:siren-bold" width="64" className="text-white" />
                    <div>
                        <h2 className="text-[#FAFAFF] text-4xl font-semibold">Report an Incident</h2>
                        <p className="text-[#FAFAFF] text-base font-light">File a new emergency report with your location, photo evidence, and incident details. Responders are notified immediately.</p>
                    </div>
                </div>
                <Icon icon="mdi:chevron-right" width="32" className="text-white" />
            </div>

            {/* Quick Actions */}
            <h2 className="text-[#474C53] text-2xl font-semibold mb-3">Quick Actions</h2>

            <div
                onClick={() => navigate("/track-reports")}
                className="bg-white rounded-xl p-6 py-2 shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 mb-6"
            >
                <div className="flex items-center gap-4">
                    <Icon icon="mdi:magnify" width="64" className="text-[#DC2626]" />
                    <div>
                        <h3 className="text-[#262D31] text-[26px] font-semibold">Track Reports</h3>
                        <p className="text-[#5D7285] text-base font-normal">Check the real-time status of your filed reports</p>
                    </div>
                </div>
            </div>

            {/* Recent Reports */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-[#474C53] text-2xl font-semibold">Recent Reports</h2>
                <button
                    onClick={() => navigate("/track-reports")}
                    className="text-[#474C53] text-[22px] font-semibold hover:text-blue-600 flex items-center gap-1"
                >
                    View All <Icon icon="mdi:chevron-right" width="16" />
                </button>
            </div>

            <div className="space-y-3">
                {recentIncidents.length > 0 ? (
                    recentIncidents.map((incident) => (
                        <div
                            key={incident._id}
                            onClick={() => navigate(`/track-reports`)}
                            className="flex items-center gap-4 bg-[#F7F7F7] border border-gray-200 rounded-md px-5 py-4 hover:bg-gray-100 transition cursor-pointer"
                        >
                            <div className="w-[3px] self-stretch bg-red-500 rounded-full"></div>
                            <div className="flex-1 flex justify-between items-center">
                                <div>
                                    <h3 className="text-[#262D31] text-xl font-semibold mb-1">{incident.type || "Unknown Incident"}</h3>
                                    <div className="flex flex-col gap-1 text-[#5D7285] text-sm font-normal">
                                        <div className="flex items-center gap-1">
                                            <Icon icon="mdi:map-marker" width="14" />
                                            <span>{incident.location?.address || "Unknown location"}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Icon icon="mdi:calendar" width="14" />
                                            <span>{incident.reportedAt ? new Date(incident.reportedAt).toLocaleString() : "Unknown date"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[#8B8A8A] text-sm font-normal">{incident.incidentId || "N/A"}</span>
                                    <span className={`text-xs font-medium px-3 py-[2px] rounded-lg ${getStatusColor(incident.status)}`}>
                                        {incident.status || "Pending"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-[#F7F7F7] border border-gray-200 rounded-md p-8 text-center">
                        <p className="text-gray-500">No incidents found</p>
                        <button
                            onClick={() => navigate("/report")}
                            className="mt-3 text-blue-500 hover:text-blue-600"
                        >
                            Report an Incident →
                        </button>
                    </div>
                )}
            </div>

            {/* Add CSS animation */}
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}