// components/ProtectedRoute.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from './providers/AdminAuthProvider';
import { ImSpinner8 } from 'react-icons/im';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect if not authenticated and done loading
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, loading, router]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FAF4ED]">
                <ImSpinner8 className="w-8 h-8 animate-spin text-[#36302A]" />
            </div>
        );
    }

    // If not authenticated, don't render children
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FAF4ED]">
                <ImSpinner8 className="w-8 h-8 animate-spin text-[#36302A]" />
            </div>
        );
    }

    // If authenticated (either admin or superAdmin), render the children
    return children;
};

export default ProtectedRoute;