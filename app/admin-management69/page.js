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
    onSnapshot,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { db, rtdb } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import {
    UserPlus,
    UserCheck,
    UserMinus,
    Shield,
    Search,
    RefreshCw,
    ChevronRight,
    X,
    Check,
    Trash2,
    Clock,
    Calendar,
    AlertCircle
} from 'lucide-react';
import AdminProfileModal from '../components/AdminProfileModal';
import AdminRemovalPopup from '../components/AdminRemovalPopup';
import { ref, set } from 'firebase/database';

const AdminManagement = () => {
    const { admin: currentAdmin, isAuthenticated, loading } = useAdminAuth();
    const router = useRouter();

    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [approvedAdmins, setApprovedAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionInProgress, setActionInProgress] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState({});
    const [reviewCounts, setReviewCounts] = useState({});
    const [bugCounts, setBugCounts] = useState({});

    // State for the admin profile modal
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const tableRowVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3
            }
        }),
        exit: { opacity: 0, x: 10 }
    };

    // Add real-time listener for online status
    useEffect(() => {
        if (!isAuthenticated) return;

        // Set up real-time listener for admin status changes
        const adminsRef = collection(db, "admins");
        const unsubscribe = onSnapshot(adminsRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "modified" || change.type === "added") {
                    const docData = change.doc.data();
                    const adminData = {
                        id: change.doc.id,
                        ...docData,
                        createdAt: docData.createdAt?.toDate?.() || new Date(),
                        lastLogin: docData.lastLogin?.toDate?.() || null,
                        isOnline: docData.isOnline || false,
                        lastActive: docData.lastActive?.toDate?.() || null,
                        updatedAt: docData.updatedAt?.toDate?.() || docData.createdAt?.toDate?.() || new Date(),
                    };

                    // Check admin status and update appropriate list
                    if (docData.status === "pending") {
                        setPendingAdmins(prev => {
                            const exists = prev.some(admin => admin.id === adminData.id);
                            if (exists) {
                                return prev.map(admin =>
                                    admin.id === adminData.id ? { ...admin, isOnline: adminData.isOnline, lastActive: adminData.lastActive } : admin
                                );
                            } else {
                                return [...prev, adminData];
                            }
                        });
                    } else if (docData.status === "approved") {
                        setApprovedAdmins(prev => {
                            const exists = prev.some(admin => admin.id === adminData.id);
                            if (exists) {
                                return prev.map(admin =>
                                    admin.id === adminData.id ? { ...admin, isOnline: adminData.isOnline, lastActive: adminData.lastActive } : admin
                                );
                            } else {
                                return [...prev, adminData];
                            }
                        });
                    }
                } else if (change.type === "removed") {
                    const docId = change.doc.id;
                    setPendingAdmins(prev => prev.filter(admin => admin.id !== docId));
                    setApprovedAdmins(prev => prev.filter(admin => admin.id !== docId));
                }
            });
        });

        // Clean up listener on unmount
        return () => unsubscribe();
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Set up real-time listener for reviews assignments
        const reviewsRef = collection(db, "reviews");
        const unsubscribe = onSnapshot(reviewsRef, (snapshot) => {
            // Process changes to update review counts
            const counts = { ...reviewCounts };

            snapshot.docChanges().forEach((change) => {
                const reviewData = change.doc.data();
                const assignedTo = reviewData.assignedTo;
                const oldAssignedTo = change.type === "modified" ?
                    snapshot.docs.find(d => d.id === change.doc.id)?.data()?.assignedTo : null;

                // Handle different change types
                if (change.type === "added" && assignedTo) {
                    counts[assignedTo] = (counts[assignedTo] || 0) + 1;
                }
                else if (change.type === "modified") {
                    // If assignment changed, update both old and new assignee counts
                    if (oldAssignedTo && oldAssignedTo !== assignedTo) {
                        counts[oldAssignedTo] = Math.max(0, (counts[oldAssignedTo] || 0) - 1);
                        if (assignedTo) {
                            counts[assignedTo] = (counts[assignedTo] || 0) + 1;
                        }
                    }
                    // If newly assigned
                    else if (!oldAssignedTo && assignedTo) {
                        counts[assignedTo] = (counts[assignedTo] || 0) + 1;
                    }
                    // If assignment removed
                    else if (oldAssignedTo && !assignedTo) {
                        counts[oldAssignedTo] = Math.max(0, (counts[oldAssignedTo] || 0) - 1);
                    }
                }
                else if (change.type === "removed" && assignedTo) {
                    counts[assignedTo] = Math.max(0, (counts[assignedTo] || 0) - 1);
                }
            });

            setReviewCounts(counts);
        });

        // Clean up listener on unmount
        return () => unsubscribe();
    }, [isAuthenticated]);

    // Fetch admins on component mount
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated) {
            fetchAdmins();
            fetchReviewCounts();
            fetchBugCounts();

        }
    }, [isAuthenticated, loading, router]);


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
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                lastLogin: doc.data().lastLogin?.toDate?.() || null,
                isOnline: doc.data().isOnline || false, // Include online status
                lastActive: doc.data().lastActive?.toDate?.() || null
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
                updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().createdAt?.toDate?.() || new Date(),
                lastLogin: doc.data().lastLogin?.toDate?.() || null,
                isOnline: doc.data().isOnline || false, // Include online status
                lastActive: doc.data().lastActive?.toDate?.() || null,
                isEmailVerified: doc.data().isEmailVerified || false,
            }));

            // Sort in memory by creation date (newest first)
            pendingList.sort((a, b) => b.createdAt - a.createdAt);
            approvedList.sort((a, b) => b.createdAt - a.createdAt);

            setPendingAdmins(pendingList);
            setApprovedAdmins(approvedList);
        } catch (error) {
            console.error("Error fetching admins:", error);
            toast.error("Failed to fetch admins");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReviewCounts = async () => {
        try {
            const reviewsRef = collection(db, "reviews");
            const reviewsSnapshot = await getDocs(reviewsRef);

            // Count reviews for each admin
            const reviewCounts = {};

            reviewsSnapshot.docs.forEach(doc => {
                const assignedTo = doc.data().assignedTo;
                if (assignedTo) {
                    counts[assignedTo] = (counts[assignedTo] || 0) + 1;
                }
            });

            setReviewCounts(reviewCounts);
        } catch (error) {
            console.error("Error fetching review counts:", error);
        }
    };

    const fetchBugCounts = async () => {
        try {
            const bugsRef = collection(db, "bugs");
            const bugsSnapshot = await getDocs(bugsRef);

            // Count bugs for each admin
            const bugCounts = {};

            bugsSnapshot.docs.forEach(doc => {
                const assignedTo = doc.data().assignedTo;
                if (assignedTo) {
                    counts[assignedTo] = (counts[assignedTo] || 0) + 1;
                }
            });

            setBugCounts(bugCounts);
        } catch (error) {
            console.error("Error fetching bug counts:", error);
        }
    }

    const syncData = async () => {
        try {
            setIsLoading(true);
            await fetchAdmins();
            await fetchReviewCounts(); // Add this line
            toast.success("Data synchronized successfully");
        } catch (error) {
            console.error("Error synchronizing data:", error);
            toast.error("Failed to synchronize data");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle viewing admin profile
    const handleViewProfile = (admin) => {
        setSelectedAdmin(admin);
    };

    // Handle closing the admin profile modal
    const handleCloseProfile = () => {
        setSelectedAdmin(null);
    };

    // Handle admin approval
    const handleApprove = async (adminId) => {
        if (!isSuperAdmin) {
            toast.error("You don't have permission to approve admins");
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

            toast.success("Admin approved successfully");
        } catch (error) {
            console.error("Error approving admin:", error);
            toast.error("Failed to approve admin");
        } finally {
            setActionInProgress(null);
        }
    };

    // Handle promoting admin to superadmin
    const handlePromote = async (adminId) => {
        if (!isSuperAdmin) {
            toast.error("You don't have permission to promote admins");
            return;
        }

        try {
            setActionInProgress(adminId);

            // Update admin role in Firestore
            const adminRef = doc(db, "admins", adminId);
            await updateDoc(adminRef, {
                role: "superAdmin",
                updatedAt: new Date()
            });

            // Update local state
            setApprovedAdmins(
                approvedAdmins.map(admin =>
                    admin.id === adminId
                        ? { ...admin, role: "superAdmin" }
                        : admin
                )
            );

            toast.success("Admin promoted to superAdmin successfully");
        } catch (error) {
            console.error("Error promoting admin:", error);
            toast.error("Failed to promote admin");
        } finally {
            setActionInProgress(null);
            setConfirmAction(null);
        }
    };

    // Handle admin rejection/deletion
    const handleDelete = async (adminId, adminType) => {
        // Check permissions
        if (!isSuperAdmin) {
            toast.error("You don't have permission to delete admins");
            return;
        }

        // Prevent superAdmin deletion
        if (adminType === 'approved' && approvedAdmins.find(a => a.id === adminId)?.role === 'superAdmin') {
            toast.error("SuperAdmins cannot be removed");
            return;
        }

        try {
            setActionInProgress(adminId);

            // Get admin document reference
            const adminRef = doc(db, "admins", adminId);

            // For approved admins, clear their presence in realtime DB first
            if (adminType === 'approved') {
                await set(ref(rtdb, `status/${adminId}`), null);
            }

            // Delete admin document
            await deleteDoc(adminRef);

            // Update UI state
            if (adminType === 'pending') {
                setPendingAdmins(prev => prev.filter(admin => admin.id !== adminId));
                toast.success("Admin request rejected successfully");
            } else {
                setApprovedAdmins(prev => prev.filter(admin => admin.id !== adminId));
                toast.success("Admin completely removed from the system");
            }
        } catch (error) {
            console.error("Error deleting admin:", error);
            toast.error("Failed to delete admin");
        } finally {
            setActionInProgress(null);
            setConfirmAction(null);
        }
    };

    // Filter admins based on search term
    const filteredPendingAdmins = pendingAdmins.filter(admin =>
        admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredApprovedAdmins = approvedAdmins.filter(admin =>
        admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleVerifyEmail = async (admin) => {
        if (loadingNotifications[admin.id]) return;

        try {
            setLoadingNotifications(prev => ({ ...prev, [admin.id]: true }));

            // Show processing indicator
            toast.info('Verifying email address...');

            // Make the API call to verify the email
            const response = await fetch('/api/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: admin.email,
                    firstName: admin.username || 'User',
                }),
            });

            // Parse the response
            const data = await response.json();

            // Check if the response indicates success
            if (!response.ok) {
                // Handle specific error types
                switch (data.type) {
                    case 'invalid_format':
                    case 'disposable_email':
                    case 'invalid_domain':
                    case 'nonexistent_domain':
                    case 'no_mx_records':
                    case 'mx_lookup_failed':
                    case 'invalid_recipient':
                        toast.error(`Email verification failed: ${data.error}`);
                        break;
                    default:
                        toast.error('Email verification failed. Please try again.');
                }
                return;
            }

            // Success case
            if (data.success) {
                toast.success('Email verified successfully!');

                // Update Firebase to store the verification status
                const userDoc = doc(db, "admins", admin.id);
                await updateDoc(userDoc, {
                    isEmailVerified: true,
                    emailVerifiedAt: new Date()
                });

                // Update local state to reflect the change immediately
                setApprovedAdmins(prevAdmins =>
                    prevAdmins.map(a =>
                        a.id === admin.id
                            ? { ...a, isEmailVerified: true }
                            : a
                    )
                );
            } else {
                // This case handles when the API returns 200 but not success:true
                toast.warning('Email verification completed but with warnings.');
            }

        } catch (error) {
            console.error('Error during email verification:', error);
            toast.error('Email verification process failed. Please try again.');
        } finally {
            setLoadingNotifications(prev => ({ ...prev, [admin.id]: false }));
        }
    };

    // Format date
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

    const ReviewCountBadge = ({ count }) => {
        if (count === undefined || count === null) return null;

        return (
            <div className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                <span className="font-medium">{count}</span>
                <span className="ml-1 text-[10px]">reviews</span>
            </div>
        );
    };

    if (loading || !isAuthenticated) {
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

    if (!isSuperAdmin) {
        return (
            <div className="min-h-screen bg-[#FAF4ED] p-6 flex flex-col items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="mx-auto bg-[#36302A] w-20 h-20 rounded-full flex items-center justify-center text-white mb-6"
                    >
                        <Shield size={36} />
                    </motion.div>
                    <motion.h1
                        className="text-2xl font-bold text-[#36302A] mb-3"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Access Denied
                    </motion.h1>
                    <motion.p
                        className="text-[#86807A] mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        You need superAdmin privileges to access this page.
                    </motion.p>
                    <motion.button
                        onClick={() => router.push('/admin-panel69')}
                        className="px-5 py-3 bg-[#36302A] text-white rounded-lg shadow-md hover:bg-[#514840] transition-colors duration-300 w-full"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Back to Dashboard
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF4ED] py-12 px-2 sm:px-4 lg:px-6">
            {/* <AdminRemovalPopup /> */}
            <motion.div
                className="max-w-full mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.h1
                        className="text-3xl font-bold text-[#36302A]"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Admin Management
                    </motion.h1>
                    <motion.p
                        className="mt-2 text-[#86807A]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Manage admin accounts and approval requests
                    </motion.p>
                </div>

                <motion.div
                    className="bg-white shadow-xl rounded-xl overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* Search and Sync Bar */}
                    <div className="p-5 bg-[#F8F2EA] border-b border-[#E2D9CE]">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#86807A]">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by username or email..."
                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-[#E2D9CE] focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-[#36302A] shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <motion.button
                                onClick={syncData}
                                disabled={isLoading}
                                className="px-5 py-3 bg-[#36302A] text-white rounded-lg shadow-md flex items-center justify-center space-x-2 hover:bg-[#514840] transition-colors duration-300 min-w-[140px]"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? (
                                    <div className="animate-spin">
                                        <RefreshCw size={18} />
                                    </div>
                                ) : (
                                    <RefreshCw size={18} />
                                )}
                                <span>Sync Data</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#E2D9CE]">
                        <motion.button
                            className={`flex-1 py-4 relative overflow-hidden ${activeTab === 'pending'
                                ? 'text-[#36302A] font-medium'
                                : 'text-[#86807A] hover:text-[#36302A]'
                                }`}
                            onClick={() => setActiveTab('pending')}
                            whileHover={{ backgroundColor: "rgba(226, 217, 206, 0.3)" }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <UserPlus size={18} />
                                <span>Pending Requests</span>
                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs">
                                    {pendingAdmins.length}
                                </span>
                            </div>
                            {activeTab === 'pending' && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#36302A]"
                                    layoutId="tabIndicator"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                        <motion.button
                            className={`flex-1 py-4 relative overflow-hidden ${activeTab === 'approved'
                                ? 'text-[#36302A] font-medium'
                                : 'text-[#86807A] hover:text-[#36302A]'
                                }`}
                            onClick={() => setActiveTab('approved')}
                            whileHover={{ backgroundColor: "rgba(226, 217, 206, 0.3)" }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <UserCheck size={18} />
                                <span>Approved Admins</span>
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                                    {approvedAdmins.length}
                                </span>
                            </div>
                            {activeTab === 'approved' && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#36302A]"
                                    layoutId="tabIndicator"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                        {isLoading ? (
                            <div className="flex justify-center py-24">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-2 border-[#36302A] opacity-75"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-[#36302A] text-sm font-medium">
                                        Loading
                                    </div>
                                </div>
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
                                            <motion.div
                                                className="bg-[#F8F2EA] rounded-xl p-12 text-center"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EFE7DD] text-[#86807A] mb-4">
                                                    <UserPlus size={24} />
                                                </div>
                                                <h3 className="text-xl font-medium text-[#36302A]">No Pending Requests</h3>
                                                <p className="text-[#86807A] mt-2">
                                                    {searchTerm
                                                        ? 'No matching pending requests found.'
                                                        : 'All admin requests have been processed.'}
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <div className="overflow-x-auto -mx-6 px-6">
                                                <div className="inline-block min-w-full align-middle">
                                                    <table className="w-full divide-y divide-[#E2D9CE]">
                                                        <thead>
                                                            <tr className="bg-[#F8F2EA]">
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">User</th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">Email</th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider hidden sm:table-cell sm:px-6">Gender</th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider hidden md:table-cell sm:px-6">Requested</th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">Last Login</th>
                                                                <th className="px-3 py-3 text-right text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-[#E2D9CE]">
                                                            {filteredPendingAdmins.map((admin, index) => (
                                                                <motion.tr
                                                                    key={admin.id}
                                                                    className="hover:bg-[#F8F2EA] transition-colors duration-150"
                                                                    custom={index}
                                                                    variants={tableRowVariants}
                                                                    initial="hidden"
                                                                    animate="visible"
                                                                    exit="exit"
                                                                >
                                                                    <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                                        <div className="flex items-center">
                                                                            <div
                                                                                className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium cursor-pointer"
                                                                                onClick={() => handleViewProfile(admin)}
                                                                            >
                                                                                {admin.username?.charAt(0).toUpperCase() || 'A'}
                                                                            </div>
                                                                            <div className="ml-3 sm:ml-4">
                                                                                <div
                                                                                    className="text-xs sm:text-sm font-medium text-[#36302A] cursor-pointer hover:underline group relative flex items-center"
                                                                                    onClick={() => handleViewProfile(admin)}
                                                                                >
                                                                                    <div className={`h-2 w-2 rounded-full mr-2 ${admin.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                                                    @{admin.username}
                                                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-[#36302A] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                                                                        View Profile
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-[#575553] sm:px-6">
                                                                        {admin.email}
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-[#575553] capitalize hidden sm:table-cell sm:px-6">
                                                                        {admin.gender || 'Unspecified'}
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-[#575553] hidden md:table-cell sm:px-6">
                                                                        <div className="flex items-center">
                                                                            <Calendar size={14} className="mr-2 text-[#86807A]" />
                                                                            {formatDate(admin.createdAt)}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-[#575553] sm:px-6">
                                                                        <div className="flex items-center">
                                                                            <Clock size={14} className="mr-2 text-[#86807A]" />
                                                                            {formatDate(admin.lastLogin)}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium sm:px-6">
                                                                        <div className="flex justify-end gap-1 sm:gap-2">
                                                                            {confirmAction === `approve-${admin.id}` ? (
                                                                                <div className="flex gap-2 bg-[#F8F2EA] p-1 rounded-lg">
                                                                                    <button
                                                                                        onClick={() => handleApprove(admin.id)}
                                                                                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors duration-150"
                                                                                    >
                                                                                        Confirm
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setConfirmAction(null)}
                                                                                        className="bg-[#E2D9CE] text-[#575553] px-3 py-1 rounded-md hover:bg-[#d0c7bc] transition-colors duration-150"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                </div>
                                                                            ) : confirmAction === `delete-pending-${admin.id}` ? (
                                                                                <div className="flex gap-2 bg-[#F8F2EA] p-1 rounded-lg">
                                                                                    <button
                                                                                        onClick={() => handleDelete(admin.id, 'pending')}
                                                                                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors duration-150"
                                                                                    >
                                                                                        Confirm
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setConfirmAction(null)}
                                                                                        className="bg-[#E2D9CE] text-[#575553] px-3 py-1 rounded-md hover:bg-[#d0c7bc] transition-colors duration-150"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <motion.button
                                                                                        onClick={() => setConfirmAction(`approve-${admin.id}`)}
                                                                                        disabled={actionInProgress === admin.id}
                                                                                        className="bg-[#36302A] text-white px-3 py-1 rounded-md hover:bg-[#514840] transition-colors duration-150 flex items-center"
                                                                                        whileHover={{ scale: 1.05 }}
                                                                                        whileTap={{ scale: 0.95 }}
                                                                                    >
                                                                                        {actionInProgress === admin.id ? (
                                                                                            <div className="animate-spin mr-1">
                                                                                                <RefreshCw size={14} />
                                                                                            </div>
                                                                                        ) : (
                                                                                            <Check size={14} className="mr-1" />
                                                                                        )}
                                                                                        <span>Approve</span>
                                                                                    </motion.button>
                                                                                    <motion.button
                                                                                        onClick={() => setConfirmAction(`delete-pending-${admin.id}`)}
                                                                                        disabled={actionInProgress === admin.id}
                                                                                        className="bg-red-100 text-red-700 px-2 py-1 sm:px-3 rounded-md hover:bg-red-200 transition-colors duration-150 flex items-center text-xs sm:text-sm"
                                                                                        whileHover={{ scale: 1.05 }}
                                                                                        whileTap={{ scale: 0.95 }}
                                                                                    >
                                                                                        {actionInProgress === admin.id ? (
                                                                                            <div className="animate-spin mr-1">
                                                                                                <RefreshCw size={14} />
                                                                                            </div>
                                                                                        ) : (
                                                                                            <X size={14} className="mr-1" />
                                                                                        )}
                                                                                        <span>Reject</span>
                                                                                    </motion.button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </motion.tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
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
                                            <motion.div
                                                className="bg-[#F8F2EA] rounded-xl p-12 text-center"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EFE7DD] text-[#86807A] mb-4">
                                                    <UserCheck size={24} />
                                                </div>
                                                <h3 className="text-xl font-medium text-[#36302A]">No Approved Admins</h3>
                                                <p className="text-[#86807A] mt-2">
                                                    {searchTerm
                                                        ? 'No matching approved admins found.'
                                                        : 'There are no approved admins yet.'}
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <div className="overflow-x-auto -mx-6 px-6">
                                                <div className="inline-block min-w-full align-middle">
                                                    <table className="w-full divide-y divide-[#E2D9CE]">
                                                        <thead>
                                                            <tr className="bg-[#F8F2EA]">
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">User</th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">Email</th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider hidden sm:table-cell sm:px-6">Gender</th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">Role</th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">
                                                                    <div className="flex items-center">
                                                                        <span>Reviews</span>
                                                                        <span className="ml-1 text-xs text-green-600 font-normal">(assigned)</span>
                                                                    </div>
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">
                                                                    <div className="flex items-center">
                                                                        <span>Bugs</span>
                                                                        <span className="ml-1 text-xs text-red-500 font-normal">(assigned)</span>
                                                                    </div>
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">Last Login</th>
                                                                <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider hidden md:table-cell sm:px-6">Approved</th>
                                                                <th className="px-3 py-3 text-right text-[10px] sm:text-xs font-medium text-[#86807A] uppercase tracking-wider sm:px-6">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-[#E2D9CE]">
                                                            {filteredApprovedAdmins.map((admin, index) => (
                                                                <motion.tr
                                                                    key={admin.id}
                                                                    className="hover:bg-[#F8F2EA] transition-colors duration-150"
                                                                    custom={index}
                                                                    variants={tableRowVariants}
                                                                    initial="hidden"
                                                                    animate="visible"
                                                                    exit="exit"
                                                                >
                                                                    <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                                        <div className="flex items-center">
                                                                            <div
                                                                                className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 bg-[#36302A] rounded-full flex items-center justify-center text-white font-medium cursor-pointer"
                                                                                onClick={() => handleViewProfile(admin)}
                                                                            >
                                                                                {admin.username?.charAt(0).toUpperCase() || 'A'}
                                                                            </div>
                                                                            <div className="ml-3 sm:ml-4">
                                                                                <div
                                                                                    className="text-xs sm:text-sm font-medium text-[#36302A] flex items-center gap-2 cursor-pointer hover:underline group relative"
                                                                                    onClick={() => handleViewProfile(admin)}
                                                                                >
                                                                                    <div className={`h-2 w-2 rounded-full ${admin.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                                                    @{admin.username}
                                                                                    {admin.id === currentAdmin.id && (
                                                                                        <span className="bg-blue-100 text-blue-800 px-1 py-0.5 sm:px-2 rounded-full text-[10px] sm:text-xs">
                                                                                            You
                                                                                        </span>
                                                                                    )}
                                                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-[#36302A] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                                                                        View Profile
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium truncate max-w-[200px]">
                                                                                {admin.email}
                                                                            </span>
                                                                            {admin.isEmailVerified ? (
                                                                                <div className="flex items-center text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                                                                                    <Check size={12} className="mr-1" />
                                                                                    Verified
                                                                                </div>
                                                                            ) : (
                                                                                <motion.button
                                                                                    onClick={() => handleVerifyEmail(admin)}
                                                                                    className="px-4 py-2 rounded-lg flex items-center transition-colors duration-300 bg-[#36302A] text-white"
                                                                                    whileHover={{ scale: 1.03 }}
                                                                                    whileTap={{ scale: 0.97 }}
                                                                                    disabled={loadingNotifications[admin.id]}
                                                                                >
                                                                                    {loadingNotifications[admin.id] ? (
                                                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-2 border-white mr-2"></div>
                                                                                    ) : null}
                                                                                    Verify Email
                                                                                </motion.button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-[#575553] capitalize hidden sm:table-cell sm:px-6">
                                                                        {admin.gender || 'Unspecified'}
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                                        <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium ${admin.role === 'superAdmin'
                                                                            ? 'bg-purple-100 text-purple-800'
                                                                            : 'bg-blue-100 text-blue-800'
                                                                            }`}>
                                                                            {admin.role === 'superAdmin' && (
                                                                                <Shield size={12} className="mr-1" />
                                                                            )}
                                                                            {admin.role || 'admin'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-center sm:px-6">
                                                                        <div className="flex justify-center">
                                                                            <div className={`flex items-center justify-center ${reviewCounts[admin.id] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'} rounded-full px-3 py-1 font-medium`}>
                                                                                {reviewCounts[admin.id] || 0}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-center sm:px-6">
                                                                        <div className="flex justify-center">
                                                                            <div className={`flex items-center justify-center ${bugCounts[admin.id] ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'} rounded-full px-3 py-1 font-medium`}>
                                                                                {bugCounts[admin.id] || 0}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-[#575553] sm:px-6">
                                                                        <div className="flex items-center">
                                                                            <Clock size={14} className="mr-1 sm:mr-2 text-[#86807A]" />
                                                                            {formatDate(admin.lastLogin)}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-[#575553] hidden md:table-cell sm:px-6">
                                                                        <div className="flex items-center">
                                                                            <Calendar size={14} className="mr-1 sm:mr-2 text-[#86807A]" />
                                                                            {formatDate(admin.updatedAt)}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <div className="flex justify-end gap-2">
                                                                            {/* Don't show any actions for current user or for superadmins (except promote button) */}
                                                                            {admin.id !== currentAdmin.id && (
                                                                                <>
                                                                                    {admin.role !== 'superAdmin' && (
                                                                                        <>
                                                                                            {confirmAction === `promote-${admin.id}` ? (
                                                                                                <div className="flex gap-2 bg-[#F8F2EA] p-1 rounded-lg">
                                                                                                    <button
                                                                                                        onClick={() => handlePromote(admin.id)}
                                                                                                        className="bg-purple-600 text-white px-2 py-1 sm:px-3 rounded-md hover:bg-purple-700 transition-colors duration-150 text-xs sm:text-sm"
                                                                                                    >
                                                                                                        Confirm
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => setConfirmAction(null)}
                                                                                                        className="bg-[#E2D9CE] text-[#575553] px-2 py-1 sm:px-3 rounded-md hover:bg-[#d0c7bc] transition-colors duration-150 text-xs sm:text-sm"
                                                                                                    >
                                                                                                        Cancel
                                                                                                    </button>
                                                                                                </div>
                                                                                            ) : confirmAction === `delete-approved-${admin.id}` ? (
                                                                                                <div className="flex gap-2 bg-[#F8F2EA] p-1 rounded-lg">
                                                                                                    <button
                                                                                                        onClick={() => handleDelete(admin.id, 'approved')}
                                                                                                        className="bg-red-600 text-white px-2 py-1 sm:px-3 rounded-md hover:bg-red-700 transition-colors duration-150 text-xs sm:text-sm"
                                                                                                    >
                                                                                                        Confirm
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => setConfirmAction(null)}
                                                                                                        className="bg-[#E2D9CE] text-[#575553] px-3 py-1 rounded-md hover:bg-[#d0c7bc] transition-colors duration-150"
                                                                                                    >
                                                                                                        Cancel
                                                                                                    </button>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <motion.button
                                                                                                        onClick={() => setConfirmAction(`promote-${admin.id}`)}
                                                                                                        disabled={actionInProgress === admin.id}
                                                                                                        className="bg-purple-100 text-purple-800 px-2 py-1 sm:px-3 rounded-md hover:bg-purple-200 transition-colors duration-150 flex items-center text-xs sm:text-sm"
                                                                                                        whileHover={{ scale: 1.05 }}
                                                                                                        whileTap={{ scale: 0.95 }}
                                                                                                    >
                                                                                                        {actionInProgress === admin.id ? (
                                                                                                            <div className="animate-spin mr-1">
                                                                                                                <RefreshCw size={14} />
                                                                                                            </div>
                                                                                                        ) : (
                                                                                                            <Shield size={14} className="mr-1" />
                                                                                                        )}
                                                                                                        <span>Promote</span>
                                                                                                    </motion.button>
                                                                                                    <motion.button
                                                                                                        onClick={() => setConfirmAction(`delete-approved-${admin.id}`)}
                                                                                                        disabled={actionInProgress === admin.id}
                                                                                                        className="bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition-colors duration-150 flex items-center"
                                                                                                        whileHover={{ scale: 1.05 }}
                                                                                                        whileTap={{ scale: 0.95 }}
                                                                                                    >
                                                                                                        {actionInProgress === admin.id ? (
                                                                                                            <div className="animate-spin mr-1">
                                                                                                                <RefreshCw size={14} />
                                                                                                            </div>
                                                                                                        ) : (
                                                                                                            <Trash2 size={14} className="mr-1" />
                                                                                                        )}
                                                                                                        <span>Remove</span>
                                                                                                    </motion.button>
                                                                                                </>
                                                                                            )}
                                                                                        </>
                                                                                    )}

                                                                                    {/* Show non-removable badge for superadmins */}
                                                                                    {admin.role === 'superAdmin' && (
                                                                                        <span className="bg-purple-50 text-purple-600 px-2 py-1 sm:px-3 rounded-md border border-purple-200 inline-flex items-center text-xs sm:text-sm">
                                                                                            <Shield size={14} className="mr-1" />
                                                                                            SuperAdmin
                                                                                        </span>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </motion.tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Admin Profile Modal */}
            <AnimatePresence>
                {selectedAdmin && (
                    <AdminProfileModal
                        admin={selectedAdmin}
                        onClose={handleCloseProfile}
                        currentAdmin={currentAdmin}
                        onUpdate={fetchAdmins}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminManagement;