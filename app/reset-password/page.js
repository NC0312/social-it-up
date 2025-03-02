'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, XCircle } from 'lucide-react';

export default function ResetPassword() {
    const router = useRouter();
    const [adminId, setAdminId] = useState('');
    const [adminData, setAdminData] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Function to hash password (same as in your AuthProvider)
    const hashPassword = (password) => {
        // In a real app, use a proper hashing library
        return btoa(password); // Base64 encoding (as used in your AdminAuthProvider)
    };

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setIsLoading(true);

                // Get admin ID from URL
                const searchParams = new URLSearchParams(window.location.search);
                const id = searchParams.get('id');

                if (!id) {
                    setError('Invalid reset request');
                    router.push('/forgot-password');
                    return;
                }

                // Fetch admin data from Firestore
                const adminRef = doc(db, "admins", id);
                const adminSnapshot = await getDoc(adminRef);

                if (!adminSnapshot.exists()) {
                    setError('Admin not found');
                    router.push('/forgot-password');
                    return;
                }

                setAdminId(id);
                setAdminData(adminSnapshot.data());

            } catch (error) {
                console.error('Error fetching admin data:', error);
                setError('Failed to load user data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminData();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password should be at least 6 characters');
            return;
        }

        try {
            setIsSubmitting(true);

            // Hash the new password
            const hashedPassword = hashPassword(password);

            // Update the admin document
            const adminRef = doc(db, "admins", adminId);
            await updateDoc(adminRef, {
                password: hashedPassword,
                updatedAt: new Date()
            });

            toast.success('Password has been reset successfully');
            router.push('/login');

        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error('Failed to reset password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAF4ED] flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#36302A]"></div>
                <p className="mt-4 text-[#575553]">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FAF4ED] flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
                <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                    <XCircle size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#36302A] mb-2">Error</h2>
                <p className="text-[#575553] mb-4">{error}</p>
                <button
                    onClick={() => router.push('/forgot-password')}
                    className="px-4 py-2 bg-[#36302A] text-white rounded-md hover:bg-[#36302A]/90 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF4ED] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-bold text-[#36302A]">
                    Create new password
                </h2>
                <p className="mt-2 text-center text-sm text-[#575553]">
                    Enter a new password for <span className="font-medium">{adminData?.email}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#36302A]">
                                New password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={16} className="text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#36302A] focus:border-[#36302A] sm:text-sm"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} className="text-gray-400" />
                                        ) : (
                                            <Eye size={16} className="text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Password must be at least 6 characters
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-[#36302A]">
                                Confirm new password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={16} className="text-gray-400" />
                                </div>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#36302A] focus:border-[#36302A] sm:text-sm"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${isSubmitting ? 'bg-[#36302A]/70' : 'bg-[#36302A] hover:bg-[#36302A]/90'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#36302A]`}
                            >
                                {isSubmitting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}