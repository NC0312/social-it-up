'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Shield, Clock, Calendar, UserCheck, Edit, Key, Save, RefreshCw } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from "sonner";

const AdminProfileModal = ({ admin, onClose, currentAdmin, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        username: admin?.username || '',
        email: admin?.email || '',
        password: '' // Empty password field by default (only fill when changing)
    });
    const [saving, setSaving] = useState(false);

    // Check if current user is a superAdmin
    const isSuperAdmin = currentAdmin?.role === 'superAdmin';

    if (!admin) return null;

    // Format date for display
    const formatDate = (date) => {
        if (!date) return 'Never';

        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle edit button click
    const handleEditClick = () => {
        setIsEditing(true);
        setEditData({
            username: admin.username || '',
            email: admin.email || '',
            password: ''
        });
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle save changes
    const handleSaveChanges = async () => {
        if (!isSuperAdmin) {
            toast.error("You don't have permission to edit admins");
            return;
        }

        // Validate inputs
        if (!editData.username.trim() || !editData.email.trim()) {
            toast.error("Username and email are required");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            setSaving(true);

            // Update admin data in Firestore
            const adminRef = doc(db, "admins", admin.id);

            const updateData = {
                username: editData.username,
                email: editData.email,
                updatedAt: new Date()
            };

            // Only include password if it's been changed
            if (editData.password.trim()) {
                // In a real app, you might want to hash the password or handle this differently
                // This is just a placeholder for the concept
                updateData.password = editData.password;
            }

            await updateDoc(adminRef, updateData);

            // Exit edit mode
            setIsEditing(false);
            toast.success("Admin details updated successfully");

            // Call the onUpdate callback to refresh the admin list
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating admin:", error);
            toast.error("Failed to update admin details");
        } finally {
            setSaving(false);
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#36302A] text-white p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center mb-4">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-[#36302A] text-2xl font-bold mr-4">
                            {admin.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">@{admin.username}</h2>
                            <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${admin.role === 'superAdmin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {admin.role === 'superAdmin' && <Shield size={12} className="mr-1" />}
                                    {admin.role || 'admin'}
                                </span>
                                <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${admin.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-amber-100 text-amber-800'
                                    }`}>
                                    {admin.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Edit button for superAdmins */}
                    {isSuperAdmin && !isEditing && admin.id !== currentAdmin.id && (
                        <button
                            onClick={handleEditClick}
                            className="absolute top-4 right-12 text-white hover:text-gray-200 transition-colors"
                            title="Edit Admin"
                        >
                            <Edit size={20} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {isEditing ? (
                        // Edit Form
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label className="text-sm text-[#86807A] mb-1 flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editData.username}
                                    onChange={handleInputChange}
                                    className="border border-[#E2D9CE] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-[#36302A]"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm text-[#86807A] mb-1 flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editData.email}
                                    onChange={handleInputChange}
                                    className="border border-[#E2D9CE] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-[#36302A]"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm text-[#86807A] mb-1 flex items-center">
                                    <Key className="w-4 h-4 mr-2" />
                                    New Password (leave blank to keep unchanged)
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={editData.password}
                                    onChange={handleInputChange}
                                    className="border border-[#E2D9CE] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-[#36302A]"
                                    placeholder="Leave blank to keep unchanged"
                                />
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Mail className="w-5 h-5 text-[#86807A] mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-[#86807A]">Email</p>
                                    <p className="text-[#36302A]">{admin.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <User className="w-5 h-5 text-[#86807A] mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-[#86807A]">Gender</p>
                                    <p className="text-[#36302A] capitalize">{admin.gender || 'Unspecified'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-[#86807A] mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-[#86807A]">Account Created</p>
                                    <p className="text-[#36302A]">{formatDate(admin.createdAt)}</p>
                                </div>
                            </div>

                            {admin.status === 'approved' && (
                                <div className="flex items-start">
                                    <UserCheck className="w-5 h-5 text-[#86807A] mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-[#86807A]">Approved On</p>
                                        <p className="text-[#36302A]">{formatDate(admin.updatedAt)}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start">
                                <Clock className="w-5 h-5 text-[#86807A] mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-[#86807A]">Last Login</p>
                                    <p className="text-[#36302A]">{formatDate(admin.lastLogin)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-[#F8F2EA] px-6 py-4 flex justify-end gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-[#E2D9CE] text-[#575553] rounded-lg shadow-sm hover:bg-[#d0c7bc] transition-colors duration-300"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                className="px-4 py-2 bg-[#36302A] text-white rounded-lg shadow-sm hover:bg-[#514840] transition-colors duration-300 flex items-center"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#36302A] text-white rounded-lg shadow-sm hover:bg-[#514840] transition-colors duration-300"
                        >
                            Close
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminProfileModal;