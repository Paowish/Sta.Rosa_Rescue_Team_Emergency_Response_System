import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import AdminLayout from "./AdminLayout";

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const fileInputRef = useRef(null);

    const [originalUser, setOriginalUser] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        profileImage: ""
    });

    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        profileImage: ""
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [photoError, setPhotoError] = useState("");
    const [photoSuccess, setPhotoSuccess] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const storedImage = storedUser?.profileImage || localStorage.getItem('profileImage') || "";

            if (storedImage) {
                const imageUrl = storedImage.startsWith('http')
                    ? storedImage
                    : `http://localhost:5000/${storedImage}`;
                setPreviewUrl(imageUrl);
            }

            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                const userData = {
                    firstName: data.data.firstName || storedUser?.firstName || "",
                    lastName: data.data.lastName || storedUser?.lastName || "",
                    phoneNumber: data.data.phoneNumber || storedUser?.phoneNumber || "",
                    email: data.data.email || storedUser?.email || "",
                    profileImage: data.data.profileImage || storedImage || ""
                };

                setOriginalUser(userData);
                setUser(userData);

                const updatedStoredUser = {
                    ...storedUser,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phoneNumber: userData.phoneNumber,
                    email: userData.email,
                    profileImage: userData.profileImage
                };
                localStorage.setItem('user', JSON.stringify(updatedStoredUser));
                if (userData.profileImage) {
                    localStorage.setItem('profileImage', userData.profileImage);
                }

                if (userData.profileImage) {
                    const imageUrl = userData.profileImage.startsWith('http')
                        ? userData.profileImage
                        : `http://localhost:5000/${userData.profileImage}`;
                    setPreviewUrl(imageUrl);
                } else {
                    setPreviewUrl(null);
                }
            }
        } catch (error) {
            console.error("Failed to load profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateProfile = () => {
        const errors = {};

        if (!user.firstName.trim()) {
            errors.firstName = "First name is required";
        } else if (user.firstName.trim().length < 2) {
            errors.firstName = "First name must be at least 2 characters";
        }

        if (!user.lastName.trim()) {
            errors.lastName = "Last name is required";
        } else if (user.lastName.trim().length < 2) {
            errors.lastName = "Last name must be at least 2 characters";
        }

        if (!user.phoneNumber.trim()) {
            errors.phoneNumber = "Contact number is required";
        } else {
            const phoneDigits = user.phoneNumber.replace(/\D/g, '');
            if (phoneDigits.length < 10 || phoneDigits.length > 11) {
                errors.phoneNumber = "Please enter a valid phone number (10-11 digits)";
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEdit = () => {
        setIsEditing(true);
        setPasswordError("");
        setPasswordSuccess("");
        setPhotoError("");
        setPhotoSuccess("");
        setValidationErrors({});
    };

    const handleCancel = () => {
        setUser({ ...originalUser });
        setIsEditing(false);
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        setPasswordError("");
        setPasswordSuccess("");
        setPhotoError("");
        setPhotoSuccess("");
        setValidationErrors({});
        if (originalUser.profileImage) {
            const imageUrl = originalUser.profileImage.startsWith('http')
                ? originalUser.profileImage
                : `http://localhost:5000/${originalUser.profileImage}`;
            setPreviewUrl(imageUrl);
        } else {
            setPreviewUrl(null);
        }
        setSelectedFile(null);
    };

    const handleSave = async () => {
        if (!validateProfile()) {
            return;
        }

        const hasChanges =
            user.firstName.trim() !== originalUser.firstName ||
            user.lastName.trim() !== originalUser.lastName ||
            user.phoneNumber.trim() !== originalUser.phoneNumber;

        if (!hasChanges) {
            alert("No changes were made to your profile.");
            setIsEditing(false);
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: user.firstName.trim(),
                    lastName: user.lastName.trim(),
                    phoneNumber: user.phoneNumber.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                const updatedUser = {
                    ...user,
                    profileImage: originalUser.profileImage
                };

                setOriginalUser(updatedUser);
                setUser(updatedUser);

                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser) {
                    storedUser.firstName = user.firstName.trim();
                    storedUser.lastName = user.lastName.trim();
                    storedUser.phoneNumber = user.phoneNumber.trim();
                    storedUser.profileImage = originalUser.profileImage;
                    localStorage.setItem('user', JSON.stringify(storedUser));
                    if (originalUser.profileImage) {
                        localStorage.setItem('profileImage', originalUser.profileImage);
                    }
                }

                window.dispatchEvent(new Event('storage'));

                alert("Profile updated successfully!");
                setIsEditing(false);
                setValidationErrors({});
            }
        } catch (error) {
            alert(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const validatePassword = () => {
        const errors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = "Current password is required";
        }

        if (!passwordData.newPassword) {
            errors.newPassword = "New password is required";
        } else {
            if (passwordData.newPassword.length < 8) {
                errors.newPassword = "Password must be at least 8 characters";
            } else if (!/[A-Z]/.test(passwordData.newPassword)) {
                errors.newPassword = "Password must contain an uppercase letter";
            } else if (!/[a-z]/.test(passwordData.newPassword)) {
                errors.newPassword = "Password must contain a lowercase letter";
            } else if (!/[0-9]/.test(passwordData.newPassword)) {
                errors.newPassword = "Password must contain a number";
            }
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = "Please confirm your new password";
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordChange = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (!validatePassword()) {
            return;
        }

        setChangingPassword(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                setPasswordSuccess("Password changed successfully!");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setValidationErrors({});
                setTimeout(() => setPasswordSuccess(""), 5000);
            } else {
                setPasswordError(data.message || "Failed to change password");
            }
        } catch (error) {
            setPasswordError("Error changing password. Please try again.");
        } finally {
            setChangingPassword(false);
        }
    };

    const handleChangePhoto = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setPhotoError("File size must be less than 5MB");
            setTimeout(() => setPhotoError(""), 5000);
            return;
        }

        if (!file.type.startsWith('image/')) {
            setPhotoError("Please select an image file");
            setTimeout(() => setPhotoError(""), 5000);
            return;
        }

        setPhotoError("");
        setPhotoSuccess("");
        setUploadingPhoto(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
        setSelectedFile(file);

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/upload-profile-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setPhotoSuccess("Profile photo updated successfully!");

                const updatedUser = {
                    ...user,
                    profileImage: data.imagePath
                };

                setUser(updatedUser);
                setOriginalUser(updatedUser);

                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser) {
                    storedUser.profileImage = data.imagePath;
                    localStorage.setItem('user', JSON.stringify(storedUser));
                    localStorage.setItem('profileImage', data.imagePath);
                }

                setPreviewUrl(data.imagePath);
                window.dispatchEvent(new Event('storage'));
                setTimeout(() => setPhotoSuccess(""), 5000);
            } else {
                setPhotoError(data.message || "Failed to upload photo");
                setTimeout(() => setPhotoError(""), 5000);
            }
        } catch (error) {
            console.error("Upload error:", error);
            setPhotoError("Failed to upload photo. Please try again.");
            setTimeout(() => setPhotoError(""), 5000);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleFileInputClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading profile...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFF]">
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <Icon icon="iconamoon:profile-fill" className="w-8 h-8 text-[#0E4B5E]" />
                        <h1 className="text-2xl font-semibold text-[#262D31]">System Admin Profile</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your account information and preferences
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow border">
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-2 border-blue-500 overflow-hidden bg-gray-200 flex items-center justify-center">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-medium text-gray-500">
                                            {originalUser.firstName?.charAt(0)}{originalUser.lastName?.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-700">
                                    {originalUser.firstName}
                                </h2>
                                <p className="text-sm text-gray-500">System Admin</p>
                            </div>
                        </div>
                        <button
                            onClick={handleChangePhoto}
                            disabled={uploadingPhoto}
                            className="text-sm px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {uploadingPhoto ? "Uploading..." : "Change photo"}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            onClick={handleFileInputClick}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {photoError && (
                        <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{photoError}</div>
                    )}
                    {photoSuccess && (
                        <div className="mx-6 mt-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{photoSuccess}</div>
                    )}

                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            Personal Information <span className="text-red-500 text-sm">*</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}>
                                    <legend className="text-sm px-2 text-gray-600">First Name <span className="text-red-500">*</span></legend>
                                    <input
                                        type="text"
                                        value={user.firstName}
                                        onChange={(e) => {
                                            setUser({ ...user, firstName: e.target.value });
                                            if (validationErrors.firstName) {
                                                setValidationErrors({ ...validationErrors, firstName: null });
                                            }
                                        }}
                                        disabled={!isEditing}
                                        className="w-full bg-transparent outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        required
                                    />
                                </fieldset>
                                {validationErrors.firstName && <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>}
                            </div>

                            <div>
                                <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}>
                                    <legend className="text-sm px-2 text-gray-600">Last Name <span className="text-red-500">*</span></legend>
                                    <input
                                        type="text"
                                        value={user.lastName}
                                        onChange={(e) => {
                                            setUser({ ...user, lastName: e.target.value });
                                            if (validationErrors.lastName) {
                                                setValidationErrors({ ...validationErrors, lastName: null });
                                            }
                                        }}
                                        disabled={!isEditing}
                                        className="w-full bg-transparent outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        required
                                    />
                                </fieldset>
                                {validationErrors.lastName && <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}>
                                    <legend className="text-sm px-2 text-gray-600">Contact Number <span className="text-red-500">*</span></legend>
                                    <input
                                        type="text"
                                        value={user.phoneNumber}
                                        onChange={(e) => {
                                            setUser({ ...user, phoneNumber: e.target.value });
                                            if (validationErrors.phoneNumber) {
                                                setValidationErrors({ ...validationErrors, phoneNumber: null });
                                            }
                                        }}
                                        disabled={!isEditing}
                                        className="w-full bg-transparent outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        required
                                    />
                                </fieldset>
                                {validationErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.phoneNumber}</p>}
                            </div>

                            <div>
                                <fieldset className="border-2 border-gray-300 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA]">
                                    <legend className="text-sm px-2 text-gray-600">Email</legend>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled={true}
                                        className="w-full bg-transparent outline-none text-sm text-gray-500 cursor-not-allowed"
                                    />
                                </fieldset>
                            </div>
                        </div>

                        <div className="border-t pt-6 mt-2">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Change Password</h3>

                            {passwordError && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{passwordError}</div>
                            )}

                            {passwordSuccess && (
                                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{passwordSuccess}</div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}>
                                        <legend className="text-sm px-2 text-gray-600">Current Password <span className="text-red-500">*</span></legend>
                                        <div className="flex items-center">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => {
                                                    setPasswordData({ ...passwordData, currentPassword: e.target.value });
                                                    if (validationErrors.currentPassword) {
                                                        setValidationErrors({ ...validationErrors, currentPassword: null });
                                                    }
                                                }}
                                                disabled={!isEditing}
                                                className="w-full bg-transparent outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                disabled={!isEditing}
                                                className="ml-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                            >
                                                <Icon icon={showCurrentPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </fieldset>
                                    {validationErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.currentPassword}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`}>
                                        <legend className="text-sm px-2 text-gray-600">New Password <span className="text-red-500">*</span></legend>
                                        <div className="flex items-center">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => {
                                                    setPasswordData({ ...passwordData, newPassword: e.target.value });
                                                    if (validationErrors.newPassword) {
                                                        setValidationErrors({ ...validationErrors, newPassword: null });
                                                    }
                                                }}
                                                disabled={!isEditing}
                                                className="w-full bg-transparent outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                disabled={!isEditing}
                                                className="ml-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                            >
                                                <Icon icon={showNewPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </fieldset>
                                    {validationErrors.newPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.newPassword}</p>}
                                </div>

                                <div>
                                    <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}>
                                        <legend className="text-sm px-2 text-gray-600">Confirm New Password <span className="text-red-500">*</span></legend>
                                        <div className="flex items-center">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => {
                                                    setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                                                    if (validationErrors.confirmPassword) {
                                                        setValidationErrors({ ...validationErrors, confirmPassword: null });
                                                    }
                                                }}
                                                disabled={!isEditing}
                                                className="w-full bg-transparent outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                disabled={!isEditing}
                                                className="ml-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                            >
                                                <Icon icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </fieldset>
                                    {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end mb-6">
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={changingPassword}
                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {changingPassword ? "Changing..." : "Update Password"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-4">
                            {isEditing && (
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}