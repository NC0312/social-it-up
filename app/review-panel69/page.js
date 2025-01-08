"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, writeBatch, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { MdDeleteForever, MdContentCopy } from "react-icons/md";
import { FaArrowLeft, FaExternalLinkAlt, FaFileDownload, FaFileExcel, FaSync } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { BsFillSendFill } from "react-icons/bs";
import { HiBellAlert } from "react-icons/hi2";
import PriorityDisplay from "../components/PriorityDisplay";
import { AlertCircle, Badge, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ReviewPanel = () => {
    const fadeInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
    };

    const fadeInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } },
    };
    const router = useRouter();
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [signedUp, setSignedUp] = useState("");
    const [selectedPriority, setSelectedPriority] = useState("");
    const [selectedClientStatus, setSelectedClientStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState({});
    const [issyncing, setIssyncing] = useState(false);
    const entriesPerPage = 20;

    const fetchReviews = async () => {
        try {
            const q = query(
                collection(db, "reviews"),
                orderBy("movedToReviewAt", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({
                docId: doc.id,
                ...doc.data(),
                priority: doc.data().priority || "low",
                clientStatus: doc.data().clientStatus || "Pending"
            }));
            setReviews(data);
            setFilteredReviews(data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to fetch reviews");
        }
    };

    const syncData = async () => {
        setIssyncing(true);
        try {
            const reviewsRef = collection(db, "reviews");
            const q = query(reviewsRef, orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            const newData = querySnapshot.docs.map(doc => ({
                docId: doc.id,
                ...doc.data(),
                clientStatus: doc.data().clientStatus || "Pending"
            }));
            setReviews(newData);
            setFilteredReviews(newData);
            toast.success("Data refreshed successfully!");
        } catch (error) {
            console.error("Error refreshing data:", error);
            toast.error("Failed to refresh data");
        } finally {
            setIssyncing(false);
        }
    };

    const handleDeleteAllReviews = async () => {
        if (isDeletingAll) return;

        try {
            setIsDeletingAll(true);

            if (!window.confirm("Are you sure you want to delete ALL reviews? This action cannot be undone!")) {
                setIsDeletingAll(false);
                return;
            }

            const reviewsCollection = collection(db, "reviews");
            const snapshot = await getDocs(reviewsCollection);

            const batchSize = 500;
            let batch = writeBatch(db);
            let count = 0;
            let totalDeleted = 0;

            for (const document of snapshot.docs) {
                batch.delete(doc(db, "reviews", document.id));
                count++;
                totalDeleted++;

                if (count >= batchSize) {
                    await batch.commit();
                    batch = writeBatch(db);
                    count = 0;
                }
            }

            if (count > 0) {
                await batch.commit();
            }

            setReviews([]);
            setFilteredReviews([]);
            setCurrentPage(1);

            toast.success(`Successfully deleted ${totalDeleted} reviews!`);

        } catch (error) {
            console.error("Error deleting all reviews:", error);
            toast.error("Failed to delete all reviews. Please try again.");
        } finally {
            setIsDeletingAll(false);
        }
    };

    const handleDeleteReview = async (docId) => {
        if (isDeleting) return;

        try {
            setIsDeleting(true);

            if (!window.confirm("Are you sure you want to delete this review?")) {
                setIsDeleting(false);
                return;
            }

            const reviewRef = doc(db, "reviews", docId);
            await deleteDoc(reviewRef);

            const updatedReviews = reviews.filter((review) => review.docId !== docId);
            const updatedFilteredReviews = filteredReviews.filter((review) => review.docId !== docId);

            setReviews(updatedReviews);
            setFilteredReviews(updatedFilteredReviews);
            toast.success("Review deleted successfully!");

            if (currentPage > 1 && updatedFilteredReviews.slice(
                (currentPage - 1) * entriesPerPage,
                currentPage * entriesPerPage
            ).length === 0) {
                setCurrentPage(currentPage - 1);
            }

        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleSignUpChange = (e) => {
        setSignedUp(e.target.value);
    };

    const handlePriorityChange = (e) => {
        setSelectedPriority(e.target.value);
    };

    const handleClientStatusChange = (e) => {
        setSelectedClientStatus(e.target.value);
    };

    const handleFetchData = () => {
        let filtered = reviews;

        if (selectedDate) {
            const selectedDateStart = new Date(selectedDate);
            const selectedDateEnd = new Date(selectedDate);
            selectedDateEnd.setHours(23, 59, 59, 999);

            filtered = filtered.filter(review => {
                const reviewDate = new Date(review.movedToReviewAt.seconds * 1000);
                return reviewDate >= selectedDateStart && reviewDate <= selectedDateEnd;
            });
        }

        if (signedUp) {
            filtered = filtered.filter(review => {
                if (signedUp === "Yes") {
                    return review.isChecked === true;
                } else if (signedUp === "No") {
                    return review.isChecked === false;
                }
                return true;
            });
        }

        if (selectedPriority) {
            filtered = filtered.filter(review => review.priority === selectedPriority);
        }

        if (selectedClientStatus) {
            filtered = filtered.filter(review => review.clientStatus === selectedClientStatus);
        }

        setFilteredReviews(filtered);
        setCurrentPage(1);

        if (filtered.length > 0) {
            toast.success("Data filtered successfully!");
        } else {
            toast.warning("No data matches the selected filters.");
        }
    };

    const totalPages = Math.ceil(filteredReviews.length / entriesPerPage);
    const displayedReviews = filteredReviews.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * entriesPerPage + 1;
    const endIndex = Math.min(currentPage * entriesPerPage, filteredReviews.length);

    const CopyableText = ({ text, type }) => {
        const handleCopy = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text)
                .then(() => toast.success(`${type} copied to clipboard!`))
                .catch(() => toast.error('Failed to copy to clipboard'));
        };

        const handleEmailRedirect = (e) => {
            e.stopPropagation();
            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(text)}`, '_blank');
        };

        return (
            <div className="flex items-center space-x-2 group">
                <span
                    className="group-hover:underline hover:text-green-500 cursor-pointer"
                    onClick={handleCopy}
                >
                    {text}
                </span>
                {type === "Email" ? (
                    <div className="flex flex-row justify-between items-center space-x-2">
                        <div className="relative group/tooltip">
                            <FaExternalLinkAlt
                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-green-600 hover:text-green-600"
                                onClick={handleEmailRedirect}
                            />
                            <span className="absolute hidden group-hover/tooltip:block bg-green-700 text-white text-sm rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                Open in Gmail
                            </span>
                        </div>
                        <div className="relative group/tooltip">
                            <MdContentCopy
                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer  text-green-600 hover:text-green-600"
                                onClick={handleCopy}
                            />
                            <span className="absolute hidden group-hover/tooltip:block bg-green-700 text-white text-sm rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                Copy to clipboard
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="relative group/tooltip">
                        <MdContentCopy
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-green-500 hover:text-green-600"
                            onClick={handleCopy}
                        />
                        <span className="absolute hidden group-hover/tooltip:block bg-green-700 text-white text-sm rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            Copy to clipboard
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const ExternalLink = ({ url }) => {
        const handleClick = () => {
            if (!url) return;

            const finalUrl = url.startsWith('http') ? url : `http://${url}`;
            window.open(finalUrl, '_blank', 'noopener,noreferrer');
        };

        return url ? (
            <div
                className="flex items-center space-x-2 cursor-pointer hover:text-green-600 group"
                onClick={handleClick}
                title="Open in new tab"
            >
                <span className="group-hover:underline">{url}</span>
                <FaExternalLinkAlt className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        ) : "N/A";
    };

    const handleSendNotification = async (email, firstName, docId) => {
        if (loadingNotifications[docId]) return; // Prevent multiple clicks

        try {
            setLoadingNotifications(prev => ({ ...prev, [docId]: true }));

            const response = await fetch('/api/send-notification-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    firstName,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send notification email');
            }

            toast.success('Notification email sent successfully!');
        } catch (error) {
            console.error('Error sending notification email:', error);
            toast.error('Failed to send notification email. Please try again.');
        } finally {
            setLoadingNotifications(prev => ({ ...prev, [docId]: false }));
        }
    };

    const convertToCSV = (data) => {
        const headers = ["Timestamp", "FirstName", "LastName", "Email", "SignedUp", "DialCode", "PhoneNumber", "BrandName", "Services", "Socials", "Website", "Messages", "Priority", "ClientStatus"];
        const csvRows = [headers.join(',')];

        for (const review of data) {
            const row = [
                new Date(review.movedToReviewAt.seconds * 1000).toLocaleString(),
                review.firstName,
                review.lastName,
                review.email,
                review.isChecked ? "Yes" : "No",
                review.phoneDialCode,
                `"${review.phoneNumber}"`,
                review.company,
                review.services,
                review.socials,
                review.website,
                review.messages,
                review.priority,
                review.clientStatus
            ];
            csvRows.push(row.map(field => `"${field}"`).join(','));
        }

        return csvRows.join('\n');
    };


    const handleDownloadCSV = () => {
        const csvContent = convertToCSV(filteredReviews);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "reviews.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handlePriorityUpdate = async (docId, newPriority) => {
        try {
            const reviewRef = doc(db, "reviews", docId);
            await updateDoc(reviewRef, { priority: newPriority });

            // Update local state
            const updatedReviews = reviews.map(review =>
                review.docId === docId ? { ...review, priority: newPriority } : review
            );
            setReviews(updatedReviews);
            setFilteredReviews(updatedReviews);

            toast.success("Priority updated successfully!");
        } catch (error) {
            console.error("Error updating priority:", error);
            toast.error("Failed to update priority. Please try again.");
        }
    };

    const handleClientStatusUpdate = async (docId, currentStatus) => {
        // Only allow changing from 'Pending' to 'Reached out'
        if (currentStatus === 'Reached out') {
            toast.info("Client status cannot be changed back to Pending.");
            return;
        }

        if (!window.confirm("Are you sure you want to update the client status to 'Reached out'? This action cannot be undone.")) {
            return;
        }

        try {
            const reviewRef = doc(db, "reviews", docId);
            await updateDoc(reviewRef, { clientStatus: 'Reached out' });

            // Update local state
            const updatedReviews = reviews.map(review =>
                review.docId === docId ? { ...review, clientStatus: 'Reached out' } : review
            );
            setReviews(updatedReviews);
            setFilteredReviews(updatedReviews);

            toast.success("Client status updated successfully!");
        } catch (error) {
            console.error("Error updating client status:", error);
            toast.error("Failed to update client status. Please try again.");
        }
    };

    const StatusCell = ({ status }) => {
        const getStatusConfig = (status) => {
            switch (status) {
                case 'Pending':
                    return {
                        bgColor: 'bg-orange-50',
                        textColor: 'text-orange-700',
                        borderColor: 'border-orange-200',
                        prefix: '•'
                    };
                case 'Reached out':
                    return {
                        bgColor: 'bg-green-50',
                        textColor: 'text-green-700',
                        borderColor: 'border-green-200',
                        prefix: '✓'
                    };
                default:
                    return {
                        bgColor: 'bg-gray-50',
                        textColor: 'text-gray-700',
                        borderColor: 'border-gray-200',
                        prefix: '•'
                    };
            }
        };

        const config = getStatusConfig(status);

        return (
            <div className={`
                inline-flex items-center gap-2 
                px-4 py-2 rounded-lg 
                ${config.bgColor} 
                ${config.textColor} 
                border ${config.borderColor}
                font-semibold text-base
                transition-all duration-200
            `}>
                <span className="text-lg">{config.prefix}</span>
                <span>{status}</span>
            </div>
        );
    };

    const UpdateStatusCell = ({ status, onUpdate, disabled }) => {
        return (
            <button
                onClick={onUpdate}
                disabled={disabled}
                className={`group relative flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${disabled
                    ? 'bg-gray-100 cursor-not-allowed'
                    : 'bg-green-50 hover:bg-green-100 active:bg-green-200'
                    }`}
            >
                <CheckCircle
                    className={`w-6 h-6 transition-all duration-200 ${disabled ? 'text-gray-400' : 'text-green-600 group-hover:text-green-700'
                        }`}
                />

                {/* Tooltip */}
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {disabled ? 'Already reached out' : 'Mark as reached out'}
                </span>
            </button>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
            <motion.div
                variants={fadeInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="flex flex-col md:flex-row justify-between items-center border-b border-green-300/50 py-6 pb-4 mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl md:text-6xl font-serif font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
                            Review Panel
                        </h1>
                        <span className="text-4xl animate-bounce">📋</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin-panel69')}
                            className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 hover:translate-x-[-4px]"
                        >
                            <FaArrowLeft className="text-lg" />
                            <span>Back to Admin Panel</span>
                        </button>
                        <button
                            onClick={handleDeleteAllReviews}
                            disabled={isDeletingAll}
                            className="px-4 py-2.5 bg-red-600/90 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                        >
                            <MdDeleteForever className="text-xl" />
                            <span>{isDeletingAll ? 'Deleting...' : 'Delete All'}</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Filter Section */}
            <motion.div
                variants={fadeInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-white p-6 rounded-xl shadow-sm border border-green-100">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-green-800 flex items-center gap-2" htmlFor="date-filter">
                            <span className="text-lg">📅</span> Filter by Date
                        </label>
                        <input
                            id="date-filter"
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-full border border-green-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>

                    {/* Similar enhancements for other filter inputs */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-green-800 flex items-center gap-2" htmlFor="signup-filter">
                            <span className="text-lg">📝</span> Newsletter Signup
                        </label>
                        <select
                            id="signup-filter"
                            value={signedUp}
                            onChange={handleSignUpChange}
                            className="w-full border border-green-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                            <option value="">All Signups</option>
                            <option value="Yes">Subscribed</option>
                            <option value="No">Not Subscribed</option>
                        </select>
                    </div>

                    {/* Enhanced Priority Filter */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-green-800 flex items-center gap-2" htmlFor="priority-filter">
                            <span className="text-lg">🎯</span> Priority Level
                        </label>
                        <select
                            id="priority-filter"
                            value={selectedPriority}
                            onChange={handlePriorityChange}
                            className="w-full border border-green-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                            <option value="">All Priorities</option>
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="highest">Highest Priority</option>
                        </select>
                    </div>

                    {/* Enhanced Client Status Filter */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-green-800 flex items-center gap-2" htmlFor="client-status-filter">
                            <span className="text-lg">📊</span> Client Status
                        </label>
                        <select
                            id="client-status-filter"
                            value={selectedClientStatus}
                            onChange={handleClientStatusChange}
                            className="w-full border border-green-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Reached out">Reached Out</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Action Buttons */}
            <motion.div
                variants={fadeInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="flex flex-wrap gap-4 mb-8">
                    <button
                        onClick={handleFetchData}
                        className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                    >
                        <span className="text-lg">🔍</span>
                        Apply Filters
                    </button>
                    <button
                        onClick={() => {
                            setSelectedDate("");
                            setSignedUp("");
                            setSelectedPriority("");
                            setSelectedClientStatus("");
                            setFilteredReviews(reviews);
                            toast.success("Filters cleared!");
                        }}
                        className="px-6 py-2.5 bg-red-600/90 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                    >
                        <MdDeleteForever className="text-xl" />
                        Clear Filters
                    </button>
                    <button
                        onClick={handleDownloadCSV}
                        className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                    >
                        <FaFileExcel className="text-xl" />
                        <span className="hidden md:inline">Export CSV</span>
                    </button>
                    <button
                        onClick={syncData}
                        disabled={issyncing}
                        className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 hover:scale-105 disabled:opacity-50"
                    >
                        <FaSync className={`text-xl ${issyncing ? 'animate-spin' : ''}`} />
                        <span>{issyncing ? 'Syncing...' : 'Sync Data'}</span>
                    </button>
                </div>
            </motion.div>

            <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="relative w-full overflow-hidden bg-white shadow-md rounded-lg">
                    <div
                        className="overflow-x-auto scrollbar-hide"
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            WebkitOverflowScrolling: "touch",
                        }}
                    >
                        <table className="min-w-full table-auto border-collapse border border-green-200">
                            <thead className="bg-green-600 text-white">
                                <tr>
                                    {[
                                        "Action",
                                        "Priority",
                                        "ChangePriority",
                                        "Client Status",
                                        "Update Status",
                                        "Timestamp",
                                        "FirstName",
                                        "LastName",
                                        "Email",
                                        "Notify",
                                        "SignedUp",
                                        "DialCode",
                                        "PhoneNumber",
                                        "BrandName",
                                        "Services",
                                        "Socials",
                                        "Website",
                                        "Messages",
                                    ].map((header) => (
                                        <th
                                            key={header}
                                            className="border border-green-500 px-4 md:px-4 py-2 md:py-4 text-left text-xs md:text-md md:text-base font-semibold"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayedReviews.length > 0 ? (
                                    displayedReviews.map((review) => (
                                        <tr key={review.docId} className={`hover:bg-green-50 ${review.clientStatus === 'Reached out' ? 'opacity-50' : ''}`}>
                                            <td className="border border-green-200 px-4 md:px-7 py-2 md:py-2 text-xs md:text-base">
                                                <button
                                                    onClick={() => handleDeleteReview(review.docId)}
                                                    className="text-red-500 hover:text-red-700 text-lg md:text-2xl"
                                                    title="Delete"
                                                >
                                                    <MdDeleteForever />
                                                </button>
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 text-sm md:text-base">
                                                <PriorityDisplay priority={review.priority} />
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 text-sm md:text-base">
                                                <select
                                                    value={review.priority}
                                                    onChange={(e) => handlePriorityUpdate(review.docId, e.target.value)}
                                                    className="w-full border border-green-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="highest">Highest</option>
                                                </select>
                                            </td>
                                            <td className="border border-green-200 px-4 py-2">
                                                <StatusCell status={review.clientStatus} />
                                            </td>
                                            <td className="border border-green-200 px-4 py-2">
                                                <UpdateStatusCell
                                                    status={review.clientStatus}
                                                    onUpdate={() => handleClientStatusUpdate(review.docId, review.clientStatus)}
                                                    disabled={review.clientStatus === 'Reached out'}
                                                />
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base whitespace-nowrap">
                                                {review.movedToReviewAt
                                                    ? new Date(review.movedToReviewAt.seconds * 1000).toLocaleString()
                                                    : "N/A"}
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                                                {review.firstName}
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                                                {review.lastName}
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base" style={{ userSelect: "none" }}>
                                                <CopyableText text={review.email} type="Email" />
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 text-sm md:text-base">
                                                <button
                                                    onClick={() => handleSendNotification(review.email, review.firstName, review.docId)}
                                                    className={`px-2 py-1 rounded-md transition-colors duration-200 flex items-center space-x-1 ${review.clientStatus === 'Reached out'
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                                        }`}
                                                    title={review.clientStatus === 'Reached out' ? 'Already reached out' : 'Send Notification'}
                                                    disabled={loadingNotifications[review.docId] || review.clientStatus === 'Reached out'}
                                                >
                                                    {loadingNotifications[review.docId] ? (
                                                        <span className="animate-spin">⌛</span>
                                                    ) : (
                                                        <HiBellAlert className="text-sm md:text-base" />
                                                    )}
                                                    <span className="hidden md:inline">
                                                        {loadingNotifications[review.docId] ? 'Sending...' : 'Notify'}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                                                {review.isChecked ? "Yes" : "No"}
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                                                {review.phoneDialCode}
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base" style={{ userSelect: "none" }}>
                                                <CopyableText
                                                    text={`${review.phoneNumber}`}
                                                    type="Phone number"
                                                />
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base" style={{ userSelect: "none" }}>
                                                <CopyableText
                                                    text={`${review.company}`}
                                                    type="Brand Name"
                                                />
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                                                {review.services}
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                                                <ExternalLink url={review.socials} />
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                                                <ExternalLink url={review.website} />
                                            </td>
                                            <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                                                {review.messages}
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="18" className="text-center py-4">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* Pagination */}
            {filteredReviews.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center py-4">
                    <div>
                        <span className="text-sm md:text-lg text-green-700">
                            Total Records: {filteredReviews.length} | Showing {startIndex} to {endIndex} of {filteredReviews.length} records | DB Limit: 6500 records
                        </span>
                    </div>
                    <div className="space-y-0 md:space-y-0 space-x-4 md:space-x-4 flex flex-row md:flex-row">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-[#FAF4ED] bg-green-600 rounded-md shadow-md hover:bg-green-700 w-full md:w-auto"
                        >
                            First
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-[#FAF4ED] bg-green-600 rounded-md shadow-md hover:bg-green-700 w-full md:w-auto"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-[#FAF4ED] bg-green-600 rounded-md shadow-md hover:bg-green-700 w-full md:w-auto"
                        >
                            Next
                        </button>
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-[#FAF4ED] bg-green-600 rounded-md shadow-md hover:bg-green-700 w-full md:w-auto"
                        >
                            Last
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewPanel;