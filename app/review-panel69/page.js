"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, writeBatch, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { MdDeleteForever, MdContentCopy, MdChat } from "react-icons/md";
import { FaArrowLeft, FaExternalLinkAlt, FaFileExcel, FaSync } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { HiBellAlert } from "react-icons/hi2";
import PriorityDisplay from "../components/PriorityDisplay";
import { Badge } from 'lucide-react';
import { Pagination } from "../components/Pagination";
import ProtectedRoute from "../components/ProtectedRoutes";
import { AssignmentCell, AssignmentFilter } from "./ReviewUtility";
import { useAdminAuth } from "../components/providers/AdminAuthProvider";
import { DashboardSummary, FilterAccordion } from "./UiUtility";
import { createHighPriorityNotification, createHighPriorityReviewNotification, createReviewAssignmentNotification, createReviewStatusChangeNotification } from "../notifications/Utility";
import Link from "next/link";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";


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
  const [selectedName, setSelectedName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState({});
  const [issyncing, setIssyncing] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [assigningReview, setAssigningReview] = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const { admin } = useAdminAuth();
  const entriesPerPage = 20;

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "reviews"), orderBy("movedToReviewAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
        priority: doc.data().priority || "low",
        clientStatus: doc.data().clientStatus || "Pending",
        assignedTo: doc.data().assignedTo || null,
        assignedToName: doc.data().assignedToName || "Unassigned",
      }));

      // Filter reviews based on admin role
      let filteredData = data;

      // If not a superAdmin, only show reviews assigned to this admin
      if (admin && admin.role !== "superAdmin") {
        filteredData = data.filter((review) => review.assignedTo === admin.id);
      }

      setReviews(filteredData);
      setFilteredReviews(filteredData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    }
  };

  const handleAssignReview = async (docId, adminId, adminName) => {
    try {
      setAssigningReview((prev) => ({ ...prev, [docId]: true }));
      const reviewRef = doc(db, "reviews", docId);

      // Find the review data
      const reviewToAssign = reviews.find((review) => review.docId === docId);

      if (!reviewToAssign) {
        toast.error("Review not found");
        return false;
      }

      // If adminId is empty, this is an unassignment
      if (!adminId) {
        await updateDoc(reviewRef, {
          assignedTo: null,
          assignedToName: "Unassigned",
          assignedBy: null,
          assignedAt: null,
        });
        toast.success("Review unassigned successfully!");
      } else {
        // Find the selected admin
        const selectedAdmin = admins.find((a) => a.id === adminId);

        // Check permissions based on roles
        // Only regular admins are restricted - superAdmins can assign to anyone including themselves
        if (admin?.role !== "superAdmin" && selectedAdmin?.role === "superAdmin") {
          toast.error("Regular admins cannot assign reviews to superAdmins.");
          return false;
        }

        // Proceed with assignment
        await updateDoc(reviewRef, {
          assignedTo: adminId,
          assignedToName: adminName,
          assignedBy: admin?.id || "system",
          assignedAt: new Date(),
        });

        // Create notification for the assigned admin (if it's not self-assignment)
        if (adminId !== admin?.id) {
          try {
            // Create basic assignment notification
            await createReviewAssignmentNotification({
              adminId,
              reviewId: docId,
              reviewData: reviewToAssign,
              assignedBy: admin?.id || "system",
              assignerName: admin?.firstName ? `${admin.firstName} ${admin.lastName}` : admin?.username || "Admin",
            });

            // If high priority, send an additional notification
            if (reviewToAssign.priority === "high" || reviewToAssign.priority === "highest") {
              await createHighPriorityNotification({
                adminId,
                reviewId: docId,
                reviewData: reviewToAssign,
              });
            }
          } catch (notifError) {
            console.error("Error creating notification:", notifError);
            // Don't fail the assignment just because notification failed
          }
        }

        // Show appropriate success message
        if (adminId === admin?.id) {
          toast.success(`Review assigned to yourself successfully!`);
        } else {
          toast.success(`Review assigned to ${adminName} successfully!`);
        }
      }

      // Update local state
      const updatedReviews = reviews.map((review) =>
        review.docId === docId
          ? {
              ...review,
              assignedTo: adminId || null,
              assignedToName: adminId ? adminName : "Unassigned",
              assignedBy: admin?.id || "system",
              assignedAt: new Date(),
            }
          : review,
      );

      setReviews(updatedReviews);
      setFilteredReviews(
        filteredReviews.map((review) =>
          review.docId === docId
            ? {
                ...review,
                assignedTo: adminId || null,
                assignedToName: adminId ? adminName : "Unassigned",
                assignedBy: admin?.id || "system",
                assignedAt: new Date(),
              }
            : review,
        ),
      );

      return true; // Return success to the caller
    } catch (error) {
      console.error("Error assigning review:", error);
      toast.error("Failed to assign review. Please try again.");
      return false; // Return failure to the caller
    } finally {
      setAssigningReview((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const syncData = async () => {
    setIssyncing(true);
    try {
      const reviewsRef = collection(db, "reviews");
      const q = query(reviewsRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      const newData = querySnapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
        clientStatus: doc.data().clientStatus || "Pending",
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

  const fetchAdmins = async () => {
    try {
      const q = query(collection(db, "admins"));
      const snapshot = await getDocs(q);
      const adminData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        role: doc.data().role || "admin", // Ensure role is included
        fullName: `${doc.data().firstName || ""} ${doc.data().lastName || ""} (${doc.data().username || "Admin"})`,
      }));
      setAdmins(adminData);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to fetch admins list");
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

      if (
        currentPage > 1 &&
        updatedFilteredReviews.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).length === 0
      ) {
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
    fetchAdmins();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [admin]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSignUpChange = (e) => {
    setSignedUp(e.target.value);
  };

  const handleNameChange = (e) => {
    setSelectedName(e.target.value);
  };

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setSelectedPriority(e.target.value);
  };

  const handleClientStatusChange = (e) => {
    setSelectedClientStatus(e.target.value);
  };

  const handleAssignmentChange = (e) => {
    setSelectedAssignment(e.target.value);
  };

  const handleFetchData = () => {
    let filtered = reviews;

    if (selectedDate) {
      const selectedDateStart = new Date(selectedDate);
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);

      filtered = filtered.filter((review) => {
        const reviewDate = new Date(review.movedToReviewAt.seconds * 1000);
        return reviewDate >= selectedDateStart && reviewDate <= selectedDateEnd;
      });
    }

    // Brand Name filtration code...
    if (selectedCompany && selectedCompany.trim() !== "") {
      filtered = filtered.filter(
        (review) => review.company && review.company.toLowerCase().includes(selectedCompany.toLowerCase()),
      );
    }

    // Name filtration code...
    if (selectedName && selectedName.trim() !== "") {
      filtered = filtered.filter(
        (review) => review.firstName && review.firstName.toLowerCase().includes(selectedName.toLowerCase()),
      );
    }

    if (signedUp) {
      filtered = filtered.filter((review) => {
        if (signedUp === "Yes") {
          return review.isChecked === true;
        } else if (signedUp === "No") {
          return review.isChecked === false;
        }
        return true;
      });
    }

    if (selectedPriority) {
      filtered = filtered.filter((review) => review.priority === selectedPriority);
    }

    // Add this condition to the handleFetchData filtering logic
    if (selectedAssignment) {
      if (selectedAssignment === "unassigned") {
        filtered = filtered.filter((review) => !review.assignedTo);
      } else {
        filtered = filtered.filter((review) => review.assignedTo === selectedAssignment);
      }
    }

    if (selectedClientStatus) {
      filtered = filtered.filter((review) => review.clientStatus === selectedClientStatus);
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
  const displayedReviews = filteredReviews.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, filteredReviews.length);

  const CopyableText = ({ text, type }) => {
    const handleCopy = (e) => {
      e.stopPropagation();
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success(`${type} copied to clipboard!`))
        .catch(() => toast.error("Failed to copy to clipboard"));
    };

    const handleEmailRedirect = (e) => {
      e.stopPropagation();
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(text)}`, "_blank");
    };

    return (
      <div className="flex items-center space-x-2 group">
        <span className="group-hover:underline hover:text-green-500 cursor-pointer" onClick={handleCopy}>
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
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-green-600 hover:text-green-600"
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

      const finalUrl = url.startsWith("http") ? url : `http://${url}`;
      window.open(finalUrl, "_blank", "noopener,noreferrer");
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
    ) : (
      "N/A"
    );
  };

  const handleSendNotification = async (email, firstName, docId) => {
    if (loadingNotifications[docId]) return; // Prevent multiple clicks

    try {
      // Show loading state
      setLoadingNotifications((prev) => ({ ...prev, [docId]: true }));

      // Show immediate "queued" toast
      toast.info("Notification email queued for sending!");

      // Start the email sending process in the background
      fetch("/api/send-notification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
        }),
      });

      // Hardcoded time period for loading state (e.g., 3 seconds)
      const LOADING_DURATION = 3000; // 3 seconds

      // Use setTimeout to show success toast after the hardcoded duration
      setTimeout(() => {
        // Show success toast after the timeout
        toast.success("Client notification email sent successfully!");

        // Remove loading state
        setLoadingNotifications((prev) => ({ ...prev, [docId]: false }));
      }, LOADING_DURATION);
    } catch (error) {
      console.error("Error queueing notification email:", error);
      toast.error("Failed to queue notification email. Please try again.");

      // Remove loading state in case of error
      setLoadingNotifications((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const convertToCSV = (data) => {
    const headers = [
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
      "Priority",
      "ClientStatus",
    ];
    const csvRows = [headers.join(",")];

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
        review.clientStatus,
      ];
      csvRows.push(row.map((field) => `"${field}"`).join(","));
    }

    return csvRows.join("\n");
  };

  const handleDownloadCSV = () => {
    const csvContent = convertToCSV(filteredReviews);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "reviews.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePriorityUpdate = async (docId, newPriority) => {
    try {
      const reviewRef = doc(db, "reviews", docId);

      // Find the review to update
      const reviewToUpdate = reviews.find((review) => review.docId === docId);

      if (!reviewToUpdate) {
        toast.error("Review not found");
        return;
      }

      // Get the old priority for comparison
      const oldPriority = reviewToUpdate.priority;

      // Update the priority in Firestore
      await updateDoc(reviewRef, {
        priority: newPriority,
        priorityChangedBy: admin?.id || "system",
        priorityChangedAt: new Date(),
      });

      // Create notification if:
      // 1. The review is assigned to someone else
      // 2. The priority is changed to high or highest
      // 3. The priority was previously not high or highest
      const isHighPriority = newPriority === "high" || newPriority === "highest";
      const wasHighPriority = oldPriority === "high" || oldPriority === "highest";

      if (reviewToUpdate.assignedTo && reviewToUpdate.assignedTo !== admin?.id && isHighPriority && !wasHighPriority) {
        try {
          // Create a high priority notification
          await createHighPriorityReviewNotification({
            adminId: reviewToUpdate.assignedTo,
            reviewId: docId,
            reviewData: {
              ...reviewToUpdate,
              priority: newPriority, // Make sure to use the new priority value
            },
          });
        } catch (notifError) {
          console.error("Error creating priority notification:", notifError);
          // Don't fail the priority update just because notification failed
        }
      }

      // Update local state
      const updatedReviews = reviews.map((review) =>
        review.docId === docId
          ? {
              ...review,
              priority: newPriority,
              priorityChangedBy: admin?.id || "system",
              priorityChangedAt: new Date(),
            }
          : review,
      );

      setReviews(updatedReviews);
      setFilteredReviews(updatedReviews);

      toast.success("Priority updated successfully!");
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority. Please try again.");
    }
  };

  const handleClientStatusUpdate = async (docId, currentStatus, newStatus) => {
    if (!window.confirm(`Are you sure you want to update the client status to '${newStatus}'?`)) {
      return;
    }

    try {
      const reviewRef = doc(db, "reviews", docId);
      const updateData = { clientStatus: newStatus };

      // Find the review data
      const reviewToUpdate = reviews.find((review) => review.docId === docId);

      if (!reviewToUpdate) {
        toast.error("Review not found");
        return;
      }

      // If moving to "In Progress" from "Pending", store the timestamp
      if (currentStatus === "Pending" && newStatus === "In Progress") {
        updateData.inProgressStartedAt = new Date(); // Store as a Date object (Firestore will convert to Timestamp)
      }

      // If moving away from "In Progress", optionally clear the timestamp
      if (currentStatus === "In Progress" && newStatus !== "In Progress") {
        updateData.inProgressStartedAt = null; // Clear the timestamp when leaving "In Progress"
      }

      // Add who made the status change
      updateData.statusChangedBy = admin?.id || "system";
      updateData.statusChangedAt = new Date();

      await updateDoc(reviewRef, updateData);

      // Create notification for the assigned admin (if there is one and it's not the current user)
      if (reviewToUpdate.assignedTo && reviewToUpdate.assignedTo !== admin?.id) {
        try {
          await createReviewStatusChangeNotification({
            adminId: reviewToUpdate.assignedTo,
            reviewId: docId,
            reviewData: reviewToUpdate,
            oldStatus: currentStatus,
            newStatus: newStatus,
            changedBy: admin?.id || "system",
          });
        } catch (notifError) {
          console.error("Error creating status change notification:", notifError);
          // Don't fail the status update just because notification failed
        }
      }

      // Update local state
      const updatedReviews = reviews.map((review) =>
        review.docId === docId
          ? {
              ...review,
              clientStatus: newStatus,
              inProgressStartedAt: updateData.inProgressStartedAt,
              statusChangedBy: updateData.statusChangedBy,
              statusChangedAt: updateData.statusChangedAt,
            }
          : review,
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
        case "Pending":
          return {
            bgColor: "bg-orange-50",
            textColor: "text-orange-700",
            borderColor: "border-orange-200",
            prefix: "•",
          };
        case "In Progress":
          return {
            bgColor: "bg-blue-50",
            textColor: "text-blue-700",
            borderColor: "border-blue-200",
            prefix: "↻",
          };
        case "No Response":
          return {
            bgColor: "bg-red-50",
            textColor: "text-red-700",
            borderColor: "border-red-200",
            prefix: "✗",
          };
        case "Reached out":
          return {
            bgColor: "bg-green-50",
            textColor: "text-green-700",
            borderColor: "border-green-200",
            prefix: "✓",
          };
        default:
          return {
            bgColor: "bg-gray-50",
            textColor: "text-gray-700",
            borderColor: "border-gray-200",
            prefix: "•",
          };
      }
    };

    const config = getStatusConfig(status);

    return (
      <div
        className={`
                inline-flex items-center gap-2 
                px-4 py-2 rounded-lg 
                ${config.bgColor} 
                ${config.textColor} 
                border ${config.borderColor}
                font-semibold text-base
                transition-all duration-200
            `}
      >
        <span className="text-lg">{config.prefix}</span>
        <span>{status}</span>
      </div>
    );
  };

  const UpdateStatusCell = ({ status, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);

    const statuses = ["Pending", "In Progress", "No Response", "Reached out"];
    const currentIndex = statuses.indexOf(status);

    // Filter out the current status from options
    const availableStatuses = statuses.filter((s) => s !== status);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center justify-center p-2 rounded-lg bg-green-50 hover:bg-green-100 active:bg-green-200 transition-all duration-200"
        >
          <Badge className="w-5 h-5 text-green-600 group-hover:text-green-700" />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Update status
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-30 mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg w-40">
            {availableStatuses.map((newStatus) => (
              <button
                key={newStatus}
                onClick={() => {
                  onUpdate(newStatus);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm flex items-center gap-2"
              >
                <StatusCell status={newStatus} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
        <motion.div variants={fadeInLeft} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-green-300/50 py-6 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-6xl font-serif font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
                Review Panel
              </h1>
              <span className="text-4xl animate-bounce">📋</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin-panel69")}
                className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 hover:translate-x-[-4px]"
              >
                <FaArrowLeft className="text-lg" />
                <span>Back to Admin Panel</span>
              </button>
              {admin && admin.role === "superAdmin" && (
                <button
                  onClick={handleDeleteAllReviews}
                  disabled={isDeletingAll}
                  className="px-4 py-2.5 bg-red-600/90 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                >
                  <MdDeleteForever className="text-xl" />
                  <span>{isDeletingAll ? "Deleting..." : "Delete All"}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <DashboardSummary reviews={reviews} />

        {/* Enhanced Filter Section */}
        <motion.div variants={fadeInRight} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <FilterAccordion className={"bg-green-50 text-green-800 hover:bg-green-100"}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* First row - most important filters */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700" htmlFor="date-filter">
                    <span>📅</span> Date
                  </label>
                  <input
                    id="date-filter"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700" htmlFor="name-filter">
                    <span>👤</span> Name
                  </label>
                  <input
                    id="name-filter"
                    type="text"
                    value={selectedName}
                    onChange={handleNameChange}
                    placeholder="Enter FirstName"
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700" htmlFor="company-filter">
                    <span>🏢</span> Brand
                  </label>
                  <input
                    id="company-filter"
                    type="text"
                    value={selectedCompany}
                    onChange={handleCompanyChange}
                    placeholder="Enter BrandName"
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Second row - additional filters with dropdown */}
                <div className="space-y-2">
                  <label
                    className="flex items-center gap-1 text-sm font-medium text-gray-700"
                    htmlFor="priority-filter"
                  >
                    <span>🎯</span> Priority
                  </label>
                  <select
                    id="priority-filter"
                    value={selectedPriority}
                    onChange={handlePriorityChange}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-green-500 bg-white"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="highest">Highest</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    className="flex items-center gap-1 text-sm font-medium text-gray-700"
                    htmlFor="client-status-filter"
                  >
                    <span>📊</span> Status
                  </label>
                  <select
                    id="client-status-filter"
                    value={selectedClientStatus}
                    onChange={handleClientStatusChange}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-green-500 bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="No Response">No Response</option>
                    <option value="Reached out">Reached Out</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700" htmlFor="signup-filter">
                    <span>📝</span> Newsletter
                  </label>
                  <select
                    id="signup-filter"
                    value={signedUp}
                    onChange={handleSignUpChange}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-green-500 bg-white"
                  >
                    <option value="">All Signups</option>
                    <option value="Yes">Subscribed</option>
                    <option value="No">Not Subscribed</option>
                  </select>
                </div>

                {admin && admin.role === "superAdmin" && (
                  <AssignmentFilter
                    value={selectedAssignment}
                    onChange={handleAssignmentChange}
                    admins={admins}
                    isSuperAdmin={admin?.role === "superAdmin"}
                  />
                )}
              </div>
            </FilterAccordion>
          </div>
        </motion.div>

        {/* Enhanced Action Buttons */}
        <motion.div
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-4"
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
                setSelectedName("");
                setSelectedCompany("");
                setSelectedAssignment("");
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
            {admin && admin.role === "superAdmin" && (
              <button
                onClick={syncData}
                disabled={issyncing}
                className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 hover:scale-105 disabled:opacity-50"
              >
                <FaSync className={`text-xl ${issyncing ? "animate-spin" : ""}`} />
                <span>{issyncing ? "Syncing..." : "Sync Data"}</span>
              </button>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
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
                      "Chat", // From newFeatured
                      "Priority",
                      "ChangePriority",
                      "Client Status",
                      "Update Status",
                      "Assigned To",
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
                      "OpenReview", // From bug-fix
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
                      <tr
                        key={review.docId}
                        className={`hover:bg-green-50 ${review.clientStatus === "Reached out" ? "opacity-50" : ""}`}
                      >
                        <td className="border border-green-200 px-4 md:px-7 py-2 md:py-2 text-xs md:text-base">
                          {admin && admin.role === "superAdmin" && (
                            <button
                              onClick={() => handleDeleteReview(review.docId)}
                              className="text-red-500 hover:text-red-700 text-lg md:text-2xl"
                              title="Delete"
                            >
                              <MdDeleteForever />
                            </button>
                          )}
                        </td>
                        <td className="border border-green-200 px-4 md:px-7 py-2 md:py-2 text-xs md:text-base">
                          <button
                            onClick={() => router.push(`/chat/${review.docId}`)}
                            className="text-green-500 hover:text-green-700 text-lg md:text-2xl"
                            title="Chat"
                          >
                            <MdChat />
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
                            onUpdate={(newStatus) =>
                              handleClientStatusUpdate(review.docId, review.clientStatus, newStatus)
                            }
                          />
                        </td>
                        <td className="border border-green-200 px-4 py-2">
                          <AssignmentCell
                            review={review}
                            admins={admins}
                            onAssign={handleAssignReview}
                            isAssigning={assigningReview[review.docId]}
                            isSuperAdmin={admin?.role === "superAdmin"}
                            currentAdminId={admin?.id}
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
                        <td
                          className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base"
                          style={{ userSelect: "none" }}
                        >
                          <CopyableText text={review.email} type="Email" />
                        </td>
                        <td className="border border-green-200 px-4 py-2 text-sm md:text-base">
                          <button
                            onClick={() => handleSendNotification(review.email, review.firstName, review.docId)}
                            className="px-2 py-1 rounded-md transition-colors duration-200 flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white"
                            title="Send notification email to client"
                            disabled={loadingNotifications[review.docId]}
                          >
                            {loadingNotifications[review.docId] ? (
                              <span className="animate-spin">⌛</span>
                            ) : (
                              <HiBellAlert className="text-sm md:text-base" />
                            )}
                            <span className="hidden md:inline">
                              {loadingNotifications[review.docId] ? "Sending..." : "Notify"}
                            </span>
                          </button>
                        </td>
                        <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                          {review.isChecked ? "Yes" : "No"}
                        </td>
                        <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                          {review.phoneDialCode}
                        </td>
                        <td
                          className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base"
                          style={{ userSelect: "none" }}
                        >
                          <CopyableText text={`${review.phoneNumber}`} type="Phone number" />
                        </td>
                        <td
                          className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base"
                          style={{ userSelect: "none" }}
                        >
                          <CopyableText text={`${review.company}`} type="Brand Name" />
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
                        <td className="border border-green-200 px-4 py-2 font-serif text-sm md:text-base">
                          <Link href={`/review-panel69/${review.docId}`}>
                            <button><FaArrowUpRightFromSquare /></button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="21" className="text-center py-4">
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredReviews.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
            pageButtonsStyles={"bg-green-500 hover:bg-green-600 font-serif"}
            recordInfoStyles={"text-gray-800 font-serif"}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ReviewPanel;