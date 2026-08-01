import { Icon } from "@iconify/react";
import AdminLayout from "./AdminLayout";
import { useState, useEffect } from "react";

export default function AdminOverview() {
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });
    const [recentRequests, setRecentRequests] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Load incidents
            const incidentResponse = await fetch('/api/incidents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const incidentData = await incidentResponse.json();

            if (incidentData.success) {
                setIncidents(incidentData.data.slice(0, 3));
                const total = incidentData.data.length;
                const active = incidentData.data.filter(i => i.status === 'Active' || i.status === 'Dispatched').length;
                const pending = incidentData.data.filter(i => i.status === 'Pending').length;
                setStats({ total, active, pending });
            }

            // Load pending volunteer requests
            const requestsResponse = await fetch('/api/admin/pending-volunteers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const requestsData = await requestsResponse.json();
            if (requestsData.success) {
                setRecentRequests(requestsData.data.slice(0, 3));
            }
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "bg-[#FCE3AE] border border-[#E1791E] text-[#E1791E]";
            case "SOLVED": return "bg-[#D5FFE5] border border-[#15803D] text-[#15803D]";
            case "UNSOLVED": return "bg-[#FDE6EA] border border-[#DC2626] text-[#DC2626]";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "volunteer": return "bg-[#D5FFE5] border border-[#15803D] text-[#15803D]";
            case "responder": return "bg-[#CBE8FF] border border-[#4285F4] text-[#4285F4]";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case "Active": return "UNSOLVED";
            case "Dispatched": return "PENDING";
            case "Resolved": return "SOLVED";
            default: return status?.toUpperCase() || "PENDING";
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading dashboard...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFF]">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-[#262D31]">Admin Overview</h1>
                    <p className="text-gray-500 text-sm">System health, user summary, and activity snapshot</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-2 mb-6">
                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-start gap-3">
                            <p className="text-5xl font-bold text-[#672778] leading-none">{stats.total}</p>
                            <div>
                                <p className="text-gray-500 text-sm">Total Incidents</p>
                                <span className="text-green-500 text-sm font-medium flex items-center">
                                    {stats.active} Active
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-start gap-3">
                            <p className="text-5xl font-bold text-[#15803D] leading-none">{stats.active}</p>
                            <div>
                                <p className="text-gray-500 text-sm">Active incidents</p>
                                <span className="text-blue-500 text-sm font-medium">{Math.round((stats.active / stats.total) * 100) || 0}% Total</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-start gap-3">
                            <p className="text-5xl font-bold text-[#E1791E] leading-none">{stats.pending}</p>
                            <div>
                                <p className="text-gray-500 text-sm">Pending Accounts</p>
                                <span className="text-yellow-500 text-sm font-medium">Needs Review</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Account Requests */}
                <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-[#EAE9F9]">
                        <h2 className="font-semibold text-[#262D31]">Recent Account Request</h2>
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
                            View All
                            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-b border-[#EAE9F9]">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-b border-[#EAE9F9]">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-b border-[#EAE9F9]">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-b border-[#EAE9F9]">Requested</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-b border-[#EAE9F9]">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-b border-[#EAE9F9]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentRequests.length > 0 ? (
                                    recentRequests.map((request, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{request.firstName} {request.lastName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(request.role)}`}>
                                                    {request.role?.toUpperCase() || 'VOLUNTEER'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#000000]">{request.email}</td>
                                            <td className="px-4 py-3 text-sm text-[#000000]">
                                                {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor('PENDING')}`}>
                                                    PENDING
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button className="bg-[#15803D] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#166534] transition">
                                                        Accept
                                                    </button>
                                                    <button className="bg-[#DC2626] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#c11f1f] transition">
                                                        Decline
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                            No pending requests
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Incident Summary */}
                <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-[#EAE9F9]">
                        <h2 className="font-semibold text-[#262D31]">Incident Summary</h2>
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
                            View All
                            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">Location</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">Reported</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {incidents.length > 0 ? (
                                    incidents.map((incident) => (
                                        <tr key={incident._id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{incident.incidentId || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm text-[#000000]">{incident.type}</td>
                                            <td className="px-4 py-3 text-sm text-[#000000]">{incident.location?.address || 'Unknown'}</td>
                                            <td className="px-4 py-3 text-sm text-[#000000]">
                                                {incident.reportedAt ? new Date(incident.reportedAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(getStatusDisplay(incident.status))}`}>
                                                    {getStatusDisplay(incident.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
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