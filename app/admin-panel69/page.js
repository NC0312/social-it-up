"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, writeBatch, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { MdDeleteForever, MdContentCopy } from "react-icons/md";
import { useRouter } from "next/navigation";
import { MdOutlineSaveAlt } from "react-icons/md";
import { FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";
import { motion } from "framer-motion";


const AdminPanel = () => {
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
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [signedUp, setSignedUp] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 20;

  // Fetch all inquiries from Firestore, ordered by timestamp in descending order
  const fetchInquiries = async () => {
    try {
      const q = query(
        collection(db, "inquiries"),
        orderBy("timestamp", "desc") // Order by timestamp in descending order
      );
      const snapshot = await getDocs(q);
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

  const handleSaveToReview = async (inquiry) => {
    try {
      // Add to review collection
      await addDoc(collection(db, "reviews"), {
        ...inquiry,
        movedToReviewAt: new Date()
      });

      // Delete from inquiries
      const inquiryDoc = doc(db, "inquiries", inquiry.id);
      await deleteDoc(inquiryDoc);

      // Update local state
      setInquiries(inquiries.filter((item) => item.id !== inquiry.id));
      setFilteredInquiries(filteredInquiries.filter((item) => item.id !== inquiry.id));

      toast.success("Moved to Review Panel!");
    } catch (error) {
      console.error("Error moving to review:", error);
      toast.error("Failed to move to review.");
    }
  };

  useEffect(() => {
    fetchInquiries(); // Fetch data on initial render
  }, []);

  // Filter inquiries based on selected date
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSignUpChange = (e) => {
    setSignedUp(e.target.value);
  };

  const handleFetchData = async () => {
    let filtered = inquiries;

    // Apply date filter if selected
    if (selectedDate) {
      const selectedDateStart = new Date(selectedDate);
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);

      filtered = filtered.filter(inquiry => {
        const inquiryDate = new Date(inquiry.timestamp.seconds * 1000);
        return inquiryDate >= selectedDateStart && inquiryDate <= selectedDateEnd;
      });
    }

    // Apply signup filter if selected
    if (signedUp) {
      filtered = filtered.filter(inquiry => {
        if (signedUp === "Yes") {
          return inquiry.isChecked === true;
        } else if (signedUp === "No") {
          return inquiry.isChecked === false;
        }
        return true;
      });
    }

    setFilteredInquiries(filtered);

    if (filtered.length > 0) {
      toast.success("Data filtered successfully!");
    } else {
      toast.warning("No data matches the selected filters.");
    }
  };

  // Delete inquiry from Firestore
  const handleDeleteInquiry = async (id) => {
    try {
      debugger
      const inquiryDoc = doc(db, "inquiries", id);
      await deleteDoc(inquiryDoc);
      setInquiries(inquiries.filter((inquiry) => inquiry.id !== id));
      setFilteredInquiries(filteredInquiries.filter((inquiry) => inquiry.id !== id));
      toast.success("Deleted successfully!");
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      toast.error("Failed to delete inquiry.");
    }
  };

  const handleDeleteAll = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "inquiries"));
      const batch = writeBatch(db);

      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Update local state
      setInquiries([]);
      setFilteredInquiries([]);

      toast.success("All entries deleted successfully!");
    } catch (error) {
      console.error("Error deleting documents from Firestore: ", error);
      toast.error("Failed to delete entries. Please try again later.");
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

  // Calculate current range
  const startIndex = (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, filteredInquiries.length);

  const CopyableText = ({ text, type }) => {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard!`);
      } catch (err) {
        toast.error('Failed to copy to clipboard');
      }
    };

    return (
      <div
        className="flex items-center space-x-2 cursor-pointer hover:text-[#36302A] group"
        onClick={handleCopy}
      >
        <span className="group-hover:underline">{text}</span>
        <MdContentCopy className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  // Clickable link component
  const ExternalLink = ({ url }) => {
    const handleClick = () => {
      if (!url) return;

      // Add http:// if not present
      const finalUrl = url.startsWith('http') ? url : `http://${url}`;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };

    return url ? (
      <div
        className="flex items-center space-x-2 cursor-pointer hover:text-[#36302A] group"
        onClick={handleClick}
      >
        <span className="group-hover:underline">{url}</span>
        <FaExternalLinkAlt className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    ) : "N/A";
  };

  return (
    <div className="p-4 md:p-6 bg-[#FAF4ED] min-h-screen">
      {/* <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 py-6 pb-4 mb-6"> */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 py-6 pb-4 mb-6"
        variants={fadeInLeft}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#36302A] mb-4 md:mb-0">
          Admin Panel👨‍💻
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/review-panel69')}
            className="px-3 py-1 md:px-4 md:py-2 bg-[#36302A] text-[#FAF4ED] font-semibold rounded-lg shadow-md hover:bg-[#27231f] transition-colors duration-200 flex items-center space-x-1"
          >

            <span>Review Panel</span>
            <FaArrowRight className="text-md md:text-xl" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
                handleDeleteAll();
              }
            }}
            className="px-4 py-2 bg-red-600 text-[#FAF4ED] font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <MdDeleteForever className="text-xl" />
            <span>Delete All Data</span>
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={fadeInRight}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
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

        <div className="mb-6">
          <label
            className="block text-sm md:text-lg font-medium mb-2"
            htmlFor="signup-filter"
          >
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
      </motion.div>

      <motion.div
        variants={fadeInLeft}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="mb-6 text-center flex justify-center items-center space-x-4">
          <button
            onClick={() => {
              debugger
              if (selectedDate) { // Check if there is a filter selected
                handleFetchData();
                toast.success("Data fetched successfully!");
              }
              else if (signedUp) {
                handleFetchData();
                toast.success("Data fetched successfully!");
              }
              else {
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
                setFilteredInquiries(inquiries);
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
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
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
                    "Action",
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
                      className="border border-[#36302A] px-4 md:px-4 py-2 md:py-4 text-left text-xs md:text-md md:text-base  font-semibold"
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
                      <td className="border border-[#36302A] px-4 md:px-7 py-2 md:py-2 text-xs md:text-base">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveToReview(inquiry)}
                            className="text-green-500 hover:text-green-700 text-lg md:text-xl"
                            title="Save to Review"
                          >
                            <MdOutlineSaveAlt />
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(inquiry.id)}
                            className="text-red-500 hover:text-red-700 text-lg md:text-2xl"
                            title="Delete"
                          >
                            <MdDeleteForever />
                          </button>
                        </div>
                      </td>
                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base whitespace-nowrap">
                        {inquiry.timestamp
                          ? new Date(
                            inquiry.timestamp.seconds * 1000
                          ).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.firstName}
                      </td>
                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.lastName}
                      </td>
                      {/* <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.email}
                      </td> */}
                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base" style={{userSelect:"none"}}>
                        <CopyableText text={inquiry.email} type="Email" />
                      </td>
                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.isChecked ? "Yes" : "No"}
                      </td>

                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.phoneDialCode}
                      </td>
                      {/* <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.phoneNumber}
                      </td> */}
                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base" style={{userSelect:"none"}}>
                        <CopyableText
                          text={`${inquiry.phoneNumber}`}
                          type="Phone number"
                        />
                      </td>

                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.company}
                      </td>

                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.services}
                      </td>

                      {/* <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.socials}
                      </td> */}
                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        <ExternalLink url={inquiry.socials} />
                      </td>

                      {/* <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.website}
                      </td> */}
                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        <ExternalLink url={inquiry.website} />
                      </td>
                      <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.messages}
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
      </motion.div>

      {/* Pagination */}
      {filteredInquiries.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center py-4">
          <div>
            <span className="text-sm md:text-lg text-[#36302A]">
              Total Records : {filteredInquiries.length} | Showing {startIndex} to {endIndex} of {filteredInquiries.length} records | DB Limit : 6500 records
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

export default AdminPanel;
