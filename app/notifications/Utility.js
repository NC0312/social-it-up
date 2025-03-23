import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    writeBatch,
    serverTimestamp,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Create a new notification
 * @param {Object} notificationData - The notification data to create
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createNotification = async (notificationData) => {
    try {
        // Ensure required fields are present
        if (!notificationData.adminId || !notificationData.title || !notificationData.message) {
            console.error('Missing required fields for notification');
            return null;
        }

        // Add default fields
        const notification = {
            ...notificationData,
            createdAt: serverTimestamp(),
            // Calculate expiry time (48 hours from now)
            expiresAt: Timestamp.fromDate(new Date(Date.now() + 48 * 60 * 60 * 1000))
        };

        console.log('Attempting to create notification:', notification);

        const docRef = await addDoc(collection(db, 'notifications'), notification);
        return docRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

// ==================== REVIEW NOTIFICATIONS ====================

/**
 * Create review assignment notification
 * @param {Object} params - Parameters for creating assignment notification
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createReviewAssignmentNotification = async ({
    adminId,
    reviewId,
    reviewData,
    assignedBy,
    assignerName
}) => {
    // Skip if self-assignment
    if (adminId === assignedBy) return null;

    return createNotification({
        adminId,
        itemId: reviewId,
        itemType: 'review',
        type: 'assignment',
        title: 'New Inquiry Assignment',
        message: `You've been assigned a new inquiry from ${reviewData.company || 'a client'} by ${assignerName}.`,
        itemData: {
            firstName: reviewData.firstName || 'N/A',
            lastName: reviewData.lastName || 'N/A',
            company: reviewData.company || 'N/A',
            priority: reviewData.priority || 'low',
            status: reviewData.clientStatus || 'Pending',
            email: reviewData.email || 'N/A'
        }
    });
};

/**
 * Create review status change notification
 * @param {Object} params - Parameters for creating status change notification
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createReviewStatusChangeNotification = async ({
    adminId,
    reviewId,
    reviewData,
    oldStatus,
    newStatus,
    changedBy
}) => {
    // Skip if admin is the one who changed the status
    if (adminId === changedBy) return null;

    return createNotification({
        adminId,
        itemId: reviewId,
        itemType: 'review',
        type: 'status-change',
        title: 'Inquiry Status Updated',
        message: `The status of inquiry from ${reviewData.company || 'a client'} has been changed from "${oldStatus}" to "${newStatus}".`,
        itemData: {
            firstName: reviewData.firstName || 'N/A',
            lastName: reviewData.lastName || 'N/A',
            company: reviewData.company || 'N/A',
            priority: reviewData.priority || 'low',
            status: newStatus,
            email: reviewData.email || 'N/A'
        }
    });
};

/**
 * Create high priority review notification
 * @param {Object} params - Parameters for creating high priority notification
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createHighPriorityReviewNotification = async ({
    adminId,
    reviewId,
    reviewData
}) => {
    return createNotification({
        adminId,
        itemId: reviewId,
        itemType: 'review',
        type: 'high-priority',
        title: 'High Priority Inquiry Assigned',
        message: `You've been assigned a high priority inquiry from ${reviewData.company || 'a client'} that requires immediate attention.`,
        itemData: {
            firstName: reviewData.firstName || 'N/A',
            lastName: reviewData.lastName || 'N/A',
            company: reviewData.company || 'N/A',
            priority: reviewData.priority || 'high',
            status: reviewData.clientStatus || 'Pending',
            email: reviewData.email || 'N/A'
        }
    });
};

// ==================== BUG NOTIFICATIONS ====================

/**
 * Create bug assignment notification
 * @param {Object} params - Parameters for creating assignment notification
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createBugAssignmentNotification = async ({
    adminId,
    bugId,
    bugData,
    assignedBy,
    assignerName
}) => {
    // Skip if self-assignment
    if (adminId === assignedBy) return null;

    return createNotification({
        adminId,
        itemId: bugId,
        itemType: 'bug',
        type: 'assignment',
        title: 'New Bug Assignment',
        message: `You've been assigned a new bug report from ${bugData.email || 'a user'} by ${assignerName}.`,
        itemData: {
            email: bugData.email || 'N/A',
            subject: bugData.subject || 'N/A',
            message: bugData.message || 'N/A',
            priority: bugData.priority || 'low',
            status: bugData.status || 'unresolved'
        }
    });
};

/**
 * Create bug status change notification
 * @param {Object} params - Parameters for creating status change notification
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createBugStatusChangeNotification = async ({
    adminId,
    bugId,
    bugData,
    oldStatus,
    newStatus,
    changedBy
}) => {
    // Skip if admin is the one who changed the status
    if (adminId === changedBy) return null;

    return createNotification({
        adminId,
        itemId: bugId,
        itemType: 'bug',
        type: 'status-change',
        title: 'Bug Status Updated',
        message: `The status of bug report from ${bugData.email || 'a user'} has been changed from "${oldStatus}" to "${newStatus}".`,
        itemData: {
            email: bugData.email || 'N/A',
            subject: bugData.subject || 'N/A',
            message: bugData.message || 'N/A',
            priority: bugData.priority || 'low',
            status: newStatus
        }
    });
};

/**
 * Create high priority bug notification
 * @param {Object} params - Parameters for creating high priority notification
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createHighPriorityBugNotification = async ({
    adminId,
    bugId,
    bugData
}) => {
    return createNotification({
        adminId,
        itemId: bugId,
        itemType: 'bug',
        type: 'high-priority',
        title: '⚠️ High Priority Bug',
        message: `You've been assigned a high priority bug report from ${bugData.email || 'a user'} that requires immediate attention.`,
        itemData: {
            email: bugData.email || 'N/A',
            subject: bugData.subject || 'N/A',
            message: bugData.message || 'N/A',
            priority: bugData.priority || 'high',
            status: bugData.status || 'unresolved'
        }
    });
};

// ==================== NOTIFICATION MANAGEMENT ====================

/**
 * Delete a notification when marked as read
 * @param {string} notificationId - The ID of the notification to delete
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const deleteNotification = async (notificationId) => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await deleteDoc(notificationRef);
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        return false;
    }
};

/**
 * Delete all notifications for an admin (typically when using "Mark all as read")
 * @param {string} adminId - The ID of the admin
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const deleteAllNotifications = async (adminId) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('adminId', '==', adminId)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return true;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach(document => {
            batch.delete(document.ref);
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        return false;
    }
};

/**
 * Delete expired notifications (older than 48 hours)
 * This function should be called by a scheduled function in production
 * For this implementation, we'll call it when fetching notifications
 * @returns {Promise<number>} - Number of deleted notifications
 */
export const deleteExpiredNotifications = async () => {
    try {
        // Get current time
        const now = Timestamp.now();

        // Query for expired notifications
        const q = query(
            collection(db, 'notifications'),
            where('expiresAt', '<', now)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return 0;
        }

        // Delete expired notifications in batches
        const batch = writeBatch(db);
        snapshot.docs.forEach(document => {
            batch.delete(document.ref);
        });

        await batch.commit();
        return snapshot.size;
    } catch (error) {
        console.error('Error deleting expired notifications:', error);
        return 0;
    }
};

/**
 * Get unread notification count for an admin
 * @param {string} adminId - The ID of the admin
 * @returns {Promise<number>} - The number of unread notifications
 */
export const getUnreadNotificationCount = async (adminId) => {
    try {
        // First, clean up expired notifications
        await deleteExpiredNotifications();

        const q = query(
            collection(db, 'notifications'),
            where('adminId', '==', adminId)
        );

        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Error getting unread notification count:', error);
        return 0;
    }
};

/**
 * Get all notifications for an admin
 * @param {string} adminId - The ID of the admin
 * @returns {Promise<Array>} - Array of notification objects
 */
export const getNotifications = async (adminId) => {
    try {
        // First, clean up expired notifications
        await deleteExpiredNotifications();

        const q = query(
            collection(db, 'notifications'),
            where('adminId', '==', adminId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error getting notifications:', error);
        return [];
    }
};

// ==================== REMINDER SYSTEMS ====================

/**
 * Check for reviews that have been in "In Progress" status for a week and send reminders
 * @returns {Promise<number>} - Number of reminders sent
 */
export const checkInProgressReviewReminders = async () => {
    try {
        // Calculate the timestamp for 7 days ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoTimestamp = Timestamp.fromDate(oneWeekAgo);

        // Query for reviews that:
        // 1. Are in "In Progress" status
        // 2. Have been in that status for at least a week
        // 3. Have an assigned admin
        const reviewsQuery = query(
            collection(db, "reviews"),
            where("clientStatus", "==", "In Progress"),
            where("inProgressStartedAt", "<=", oneWeekAgoTimestamp),
            where("assignedTo", "!=", null)
        );

        const snapshot = await getDocs(reviewsQuery);

        if (snapshot.empty) {
            console.log('No reviews needing reminders found');
            return 0;
        }

        let reminderCount = 0;

        // Process each review that needs a reminder
        for (const doc of snapshot.docs) {
            const review = {
                docId: doc.id,
                ...doc.data()
            };

            // Calculate how many days the review has been in progress
            const inProgressDate = review.inProgressStartedAt.toDate();
            const currentDate = new Date();
            const daysInProgress = Math.floor((currentDate - inProgressDate) / (1000 * 60 * 60 * 24));

            // Create a reminder notification for the assigned admin
            await createNotification({
                adminId: review.assignedTo,
                itemId: review.docId,
                itemType: 'review',
                type: 'reminder',
                title: 'Review Reminder: Follow-up Needed',
                message: `The inquiry from ${review.company || 'a client'} has been in "In Progress" status for ${daysInProgress} days. Please follow up or update its status.`,
                itemData: {
                    firstName: review.firstName || 'N/A',
                    lastName: review.lastName || 'N/A',
                    company: review.company || 'N/A',
                    priority: review.priority || 'low',
                    status: review.clientStatus,
                    email: review.email || 'N/A'
                }
            });

            reminderCount++;
        }

        console.log(`Sent ${reminderCount} review reminder notifications`);
        return reminderCount;
    } catch (error) {
        console.error('Error checking for review reminders:', error);
        return 0;
    }
};

/**
 * Check for bugs that have been in "unresolved" status for a week and send reminders
 * @returns {Promise<number>} - Number of reminders sent
 */
export const checkUnresolvedBugReminders = async () => {
    try {
        // Calculate the timestamp for 7 days ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoTimestamp = Timestamp.fromDate(oneWeekAgo);

        // Query for bugs that:
        // 1. Are in "unresolved" status
        // 2. Have been reported at least a week ago
        // 3. Have an assigned admin
        const bugsQuery = query(
            collection(db, "feedback"),
            where("status", "==", "unresolved"),
            where("timestamp", "<=", oneWeekAgoTimestamp),
            where("assignedTo", "!=", null)
        );

        const snapshot = await getDocs(bugsQuery);

        if (snapshot.empty) {
            console.log('No bugs needing reminders found');
            return 0;
        }

        let reminderCount = 0;

        // Process each bug that needs a reminder
        for (const doc of snapshot.docs) {
            const bug = {
                docId: doc.id,
                ...doc.data()
            };

            // Calculate how many days the bug has been unresolved
            const reportDate = bug.timestamp.toDate();
            const currentDate = new Date();
            const daysUnresolved = Math.floor((currentDate - reportDate) / (1000 * 60 * 60 * 24));

            // Create a reminder notification for the assigned admin
            await createNotification({
                adminId: bug.assignedTo,
                itemId: bug.docId,
                itemType: 'bug',
                type: 'reminder',
                title: 'Bug Reminder: Action Needed',
                message: `The bug report from ${bug.email || 'a user'} has been unresolved for ${daysUnresolved} days. Please review and update its status.`,
                itemData: {
                    email: bug.email || 'N/A',
                    subject: bug.subject || 'N/A',
                    message: bug.message || 'N/A',
                    priority: bug.priority || 'low',
                    status: bug.status
                }
            });

            reminderCount++;
        }

        console.log(`Sent ${reminderCount} bug reminder notifications`);
        return reminderCount;
    } catch (error) {
        console.error('Error checking for bug reminders:', error);
        return 0;
    }
};

/**
 * Check for all types of reminder notifications
 * @returns {Promise<Object>} - Object with counts of reminders sent
 */
export const checkAllReminders = async () => {
    const reviewReminders = await checkInProgressReviewReminders();
    const bugReminders = await checkUnresolvedBugReminders();

    return {
        reviewReminders,
        bugReminders,
        total: reviewReminders + bugReminders
    };
};

/**
 * Setup a schedule for all reminder checks
 */
export const setupReminderSchedule = () => {
    // Run initial check
    checkAllReminders();

    // Schedule daily checks
    // In a real app, this would be better handled by a cloud function or cron job
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    setInterval(() => {
        checkAllReminders();
    }, TWENTY_FOUR_HOURS);
};