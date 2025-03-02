'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        try {
            setIsSubmitting(true);

            // Check if user exists with this email
            const adminsRef = collection(db, "admins");
            const q = query(adminsRef, where("email", "==", email.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast.error('No account found with this email address');
                return;
            }

            // Get the admin ID
            const adminId = querySnapshot.docs[0].id;

            // Redirect to reset password page with the admin ID
            router.push(`/reset-password?id=${adminId}`);

        } catch (error) {
            console.error('Error verifying email:', error);
            toast.error('Failed to process your request. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF4ED] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/login" className="flex items-center text-[#36302A] font-medium mb-6 hover:underline">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
                </Link>
                <h2 className="text-center text-3xl font-bold text-[#36302A]">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-[#575553]">
                    Enter your email address to reset your password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#36302A]">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={16} className="text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#36302A] focus:border-[#36302A] sm:text-sm"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <motion.button
                                type="submit"
                                whileTap={{ scale: 0.95 }}
                                disabled={isSubmitting}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${isSubmitting ? 'bg-[#36302A]/70' : 'bg-[#36302A] hover:bg-[#36302A]/90'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#36302A]`}
                            >
                                {isSubmitting ? 'Verifying...' : 'Continue'}
                            </motion.button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-[#575553]">
                                    or
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                href="/login"
                                className="font-medium text-[#36302A] hover:text-[#36302A]/70"
                            >
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}