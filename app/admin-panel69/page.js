"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { MdDeleteForever } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa6";


const AdminPanel = () => {
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
  // const handleFetchData = async () => {
  //   debugger
  //   let filtered = inquiries;

  //   // Apply date filter if selected
  //   if (selectedDate) {
  //     const selectedDateStart = new Date(selectedDate);
  //     const selectedDateEnd = new Date(selectedDate);
  //     selectedDateEnd.setHours(23, 59, 59, 999);

  //     filtered = filtered.filter(inquiry => {
  //       const inquiryDate = new Date(inquiry.timestamp.seconds * 1000);
  //       return inquiryDate >= selectedDateStart && inquiryDate <= selectedDateEnd;
  //     });
  //   }

  //   // Apply signup filter if selected
  //   if (signedUp) {
  //     filtered = filtered.filter(inquiry => {
  //       if (signedUp === "Yes") {
  //         return inquiry.isChecked === true;
  //       } else if (signedUp === "No") {
  //         return inquiry.isChecked === false;
  //       }
  //       return true;
  //     });
  //   }

  //   setFilteredInquiries(filtered);

  //   if (filtered.length > 0) {
  //     toast.success("Data filtered successfully!");
  //   } else {
  //     toast.warning("No data matches the selected filters.");
  //   }



  //   const selectedDateStart = new Date(selectedDate);
  //   const selectedDateEnd = new Date(selectedDate);
  //   selectedDateEnd.setHours(23, 59, 59, 999); // Include the entire day

  //   try {
  //     const q = query(
  //       collection(db, "inquiries"),
  //       where("timestamp", ">=", selectedDateStart),
  //       where("timestamp", "<=", selectedDateEnd),
  //       orderBy("timestamp", "desc") // Ensure the filtered data is also ordered
  //     );
  //     const snapshot = await getDocs(q);
  //     const filteredData = snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     setFilteredInquiries(filteredData);
  //   } catch (error) {
  //     console.error("Error filtering inquiries by date:", error);
  //   }
  // };

  // Delete inquiry from Firestore
  const handleDeleteInquiry = async (id) => {
    try {
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

      // setFormSubmitMessage("All entries deleted successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSubmitMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error deleting documents from Firestore: ", error);
      setFormSubmitMessage("Failed to delete entries. Please try again later.");

      // Clear error message after 3 seconds
      setTimeout(() => {
        setFormSubmitMessage("");
      }, 3000);
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

  return (
    <div className="p-4 md:p-6 bg-[#FAF4ED] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 py-6 pb-4 mb-6">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#36302A] mb-4 md:mb-0">
          Admin Panel👨‍💻
        </h1>
        <button
          onClick={() => {
            // Add your delete all confirmation logic here
            if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
              handleDeleteAll();
              window.location.reload();
              toast.success("All data deleted successfully!");
            }
          }}
          className="px-4 py-2 bg-red-600 text-[#FAF4ED] font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <MdDeleteForever className="text-xl" />
          <span>Delete All Data</span>
        </button>
      </div>

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

      <div className="mb-6 text-center flex justify-center items-center space-x-4">
        <button
          onClick={() => {
            debugger
            if (selectedDate) { // Check if there is a filter selected
              handleFetchData();
              toast.success("Data fetched successfully!");
            }
            else if(signedUp)
              {
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
                    className="border border-[#36302A] px-4 md:px-4 py-2 md:py-6 text-left text-xs md:text-md md:text-base  font-semibold"
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
                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.timestamp
                        ? new Date(
                          inquiry.timestamp.seconds * 1000
                        ).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.firstName}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.lastName}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.email}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.isChecked ? "Yes" : "No"}
                    </td>

                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.phoneDialCode}
                    </td>
                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.phoneNumber}
                    </td>

                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.company}
                    </td>

                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.services}
                    </td>

                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.socials}
                    </td>

                    <td className="border border-[#36302A] px-4 py-2 font-serif text-sm md:text-base">
                      {inquiry.website}
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
