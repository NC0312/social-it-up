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

/**
 * Create assignment notification
 * @param {Object} params - Parameters for creating assignment notification
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createAssignmentNotification = async ({
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
        reviewId,
        type: 'assignment',
        title: 'New Inquiry Assignment',
        message: `You've been assigned a new inquiry from ${reviewData.company || 'a client'} by ${assignerName}.`,
        reviewData: {
            firstName: reviewData.firstName || 'N/A',
            lastName: reviewData.lastName || 'N/A',
            company: reviewData.company || 'N/A',
            priority: reviewData.priority || 'low',
            clientStatus: reviewData.clientStatus || 'Pending',
            email: reviewData.email || 'N/A'
        }
    });
};

/**
 * Create status change notification
 * @param {Object} params - Parameters for creating status change notification
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createStatusChangeNotification = async ({
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
        reviewId,
        type: 'status-change',
        title: 'Inquiry Status Updated',
        message: `The status of inquiry from ${reviewData.company || 'a client'} has been changed from "${oldStatus}" to "${newStatus}".`,
        reviewData: {
            firstName: reviewData.firstName || 'N/A',
            lastName: reviewData.lastName || 'N/A',
            company: reviewData.company || 'N/A',
            priority: reviewData.priority || 'low',
            clientStatus: newStatus,
            email: reviewData.email || 'N/A'
        }
    });
};

/**
 * Create high priority notification
 * @param {Object} params - Parameters for creating high priority notification
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createHighPriorityNotification = async ({
    adminId,
    reviewId,
    reviewData
}) => {
    return createNotification({
        adminId,
        reviewId,
        type: 'high-priority',
        title: 'High Priority Inquiry Assigned',
        message: `You've been assigned a high priority inquiry from ${reviewData.company || 'a client'} that requires immediate attention.`,
        reviewData: {
            firstName: reviewData.firstName || 'N/A',
            lastName: reviewData.lastName || 'N/A',
            company: reviewData.company || 'N/A',
            priority: reviewData.priority || 'high',
            clientStatus: reviewData.clientStatus || 'Pending',
            email: reviewData.email || 'N/A'
        }
    });
};

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


/**
 * Check for reviews that have been in "In Progress" status for a week and send reminders
 * @returns {Promise<number>} - Number of reminders sent
 */
export const checkInProgressReminders = async () => {
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
                reviewId: review.docId,
                type: 'reminder',
                title: 'Review Reminder: Follow-up Needed',
                message: `The inquiry from ${review.company || 'a client'} has been in "In Progress" status for ${daysInProgress} days. Please follow up or update its status.`,
                reviewData: {
                    firstName: review.firstName || 'N/A',
                    lastName: review.lastName || 'N/A',
                    company: review.company || 'N/A',
                    priority: review.priority || 'low',
                    clientStatus: review.clientStatus,
                    email: review.email || 'N/A'
                }
            });

            reminderCount++;
        }

        console.log(`Sent ${reminderCount} reminder notifications`);
        return reminderCount;
    } catch (error) {
        console.error('Error checking for reminders:', error);
        return 0;
    }
};

/**
 * Schedule the reminder check to run daily
 * This can be called when the application initializes
 */
export const setupReminderSchedule = () => {
    // Run initial check
    checkInProgressReminders();

    // Schedule daily checks
    // In a real app, this would be better handled by a cloud function or cron job
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    setInterval(() => {
        checkInProgressReminders();
    }, TWENTY_FOUR_HOURS);
};
