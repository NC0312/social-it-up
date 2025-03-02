'use client';
import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../components/providers/AdminAuthProvider';
import { useRouter } from 'next/navigation';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { ImSpinner8 } from 'react-icons/im';
import { FaCheck, FaTimes, FaUserShield, FaUserClock, FaUser, FaTrash, FaSearch } from 'react-icons/fa';

const AdminManagement = () => {
    const { admin: currentAdmin, isAuthenticated, loading } = useAdminAuth();
    const router = useRouter();

    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [approvedAdmins, setApprovedAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionInProgress, setActionInProgress] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [isSyncing, setIsSyncing] = useState(false);

    // Fetch admins on component mount
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated) {
            fetchAdmins();
        }
    }, [isAuthenticated, loading, router,]);

    // Check if current user is a superAdmin
    const isSuperAdmin = currentAdmin?.role === 'superAdmin';

    // Fetch all admins from Firestore
    const fetchAdmins = async () => {
        try {
            setIsLoading(true);

            // Fetch pending admins
            const pendingQuery = query(
                collection(db, "admins"),
                where("status", "==", "pending"),
            );
            const pendingSnapshot = await getDocs(pendingQuery);
            const pendingList = pendingSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));

            // Fetch approved admins
            const approvedQuery = query(
                collection(db, "admins"),
                where("status", "==", "approved"),
            );
            const approvedSnapshot = await getDocs(approvedQuery);
            const approvedList = approvedSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().createdAt?.toDate?.() || new Date()
            }));

            // Sort in memory by creation date (newest first)
            pendingList.sort((a, b) => b.createdAt - a.createdAt);
            approvedList.sort((a, b) => b.createdAt - a.createdAt);

            setPendingAdmins(pendingList);
            setApprovedAdmins(approvedList);
        } catch (error) {
            console.error("Error fetching admins:", error);
            showNotification("Failed to fetch admins", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const syncData = async () => {
        try {
            setIsSyncing(true);
            await fetchAdmins();
            showNotification("Data synchronized successfully", "success");
        } catch (error) {
            console.error("Error synchronizing data:", error);
            showNotification("Failed to synchronize data", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    // Handle admin approval
    const handleApprove = async (adminId) => {
        if (!isSuperAdmin) {
            showNotification("You don't have permission to approve admins", "error");
            return;
        }

        try {
            setActionInProgress(adminId);

            // Update admin status in Firestore
            const adminRef = doc(db, "admins", adminId);
            await updateDoc(adminRef, {
                status: "approved",
                updatedAt: new Date()
            });

            // Update local state
            const updatedAdmin = pendingAdmins.find(admin => admin.id === adminId);
            setPendingAdmins(pendingAdmins.filter(admin => admin.id !== adminId));
            setApprovedAdmins([{ ...updatedAdmin, status: "approved" }, ...approvedAdmins]);

            showNotification("Admin approved successfully", "success");
        } catch (error) {
            console.error("Error approving admin:", error);
            showNotification("Failed to approve admin", "error");
        } finally {
            setActionInProgress(null);
        }
    };

    // Handle admin rejection/deletion
    const handleDelete = async (adminId, adminType) => {
        if (!isSuperAdmin) {
            showNotification("You don't have permission to delete admins", "error");
            return;
        }

        if (!confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
            return;
        }

        try {
            setActionInProgress(adminId);

            // Delete admin from Firestore
            const adminRef = doc(db, "admins", adminId);
            await deleteDoc(adminRef);

            // Update local state
            if (adminType === 'pending') {
                setPendingAdmins(pendingAdmins.filter(admin => admin.id !== adminId));
            } else {
                setApprovedAdmins(approvedAdmins.filter(admin => admin.id !== adminId));
            }

            showNotification("Admin deleted successfully", "success");
        } catch (error) {
            console.error("Error deleting admin:", error);
            showNotification("Failed to delete admin", "error");
        } finally {
            setActionInProgress(null);
        }
    };

    // Display notification
    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Filter admins based on search term
    const filteredPendingAdmins = pendingAdmins.filter(admin =>
        admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredApprovedAdmins = approvedAdmins.filter(admin =>
        admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FAF4ED]">
                <ImSpinner8 className="w-8 h-8 animate-spin text-[#36302A]" />
            </div>
        );
    }

    if (!isSuperAdmin) {
        return (
            <div className="min-h-screen bg-[#FAF4ED] p-6 flex flex-col items-center justify-center">
                <FaUserShield className="text-6xl text-[#36302A] mb-4" />
                <h1 className="text-2xl font-bold text-[#36302A] mb-2">Access Denied</h1>
                <p className="text-[#575553] mb-6">You need superAdmin privileges to access this page.</p>
                <button
                    onClick={() => router.push('/admin-panel69')}
                    className="px-4 py-2 bg-[#36302A] text-white rounded-md hover:bg-opacity-90 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF4ED]">
            <div className="container mx-auto p-4 md:p-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-[#36302A] mb-2">Admin Management</h1>
                        <p className="text-[#575553]">Manage admin accounts and approval requests</p>
                    </div>

                    {/* Search and Sync Bar */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by username or email..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36302A]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={syncData}
                                disabled={isSyncing}
                                className="bg-[#36302A] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition flex items-center"
                            >
                                {isSyncing ? (
                                    <ImSpinner8 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                )}
                                Sync Data
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`flex-1 py-3 px-4 font-medium text-sm focus:outline-none ${activeTab === 'pending'
                                ? 'text-[#36302A] border-b-2 border-[#36302A]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('pending')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FaUserClock />
                                <span>Pending Requests</span>
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs ml-1">
                                    {pendingAdmins.length}
                                </span>
                            </div>
                        </button>
                        <button
                            className={`flex-1 py-3 px-4 font-medium text-sm focus:outline-none ${activeTab === 'approved'
                                ? 'text-[#36302A] border-b-2 border-[#36302A]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('approved')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FaUser />
                                <span>Approved Admins</span>
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs ml-1">
                                    {approvedAdmins.length}
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <ImSpinner8 className="w-8 h-8 animate-spin text-[#36302A]" />
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {activeTab === 'pending' ? (
                                    <motion.div
                                        key="pending"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {filteredPendingAdmins.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                {searchTerm ? 'No matching pending requests found.' : 'No pending admin requests.'}
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {filteredPendingAdmins.map((admin) => (
                                                            <tr key={admin.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="h-10 w-10 flex-shrink-0 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium">
                                                                            {admin.username.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div className="ml-4">
                                                                            <div className="text-sm font-medium text-gray-900">@{admin.username}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {admin.email}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                                    {admin.gender || 'Unspecified'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {formatDate(admin.createdAt)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleApprove(admin.id)}
                                                                            disabled={actionInProgress === admin.id}
                                                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition flex items-center"
                                                                        >
                                                                            {actionInProgress === admin.id ? (
                                                                                <ImSpinner8 className="w-4 h-4 animate-spin" />
                                                                            ) : (
                                                                                <>
                                                                                    <FaCheck className="mr-1" />
                                                                                    <span>Approve</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(admin.id, 'pending')}
                                                                            disabled={actionInProgress === admin.id}
                                                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center"
                                                                        >
                                                                            {actionInProgress === admin.id ? (
                                                                                <ImSpinner8 className="w-4 h-4 animate-spin" />
                                                                            ) : (
                                                                                <>
                                                                                    <FaTimes className="mr-1" />
                                                                                    <span>Reject</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="approved"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {filteredApprovedAdmins.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                {searchTerm ? 'No matching approved admins found.' : 'No approved admins.'}
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved Date</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {filteredApprovedAdmins.map((admin) => (
                                                            <tr key={admin.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="h-10 w-10 flex-shrink-0 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium">
                                                                            {admin.username.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div className="ml-4">
                                                                            <div className="text-sm font-medium text-gray-900">@{admin.username}</div>
                                                                            {admin.id === currentAdmin.id && (
                                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                                                    You
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {admin.email}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                                    {admin.gender || 'Unspecified'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                                    <span className={`px-2 py-1 rounded-full text-xs ${admin.role === 'superAdmin'
                                                                        ? 'bg-purple-100 text-purple-800'
                                                                        : 'bg-blue-100 text-blue-800'
                                                                        }`}>
                                                                        {admin.role || 'admin'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {formatDate(admin.updatedAt || admin.createdAt)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    {admin.id !== currentAdmin?.id && (
                                                                        <button
                                                                            onClick={() => handleDelete(admin.id, 'approved')}
                                                                            disabled={actionInProgress === admin.id}
                                                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center"
                                                                        >
                                                                            {actionInProgress === admin.id ? (
                                                                                <ImSpinner8 className="w-4 h-4 animate-spin" />
                                                                            ) : (
                                                                                <>
                                                                                    <FaTrash className="mr-1" />
                                                                                    <span>Remove</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                            }`}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminManagement;