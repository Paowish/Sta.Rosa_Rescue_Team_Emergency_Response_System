import React, { useState } from 'react';

// --- Mock Data ---
const responders = [
    {
        id: 1,
        name: 'John Pork',
        role: 'Team Leader',
        status: 'On Scene',
        statusColor: 'orange',
        specialties: ['First Aid', 'BLS/CPR', 'EMT-B'],
        assignment: 'INC-004',
        eta: '2 Mins',
        details: {
            volunteerId: 'P-0861',
            contact: '09887655680',
            activeYears: '7 Years',
            currentAssignment: 'INC-0322 - ETA 2 mins',
            recentIncidents: [
                { type: 'Critical', title: 'Structure Fire', date: 'Today - 9:54', location: 'En - Route' },
                { type: 'Resolved', title: 'Medical Emergency', date: '11/25/25 - 13:24', location: 'Resolved' }
            ],
            certs: ['BLS/CPR', 'First Aid', 'EMT-B', 'Patient Triage', 'Wound Care', 'IV Administration']
        }
    },
    {
        id: 2,
        name: 'Chuck Norris',
        role: 'Paramedic',
        status: 'En Route',
        statusColor: 'blue',
        specialties: ['First Aid', 'BLS/CPR', 'EMT-B', 'PMTLS'],
        assignment: 'INC-004',
        eta: '2 Mins',
        details: {
            volunteerId: 'P-0861',
            contact: '09887655680',
            activeYears: '7 Years',
            currentAssignment: 'INC-0322 - ETA 2 mins',
            recentIncidents: [
                { type: 'Critical', title: 'Structure Fire', date: 'Today - 9:54', location: 'En - Route' },
                { type: 'Resolved', title: 'Medical Emergency', date: '11/25/25 - 13:24', location: 'Resolved' }
            ],
            certs: ['BLS/CPR', 'First Aid', 'EMT-B', 'Patient Triage', 'Wound Care', 'IV Administration']
        }
    },
    {
        id: 3,
        name: 'Tim Keso',
        role: 'Search & Rescue',
        status: 'Available',
        statusColor: 'green',
        specialties: ['First Aid', 'BLS/CPR', 'OSHA', 'USAR LVL 2'],
        assignment: null,
        eta: null,
        details: {
            volunteerId: 'P-0861',
            contact: '09887655680',
            activeYears: '7 Years',
            currentAssignment: 'None',
            recentIncidents: [],
            certs: ['BLS/CPR', 'First Aid', 'EMT-B', 'Patient Triage']
        }
    },
    {
        id: 4,
        name: 'Marvin Delfin',
        role: 'Rescue Driver',
        status: 'Stand by',
        statusColor: 'yellow',
        specialties: ['BLS/CPR', 'Emergency Driving', 'CDL - Pro'],
        assignment: null,
        eta: null,
        details: {
            volunteerId: 'P-0861',
            contact: '09887655680',
            activeYears: '7 Years',
            currentAssignment: 'None',
            recentIncidents: [],
            certs: ['BLS/CPR', 'First Aid']
        }
    }
];

// --- Components ---
const StatusBadge = ({ status, color }) => {
    const colorMap = {
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorMap[color]}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${color === 'green' ? 'bg-green-600' : color === 'orange' ? 'bg-orange-500' : color === 'blue' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
            • {status}
        </span>
    );
};

const Tag = ({ label }) => (
    <span className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded border border-blue-100 mr-1.5 mb-1.5">
        {label}
    </span>
);

