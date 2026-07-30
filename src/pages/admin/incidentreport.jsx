import { Icon } from "@iconify/react";
import AdminLayout from "./alayout";
import { useState, useEffect } from "react";

export default function IncidentReports() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [periodFilter, setPeriodFilter] = useState("All Time");
    const [statusFilter, setStatusFilter] = useState("All Time");

    useEffect(() => {
        loadIncidents();
    }, []);

    const loadIncidents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/incidents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setIncidents(data.data);
            }
        } catch (error) {
            console.error("Failed to load incidents:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Resolved": return "bg-[#D5FFE5] border border-[#15803D] text-[#15803D]";
            case "Active": return "bg-[#FDE6EA] border border-[#DC2626] text-[#DC2626]";
            case "Dispatched": return "bg-[#FCE3AE] border border-[#E1791E] text-[#E1791E]";
            case "Pending": return "bg-[#FCE3AE] border border-[#E1791E] text-[#E1791E]";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case "Resolved": return "SOLVED";
            case "Active": return "UNSOLVED";
            case "Dispatched": return "PENDING";
            default: return status?.toUpperCase() || "PENDING";
        }
    };

    const filteredIncidents = incidents.filter(incident => {
        const matchesSearch =
            (incident.incidentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (incident.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (incident.location?.address || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter !== "All Time") {
            const displayStatus = getStatusDisplay(incident.status);
            matchesStatus = displayStatus === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

    const handleClearFilters = () => {
        setSearchTerm("");
        setPeriodFilter("All Time");
        setStatusFilter("All Time");
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading incidents...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFF]">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <Icon icon="ic:outline-emergency" className="w-8 h-8 text-[#1f6b75]" />
                        <div>
                            <h1 className="text-2xl font-semibold text-[#262D31]">Incident Report</h1>
                            <p className="text-gray-500 text-sm">Incident logs</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="relative w-[250px]">
                        <input
                            type="text"
                            placeholder="Search ID, type, location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-[#D3D2DE] rounded-lg px-4 py-2 pl-10 text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <Icon
                            icon="material-symbols:search"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Period</span>
                        <div className="relative">
                            <select
                                value={periodFilter}
                                onChange={(e) => setPeriodFilter(e.target.value)}
                                className="appearance-none border border-[#D3D2DE] rounded-lg px-4 py-2 pr-8 text-sm font-light bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                            >
                                <option>All Time</option>
                                <option>Today</option>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>This Year</option>
                            </select>
                            <Icon
                                icon="mdi:chevron-down"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none border border-[#D3D2DE] rounded-lg px-4 py-2 pr-8 text-sm font-light bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                            >
                                <option>All Time</option>
                                <option>SOLVED</option>
                                <option>UNSOLVED</option>
                                <option>PENDING</option>
                            </select>
                            <Icon
                                icon="mdi:chevron-down"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 border border-[#D3D2DE] rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                        Clear
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1f6b75] text-white rounded-lg text-sm font-medium hover:bg-[#165a63] transition ml-auto">
                        <Icon icon="uil:export" className="w-4 h-4" />
                        Export to Excel
                    </button>
                </div>

                {/* Incidents Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Barangay</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Location</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Reported</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Resolved at</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Assigned to</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Victims</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredIncidents.length > 0 ? (
                                    filteredIncidents.map((incident) => (
                                        <tr key={incident._id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{incident.incidentId || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm text-[#000000] whitespace-nowrap">{incident.type}</td>
                                            <td className="px-4 py-3 text-sm text-[#000000] whitespace-nowrap">{incident.location?.barangay || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm text-[#000000] whitespace-nowrap">{incident.location?.address || 'Unknown'}</td>
                                            <td className="px-4 py-3 text-sm text-[#000000] whitespace-nowrap">
                                                {incident.reportedAt ? new Date(incident.reportedAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#000000] whitespace-nowrap">
                                                {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#000000] whitespace-nowrap max-w-[150px] truncate">
                                                {incident.assignedTeam || 'Unassigned'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#000000] whitespace-nowrap">{incident.victimsAffected || 0}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-block w-[85px] text-center px-2 py-1 text-xs rounded-sm font-medium ${getStatusColor(incident.status)}`}>
                                                    {getStatusDisplay(incident.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                            No incidents found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}