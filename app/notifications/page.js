'use client';
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAdminAuth } from '../components/providers/AdminAuthProvider';
import { toast } from 'sonner';
import { FaArrowLeft, FaBell, FaCheck, FaCheckDouble, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import ProtectedRoute from '../components/ProtectedRoutes';
import {
    deleteNotification,
    deleteAllNotifications,
    deleteExpiredNotifications
} from './Utility';
import { AlertCircle, Clock, Calendar } from 'lucide-react';

const Notifications = () => {
    const { admin } = useAdminAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteInProgress, setDeleteInProgress] = useState({});

    const fadeInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } },
    };

    // Set up a real-time listener for notifications
    useEffect(() => {
        if (!admin?.id) return;

        // Delete any expired notifications first
        deleteExpiredNotifications()
            .then(deleted => {
                if (deleted > 0) {
                    console.log(`Cleaned up ${deleted} expired notifications`);
                }
            })
            .catch(err => console.error('Error cleaning expired notifications:', err));

        // Set up real-time listener
        const q = query(
            collection(db, 'notifications'),
            where('adminId', '==', admin.id),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notificationData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                expiresAt: doc.data().expiresAt?.toDate() || new Date(Date.now() + 48 * 60 * 60 * 1000)
            }));

            setNotifications(notificationData);
            setLoading(false);
        }, (error) => {
            console.error('Error listening to notifications:', error);
            toast.error('Failed to fetch notifications');
            setLoading(false);
        });

        // Clean up listener on unmount
        return () => unsubscribe();
    }, [admin]);

    const handleDeleteNotification = async (notificationId) => {
        try {
            setDeleteInProgress(prev => ({ ...prev, [notificationId]: true }));

            // Delete the notification
            const success = await deleteNotification(notificationId);

            if (success) {
                // Local state is updated via the onSnapshot listener
                toast.success('Notification dismissed');
            } else {
                toast.error('Failed to dismiss notification');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to dismiss notification');
        } finally {
            setDeleteInProgress(prev => ({ ...prev, [notificationId]: false }));
        }
    };

    const handleDeleteAllNotifications = async () => {
        try {
            setLoading(true);

            if (notifications.length === 0) {
                toast.info('No notifications to clear');
                setLoading(false);
                return;
            }

            // Delete all notifications
            const success = await deleteAllNotifications(admin.id);

            if (success) {
                // Local state is updated via the onSnapshot listener
                toast.success('All notifications cleared');
            } else {
                toast.error('Failed to clear notifications');
            }
        } catch (error) {
            console.error('Error deleting all notifications:', error);
            toast.error('Failed to clear notifications');
        } finally {
            setLoading(false);
        }
    };

    const navigateToReview = () => {
        router.push(`/review-panel69`);
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            return interval === 1 ? '1 year ago' : `${interval} years ago`;
        }

        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval === 1 ? '1 month ago' : `${interval} months ago`;
        }

        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval === 1 ? '1 day ago' : `${interval} days ago`;
        }

        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
        }

        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
        }

        return seconds < 10 ? 'just now' : `${seconds} seconds ago`;
    };

    // Calculate time remaining until expiry
    const getExpiryTime = (expiryDate) => {
        const now = new Date();
        const diff = expiryDate - now;

        // Convert to hours
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));

        if (hoursLeft <= 0) {
            return 'Expiring soon';
        } else if (hoursLeft < 1) {
            return 'Expires in less than an hour';
        } else if (hoursLeft === 1) {
            return 'Expires in 1 hour';
        } else if (hoursLeft < 24) {
            return `Expires in ${hoursLeft} hours`;
        } else {
            const daysLeft = Math.floor(hoursLeft / 24);
            return `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
        }
    };

    // Get notification priority color
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
            case 'highest':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'medium':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            default:
                return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    // Get notification type styling
    const getNotificationTypeStyling = (type) => {
        switch (type) {
            case 'high-priority':
                return {
                    border: 'border-l-red-600',
                    icon: <AlertCircle className="text-red-600" size={22} />,
                    bg: 'bg-red-50'
                };
            case 'assignment':
                return {
                    border: 'border-l-[#36302A]',
                    icon: <FaBell className="text-[#36302A]" size={20} />,
                    bg: 'bg-[#F8F2EA]'
                };
            case 'status-change':
                return {
                    border: 'border-l-blue-600',
                    icon: <AlertCircle className="text-blue-600" size={22} />,
                    bg: 'bg-blue-50'
                };
            default:
                return {
                    border: 'border-l-[#36302A]',
                    icon: <FaBell className="text-[#36302A]" size={20} />,
                    bg: 'bg-[#F8F2EA]'
                };
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#FAF4ED] py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={fadeInLeft}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#E2D9CE] py-6 pb-4 mb-8">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold text-[#36302A]">
                                Notifications
                            </h1>
                            <div className="relative">
                                <FaBell className="text-3xl text-[#36302A]" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {notifications.length}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <button
                                onClick={() => router.push('/review-panel69')}
                                className="px-4 py-2.5 bg-[#36302A] text-white font-medium rounded-lg shadow-md hover:bg-[#514840] transition-all duration-200 flex items-center gap-2"
                            >
                                <FaArrowLeft className="text-lg" />
                                <span>Back to Review Panel</span>
                            </button>
                            <button
                                onClick={handleDeleteAllNotifications}
                                className="px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 flex items-center gap-2"
                                disabled={notifications.length === 0 || loading}
                            >
                                <FaTrash className="text-lg" />
                                <span>Clear All</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-2 border-[#36302A] opacity-75"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-[#36302A] text-sm font-medium">
                                    Loading
                                </div>
                            </div>
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map(notification => {
                            const typeStyling = getNotificationTypeStyling(notification.type);

                            return (
                                <Card
                                    key={notification.id}
                                    className={`transition-all duration-300 hover:shadow-md border-l-4 ${typeStyling.border} bg-white`}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {typeStyling.icon}
                                                        <p className="text-sm text-[#86807A] flex items-center">
                                                            <Clock size={14} className="mr-2" />
                                                            {getTimeAgo(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-[#86807A]">{getExpiryTime(notification.expiresAt)}</p>
                                                </div>
                                                <h3 className="text-xl font-medium text-[#36302A] mb-2">{notification.title}</h3>
                                                <p className="text-[#575553] mb-4">{notification.message}</p>

                                                {notification.reviewData && (
                                                    <div className={`${typeStyling.bg} p-4 rounded-md mb-4 border border-[#E2D9CE]`}>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <span className="font-medium text-[#36302A]">Client:</span>{' '}
                                                                <span className="text-[#575553]">
                                                                    {notification.reviewData.firstName} {notification.reviewData.lastName}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-[#36302A]">Brand:</span>{' '}
                                                                <span className="text-[#575553]">
                                                                    {notification.reviewData.company}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-[#36302A]">Priority:</span>{' '}
                                                                <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(notification.reviewData.priority)}`}>
                                                                    {notification.reviewData.priority}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-[#36302A]">Status:</span>{' '}
                                                                <span className="text-[#575553]">
                                                                    {notification.reviewData.clientStatus}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 mt-4">
                                                    {notification.reviewId && (
                                                        <button
                                                            onClick={() => navigateToReview(notification.reviewId)}
                                                            className="px-4 py-2 bg-[#36302A] text-white text-sm rounded-lg hover:bg-[#514840] transition-colors flex items-center gap-2"
                                                        >
                                                            <span>View Inquiry</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDeleteNotification(notification.id)}
                                                        disabled={deleteInProgress[notification.id]}
                                                        className="px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                                                    >
                                                        {deleteInProgress[notification.id] ? (
                                                            <div className="animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent"></div>
                                                        ) : (
                                                            <FaTrash size={14} />
                                                        )}
                                                        Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <Card className="bg-white rounded-xl shadow-sm">
                            <div className="p-10 text-center">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EFE7DD] text-[#86807A] mb-4">
                                        <FaBell className="text-3xl" />
                                    </div>
                                    <h3 className="text-xl font-medium text-[#36302A]">No notifications</h3>
                                    <p className="text-[#86807A] max-w-md mx-auto">
                                        You&apos;ll be notified when you&apos;re assigned to new inquiries or receive important updates.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}
                </motion.div>
            </div>
        </ProtectedRoute>
    );
};

export default Notifications;