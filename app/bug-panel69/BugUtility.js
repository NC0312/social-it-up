import { BsPersonCheck } from 'react-icons/bs';

// AssignmentCell component for BugPanel
export const BugAssignmentCell = ({ bug, admins, onAssign, isAssigning, isSuperAdmin, currentAdminId }) => {
    // For superadmins, show all admins including superadmins
    // For regular admins, filter out superadmins from the assignment options
    const filteredAdmins = isSuperAdmin
        ? admins
        : admins.filter(a => a.role !== 'superAdmin');

    // Format assignment date if it exists
    const formattedAssignmentDate = bug.assignedAt ?
        new Date(bug.assignedAt.seconds * 1000).toLocaleDateString() : '';

    // Find assigner name if it exists
    const assignerAdmin = bug.assignedBy ?
        admins.find(a => a.id === bug.assignedBy) : null;
    const assignerName = assignerAdmin ?
        assignerAdmin.fullName : (bug.assignedBy ? 'Admin' : '');

    // Create tooltip content with assignment details
    const tooltipContent = bug.assignedTo ?
        `Assigned by: ${assignerName}\nDate: ${formattedAssignmentDate}` : '';

    // For regular admins, just show the assignment without the ability to change it
    if (!isSuperAdmin) {
        return (
            <div className="px-2 py-1 text-sm flex items-center group relative">
                <BsPersonCheck className="mr-1 text-red-600" />
                <span>{bug.assignedToName || "Unassigned"}</span>

                {/* Tooltip for assignment details */}
                {bug.assignedTo && (
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-pre opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {tooltipContent}
                    </div>
                )}
            </div>
        );
    }

    // For superadmins, provide the dropdown with all admins, including themselves and other superadmins
    return (
        <div className="relative group">
            {isAssigning ? (
                <div className="flex items-center justify-center p-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                </div>
            ) : (
                <>
                    <select
                        value={bug.assignedTo || ""}
                        onChange={(e) => {
                            const selectedAdmin = admins.find(a => a.id === e.target.value);
                            onAssign(
                                bug.docId,
                                e.target.value,
                                selectedAdmin ? selectedAdmin.fullName : "Unassigned"
                            );
                        }}
                        className="w-full border border-red-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                        <option value="">Unassigned</option>
                        {filteredAdmins.map(admin => (
                            <option key={admin.id} value={admin.id}>
                                {admin.fullName || admin.username}
                                {admin.id === currentAdminId ? ' (You)' : ''}
                                {admin.role === 'superAdmin' ? ' (SuperAdmin)' : ''}
                            </option>
                        ))}
                    </select>

                    {/* Tooltip for assignment details */}
                    {bug.assignedTo && (
                        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-pre opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                            {tooltipContent}
                        </div>
                    )}
                </>
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