const IncidentTag = ({ type, title, date, location }) => (
    <div className="flex flex-col mb-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
        <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${type === 'Critical' ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200'}`}>
                {type}
            </span>
        </div>
        <div className="text-xs font-semibold text-gray-800">{title}</div>
        <div className="flex justify-between text-xs text-gray-500 mt-0.5">
            <span>{date}</span>
            <span>• {location}</span>
        </div>
    </div>
);

// --- DISPATCH MODAL ---
const DispatchModal = ({ volunteer, onClose }) => {
    // ✅ FIXED: Moved mock incidents inside the DispatchModal so they exist
    const incidents = [
        {
            id: 'INC-001-120126',
            type: 'Critical',
            color: 'red',
            title: 'Vehicle Accident',
            location: '779 Maharlika Hwy, Brgy. Rizal, Santa Rosa, Nueva Ecija',
            mapMarker: 'orange'
        },
        {
            id: 'INC-002-120126',
            type: 'Medium',
            color: 'yellow',
            title: 'Medical Emergency',
            location: '28-230 Santa Rosa - Tarlac Rd, Santa Rosa, Nueva Ecija',
            mapMarker: 'orange'
        },
        {
            id: 'INC-003-120126',
            type: 'Low',
            color: 'green',
            title: 'Road Obstruction',
            location: '',
            mapMarker: 'green'
        }
    ];

    const handleDispatchTeam = () => {
        alert(`Dispatch Team assigned to ${volunteer.name} successfully!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 font-sans backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
                <div className="bg-[#5e747f] px-6 py-4 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-white text-lg font-semibold">Dispatch Volunteer</h2>
                        <p className="text-blue-100 text-xs opacity-90">Assign a volunteer to an active incident</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    <div className="w-full md:w-1/3 border-r border-gray-200 bg-[#f5f6f8] overflow-y-auto max-h-[60vh] md:max-h-[70vh] relative">
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="p-6 flex items-center gap-4 border-b border-gray-200 bg-white">
                            <div className="relative w-16 h-16 shrink-0">
                                <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden relative">
                                    <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
                                    <div className="absolute bottom-2 right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-300 mt-2"></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{volunteer.name}</h3>
                                <p className="text-xs text-gray-500 font-medium">{volunteer.role}</p>
                                <div className="mt-1.5 inline-block bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-sm">• {volunteer.status}</div>
                            </div>
                        </div>
                        <div className="p-0 text-xs">
                            <div className="bg-[#e5e9ee] py-2 px-6 font-semibold text-gray-600 border-b border-gray-200 text-[11px] uppercase tracking-wider">Profile</div>
                            <div className="bg-white divide-y divide-gray-100">
                                <div className="flex justify-between py-2.5 px-6"><span className="text-gray-500 font-medium">Volunteer ID</span><span className="text-gray-800 font-semibold">{volunteer.details.volunteerId}</span></div>
                                <div className="flex justify-between py-2.5 px-6 bg-[#f7f8fa]"><span className="text-gray-500 font-medium">Contact</span><span className="text-gray-800 font-semibold">{volunteer.details.contact}</span></div>
                                <div className="flex justify-between py-2.5 px-6"><span className="text-gray-500 font-medium">Years Active</span><span className="text-gray-800 font-semibold">{volunteer.details.activeYears}</span></div>
                                <div className="flex justify-between py-2.5 px-6 bg-[#f7f8fa]"><span className="text-gray-500 font-medium">Current Assignment</span><span className="text-gray-800 font-semibold">{volunteer.details.currentAssignment}</span></div>
                            </div>
                            <div className="bg-[#e5e9ee] py-2 px-6 font-semibold text-gray-600 border-y border-gray-200 text-[11px] uppercase tracking-wider">Recent Incidents</div>
                            <div className="bg-white p-5 space-y-3">
                                {volunteer.details.recentIncidents.map((inc, idx) => (<div key={idx} className="flex flex-col gap-1"><div className="flex items-center gap-2"><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${inc.type === 'Critical' ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200'}`}>{inc.type}</span><span className="text-[10px] text-gray-500">{inc.code || 'INC-xxx'}</span></div><div className="text-xs font-semibold text-gray-700">{inc.title}</div><div className="text-[10px] text-gray-500 flex justify-between border-b border-gray-100 pb-1.5"><span>• {inc.date}</span><span>• {inc.location}</span></div></div>))}
                            </div>
                            <div className="bg-[#e5e9ee] py-2 px-6 font-semibold text-gray-600 border-y border-gray-200 text-[11px] uppercase tracking-wider">Certification and Skills</div>
                            <div className="bg-white p-5 flex flex-wrap gap-1.5">
                                {volunteer.details.certs.map((c, idx) => (<span key={idx} className="bg-blue-50 border border-blue-200 text-blue-600 px-2 py-1 rounded text-[10px] font-medium">{c}</span>))}
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 flex flex-col h-full">
                        <div className="relative h-48 md:h-64 w-full bg-gray-200 overflow-hidden border-b border-gray-200 shrink-0">
                            <div className="absolute inset-0 bg-[#f1f3f4] bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Santa+Rosa,Nueva+Ecija&zoom=13&size=600x300&maptype=roadmap&key=YOUR_API_KEY_HERE')] bg-cover bg-center"></div>
                            <div className="absolute top-2 left-2 bg-white rounded shadow text-xs overflow-hidden flex flex-col text-gray-600">
                                <button className="px-3 py-1 border-b border-gray-200 hover:bg-gray-50 font-medium">Map</button>
                                <button className="px-3 py-1 hover:bg-gray-50 font-medium">Satellite</button>
                            </div>
                            <div className="absolute top-[30%] left-[55%]"><div className="w-8 h-8 rounded-full bg-yellow-300 opacity-30 animate-ping absolute"></div><svg className="w-6 h-6 text-yellow-500 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></div>
                            <div className="absolute top-[45%] left-[75%]"><div className="w-8 h-8 rounded-full bg-orange-300 opacity-30 animate-ping absolute"></div><svg className="w-6 h-6 text-orange-500 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></div>
                            <div className="absolute top-[60%] left-[35%]"><svg className="w-6 h-6 text-green-600 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></div>
                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-4 py-1.5 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-500"><span>Active incidents - Select to assign</span><span className="flex items-center gap-1"><span>3 Incidents</span></span></div>
                        </div>
                        <div className="bg-white flex-1 p-5 space-y-5 overflow-y-auto">
                            {/* ✅ Now uses the correctly defined incidents variable */}
                            {incidents.map((incident) => (<div key={incident.id} className="flex gap-3 group cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors relative"><div className="flex-1 z-10"><div className="flex items-center gap-2 mb-1"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${incident.type === 'Critical' ? 'text-red-600 border-red-300 bg-red-50' : incident.type === 'Medium' ? 'text-yellow-600 border-yellow-300 bg-yellow-50' : 'text-green-600 border-green-300 bg-green-50'}`}>{incident.type}</span><span className="text-[10px] text-gray-500 font-medium">{incident.id}</span></div><h4 className="text-base font-bold text-gray-800">{incident.title}</h4>{incident.location && <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-600"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{incident.location}</div>}</div></div>))}
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center bg-white gap-4 shrink-0">
                    <p className="text-sm text-gray-500">Assigning <span className="font-bold text-gray-800">{volunteer.name.split(' ')[0]} {volunteer.name.split(' ')[1]?.charAt(0) || ''}.</span> to <span className="font-bold text-gray-800">INC-002</span> — Medical Emergency at Tarlac Rd, Santa Rosa</p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={onClose} className="flex-1 sm:flex-none bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium py-2 px-6 rounded">Cancel</button>
                        <button onClick={handleDispatchTeam} className="flex-1 sm:flex-none bg-[#4a5568] hover:bg-[#2d3748] text-white text-sm font-medium py-2 px-6 rounded shadow-sm transition-colors">Dispatch Team</button>
                        <button className="flex-1 sm:flex-none bg-[#0081d6] hover:bg-[#006bb3] text-white text-sm font-medium py-2 px-6 rounded shadow-sm transition-colors">Dispatch</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App ---
export default function Units() {
    const [selectedId, setSelectedId] = useState(2);
    const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

    const activeResponder = responders.find(r => r.id === selectedId);

    const handleDispatchClick = () => {
        if (activeResponder) setIsDispatchModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] p-6 font-sans text-gray-800 relative">

            {/* --- Header --- */}
            <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-[#1f4e6f]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1f4e6f] tracking-tight">Responders</h1>
                        <p className="text-xs text-gray-400 font-medium">Unit roster & deployment status</p>
                        <p className="text-xs text-gray-400 font-medium">Santa Rosa Emergency Response</p>
                    </div>
                </div>
                <div className="relative w-80">
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search name, status, role..."
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </header>

            <div className="flex gap-6">

                {/* --- Left Column --- */}
                <div className="flex-1">

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded border border-gray-200 p-4 flex flex-col justify-between shadow-sm h-24">
                            <span className="text-3xl font-bold text-gray-800">9</span>
                            <div className="border-b-2 border-gray-200 pb-1">
                                <span className="text-[13px] font-medium text-gray-500 pb-0.5">Total Responder</span>
                            </div>
                        </div>
                        <div className="bg-white rounded border border-gray-200 p-4 flex flex-col justify-between shadow-sm h-24">
                            <span className="text-3xl font-bold text-gray-800">3</span>
                            <div className="border-b-2 border-green-600 pb-1">
                                <span className="text-[13px] font-medium text-gray-500 pb-0.5">Available</span>
                            </div>
                        </div>
                        <div className="bg-white rounded border border-gray-200 p-4 flex flex-col justify-between shadow-sm h-24">
                            <span className="text-3xl font-bold text-gray-800">4</span>
                            <div className="border-b-2 border-orange-400 pb-1">
                                <span className="text-[13px] font-medium text-gray-500 pb-0.5">Deployed</span>
                            </div>
                        </div>
                        <div className="bg-white rounded border border-gray-200 p-4 flex flex-col justify-between shadow-sm h-24">
                            <span className="text-3xl font-bold text-gray-800">2</span>
                            <div className="border-b-2 border-yellow-400 pb-1">
                                <span className="text-[13px] font-medium text-gray-500 pb-0.5">Stand by</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-6 mb-6 border-b border-gray-200 pb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[14px] font-medium text-gray-600">Status</span>
                            <select className="text-[13px] border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-600 w-28 focus:outline-none">
                                <option>All Status</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[14px] font-medium text-gray-600">Role</span>
                            <select className="text-[13px] border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-600 w-28 focus:outline-none">
                                <option>All Roles</option>
                            </select>
                        </div>
                    </div>

                    {/* Grid Cards */}
                    <div className="grid grid-cols-2 gap-5">
                        {responders.map((r) => (
                            <div
                                key={r.id}
                                onClick={() => setSelectedId(r.id)}
                                className={`bg-[#f5f7fc] rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative ${selectedId === r.id ? 'ring-1 ring-blue-200' : ''}`}
                            >
                                <div className={`h-1.5 w-full ${r.statusColor === 'orange' ? 'bg-orange-500' :
                                    r.statusColor === 'blue' ? 'bg-blue-500' :
                                        r.statusColor === 'green' ? 'bg-green-600' :
                                            'bg-yellow-400'
                                    }`}></div>

                                <div className="p-5 pb-3">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-[#dbe0e8] flex-shrink-0 flex items-center justify-center text-gray-400">
                                            {r.id === 1 && (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-[15px] text-gray-800">{r.name}</div>
                                            <div className="text-[12px] text-gray-500">{r.role}</div>
                                            <div className="mt-1.5">
                                                <StatusBadge status={r.status} color={r.statusColor} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3 mt-2">
                                        <div className="text-[12px] font-medium text-gray-500 mb-1.5">Speciality</div>
                                        <div className="flex flex-wrap">
                                            {r.specialties.map(s => <Tag key={s} label={s} />)}
                                        </div>
                                    </div>

                                    {(r.assignment || r.eta) && (
                                        <div className="flex justify-between items-center text-[12px] bg-gray-100/60 rounded px-3 py-1.5 mt-3 -mx-1">
                                            <div>
                                                <span className="text-gray-500">Assignment: </span>
                                                <span className="font-semibold text-[#3b82f6]">{r.assignment || 'None'}</span>
                                            </div>
                                            {r.eta && (
                                                <div className="text-orange-400 font-semibold">
                                                    ETA <span className="bg-[#fff2e5] px-2 py-0.5 rounded ml-1 text-orange-400">{r.eta}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Right Column (Side Panel) --- */}
                <div className="w-[380px] bg-white rounded-xl border border-gray-200 shadow-lg h-[calc(100vh-140px)] sticky top-6 overflow-hidden shrink-0">
                    {activeResponder ? (
                        <div className="h-full flex flex-col">

                            {/* Top Section */}
                            <div className="p-6 flex items-center gap-4 relative">
                                <div className="w-16 h-16 rounded-full bg-[#dbe0e8] flex-shrink-0 relative">
                                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h3 className="text-[20px] font-bold text-gray-800">{activeResponder.name}</h3>
                                    <p className="text-[13px] text-gray-500 font-medium">{activeResponder.role}</p>
                                    <div className="mt-1.5">
                                        <StatusBadge status={activeResponder.status} color={activeResponder.statusColor} />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1 absolute top-4 right-4"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Info Rows */}
                            <div className="flex-1 overflow-y-auto text-[13px] pb-20">

                                <div className="bg-[#e5e9ee] py-2.5 px-6 font-medium text-gray-600 border-y border-gray-200 text-[12px]">
                                    Profile
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex justify-between py-2.5 px-6 border-b border-gray-100 bg-white">
                                        <span className="text-gray-500 font-medium">Responder ID</span>
                                        <span className="text-gray-800 font-bold">{activeResponder.details.volunteerId}</span>
                                    </div>
                                    <div className="flex justify-between py-2.5 px-6 border-b border-gray-100 bg-[#f7f8fa]">
                                        <span className="text-gray-500 font-medium">Contact</span>
                                        <span className="text-gray-800 font-bold">{activeResponder.details.contact}</span>
                                    </div>
                                    <div className="flex justify-between py-2.5 px-6 border-b border-gray-100 bg-white">
                                        <span className="text-gray-500 font-medium">Years Active</span>
                                        <span className="text-gray-800 font-bold">{activeResponder.details.activeYears}</span>
                                    </div>
                                    <div className="flex justify-between py-2.5 px-6 border-b border-gray-100 bg-[#f7f8fa]">
                                        <span className="text-gray-500 font-medium">Current Assignment</span>
                                        <span className="text-gray-800 font-bold">{activeResponder.details.currentAssignment}</span>
                                    </div>
                                </div>

                                <div className="bg-[#e5e9ee] py-2.5 px-6 font-medium text-gray-600 border-y border-gray-200 text-[12px]">
                                    Recent Incidents
                                </div>
                                <div className="p-6 space-y-4 bg-white border-b border-gray-200">
                                    {activeResponder.details.recentIncidents.map((inc, idx) => (
                                        <IncidentTag key={idx} {...inc} />
                                    ))}
                                </div>

                                <div className="bg-[#e5e9ee] py-2.5 px-6 font-medium text-gray-600 border-y border-gray-200 text-[12px]">
                                    Certification and Skills
                                </div>
                                <div className="p-6 flex flex-wrap gap-1.5 bg-white">
                                    {activeResponder.details.certs.map((cert, idx) => (
                                        <span key={idx} className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded text-[11px] font-medium shadow-sm">
                                            {cert}
                                        </span>
                                    ))}
                                </div>

                            </div>

                            {/* Absolute Bottom Buttons */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={handleDispatchClick}
                                    className="flex-1 bg-[#e60000] hover:bg-[#cc0000] text-white text-[13px] font-medium py-2 rounded"
                                >
                                    Dispatch
                                </button>
                                <button className="flex-1 bg-white border border-blue-300 hover:bg-blue-50 text-gray-700 text-[13px] font-medium py-2 rounded">
                                    Stand by
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6">
                            <h3 className="text-lg font-bold text-gray-800">No Selection</h3>
                            <p className="text-sm text-gray-500 font-medium max-w-[250px] text-center">
                                Click a responder card or applicant to view full details.
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* Render Dispatch Modal when open */}
            {isDispatchModalOpen && activeResponder && (
                <DispatchModal
                    volunteer={activeResponder}
                    onClose={() => setIsDispatchModalOpen(false)}
                />
            )}
        </div>
    );
}