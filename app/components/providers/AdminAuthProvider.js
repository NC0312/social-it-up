'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    doc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
    updateDoc,
    getDoc,
    onSnapshot
} from 'firebase/firestore';
import { db, rtdb } from '../../lib/firebase';
import { ref, set, onValue, onDisconnect } from 'firebase/database';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import AdminRemovalPopup from '../AdminRemovalPopup';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRemovalPopup, setShowRemovalPopup] = useState(false);
    const [removalReason, setRemovalReason] = useState('');
    const router = useRouter();

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                // Check localStorage for existing admin session
                const storedAdmin = localStorage.getItem('adminAuth');

                if (storedAdmin) {
                    const adminData = JSON.parse(storedAdmin);

                    // Verify if admin still exists and is not removed
                    const adminRef = doc(db, "admins", adminData.id);
                    const adminDoc = await getDoc(adminRef);

                    if (!adminDoc.exists()) {
                        // Admin document doesn't exist anymore
                        console.log('Admin document no longer exists');
                        setRemovalReason('deleted');
                        setShowRemovalPopup(true);
                        return;
                    }

                    const currentAdminData = adminDoc.data();

                    // Check if admin has been removed or status changed
                    if (currentAdminData.removed || currentAdminData.status !== 'approved') {
                        console.log('Admin was removed or status changed');
                        setRemovalReason(currentAdminData.removed ? 'removed' : 'status_change');
                        setShowRemovalPopup(true);
                        return;
                    }

                    // Set admin in state and update online status
                    setAdmin(adminData);

                    // Update lastLogin and online status
                    await updateDoc(adminRef, {
                        lastLogin: serverTimestamp(),
                        isOnline: true,
                        lastActive: serverTimestamp()
                    });

                    // Set up real-time monitoring of admin document
                    const unsubscribe = onSnapshot(adminRef, (docSnapshot) => {
                        if (!docSnapshot.exists()) {
                            // Admin document was deleted
                            setRemovalReason('deleted');
                            setShowRemovalPopup(true);
                            return;
                        }

                        const updatedAdminData = docSnapshot.data();

                        // Check for removal or status change
                        if (updatedAdminData.removed || updatedAdminData.status !== 'approved') {
                            setRemovalReason(updatedAdminData.removed ? 'removed' : 'status_change');
                            setShowRemovalPopup(true);
                        }
                    });

                    // Set up presence in real-time database
                    setupPresence(adminData.id, adminData.username, adminData.role);

                    // Cleanup on unmount
                    return () => {
                        unsubscribe();
                    };
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [router]);

    // Set up real-time presence
    const setupPresence = (adminId, username, role) => {
        try {
            const presenceRef = ref(rtdb, `status/${adminId}`);

            // When admin connects
            set(presenceRef, {
                online: true,
                lastActive: new Date().toISOString(),
                username: username,
                role: role
            });

            // When admin disconnects
            onDisconnect(presenceRef).update({
                online: false,
                lastActive: new Date().toISOString()
            });

            // Listen for changes to update Firestore
            onValue(presenceRef, (snapshot) => {
                const status = snapshot.val();
                if (status && admin) {
                    updateDoc(doc(db, "admins", adminId), {
                        isOnline: status.online,
                        lastActive: status.online ? serverTimestamp() : new Date(status.lastActive)
                    }).catch(err => console.error("Error updating online status:", err));
                }
            });
        } catch (error) {
            console.error("Error setting up presence:", error);
        }
    };

    const checkUsernameExists = async (username) => {
        try {
            const adminsRef = collection(db, "admins");
            const q = query(adminsRef, where("username", "==", username.toLowerCase()));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking username:", error);
            throw error;
        }
    };

    const checkEmailExists = async (email) => {
        try {
            const adminsRef = collection(db, "admins");
            const q = query(adminsRef, where("email", "==", email.toLowerCase()));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking email:", error);
            throw error;
        }
    };

    // Function to hash password (in a real app, use bcrypt or similar)
    // This is a simple hash for demonstration purposes only
    const hashPassword = (password) => {
        // In a real app, use a proper hashing library
        // This is NOT secure and only for demonstration
        return btoa(password); // Base64 encoding (NOT secure for production)
    };

    const register = async (email, username, password, gender = 'unspecified', isEmailVerified) => {
        try {
            // Check if username already exists
            const usernameExists = await checkUsernameExists(username);
            if (usernameExists) {
                return { success: false, error: "Username already taken" };
            }

            // Check if email already exists
            const emailExists = await checkEmailExists(email);
            if (emailExists) {
                return { success: false, error: "Email already in use" };
            }

            // Hash the password (use a proper hashing library in production)
            const hashedPassword = hashPassword(password);

            // Create admin document in Firestore
            const adminRef = await addDoc(collection(db, "admins"), {
                email: email.toLowerCase(),
                username: username.toLowerCase(),
                password: hashedPassword, // Store hashed password
                role: 'admin', // Default role is admin
                gender: gender,
                status: 'pending', // Default status is pending
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isEmailVerified: isEmailVerified
            });

            return {
                success: true,
                message: "Registration successful. Your account is pending approval."
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message || "An unknown error occurred"
            };
        }
    };

    const login = async (emailOrUsername, password) => {
        try {
            const adminsRef = collection(db, "admins");
            let q;

            // Check if input is email or username
            if (emailOrUsername.includes('@')) {
                // Search by email
                q = query(adminsRef, where("email", "==", emailOrUsername.toLowerCase()));
            } else {
                // Search by username
                q = query(adminsRef, where("username", "==", emailOrUsername.toLowerCase()));
            }

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { success: false, error: "User not found" };
            }

            // Get the first matching document
            const adminDoc = querySnapshot.docs[0];
            const adminData = adminDoc.data();

            // Check if password matches
            const hashedPassword = hashPassword(password);
            if (adminData.password !== hashedPassword) {
                return { success: false, error: "Invalid password" };
            }

            // Check if admin is removed
            if (adminData.removed) {
                return { success: false, error: "Your account has been removed. Please contact the administrator." };
            }

            // Set up user session data
            const adminSession = {
                id: adminDoc.id,
                email: adminData.email,
                username: adminData.username,
                role: adminData.role, // Use the actual role from the database
                gender: adminData.gender,
                status: adminData.status || 'approved',
                isAuthenticated: true
            };

            // Update admin document with lastLogin and online status
            await updateDoc(doc(db, "admins", adminDoc.id), {
                lastLogin: serverTimestamp(),
                isOnline: true,
                lastActive: serverTimestamp()
            });

            // Set up real-time presence
            setupPresence(adminDoc.id, adminData.username, adminData.role);

            // Check role and status for login permissions
            if (adminData.role === 'superAdmin') {
                // SuperAdmin can always login
                localStorage.setItem('adminAuth', JSON.stringify(adminSession));
                setAdmin(adminSession);
                return { success: true, isSuperAdmin: true };
            } else if (adminData.role === 'admin') {
                // For regular admins, check if they are approved
                if (adminData.status === 'pending') {
                    return {
                        success: false,
                        error: "Your account is pending approval. Please contact the administrator."
                    };
                }

                // Store admin session
                localStorage.setItem('adminAuth', JSON.stringify(adminSession));
                setAdmin(adminSession);
                return { success: true, isSuperAdmin: false };
            } else {
                return {
                    success: false,
                    error: "Invalid account type. Please contact the administrator."
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || "An unknown error occurred"
            };
        }
    };

    const logout = async () => {
        try {
            if (admin) {
                // Update admin document to show offline status
                await updateDoc(doc(db, "admins", admin.id), {
                    isOnline: false,
                    lastActive: serverTimestamp()
                });

                // Update real-time database presence
                const presenceRef = ref(rtdb, `status/${admin.id}`);
                await set(presenceRef, {
                    online: false,
                    lastActive: new Date().toISOString(),
                    username: admin.username,
                    role: admin.role
                });
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Clear local storage and state regardless of any errors
            localStorage.removeItem('adminAuth');
            setAdmin(null);
            router.push('/login');
        }
    };

    // Handler for closing the removal popup
    const handleRemovalPopupClose = () => {
        setShowRemovalPopup(false);
        logout();
    };

    const value = {
        admin,
        login,
        register,
        logout,
        isAuthenticated: !!admin,
        loading
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}

            {/* Admin Removal Popup */}
            <AnimatePresence>
                {showRemovalPopup && (
                    <AdminRemovalPopup
                        onClose={handleRemovalPopupClose}
                        reason={removalReason}
                    />
                )}
            </AnimatePresence>
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AdminAuthContext);