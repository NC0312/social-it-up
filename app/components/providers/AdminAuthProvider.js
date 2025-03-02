'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Make sure this points to your Firebase config

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check localStorage for existing admin session
        const storedAdmin = localStorage.getItem('adminAuth');
        if (storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
        }
        setLoading(false);
    }, []);

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

    const register = async (email, username, password, gender = 'unspecified') => {
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
                updatedAt: serverTimestamp()
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

            // Check role and status
            if (adminData.role === 'superAdmin') {
                // SuperAdmin can always login
                const adminSession = {
                    id: adminDoc.id,
                    email: adminData.email,
                    username: adminData.username,
                    role: 'superAdmin',
                    gender: adminData.gender,
                    status: adminData.status || 'approved',
                    isAuthenticated: true
                };

                // Store in localStorage
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

                // Create admin session
                const adminSession = {
                    id: adminDoc.id,
                    email: adminData.email,
                    username: adminData.username,
                    role: 'admin',
                    gender: adminData.gender,
                    status: adminData.status,
                    isAuthenticated: true
                };

                // Store in localStorage
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

    const logout = () => {
        localStorage.removeItem('adminAuth');
        setAdmin(null);
        router.push('/login');
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
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AdminAuthContext);