import { BsPersonCheck } from "react-icons/bs";

// Enhanced AssignmentCell to show assignment details
export const AssignmentCell = ({ review, admins, onAssign, isAssigning, isSuperAdmin }) => {
    // Filter out superadmins from the assignment options
    const regularAdmins = admins.filter(a => a.role !== 'superAdmin');

    // Format assignment date if it exists
    const formattedAssignmentDate = review.assignedAt ?
        new Date(review.assignedAt.seconds * 1000).toLocaleDateString() : '';

    // Find assigner name if it exists
    const assignerAdmin = review.assignedBy ?
        admins.find(a => a.id === review.assignedBy) : null;
    const assignerName = assignerAdmin ?
        assignerAdmin.fullName : (review.assignedBy ? 'Admin' : '');

    // Create tooltip content with assignment details
    const tooltipContent = review.assignedTo ?
        `Assigned by: ${assignerName}\nDate: ${formattedAssignmentDate}` : '';

    if (!isSuperAdmin) {
        return (
            <div className="px-2 py-1 text-sm flex items-center group relative">
                <BsPersonCheck className="mr-1 text-green-600" />
                <span>{review.assignedToName || "Unassigned"}</span>

                {/* Tooltip for assignment details */}
                {review.assignedTo && (
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-pre opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {tooltipContent}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative group">
            {isAssigning ? (
                <div className="flex items-center justify-center p-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                </div>
            ) : (
                <>
                    <select
                        value={review.assignedTo || ""}
                        onChange={(e) => {
                            const selectedAdmin = regularAdmins.find(a => a.id === e.target.value);
                            onAssign(
                                review.docId,
                                e.target.value,
                                selectedAdmin ? selectedAdmin.fullName : "Unassigned"
                            );
                        }}
                        className="w-full border border-green-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    >
                        <option value="">Unassigned</option>
                        {regularAdmins.map(admin => (
                            <option key={admin.id} value={admin.id}>
                                {admin.fullName}
                            </option>
                        ))}
                    </select>

                    {/* Tooltip for assignment details */}
                    {review.assignedTo && (
                        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-pre opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                            {tooltipContent}
                        </div>
                    )}
                </>
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
