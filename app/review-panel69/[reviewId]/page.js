"use client";
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { toast } from "sonner";
import { FaArrowLeft, FaExternalLinkAlt, FaSync } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { HiBellAlert } from "react-icons/hi2";
import PriorityDisplay from "../../components/PriorityDisplay";
import ProtectedRoute from "../../components/ProtectedRoutes";
import { useAdminAuth } from "../../components/providers/AdminAuthProvider";
import { createHighPriorityNotification, createReviewStatusChangeNotification } from "../../notifications/Utility";
import Link from "next/link";

const ReviewDetailPage = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const router = useRouter();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingNotification, setLoadingNotification] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { admin } = useAdminAuth();

    // Get the reviewId from the URL
    const [reviewId, setReviewId] = useState(null);

    useEffect(() => {
        // Extract reviewId from the URL in client-side
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[pathParts.length - 1];
        setReviewId(id);

        if (id) {
            fetchReviewData(id);
        }
    }, []);

    const fetchReviewData = async (id) => {
        try {
            setLoading(true);
            const reviewRef = doc(db, "reviews", id);
            const docSnap = await getDoc(reviewRef);

            if (docSnap.exists()) {
                const reviewData = {
                    docId: docSnap.id,
                    ...docSnap.data(),
                    priority: docSnap.data().priority || "low",
                    clientStatus: docSnap.data().clientStatus || "Pending",
                    assignedTo: docSnap.data().assignedTo || null,
                    assignedToName: docSnap.data().assignedToName || "Unassigned"
                };

                // Check if the regular admin has access to this review
                if (admin && admin.role !== 'superAdmin' && reviewData.assignedTo !== admin.id) {
                    toast.error("You don't have access to this review");
                    router.push('/review-panel69');
                    return;
                }

                setReview(reviewData);
            } else {
                toast.error("Review not found");
                router.push('/review-panel69');
            }
        } catch (error) {
            console.error("Error fetching review:", error);
            toast.error("Failed to fetch review data");
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityUpdate = async (newPriority) => {
        if (!review || isSaving) return;

        try {
            setIsSaving(true);
            const reviewRef = doc(db, "reviews", review.docId);

            // Get the old priority for comparison
            const oldPriority = review.priority;

            // Update the priority in Firestore
            await updateDoc(reviewRef, {
                priority: newPriority,
                priorityChangedBy: admin?.id || 'system',
                priorityChangedAt: new Date()
            });

            // Create notification if:
            // 1. The review is assigned to someone else
            // 2. The priority is changed to high or highest
            // 3. The priority was previously not high or highest
            const isHighPriority = newPriority === 'high' || newPriority === 'highest';
            const wasHighPriority = oldPriority === 'high' || oldPriority === 'highest';

            if (review.assignedTo &&
                review.assignedTo !== admin?.id &&
                isHighPriority &&
                !wasHighPriority) {
                try {
                    // Create a high priority notification
                    await createHighPriorityNotification({
                        adminId: review.assignedTo,
                        reviewId: review.docId,
                        reviewData: {
                            ...review,
                            priority: newPriority // Make sure to use the new priority value
                        }
                    });
                } catch (notifError) {
                    console.error("Error creating priority notification:", notifError);
                }
            }

            // Update local state
            setReview({
                ...review,
                priority: newPriority,
                priorityChangedBy: admin?.id || 'system',
                priorityChangedAt: new Date()
            });

            toast.success("Priority updated successfully!");
        } catch (error) {
            console.error("Error updating priority:", error);
            toast.error("Failed to update priority. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClientStatusUpdate = async (newStatus) => {
        if (!review || isSaving) return;

        try {
            setIsSaving(true);
            const reviewRef = doc(db, "reviews", review.docId);
            const currentStatus = review.clientStatus;
            const updateData = { clientStatus: newStatus };

            // If moving to "In Progress" from "Pending", store the timestamp
            if (currentStatus === "Pending" && newStatus === "In Progress") {
                updateData.inProgressStartedAt = new Date();
            }

            // If moving away from "In Progress", optionally clear the timestamp
            if (currentStatus === "In Progress" && newStatus !== "In Progress") {
                updateData.inProgressStartedAt = null;
            }

            // Add who made the status change
            updateData.statusChangedBy = admin?.id || 'system';
            updateData.statusChangedAt = new Date();

            await updateDoc(reviewRef, updateData);

            // Create notification for the assigned admin (if there is one and it's not the current user)
            if (review.assignedTo && review.assignedTo !== admin?.id) {
                try {
                    await createReviewStatusChangeNotification({
                        adminId: review.assignedTo,
                        reviewId: review.docId,
                        reviewData: review,
                        oldStatus: currentStatus,
                        newStatus: newStatus,
                        changedBy: admin?.id || 'system'
                    });
                } catch (notifError) {
                    console.error("Error creating status change notification:", notifError);
                }
            }

            // Update local state
            setReview({
                ...review,
                clientStatus: newStatus,
                inProgressStartedAt: updateData.inProgressStartedAt,
                statusChangedBy: updateData.statusChangedBy,
                statusChangedAt: updateData.statusChangedAt
            });

            toast.success("Client status updated successfully!");
        } catch (error) {
            console.error("Error updating client status:", error);
            toast.error("Failed to update client status. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendNotification = async () => {
        if (loadingNotification || !review) return;

        try {
            setLoadingNotification(true);
            toast.info('Notification email queued for sending!');

            // Start the email sending process in the background
            fetch('/api/send-notification-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: review.email,
                    firstName: review.firstName,
                }),
            });

            // Hardcoded time period for loading state
            const LOADING_DURATION = 3000;

            setTimeout(() => {
                toast.success('Client notification email sent successfully!');
                setLoadingNotification(false);
            }, LOADING_DURATION);

        } catch (error) {
            console.error('Error queueing notification email:', error);
            toast.error('Failed to queue notification email. Please try again.');
            setLoadingNotification(false);
        }
    };

    const CopyableText = ({ text, label }) => {
        if (!text) return <span className="text-gray-400">Not provided</span>;

        const handleCopy = () => {
            navigator.clipboard.writeText(text)
                .then(() => toast.success(`${label} copied to clipboard!`))
                .catch(() => toast.error('Failed to copy to clipboard'));
        };

        return (
            <div className="group cursor-pointer flex items-center" onClick={handleCopy}>
                <span className="group-hover:text-green-600 group-hover:underline">{text}</span>
                <FaExternalLinkAlt className="ml-2 opacity-0 group-hover:opacity-100 text-green-600 h-3 w-3" />
            </div>
        );
    };

    const StatusDisplay = ({ status }) => {
        const getStatusStyle = (status) => {
            switch (status) {
                case 'Pending':
                    return 'bg-orange-100 text-orange-800 border-orange-300';
                case 'In Progress':
                    return 'bg-blue-100 text-blue-800 border-blue-300';
                case 'No Response':
                    return 'bg-red-100 text-red-800 border-red-300';
                case 'Reached out':
                    return 'bg-green-100 text-green-800 border-green-300';
                default:
                    return 'bg-gray-100 text-gray-800 border-gray-300';
            }
        };

        return (
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusStyle(status)}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-green-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!review) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-green-50">
                <h1 className="text-2xl font-bold text-red-600">Review not found</h1>
                <button
                    onClick={() => router.push('/review-panel69')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    Return to Review Panel
                </button>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
                <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    className="max-w-7xl mx-auto"
                >
                    {/* Header with Back Button */}
                    <div className="flex justify-between items-center mb-8">
                        <button
                            onClick={() => router.push('/review-panel69')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                        >
                            <FaArrowLeft />
                            <span>Back to Review Panel</span>
                        </button>

                        <button
                            onClick={() => fetchReviewData(reviewId)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                        >
                            <FaSync className={loading ? "animate-spin" : ""} />
                            <span>Refresh</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        {/* Review Header */}
                        <div className="bg-green-600 px-6 py-4 flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-white">
                                Review Details
                            </h1>
                            <div className="flex items-center space-x-3">
                                <PriorityDisplay priority={review.priority} />
                                <StatusDisplay status={review.clientStatus} />
                            </div>
                        </div>

                        {/* Main Content - Two Columns */}
                        <div className="p-6 md:grid md:grid-cols-2 gap-8">
                            {/* Left Column: Client Information */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-green-800 border-b border-green-200 pb-2">
                                    Client Information
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Client Name</label>
                                        <div className="mt-1 text-lg">
                                            {review.firstName} {review.lastName}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Email Address</label>
                                        <div className="mt-1 text-lg">
                                            <CopyableText text={review.email} label="Email" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                                        <div className="mt-1 text-lg">
                                            <CopyableText
                                                text={review.phoneDialCode && review.phoneNumber ?
                                                    `${review.phoneDialCode} ${review.phoneNumber}` :
                                                    review.phoneNumber}
                                                label="Phone"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Brand/Company</label>
                                        <div className="mt-1 text-lg">
                                            <CopyableText text={review.company} label="Company" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Newsletter Subscription</label>
                                        <div className="mt-1">
                                            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${review.isChecked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {review.isChecked ? 'Subscribed' : 'Not Subscribed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-xl font-semibold mt-8 mb-4 text-green-800 border-b border-green-200 pb-2">
                                    Online Presence
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Website</label>
                                        <div className="mt-1 text-lg">
                                            {review.website ? (
                                                <a
                                                    href={review.website.startsWith('http') ? review.website : `http://${review.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:underline flex items-center"
                                                >
                                                    {review.website}
                                                    <FaExternalLinkAlt className="ml-2 h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">Not provided</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Social Media</label>
                                        <div className="mt-1 text-lg">
                                            {review.socials ? (
                                                <a
                                                    href={review.socials.startsWith('http') ? review.socials : `http://${review.socials}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:underline flex items-center"
                                                >
                                                    {review.socials}
                                                    <FaExternalLinkAlt className="ml-2 h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">Not provided</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Review Details */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-green-800 border-b border-green-200 pb-2">
                                    Review Details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Requested Services</label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            {review.services || <span className="text-gray-400">Not specified</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Client Message</label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                            {review.messages || <span className="text-gray-400">No message provided</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Assigned To</label>
                                        <div className="mt-1 flex items-center">
                                            <span className={`px-3 py-1 text-sm leading-5 font-semibold rounded-full ${review.assignedTo ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {review.assignedToName}
                                            </span>
                                            {review.assignedAt && (
                                                <span className="ml-2 text-sm text-gray-500">
                                                    on {new Date(review.assignedAt.seconds * 1000).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Submission Time</label>
                                        <div className="mt-1 text-lg">
                                            {review.movedToReviewAt ?
                                                new Date(review.movedToReviewAt.seconds * 1000).toLocaleString() :
                                                "N/A"}
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-xl font-semibold mt-8 mb-4 text-green-800 border-b border-green-200 pb-2">
                                    Actions
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">Update Priority</label>
                                        <select
                                            value={review.priority}
                                            onChange={(e) => handlePriorityUpdate(e.target.value)}
                                            disabled={isSaving}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="highest">Highest</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">Update Client Status</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Pending", "In Progress", "No Response", "Reached out"].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleClientStatusUpdate(status)}
                                                    disabled={review.clientStatus === status || isSaving}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${review.clientStatus === status
                                                        ? 'bg-green-100 text-green-800 border-2 border-green-500 cursor-default'
                                                        : 'bg-white border border-gray-300 hover:bg-green-50 text-gray-700'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            onClick={handleSendNotification}
                                            disabled={loadingNotification}
                                            className="w-full flex justify-center items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                        >
                                            {loadingNotification ? (
                                                <>
                                                    <span className="animate-spin">⌛</span>
                                                    <span>Sending Notification...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <HiBellAlert className="text-lg" />
                                                    <span>Send Client Notification</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History Section */}
                        <div className="border-t border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-semibold mb-4 text-green-800">Activity Timeline</h2>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-green-500 mt-1"></div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">Review Created</p>
                                        <p className="text-sm text-gray-500">
                                            {review.movedToReviewAt ?
                                                new Date(review.movedToReviewAt.seconds * 1000).toLocaleString() :
                                                "N/A"}
                                        </p>
                                    </div>
                                </div>

                                {review.assignedAt && (
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500 mt-1"></div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                Assigned to {review.assignedToName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(review.assignedAt.seconds * 1000).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {review.statusChangedAt && (
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-purple-500 mt-1"></div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                Status changed to {review.clientStatus}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(review.statusChangedAt.seconds * 1000).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {review.priorityChangedAt && (
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-yellow-500 mt-1"></div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                Priority changed to {review.priority}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(review.priorityChangedAt.seconds * 1000).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {review.inProgressStartedAt && (
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-indigo-500 mt-1"></div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                Started processing review
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(review.inProgressStartedAt.seconds * 1000).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </ProtectedRoute>
    );
};

export default ReviewDetailPage;