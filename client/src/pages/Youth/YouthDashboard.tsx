import React, { useState, useMemo } from 'react';
import { Typography, Button, Spin, Empty, App, Avatar, Modal, Switch, Tooltip } from 'antd';
import { LogoutOutlined, ExclamationCircleOutlined, LayoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTiles } from '../../hooks/tiles/useTiles';
import { useActiveLayout } from '../../hooks/tiles/useLayout';
import { Tile } from '../../api/tiles.api';
import YouthTile from '../../components/tiles/YouthTile';

const { Title, Text } = Typography;

const YouthDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [keepGrid, setKeepGrid] = useState(true);
    const { data: activeTiles = [], isLoading: tilesLoading } = useTiles('ACTIVE');
    const { data: activeLayout, isLoading: layoutLoading } = useActiveLayout();

    const allTilesMap = useMemo(() => {
        const map = new Map<string, Tile>();
        activeTiles.forEach(t => map.set(t._id, t));
        return map;
    }, [activeTiles]);

    const orderedTiles = useMemo(() => {
        if (!activeLayout || allTilesMap.size === 0) return [];
        return activeLayout.tiles
            .sort((a, b) => a.order - b.order)
            .map(pos => allTilesMap.get(pos.tileId))
            .filter((t): t is Tile => !!t);
    }, [activeLayout, allTilesMap]);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setLoggingOut(false);
            setLogoutModalVisible(false);
        }
    };

    const isLoading = tilesLoading || layoutLoading;

    return (
        <App>
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
                <header className=" border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-[100] px-4 md:px-8 flex items-center justify-between">
                    <div className="flex  gap-3 py-4 items-end justify-end ">
                        <img src="/header-logo.svg" alt="Logo" className="w-44 object-contain" />
                        <span  className="!m-0 text-sm mt-2 flex font-bold !text-charcoal hidden sm:block">Youth Portal</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
                            <Tooltip title={keepGrid ? "Switch to Responsive List" : "Switch to 4-Column Grid"}>
                                <div className="flex items-center gap-2">
                                    <LayoutOutlined className={`text-sm ${keepGrid ? 'text-primary' : 'text-gray-400'}`} />
                                    <Switch
                                        size="small"
                                        checked={keepGrid}
                                        onChange={setKeepGrid}
                                        className={keepGrid ? '!bg-primary' : ''}
                                    />
                                </div>
                            </Tooltip>
                        </div>

                        <div className="flex items-center gap-2 pr-4 border-r border-gray-100 hidden xs:flex">
                            <div className="text-right">
                                <Text strong className="block text-xs leading-none">{user?.displayName || 'Member'}</Text>
                                <Text type="secondary" className="text-[10px]">Youth Access</Text>
                            </div>
                            <Avatar
                                src={user?.photoURL}
                                size="small"
                                className="bg-[#007EA8]/10 text-[#007EA8] border border-[#007EA8]/20"
                            >
                                {user?.displayName?.[0] || 'U'}
                            </Avatar>
                        </div>
                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            onClick={() => setLogoutModalVisible(true)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            Logout
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {isLoading ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                            <Spin size="large" />
                            <Text type="secondary" className="animate-pulse">Loading specialized content...</Text>
                        </div>
                    ) : orderedTiles.length === 0 ? (
                        <div className="h-[60vh] flex items-center justify-center">
                            <Empty
                                description={
                                    <div className="space-y-2">
                                        <Text strong className="text-lg block">No content available yet</Text>
                                        <Text type="secondary">Check back soon for latest updates and resources.</Text>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="animate-fade-in">
                                <Title level={2} className="!mb-1 !text-charcoal !font-serif">Hello, {user?.displayName?.split(' ')[0] || 'Member'}</Title>
                                <Text type="secondary" className="text-base italic">Explore your resources and latest updates.</Text>
                            </div>

                            <div className={`grid gap-4 md:gap-6 ${keepGrid
                                ? 'grid-cols-4 auto-rows-[160px] xs:auto-rows-[200px] md:auto-rows-[250px]'
                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[280px] md:auto-rows-[320px]'}`}>
                                {orderedTiles.map((tile) => {
                                    const spanClass = keepGrid ? {
                                        'SMALL': 'col-span-1 row-span-1',
                                        'LARGE': 'col-span-2 row-span-2',
                                        'FULL_WIDTH': 'col-span-4 row-span-1',
                                    }[tile.size] || 'col-span-2 row-span-2' : {
                                        'SMALL': 'col-span-1 row-span-1',
                                        'LARGE': 'col-span-1 sm:col-span-2 row-span-2',
                                        'FULL_WIDTH': 'col-span-1 sm:col-span-2 lg:col-span-4 row-span-1',
                                    }[tile.size] || 'col-span-1 sm:col-span-2 row-span-2';

                                    return (
                                        <YouthTile
                                            key={tile._id}
                                            tile={tile}
                                            className={spanClass}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </main>

                <footer className="py-8 text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase">
                    Secure Portal • Established {new Date().getFullYear()}
                </footer>

                <Modal
                    open={logoutModalVisible}
                    onCancel={() => setLogoutModalVisible(false)}
                    footer={null}
                    centered
                    width={320}
                    closable={false}
                    className="premium-modal"
                >
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
                            <ExclamationCircleOutlined />
                        </div>
                        <Title level={4} className="!mb-2">Signing Out?</Title>
                        <Text type="secondary" className="block mb-8">Are you sure you want to end your session?</Text>
                        <div className="flex gap-3">
                            <Button block onClick={() => setLogoutModalVisible(false)} className="h-11 rounded-lg">Stay</Button>
                            <Button block type="primary" danger loading={loggingOut} onClick={handleLogout} className="h-11 rounded-lg">Logout</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </App>
    );
};

export default YouthDashboard;
