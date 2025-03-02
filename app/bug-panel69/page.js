'use client';
import React, { useState, useEffect } from 'react';
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
import { FaCheck } from "react-icons/fa";
import { CheckCircle } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import ProtectedRoute from '../components/ProtectedRoutes';

const BugPanel = () => {
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
    const [bugs, setBugs] = useState([]);
    const [filteredBugs, setFilteredBugs] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedPriority, setSelectedPriority] = useState("");
    const [selectedEmail, setselectedEmail] = useState("")
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState({});
    const [issyncing, setIssyncing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const entriesPerPage = 20;

    const fetchBugs = async () => {
        try {
            const q = query(
                collection(db, "feedback"),
                orderBy("timestamp", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({
                docId: doc.id,
                ...doc.data(),
                priority: doc.data().priority || "low",
                status: doc.data().status || "unresolved"
            }));
            setBugs(data);
            setFilteredBugs(data);
        } catch (error) {
            console.error("Error fetching bugs:", error);
            toast.error("Failed to fetch bugs");
        }
    };

    const syncData = async () => {
        setIssyncing(true);
        try {
            const bugsRef = collection(db, "feedback");
            const q = query(bugsRef, orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            const newData = querySnapshot.docs.map(doc => ({
                docId: doc.id,
                ...doc.data(),
                status: doc.data().status || "unresolved"
            }));

            setBugs(newData);
            setFilteredBugs(newData);
            toast.success("Data refreshed successfully!");
        } catch (error) {
            console.error("Error refreshing data:", error);
            toast.error("Failed to refresh data");
        } finally {
            setIssyncing(false);
        }
    };

    const handleDeleteAllBugs = async () => {
        if (isDeletingAll) return;

        try {
            setIsDeletingAll(true);

            if (!window.confirm("Are you sure you want to delete ALL bugs? This action cannot be undone!")) {
                setIsDeletingAll(false);
                return;
            }

            const bugsCollection = collection(db, "feedback");
            const snapshot = await getDocs(bugsCollection);

            const batchSize = 500;
            let batch = writeBatch(db);
            let count = 0;
            let totalDeleted = 0;

            for (const document of snapshot.docs) {
                batch.delete(doc(db, "feedback", document.id));
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

            setBugs([]);
            setFilteredBugs([]);
            setCurrentPage(1);

            toast.success(`Successfully deleted ${totalDeleted} bugs!`);

        } catch (error) {
            console.error("Error deleting all bugs:", error);
            toast.error("Failed to delete all bugs. Please try again.");
        } finally {
            setIsDeletingAll(false);
        }
    };

    const handleDeleteBug = async (docId) => {
        if (isDeleting) return;

        try {
            setIsDeleting(true);

            if (!window.confirm("Are you sure you want to delete this bug?")) {
                setIsDeleting(false);
                return;
            }

            const bugRef = doc(db, "feedback", docId);
            await deleteDoc(bugRef);

            const updatedBugs = bugs.filter((bug) => bug.docId !== docId);
            const updatedFilteredBugs = filteredBugs.filter((bug) => bug.docId !== docId);

            setBugs(updatedBugs);
            setFilteredBugs(updatedFilteredBugs);
            toast.success("Bug deleted successfully!");

            if (currentPage > 1 && updatedFilteredBugs.slice(
                (currentPage - 1) * entriesPerPage,
                currentPage * entriesPerPage
            ).length === 0) {
                setCurrentPage(currentPage - 1);
            }

        } catch (error) {
            console.error("Error deleting bug:", error);
            toast.error("Failed to delete bug. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        fetchBugs();
    }, []);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };
    const handleEmailChange = (e) => {
        setselectedEmail(e.target.value);
    };

    const handlePriorityChange = (e) => {
        setSelectedPriority(e.target.value);
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
    }

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    const handleFetchData = () => {
        let filtered = bugs;

        if (selectedDate) {
            const selectedDateStart = new Date(selectedDate);
            const selectedDateEnd = new Date(selectedDate);
            selectedDateEnd.setHours(23, 59, 59, 999);

            filtered = filtered.filter(bug => {
                const bugDate = new Date(bug.timestamp.seconds * 1000);
                return bugDate >= selectedDateStart && bugDate <= selectedDateEnd;
            });
        }

        if (selectedEmail && selectedEmail.trim() !== "") {
            filtered = filtered.filter(bug =>
                bug.email &&
                bug.email.toLowerCase().includes(selectedEmail.toLowerCase())
            );
        }

        if (selectedPriority) {
            filtered = filtered.filter(bug => bug.priority === selectedPriority);
        }

        if (selectedStatus) {
            filtered = filtered.filter(bug => bug.status === selectedStatus);
        }

        if (selectedSubject) {
            filtered = filtered.filter(bug => bug.subject === selectedSubject);
        }

        setFilteredBugs(filtered);
        setCurrentPage(1);

        if (filtered.length > 0) {
            toast.success("Data filtered successfully!");
        } else {
            toast.warning("No data matches the selected filters.");
        }
    };

    const totalPages = Math.ceil(filteredBugs.length / entriesPerPage);
    const displayedBugs = filteredBugs.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * entriesPerPage + 1;
    const endIndex = Math.min(currentPage * entriesPerPage, filteredBugs.length);

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
                    className="group-hover:underline hover:text-red-500 cursor-pointer"
                    onClick={handleCopy}
                >
                    {text}
                </span>
                {type === "Email" ? (
                    <div className="flex flex-row justify-between items-center space-x-2">
                        <div className="relative group/tooltip">
                            <FaExternalLinkAlt
                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-red-600 hover:text-red-600"
                                onClick={handleEmailRedirect}
                            />
                            <span className="absolute hidden group-hover/tooltip:block bg-red-700 text-white text-sm rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                Open in Gmail
                            </span>
                        </div>
                        <div className="relative group/tooltip">
                            <MdContentCopy
                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer  text-red-600 hover:text-red-600"
                                onClick={handleCopy}
                            />
                            <span className="absolute hidden group-hover/tooltip:block bg-red-700 text-white text-sm rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                Copy to clipboard
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="relative group/tooltip">
                        <MdContentCopy
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-red-500 hover:text-red-600"
                            onClick={handleCopy}
                        />
                        <span className="absolute hidden group-hover/tooltip:block bg-red-700 text-white text-sm rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            Copy to clipboard
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const handleSendNotification = async (email, subject, docId) => {
        if (loadingNotifications[docId]) return;

        try {
            setLoadingNotifications(prev => ({ ...prev, [docId]: true }));

            // Show immediate "queued" toast
            toast.info('Notification email queued for sending!');

            // Start the email sending process
            fetch('/api/send-bug-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    subject
                }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to send notification email');
                    }
                    return response.json();
                })
                .then(data => {
                    toast.success('Notification email sent successfully!');
                })
                .catch(error => {
                    console.error('Error sending notification email:', error);
                    toast.error('Failed to send notification email. Please try again.');
                })
                .finally(() => {
                    setLoadingNotifications(prev => ({ ...prev, [docId]: false }));
                });

            setTimeout(() => {
                setLoadingNotifications(prev => ({ ...prev, [docId]: false }));
            }, 2000);

        } catch (error) {
            console.error('Error queuing notification email:', error);
            toast.error('Failed to queue notification email. Please try again.');
            setLoadingNotifications(prev => ({ ...prev, [docId]: false }));
        }
    };

    const convertToCSV = (data) => {
        const headers = ["Timestamp", "Email", "Subject", "Message", "Priority", "Status"];
        const csvRows = [headers.join(',')];

        for (const bug of data) {
            const row = [
                new Date(bug.timestamp.seconds * 1000).toLocaleString(),
                bug.email,
                bug.subject,
                bug.message,
                bug.priority,
                bug.status
            ];
            csvRows.push(row.map(field => `"${field}"`).join(','));
        }

        return csvRows.join('\n');
    };

    const handleDownloadCSV = () => {
        const csvContent = convertToCSV(filteredBugs);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "bugs.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handlePriorityUpdate = async (docId, newPriority) => {
        try {
            const bugRef = doc(db, "feedback", docId);
            await updateDoc(bugRef, { priority: newPriority });

            const updatedBugs = bugs.map(bug =>
                bug.docId === docId ? { ...bug, priority: newPriority } : bug
            );
            setBugs(updatedBugs);
            setFilteredBugs(updatedBugs);

            toast.success("Priority updated successfully!");
        } catch (error) {
            console.error("Error updating priority:", error);
            toast.error("Failed to update priority. Please try again.");
        }
    };

    const handleMarkAsResolved = async (docId) => {
        if (window.confirm("Are you sure you want to mark this bug as resolved?")) {
            try {
                const bugRef = doc(db, "feedback", docId);
                await updateDoc(bugRef, { status: 'resolved' });

                const updatedBugs = bugs.map(bug =>
                    bug.docId === docId ? { ...bug, status: 'resolved' } : bug
                );
                setBugs(updatedBugs);
                setFilteredBugs(updatedBugs);

                // Send resolution email
                const resolvedBug = updatedBugs.find(bug => bug.docId === docId);
                if (resolvedBug) {
                    const response = await fetch('/api/bug-resolved-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: resolvedBug.email,
                            subject: resolvedBug.subject,
                            timestamp: resolvedBug.timestamp.seconds * 1000,
                            description: resolvedBug.message
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to send resolution email');
                    }
                }

                toast.success("Bug marked as resolved and email sent successfully!");
            } catch (error) {
                console.error("Error marking bug as resolved:", error);
                toast.error("Failed to mark bug as resolved or send email. Please try again.");
            }
        }
    };

    const StatusCell = ({ status }) => {
        const getStatusConfig = (status) => {
            switch (status.toLowerCase()) {
                case 'resolved':
                    return {
                        bgColor: 'bg-green-50',
                        textColor: 'text-green-700',
                        borderColor: 'border-green-200',
                        prefix: '✓'
                    };
                case 'unresolved':
                    return {
                        bgColor: 'bg-red-50',
                        textColor: 'text-red-700',
                        borderColor: 'border-red-200',
                        prefix: '•'
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
                font-semibold text-sm
                transition-all duration-200
            `}>
                <span className="text-lg">{config.prefix}</span>
                <span className="capitalize">{status}</span>
            </div>
        );
    };

    const UpdateStatusCell = ({ onResolve, isResolved }) => {
        return (
            <button
                onClick={onResolve}
                disabled={isResolved}
                className={`
                    group relative flex items-center justify-center p-2 
                    rounded-lg transition-all duration-200 
                    ${isResolved
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'bg-green-50 hover:bg-green-100 active:bg-green-200'
                    }
                `}
            >
                <CheckCircle
                    className={`
                        w-6 h-6 transition-all duration-200 
                        ${isResolved ? 'text-gray-400' : 'text-green-600 group-hover:text-green-700'}
                    `}
                />

                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {isResolved ? 'Already resolved' : 'Mark as resolved'}
                </span>
            </button>
        );
    };

    return (
        <ProtectedRoute>
            <div className="p-4 md:p-8 bg-gradient-to-b from-red-50 to-white min-h-screen">
                {/* Enhanced Header Section */}
                <motion.div
                    variants={fadeInLeft}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-center border-b border-red-300/50 py-6 pb-4 mb-8">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl md:text-6xl font-serif font-bold bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent">
                                Bug Panel
                            </h1>
                            <span className="text-4xl animate-bounce">🐞</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* <button
                            onClick={() => router.push('/admin-panel69')}
                            className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:translate-x-[-4px]"
                        >
                            <FaArrowLeft className="text-lg" />
                            <span>Back to Admin Panel</span>
                        </button> */}
                            <button
                                onClick={handleDeleteAllBugs}
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-white p-6 rounded-xl shadow-sm border border-red-100">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-red-800 items-center gap-2" htmlFor="date-filter">
                                <span className="text-lg">📅</span> Filter by Date
                            </label>
                            <input
                                id="date-filter"
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="w-full border border-red-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#36302A] items-center gap-2" htmlFor="email-filter">
                                <span className="text-lg">✉️</span>Filter By Email
                            </label>
                            <input
                                id="email-filter"
                                type="text"
                                value={selectedEmail}
                                onChange={handleEmailChange}
                                placeholder="Enter Email"
                                className="w-full border border-[#36302A]/20 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent transition-all duration-200 placeholder-[#36302A]/60"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-red-800 items-center gap-2" htmlFor="priority-filter">
                                <span className="text-lg">🎯</span> Priority Level
                            </label>
                            <select
                                id="priority-filter"
                                value={selectedPriority}
                                onChange={handlePriorityChange}
                                className="w-full border border-red-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white"
                            >
                                <option value="">All Priorities</option>
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="highest">Highest Priority</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-red-800 items-center gap-2" htmlFor="status-filter">
                                <span className="text-lg">📊</span> Bug Status
                            </label>
                            <select
                                id="status-filter"
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                className="w-full border border-red-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="resolved">Resolved</option>
                                <option value="unresolved">Unresolved</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-red-800 items-center gap-2" htmlFor="subject-filter">
                                <span className="text-lg">📊</span> Subject
                            </label>
                            <select
                                id="subject-filter"
                                value={selectedSubject}
                                onChange={handleSubjectChange}
                                className="w-full border border-red-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white"
                            >
                                <option value="">All Subjects</option>
                                <option value="bug">Bugs</option>
                                <option value="form-issue">Form-Issue</option>
                                <option value="others">Others</option>
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
                            className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                        >
                            <span className="text-lg">🔍</span>
                            Apply Filters
                        </button>
                        <button
                            onClick={() => {
                                setSelectedDate("");
                                setSelectedPriority("");
                                setSelectedStatus("");
                                setSelectedSubject("");
                                setselectedEmail("");
                                setFilteredBugs(bugs);
                                toast.success("Filters cleared!");
                            }}
                            className="px-6 py-2.5 bg-red-600/90 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                        >
                            <MdDeleteForever className="text-xl" />
                            Clear Filters
                        </button>
                        <button
                            onClick={handleDownloadCSV}
                            className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                        >
                            <FaFileExcel className="text-xl" />
                            <span className="hidden md:inline">Export CSV</span>
                        </button>
                        <button
                            onClick={syncData}
                            disabled={issyncing}
                            className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105 disabled:opacity-50"
                        >
                            <FaSync className={`text-xl ${issyncing ? 'animate-spin' : ''}`} />
                            <span>{issyncing ? 'Syncing...' : 'Sync Data'}</span>
                        </button>
                    </div>
                </motion.div>

                {/* Enhanced Table Section */}
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="relative w-full overflow-hidden bg-white shadow-md rounded-lg">
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="min-w-full table-auto border-collapse border border-red-200">
                                <thead className="bg-red-600 text-white">
                                    <tr>
                                        {[
                                            "Action",
                                            "Bug Status",
                                            "Update status",
                                            "Priority",
                                            "Change Priority",
                                            "Timestamp",
                                            "Email",
                                            "Notify",
                                            "Subject",
                                            "Message"
                                        ].map((header) => (
                                            <th key={header} className="border border-red-500 px-4 py-4 text-left font-semibold">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedBugs.length > 0 ? (
                                        displayedBugs.map((bug) => (
                                            <tr key={bug.docId} className={`hover:bg-red-50 ${bug.status === 'resolved' ? 'opacity-50' : ''}`}>
                                                <td className="border border-red-200 px-4 md:px-7 py-2 md:py-2 text-xs md:text-base">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleDeleteBug(bug.docId)}
                                                            className="text-red-500 hover:text-red-700 text-lg md:text-2xl"
                                                            title="Delete"
                                                        >
                                                            <MdDeleteForever />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="border border-red-200 px-4 py-2 text-sm md:text-base">
                                                    <StatusCell status={bug.status} />
                                                </td>
                                                <td className="border border-red-200 px-8 py-2">
                                                    <UpdateStatusCell
                                                        onResolve={() => handleMarkAsResolved(bug.docId)}
                                                        isResolved={bug.status === 'resolved'}
                                                    />
                                                </td>
                                                <td className="border border-red-200 px-4 py-2 text-sm md:text-base">
                                                    <PriorityDisplay priority={bug.priority} />
                                                </td>
                                                <td className="border border-red-200 px-4 py-2 text-sm md:text-base">
                                                    <select
                                                        value={bug.priority}
                                                        onChange={(e) => handlePriorityUpdate(bug.docId, e.target.value)}
                                                        className="w-full border border-red-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                                    >
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                        <option value="highest">Highest</option>
                                                    </select>
                                                </td>
                                                <td className="border border-red-200 px-4 py-2 font-serif text-sm md:text-base whitespace-nowrap">
                                                    {bug.timestamp
                                                        ? new Date(bug.timestamp.seconds * 1000).toLocaleString()
                                                        : "N/A"}
                                                </td>
                                                <td className="border border-red-200 px-4 py-2 font-serif text-sm md:text-base" style={{ userSelect: "none" }}>
                                                    <CopyableText text={bug.email} type="Email" />
                                                </td>
                                                <td className="border border-red-200 px-4 py-2 text-sm md:text-base">
                                                    <button
                                                        onClick={() => handleSendNotification(bug.email, bug.subject, bug.docId)}
                                                        className={`px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1 ${bug.status === 'resolved' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title="Send Notification"
                                                        disabled={loadingNotifications[bug.docId] || bug.status === 'resolved'}
                                                    >
                                                        {loadingNotifications[bug.docId] ? (
                                                            <span className="animate-spin">⌛</span>
                                                        ) : (
                                                            <HiBellAlert className="text-sm md:text-base" />
                                                        )}
                                                        <span className="hidden md:inline">
                                                            {loadingNotifications[bug.docId] ? 'Sending...' : 'Notify'}
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="border border-red-200 px-4 py-2 font-serif text-sm md:text-base">
                                                    {bug.subject}
                                                </td>
                                                <td className="border border-red-200 px-4 py-2 font-serif text-sm md:text-base">
                                                    {bug.message}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {/* Enhanced Pagination */}
                {filteredBugs.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalRecords={filteredBugs.length}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        onPageChange={handlePageChange}
                        pageButtonsStyles={"bg-red-600 hover:bg-[#2C2925] text-white font-serif"}
                        recordInfoStyles={"text-gray-800 font-serif"}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
};

export default BugPanel;