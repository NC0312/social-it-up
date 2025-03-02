'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../components/providers/AdminAuthProvider";
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from "sonner";
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
    Key
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

    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#2563EB]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[rgb(250,244,237)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-[#36302A]">Profile Settings</h1>
                    <p className="mt-2 text-[#575553]">Manage your account information and preferences</p>
                </div>

                {/* Profile Content */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-[#2563EB] px-6 py-8 text-white relative">
                        <div className="flex items-center">
                            <div className="relative inline-block">
                                <div className="h-24 w-24 rounded-full bg-white/30 flex items-center justify-center text-white">
                                    {userData?.photoURL ? (
                                        <Image
                                            src={userData.photoURL}
                                            alt="Profile"
                                            width={96}
                                            height={96}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <User size={48} />
                                    )}
                                </div>
                            </div>
                            <div className="ml-6">
                                <h2 className="text-2xl font-bold">{userData?.displayName || userData?.username || "Admin User"}</h2>
                                <p className="text-blue-100 flex items-center mt-1">
                                    <Shield size={16} className="mr-1" />
                                    <span className="capitalize">{userData?.role || "Admin"}</span>
                                </p>
                                <p className="text-blue-100 flex items-center mt-1">
                                    <Mail size={16} className="mr-1" />
                                    {userData?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-[#36302A]">Account Information</h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-2 rounded-md flex items-center ${isEditing ? "bg-red-100 text-red-600" : "bg-blue-100 text-[#2563EB]"
                                    }`}
                            >
                                {isEditing ? (
                                    <>
                                        <X size={16} className="mr-1" />
                                        Cancel
                                    </>
                                ) : (
                                    <>
                                        <Edit2 size={16} className="mr-1" />
                                        Edit Profile
                                    </>
                                )}
                            </button>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[#575553] mb-1">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#575553]">
                                                <User size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className={`block w-full pl-10 pr-3 py-2 border ${errors.username ? "border-red-500" : "border-gray-300"
                                                    } rounded-md shadow-sm focus:ring-[#2563EB] focus:border-[#2563EB]`}
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#575553] mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#575553]">
                                                <Mail size={18} />
                                            </span>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                                                    } rounded-md shadow-sm focus:ring-[#2563EB] focus:border-[#2563EB]`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#575553] mb-1">
                                            New Password (leave blank to keep current)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#575553]">
                                                <Key size={18} />
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`block w-full pl-10 pr-10 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"
                                                    } rounded-md shadow-sm focus:ring-[#2563EB] focus:border-[#2563EB]`}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#575553]"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#575553] mb-1">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#575553]">
                                                <Key size={18} />
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`block w-full pl-10 pr-3 py-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                                    } rounded-md shadow-sm focus:ring-[#2563EB] focus:border-[#2563EB]`}
                                            />
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8] flex items-center"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        ) : (
                                            <Save size={18} className="mr-2" />
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-[#575553] mb-1">Username</p>
                                        <p className="font-medium text-[#36302A]">{userData?.username}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-[#575553] mb-1">Display Name</p>
                                        <p className="font-medium text-[#36302A]">{userData?.displayName || "Not set"}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-[#575553] mb-1">Email Address</p>
                                        <p className="font-medium text-[#36302A]">{userData?.email}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-[#575553] mb-1">Role</p>
                                        <p className="font-medium text-[#36302A] capitalize">{userData?.role || "Admin"}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-[#575553] mb-1">Account Created</p>
                                        <p className="font-medium text-[#36302A] flex items-center">
                                            <Calendar size={16} className="mr-1 text-[#575553]" />
                                            {userData?.createdAt.toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-[#575553] mb-1">Last Login</p>
                                        <p className="font-medium text-[#36302A] flex items-center">
                                            <Clock size={16} className="mr-1 text-[#575553]" />
                                            {userData?.lastLogin.toLocaleDateString()} at {userData?.lastLogin.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="px-6 py-4 bg-red-50 border-t border-red-100">
                        <h3 className="text-lg font-medium text-red-800 mb-3">Danger Zone</h3>
                        <div className="flex space-x-4">
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                            >
                                Sign Out
                            </button>

                            {admin?.role === 'superAdmin' && (
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
                                            // Handle account deletion - not implemented in this example
                                            toast.error("Account deletion not implemented in this demo");
                                        }
                                    }}
                                >
                                    Delete Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}