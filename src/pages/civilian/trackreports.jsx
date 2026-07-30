import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { incidentService } from "../../services/api";
import { Icon } from "@iconify/react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom orange marker to match your screenshot
const orangeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- Component to re-center map ---
function MapCenter({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, 15);
        }
    }, [position, map]);
    return null;
}

// --- Progress Stepper Component ---
const ProgressStepper = ({ currentStatus }) => {
    const statusMap = {
        'Pending': 0,
        'Active': 1,
        'Dispatched': 2,
        'On Scene': 3,
        'Resolved': 4
    };
    const stepIndex = statusMap[currentStatus] || 0;

    const steps = [
        { label: 'Reported', icon: 'mdi:check', activeColor: 'bg-green-600', inactiveColor: 'bg-green-200' },
        { label: 'Verified', icon: 'mdi:check', activeColor: 'bg-green-600', inactiveColor: 'bg-green-200' },
        { label: 'Dispatched', icon: 'mdi:ambulance', activeColor: 'bg-blue-500', inactiveColor: 'bg-gray-300' },
        { label: 'On Scene', icon: 'mdi:counter', activeColor: 'bg-gray-400', inactiveColor: 'bg-gray-300' },
        { label: 'Resolved', icon: 'mdi:counter', activeColor: 'bg-gray-400', inactiveColor: 'bg-gray-300' }
    ];

    return (
        <div className="flex justify-between items-center w-full px-2 sm:px-4 py-4 sm:py-6 relative overflow-x-auto">
            {/* Connector Line (hidden on very small screens to avoid breaking) */}
            <div className="hidden sm:block absolute top-[30px] sm:top-[33px] left-6 sm:left-10 right-6 sm:right-10 h-[2px] bg-gray-200 -z-10"></div>

            {steps.map((step, index) => {
                const isActive = index <= stepIndex;
                const isCurrent = index === stepIndex;
                return (
                    <div key={index} className="flex flex-col items-center gap-1 sm:gap-2 relative z-10 bg-white px-1 sm:px-2 shrink-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-base sm:text-xl shadow-sm transition-colors ${isActive ? step.activeColor : step.inactiveColor} ${isCurrent ? 'ring-2 ring-offset-2 ring-blue-300' : ''}`}>
                            {step.icon === 'mdi:counter' ? (
                                <span className="text-sm sm:text-lg font-bold">{index + 1}</span>
                            ) : (
                                <Icon icon={step.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-medium ${isCurrent ? 'text-blue-600' : isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default function TrackReports() {
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedId, setExpandedId] = useState(null); // Track which card is expanded

    useEffect(() => {
        loadIncidents();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredIncidents(incidents);
        } else {
            const searchLower = searchTerm.toLowerCase();
            const filtered = incidents.filter(incident =>
                incident.incidentId?.toLowerCase().includes(searchLower) ||
                incident.type?.toLowerCase().includes(searchLower) ||
                incident.location?.address?.toLowerCase().includes(searchLower) ||
                incident.reporterName?.toLowerCase().includes(searchLower) ||
                incident.reporterNumber?.includes(searchTerm)
            );
            setFilteredIncidents(filtered);
        }
    }, [searchTerm, incidents]);

    const loadIncidents = async () => {
        try {
            const response = await incidentService.getAllIncidents();
            if (response.success) {
                setIncidents(response.data);
                setFilteredIncidents(response.data);
            }
        } catch (error) {
            console.error("Failed to load incidents:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'text-green-600 bg-green-50 border-green-200';
            case 'Active': return 'text-red-600 bg-red-50 border-red-200';
            case 'On Scene': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "Date not available";
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const toggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading reports...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/80 p-4 sm:p-6 font-sans">
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <Icon icon="material-symbols:group-outline" width="28" className="text-[#1f4e6f] sm:w-8 sm:h-8" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#1f4e6f] tracking-tight">Track Incident Report</h1>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Enter your reference number to check the real-time status of your report.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Icon icon="material-symbols:search" width="20" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Incident Name, ID, Reference Number."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 text-sm shadow-sm"
                        />
                    </div>
                </div>

                {/* Incident List */}
                <div className="space-y-4 sm:space-y-5">
                    {filteredIncidents.length === 0 ? (
                        <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-100 text-center">
                            <Icon icon="material-symbols:report-off" width="48" className="mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500 text-sm sm:text-base">
                                {searchTerm ? "No matching reports found." : "No reports found. File a report to get started."}
                            </p>
                            {!searchTerm && (
                                <button onClick={() => navigate("/report")} className="mt-4 bg-[#0C7FDA] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">Report Incident</button>
                            )}
                        </div>
                    ) : (
                        filteredIncidents.map((incident) => {
                            const isExpanded = expandedId === incident._id;
                            return (
                                <div key={incident._id} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                                    {/* --- CLICKABLE CARD HEADER --- */}
                                    <div
                                        onClick={() => toggleExpand(incident._id)}
                                        className="p-4 sm:p-6 relative cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                                        <div className="pl-2">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 mb-3">
                                                <h3 className="font-bold text-lg sm:text-xl text-[#1f4e6f]">{incident.type}</h3>
                                                <p className="text-xs sm:text-sm text-gray-400 font-medium">{incident.incidentId}</p>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Icon icon="mdi:map-marker-outline" width="16" className="text-gray-500 flex-shrink-0" />
                                                <p className="text-xs sm:text-sm text-gray-600 break-words">{incident.location?.address || "Location not specified"}</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="mdi:calendar-clock" width="16" className="text-gray-500 flex-shrink-0" />
                                                    <p className="text-xs sm:text-sm text-gray-500">{formatDateTime(incident.reportedAt)}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border self-start sm:self-auto ${getStatusColor(incident.status)}`}>
                                                    {incident.status || "On Scene"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- EXPANDED DETAILS SECTION --- */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-200 bg-gray-50/30 animate-in fade-in slide-in-from-top-2 duration-200">

                                            {/* 1. Progress Stepper */}
                                            <div className="px-4 sm:px-6 pt-4 pb-2">
                                                <p className="text-xs sm:text-sm text-gray-500 mb-2">Response Progress</p>
                                                <ProgressStepper currentStatus={incident.status} />
                                            </div>

                                            {/* 2. Grid Info */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-gray-200 bg-white">
                                                <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-200">
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Type of Incident</p>
                                                    <p className="text-sm sm:text-base font-semibold text-gray-800">{incident.type}</p>
                                                </div>
                                                <div className="p-4 border-b sm:border-b-0 border-gray-200">
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Reported by</p>
                                                    <p className="text-sm sm:text-base font-semibold text-gray-800">{incident.reporterName || "Anonymous"}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-gray-200 bg-white">
                                                <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-200">
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Victims / Casualties</p>
                                                    <p className="text-sm sm:text-base font-semibold text-gray-800">{incident.victimCount || "0"} People</p>
                                                </div>
                                                <div className="p-4 border-b sm:border-b-0 border-gray-200">
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Description</p>
                                                    <p className="text-sm sm:text-base text-gray-700">{incident.description || "No description provided."}</p>
                                                </div>
                                            </div>

                                            {/* 3. Leaflet Map (Functional) */}
                                            <div className="h-40 sm:h-48 bg-gray-200 border-t border-gray-200 relative w-full z-0">
                                                <MapContainer
                                                    center={[
                                                        incident.location?.coordinates?.lat || 15.3613,
                                                        incident.location?.coordinates?.lng || 120.9365
                                                    ]}
                                                    zoom={15}
                                                    style={{ height: "100%", width: "100%" }}
                                                >
                                                    <TileLayer
                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    />
                                                    <MapCenter position={[
                                                        incident.location?.coordinates?.lat || 15.3613,
                                                        incident.location?.coordinates?.lng || 120.9365
                                                    ]} />
                                                    <Marker
                                                        position={[
                                                            incident.location?.coordinates?.lat || 15.3613,
                                                            incident.location?.coordinates?.lng || 120.9365
                                                        ]}
                                                        icon={orangeIcon}
                                                    >
                                                        <Popup>
                                                            <strong>{incident.type}</strong><br />
                                                            {incident.location?.address}
                                                        </Popup>
                                                    </Marker>
                                                </MapContainer>

                                                {/* Static UI Overlay - Adjusted for mobile */}
                                                <div className="absolute top-2 left-2 bg-white rounded shadow text-[10px] sm:text-xs overflow-hidden flex flex-col text-gray-600 border border-gray-200 z-[400]">
                                                    <button className="px-2 sm:px-3 py-1 border-b border-gray-200 hover:bg-gray-50 font-medium">Map</button>
                                                    <button className="px-2 sm:px-3 py-1 hover:bg-gray-50 font-medium">Satellite</button>
                                                </div>
                                                <div className="absolute bottom-2 right-2 bg-white rounded shadow flex flex-col border border-gray-200 z-[400]">
                                                    <button className="p-1 border-b border-gray-200 hover:bg-gray-50"><Icon icon="mdi:plus" className="w-4 h-4" /></button>
                                                    <button className="p-1 hover:bg-gray-50"><Icon icon="mdi:minus" className="w-4 h-4" /></button>
                                                </div>
                                            </div>

                                            {/* 4. Team & Timeline Info */}
                                            <div className="border-t border-gray-200 bg-white">
                                                {/* Team Info */}
                                                <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 border border-gray-200 flex-shrink-0"></div>
                                                    <div>
                                                        <p className="text-sm sm:text-base font-bold text-gray-800">{incident.assignedTo?.[0]?.responder?.firstName || "Team Alpha"}</p>
                                                        <p className="text-[10px] sm:text-xs text-gray-500">Responder Unit</p>
                                                    </div>
                                                </div>

                                                {/* Activity Timeline */}
                                                <div className="p-4">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Activity Timeline</p>
                                                    <div className="space-y-4 relative pl-4 border-l-2 border-gray-200 ml-2">
                                                        <div className="relative">
                                                            <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-red-300 border-2 border-white"></div>
                                                            <p className="text-xs sm:text-sm text-gray-700">Incident reported by {incident.reporterName || "Juan Dela Cruz"} via mobile app.</p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">09:14</p>
                                                        </div>
                                                        <div className="relative">
                                                            <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-orange-300 border-2 border-white"></div>
                                                            <p className="text-xs sm:text-sm text-gray-700">Report received and accepted by Rescue Team</p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">09:16</p>
                                                        </div>
                                                        <div className="relative">
                                                            <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-blue-300 border-2 border-white"></div>
                                                            <p className="text-xs sm:text-sm text-gray-700">Responder en route - ETA 4 min</p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">09:17</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}