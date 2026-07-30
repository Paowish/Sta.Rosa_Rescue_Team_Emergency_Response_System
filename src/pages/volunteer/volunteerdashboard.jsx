// src/pages/volunteer/notifs.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import NotificationBell from "../../components/layout/NotificationBell";
import io from 'socket.io-client';
import { incidentService, authService } from "../../services/api";


// Import Leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Notifs() {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [open, setOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mapView, setMapView] = useState('map');
    const [imageError, setImageError] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDispatchCard, setShowDispatchCard] = useState(false);
    const [dispatchAction, setDispatchAction] = useState(null);
    const [showOffDutyCard, setShowOffDutyCard] = useState(false);
    const [isOnDuty, setIsOnDuty] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
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
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isEditingLocal, setIsEditingLocal] = useState(false);

    const navigate = useNavigate();
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const markersRef = useRef([]);
    const isMapInitialized = useRef(false);
    const socketRef = useRef(null);
    const audioRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");


    // Get current user ID
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;

    // Add this to verify user is authenticated
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token || !user.id) {
            navigate('/login');
            return;
        }

        // Verify token is valid for this user
        const verifyUser = async () => {
            try {
                const response = await authService.getCurrentUser();
                if (!response.success || response.data.id !== user.id) {
                    navigate('/login');
                }
            } catch (error) {
                navigate('/login');
            }
        };
        verifyUser();
    }, [navigate]);

    // Helper function to get user role with proper capitalization
    const getUserRole = () => {
        const role = localStorage.getItem('userRole');
        if (role) {
            return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        }
        return 'Volunteer';
    };

    const loadUserData = () => {
        const user = localStorage.getItem('user');
        console.log("Loading user data from localStorage:", user);

        if (user) {
            try {
                const userData = JSON.parse(user);
                setUserName(`${userData.firstName} ${userData.lastName}`);

                if (userData.profileImage && userData.profileImage !== "") {
                    if (userData.profileImage.startsWith('http')) {
                        setProfileImage(userData.profileImage);
                    } else {
                        setProfileImage(`http://localhost:5000/${userData.profileImage}`);
                    }
                } else {
                    setProfileImage("");
                }
            } catch (e) {
                console.error("Error parsing user data:", e);
                setUserName("Volunteer");
                setProfileImage("");
            }
        }
    };

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

            const response = await authService.getCurrentUser();
            if (response.success) {
                const userData = {
                    firstName: response.data.firstName || storedUser?.firstName || "",
                    lastName: response.data.lastName || storedUser?.lastName || "",
                    phoneNumber: response.data.phoneNumber || storedUser?.phoneNumber || "",
                    email: response.data.email || storedUser?.email || "",
                    profileImage: response.data.profileImage || storedImage || ""
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
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const storedImage = storedUser?.profileImage || localStorage.getItem('profileImage') || "";

            if (storedImage) {
                const imageUrl = storedImage.startsWith('http')
                    ? storedImage
                    : `http://localhost:5000/${storedImage}`;
                setPreviewUrl(imageUrl);
            }

            if (storedUser) {
                setOriginalUser(storedUser);
                setUser(storedUser);
            }
        }
    };

    const validateProfile = () => {
        const errors = {};

        if (!user.firstName.trim()) {
            errors.firstName = "First name is required";
        } else if (user.firstName.trim().length < 2) {
            errors.firstName = "First name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s\-']+$/.test(user.firstName.trim())) {
            errors.firstName = "First name can only contain letters, spaces, hyphens, and apostrophes";
        }

        if (!user.lastName.trim()) {
            errors.lastName = "Last name is required";
        } else if (user.lastName.trim().length < 2) {
            errors.lastName = "Last name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s\-']+$/.test(user.lastName.trim())) {
            errors.lastName = "Last name can only contain letters, spaces, hyphens, and apostrophes";
        }

        if (!user.phoneNumber.trim()) {
            errors.phoneNumber = "Contact number is required";
        } else {
            const phoneDigits = user.phoneNumber.replace(/\D/g, '');
            if (phoneDigits.length < 10 || phoneDigits.length > 11) {
                errors.phoneNumber = "Please enter a valid phone number (10-11 digits)";
            }
            if (!phoneDigits.startsWith('09') && !phoneDigits.startsWith('63')) {
                errors.phoneNumber = "Phone number must start with 09 or 63";
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCancelLocal = () => {
        setUser({ ...originalUser });
        setIsEditingLocal(false);
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
        setShowEditProfile(false);
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
            setIsEditingLocal(false);
            setShowEditProfile(false);
            return;
        }

        setSaving(true);
        try {
            const response = await authService.updateProfile({
                firstName: user.firstName.trim(),
                lastName: user.lastName.trim(),
                phoneNumber: user.phoneNumber.trim()
            });

            if (response.success) {
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
                setIsEditingLocal(false);
                setValidationErrors({});
                setShowEditProfile(false);
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
            if (passwordData.newPassword.length < 12) {
                errors.newPassword = "Password must be at least 12 characters";
            } else if (!/[A-Z]/.test(passwordData.newPassword)) {
                errors.newPassword = "Password must contain an uppercase letter";
            } else if (!/[a-z]/.test(passwordData.newPassword)) {
                errors.newPassword = "Password must contain a lowercase letter";
            } else if (!/[0-9]/.test(passwordData.newPassword)) {
                errors.newPassword = "Password must contain a number";
            } else if (!/[^A-Za-z0-9]/.test(passwordData.newPassword)) {
                errors.newPassword = "Password must contain a special character (!@#$%^&*)";
            } else if (/(.)\1{2,}/.test(passwordData.newPassword)) {
                errors.newPassword = "Password cannot contain repeated characters (e.g., '111', 'aaa')";
            } else if (passwordData.newPassword === passwordData.currentPassword) {
                errors.newPassword = "New password must be different from current password";
            }

            const commonPasswords = [
                'Password123!', 'Admin@2024', 'Welcome123!', 'Rescue@123', 'Password@123',
                'Admin@123', 'User@123', 'Test@123', 'Qwerty123!', 'Abc123!@#',
                '1234567890!', 'P@ssw0rd123', 'ChangeMe123!', 'Temp@123456'
            ];
            if (commonPasswords.includes(passwordData.newPassword)) {
                errors.newPassword = "Password is too common. Please choose a stronger password";
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

    const loadIncidents = async () => {
        try {
            setLoading(true);

            // Get current user
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const currentUserId = currentUser.id || currentUser._id;
            console.log('🔵 Current User ID:', currentUserId);

            const response = await incidentService.getAllIncidents();
            console.log('📋 All incidents:', response);

            if (response.success) {
                // ✅ STRICT FILTERING - Only show incidents where this user is explicitly assigned
                const userIncidents = response.data.filter(incident => {
                    // Check various ways a user could be assigned
                    const isAssigned =
                        // Check if user is in assignedTo array (common format)
                        (incident.assignedTo && Array.isArray(incident.assignedTo) &&
                            incident.assignedTo.some(assigned => {
                                // Handle different formats
                                if (typeof assigned === 'string') {
                                    return assigned === currentUserId || assigned === currentUser._id;
                                }
                                if (typeof assigned === 'object') {
                                    return assigned.responder === currentUserId ||
                                        assigned.responder === currentUser._id ||
                                        assigned.id === currentUserId ||
                                        assigned.id === currentUser._id;
                                }
                                return false;
                            })) ||
                        // Check if volunteerId matches (older format)
                        incident.volunteerId === currentUserId ||
                        incident.volunteerId === currentUser._id ||
                        // Check if responderId matches
                        incident.responderId === currentUserId ||
                        incident.responderId === currentUser._id ||
                        // Check if reportedBy matches (if they reported it)
                        incident.reportedBy === currentUserId ||
                        incident.reportedBy === currentUser._id ||
                        incident.reporterId === currentUserId ||
                        incident.reporterId === currentUser._id;

                    console.log(`🔍 Incident ${incident._id}: isAssigned = ${isAssigned}`);
                    return isAssigned;
                });

                console.log(`✅ Filtered to ${userIncidents.length} incidents for user ${currentUserId}`);

                const formattedIncidents = userIncidents.map(incident => {
                    const lat = incident.location?.coordinates?.latitude || incident.location?.coordinates?.lat || 15.428991;
                    const lng = incident.location?.coordinates?.longitude || incident.location?.coordinates?.lng || 120.938698;

                    return {
                        id: incident.incidentId || incident._id,
                        _id: incident._id,
                        title: incident.type || 'Untitled Incident',
                        location: incident.location?.address || 'Unknown location',
                        shortLocation: incident.location?.address?.split(',')[0] || 'Unknown',
                        date: new Date(incident.reportedAt || incident.createdAt).toLocaleString(),
                        status: incident.status?.toLowerCase() || 'pending',
                        priority: incident.severity || 'Medium',
                        borderColor: incident.status === 'Dispatched' ? 'border-purple-500' :
                            incident.status === 'Active' ? 'border-red-500' :
                                incident.status === 'Resolved' ? 'border-green-500' :
                                    'border-yellow-500',
                        badge: incident.status === 'Dispatched' ? 'Dispatch' :
                            incident.status === 'Active' ? 'Active' :
                                incident.status === 'Resolved' ? 'Resolved' : 'Pending',
                        badgeColor: incident.status === 'Dispatched' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            incident.status === 'Active' ? 'bg-red-100 text-red-700 border-red-200' :
                                incident.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                                    'bg-yellow-100 text-yellow-700 border-yellow-200',
                        description: incident.description || 'No description provided',
                        reporter: incident.reporterName || 'Anonymous',
                        reporterPhone: incident.reporterNumber || 'N/A',
                        coordinates: [parseFloat(lat), parseFloat(lng)],
                        victims: incident.victimsAffected || 0,
                        image: incident.image || null,
                        dispatchNotes: incident.dispatchNotes || null,
                        assignedTo: incident.assignedTo || []
                    };
                });
                setIncidents(formattedIncidents);
            }
        } catch (error) {
            console.error('Failed to load incidents:', error);
        } finally {
            setLoading(false);
        }
    };

    const setupSocketConnection = () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (token && user.id) {
                socketRef.current = io('http://localhost:5000', {
                    auth: { token },
                    transports: ['websocket', 'polling']
                });

                socketRef.current.on('connect', () => {
                    console.log('✅ Volunteer socket connected');
                    socketRef.current.emit('join', user.id);
                    socketRef.current.emit('join-room', 'volunteers');
                });

                socketRef.current.on('new_notification', (notification) => {
                    console.log('📢 Received notification:', notification);

                    if (notification.type === 'response_assignment') {
                        showDispatchNotification(notification);
                        loadIncidents();
                    }

                    showNotification(notification);
                });

                socketRef.current.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                });
            }
        } catch (error) {
            console.error("Failed to setup socket:", error);
        }
    };

    const showNotification = (notification) => {
        setNotification(notification);
        setShowNotificationPopup(true);

        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }

        setTimeout(() => {
            setShowNotificationPopup(false);
        }, 6000);
    };

    const showDispatchNotification = (notification) => {
        if (audioRef.current) {
            audioRef.current.src = '/dispatch-sound.mp3';
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
            setTimeout(() => {
                audioRef.current.src = '/notification-sound.mp3';
            }, 1000);
        }
    };

    useEffect(() => {
        loadUserData();
        loadIncidents();
        loadUserProfile();
        setupSocketConnection();

        audioRef.current = new Audio('/notification-sound.mp3');

        const handleStorageChange = () => {
            loadUserData();
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        setIsLoggingOut(true);

        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            localStorage.removeItem('profileImage');
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            navigate('/login');
        }, 2000);
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    // Replace your stats with this
    const stats = {
        allIncidents: incidents.length,
        active: incidents.filter(i => i.status === 'active' || i.status === 'dispatched').length,
        pending: incidents.filter(i => i.status === 'pending').length,
        solved: incidents.filter(i => i.status === 'resolved' || i.status === 'accepted').length
    };

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || isMapInitialized.current) return;

        const container = mapContainerRef.current;
        if (container.clientHeight === 0) {
            container.style.height = '500px';
        }

        const map = L.map(container, {
            center: [15.428991, 120.938698],
            zoom: 14,
            zoomControl: false,
            fadeAnimation: true,
            attributionControl: true,
        });

        L.control.zoom({
            position: 'topright'
        }).addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            subdomains: ['a', 'b', 'c'],
        }).addTo(map);

        mapRef.current = map;
        isMapInitialized.current = true;

        setTimeout(() => {
            if (incidents.length > 0) {
                updateMarkers(map);
            }
        }, 200);

        const handleResize = () => {
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize();
                }
            }, 200);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                isMapInitialized.current = false;
            }
        };
    }, []);

    useEffect(() => {
        if (mapRef.current && isMapInitialized.current) {
            updateMarkers(mapRef.current);
        }
    }, [incidents, selectedIncident]);

    useEffect(() => {
        if (!mapRef.current || !isMapInitialized.current) return;

        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                mapRef.current.removeLayer(layer);
            }
        });

        let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

        if (mapView === 'satellite') {
            tileUrl = 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
            attribution = '&copy; <a href="https://www.google.com/maps">Google</a>';
        }

        L.tileLayer(tileUrl, {
            attribution: attribution,
            maxZoom: 19,
            subdomains: ['a', 'b', 'c'],
        }).addTo(mapRef.current);

        updateMarkers(mapRef.current);
    }, [mapView]);

    const updateMarkers = (map) => {
        markersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];

        incidents.forEach((incident) => {
            if (!incident.coordinates) return;

            const isSelected = selectedIncident?.id === incident.id;
            let markerColor = '#3b82f6';
            if (incident.status === 'active' || incident.status === 'dispatched') markerColor = '#ef4444';
            if (incident.status === 'pending') markerColor = '#eab308';
            if (incident.status === 'resolved' || incident.status === 'accepted') markerColor = '#22c55e';

            const icon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div style="
                        background-color: ${isSelected ? '#2563eb' : markerColor};
                        width: ${isSelected ? '36px' : '32px'};
                        height: ${isSelected ? '36px' : '32px'};
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: ${isSelected ? '14px' : '12px'};
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        ${incident.id?.replace('RES-', '').replace('INC-', '') || '?'}
                    </div>
                `,
                iconSize: [isSelected ? 36 : 32, isSelected ? 36 : 32],
                iconAnchor: [isSelected ? 18 : 16, isSelected ? 18 : 16],
                popupAnchor: [0, -20],
            });

            const marker = L.marker(incident.coordinates, { icon })
                .addTo(map)
                .bindPopup(`
                    <div style="padding: 8px; min-width: 200px;">
                        <h4 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${incident.title}</h4>
                        <p style="font-size: 12px; color: #666; margin-bottom: 4px;">
                            <span style="font-weight: 600;">Location:</span> ${incident.shortLocation}
                        </p>
                        <p style="font-size: 12px; color: #666; margin-bottom: 8px;">
                            <span style="font-weight: 600;">Status:</span> 
                            <span style="color: ${incident.status === 'active' || incident.status === 'dispatched' ? '#ef4444' : incident.status === 'pending' ? '#eab308' : '#22c55e'};">
                                ${incident.status?.charAt(0).toUpperCase() + incident.status?.slice(1) || 'Unknown'}
                            </span>
                        </p>
                        <button 
                            onclick="window.handleMarkerClick('${incident.id}')"
                            style="
                                background-color: #3b82f6;
                                color: white;
                                border: none;
                                padding: 4px 12px;
                                border-radius: 4px;
                                font-size: 12px;
                                cursor: pointer;
                            "
                        >
                            View Details
                        </button>
                    </div>
                `);

            marker.on('click', () => {
                const incident = incidents.find(inc => inc.id === marker.id);
                if (incident) {
                    handleIncidentClick(incident);
                }
            });

            markersRef.current.push(marker);
        });

        if (markersRef.current.length > 0) {
            const group = L.featureGroup(markersRef.current);
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    };

    useEffect(() => {
        window.handleMarkerClick = (incidentId) => {
            const incident = incidents.find(inc => inc.id === incidentId);
            if (incident) {
                handleIncidentClick(incident);
            }
        };

        return () => {
            delete window.handleMarkerClick;
        };
    }, [incidents]);

    const handleIncidentClick = (incident) => {
        console.log("🔵 Incident clicked:", incident);
        setSelectedIncident(incident);
        setImageError(false);
        setIsRightSidebarOpen(true);
        setShowDispatchCard(false);
        setDispatchAction(null);
        setShowEditProfile(false);

        if (mapRef.current && incident.coordinates) {
            mapRef.current.flyTo(incident.coordinates, 16, {
                duration: 1.5,
            });
        }
    };

    const handleCloseRightSidebar = () => {
        setIsRightSidebarOpen(false);
        setSelectedIncident(null);
        setImageError(false);
        setShowDispatchCard(false);
        setDispatchAction(null);
        setShowEditProfile(false);

        if (mapRef.current && markersRef.current.length > 0) {
            const group = L.featureGroup(markersRef.current);
            mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    };

    const handleVolunteerToRespond = () => {
        setShowDispatchCard(true);
        setDispatchAction('respond');
    };

    const handleAccept = () => {
        if (selectedIncident) {
            setShowDispatchCard(true);
            setDispatchAction('accept');
        }
    };

    const handleDecline = () => {
        if (selectedIncident) {
            setShowDispatchCard(true);
            setDispatchAction('decline');
        }
    };

    const handleConfirmAccept = async () => {
        if (selectedIncident) {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                const response = await fetch(`/api/incidents/${selectedIncident._id || selectedIncident.id}/accept`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ volunteerId: user.id })
                });
                const data = await response.json();
                if (data.success) {
                    alert(`✅ You accepted ${selectedIncident.title} (${selectedIncident.id})`);
                    loadIncidents();
                    handleCloseRightSidebar();
                } else {
                    alert('Failed to accept: ' + data.message);
                }
            } catch (error) {
                console.error('Accept error:', error);
                alert('Failed to accept dispatch');
            } finally {
                setIsLoading(false);
                setShowDispatchCard(false);
                setDispatchAction(null);
            }
        }
    };

    const handleConfirmDecline = async () => {
        if (selectedIncident) {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                const response = await fetch(`/api/incidents/${selectedIncident._id || selectedIncident.id}/decline`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ volunteerId: user.id })
                });
                const data = await response.json();
                if (data.success) {
                    alert(`❌ You declined ${selectedIncident.title} (${selectedIncident.id})`);
                    loadIncidents();
                    handleCloseRightSidebar();
                } else {
                    alert('Failed to decline: ' + data.message);
                }
            } catch (error) {
                console.error('Decline error:', error);
                alert('Failed to decline dispatch');
            } finally {
                setIsLoading(false);
                setShowDispatchCard(false);
                setDispatchAction(null);
            }
        }
    };

    const handleCancelDispatch = () => {
        setShowDispatchCard(false);
        setDispatchAction(null);
    };

    const handleToggleDuty = (checked) => {
        if (!checked) {
            setShowOffDutyCard(true);
        } else {
            setIsOnDuty(true);
            alert('✅ You are now back on duty!');
        }
    };

    const handleConfirmOffDuty = () => {
        setIsOnDuty(false);
        setShowOffDutyCard(false);
        alert('🟡 You are now off duty. You will not receive new dispatch requests.');
    };

    const handleCancelOffDuty = () => {
        setShowOffDutyCard(false);
    };

    const handleViewOnMap = () => {
        if (selectedIncident && mapRef.current && selectedIncident.coordinates) {
            mapRef.current.flyTo(selectedIncident.coordinates, 18, {
                duration: 1.5,
            });
        }
    };

    const handleEditProfile = () => {
        setShowEditProfile(true);
        setSelectedIncident(null);
        setIsRightSidebarOpen(false);
        setIsEditingLocal(true);
    };

    const getFilteredIncidents = () => {
        let filtered = incidents;

        if (searchTerm) {
            filtered = filtered.filter(inc =>
                inc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inc.shortLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inc.id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterType === 'requests') {
            filtered = filtered.filter(inc => inc.status === 'dispatched' || inc.badge === 'Dispatch');
        }

        return filtered;
    };

    const filteredIncidents = getFilteredIncidents();

    const zoomIn = () => {
        if (mapRef.current) {
            mapRef.current.zoomIn();
        }
    };

    const zoomOut = () => {
        if (mapRef.current) {
            mapRef.current.zoomOut();
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'bg-red-600 text-white';
            case 'High': return 'bg-orange-500 text-white';
            case 'Medium': return 'bg-yellow-500 text-white';
            default: return 'bg-blue-500 text-white';
        }
    };

    // Logout Confirmation Modal
    const LogoutModal = () => {
        return (
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
        );
    };

    // Show full-screen spinner when logging out
    if (isLoggingOut) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
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

    // Dispatch Card Component (New Exact Design)
    const DispatchCard = () => {
        const isAccept = dispatchAction === 'accept';
        const isDecline = dispatchAction === 'decline';
        const isRespond = dispatchAction === 'respond';

        const title = isAccept ? 'Accept Dispatch Request' :
            isDecline ? 'Decline Dispatch Request' :
                'Volunteer to Respond';

        const confirmText = isAccept ? 'Yes, Accept' :
            isDecline ? 'Yes, Decline' :
                'Yes, Respond';

        const cancelText = 'Cancel';
        const confirmColor = isAccept ? 'bg-[#2e7d32] hover:bg-[#1b5e20]' :
            isDecline ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700';

        // Dynamic Question based on action
        const questionText = isAccept ? 'Are you sure you want to accept this dispatch request?' :
            isDecline ? 'Are you sure you want to decline this dispatch request?' :
                'Do you want to volunteer to respond to this incident?';

        return (
            <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/40 backdrop-blur-[2px]">
                <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-[95vw] p-6 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`w-7 h-7 ${isAccept ? 'text-[#2e7d32]' : isDecline ? 'text-red-600' : 'text-blue-500'}`}
                        >
                            {isAccept ? (
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                            ) : isDecline ? (
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                            ) : (
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                            )}
                        </svg>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                            {title}
                        </h2>
                        <button
                            onClick={handleCancelDispatch}
                            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {/* Description */}
                    {isAccept && (
                        <p className="text-[14px] text-gray-600 leading-relaxed mb-5">
                            Accepting this assignment means you will be officially dispatched as the responding volunteer. Your status will update to En Route immediately.
                        </p>
                    )}
                    {isDecline && (
                        <p className="text-[14px] text-gray-600 leading-relaxed mb-5">
                            Declining this assignment means the dispatch request will be passed to the next available volunteer.
                        </p>
                    )}

                    {/* Data Table */}
                    <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-200">
                                {/* Incident Row */}
                                <tr className="bg-[#f4f5fa]">
                                    <td className="px-4 py-3 text-gray-500 font-medium w-[30%] align-top">
                                        Incident
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 font-medium align-top">
                                        {selectedIncident?.title || 'N/A'}
                                    </td>
                                </tr>

                                {/* ID, Status, Priority Row */}
                                <tr className="bg-white">
                                    <td className="px-4 py-3 text-gray-500 font-medium align-top">
                                        Details
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 align-top space-y-1">
                                        <p className="font-medium">ID: <span className="font-normal text-gray-600">{selectedIncident?.id || 'N/A'}</span></p>
                                        <p className="font-medium">Status: <span className="font-normal text-gray-600 capitalize">{selectedIncident?.status || 'N/A'}</span></p>
                                        <p className="font-medium">Priority: <span className="font-normal text-gray-600">{selectedIncident?.priority || 'N/A'}</span></p>
                                    </td>
                                </tr>

                                {/* Location Row */}
                                <tr className="bg-[#f4f5fa]">
                                    <td className="px-4 py-3 text-gray-500 font-medium align-top">
                                        Location
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 align-top">
                                        <div className="font-medium mb-1">{selectedIncident?.location || 'Unknown location'}</div>
                                        {selectedIncident?.coordinates && (
                                            <div className="text-xs text-gray-500 font-normal">
                                                {selectedIncident.coordinates[0]}, {selectedIncident.coordinates[1]}
                                            </div>
                                        )}
                                    </td>
                                </tr>

                                {/* Impact Row */}
                                <tr className="bg-white">
                                    <td className="px-4 py-3 text-gray-500 font-medium align-top">
                                        Impact
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 font-medium align-top">
                                        <div>{selectedIncident?.victims || 0} victim(s) reported</div>
                                        {selectedIncident?.title?.toLowerCase().includes('fire') && (
                                            <div className="text-sm font-normal text-gray-600 mt-1">Fire</div>
                                        )}
                                        {selectedIncident?.description && (
                                            <div className="text-xs font-normal text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                                {selectedIncident.description}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Question and Buttons */}
                    <div className="flex flex-col items-end gap-4 mt-auto">
                        <p className="text-[15px] text-gray-700">
                            {questionText}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelDispatch}
                                className="px-6 py-2 bg-white border border-gray-300 rounded text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={isAccept ? handleConfirmAccept : isDecline ? handleConfirmDecline : handleAccept}
                                disabled={isLoading}
                                className={`px-8 py-2 border rounded text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 ${confirmColor}`}
                            >
                                {isLoading ? 'Processing...' : confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Off Duty Card Component
    const OffDutyCard = () => {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/30">
                <div className="bg-white rounded-lg shadow-2xl w-96 max-w-[90vw] p-0 flex flex-col">
                    <div className="p-4 border-b border-[#DFDFF0] flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Go Off Duty?</h3>
                        <button onClick={handleCancelOffDuty} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-center mb-4">
                            <Icon icon="material-symbols:bedtime" className="w-16 h-16 text-yellow-500" />
                        </div>
                        <p className="text-center text-gray-700 mb-2">You are about to go off duty.</p>
                        <p className="text-center text-sm text-gray-500">You will stop receiving new dispatch requests and notifications until you return to duty.</p>
                    </div>
                    <div className="p-4 border-t border-[#DFDFF0] flex gap-3">
                        <button onClick={handleCancelOffDuty} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                        <button onClick={handleConfirmOffDuty} className="flex-1 py-2.5 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition">Go Off Duty</button>
                    </div>
                </div>
            </div>
        );
    };

    // Edit Profile Form - Full Page
    const EditProfileForm = () => {
        return (
            <div className="bg-white rounded-lg shadow border p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <h1 className="text-3xl font-bold text-gray-700">User Account</h1>
                    </div>
                    <p className="text-sm text-gray-500">
                        Manage your account information and preferences
                    </p>
                </div>

                <div className="bg-white rounded-lg border">
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
                                    {originalUser.firstName} {originalUser.lastName}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {getUserRole()}
                                </p>
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
                                        disabled={!isEditingLocal}
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
                                        disabled={!isEditingLocal}
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
                                        disabled={!isEditingLocal}
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
                                                disabled={!isEditingLocal}
                                                className="w-full bg-transparent outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                disabled={!isEditingLocal}
                                                className="ml-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {showCurrentPassword ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M12 9v3m0 0v3m0-3h3m-3 0H9" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    )}
                                                </svg>
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
                                                disabled={!isEditingLocal}
                                                className="w-full bg-transparent outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                disabled={!isEditingLocal}
                                                className="ml-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {showNewPassword ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M12 9v3m0 0v3m0-3h3m-3 0H9" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    )}
                                                </svg>
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
                                                disabled={!isEditingLocal}
                                                className="w-full bg-transparent outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                disabled={!isEditingLocal}
                                                className="ml-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {showConfirmPassword ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M12 9v3m0 0v3m0-3h3m-3 0H9" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    )}
                                                </svg>
                                            </button>
                                        </div>
                                    </fieldset>
                                    {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>}
                                </div>
                            </div>

                            {isEditingLocal && (
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
                            {isEditingLocal && (
                                <button
                                    onClick={handleCancelLocal}
                                    className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            {!isEditingLocal ? (
                                <button
                                    onClick={() => setIsEditingLocal(true)}
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
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAFF] flex flex-col">

            {/* Logout Confirmation Modal */}
            {showLogoutModal && <LogoutModal />}

            {/* NAVBAR */}
            <div className="h-16 bg-[#0F5C73] flex items-center justify-between px-4 text-white fixed top-0 left-0 right-0 z-[100]">
                <div className="flex items-center gap-3">
                    <button onClick={() => setOpen(true)} className="block lg:hidden text-2xl">☰</button>
                    <img src="/logo.png" className="w-10 h-10" alt="logo" />
                    <div className="hidden sm:block">
                        <h1 className="font-semibold text-sm md:text-base">Volunteer</h1>
                        <p className="text-[10px] md:text-xs opacity-70">Municipality of Santa Rosa</p>
                    </div>
                </div>
                <NotificationBell />
            </div>

            {/* Notification Popup */}
            {showNotificationPopup && notification && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in max-w-sm">
                    <div className={`rounded-lg shadow-lg p-4 ${notification.type === 'response_assignment' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">{notification.type === 'response_assignment' ? '🚨' : '📢'}</div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">{notification.title || 'New Notification'}</h4>
                                <p className="text-xs opacity-90 mt-1">{notification.message}</p>
                                <p className="text-xs opacity-75 mt-1">Just now</p>
                            </div>
                            <button onClick={() => setShowNotificationPopup(false)} className="text-white opacity-75 hover:opacity-100">✕</button>
                        </div>
                    </div>
                </div>
            )}

            {/* BODY */}
            <div className="flex flex-1 mt-16 relative overflow-hidden">

                {open && (
                    <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
                )}

                {/* LEFT SIDEBAR */}
                <div className={`
                    fixed lg:static top-16 left-0 h-[calc(100vh-64px)] w-72 lg:w-[329px] bg-[#F5F4FF] 
                    flex flex-col z-[60] overflow-hidden
                    transform transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                    border-r border-gray-200
                `}>
                    <div className="flex-1 p-4 lg:p-5 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-3 mb-4 lg:mb-6 flex-shrink-0">
                            <div className="w-12 h-12 lg:w-[73px] lg:h-[71px] rounded-full border-2 border-blue-500 overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const parent = e.target.parentElement;
                                            const icon = document.createElement('div');
                                            icon.innerHTML = '<svg class="w-6 h-6 lg:w-[62px] lg:h-[62px] text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                                            parent.appendChild(icon);
                                        }}
                                    />
                                ) : (
                                    <svg className="w-6 h-6 lg:w-[62px] lg:h-[62px] text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{getUserRole()}</p>
                                <p className="text-sm font-medium text-gray-700">{userName || "Volunteer"}</p>
                            </div>
                        </div>

                        {/* On Duty Section with Toggle */}
                        <div className="bg-[#E9F5FE] rounded-lg p-2 lg:p-3 mb-3 flex-shrink-0 relative">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${isOnDuty ? 'text-[#157A3B]' : 'text-gray-400'}`}>
                                        {isOnDuty ? 'On Duty' : 'Off Duty'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${isOnDuty ? 'text-green-600' : 'text-gray-400'}`}>
                                        {isOnDuty ? 'Available' : 'Unavailable'}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isOnDuty}
                                            onChange={(e) => handleToggleDuty(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Edit Profile Button */}
                        <button
                            onClick={handleEditProfile}
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mb-3 border border-blue-200"
                        >
                            <Icon icon="material-symbols:edit" className="w-4 h-4" />
                            Edit Profile
                        </button>

                        <div className="relative mb-3 lg:mb-4 flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Search type, location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-[#D3D2DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                            <Icon icon="material-symbols:search" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[#5D7285] w-4 h-4" />
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Filter Tabs */}
                            {/* Filter Tabs */}
                            <div className="flex items-center justify-center gap-2 mb-3 flex-shrink-0">
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterType === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All Incidents
                                </button>
                                <button
                                    onClick={() => setFilterType('requests')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterType === 'requests'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Requests
                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full">
                                        {incidents.filter(i => i.status === 'dispatched' || i.badge === 'Dispatch').length}
                                    </span>
                                </button>
                            </div>

                            {/* Incident List */}
                            <div className="flex-1 overflow-y-auto space-y-2 lg:space-y-3 pr-1">
                                {filteredIncidents.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Icon icon="material-symbols:search-off" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No incidents found</p>
                                    </div>
                                ) : (
                                    filteredIncidents.map((incident) => (
                                        <div
                                            key={incident.id}
                                            className={`bg-white rounded-lg p-3 lg:p-4 hover:shadow-md transition-all cursor-pointer border-l-4 ${incident.borderColor} shadow-sm flex-shrink-0 ${selectedIncident?.id === incident.id ? 'ring-2 ring-blue-500' : ''
                                                }`}
                                            onClick={() => handleIncidentClick(incident)}
                                        >
                                            <h4 className="font-medium text-gray-800 text-sm lg:text-base">{incident.title}</h4>
                                            <p className="text-xs lg:text-sm text-gray-500 flex items-center gap-1">
                                                <Icon icon="material-symbols:location-on" className="w-3 h-3 lg:w-4 lg:h-4" />
                                                {incident.shortLocation}
                                            </p>
                                            <p className="text-[10px] lg:text-xs text-gray-400 flex items-center gap-1">
                                                <Icon icon="material-symbols:schedule" className="w-3 h-3 lg:w-4 lg:h-4" />
                                                {incident.date}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 text-[10px] rounded-full ${getPriorityColor(incident.priority)}`}>
                                                    {incident.priority}
                                                </span>
                                                {incident.badge && (
                                                    <span className={`px-2 py-0.5 text-[10px] rounded-full border ${incident.badgeColor}`}>
                                                        {incident.badge}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Logout Button - Mobile */}
                            <div className="lg:hidden mt-4 pt-3 border-t border-gray-200 flex-shrink-0">
                                <button onClick={handleLogoutClick} className="text-gray-500 text-sm hover:text-red-600 flex items-center gap-2 w-full">
                                    <Icon icon="material-symbols:logout" className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* Logout Button - Desktop */}
                        <div className="hidden lg:block flex-shrink-0 p-4 lg:p-5 border-t border-gray-200 bg-[#F5F4FF]">
                            <button onClick={handleLogoutClick} className="text-gray-500 text-sm hover:text-red-600 flex items-center gap-2 w-full">
                                <Icon icon="material-symbols:logout" className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 bg-[#EEF2F6] overflow-y-auto p-3 md:p-4 lg:p-6">
                    {/* Cards */}
                    {showDispatchCard && <DispatchCard />}
                    {showOffDutyCard && <OffDutyCard />}

                    {showEditProfile ? (
                        <EditProfileForm />
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                                <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                                    <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.allIncidents}</p>
                                    <p className="text-[10px] md:text-sm text-gray-500">All Incidents</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                                    <p className="text-xl md:text-2xl font-bold text-red-600">{stats.active}</p>
                                    <p className="text-[10px] md:text-sm text-gray-500">Active</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                                    <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                    <p className="text-[10px] md:text-sm text-gray-500">Pending</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                                    <p className="text-xl md:text-2xl font-bold text-green-600">{stats.solved}</p>
                                    <p className="text-[10px] md:text-sm text-gray-500">Solved</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                                {/* Map */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-800">Map</h3>
                                            <div className="flex gap-2">
                                                <button onClick={() => setMapView('map')} className={`px-3 py-1 rounded text-sm ${mapView === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Map</button>
                                                <button onClick={() => setMapView('satellite')} className={`px-3 py-1 rounded text-sm ${mapView === 'satellite' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Satellite</button>
                                            </div>
                                        </div>
                                        <div
                                            ref={mapContainerRef}
                                            className="w-full rounded-lg bg-gray-200 overflow-hidden"
                                            style={{ height: '500px', minHeight: '300px', position: 'relative', zIndex: 1 }}
                                        />
                                    </div>
                                </div>

                                {/* Right Sidebar - Incident Details */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-lg shadow-sm relative flex flex-col">
                                        {selectedIncident ? (
                                            <>
                                                <div className="sticky top-0 bg-white z-20 p-4 border-b relative rounded-t-lg flex-shrink-0">
                                                    <button onClick={handleCloseRightSidebar} className="absolute top-3 right-3 text-gray-400 text-xl hover:text-gray-600" aria-label="Close">✕</button>
                                                    <h2 className="font-semibold text-[#262D31] text-sm">Incident Details</h2>
                                                </div>
                                                <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                                                    <div className="px-4 py-3 border-b bg-[#F5F4FF]">
                                                        <div className="flex items-center flex-wrap gap-2">
                                                            <h1 className="text-lg font-bold text-[#262D31]">{selectedIncident.title}</h1>
                                                            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(selectedIncident.priority)}`}>{selectedIncident.priority}</span>
                                                            {selectedIncident.badge && (
                                                                <span className={`text-xs px-2 py-1 rounded-full border ${selectedIncident.badgeColor}`}>{selectedIncident.badge}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">ID: {selectedIncident.id}</p>
                                                    </div>
                                                    <div className="border-t border-[#DFDFF0]">
                                                        <div className="bg-[#EBEDFA] px-3 py-2 font-medium text-[#656363] text-sm">Incident Photo</div>
                                                        <div className="p-3">
                                                            {selectedIncident.image ? (
                                                                <img src={selectedIncident.image} alt={selectedIncident.title} className="rounded w-full h-40 object-cover border border-[#DFDFF0]" onError={() => setImageError(true)} />
                                                            ) : (
                                                                <div className="rounded w-full h-40 bg-gray-100 border border-[#DFDFF0] flex flex-col items-center justify-center">
                                                                    <Icon icon="mdi:image-off" width="32" className="text-gray-400" />
                                                                    <p className="text-xs text-gray-400 mt-2">No photo available</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-[#DFDFF0]">
                                                        <div className="bg-[#EBEDFA] px-3 py-2 font-medium text-[#656363] text-sm">Location</div>
                                                        <div className="px-3 py-3 space-y-2">
                                                            <div className="flex items-start gap-2">
                                                                <Icon icon="ic:outline-location-on" width="16" className="text-red-500 mt-0.5 flex-shrink-0" />
                                                                <span className="text-gray-700 text-sm flex-1">{selectedIncident.location}</span>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <Icon icon="material-symbols:my-location-outline" width="14" className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                                <span className="text-gray-400 text-xs flex-1">
                                                                    {selectedIncident.coordinates ? `${selectedIncident.coordinates[0]}, ${selectedIncident.coordinates[1]}` : "Coordinates not available"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-[#DFDFF0]">
                                                        <div className="bg-[#EBEDFA] px-3 py-2 font-medium text-[#656363] text-sm">Reporter</div>
                                                        <div className="divide-y divide-[#DFDFF0]">
                                                            <div className="flex px-3 py-2"><span className="text-gray-500 text-sm w-20 flex-shrink-0">Name</span><span className="font-semibold text-[#262D31] text-sm flex-1">{selectedIncident.reporter}</span></div>
                                                            <div className="flex px-3 py-2"><span className="text-gray-500 text-sm w-20 flex-shrink-0">Contact</span><span className="font-semibold text-[#262D31] text-sm flex-1">{selectedIncident.reporterPhone}</span></div>
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-[#DFDFF0]">
                                                        <div className="bg-[#EBEDFA] px-3 py-2 font-medium text-[#656363] text-sm">Description</div>
                                                        <p className="p-3 text-gray-600 text-sm leading-relaxed">{selectedIncident.description}</p>
                                                    </div>
                                                    <div className="border-t border-[#DFDFF0]">
                                                        <div className="bg-[#EBEDFA] px-3 py-2 font-medium text-[#656363] text-sm">Impact</div>
                                                        <div className="px-3 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <Icon icon="material-symbols:person" width="16" className="text-gray-500" />
                                                                <span className="text-gray-700 text-sm">{selectedIncident.victims} victim(s) reported</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {selectedIncident.dispatchNotes && (
                                                        <div className="border-t border-[#DFDFF0]">
                                                            <div className="bg-[#EBEDFA] px-3 py-2 font-medium text-[#656363] text-sm">Dispatch Notes</div>
                                                            <p className="p-3 text-gray-600 text-sm">{selectedIncident.dispatchNotes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="sticky bottom-0 bg-white z-20 p-3 border-t space-y-2 rounded-b-lg flex-shrink-0">
                                                    <button onClick={handleVolunteerToRespond} disabled={!isOnDuty} className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${isOnDuty ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                                                        <Icon icon="material-symbols:volunteer-activism" className="w-5 h-5" /> Volunteer to Respond
                                                    </button>
                                                    <div className="flex gap-2">
                                                        <button onClick={handleAccept} disabled={isLoading || selectedIncident.status === 'accepted' || selectedIncident.status === 'resolved' || !isOnDuty} className={`flex-1 py-2 rounded text-sm flex items-center justify-center gap-2 transition ${selectedIncident.status === 'accepted' || selectedIncident.status === 'resolved' || !isOnDuty ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                                                            <Icon icon="material-symbols:check" className="w-4 h-4" /> {selectedIncident.status === 'accepted' || selectedIncident.status === 'resolved' ? 'Accepted' : 'Accept'}
                                                        </button>
                                                        <button onClick={handleDecline} disabled={isLoading || selectedIncident.status === 'accepted' || selectedIncident.status === 'resolved' || !isOnDuty} className={`flex-1 py-2 rounded text-sm flex items-center justify-center gap-2 transition ${selectedIncident.status === 'accepted' || selectedIncident.status === 'resolved' || !isOnDuty ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                                                            <Icon icon="material-symbols:close" className="w-4 h-4" /> Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                                <Icon icon="material-symbols:location-off" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Incident Selected</h3>
                                                <p className="text-sm text-gray-500">Click any incident on the map or from the queue to view details and take action.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}