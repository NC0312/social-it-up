"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { MdDeleteForever } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from 'next/navigation';

const ReviewPanel = () => {
    const router = useRouter();
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [signedUp, setSignedUp] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 20;

    const fetchReviews = async () => {
        try {
            const q = query(
                collection(db, "reviews"),
                orderBy("movedToReviewAt", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setReviews(data);
            setFilteredReviews(data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to fetch reviews");
        }
    };

    
    const handleDeleteReview = async (id) => {
        try {
            debugger
            const reviewDoc = doc(db, "reviews", id);
            await deleteDoc(reviewDoc);
            setReviews(reviews.filter((review) => review.id !== id));
            setFilteredReviews(filteredReviews.filter((review) => review.id !== id));
            toast.success("Review deleted successfully!");
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review.");
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

    const handleFetchData = () => {
        let filtered = reviews;

        // Apply date filter if selected
        if (selectedDate) {
            const selectedDateStart = new Date(selectedDate);
            const selectedDateEnd = new Date(selectedDate);
            selectedDateEnd.setHours(23, 59, 59, 999);

            filtered = filtered.filter(review => {
                const reviewDate = new Date(review.movedToReviewAt.seconds * 1000);
                return reviewDate >= selectedDateStart && reviewDate <= selectedDateEnd;
            });
        }

        // Apply signup filter if selected
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

        setFilteredReviews(filtered);

        if (filtered.length > 0) {
            toast.success("Data filtered successfully!");
        } else {
            toast.warning("No data matches the selected filters.");
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredReviews.length / entriesPerPage);
    const displayedReviews = filteredReviews.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Calculate current range
    const startIndex = (currentPage - 1) * entriesPerPage + 1;
    const endIndex = Math.min(currentPage * entriesPerPage, filteredReviews.length);

    return (
        <div className="p-4 md:p-6 bg-[#FAF4ED] min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 py-6 pb-4 mb-6">
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#36302A] mb-4 md:mb-0">
                    Review Panel 📋
                </h1>
                <button
                    onClick={() => router.push('/admin-panel69')}
                    className="px-4 py-2 bg-green-600 text-[#FAF4ED] font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                >
                    <FaArrowLeft className="text-md md:text-xl" />
                    <span>Back to Admin Panel</span>
                </button>
            </div>

            <div className="mb-6">
                <label className="block text-sm md:text-lg font-medium mb-2" htmlFor="date-filter">
                    Filter by Date:
                </label>
                <input
                    id="date-filter"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-1 md:py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A]"
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm md:text-lg font-medium mb-2" htmlFor="signup-filter">
                    Filter by Signed Up:
                </label>
                <select
                    id="signup-filter"
                    value={signedUp}
                    onChange={handleSignUpChange}
                    className="w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-1 md:py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A]"
                >
                    <option value="">Has anyone signed up for news and updates?</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>

            <div className="mb-6 text-center flex justify-center items-center space-x-4">
                <button
                    onClick={() => {
                        if (selectedDate || signedUp) {
                            handleFetchData();
                        } else {
                            toast.error("No filter applied!");
                        }
                    }}
                    className="px-8 py-2 md:py-3 bg-[#36302A] text-[#FAF4ED] font-semibold rounded-md md:rounded-lg shadow-md hover:bg-[#2C2925] focus:outline-none focus:ring-2 focus:ring-[#36302A] w-full md:w-auto"
                >
                    Apply Filter
                </button>
                <button
                    onClick={() => {
                        if (selectedDate || signedUp) {
                            setSelectedDate("");
                            setSignedUp("");
                            setFilteredReviews(reviews);
                            toast.success("Filters cleared!");
                        } else {
                            toast.error("No filter to clear!");
                        }
                    }}
                    className="px-5 py-2 md:py-3 bg-red-600 text-[#FAF4ED] font-semibold rounded-md md:rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 md:w-auto"
                >
                    <MdDeleteForever className="text-lg md:text-2xl" />
                </button>
            </div>

            <div className="relative w-full overflow-hidden bg-[#FAF4ED] shadow-md">
                <div
                    className="overflow-x-auto scrollbar-hide"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                        <thead className="bg-[#5a4c3f] text-[#FAF4ED]">
                            <tr>
                                {[
                                    // "Action",
                                    "Timestamp",
                                    "FirstName",
                                    "LastName",
                                    "Email",
                                    "SignedUp",
                                    "DialCode",
                                    "PhoneNumber",
                                    "Company/Brand",
                                    "Services",
                                    "Socials",
                                    "Website",
                                    "Messages",
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="border border-[#36302A] px-4 md:px-4 py-2 md:py-6 text-left text-xs md:text-md md:text-base font-semibold"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayedReviews.length > 0 ? (
                                displayedReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-[#F2EAE2]">
                                        {/* <td className="border border-[#36302A] px-4 md:px-7 py-2 md:py-4 text-xs md:text-base">
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="text-red-500 hover:text-red-700 text-lg md:text-2xl"
                                                title="Delete" 
                                            >
                                                <MdDeleteForever />
                                            </button>
                                        </td> */}
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.movedToReviewAt
                                                ? new Date(review.movedToReviewAt.seconds * 1000).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.firstName}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.lastName}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.email}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.isChecked ? "Yes" : "No"}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.phoneDialCode}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.phoneNumber}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.company}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.services}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.socials}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.website}
                                        </td>
                                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                                            {review.messages}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="13" className="text-center py-4">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {filteredReviews.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center py-4">
                    <div>
                        <span className="text-sm md:text-lg text-[#36302A]">
                            Total Records: {filteredReviews.length} | Showing {startIndex} to {endIndex} of {filteredReviews.length} records | DB Limit: 6500 records
                        </span>
                    </div>
                    <div className="space-y-0 md:space-y-0 space-x-4 md:space-x-4 flex flex-row md:flex-row">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-[#FAF4ED] bg-[#36302A] rounded-md shadow-md hover:bg-[#2C2925] w-full md:w-auto"
                        >
                            First
                        </button>
                        <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-[#FAF4ED] bg-[#36302A] rounded-md shadow-md hover:bg-[#2C2925] w-full md:w-auto"
            >
              Prev
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-[#FAF4ED] bg-[#36302A] rounded-md shadow-md hover:bg-[#2C2925] w-full md:w-auto"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-[#FAF4ED] bg-[#36302A] rounded-md shadow-md hover:bg-[#2C2925] w-full md:w-auto"
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
