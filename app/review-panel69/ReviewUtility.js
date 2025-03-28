'use client';
import { useState } from "react";
import { BsPersonCheck } from "react-icons/bs";
import { FaCheck, FaUser } from "react-icons/fa";
import { toast } from "sonner";

export const AssignmentCell = ({ review, admins, onAssign, isAssigning, isSuperAdmin, currentAdminId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Filter admins based on role permissions
    const filteredAdmins = isSuperAdmin
        ? admins
        : admins.filter(a => a.role !== "superAdmin");

    // Format assignment date if it exists
    const formattedAssignmentDate = review.assignedAt
        ? new Date(review.assignedAt.seconds * 1000).toLocaleString()
        : "";

    // Find assigner name if it exists
    const assignerAdmin = review.assignedBy
        ? admins.find(a => a.id === review.assignedBy)
        : null;
    const assignerName = assignerAdmin ? assignerAdmin.fullName : (review.assignedBy ? "Admin" : "");

    // Tooltip content
    const tooltipContent = review.assignedTo
        ? `Assigned by: ${assignerName}\nDate: ${formattedAssignmentDate}`
        : "";

    // Handle assignment selection and email notification
    const handleAssignment = async (adminId, adminName) => {
        // If unassigning, don't send email
        if (!adminId) {
            onAssign(review.docId, adminId, adminName);
            setIsOpen(false);
            return;
        }

        try {
            setIsSendingEmail(true);

            // First call the assignment function (which updates Firestore)
            const assignmentSuccess = await onAssign(review.docId, adminId, adminName);

            if (assignmentSuccess) {
                toast.success(`Successfully assigned to ${adminName}!`);

                // Try to send email but don't block if it fails
                try {
                    // Find the selected admin details for email
                    const selectedAdmin = admins.find(a => a.id === adminId);

                    if (selectedAdmin?.email) {
                        // Get the current admin's name as the assigner
                        const currentAdmin = admins.find(a => a.id === currentAdminId);
                        const currentAdminName = currentAdmin ? currentAdmin.fullName : 'System Admin';

                        // Create a simplified version of the review object
                        const simplifiedReview = {
                            docId: review.docId,
                            firstName: review.firstName,
                            lastName: review.lastName,
                            email: review.email,
                            company: review.company,
                            priority: review.priority
                        };

                        // Send email notification as a background task
                        fetch('/api/send-assignment-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                recipientEmail: selectedAdmin.email,
                                recipientName: selectedAdmin.firstName || adminName,
                                assignerName: currentAdminName,
                                reviewDetails: simplifiedReview
                            }),
                        })
                            .then(response => {
                                if (response.ok) {
                                    toast.success(`Email notification sent to ${adminName}`);
                                } else {
                                    toast.warning(`Assignment completed, but email notification couldn't be sent`);
                                }
                            })
                            .catch(() => {
                                toast.warning(`Assignment completed, but email notification couldn't be sent`);
                            });
                    } else {
                        toast.warning('Admin assigned, but email notification could not be sent (no email found)');
                    }
                } catch (emailError) {
                    console.error('Email error:', emailError);
                    // Don't show another toast here as we already showed assignment success
                }
            }
        } catch (error) {
            console.error('Error in assignment process:', error);
            toast.error('Assignment failed. Please try again.');
        } finally {
            setIsSendingEmail(false);
            setIsOpen(false);
        }
    };

    // For regular admins: Display only, no dropdown
    if (!isSuperAdmin) {
        return (
            <div className="px-2 py-1 text-sm flex items-center group relative">
                <div className={`w-3 h-3 rounded-full mr-2 ${review.assignedTo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-gray-700">{review.assignedToName || "Unassigned"}</span>
                {review.assignedTo && (
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-pre opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        {tooltipContent}
                    </div>
                )}
            </div>
        );
    }

    // For superadmins: Custom dropdown UI with loading indicator for email
    return (
        <div className="relative">
            {/* Dropdown Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isAssigning || isSendingEmail}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${review.assignedTo ? 'border-green-300' : 'border-gray-300'} bg-white text-sm font-medium text-gray-700
            ${(isAssigning || isSendingEmail) ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50 focus:ring-2 focus:ring-green-500"} transition-all duration-200`}
            >
                <span className="flex items-center gap-2">
                    {isAssigning || isSendingEmail ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                    ) : (
                        <div className={`w-3 h-3 rounded-full ${review.assignedTo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    )}
                    {isAssigning ? "Assigning..." :
                        isSendingEmail ? "Sending email..." :
                            (review.assignedToName || "Unassigned")}
                </span>
                <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    ▼
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-green-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Unassigned Option */}
                    <button
                        onClick={() => handleAssignment("", "Unassigned")}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                    >
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        Unassigned
                        {!review.assignedTo && <FaCheck className="ml-auto text-green-600" />}
                    </button>

                    {/* Admin List */}
                    {filteredAdmins.map((admin) => (
                        <button
                            key={admin.id}
                            onClick={() => handleAssignment(admin.id, admin.fullName)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                        >
                            <div className="flex items-center gap-2 flex-grow">
                                <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">
                                    {admin.firstName?.charAt(0) || "A"}
                                </div>
                                <span>
                                    {admin.fullName}
                                    {admin.id === currentAdminId ? " (You)" : ""}
                                </span>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${admin.role === "superAdmin" ? "bg-green-700 text-white" : "bg-green-200 text-green-800"
                                        }`}
                                >
                                    {admin.role}
                                </span>
                            </div>
                            {review.assignedTo === admin.id && <FaCheck className="ml-auto text-green-600" />}
                        </button>
                    ))}
                </div>
            )}

            {/* Tooltip for Assignment Details */}
            {review.assignedTo && !isOpen && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-pre opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tooltipContent}
                </div>
            )}
        </div>
    );
};


export const AssignmentFilter = ({ value, onChange, admins, isSuperAdmin }) => {
    // Filter the admin list based on user permissions
    const filteredAdmins = admins.filter(admin => {
        // If current user is superAdmin, show all admins
        if (isSuperAdmin) {
            return true;
        }
        // If current user is regular admin, don't show superAdmins
        return admin.role !== 'superAdmin';
    });

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700" htmlFor="assignment-filter">
                <span>👤</span> Assigned To
            </label>
            <select
                id="assignment-filter"
                value={value}
                onChange={onChange}
                className="w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-green-500 bg-white"
            >
                <option value="">All Assignments</option>
                <option value="unassigned">Unassigned</option>
                {filteredAdmins.map(admin => (
                    <option key={admin.id} value={admin.id}>
                        {admin.username || admin.fullName}
                    </option>
                ))}
            </select>
        </div>
    );
};
