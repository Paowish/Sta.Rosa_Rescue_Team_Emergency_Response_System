import { Icon } from "@iconify/react";
import AdminLayout from "./AdminLayout";
import { useState, useEffect } from "react";

export default function UserAccount() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All Roles");
    const [statusFilter, setStatusFilter] = useState("All Status");

    // Edit modal state
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        contact: "",
        email: "",
        role: "VOLUNTEER",
        status: "ACTIVE"
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/all-volunteers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const formattedUsers = data.data.map(user => ({
                    id: user._id,
                    name: `${user.firstName} ${user.lastName}`,
                    role: user.role?.toUpperCase() || 'CIVILIAN',
                    email: user.email,
                    contact: user.phoneNumber || 'N/A',
                    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-',
                    status: user.isApproved ? 'ACTIVE' : user.applicationStatus === 'pending' ? 'PENDING' : 'INACTIVE',
                    checked: false
                }));
                setUsers(formattedUsers);
            }
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (id) => {
        setUsers(users.map(user =>
            user.id === id ? { ...user, checked: !user.checked } : user
        ));
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setUsers(users.map(user => ({ ...user, checked })));
    };

    const handleEdit = (user) => {
        const nameParts = user.name.split(" ");
        setFormData({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            contact: user.contact || "",
            email: user.email || "",
            role: user.role || "VOLUNTEER",
            status: user.status || "ACTIVE"
        });
        setEditingUser(user);
        setShowEditModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/update-user/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.contact,
                    email: formData.email,
                    role: formData.role.toLowerCase(),
                    status: formData.status
                })
            });
            const data = await response.json();
            if (data.success) {
                const updatedUser = {
                    ...editingUser,
                    name: `${formData.firstName} ${formData.lastName}`,
                    contact: formData.contact,
                    email: formData.email,
                    role: formData.role,
                    status: formData.status
                };
                setUsers(users.map(user =>
                    user.id === editingUser.id ? updatedUser : user
                ));
                setShowEditModal(false);
                setEditingUser(null);
            }
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditingUser(null);
    };

    const handleToggleStatus = async (user) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
            const response = await fetch(`/api/admin/update-user/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                setUsers(users.map(u =>
                    u.id === user.id ? { ...u, status: newStatus } : u
                ));
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const handleDeleteClick = (user) => {
        setDeletingUser(user);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingUser) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/admin/delete-user/${deletingUser.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setUsers(users.filter(u => u.id !== deletingUser.id));
                    setShowDeleteModal(false);
                    setDeletingUser(null);
                }
            } catch (error) {
                console.error("Failed to delete user:", error);
            }
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeletingUser(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "ACTIVE": return "bg-[#D5FFE5] border border-[#15803D] text-[#15803D]";
            case "INACTIVE": return "bg-[#FDE6EA] border border-[#DC2626] text-[#DC2626]";
            case "PENDING": return "bg-[#FCE3AE] border border-[#E1791E] text-[#E1791E]";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "VOLUNTEER": return "bg-[#D5FFE5] border border-[#15803D] text-[#15803D]";
            case "RESCUER": return "bg-[#CBE8FF] border border-[#4285F4] text-[#4285F4]";
            case "CIVILIAN": return "bg-[#EAE9F9] border border-[#6C63FF] text-[#6C63FF]";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
        const matchesStatus = statusFilter === "All Status" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const isAllChecked = users.length > 0 && users.every(user => user.checked);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading users...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFF]">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-[#262D31]">User Account</h1>
                    <p className="text-gray-500 text-sm">Manage all registered accounts across all roles</p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="relative w-[250px]">
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-[#D3D2DE] rounded-lg px-4 py-2 pl-10 text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <Icon
                            icon="material-symbols:search"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none border border-[#D3D2DE] rounded-lg px-4 py-2 pr-8 text-sm font-light bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                        >
                            <option>All Roles</option>
                            <option>VOLUNTEER</option>
                            <option>RESCUER</option>
                            <option>CIVILIAN</option>
                        </select>
                        <Icon
                            icon="mdi:chevron-down"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none border border-[#D3D2DE] rounded-lg px-4 py-2 pr-8 text-sm font-light bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                        >
                            <option>All Status</option>
                            <option>ACTIVE</option>
                            <option>INACTIVE</option>
                            <option>PENDING</option>
                        </select>
                        <Icon
                            icon="mdi:chevron-down"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={isAllChecked}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">Last Login</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={user.checked}
                                                    onChange={() => handleCheckboxChange(user.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block min-w-[100px] text-center px-3 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#000000]">{user.email}</td>
                                            <td className="px-4 py-3 text-sm text-[#000000]">{user.contact}</td>
                                            <td className="px-4 py-3 text-sm text-[#000000]">{user.lastLogin}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block min-w-[80px] text-center px-3 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-blue-600 hover:text-blue-800 transition"
                                                        title="Edit User"
                                                    >
                                                        <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`transition ${user.status === "ACTIVE"
                                                            ? "text-green-600 hover:text-green-800"
                                                            : "text-yellow-600 hover:text-yellow-800"
                                                            }`}
                                                        title={user.status === "ACTIVE" ? "Deactivate User" : "Activate User"}
                                                    >
                                                        <Icon icon={user.status === "ACTIVE" ? "mdi:check-circle" : "mdi:clock"} className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(user)}
                                                        className="text-red-600 hover:text-red-800 transition"
                                                        title="Delete User"
                                                    >
                                                        <Icon icon="mdi:delete" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b-2 border-t-8 border-[#4285F4] flex justify-between items-center rounded-t-lg">
                            <h2 className="text-lg font-semibold text-[#262D31]">
                                EDIT USER - {editingUser.name.toUpperCase()}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition">
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleFormChange}
                                        className="w-full border border-[#D3D2DE] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleFormChange}
                                        className="w-full border border-[#D3D2DE] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact No.</label>
                                    <input
                                        type="text"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleFormChange}
                                        className="w-full border border-[#D3D2DE] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        className="w-full border border-[#D3D2DE] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleFormChange}
                                        className="w-full border border-[#D3D2DE] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="VOLUNTEER">Volunteer</option>
                                        <option value="RESCUER">Rescuer</option>
                                        <option value="CIVILIAN">Civilian</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="w-full border border-[#D3D2DE] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="PENDING">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-lg mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-8 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-[#0C7FDA] text-white rounded-lg text-sm font-medium hover:bg-[#2674b4] transition"
                                >
                                    Save Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Modal */}
            {showDeleteModal && deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl w-[450px]">
                        <div className="p-4 border-b border-[#DC2626] border-t-8 flex justify-between items-center rounded-t-lg">
                            <h2 className="text-lg font-semibold text-[#262D31]">
                                Delete user {deletingUser.name}
                            </h2>
                            <button onClick={handleCancelDelete} className="text-gray-400 hover:text-gray-600 transition">
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start gap-3">
                                <div className="text-red-500 text-2xl">
                                    <Icon icon="mdi:alert-circle" className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-gray-700 text-sm">
                                        Are you sure you want to delete <strong>{deletingUser.name}</strong>? This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
                            <button
                                onClick={handleCancelDelete}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-6 py-2 bg-[#DC2626] text-white rounded-lg text-sm font-medium hover:bg-[#c11f1f] transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}