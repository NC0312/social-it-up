"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, writeBatch, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import {
  MdDeleteForever,
  MdContentCopy,
  MdOutlineSaveAlt,
  MdFilterList,
  MdInfo,
  MdOutlineRefresh,
  MdClose,
  MdOutlineViewModule,
  MdOutlineTableRows
} from "react-icons/md";
import { useRouter } from "next/navigation";
import {
  FaArrowRight,
  FaExternalLinkAlt,
  FaFileExcel,
  FaSync,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "../components/Pagination";
import ProtectedRoute from "../components/ProtectedRoutes";
import { FilterAccordion } from "../review-panel69/UiUtility";

// New component for statistics cards
const StatisticsCard = ({ icon: Icon, title, value, trend, color }) => {
  // Define color schemes based on the color prop
  const getColorScheme = () => {
    switch (color) {
      case 'green':
        return {
          gradient: 'from-green-50 to-green-100',
          iconBg: 'bg-green-200',
          iconColor: 'text-green-700',
          trendUp: 'text-green-600',
          trendDown: 'text-red-600',
          border: 'border-green-300'
        };
      case 'blue':
        return {
          gradient: 'from-blue-50 to-blue-100',
          iconBg: 'bg-blue-200',
          iconColor: 'text-blue-700',
          trendUp: 'text-green-600',
          trendDown: 'text-red-600',
          border: 'border-blue-300'
        };
      case 'amber':
        return {
          gradient: 'from-amber-50 to-amber-100',
          iconBg: 'bg-amber-200',
          iconColor: 'text-amber-700',
          trendUp: 'text-green-600',
          trendDown: 'text-red-600',
          border: 'border-amber-300'
        };
      case 'purple':
        return {
          gradient: 'from-purple-50 to-purple-100',
          iconBg: 'bg-purple-200',
          iconColor: 'text-purple-700',
          trendUp: 'text-green-600',
          trendDown: 'text-red-600',
          border: 'border-purple-300'
        };
      case 'red':
        return {
          gradient: 'from-red-50 to-red-100',
          iconBg: 'bg-red-200',
          iconColor: 'text-red-700',
          trendUp: 'text-green-600',
          trendDown: 'text-red-600',
          border: 'border-red-300'
        };
      default:
        return {
          gradient: 'from-gray-50 to-gray-100',
          iconBg: 'bg-gray-200',
          iconColor: 'text-gray-700',
          trendUp: 'text-green-600',
          trendDown: 'text-red-600',
          border: 'border-gray-300'
        };
    }
  };

  const colorScheme = getColorScheme();

  // Determine if trend is positive or negative
  const isTrendPositive = trend && trend.includes('+');
  const trendColor = isTrendPositive ? colorScheme.trendUp : colorScheme.trendDown;
  const trendIcon = isTrendPositive ? '↑' : '↓';

  return (
    <motion.div
      className={`bg-gradient-to-br ${colorScheme.gradient} rounded-xl shadow-sm border border-none overflow-hidden`}
      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
            {trend && (
              <div className="flex items-center mt-2">
                <span className={`${trendColor} text-sm font-medium flex items-center`}>
                  <span className="mr-1">{trendIcon}</span>
                  {trend}
                </span>
                <span className="text-xs text-gray-500 ml-1">since yesterday</span>
              </div>
            )}
          </div>
          <div className={`p-3 ${colorScheme.iconBg} rounded-full ${colorScheme.iconColor}`}>
            {typeof Icon === 'string' ? (
              <span className="text-xl">{Icon}</span>
            ) : (
              <Icon className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Loading skeleton component
const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-10 bg-gray-200 rounded mb-4"></div>
    {[...Array(5)].map((_, index) => (
      <div key={index} className="h-16 bg-gray-100 rounded mb-2"></div>
    ))}
  </div>
);

// Enhanced detail view modal component
const DetailModal = ({ inquiry, onClose, onDelete, onMoveToReview }) => {
  if (!inquiry) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-[#36302A]">Inquiry Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-500">Contact Information</h3>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Name:</span> {inquiry.firstName} {inquiry.lastName}</p>
                <p><span className="font-medium">Email:</span> {inquiry.email}</p>
                <p><span className="font-medium">Phone:</span> {inquiry.phoneDialCode} {inquiry.phoneNumber}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Brand Information</h3>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Brand Name:</span> {inquiry.company}</p>
                <p><span className="font-medium">Website:</span> {inquiry.website || "N/A"}</p>
                <p><span className="font-medium">Social Media:</span> {inquiry.socials || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-500">Inquiry Information</h3>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Date:</span> {inquiry.timestamp ? new Date(inquiry.timestamp.seconds * 1000).toLocaleString() : "N/A"}</p>
                <p><span className="font-medium">Services Requested:</span> {inquiry.services}</p>
                <p><span className="font-medium">Newsletter Signup:</span> {inquiry.isChecked ? "Yes" : "No"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Message</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                <p>{inquiry.messages || "No message provided"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={() => onDelete(inquiry.id)}
            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
          >
            <MdDeleteForever />
            Delete
          </button>
          <button
            onClick={() => onMoveToReview(inquiry)}
            className="px-4 py-2 bg-[#36302A] text-white rounded-lg hover:bg-[#2C2925] transition-colors flex items-center gap-1"
          >
            <MdOutlineSaveAlt />
            Move to Review
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Context menu for quick actions
const ContextMenu = ({ position, onClose, actions }) => {
  return (
    <motion.div
      className="fixed z-40 bg-white shadow-xl rounded-lg overflow-hidden border"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        top: position.y,
        left: position.x
      }}
    >
      <ul className="py-1">
        {actions.map((action, index) => (
          <li key={index}>
            <button
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 ${action.color ? action.color : 'text-[#36302A]'}`}
            >
              {action.icon && <span>{action.icon}</span>}
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

// Main component
const AdminPanel = () => {
  // Animation variants
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
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedName, setSelectedName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [signedUp, setSignedUp] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [issyncing, setIssyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // table or card
  const [detailModalInquiry, setDetailModalInquiry] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, item: null });
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    timestamp: true,
    firstName: true,
    lastName: true,
    email: true,
    signedUp: true,
    phoneDialCode: true,
    phoneNumber: true,
    company: true,
    services: true,
    socials: true,
    website: true,
    messages: true,
  });
  const [columnMenu, setColumnMenu] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const entriesPerPage = 20;

  // Available services list (to be populated from data)
  const [availableServices, setAvailableServices] = useState([]);

  // Saved filters/views
  const [savedFilters, setSavedFilters] = useState([
    { name: "All Inquiries", filter: {} },
    { name: "Today's Inquiries", filter: { dateRange: { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] } } },
    { name: "Newsletter Signups", filter: { signedUp: "Yes" } },
  ]);

  // Initialize auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        syncData(true); // silent refresh
      }, 5000); // every 5 seconds
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  }, [autoRefresh]);

  // Fetch all inquiries from Firestore, ordered by timestamp in descending order
  const fetchInquiries = async () => {
    setIsLoading(true);
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

      // Extract unique services for filter dropdown
      const services = new Set();
      data.forEach(item => {
        if (item.services) {
          const serviceList = item.services.split(',').map(s => s.trim());
          serviceList.forEach(service => services.add(service));
        }
      });
      setAvailableServices(Array.from(services));

      setInquiries(data);
      setFilteredInquiries(data); // Initially display all inquiries
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setIsLoading(false);
      toast.error("Failed to load inquiries");
    }
  };

  const syncData = async (silent = false) => {
    if (!silent) setIssyncing(true);
    try {
      const inquiriesRef = collection(db, "inquiries");
      const q = query(inquiriesRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      const newData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setInquiries(newData);

      // Reapply current filters to the new data
      applyFilters(newData);

      if (!silent) toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Error syncing data:", error);
      if (!silent) toast.error("Failed to refresh data");
    } finally {
      if (!silent) setIssyncing(false);
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
      setSelectedRows(selectedRows.filter(id => id !== inquiry.id));

      // Close detail modal if open
      if (detailModalInquiry && detailModalInquiry.id === inquiry.id) {
        setDetailModalInquiry(null);
      }

      toast.success("Moved to Review Panel!");
    } catch (error) {
      console.error("Error moving to review:", error);
      toast.error("Failed to move to review.");
    }
  };

  // Bulk move to review
  const handleBulkMoveToReview = async () => {
    if (selectedRows.length === 0) {
      toast.warning("No rows selected");
      return;
    }

    try {
      const batch = writeBatch(db);
      const selectedInquiries = inquiries.filter(inquiry => selectedRows.includes(inquiry.id));

      // Add each selected inquiry to the reviews collection
      for (const inquiry of selectedInquiries) {
        const newReviewRef = doc(collection(db, "reviews"));
        batch.set(newReviewRef, {
          ...inquiry,
          movedToReviewAt: new Date()
        });

        // Delete from inquiries collection
        const inquiryRef = doc(db, "inquiries", inquiry.id);
        batch.delete(inquiryRef);
      }

      await batch.commit();

      // Update local state
      setInquiries(inquiries.filter(item => !selectedRows.includes(item.id)));
      setFilteredInquiries(filteredInquiries.filter(item => !selectedRows.includes(item.id)));
      setSelectedRows([]);
      setSelectAll(false);

      toast.success(`${selectedRows.length} inquiries moved to Review Panel!`);
    } catch (error) {
      console.error("Error moving inquiries to review:", error);
      toast.error("Failed to move selected inquiries to review.");
    }
  };

  useEffect(() => {
    fetchInquiries(); // Fetch data on initial render
  }, []);

  // Handle row selection
  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Handle select all rows
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(displayedInquiries.map(inquiry => inquiry.id));
    }
    setSelectAll(!selectAll);
  };

  // Apply filters to data
  const applyFilters = (data = inquiries) => {
    let filtered = [...data];

    // Brand Name filteration
    if (selectedCompany && selectedCompany.trim() !== "") {
      filtered = filtered.filter(inquiry =>
        inquiry.company &&
        inquiry.company.toLowerCase().includes(selectedCompany.toLowerCase())
      );
    }

    // Name filteration
    if (selectedName && selectedName.trim() !== "") {
      filtered = filtered.filter(inquiry =>
        inquiry.firstName &&
        inquiry.firstName.toLowerCase().includes(selectedName.toLowerCase())
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(inquiry => {
        if (!inquiry.timestamp) return false;
        const inquiryDate = new Date(inquiry.timestamp.seconds * 1000);
        return inquiryDate >= startDate && inquiryDate <= endDate;
      });
    }
    // Single date filter (legacy support)
    else if (selectedDate) {
      const selectedDateStart = new Date(selectedDate);
      selectedDateStart.setHours(0, 0, 0, 0);

      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);

      filtered = filtered.filter(inquiry => {
        if (!inquiry.timestamp) return false;
        const inquiryDate = new Date(inquiry.timestamp.seconds * 1000);
        return inquiryDate >= selectedDateStart && inquiryDate <= selectedDateEnd;
      });
    }

    // Services filter
    if (selectedServices.length > 0) {
      filtered = filtered.filter(inquiry => {
        if (!inquiry.services) return false;
        const inquiryServices = inquiry.services.split(',').map(s => s.trim());
        return selectedServices.some(service => inquiryServices.includes(service));
      });
    }

    // Apply signup filter
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFetchData = () => {
    applyFilters();

    if (filteredInquiries.length > 0) {
      toast.success("Data filtered successfully!");
    } else {
      toast.warning("No data matches the selected filters.");
    }
  };

  // Apply a saved filter preset
  const handleApplySavedFilter = (filter) => {
    // Reset all filters first
    setSelectedCompany("");
    setSelectedName("");
    setDateRange({ start: "", end: "" });
    setSelectedDate("");
    setSelectedServices([]);
    setSignedUp("");

    // Apply the saved filter
    if (filter.filter.company) setSelectedCompany(filter.filter.company);
    if (filter.filter.name) setSelectedName(filter.filter.name);
    if (filter.filter.dateRange) setDateRange(filter.filter.dateRange);
    if (filter.filter.services) setSelectedServices(filter.filter.services);
    if (filter.filter.signedUp) setSignedUp(filter.filter.signedUp);

    // Apply filters after a short delay to ensure state updates
    setTimeout(() => {
      handleFetchData();
    }, 100);
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
    // Determine which data to export (all filtered or just selected)
    const dataToExport = selectedRows.length > 0
      ? filteredInquiries.filter(item => selectedRows.includes(item.id))
      : filteredInquiries;

    if (dataToExport.length === 0) {
      toast.warning("No data to export");
      return;
    }

    if (dataToExport.length > 1000) {
      toast.info("Preparing CSV for download. This may take a moment for large datasets...");
    }

    setTimeout(() => {
      try {
        const csvContent = convertToCSV(dataToExport);
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
          toast.success(`CSV with ${dataToExport.length} records downloaded successfully!`);
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
      const inquiryDoc = doc(db, "inquiries", id);
      await deleteDoc(inquiryDoc);
      setInquiries(inquiries.filter((inquiry) => inquiry.id !== id));
      setFilteredInquiries(filteredInquiries.filter((inquiry) => inquiry.id !== id));
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));

      // Close detail modal if open
      if (detailModalInquiry && detailModalInquiry.id === id) {
        setDetailModalInquiry(null);
      }

      toast.success("Deleted successfully!");
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      toast.error("Failed to delete inquiry.");
    }
  };

  // Bulk delete selected inquiries
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.warning("No rows selected");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedRows.length} selected inquiries? This action cannot be undone.`)) {
      return;
    }

    try {
      const batch = writeBatch(db);

      selectedRows.forEach(id => {
        const inquiryRef = doc(db, "inquiries", id);
        batch.delete(inquiryRef);
      });

      await batch.commit();

      // Update local state
      setInquiries(inquiries.filter(item => !selectedRows.includes(item.id)));
      setFilteredInquiries(filteredInquiries.filter(item => !selectedRows.includes(item.id)));
      setSelectedRows([]);
      setSelectAll(false);

      toast.success(`${selectedRows.length} inquiries deleted successfully!`);
    } catch (error) {
      console.error("Error deleting inquiries:", error);
      toast.error("Failed to delete selected inquiries.");
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
      setSelectedRows([]);
      setSelectAll(false);

      toast.success("All entries deleted successfully!");
    } catch (error) {
      console.error("Error deleting documents from Firestore: ", error);
      toast.error("Failed to delete entries. Please try again later.");
    }
  };

  // Handle row click for detail view
  const handleRowClick = (inquiry) => {
    setDetailModalInquiry(inquiry);
  };

  // Show context menu on right click
  const handleContextMenu = (e, inquiry) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      item: inquiry
    });
  };

  // Hide context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        setContextMenu({ ...contextMenu, show: false });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

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

  // Calculate statistics
  const getTodayInquiries = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return inquiries.filter(inquiry => {
      if (!inquiry.timestamp) return false;
      const inquiryDate = new Date(inquiry.timestamp.seconds * 1000);
      return inquiryDate >= today;
    }).length;
  };

  const getSignupRate = () => {
    if (inquiries.length === 0) return "0%";
    const signups = inquiries.filter(inquiry => inquiry.isChecked).length;
    return `${Math.round((signups / inquiries.length) * 100)}%`;
  };

  const getMostRequestedService = () => {
    if (inquiries.length === 0) return "N/A";

    const serviceCount = {};
    inquiries.forEach(inquiry => {
      if (!inquiry.services) return;

      const services = inquiry.services.split(',').map(s => s.trim());
      services.forEach(service => {
        serviceCount[service] = (serviceCount[service] || 0) + 1;
      });
    });

    let maxService = "";
    let maxCount = 0;

    Object.entries(serviceCount).forEach(([service, count]) => {
      if (count > maxCount) {
        maxService = service;
        maxCount = count;
      }
    });

    return maxService || "N/A";
  };

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
              <span className="absolute hidden group-hover/tooltip:block bg-[#36302A] text-white text-xs rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                Open in Gmail
              </span>
            </div>
            <div className="relative group/tooltip">
              <MdContentCopy
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#36302A]"
                onClick={handleCopy}
              />
              <span className="absolute hidden group-hover/tooltip:block bg-[#36302A] text-white text-xs rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
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
            <span className="absolute hidden group-hover/tooltip:block bg-[#36302A] text-white text-xs rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              Copy to clipboard
            </span>
          </div>
        )}
      </div>
    );
  };

  // Clickable link component
  const ExternalLink = ({ url }) => {
    const handleClick = (e) => {
      e.stopPropagation();
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

  // Component for card view (alternative to table view)
  const InquiryCard = ({ inquiry }) => {
    const date = inquiry.timestamp
      ? new Date(inquiry.timestamp.seconds * 1000).toLocaleString()
      : "N/A";

    const isNewInquiry = () => {
      if (!inquiry.timestamp) return false;
      const inquiryDate = new Date(inquiry.timestamp.seconds * 1000);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return inquiryDate >= yesterday;
    };

    return (
      <motion.div
        className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${isNewInquiry() ? 'border-blue-500' : 'border-[#36302A]'}`}
        whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
        transition={{ duration: 0.2 }}
        onClick={() => handleRowClick(inquiry)}
        onContextMenu={(e) => handleContextMenu(e, inquiry)}
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(inquiry.id)}
                    onChange={(e) => {
                      handleRowSelect(inquiry.id);
                    }}
                    className="h-4 w-4"
                  />
                </div>
                <h3 className="font-medium text-lg">{inquiry.firstName} {inquiry.lastName}</h3>
                {isNewInquiry() && <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">New</span>}
              </div>
              <p className="text-sm text-gray-500 mt-1">{date}</p>
            </div>
            <div>
              <span className={`px-2 py-1 rounded-full text-xs ${inquiry.isChecked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {inquiry.isChecked ? 'Subscribed' : 'Not Subscribed'}
              </span>
            </div>
          </div>

          {/* Rest of the card component remains the same */}
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <p className="text-gray-500">Email:</p>
              <CopyableText text={inquiry.email} type="Email" />
            </div>
            <div>
              <p className="text-gray-500">Phone:</p>
              <CopyableText text={`${inquiry.phoneDialCode || ''} ${inquiry.phoneNumber || ''}`} type="Phone" />
            </div>
          </div>

          <div className="mb-3">
            <p className="text-gray-500 text-sm">Brand:</p>
            <p className="font-medium">{inquiry.company || 'N/A'}</p>
          </div>

          {inquiry.services && (
            <div className="mb-3">
              <p className="text-gray-500 text-sm">Services:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {inquiry.services.split(',').map((service, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#36302A]/10 rounded text-xs">
                    {service.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {inquiry.messages && (
            <div className="mt-3">
              <p className="text-gray-500 text-sm">Message:</p>
              <p className="text-sm mt-1 line-clamp-2">{inquiry.messages}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-4 py-2 flex justify-between">
          <div className="flex space-x-2">
            {inquiry.website && (
              <a
                href={inquiry.website.startsWith('http') ? inquiry.website : `http://${inquiry.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#36302A] hover:text-[#2C2925]"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Website</span>
                <FaExternalLinkAlt />
              </a>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveToReview(inquiry);
              }}
              className="text-green-600 hover:text-green-800"
              title="Move to Review"
            >
              <MdOutlineSaveAlt />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteInquiry(inquiry.id);
              }}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <MdDeleteForever />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="bg-gradient-to-b from-[#FAF4ED] to-white min-h-screen relative">
        <div className="p-4 md:p-8">
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
              <div className="flex items-center gap-4 mt-4 md:mt-0">
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

          {/* Stats Cards */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <StatisticsCard
              icon={MdInfo} // Using Lucide/React-icons instead of emoji string
              title="Total Inquiries"
              value={inquiries.length}
              color="blue" // Using predefined color scheme
            />
            <StatisticsCard
              icon="🔔" // Using emoji is also supported
              title="Today's Inquiries"
              value={getTodayInquiries()}
              trend={"+3"} // Adding trend information
              color="green"
            />
            <StatisticsCard
              icon={FaExternalLinkAlt} // Using a different icon
              title="Newsletter Signup Rate"
              value={getSignupRate()}
              color="amber"
            />
            <StatisticsCard
              icon={MdFilterList}
              title="Most Requested Service"
              value={getMostRequestedService()}
              color="purple"
            />
          </motion.div>

          {/* Advanced Filter Section with toggle */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#36302A]/10">
              <FilterAccordion className={"bg-[#FAF4ED] text-[#36302A] hover:bg-[#F0E6DD]"}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <MdFilterList className="text-xl" />
                    <h2 className="text-lg font-medium">Filters</h2>
                  </div>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-sm flex items-center gap-1 text-[#36302A] hover:text-[#2C2925]"
                  >
                    {showAdvancedFilters ? "Simple Filters" : "Advanced Filters"}
                    {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#36302A] items-center gap-2" htmlFor="name-filter">
                      <span className="text-lg">👤</span> Filter By FirstName
                    </label>
                    <input
                      id="name-filter"
                      type="text"
                      value={selectedName}
                      onChange={(e) => setSelectedName(e.target.value)}
                      placeholder="Enter FirstName"
                      className="w-full border border-[#36302A]/20 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent transition-all duration-200 placeholder-[#36302A]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#36302A] items-center gap-2" htmlFor="company-filter">
                      <span className="text-lg">🏢</span> Filter By BrandName
                    </label>
                    <input
                      id="company-filter"
                      type="text"
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
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
                      onChange={(e) => setSignedUp(e.target.value)}
                      className="w-full border border-[#36302A]/20 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">All Signups</option>
                      <option value="Yes">Signed Up</option>
                      <option value="No">Not Signed Up</option>
                    </select>
                  </div>
                </div>

                {/* Advanced filters section */}
                <AnimatePresence>
                  {showAdvancedFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[#36302A] items-center gap-2">
                            <span className="text-lg">📅</span> Date Range
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">From</label>
                              <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full border border-[#36302A]/20 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">To</label>
                              <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full border border-[#36302A]/20 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[#36302A] items-center gap-2" htmlFor="services-filter">
                            <span className="text-lg">🛠️</span> Services
                          </label>
                          <select
                            id="services-filter"
                            multiple
                            value={selectedServices}
                            onChange={(e) => {
                              const options = Array.from(e.target.selectedOptions, option => option.value);
                              setSelectedServices(options);
                            }}
                            className="w-full border border-[#36302A]/20 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36302A] focus:border-transparent transition-all duration-200 bg-white"
                            size={3}
                          >
                            {availableServices.map(service => (
                              <option key={service} value={service}>
                                {service}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </FilterAccordion>
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
                  setDateRange({ start: "", end: "" });
                  setSignedUp("");
                  setSelectedName("");
                  setSelectedCompany("");
                  setSelectedServices([]);
                  setFilteredInquiries(inquiries);
                  toast.success("Filters cleared!");
                }}
                className="px-6 py-2.5 bg-red-600/90 text-[#FAF4ED] font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
              >
                <MdDeleteForever className="text-xl" />
                Clear Filters
              </button>

              {/* Bulk action buttons - conditionally show based on selection */}
              {selectedRows.length > 0 && (
                <>
                  <button
                    onClick={handleBulkMoveToReview}
                    className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                  >
                    <MdOutlineSaveAlt className="text-xl" />
                    <span>Move {selectedRows.length} Selected</span>
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                  >
                    <MdDeleteForever className="text-xl" />
                    <span>Delete {selectedRows.length} Selected</span>
                  </button>
                </>
              )}

              <button
                onClick={handleDownloadCSV}
                className="px-6 py-2.5 bg-[#36302A] text-white font-semibold rounded-lg shadow-lg hover:bg-[#2C2925] transition-all duration-200 flex items-center gap-2 hover:scale-105"
              >
                <FaFileExcel className="text-xl" />
                <span className="hidden md:inline">
                  {selectedRows.length > 0
                    ? `Export ${selectedRows.length} Selected`
                    : "Export All"
                  }
                </span>
              </button>
              <button
                onClick={() => syncData()}
                disabled={issyncing}
                className="px-6 py-2.5 bg-[#36302A] text-[#FAF4ED] font-semibold rounded-lg shadow-lg hover:bg-[#2C2925] transition-all duration-200 flex items-center gap-2 hover:scale-105 disabled:opacity-50"
              >
                <FaSync className={`text-xl ${issyncing ? 'animate-spin' : ''}`} />
                <span>{issyncing ? 'Syncing...' : 'Sync Data'}</span>
              </button>

              {/* View mode toggle */}
              <div className="px-2 py-2 bg-white rounded-lg shadow-md flex items-center border">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-l-md ${viewMode === "table" ? "bg-[#36302A] text-white" : "text-[#36302A] hover:bg-gray-100"}`}
                  title="Table View"
                >
                  <MdOutlineTableRows />
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-2 rounded-r-md ${viewMode === "card" ? "bg-[#36302A] text-white" : "text-[#36302A] hover:bg-gray-100"}`}
                  title="Card View"
                >
                  <MdOutlineViewModule />
                </button>
              </div>

              {/* Auto-refresh toggle */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm">Auto-refresh</span>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${autoRefresh ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Visible columns menu */}
          <AnimatePresence>
            {columnMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-8 z-10 mt-2 bg-white shadow-lg rounded-lg border border-gray-200 p-4 min-w-[240px]"
              >
                <h3 className="text-sm font-medium mb-2">Show/Hide Columns</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.keys(visibleColumns).map((col) => (
                    <div key={col} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`col-${col}`}
                        checked={visibleColumns[col]}
                        onChange={() => {
                          setVisibleColumns({
                            ...visibleColumns,
                            [col]: !visibleColumns[col],
                          });
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`col-${col}`} className="text-sm capitalize">
                        {col}
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table or Card View Section */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {isLoading ? (
              <TableSkeleton />
            ) : (
              viewMode === "table" ? (
                <div className="relative w-full overflow-hidden bg-white shadow-md rounded-lg">
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="min-w-full table-auto border-collapse border border-[#36302A]/20">
                      <thead className="bg-[#36302A] text-[#FAF4ED]">
                        <tr>
                          <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                            <div className="flex items-center gap-2">
                              {selectAll ? (
                                <div
                                  className="flex h-4 w-4 items-center justify-center bg-blue-600 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectAll();
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </div>
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={selectAll}
                                  onChange={handleSelectAll}
                                  className="h-4 w-4"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <span>Select</span>
                            </div>

                          </th>
                          <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                            Action
                          </th>
                          {visibleColumns.timestamp && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              Timestamp
                            </th>
                          )}
                          {visibleColumns.firstName && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              FirstName
                            </th>
                          )}
                          {visibleColumns.lastName && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              LastName
                            </th>
                          )}
                          {visibleColumns.email && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              Email
                            </th>
                          )}
                          {visibleColumns.signedUp && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              SignedUp
                            </th>
                          )}
                          {visibleColumns.phoneDialCode && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              DialCode
                            </th>
                          )}
                          {visibleColumns.phoneNumber && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              PhoneNumber
                            </th>
                          )}
                          {visibleColumns.company && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              BrandName
                            </th>
                          )}
                          {visibleColumns.services && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              Services
                            </th>
                          )}
                          {visibleColumns.socials && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              Socials
                            </th>
                          )}
                          {visibleColumns.website && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              Website
                            </th>
                          )}
                          {visibleColumns.messages && (
                            <th className="border border-[#36302A]/50 px-4 py-4 text-left font-semibold text-sm">
                              Messages
                            </th>
                          )}
                          {/* <th className="border border-[#36302A]/50 px-4 py-4 text-right font-semibold text-sm w-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setColumnMenu(!columnMenu);
                              }}
                              className="p-1 hover:bg-[#36302A]/80 rounded"
                              title="Column Settings"
                            >
                              <MdOutlineViewColumn />
                            </button>
                          </th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {displayedInquiries.length > 0 ? (
                          displayedInquiries.map((inquiry) => {
                            const isNew = () => {
                              if (!inquiry.timestamp) return false;
                              const inquiryDate = new Date(inquiry.timestamp.seconds * 1000);
                              const yesterday = new Date();
                              yesterday.setDate(yesterday.getDate() - 1);
                              return inquiryDate >= yesterday;
                            };

                            return (
                              <tr
                                key={inquiry.id}
                                className={`hover:bg-[#F2EAE2] cursor-pointer ${isNew() ? 'bg-blue-50' : ''} ${inquiry.isChecked ? 'border-l-4 border-[#36302A]' : ''}`}
                                onClick={() => handleRowClick(inquiry)}
                                onContextMenu={(e) => handleContextMenu(e, inquiry)}
                              >
                                <td className="border border-[#36302A]/20 px-4 py-3 text-sm">
                                  {selectedRows.includes(inquiry.id) ? (
                                    <div
                                      className="flex h-4 w-4 items-center justify-center bg-blue-600 text-white"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRowSelect(inquiry.id);
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    </div>
                                  ) : (
                                    <input
                                      type="checkbox"
                                      checked={selectedRows.includes(inquiry.id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleRowSelect(inquiry.id);
                                      }}
                                      className="h-4 w-4"
                                    />
                                  )}
                                </td>
                                <td className="border border-[#36302A]/20 px-4 py-3 text-sm">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveToReview(inquiry);
                                      }}
                                      className="text-green-500 hover:text-green-700 text-lg"
                                      title="Save to Review"
                                    >
                                      <MdOutlineSaveAlt />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteInquiry(inquiry.id);
                                      }}
                                      className="text-red-500 hover:text-red-700 text-lg"
                                      title="Delete"
                                    >
                                      <MdDeleteForever />
                                    </button>
                                  </div>
                                </td>
                                {visibleColumns.timestamp && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm whitespace-nowrap">
                                    {inquiry.timestamp
                                      ? new Date(
                                        inquiry.timestamp.seconds * 1000
                                      ).toLocaleString()
                                      : "N/A"}
                                  </td>
                                )}
                                {visibleColumns.firstName && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm">
                                    {inquiry.firstName}
                                    {isNew() && (
                                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        New
                                      </span>
                                    )}
                                  </td>
                                )}
                                {visibleColumns.lastName && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm">
                                    {inquiry.lastName}
                                  </td>
                                )}
                                {visibleColumns.email && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm" style={{ userSelect: "none" }}>
                                    <CopyableText text={inquiry.email} type="Email" />
                                  </td>
                                )}
                                {visibleColumns.signedUp && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${inquiry.isChecked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                      {inquiry.isChecked ? "Yes" : "No"}
                                    </span>
                                  </td>
                                )}
                                {visibleColumns.phoneDialCode && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm">
                                    {inquiry.phoneDialCode}
                                  </td>
                                )}
                                {visibleColumns.phoneNumber && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm" style={{ userSelect: "none" }}>
                                    <CopyableText
                                      text={`${inquiry.phoneNumber}`}
                                      type="Phone number"
                                    />
                                  </td>
                                )}
                                {visibleColumns.company && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm" style={{ userSelect: "none" }}>
                                    <CopyableText
                                      text={`${inquiry.company}`}
                                      type="Brand Name"
                                    />
                                  </td>
                                )}
                                {visibleColumns.services && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm">
                                    <div className="flex flex-wrap gap-1">
                                      {inquiry.services && inquiry.services.split(',').map((service, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 bg-[#36302A]/10 rounded text-xs whitespace-nowrap">
                                          {service.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                )}
                                {visibleColumns.socials && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm">
                                    <ExternalLink url={inquiry.socials} />
                                  </td>
                                )}
                                {visibleColumns.website && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm">
                                    <ExternalLink url={inquiry.website} />
                                  </td>
                                )}
                                {visibleColumns.messages && (
                                  <td className="border border-[#36302A]/20 px-4 py-3 font-serif text-sm max-w-xs truncate">
                                    {inquiry.messages}
                                  </td>
                                )}
                                {/* <td className="border border-[#36302A]/20 px-4 py-3 text-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleContextMenu(e, inquiry);
                                    }}
                                    className="text-[#36302A] hover:text-[#2C2925]"
                                  >
                                    <FaEllipsisV />
                                  </button>
                                </td> */}
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="15" className="text-center py-8 border">
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <p className="text-gray-500">No data available</p>
                                <button
                                  onClick={() => {
                                    setSelectedDate("");
                                    setDateRange({ start: "", end: "" });
                                    setSignedUp("");
                                    setSelectedName("");
                                    setSelectedCompany("");
                                    setSelectedServices([]);
                                    setFilteredInquiries(inquiries);
                                  }}
                                  className="px-4 py-2 bg-[#36302A] text-white rounded-lg text-sm hover:bg-[#2C2925] transition-all flex items-center gap-1"
                                >
                                  <MdOutlineRefresh />
                                  Clear Filters
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // Card view mode
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedInquiries.length > 0 ? (
                    displayedInquiries.map(inquiry => (
                      <InquiryCard key={inquiry.id} inquiry={inquiry} />
                    ))
                  ) : (
                    <div className="col-span-3 bg-white rounded-lg shadow-md p-8 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <p className="text-gray-500">No data available</p>
                        <button
                          onClick={() => {
                            setSelectedDate("");
                            setDateRange({ start: "", end: "" });
                            setSignedUp("");
                            setSelectedName("");
                            setSelectedCompany("");
                            setSelectedServices([]);
                            setFilteredInquiries(inquiries);
                          }}
                          className="px-4 py-2 bg-[#36302A] text-white rounded-lg text-sm hover:bg-[#2C2925] transition-all flex items-center gap-1"
                        >
                          <MdOutlineRefresh />
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
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

        {/* Detail Modal */}
        <AnimatePresence>
          {detailModalInquiry && (
            <DetailModal
              inquiry={detailModalInquiry}
              onClose={() => setDetailModalInquiry(null)}
              onDelete={handleDeleteInquiry}
              onMoveToReview={handleSaveToReview}
            />
          )}
        </AnimatePresence>

        {/* Context Menu */}
        <AnimatePresence>
          {contextMenu.show && (
            <ContextMenu
              position={contextMenu}
              onClose={() => setContextMenu({ ...contextMenu, show: false })}
              actions={[
                {
                  label: "View Details",
                  icon: <MdInfo />,
                  onClick: () => handleRowClick(contextMenu.item)
                },
                {
                  label: "Move to Review",
                  icon: <MdOutlineSaveAlt />,
                  onClick: () => handleSaveToReview(contextMenu.item),
                  color: "text-green-600"
                },
                {
                  label: "Delete",
                  icon: <MdDeleteForever />,
                  onClick: () => handleDeleteInquiry(contextMenu.item.id),
                  color: "text-red-600"
                },
                {
                  label: "Copy Email",
                  icon: <MdContentCopy />,
                  onClick: () => {
                    navigator.clipboard.writeText(contextMenu.item.email);
                    toast.success("Email copied to clipboard!");
                  }
                },
                {
                  label: "Send Email",
                  icon: <FaExternalLinkAlt />,
                  onClick: () => {
                    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contextMenu.item.email)}`, '_blank');
                  }
                }
              ]}
            />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPanel;