'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../components/providers/AdminAuthProvider";
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mail,
    Shield,
    Calendar,
    Clock,
    Edit2,
    Save,
    X,
    Eye,
    EyeOff,
    Key,
    LogOut,
    Trash2,
    ChevronRight,
    Check,
    AlertCircle
} from 'lucide-react';
import Image from "next/image";

export default function ProfilePage() {
    const { admin, isAuthenticated, loading, logout } = useAdminAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState({});
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Redirect if not authenticated
        if (!loading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        // Fetch user data if authenticated
        if (isAuthenticated && admin) {
            fetchUserData();
        }
    }, [isAuthenticated, loading, admin, router]);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);

            // Get the current user document
            const userDoc = doc(db, "admins", admin.id);
            const userSnapshot = await getDoc(userDoc);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setUserData({
                    ...userData,
                    id: userSnapshot.id,
                    createdAt: userData.createdAt?.toDate() || new Date(),
                    lastLogin: userData.lastLogin?.toDate() || new Date()
                });

                // Set email verification status
                setIsEmailVerified(userData.isEmailVerified || false);

                // Initialize form data
                setFormData({
                    username: userData.username || '',
                    email: userData.email || '',
                    password: '',
                    confirmPassword: '',
                });
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Failed to load profile data");
        } finally {
            setIsLoading(false);
        }
    };

    // Modify the handleVerifyEmail function to update Firebase when email is verified
    const handleVerifyEmail = async () => {
        if (loadingNotifications[admin.id]) return;

        try {
            setLoadingNotifications(prev => ({ ...prev, [admin.id]: true }));

            // Show immediate "queued" toast
            toast.info('Notification email queued for sending!');

            // Start the email sending process with the correct data from userData
            fetch('/api/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                    firstName: userData.username || 'User',
                }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to send notification email');
                    }
                    return response.json();
                }).then(async (data) => {
                    toast.success('Email verified successfully!');

                    // Update Firebase to store the verification status
                    const userDoc = doc(db, "admins", admin.id);
                    await updateDoc(userDoc, {
                        isEmailVerified: true,
                        emailVerifiedAt: new Date()
                    });

                    // Update local state
                    setIsEmailVerified(true);
                })
                .catch(error => {
                    console.error('Error sending notification email:', error);
                    toast.error('Failed to send notification email. Please try again.');
                })
                .finally(() => {
                    setLoadingNotifications(prev => ({ ...prev, [admin.id]: false }));
                });

        } catch (error) {
            console.error('Error queuing notification email:', error);
            toast.error('Failed to queue notification email. Please try again.');
            setLoadingNotifications(prev => ({ ...prev, [admin.id]: false }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate username
        if (isEditing && !formData.username.trim()) {
            newErrors.username = "Username is required";
        }

        // Validate email
        if (isEditing && !formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (isEditing && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        // Validate password only if entered
        if (formData.password) {
            if (formData.password.length < 6) {
                newErrors.password = "Password must be at least 6 characters";
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords don't match";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please correct the errors in the form");
            return;
        }

        try {
            setIsLoading(true);

            const userDoc = doc(db, "admins", admin.id);
            const updateData = {};

            // Only include changed fields
            if (formData.username !== userData.username) {
                updateData.username = formData.username;
            }

            if (formData.email !== userData.email) {
                updateData.email = formData.email;
            }

            // Update password if provided
            if (formData.password) {
                // In a real application, you would handle password updates securely,
                // potentially through a separate API endpoint with proper authentication
                updateData.password = formData.password; // This is simplified
            }

            // Only update if there are changes
            if (Object.keys(updateData).length > 0) {
                await updateDoc(userDoc, updateData);
                toast.success("Profile updated successfully");
                fetchUserData(); // Refresh data
            }

            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const closeErrorPopup = () => {
        setShowErrorPopup(false);
        setErrorMessage('');
    };

    // Error Popup Component
    const ErrorPopup = () => (
        <AnimatePresence>
            {showErrorPopup && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeErrorPopup}
                >
                    <motion.div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-red-50 p-4 flex items-start gap-3 border-b border-red-100">
                            <div className="rounded-full bg-red-100 p-2 flex-shrink-0">
                                <AlertCircle size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-red-700">Email Verification Failed</h3>
                                <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-700 mb-4">
                                Please update your email address in your profile to continue with verification.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeErrorPopup}
                                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        closeErrorPopup();
                                        setIsEditing(true);
                                    }}
                                    className="px-4 py-2 rounded-lg bg-[#36302A] text-white hover:bg-[#514840] transition-colors"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FAF4ED]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#36302A]"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[#36302A] font-medium">
                        Loading
                    </div>
                </div>
            </div>
        );
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const fieldVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: custom => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: custom * 0.1,
                duration: 0.4
            }
        }),
        exit: { opacity: 0, x: 10 }
    };

    return (
        <div className="min-h-screen bg-[#FAF4ED] py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.h1
                        className="text-3xl font-bold text-[#36302A]"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Profile Settings
                    </motion.h1>
                    <motion.p
                        className="mt-2 text-[#86807A]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        Manage your account information and preferences
                    </motion.p>
                </div>

                {/* Profile Content */}
                <motion.div
                    className="bg-white shadow-xl rounded-xl overflow-hidden"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-[#36302A] to-[#514840] px-6 py-10 text-white relative">
                        <motion.div
                            className="flex flex-col md:flex-row md:items-center gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <div className="relative inline-block">
                                <motion.div
                                    className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-white shadow-lg border-2 border-white/30"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    {userData?.photoURL ? (
                                        <Image
                                            src={userData.photoURL}
                                            alt="Profile"
                                            width={96}
                                            height={96}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <User size={48} strokeWidth={1.5} />
                                    )}
                                </motion.div>
                            </div>
                            <div>
                                <motion.h2
                                    className="text-2xl md:text-3xl font-bold"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.5 }}
                                >
                                    {userData?.username || "Admin User"}
                                </motion.h2>
                                <motion.p
                                    className="text-white/80 flex items-center mt-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.6 }}
                                >
                                    <Shield size={16} className="mr-2" />
                                    <span className="capitalize">{userData?.role || "Admin"}</span>
                                </motion.p>
                                <motion.p
                                    className="text-white/80 flex items-center mt-1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.7 }}
                                >
                                    <Mail size={16} className="mr-2" />
                                    {userData?.email}
                                </motion.p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Profile Information */}
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <h3 className="text-xl font-semibold text-[#36302A]">Account Information</h3>
                            <div className="flex gap-4">
                                <motion.button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-colors duration-300 ${isEditing
                                        ? "bg-[#EFE7DD] text-[#36302A]"
                                        : "bg-[#36302A] text-white"
                                        }`}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {isEditing ? (
                                        <>
                                            <X size={18} className="mr-2" />
                                            Cancel
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 size={18} className="mr-2" />
                                            Edit Profile
                                        </>
                                    )}
                                </motion.button>
                                {isEmailVerified ? (
                                    <motion.div
                                        className="px-4 py-2 rounded-lg flex items-center bg-green-50 text-green-700 border border-green-200"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Check size={18} className="mr-2" />
                                        Email Verified
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        onClick={handleVerifyEmail}
                                        className={`px-4 py-2 rounded-lg flex items-center transition-colors duration-300 ${isEditing
                                            ? "bg-[#EFE7DD] text-[#36302A]"
                                            : "bg-[#36302A] text-white"
                                            }`}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        disabled={loadingNotifications[admin?.id]}
                                    >
                                        {loadingNotifications[admin?.id] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-2 border-white mr-2"></div>
                                        ) : null}
                                        Verify Email
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.form
                                    key="edit-form"
                                    onSubmit={handleSubmit}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible" exit="exit">
                                            <label className="block text-sm font-medium text-[#86807A] mb-2">
                                                Username
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#86807A]">
                                                    <User size={18} />
                                                </span>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    className={`block w-full pl-10 pr-3 py-3 bg-[#EFE7DD] border-transparent focus:border-[#36302A] focus:ring focus:ring-[#36302A]/20 ${errors.username ? "border-red-500 bg-red-50" : ""
                                                        } rounded-lg transition-colors duration-200`}
                                                />
                                            </div>
                                            {errors.username && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-1 text-sm text-red-600 flex items-center"
                                                >
                                                    <X size={14} className="mr-1" />
                                                    {errors.username}
                                                </motion.p>
                                            )}
                                        </motion.div>

                                        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" exit="exit">
                                            <label className="block text-sm font-medium text-[#86807A] mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#86807A]">
                                                    <Mail size={18} />
                                                </span>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`block w-full pl-10 pr-3 py-3 bg-[#EFE7DD] border-transparent focus:border-[#36302A] focus:ring focus:ring-[#36302A]/20 ${errors.email ? "border-red-500 bg-red-50" : ""
                                                        } rounded-lg transition-colors duration-200`}
                                                />
                                            </div>
                                            {errors.email && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-1 text-sm text-red-600 flex items-center"
                                                >
                                                    <X size={14} className="mr-1" />
                                                    {errors.email}
                                                </motion.p>
                                            )}
                                        </motion.div>

                                        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" exit="exit">
                                            <label className="block text-sm font-medium text-[#86807A] mb-2">
                                                New Password (leave blank to keep current)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#86807A]">
                                                    <Key size={18} />
                                                </span>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={`block w-full pl-10 pr-10 py-3 bg-[#EFE7DD] border-transparent focus:border-[#36302A] focus:ring focus:ring-[#36302A]/20 ${errors.password ? "border-red-500 bg-red-50" : ""
                                                        } rounded-lg transition-colors duration-200`}
                                                />
                                                <motion.button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#86807A]"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </motion.button>
                                            </div>
                                            {errors.password && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-1 text-sm text-red-600 flex items-center"
                                                >
                                                    <X size={14} className="mr-1" />
                                                    {errors.password}
                                                </motion.p>
                                            )}
                                        </motion.div>

                                        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" exit="exit">
                                            <label className="block text-sm font-medium text-[#86807A] mb-2">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#86807A]">
                                                    <Key size={18} />
                                                </span>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`block w-full pl-10 pr-3 py-3 bg-[#EFE7DD] border-transparent focus:border-[#36302A] focus:ring focus:ring-[#36302A]/20 ${errors.confirmPassword ? "border-red-500 bg-red-50" : ""
                                                        } rounded-lg transition-colors duration-200`}
                                                />
                                            </div>
                                            {errors.confirmPassword && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-1 text-sm text-red-600 flex items-center"
                                                >
                                                    <X size={14} className="mr-1" />
                                                    {errors.confirmPassword}
                                                </motion.p>
                                            )}
                                        </motion.div>
                                    </div>

                                    <motion.div
                                        className="flex justify-end"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <motion.button
                                            type="submit"
                                            className="px-6 py-3 bg-[#36302A] text-white rounded-lg flex items-center shadow-lg overflow-hidden relative"
                                            disabled={isLoading}
                                            whileHover={{ scale: 1.03, backgroundColor: "#514840" }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            {isLoading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-2 border-white mr-2"></div>
                                            ) : (
                                                <Save size={18} className="mr-2" />
                                            )}
                                            <span className="relative z-10">Save Changes</span>
                                            <motion.div
                                                className="absolute inset-0 bg-white opacity-0"
                                                whileHover={{ opacity: 0.1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </motion.button>
                                    </motion.div>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="view-form"
                                    className="space-y-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <motion.div
                                            className="bg-[#F8F2EA] p-5 rounded-lg border border-[#E2D9CE] hover:border-[#36302A] transition-colors duration-300 hover:shadow-md"
                                            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <p className="text-sm font-medium text-[#86807A] mb-2 flex items-center">
                                                <User size={16} className="mr-2 opacity-70" />
                                                Username
                                            </p>
                                            <p className="font-semibold text-lg text-[#36302A]">{userData?.username}</p>
                                        </motion.div>

                                        <motion.div
                                            className="bg-[#F8F2EA] p-5 rounded-lg border border-[#E2D9CE] hover:border-[#36302A] transition-colors duration-300 hover:shadow-md"
                                            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <p className="text-sm font-medium text-[#86807A] mb-2 flex items-center">
                                                <Mail size={16} className="mr-2 opacity-70" />
                                                Email Address
                                            </p>
                                            <p className="font-semibold text-lg text-[#36302A]">{userData?.email}</p>

                                            {isEmailVerified && (
                                                <div className="mt-2 flex items-center text-green-600 text-sm">
                                                    <Check size={14} className="mr-1" />
                                                    Verified
                                                </div>
                                            )}
                                        </motion.div>

                                        <motion.div
                                            className="bg-[#F8F2EA] p-5 rounded-lg border border-[#E2D9CE] hover:border-[#36302A] transition-colors duration-300 hover:shadow-md"
                                            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <p className="text-sm font-medium text-[#86807A] mb-2 flex items-center">
                                                <Shield size={16} className="mr-2 opacity-70" />
                                                Role
                                            </p>
                                            <p className="font-semibold text-lg text-[#36302A] capitalize">
                                                {userData?.role || "Admin"}
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            className="bg-[#F8F2EA] p-5 rounded-lg border border-[#E2D9CE] hover:border-[#36302A] transition-colors duration-300 hover:shadow-md"
                                            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <p className="text-sm font-medium text-[#86807A] mb-2 flex items-center">
                                                <Calendar size={16} className="mr-2 opacity-70" />
                                                Account Created
                                            </p>
                                            <p className="font-semibold text-lg text-[#36302A]">
                                                {userData?.createdAt.toLocaleDateString()}
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            className="md:col-span-2 bg-[#F8F2EA] p-5 rounded-lg border border-[#E2D9CE] hover:border-[#36302A] transition-colors duration-300 hover:shadow-md"
                                            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <p className="text-sm font-medium text-[#86807A] mb-2 flex items-center">
                                                <Clock size={16} className="mr-2 opacity-70" />
                                                Last Login
                                            </p>
                                            <p className="font-semibold text-lg text-[#36302A]">
                                                {userData?.lastLogin.toLocaleDateString()} at {userData?.lastLogin.toLocaleTimeString()}
                                            </p>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Danger Zone */}
                    <motion.div
                        className="px-8 py-6 bg-[#F8F2EA] border-t border-[#E2D9CE]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <h3 className="text-lg font-medium text-[#36302A] mb-4">Account Actions</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <motion.button
                                onClick={logout}
                                className="px-5 py-3 bg-white text-[#36302A] border border-[#E2D9CE] rounded-lg hover:bg-[#EFE7DD] flex items-center justify-center gap-2 transition-colors duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <LogOut size={18} />
                                Sign Out
                            </motion.button>

                            {admin?.role === 'superAdmin' && (
                                <motion.div className="relative">
                                    <motion.button
                                        className="px-5 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 transition-colors duration-300 w-full sm:w-auto"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                                    >
                                        <Trash2 size={18} />
                                        Delete Account
                                    </motion.button>

                                    <AnimatePresence>
                                        {showDeleteConfirm && (
                                            <motion.div
                                                className="absolute right-0 bottom-full mb-2 p-4 bg-white rounded-lg shadow-xl border border-red-200 z-10 w-64"
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: the0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <p className="text-sm text-gray-700 mb-3">Are you sure you want to delete this account? This cannot be undone.</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        className="flex-1 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                                        onClick={() => {
                                                            toast.error("Account deletion not implemented in this demo");
                                                            setShowDeleteConfirm(false);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        className="flex-1 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}