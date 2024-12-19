"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, writeBatch, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { MdDeleteForever, MdContentCopy } from "react-icons/md";
import { FaArrowLeft, FaExternalLinkAlt, FaFileDownload, FaFileExcel } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { BsFillSendFill } from "react-icons/bs";
import { HiBellAlert } from "react-icons/hi2";
import PriorityDisplay from "../components/PriorityDisplay";

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
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState({});
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
                priority: doc.data().priority || "low" // Default to low if not set
            }));
            setBugs(data);
            setFilteredBugs(data);
        } catch (error) {
            console.error("Error fetching bugs:", error);
            toast.error("Failed to fetch bugs");
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

    const handlePriorityChange = (e) => {
        setSelectedPriority(e.target.value);
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

        if (selectedPriority) {
            filtered = filtered.filter(bug => bug.priority === selectedPriority);
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

    const handleSendNotification = async (email,subject, docId) => {
        if (loadingNotifications[docId]) return; // Prevent multiple clicks

        try {
            setLoadingNotifications(prev => ({ ...prev, [docId]: true }));

            const response = await fetch('/api/send-bug-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    subject
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
        const headers = ["Timestamp", "Email", "Subject", "Message", "Priority"];
        const csvRows = [headers.join(',')];

        for (const bug of data) {
            const row = [
                new Date(bug.timestamp.seconds * 1000).toLocaleString(),
                bug.email,
                bug.subject,
                bug.message,
                bug.priority
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
            
            // Update local state
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

    return (
        <div className="p-4 md:p-6 bg-red-50 min-h-screen">
            <motion.div
                variants={fadeInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="flex flex-col md:flex-row justify-between items-center border-b border-red-300 py-6 pb-4 mb-6">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-red-800 mb-4 md:mb-0">
                        Bugs & Issues 🐞
                    </h1>
                    <div className="flex space-x-4">
                        {/* <button
                            onClick={() => router.push('/admin-panel69')}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                        >
                            <FaArrowLeft className="text-md md:text-xl" />
                            <span>Back to Admin Panel</span>
                        </button> */}
                        <button
                            onClick={handleDeleteAllBugs}
                            disabled={isDeletingAll}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                        >
                            <MdDeleteForever className="text-xl" />
                            <span>Delete All</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={fadeInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm md:text-lg font-medium mb-2 text-red-800" htmlFor="date-filter">
                            Filter by Date:
                        </label>
                        <input
                            id="date-filter"
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-full border border-red-300 rounded-lg px-3 py-1 md:py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div>
                <label className="block text-sm md:text-lg font-medium mb-2 text-red-800" htmlFor="priority-filter">
                            Filter by Priority:
                        </label>
                        <select
                            id="priority-filter"
                            value={selectedPriority}
                            onChange={handlePriorityChange}
                            className="w-full border border-red-300 rounded-lg px-3 py-1 md:py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="">Select Priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="highest">Highest</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={fadeInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="mb-6 text-center flex justify-center items-center space-x-4">
                    <button
                        onClick={handleFetchData}
                        className="px-8 py-2 md:py-3 bg-red-600 text-white font-semibold rounded-md md:rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 w-full md:w-auto"
                    >
                        Apply Filter
                    </button>
                    <button
                        onClick={() => {
                            setSelectedDate("");
                            setSelectedPriority("");
                            setFilteredBugs(bugs);
                            toast.success("Filters cleared!");
                        }}
                        className="px-5 py-2 md:py-3 bg-red-600 text-white font-semibold rounded-md md:rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 md:w-auto"
                    >
                        <MdDeleteForever className="text-lg md:text-2xl" />
                    </button>
                </div>
            </motion.div>

            <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <button
                    onClick={handleDownloadCSV}
                    className="px-3 md:px-4 py-2 md:py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 mb-2 ml-0 md:mb-5 md:ml-5"
                >
                    <FaFileExcel className="text-xl" />
                </button>
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
                        <table className="min-w-full table-auto border-collapse border border-red-200">
                            <thead className="bg-red-600 text-white">
                                <tr>
                                    {[
                                        "Action",
                                        "Priority",
                                        "ChangePriority",
                                        "Timestamp",
                                        "Email",
                                         "Notify",
                                        "Subject",
                                        "Message",
                                       
                                    ].map((header) => (
                                        <th
                                            key={header}
                                            className="border border-red-500 px-4 md:px-4 py-2 md:py-4 text-left text-xs md:text-md md:text-base font-semibold"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayedBugs.length > 0 ? (
                                    displayedBugs.map((bug) => (
                                        <tr key={bug.docId} className="hover:bg-red-50">
                                            <td className="border border-red-200 px-4 md:px-7 py-2 md:py-2 text-xs md:text-base">
                                                <button
                                                    onClick={() => handleDeleteBug(bug.docId)}
                                                    className="text-red-500 hover:text-red-700 text-lg md:text-2xl"
                                                    title="Delete"
                                                >
                                                    <MdDeleteForever />
                                                </button>
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
                                                    onClick={() => handleSendNotification(bug.email,bug.subject, bug.docId)}
                                                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1"
                                                    title="Send Notification"
                                                    disabled={loadingNotifications[bug.docId]}
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
                                        <td colSpan="8" className="text-center py-4">
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
            {filteredBugs.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center py-4">
                    <div>
                        <span className="text-sm md:text-lg text-red-700">
                            Total Records: {filteredBugs.length} | Showing {startIndex} to {endIndex} of {filteredBugs.length} records
                        </span>
                    </div>
                    <div className="space-y-0 md:space-y-0 space-x-4 md:space-x-4 flex flex-row md:flex-row">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-[#FAF4ED] bg-red-600 rounded-md shadow-md hover:bg-red-700 w-full md:w-auto"
                        >
                            First
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-[#FAF4ED] bg-red-600 rounded-md shadow-md hover:bg-red-700 w-full md:w-auto"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-[#FAF4ED] bg-red-600 rounded-md shadow-md hover:bg-red-700 w-full md:w-auto"
                        >
                            Next
                        </button>
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-[#FAF4ED] bg-red-600 rounded-md shadow-md hover:bg-red-700 w-full md:w-auto"
                        >
                            Last
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BugPanel;

