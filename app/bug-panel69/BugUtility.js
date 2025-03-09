'use client';
import { useState } from 'react';
import { BsPersonCheck } from 'react-icons/bs';
import { FaCheck, FaUser } from 'react-icons/fa';

// Enhanced BugAssignmentCell with modern UI
export const BugAssignmentCell = ({ bug, admins, onAssign, isAssigning, isSuperAdmin, currentAdminId }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    // Filter admins based on role permissions
    const filteredAdmins = isSuperAdmin
      ? admins
      : admins.filter(a => a.role !== "superAdmin");
  
    // Format assignment date if it exists
    const formattedAssignmentDate = bug.assignedAt
      ? new Date(bug.assignedAt.seconds * 1000).toLocaleString()
      : "";
  
    // Find assigner name if it exists
    const assignerAdmin = bug.assignedBy
      ? admins.find(a => a.id === bug.assignedBy)
      : null;
    const assignerName = assignerAdmin ? assignerAdmin.fullName : (bug.assignedBy ? "Admin" : "");
  
    // Tooltip content
    const tooltipContent = bug.assignedTo
      ? `Assigned by: ${assignerName}\nDate: ${formattedAssignmentDate}`
      : "";
  
    // Handle assignment selection
    const handleAssignment = (adminId, adminName) => {
      onAssign(bug.docId, adminId, adminName);
      setIsOpen(false);
    };
  
    // For regular admins: Display only, no dropdown
    if (!isSuperAdmin) {
      return (
        <div className="px-2 py-1 text-sm flex items-center group relative">
          <BsPersonCheck className="mr-2 text-red-600" />
          <span className="text-gray-700">{bug.assignedToName || "Unassigned"}</span>
          {bug.assignedTo && (
            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-pre opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              {tooltipContent}
            </div>
          )}
        </div>
      );
    }
  
    // For superadmins: Custom dropdown UI
    return (
      <div className="relative">
        {/* Dropdown Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isAssigning}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border border-red-300 bg-white text-sm font-medium text-gray-700
            ${isAssigning ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50 focus:ring-2 focus:ring-red-500"} transition-all duration-200`}
        >
          <span className="flex items-center gap-2">
            {isAssigning ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
            ) : (
              <FaUser className="text-red-600" />
            )}
            {isAssigning ? "Assigning..." : (bug.assignedToName || "Unassigned")}
          </span>
          <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
  
        {/* Dropdown Menu with increased z-index */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-red-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Unassigned Option */}
            <button
              onClick={() => handleAssignment("", "Unassigned")}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-red-100 transition-colors duration-200"
            >
              <FaUser className="text-gray-500" />
              Unassigned
              {!bug.assignedTo && <FaCheck className="ml-auto text-red-600" />}
            </button>
  
            {/* Admin List */}
            {filteredAdmins.map((admin) => (
              <button
                key={admin.id}
                onClick={() => handleAssignment(admin.id, admin.fullName || admin.username)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-red-100 transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                    {admin.firstName?.charAt(0) || admin.username?.charAt(0) || "A"}
                  </div>
                  <span>
                    {admin.fullName || admin.username}
                    {admin.id === currentAdminId ? " (You)" : ""}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      admin.role === "superAdmin" ? "bg-red-700 text-white" : "bg-red-200 text-red-800"
                    }`}
                  >
                    {admin.role}
                  </span>
                </div>
                {bug.assignedTo === admin.id && <FaCheck className="ml-auto text-red-600" />}
              </button>
            ))}
          </div>
        )}
  
        {/* Tooltip for Assignment Details */}
        {bug.assignedTo && !isOpen && (
          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-pre opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            {tooltipContent}
          </div>
        )}
      </div>
    );
  };
  
// AssignmentFilter component for BugPanel
export const BugAssignmentFilter = ({ value, onChange, admins, isSuperAdmin, currentAdminId }) => {
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
            <label className="block text-sm font-medium text-red-800 items-center gap-2" htmlFor="assignment-filter">
                <span className="text-lg">👤</span> Assigned To
            </label>
            <select
                id="assignment-filter"
                value={value}
                onChange={onChange}
                className="w-full border border-red-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white"
            >
                <option value="">All Assignments</option>
                <option value="unassigned">Unassigned</option>
                {filteredAdmins.map(admin => (
                    <option key={admin.id} value={admin.id}>
                        {admin.username || admin.fullName}
                        {admin.id === currentAdminId ? ' (You)' : ''}
                        {admin.role === 'superAdmin' ? ' (SuperAdmin)' : ''}
                    </option>
                ))}
            </select>
        </div>
    );
};