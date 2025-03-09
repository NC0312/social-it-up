'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, LogOut, ShieldOff } from 'lucide-react';

const AdminRemovalPopup = ({ onClose, reason = 'removed' }) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onClose]);

    // Get title and message based on reason
    const getContent = () => {
        switch (reason) {
            case 'removed':
                return {
                    title: 'Account Access Revoked',
                    message: 'Your administrator access has been revoked by a super administrator.'
                };
            case 'deleted':
                return {
                    title: 'Account Deleted',
                    message: 'Your administrator account has been deleted from the system.'
                };
            case 'status_change':
                return {
                    title: 'Status Changed',
                    message: 'Your account status has been changed and you no longer have access.'
                };
            default:
                return {
                    title: 'Access Revoked',
                    message: 'Your administrator access has been revoked.'
                };
        }
    };

    const { title, message } = getContent();

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <div className="bg-red-50 p-6 flex items-start gap-4 border-b border-red-100">
                    <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                        {reason === 'removed' || reason === 'status_change' ? (
                            <ShieldOff size={32} className="text-red-600" />
                        ) : (
                            <AlertCircle size={32} className="text-red-600" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-xl text-red-700">{title}</h3>
                        <p className="text-red-600 mt-2">{message}</p>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 mb-6">
                        You will be automatically logged out in <span className="font-semibold">{countdown}</span> seconds. If you believe this is an error, please contact the system administrator.
                    </p>
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 rounded-lg bg-[#36302A] text-white hover:bg-[#514840] transition-colors flex items-center gap-2"
                        >
                            <LogOut size={18} />
                            Log out now
                        </button>
                    </div>
                </div>
                <div className="bg-red-50 h-1.5">
                    <motion.div
                        className="bg-red-600 h-full"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminRemovalPopup;