import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../providers/AuthProvider';

interface RequireAdminProps {
    children: React.ReactNode;
}

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
    const { user, role, loading, error } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <Spin size="large" tip="Verifying access..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="text-red-500 text-5xl mb-4">!</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Return to Login</a>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (role === 'youth') {
        return <Navigate to="/youth" replace />;
    }

    if (role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-8">You do not have permission to view this page.</p>
                    <p className="text-sm text-gray-500">Current Role: {role || 'Unknown'}</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default RequireAdmin;
