"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { MdDeleteForever } from "react-icons/md";

const AdminPanel = () => {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 20;

  // Fetch all inquiries from Firestore
  const fetchInquiries = async () => {
    try {
      const snapshot = await getDocs(collection(db, "inquiries"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInquiries(data);
      setFilteredInquiries(data); // Initially display all inquiries
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    }
  };

  useEffect(() => {
    fetchInquiries(); // Fetch data on initial render
  }, []);

  // Filter inquiries based on selected date
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleFetchData = async () => {
    if (!selectedDate) {
      setFilteredInquiries(inquiries); // If no date is selected, reset filter
      return;
    }

    const selectedDateStart = new Date(selectedDate);
    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999); // Include the entire day

    // Query Firestore to get documents matching the selected date
    try {
      const q = query(
        collection(db, "inquiries"),
        where("timestamp", ">=", selectedDateStart),
        where("timestamp", "<=", selectedDateEnd)
      );
      const snapshot = await getDocs(q);
      const filteredData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFilteredInquiries(filteredData);
    } catch (error) {
      console.error("Error filtering inquiries by date:", error);
    }
  };

  // Delete inquiry from Firestore
  const handleDeleteInquiry = async (id) => {
    try {
      const inquiryDoc = doc(db, "inquiries", id);
      await deleteDoc(inquiryDoc);
      setInquiries(inquiries.filter((inquiry) => inquiry.id !== id));
      setFilteredInquiries(
        filteredInquiries.filter((inquiry) => inquiry.id !== id)
      );
      toast.success("Deleted successfully!");
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      toast.error("Failed to delete inquiry.");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredInquiries.length / entriesPerPage);
  const displayedInquiries = filteredInquiries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4 md:p-6 bg-[#FAF4ED] min-h-screen">
      {/* Heading */}
      <h1 className="text-4xl md:text-6xl font-serif font-bold text-center py-4 mb-6 border-b border-gray-300 text-[#36302A]">
        Admin Panel👨‍💻
      </h1>

      {/* Date Filter */}
      <div className="mb-6">
        <label
          className="block text-sm md:text-lg font-medium mb-2"
          htmlFor="date-filter"
        >
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

      {/* Fetch Button */}
      <div className="mb-6 text-center">
        <button
          onClick={handleFetchData}
          className="px-16 py-2 md:py-2 bg-[#36302A] text-[#FAF4ED] font-semibold rounded-md md:rounded-lg shadow-md hover:bg-[#2C2925] focus:outline-none focus:ring-2 focus:ring-[#36302A]"
        >
          Apply Filter
        </button>
      </div>

      {/* Modified Table Container */}
      <div className="relative w-full overflow-hidden bg-[#FAF4ED] shadow-md">
        <div 
          className="overflow-x-auto scrollbar-hide" 
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead className="bg-[#5a4c3f] text-[#FAF4ED]">
              <tr>
                {[
                  "Action",
                  "Timestamp",
                  "FirstName",
                  "LastName",
                  "Email",
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
                    className="border border-[#36302A] px-4 md:px-4 py-2 md:py-6 text-left text-xs md:text-md md:text-base font-serif font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedInquiries.length > 0 ? (
                displayedInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-[#F2EAE2]">
                    <td className="border border-[#36302A] px-4 md:px-7 py-2 md:py-4 text-xs md:text-base">
                      <button
                        onClick={() => handleDeleteInquiry(inquiry.id)}
                        className="text-red-500 hover:text-red-700 text-lg md:text-2xl"
                      >
                        <MdDeleteForever />
                      </button>
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.timestamp
                        ? new Date(
                            inquiry.timestamp.seconds * 1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.firstName}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.lastName}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.email}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.phoneDialCode}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.phoneNumber}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.company}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.services}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.socials}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.website}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 text-sm md:text-base">
                      {inquiry.messages}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="12"
                    className="text-center text-gray-500 py-4 text-sm md:text-base"
                  >
                    No inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === index + 1
                ? "bg-[#36302A] text-[#FAF4ED]"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;