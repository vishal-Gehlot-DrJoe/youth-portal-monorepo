import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Modal } from 'antd';
import { useAuth } from '../../app/providers/AuthProvider';
import {
    HomeOutlined,
    TeamOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ExclamationCircleOutlined,
    CaretDownOutlined,
    LayoutOutlined
} from '@ant-design/icons';
import { Switch } from 'antd';

const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [loggingOut, setLogout] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(true);
    const [keepGrid, setKeepGrid] = useState(true);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { key: '/admin/home', icon: <HomeOutlined />, label: 'Home' },
        { key: '/admin/youth', icon: <TeamOutlined />, label: 'Youth' }
    ];

    const handleLogout = async () => {
        setLogout(true);
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLogout(false);
            setLogoutModalOpen(false);
        }
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setSidebarOpen(false);
    };

    const SidebarItem = ({ item, collapsed }: { item: typeof menuItems[0], collapsed: boolean }) => {
        const isActive = location.pathname === item.key;
        return (
            <button
                onClick={() => handleNavigation(item.key)}
                className={`
                    w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200
                    ${isActive
                        ? 'bg-primary text-white border-r-4 border-white/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-charcoal'}
                    ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
            >
                <span className="text-xl">{item.icon}</span>
                {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    bg-background shadow-xl transition-all duration-300 ease-in-out flex flex-col
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${desktopCollapsed ? 'lg:w-20' : 'lg:w-64'}
                    w-64
                `}
            >
                <div className="h-16 flex items-center justify-center border-b border-white/10">
                    <img
                        src={desktopCollapsed && !sidebarOpen ? "/login-logo.png" : "/header-logo.svg"}
                        alt="Logo"
                        className={`transition-all duration-200 object-contain ${desktopCollapsed && !sidebarOpen ? 'h-10 w-10 p-1' : 'h-8 md:h-10'}`}
                    />
                </div>

                <div className="flex-1 py-4 overflow-y-auto">
                    {menuItems.map(item => (
                        <SidebarItem
                            key={item.key}
                            item={item}
                            collapsed={desktopCollapsed && !sidebarOpen}
                        />
                    ))}
                </div>
                <div className="hidden lg:flex p-4 border-t border-white/10 justify-center">
                    <button
                        onClick={() => setDesktopCollapsed(!desktopCollapsed)}
                        className="text-gray-400 hover:text-white transition-colors p-2"
                    >
                        {desktopCollapsed ? <MenuUnfoldOutlined className="text-xl" /> : <MenuFoldOutlined className="text-xl" />}
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm relative z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <MenuFoldOutlined className="text-xl" />
                        </button>

                        <h1 className="text-xl font-bold text-gray-800">
                            {location.pathname === '/admin/home' ? 'Dashboard' : 'Youth Management'}
                        </h1>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            onBlur={() => setTimeout(() => setProfileDropdownOpen(false), 200)}
                            className="flex items-center gap-3 hover:bg-gray-50 rounded-full py-1 px-2 border border-transparent hover:border-gray-200 transition-all cursor-pointer focus:outline-none"
                        >
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-semibold text-charcoal leading-tight">
                                    {user?.displayName || 'Admin User'}
                                </div>
                                <div className="text-xs text-charcoal/65">Administrator</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary overflow-hidden shadow-sm">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <UserOutlined className="text-lg" />
                                )}
                            </div>
                            <CaretDownOutlined className="text-xs text-charcoal/40" />
                        </button>

                        {profileDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 overflow-hidden z-[999999]">
                                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                                    <p className="font-semibold text-charcoal">{user?.displayName}</p>
                                    <p className="text-xs text-charcoal/65">Administrator</p>
                                </div>

                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                                    <div className="flex items-center gap-2 text-charcoal/65">
                                        <LayoutOutlined className="text-[12px]" />
                                        <span className="text-[12px] font-medium font-sans">Keep Desktop Grid</span>
                                    </div>
                                    <Switch
                                        size="small"
                                        checked={keepGrid}
                                        onChange={setKeepGrid}
                                        className={keepGrid ? '!bg-primary' : ''}
                                    />
                                </div>

                                <button
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-sans"
                                    onClick={() => setLogoutModalOpen(true)}
                                >
                                    <LogoutOutlined /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>
                <main className={`flex-1 overflow-auto ${location.pathname === '/admin/home' ? 'p-0 overflow-hidden' : 'p-6'}`}>
                    <Outlet context={{ keepGrid }} />
                </main>
            </div>

            <Modal
                title="Confirm Logout"
                open={logoutModalOpen}
                onCancel={() => setLogoutModalOpen(false)}
                onOk={handleLogout}
                confirmLoading={loggingOut}
                okText="Logout"
                cancelText="Cancel"
                okButtonProps={{ danger: true, size: 'large', className: '!rounded-xl' }}
                cancelButtonProps={{ size: 'large', className: '!rounded-xl' }}
                centered
            >
                <div className="py-4 flex flex-col items-center text-center">
                    <div className="h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4 flex">
                        <ExclamationCircleOutlined className="text-3xl text-red-500" />
                    </div>
                    <p className="text-gray-500">
                        Are you sure you want to log out? <br />
                        You will need to sign in again to access the dashboard.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default AdminLayout;