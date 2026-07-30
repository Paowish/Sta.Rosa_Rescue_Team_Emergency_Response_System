// src/components/IncidentDetails.jsx
import { Icon } from "@iconify/react";
import { useState, useEffect, useMemo } from "react";

export default function IncidentDetails({ data, onClose, onDispatch, onResolve, onViewReport }) {
    const [imageError, setImageError] = useState(false);
    const [volunteers, setVolunteers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [dispatchNotes, setDispatchNotes] = useState("");
    const [isDispatching, setIsDispatching] = useState(false);

    // NEW: Modal State
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [loadingVolunteers, setLoadingVolunteers] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState('volunteers'); // 'rescue' or 'volunteers'

    // Handle case when data is null or undefined
    if (!data) {
        return (
            <div className="h-full flex flex-col bg-white">
                <div className="sticky top-0 bg-white z-10 p-4 border-b relative">
                    <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 text-xl hover:text-gray-600">
                        ✕
                    </button>
                    <h2 className="font-semibold text-[#262D31]">Incident Details</h2>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">No incident selected</p>
                </div>
            </div>
        );
    }

    // Load available volunteers when component mounts
    useEffect(() => {
        loadAvailableVolunteers();
    }, []);

    const loadAvailableVolunteers = async () => {
        setLoadingVolunteers(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/volunteers/available', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setVolunteers(result.data);
            }
        } catch (error) {
            console.error('Failed to load volunteers:', error);
        } finally {
            setLoadingVolunteers(false);
        }
    };

    // Get incident ID with priority
    const getIncidentId = () => {
        if (data.incidentId && data.incidentId !== "N/A" && data.incidentId !== "" && data.incidentId !== null) {
            return data.incidentId;
        }
        if (data.id && data.id !== "N/A" && data.id !== "") return data.id;
        if (data._id && data._id !== "N/A" && data._id !== "") return data._id;
        return "N/A";
    };

    const getValue = (value, defaultValue = "N/A") => {
        return value && value !== "" && value !== null ? value : defaultValue;
    };

    const reporterName = getValue(
        data.reporterName ||
        data.reporter?.name ||
        data.reporter ||
        "Anonymous"
    );

    const reporterContact = getValue(
        data.reporterContact ||
        data.reporterNumber ||
        data.reporter?.contact ||
        data.contact ||
        "N/A"
    );

    const imageUrl = data.image || data.photo || data.images?.[0]?.url || null;
    const hasImage = imageUrl && imageUrl !== "" && imageUrl !== null;
    const defaultImage = "https://www.kraftlaw.com/wp-content/uploads/2021/10/common-injuries-car-accidents.jpg";
    const imageSrc = (!imageError && hasImage) ? imageUrl : defaultImage;

    const getCoordinates = () => {
        if (data.coordinates && data.coordinates !== "Coordinates not available") {
            return data.coordinates;
        }
        if (data.location?.coordinates) {
            const lat = data.location.coordinates.latitude || data.location.coordinates.lat;
            const lng = data.location.coordinates.longitude || data.location.coordinates.lng;
            if (lat && lng) return `${lat}, ${lng}`;
        }
        return "Coordinates not available";
    };

    const getAddress = () => {
        if (data.address) return data.address;
        if (data.location?.address) return data.location.address;
        return "Unknown address";
    };

    const getTitle = () => {
        return data.title || data.type || "Untitled Incident";
    };

    const getStatusInfo = () => {
        const status = data.status || "Pending";
        let display = status;
        let color = "";

        if (status === "Critical" || status === "Active") {
            display = "Critical";
            color = "bg-red-100 text-red-600";
        } else if (status === "Dispatched") {
            display = "Dispatched";
            color = "bg-purple-100 text-purple-600";
        } else if (status === "Pending") {
            display = "Pending";
            color = "bg-blue-100 text-blue-600";
        } else if (status === "Solved" || status === "Resolved") {
            display = "Solved";
            color = "bg-green-100 text-green-600";
        } else if (status === "On Scene") {
            display = "On Scene";
            color = "bg-yellow-100 text-yellow-600";
        } else {
            color = "bg-orange-100 text-orange-600";
        }

        return { display, color };
    };

    const { display: statusDisplay, color: statusColor } = getStatusInfo();

    const getTimeline = () => {
        if (data.timeline && data.timeline.length > 0) return data.timeline;
        if (data.reportedAt) {
            return [`Reported: ${new Date(data.reportedAt).toLocaleString()}`];
        }
        if (data.createdAt) {
            return [`Created: ${new Date(data.createdAt).toLocaleString()}`];
        }
        return [];
    };

    const timeline = getTimeline();

    // --- NEW: HANDLERS FOR THE NEW MODAL ---
    const handleVolunteerToggle = (volunteerId) => {
        setSelectedIds(prev =>
            prev.includes(volunteerId)
                ? prev.filter(id => id !== volunteerId)
                : [...prev, volunteerId]
        );
    };

    const handleRemoveSelected = (volunteerId) => {
        setSelectedIds(prev => prev.filter(id => id !== volunteerId));
    };

    const handleDispatch = async () => {
        if (selectedIds.length === 0) {
            alert('Please select at least one volunteer to dispatch');
            return;
        }

        setIsDispatching(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/incidents/${data._id || data.id}/dispatch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    volunteerIds: selectedIds,
                    dispatchNotes: dispatchNotes || `Dispatch for ${getTitle()} at ${getAddress()}`
                })
            });

            const result = await response.json();
            if (result.success) {
                alert(`✅ Incident dispatched to ${result.data.volunteersDispatched} volunteer(s)!`);
                setShowDispatchModal(false);
                setSelectedIds([]);
                setDispatchNotes("");
                if (onDispatch) onDispatch(result.data);
            } else {
                alert('Failed to dispatch: ' + result.message);
            }
        } catch (error) {
            console.error('Dispatch error:', error);
            alert('Error dispatching incident. Please try again.');
        } finally {
            setIsDispatching(false);
        }
    };

    // --- NEW: FILTERING LOGIC ---
    const filteredVolunteers = useMemo(() => {
        let filtered = volunteers;
        if (searchTerm) {
            filtered = filtered.filter(v =>
                `${v.firstName} ${v.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [volunteers, searchTerm]);

    // --- NEW: SELECTED DATA ---
    const selectedVolunteersData = volunteers.filter(v => selectedIds.includes(v._id));

    // --- RESOLVE HANDLER ---
    const handleResolve = async () => {
        if (window.confirm(`Are you sure you want to mark this incident as Resolved?`)) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/incidents/${data._id || data.id}/resolve`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ resolutionNotes: 'Incident resolved by responder.' })
                });
                const result = await response.json();
                if (result.success) {
                    alert('✅ Incident marked as resolved!');
                    if (onResolve) onResolve(result.data);
                } else {
                    alert('Failed to resolve: ' + result.message);
                }
            } catch (error) {
                console.error('Resolve error:', error);
                alert('Error resolving incident. Please try again.');
            }
        }
    };

    // --- VIEW REPORT HANDLER ---
    const handleViewReport = () => {
        if (onViewReport) {
            onViewReport(data);
        } else {
            // Fallback if parent doesn't provide a handler
            console.log("View report for incident:", data);
            alert("View Report clicked");
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">

            {/* HEADER - STICKY */}
            <div className="sticky top-0 bg-white z-10 p-4 border-b relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 text-xl hover:text-gray-600"
                >
                    ✕
                </button>
                <h2 className="font-semibold text-[#262D31]">
                    Incident Details
                </h2>
            </div>

            {/* CONTENT - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto">

                {/* TITLE SECTION */}
                <div className="px-4 py-3 border-b bg-[#F5F4FF]">
                    <div className="flex items-center flex-wrap gap-2">
                        <h1 className="text-xl font-bold text-[#262D31]">
                            {getTitle()}
                        </h1>
                        <span className={`text-xs px-2 py-1 rounded ${statusColor}`}>
                            {statusDisplay}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">ID: {getIncidentId()}</p>
                </div>

                {/* LOCATION SECTION */}
                <div className="border-t border-[#DFDFF0]">
                    <div className="bg-[#EBEDFA] px-3 py-2 font-medium text-[#656363] text-sm">
                        Location
                    </div>
                    <div className="px-3 py-3 space-y-2">
                        <div className="flex items-start gap-2">
                            <Icon icon="ic:outline-location-on" width="16" className="text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm flex-1">{getAddress()}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Icon icon="material-symbols:my-location-outline" width="14" className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-400 text-xs flex-1">{getCoordinates()}</span>
                        </div>
                    </div>
                </div>

                {/* REPORTER SECTION */}
                <div className="border-t border-[#DFDFF0]">
                    <div className="bg-[#EBEDFA] px-3 py-2 font-medium text-[#656363] text-sm">
                        Reporter
                    </div>
                    <div className="divide-y divide-[#DFDFF0]">
                        <div className="flex px-3 py-2">
                            <span className="text-gray-500 text-sm w-20 flex-shrink-0">Name</span>
                            <span className="font-semibold text-[#262D31] text-sm flex-1">{reporterName}</span>
                        </div>
                        <div className="flex px-3 py-2">
                            <span className="text-gray-500 text-sm w-20 flex-shrink-0">Contact</span>
                            <span className="font-semibold text-[#262D31] text-sm flex-1">{reporterContact}</span>
                        </div>
                    </div>
                </div>

                {/* DESCRIPTION SECTION */}
                <div className="border-t border-[#DFDFF0]">
                    <div className="bg-[#EBEDFA] px-3 py-2 font-medium text-[#656363] text-sm">
                        Description
                    </div>
                    <p className="p-3 text-gray-600 text-sm leading-relaxed">
                        {data.description || "No description provided"}
                    </p>

                    {/* INCIDENT IMAGE */}
                    <div className="px-3 pb-3">
                        {hasImage ? (
                            <img
                                src={imageSrc}
                                alt="Incident scene"
                                className="rounded w-full h-40 object-cover border border-[#DFDFF0]"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="rounded w-full h-40 bg-gray-100 border border-[#DFDFF0] flex flex-col items-center justify-center">
                                <Icon icon="mdi:image-off" width="32" className="text-gray-400" />
                                <p className="text-xs text-gray-400 mt-2">No photo available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* TIMELINE SECTION */}
                {timeline.length > 0 && (
                    <div className="border-t border-[#DFDFF0]">
                        <div className="bg-[#EBEDFA] px-3 py-2 font-medium text-[#656363] text-sm">
                            Activity Timeline
                        </div>
                        <div className="p-3">
                            <div className="flex gap-2 flex-wrap">
                                {timeline.map((item, i) => (
                                    <span key={i} className="text-xs bg-[#F5F4FF] px-2 py-1 rounded border border-[#DFDFF0]">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* ============================================================ */}
            {/* ✅ ACTIONS - STICKY BOTTOM (ALL 5 BUTTONS PRESERVED) */}
            {/* ============================================================ */}
            <div className="sticky bottom-0 bg-white z-10 p-3 border-t space-y-2">

                {/* Button 1: Dispatch */}
                <button
                    onClick={() => setShowDispatchModal(true)}
                    className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <Icon icon="material-symbols:send" className="w-5 h-5" />
                    Dispatch
                </button>

                {/* Button 2 & 3: Refer to Police & Fire Dept (KEPT ORIGINAL) */}
                <div className="flex gap-2">
                    <button className="flex-1 border border-gray-300 py-2 rounded text-sm flex items-center justify-center gap-1 hover:bg-gray-50 transition">
                        <Icon icon="material-symbols:shield" width="16" />
                        Refer to Police
                    </button>
                    <button className="flex-1 border border-gray-300 py-2 rounded text-sm flex items-center justify-center gap-1 hover:bg-gray-50 transition">
                        <Icon icon="material-symbols:local-fire-department" width="16" />
                        Refer to Fire Dept
                    </button>
                </div>

                {/* Button 4 & 5: Resolve and View Report (NEW) */}
                <div className="flex gap-2">
                    <button
                        onClick={handleResolve}
                        className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 transition flex items-center justify-center gap-1"
                    >
                        <Icon icon="material-symbols:check-circle" width="16" />
                        Resolve
                    </button>
                    <button
                        onClick={handleViewReport}
                        className="flex-1 bg-gray-600 text-white py-2 rounded text-sm hover:bg-gray-700 transition flex items-center justify-center gap-1"
                    >
                        <Icon icon="material-symbols:description" width="16" />
                        View Report
                    </button>
                </div>
            </div>
            {/* ============================================================ */}

            {/* ============================================================ */}
            {/* ✅ BEAUTIFUL DISPATCH MODAL (MATCHING YOUR DESIGN) */}
            {/* ============================================================ */}
            {showDispatchModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">

                        {/* --- Modal Header --- */}
                        <div className="bg-[#9fb2c2] p-5 flex justify-between items-start relative">
                            <div className="text-white">
                                <p className="text-xs font-medium opacity-90">Dispatch to</p>
                                <h2 className="text-2xl font-bold tracking-tight leading-tight truncate max-w-[250px]">
                                    {getTitle()}
                                </h2>
                                <p className="text-[10px] font-medium opacity-80 mt-0.5">{getIncidentId()}</p>
                            </div>
                            <button
                                onClick={() => setShowDispatchModal(false)}
                                className="text-white hover:opacity-75 transition-opacity"
                            >
                                <Icon icon="material-symbols:close" width="28" />
                            </button>
                        </div>

                        {/* --- Tabs --- */}
                        <div className="flex border-b border-gray-200 bg-white">
                            <button
                                onClick={() => setActiveTab('rescue')}
                                className={`flex-1 py-4 text-center font-bold text-lg transition-colors relative ${activeTab === 'rescue' ? 'text-black' : 'text-gray-500'
                                    }`}
                            >
                                Rescue Team
                                {activeTab === 'rescue' && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2d7aff]"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('volunteers')}
                                className={`flex-1 py-4 text-center font-bold text-lg transition-colors relative ${activeTab === 'volunteers' ? 'text-black' : 'text-gray-500'
                                    }`}
                            >
                                Volunteers
                                {activeTab === 'volunteers' && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2d7aff]"></div>
                                )}
                            </button>
                        </div>

                        {/* --- Filters --- */}
                        <div className="p-4 pt-5 pb-3 bg-white">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Search name, status, role..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- Note Banner --- */}
                        <div className="px-4 pb-2 bg-white">
                            <p className="text-[11px] font-medium text-[#6b7280]">
                                Within Incident Barangay Range (Publication)
                            </p>
                        </div>

                        {/* --- List Content --- */}
                        <div className="px-4 pb-4 h-[340px] overflow-y-auto custom-scrollbar">
                            {loadingVolunteers ? (
                                <p className="text-center py-4 text-gray-500 text-sm">Loading volunteers...</p>
                            ) : filteredVolunteers.length === 0 ? (
                                <p className="text-center py-4 text-gray-500 text-sm">No available volunteers found</p>
                            ) : (
                                filteredVolunteers.map((volunteer) => {
                                    const isSelected = selectedIds.includes(volunteer._id);
                                    return (
                                        <div key={volunteer._id} className="flex items-start gap-4 py-4 border-b border-gray-200">
                                            {/* Checkbox */}
                                            <div className="pt-1.5">
                                                <div
                                                    onClick={() => handleVolunteerToggle(volunteer._id)}
                                                    className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer shadow-sm transition-colors ${isSelected ? 'bg-[#25d366]' : 'border-2 border-gray-300 bg-white hover:border-blue-400'}`}
                                                >
                                                    {isSelected && <Icon icon="material-symbols:check" width={14} className="text-white" strokeWidth={4} />}
                                                </div>
                                            </div>

                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-14 h-14 rounded-full bg-[#cbd5e1] border-2 border-white shadow-sm flex items-center justify-center text-gray-500 text-lg font-bold">
                                                    {volunteer.firstName?.charAt(0)}{volunteer.lastName?.charAt(0)}
                                                </div>
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#2d7aff] rounded-full border border-white"></div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{volunteer.firstName} {volunteer.lastName}</h3>
                                                    <span className="text-[10px] font-semibold text-[#25d366] uppercase tracking-wide">Active</span>
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">Volunteer Responder</p>

                                                {/* Badges (Dummy data for UI match) */}
                                                <div className="flex flex-wrap gap-2 mt-1.5">
                                                    <span className="px-2 py-0.5 bg-[#dbeafe] text-[#1d4ed8] text-[10px] font-bold rounded border border-[#bfdbfe]">BLS/CPR</span>
                                                    <span className="px-2 py-0.5 bg-[#dbeafe] text-[#1d4ed8] text-[10px] font-bold rounded border border-[#bfdbfe]">First Aid</span>
                                                </div>

                                                {/* Location */}
                                                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[#6b7280]">
                                                    <Icon icon="material-symbols:location-on" width={12} className="text-gray-800" />
                                                    <span>{volunteer.address1 || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* --- Footer --- */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            {selectedIds.length > 0 && (
                                <div className="mb-3">
                                    <h4 className="text-base font-bold text-gray-800 mb-2">Selected</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedVolunteersData.map(v => (
                                            <div key={v._id} className="flex items-center bg-[#dbeafe] text-[#1e40af] px-3 py-1 rounded text-sm font-medium">
                                                {v.firstName} {v.lastName.charAt(0)}.
                                                <button
                                                    onClick={() => handleRemoveSelected(v._id)}
                                                    className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                                >
                                                    <Icon icon="material-symbols:close" width={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDispatchModal(false)}
                                    className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDispatch}
                                    disabled={isDispatching || selectedIds.length === 0}
                                    className="px-6 py-2 bg-[#1d7bf0] text-white font-bold rounded-md shadow-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDispatching ? 'Dispatching...' : 'Dispatch'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}