"use client";

import React, { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, writeBatch, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { MdDeleteForever, MdContentCopy } from "react-icons/md";
import { useRouter } from "next/navigation";
import { MdOutlineSaveAlt } from "react-icons/md";
import { FaArrowRight, FaExternalLinkAlt, FaFileExcel, FaSync } from "react-icons/fa";
import { motion } from "framer-motion";
import { Pagination } from "../components/Pagination";
import ProtectedRoute from "../components/ProtectedRoutes";


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
  const [selectedName, setSelectedName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [signedUp, setSignedUp] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [issyncing, setIssyncing] = useState(false);
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

  const syncData = async () => {
    setIssyncing(true);
    try {
      const inquiriesRef = collection(db, "inquiries");
      const q = query(inquiriesRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      const newData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setInquiries(newData);
      setFilteredInquiries(newData);
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Error syncing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIssyncing(false);
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

  const handleNameChange = (e) => {
    setSelectedName(e.target.value);
  };

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
  }

  const handleSignUpChange = (e) => {
    setSignedUp(e.target.value);
  };

  const handleFetchData = async () => {
    let filtered = inquiries;

    //Brand Name filteration code...
    if (selectedCompany && selectedCompany.trim() !== "") {
      filtered = filtered.filter(inquiry =>
        inquiry.company &&
        inquiry.company.toLowerCase().includes(selectedCompany.toLowerCase())
      );
    }

    //Name filteration code...
    if (selectedName && selectedName.trim() !== "") {
      filtered = filtered.filter(inquiry =>
        inquiry.firstName &&
        inquiry.firstName.toLowerCase().includes(selectedName.toLowerCase())
      );
    }

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

  const convertToCSV = (data) => {
    const headers = ["Timestamp", "FirstName", "LastName", "Email", "SignedUp", "DialCode", "PhoneNumber", "BrandName", "Services", "Socials", "Website", "Messages"];
    const csvRows = [headers.join(',')];

    for (const inquiry of data) {
      const row = [
        inquiry.timestamp ? new Date(inquiry.timestamp.seconds * 1000).toLocaleString() : "N/A",
        inquiry.firstName || "",
        inquiry.lastName || "",
        inquiry.email || "",
        inquiry.isChecked ? "Yes" : "No",
        inquiry.phoneDialCode || "",
        `"${inquiry.phoneNumber || ""}"`,
        inquiry.company || "",
        inquiry.services || "",
        inquiry.socials || "",
        inquiry.website || "",
        `"${(inquiry.messages || "").replace(/"/g, '""')}"`
      ];
      csvRows.push(row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
    }

    return csvRows.join('\n');
  };

  const handleDownloadCSV = () => {
    if (filteredInquiries.length > 1000) {
      toast.info("Preparing CSV for download. This may take a moment for large datasets...");
    }

    setTimeout(() => {
      try {
        const csvContent = convertToCSV(filteredInquiries);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `inquiries_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success("CSV downloaded successfully!");
        }
      } catch (error) {
        console.error("Error generating CSV:", error);
        toast.error("Failed to generate CSV. Please try again.");
      }
    }, 100);
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

  // const CopyableText = ({ text, type }) => {
  //   const handleCopy = async () => {
  //     try {
  //       await navigator.clipboard.writeText(text);
  //       toast.success(`${type} copied to clipboard!`);
  //     } catch (err) {
  //       toast.error('Failed to copy to clipboard');
  //     }
  //   };

  //   return (
  //     <div
  //       className="flex items-center space-x-2 cursor-pointer hover:text-[#36302A] group"
  //       onClick={handleCopy}
  //     >
  //       <span className="group-hover:underline">{text}</span>
  //       <MdContentCopy className="opacity-0 group-hover:opacity-100 transition-opacity" />
  //     </div>
  //   );
  // };

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
          className="group-hover:underline cursor-pointer"
          onClick={handleCopy}
        >
          {text}
        </span>
        {type === "Email" ? (
          <div className="flex flex-row justify-between items-center space-x-2">
            <div className="relative group/tooltip">
              <FaExternalLinkAlt
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#36302A]"
                onClick={handleEmailRedirect}
              />
              <span className="absolute hidden group-hover/tooltip:block bg-[#36302A] text-white text-sm rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                Open in Gmail
              </span>
            </div>
            <div className="relative group/tooltip">
              <MdContentCopy
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#36302A]"
                onClick={handleCopy}
              />
              <span className="absolute hidden group-hover/tooltip:block bg-[#36302A] text-white text-sm rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                Copy to clipboard
              </span>
            </div>
          </div>
        ) : (
          <div className="relative group/tooltip">
            <MdContentCopy
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#36302A]"
              onClick={handleCopy}
            />
            <span className="absolute hidden group-hover/tooltip:block bg-[#36302A] text-white text-sm rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              Copy to clipboard
            </span>
          </div>
        )}
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
    <ProtectedRoute>
      <div className="p-4 md:p-8 bg-gradient-to-b from-[#FAF4ED] to-white min-h-screen">
        {/* Enhanced Header Section */}
        <motion.div
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#36302A]/50 py-6 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-6xl font-serif font-bold bg-gradient-to-r from-[#36302A] to-[#5a4c3f] bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <span className="text-4xl animate-bounce">👨‍💻</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/review-panel69')}
                className="px-4 py-2.5 bg-[#36302A] text-[#FAF4ED] font-semibold rounded-lg shadow-lg hover:bg-[#2C2925] transition-all duration-200 flex items-center gap-2"
              >
                <span>Review Panel</span>
                <FaArrowRight className="text-lg" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
                    handleDeleteAll();
                  }
                }}
                className="px-4 py-2.5 bg-red-600/90 text-[#FAF4ED] font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2"
              >
                <MdDeleteForever className="text-xl" />
                <span>Delete All</span>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-white p-6 rounded-xl shadow-sm border border-[#36302A]/10">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#36302A] items-center gap-2" htmlFor="date-filter">
                <span className="text-lg">📅</span> Filter by Date
              </label>
              <input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full border border-[#36302A]/20 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#36302A] items-center gap-2" htmlFor="name-filter">
                <span className="text-lg">👤</span>Filter By FirstName
              </label>
              <input
                id="name-filter"
                type="text"
                value={selectedName}
                onChange={handleNameChange}
                placeholder="Enter FirstName"
                className="w-full border border-[#36302A]/20 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent transition-all duration-200 placeholder-[#36302A]/60"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#36302A] items-center gap-2" htmlFor="company-filter">
                <span className="text-lg">🏢</span>Filter By BrandName
              </label>
              <input
                id="company-filter"
                type="text"
                value={selectedCompany}
                onChange={handleCompanyChange}
                placeholder="Enter BrandName"
                className="w-full border border-[#36302A]/20 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent transition-all duration-200 placeholder-[#36302A]/60"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#36302A] items-center gap-2" htmlFor="signup-filter">
                <span className="text-lg">✉️</span> Newsletter Signup Status
              </label>
              <select
                id="signup-filter"
                value={signedUp}
                onChange={handleSignUpChange}
                className="w-full border border-[#36302A]/20 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">All Signups</option>
                <option value="Yes">Signed Up</option>
                <option value="No">Not Signed Up</option>
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
              className="px-6 py-2.5 bg-[#36302A] text-[#FAF4ED] font-semibold rounded-lg shadow-lg hover:bg-[#2C2925] transition-all duration-200 flex items-center gap-2 hover:scale-105"
            >
              <span className="text-lg">🔍</span>
              Apply Filters
            </button>
            <button
              onClick={() => {
                setSelectedDate("");
                setSignedUp("");
                setSelectedName("");
                setFilteredInquiries(inquiries);
                toast.success("Filters cleared!");
              }}
              className="px-6 py-2.5 bg-red-600/90 text-[#FAF4ED] font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
            >
              <MdDeleteForever className="text-xl" />
              Clear Filters
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-6 py-2.5 bg-[#36302A] text-white font-semibold rounded-lg shadow-lg hover:bg-[#2C2925] transition-all duration-200 flex items-center gap-2 hover:scale-105"
            >
              <FaFileExcel className="text-xl" />
              <span className="hidden md:inline">Export CSV</span>
            </button>
            <button
              onClick={syncData}
              disabled={issyncing}
              className="px-6 py-2.5 bg-[#36302A] text-[#FAF4ED] font-semibold rounded-lg shadow-lg hover:bg-[#2C2925] transition-all duration-200 flex items-center gap-2 hover:scale-105 disabled:opacity-50"
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
              <table className="min-w-full table-auto border-collapse border border-[#36302A]/20">
                <thead className="bg-[#36302A] text-[#FAF4ED]">
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
                      "BrandName",
                      "Services",
                      "Socials",
                      "Website",
                      "Messages",
                    ].map((header) => (
                      <th
                        key={header}
                        className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm md:text-base"
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
                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base" style={{ userSelect: "none" }}>
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
                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base" style={{ userSelect: "none" }}>
                          <CopyableText
                            text={`${inquiry.phoneNumber}`}
                            type="Phone number"
                          />
                        </td>

                        {/* <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                        {inquiry.company}
                      </td> */}
                        <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base" style={{ userSelect: "none" }}>
                          <CopyableText
                            text={`${inquiry.company}`}
                            type="Brand Name"
                          />
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredInquiries.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
            pageButtonsStyles={"bg-[#36302A] hover:bg-[#2C2925] text-white font-serif"}
            recordInfoStyles={"font-serif text-gray-800"}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AdminPanel;