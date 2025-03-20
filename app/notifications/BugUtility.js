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
 * Create a new bug notification
 * @param {Object} notificationData - The notification data to create
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createBugNotification = async (notificationData) => {
    try {
        // Ensure required fields are present
        if (!notificationData.adminId || !notificationData.title || !notificationData.message) {
            console.error('Missing required fields for bug notification');
            return null;
        }

        // Add default fields
        const notification = {
            ...notificationData,
            createdAt: serverTimestamp(),
            // Calculate expiry time (48 hours from now)
            expiresAt: Timestamp.fromDate(new Date(Date.now() + 48 * 60 * 60 * 1000))
        };

        console.log('Attempting to create bug notification:', notification);

        const docRef = await addDoc(collection(db, 'notifications'), notification);
        return docRef.id;
    } catch (error) {
        console.error('Error creating bug notification:', error);
        return null;
    }
};

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

    return createBugNotification({
        adminId,
        bugId,
        type: 'bug-assignment',
        title: 'New Bug Assignment',
        message: `You've been assigned a new bug report from ${bugData.email || 'a user'} by ${assignerName}.`,
        bugData: {
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

    return createBugNotification({
        adminId,
        bugId,
        type: 'bug-status-change',
        title: 'Bug Status Updated',
        message: `The status of bug report from ${bugData.email || 'a user'} has been changed from "${oldStatus}" to "${newStatus}".`,
        bugData: {
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
    return createBugNotification({
        adminId,
        bugId,
        type: 'high-priority-bug',
        title: '⚠️ High Priority Bug',
        message: `You've been assigned a high priority bug report from ${bugData.email || 'a user'} that requires immediate attention.`,
        bugData: {
            email: bugData.email || 'N/A',
            subject: bugData.subject || 'N/A',
            message: bugData.message || 'N/A',
            priority: bugData.priority || 'high',
            status: bugData.status || 'unresolved'
        }
    });
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
            await createBugNotification({
                adminId: bug.assignedTo,
                bugId: bug.docId,
                type: 'bug-reminder',
                title: 'Bug Reminder: Action Needed',
                message: `The bug report from ${bug.email || 'a user'} has been unresolved for ${daysUnresolved} days. Please review and update its status.`,
                bugData: {
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
 * Schedule the bug reminder check to run daily
 * This can be called when the application initializes
 */
export const setupBugReminderSchedule = () => {
    // Run initial check
    checkUnresolvedBugReminders();

    // Schedule daily checks
    // In a real app, this would be better handled by a cloud function or cron job
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    setInterval(() => {
        checkUnresolvedBugReminders();
    }, TWENTY_FOUR_HOURS);
};