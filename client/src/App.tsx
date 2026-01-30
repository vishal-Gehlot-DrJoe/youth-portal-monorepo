import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import Login from './pages/Login';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminHome from './pages/Admin/AdminHome';
import AdminYouth from './pages/Admin/AdminYouth';
import YouthDashboard from './pages/Youth/YouthDashboard';
import RequireAuth from './app/guards/RequireAuth';
import RequireAdmin from './app/guards/RequireAdmin';
import { useAuth } from './app/providers/AuthProvider';

const AppRoutes: React.FC = () => {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <Spin size="large" />
            </div>
        );
    }

    const getDefaultRedirect = () => {
        if (!user) return '/login';
        if (role === 'admin') return '/admin/home';
        if (role === 'youth') return '/youth';
        return '/login';
    };

    return (
        <Routes>
            <Route path="/login" element={
                user ? (
                    <Navigate to={role === 'admin' ? '/admin/home' : '/youth'} replace />
                ) : (
                    <Login />
                )
            } />
            <Route path="/admin" element={
                <RequireAdmin>
                    <AdminLayout />
                </RequireAdmin>
            }>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<AdminHome />} />
                <Route path="youth" element={<AdminYouth />} />
            </Route>
            <Route path="/youth" element={
                <RequireAuth>
                    <YouthDashboard />
                </RequireAuth>
            } />

            <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#007EA8',
                    borderRadius: 8,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                },
                components: {
                    Button: {
                        controlHeight: 40,
                    },
                    Input: {
                        controlHeight: 44,
                    },
                },
            }}
        >
            <AntdApp>
                <AppRoutes />
            </AntdApp>
        </ConfigProvider>
    );
};

export default App;
