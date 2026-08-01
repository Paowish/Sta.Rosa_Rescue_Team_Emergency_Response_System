import { Icon } from "@iconify/react";
import AdminLayout from "./AdminLayout";
import { useState } from "react";

export default function SystemMaintenance() {
    const [periodFilter, setPeriodFilter] = useState("All Time");
    const [logs] = useState([
        {
            time: "9:22:03",
            type: "INFO",
            message: "Daily incident summary generated and dispatched",
        },
        {
            time: "7:32:09",
            type: "OK",
            message: "Automated backup completed successfully",
        },
        {
            time: "15:06:47",
            type: "ERROR",
            message: "SMS delivery failed to +63917001005 — retried, succeeded",
        },
        {
            time: "14:29:53",
            type: "WARNING",
            message: "Email latency spike",
        }
    ]);

    const [backups] = useState([
        {
            name: "Full Backup",
            date: "Mar 19 03:00",
            type: "Auto",
            status: "OK"
        },
        {
            name: "Full Backup",
            date: "Mar 19 03:00",
            type: "Auto",
            status: "OK"
        },
        {
            name: "Manual Backup",
            date: "Mar 16 14:22",
            type: "Manual",
            status: "OK"
        }
    ]);

    // ------------------ SCHEDULE MODAL STATE ------------------
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleData, setScheduleData] = useState({
        frequency: 'Daily',
        time: '3:00 AM',
        retentionDays: 30,
        storagePath: '/var/backups/whatatops',
        emailNotification: true
    });

    const getLogBadge = (type) => {
        switch (type) {
            case "INFO": return "bg-[#CBE8FF] border border-[#4285F4] text-[#4285F4] font-medium";
            case "OK": return "bg-[#D5FFE5] border border-[#15803D] text-[#15803D] font-medium";
            case "ERROR": return "bg-[#FDE6EA] border border-[#DC2626] text-[#DC2626] font-medium";
            case "WARNING": return "bg-[#FCE3AE] border border-[#E1791E] text-[#E1791E] font-medium";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "OK": return "bg-[#D5FFE5] border border-[#15803D] text-[#15803D] font-medium";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // Toggle component for the modal
    const ToggleSwitch = ({ checked, onChange }) => (
        <button
            onClick={onChange}
            type="button"
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#15803d]' : 'bg-gray-300'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[1.65rem]' : 'translate-x-[0.15rem]'}`}
            />
        </button>
    );

    return (
        <AdminLayout>
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFF]">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:wrench" className="w-8 h-8 text-[#1f6b75]" />
                        <div>
                            <h1 className="text-2xl font-semibold text-[#262D31]">System Maintenance</h1>
                            <p className="text-gray-500 text-sm">System Activity and backups.</p>
                        </div>
                    </div>
                </div>

                {/* System Activity Logs */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="p-4 border-b bg-[#EAE9F9] flex flex-wrap items-center justify-between">
                        <h2 className="font-semibold text-[#262D31]">System Activity Logs</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
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
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#15803D] text-white rounded-lg text-sm font-medium hover:bg-[#166534] transition">
                                <Icon icon="uil:export" className="w-4 h-4" />
                                Export to Excel
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Action</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {logs.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{log.time}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block min-w-[70px] text-center px-2 py-0.5 text-xs rounded-sm border ${getLogBadge(log.type)}`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#000000]">{log.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Backup and Restore */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="p-4 border-b bg-[#EAE9F9] flex flex-wrap items-center justify-between">
                        <h2 className="font-semibold text-[#262D31] uppercase">BACKUP AND RESTORE</h2>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#0C7FDA] text-white rounded-lg text-sm font-medium hover:bg-[#165a63] transition">
                            <Icon icon="material-symbols:save" className="w-6 h-6" />
                            Back up now
                        </button>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {backups.map((backup, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <span className="text-gray-400">●</span>
                                        <div>
                                            <p className="font-medium text-[#262D31]">{backup.name} — {backup.date}</p>
                                            <p className="text-sm text-gray-500">{backup.date} · {backup.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-block min-w-[40px] text-center px-4 py-0.5 text-xs rounded-sm border ${getStatusBadge(backup.status)}`}>
                                            {backup.status}
                                        </span>
                                        <button className="text-[#656363] text-sm font-medium hover:text-[#4e4c4c] transition flex items-center gap-1 border border-[#D4D8E3] rounded-sm px-3 py-0.5">
                                            <Icon icon="tabler:restore" className="w-4 h-4" />
                                            Restore
                                        </button>
                                        <button className="text-red-600 text-sm font-medium hover:text-red-700 transition flex items-center gap-1 border border-[#DC2626] rounded-sm px-3 py-0.5">
                                            <Icon icon="mdi:delete" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="p-4 bg-gray-50 flex flex-wrap items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Schedule: <span className="font-medium text-[#262D31]">Daily at 3:00</span> ·
                                Retention: <span className="font-medium text-[#262D31]">30 days</span>
                            </p>
                            <button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-[#0C7FDA] text-[#0C7FDA] rounded-lg text-sm font-medium hover:bg-[#0C7FDA] hover:text-white transition">
                                <Icon icon="uil:setting" className="w-4 h-4" />
                                Configure Schedule
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================== */}
            {/* CONFIGURE SCHEDULE MODAL (Matches Screenshot) */}
            {/* ========================================== */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl w-[560px] max-w-[95vw] overflow-hidden">

                        {/* Top Blue Border */}
                        <div className="h-1.5 w-full bg-[#3b82f6]"></div>

                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                            <h3 className="text-[20px] font-bold text-gray-800">Configure Backup Schedule</h3>
                            <button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">

                            {/* Backup Frequency */}
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1.5">Backup Frequency</label>
                                <div className="relative">
                                    <select
                                        value={scheduleData.frequency}
                                        onChange={(e) => setScheduleData({ ...scheduleData, frequency: e.target.value })}
                                        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                    </select>
                                    <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Backup Time */}
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1.5">Backup Time</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={scheduleData.time}
                                        onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <Icon icon="mdi:clock-outline" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Retention Period (Days) */}
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1.5">Retention Period (Days)</label>
                                <input
                                    type="number"
                                    value={scheduleData.retentionDays}
                                    onChange={(e) => setScheduleData({ ...scheduleData, retentionDays: parseInt(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Backup Storage Path */}
                            <div>
                                <label className="block text-[14px] font-medium text-gray-700 mb-1.5">Backup Storage Path</label>
                                <input
                                    type="text"
                                    value={scheduleData.storagePath}
                                    onChange={(e) => setScheduleData({ ...scheduleData, storagePath: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Email Notification */}
                            <div className="flex items-start justify-between pt-2">
                                <div>
                                    <label className="block text-[14px] font-medium text-gray-700">Email Notification on Backup</label>
                                    <p className="text-[13px] text-gray-500 mt-0.5">Notify admin on completion</p>
                                </div>
                                <ToggleSwitch
                                    checked={scheduleData.emailNotification}
                                    onChange={() => setScheduleData({ ...scheduleData, emailNotification: !scheduleData.emailNotification })}
                                />
                            </div>

                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <button onClick={() => setIsScheduleModalOpen(false)} className="px-5 py-1.5 text-[14px] font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => {
                                alert("Backup schedule saved!");
                                setIsScheduleModalOpen(false);
                            }} className="px-6 py-1.5 text-[14px] font-medium text-white bg-[#0C7FDA] rounded hover:bg-[#0b6eb5] transition-colors shadow-sm">
                                Save Schedule
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </AdminLayout>
    );
}