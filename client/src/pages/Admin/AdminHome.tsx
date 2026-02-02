import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button, Spin, message, Modal, Typography, Empty, App, Badge, Skeleton } from 'antd';
import { PlusOutlined, SendOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTiles } from '../../hooks/tiles/useTiles';
import { useActiveLayout, usePublishLayout } from '../../hooks/tiles/useLayout';
import { Tile } from '../../api/tiles.api';
import SidebarTile from '../../components/tiles/SidebarTile';
import LayoutTile from '../../components/tiles/LayoutTile';
import SelectTileModal from '../../components/tiles/SelectTileModal';
import CreateTileModal from '../../components/tiles/CreateTileModal';

const { Title, Text } = Typography;

const AdminHome: React.FC = () => {
    const { keepGrid } = useOutletContext<{ keepGrid: boolean }>();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectModalOpen, setSelectModalOpen] = useState(false);
    const [publishModalOpen, setPublishModalOpen] = useState(false);

    const [layoutTiles, setLayoutTiles] = useState<Tile[]>([]);
    const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

    const [tileToEdit, setTileToEdit] = useState<Tile | null>(null);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && previewMode) {
                setPreviewMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewMode]);

    const { data: draftTiles = [], isLoading: draftsLoading, isFetching: draftsFetching } = useTiles('DRAFT');
    const { data: activeTiles = [], isLoading: activeLoading, isFetching: activeFetching } = useTiles('ACTIVE');
    const { data: activeLayout, isLoading: layoutLoading, isFetching: layoutFetching } = useActiveLayout();
    const { mutate: publishLayout, isPending: publishing } = usePublishLayout();

    const allTilesMap = useMemo(() => {
        const map = new Map<string, Tile>();
        [...draftTiles, ...activeTiles].forEach(t => map.set(t._id, t));
        return map;
    }, [draftTiles, activeTiles]);

    useEffect(() => {
        if (activeLayout && allTilesMap.size > 0 && layoutTiles.length === 0) {
            const initialTiles: Tile[] = [];
            const sortedPositions = [...activeLayout.tiles].sort((a, b) => a.order - b.order);

            sortedPositions.forEach(pos => {
                const tile = allTilesMap.get(pos.tileId);
                if (tile) {
                    initialTiles.push(tile);
                }
            });
            if (initialTiles.length > 0) {
                setLayoutTiles(initialTiles);
            }
        }
    }, [activeLayout, allTilesMap.size]);

    useEffect(() => {
        if (allTilesMap.size > 0 && layoutTiles.length > 0) {
            setLayoutTiles(prev => {
                let changed = false;
                const next = prev.map(t => {
                    const freshTile = allTilesMap.get(t._id);
                    if (freshTile && (
                        freshTile.title !== t.title ||
                        freshTile.imageUrl !== t.imageUrl ||
                        freshTile.linkUrl !== t.linkUrl ||
                        freshTile.size !== t.size
                    )) {
                        changed = true;
                        return freshTile;
                    }
                    return t;
                });
                return changed ? next : prev;
            });
        }
    }, [allTilesMap]);

    const isDirty = useMemo(() => {
        if (!activeLayout) return layoutTiles.length > 0;
        if (layoutTiles.length !== activeLayout.tiles.length) return true;
        for (let i = 0; i < layoutTiles.length; i++) {
            if (layoutTiles[i]._id !== activeLayout.tiles[i].tileId) return true;
        }
        return false;
    }, [layoutTiles, activeLayout]);

    const usedTileIds = useMemo(() => new Set(layoutTiles.map(t => t._id)), [layoutTiles]);

    const handleAddTile = () => {
        setReplacingIndex(null);
        setSelectModalOpen(true);
    };

    const handleReplaceTile = (index: number) => {
        setReplacingIndex(index);
        setSelectModalOpen(true);
    };

    const handleSelectTile = (tile: Tile) => {
        if (replacingIndex !== null) {
            setLayoutTiles(prev => {
                const next = [...prev];
                next[replacingIndex] = tile;
                return next;
            });
            message.success('Tile replaced');
        } else {
            setLayoutTiles(prev => [...prev, tile]);
            message.success('Tile added to layout');
        }
        setSelectModalOpen(false);
        setReplacingIndex(null);
    };

    const handleRemoveTile = (index: number) => {
        setLayoutTiles(prev => prev.filter((_, i) => i !== index));
    };

    const handlePublish = () => {
        const payload = {
            tiles: layoutTiles.map((t, index) => ({
                tileId: t._id,
                order: index,
                x: 0,
                y: 0,
                width: t.size === 'FULL_WIDTH' ? 12 : t.size === 'LARGE' ? 6 : 4,
                height: 1
            }))
        };
        publishLayout(payload as any, {
            onSuccess: () => {
                message.success('Layout published successfully');
                setPublishModalOpen(false);
            },
        });
    };

    const handleEditTile = (tile: Tile) => {
        setTileToEdit(tile);
    };

    const showingSkeleton = draftsLoading || activeLoading || layoutLoading || draftsFetching || activeFetching || layoutFetching;

    return (
        <App>
            <div className={`flex flex-col h-screen ${previewMode ? 'fixed inset-0 z-[100] bg-background' : ''}`}>
                <div className="flex flex-1 overflow-hidden relative pt-4 md:pt-0">
                    <div className={`
                        shrink-0 border-r border-gray-200 bg-white flex flex-col z-[70] transition-all duration-300
                        ${(sidebarCollapsed || previewMode) ? 'w-0 border-r-0' : 'fixed inset-y-0 left-0 w-72 md:relative md:w-72'}
                    `}>
                        {!sidebarCollapsed && !previewMode && (
                            showingSkeleton ? (
                                <div className="flex-1 flex flex-col animate-pulse">
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-background">
                                        <div className="h-5 w-24 bg-gray-200 rounded" />
                                        <div className="h-5 w-8 bg-gray-200 rounded-full" />
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="h-3 w-20 bg-gray-100 rounded mb-4" />
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                                                <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 w-full bg-gray-200 rounded" />
                                                    <div className="h-2 w-1/2 bg-gray-200 rounded opacity-60" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-background md:hidden">
                                        <Text strong className="text-charcoal uppercase text-xs tracking-widest">Library</Text>
                                        <button onClick={() => setSidebarCollapsed(true)} className="text-charcoal/40 p-2">×</button>
                                    </div>
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-background hidden md:flex">
                                        <Text strong className="text-charcoal">Tile Library</Text>
                                        <Badge count={draftTiles.length} showZero color="#E5E5E5" style={{ color: '#2E2E2E' }} />
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        <Text className="text-xs uppercase tracking-wider font-semibold block mb-2 text-charcoal/65">Draft Tiles</Text>
                                        {draftTiles.length === 0 ? (
                                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No drafts available" />
                                        ) : (
                                            draftTiles.map(tile => (
                                                <SidebarTile
                                                    key={tile._id}
                                                    tile={tile}
                                                    disabled={usedTileIds.has(tile._id)}
                                                    onEdit={handleEditTile}
                                                />
                                            ))
                                        )}
                                    </div>
                                </>
                            )
                        )}
                    </div>
                    {!previewMode && (
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className={`
                                absolute left-0 top-1/2 -translate-y-1/2 z-[80]
                                bg-white border border-gray-200 rounded-r-lg shadow-md
                                w-6 h-16 flex items-center justify-center
                                text-charcoal/40 hover:text-primary hover:border-primary
                                transition-all duration-300
                                ${sidebarCollapsed ? 'translate-x-0' : 'translate-x-72'}
                            `}
                        >
                            {sidebarCollapsed ? <RightOutlined className="text-xs" /> : <LeftOutlined className="text-xs" />}
                        </button>
                    )}

                    <div className="flex-1 bg-background overflow-y-auto p-4 md:p-8">
                        {showingSkeleton ? (
                            <div className="max-w-6xl mx-auto pt-16 md:pt-0 animate-pulse">
                                <div className="mb-8 flex justify-between items-end">
                                    <div>
                                        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
                                        <div className="h-4 w-32 bg-gray-200 rounded-md opacity-60" />
                                    </div>
                                    <div className="h-4 w-12 bg-gray-200 rounded-md" />
                                </div>

                                <div className={`grid gap-4 md:gap-6 ${keepGrid ? 'grid-cols-4 auto-rows-[180px] md:auto-rows-[250px]' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[250px]'}`}>
                                    <div className={`${keepGrid ? 'col-span-1 row-span-1' : 'col-span-1 row-span-1'} bg-white rounded-2xl border border-gray-100 p-2 md:p-4 flex flex-col justify-end gap-2 md:gap-3 shadow-sm`}>
                                        <div className="h-1/2 w-full bg-gray-100 rounded-xl" />
                                        <div className="h-3 md:h-4 w-3/4 bg-gray-100 rounded" />
                                        <div className="h-2 md:h-3 w-1/4 bg-gray-100 rounded" />
                                    </div>
                                    <div className={`${keepGrid ? 'col-span-2 row-span-2' : 'col-span-1 sm:col-span-2 row-span-2'} bg-white rounded-2xl border border-gray-100 p-3 md:p-6 flex flex-col justify-end gap-3 md:gap-4 shadow-sm`}>
                                        <div className="h-3/4 w-full bg-gray-100 rounded-xl" />
                                        <div className="h-4 md:h-6 w-1/2 bg-gray-100 rounded" />
                                        <div className="h-3 md:h-4 w-1/4 bg-gray-100 rounded" />
                                    </div>
                                    <div className={`${keepGrid ? 'col-span-1 row-span-1' : 'col-span-1 row-span-1'} bg-white rounded-2xl border border-gray-100 p-2 md:p-4 flex flex-col justify-end gap-2 md:gap-3 shadow-sm`}>
                                        <div className="h-1/2 w-full bg-gray-100 rounded-xl" />
                                        <div className="h-3 md:h-4 w-3/4 bg-gray-100 rounded" />
                                    </div>
                                    <div className={`${keepGrid ? 'col-span-1 row-span-1' : 'col-span-1 row-span-1'} bg-white rounded-2xl border border-gray-100 p-2 md:p-4 flex flex-col justify-end gap-2 md:gap-3 shadow-sm`}>
                                        <div className="h-1/2 w-full bg-gray-100 rounded-xl" />
                                        <div className="h-3 md:h-4 w-3/4 bg-gray-100 rounded" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-6xl mx-auto pt-16 md:pt-0">
                                <div className="mb-6 flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <Title level={3} className="!mb-0 !text-charcoal text-2xl md:text-3xl">Youth portal</Title>
                                            <Badge
                                                status={previewMode ? "processing" : "default"}
                                                text={previewMode ? "Preview Mode" : "Edit Mode"}
                                                className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button
                                            onClick={() => setPreviewMode(!previewMode)}
                                            className={`${previewMode ? 'bg-charcoal text-white hover:!text-white' : ''}`}
                                        >
                                            {previewMode ? 'Back to Editor' : 'Preview Live'}
                                        </Button>
                                        <div className="text-right text-charcoal/40 text-[10px] md:text-sm">
                                            {layoutTiles.length} Tiles
                                        </div>
                                    </div>
                                </div>

                                <div className="pb-20">
                                    {layoutTiles.length === 0 ? (
                                        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
                                            <Text className="block mb-4 text-base text-charcoal/65">Your layout is empty</Text>
                                            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddTile}>
                                                Add First Tile
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className={`grid gap-3 md:gap-4 ${keepGrid
                                                ? 'grid-cols-4 auto-rows-[160px] xs:auto-rows-[200px] md:auto-rows-[250px]'
                                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[250px]'
                                                }`}>
                                                {layoutTiles.map((tile, index) => {
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
                                                        <LayoutTile
                                                            key={`${tile._id}-${index}`}
                                                            tile={tile}
                                                            index={index}
                                                            onReplace={() => handleReplaceTile(index)}
                                                            onRemove={() => handleRemoveTile(index)}
                                                            onEdit={() => handleEditTile(tile)}
                                                            className={`h-full ${spanClass}`}
                                                            isPreview={previewMode}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            {!previewMode && (
                                                <div
                                                    onClick={handleAddTile}
                                                    className="
                                                        h-20 border-2 border-dashed border-gray-300 rounded-xl 
                                                        flex items-center justify-center gap-2
                                                        text-charcoal/40 hover:text-primary hover:border-primary hover:bg-primary/5
                                                        cursor-pointer transition-all duration-200 group
                                                    "
                                                >
                                                    <PlusOutlined className="text-xl group-hover:scale-110 transition-transform" />
                                                    <span className="font-medium">Add Tile to Layout</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {!showingSkeleton && !previewMode && (
                    <div className="fixed bottom-20 right-4 md:right-8 z-[60] flex flex-col items-end gap-2 pointer-events-none">
                        <div className="flex gap-2 flex-col pointer-events-auto">
                            <Button
                                icon={<PlusOutlined />}
                                onClick={() => setCreateModalOpen(true)}
                                className="h-10 md:h-11 px-4 md:px-6 shadow-xl border-none bg-white text-charcoal hover:!text-primary font-bold transition-all hover:-translate-y-0.5"
                            >
                                New Tile
                            </Button>

                            {isDirty && (
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={() => setPublishModalOpen(true)}
                                    className="h-10 md:h-11 px-4 md:px-6 shadow-xl !bg-primary hover:!bg-primary-hover border-none font-bold transition-all hover:-translate-y-0.5"
                                >
                                    Publish
                                </Button>
                            )}
                        </div>
                        {isDirty && (
                            <div className="pointer-events-auto">
                                <div className="bg-charcoal text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-black shadow-lg animate-pulse">
                                    Unsaved Changes
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateTileModal
                open={createModalOpen || !!tileToEdit}
                onClose={() => {
                    setCreateModalOpen(false);
                    setTileToEdit(null);
                }}
                tileToEdit={tileToEdit}
            />

            <SelectTileModal
                open={selectModalOpen}
                onClose={() => setSelectModalOpen(false)}
                onSelect={handleSelectTile}
                tiles={draftTiles}
                usedTileIds={usedTileIds}
            />

            <Modal
                title="Publish Layout"
                open={publishModalOpen}
                onCancel={() => setPublishModalOpen(false)}
                onOk={handlePublish}
                confirmLoading={publishing}
                okText="Publish Live"
                okButtonProps={{}}
            >
                <div className="space-y-4">
                    <p className="text-charcoal/80">
                        Are you sure you want to publish this layout?
                    </p>
                    <div className="bg-primary/10 p-4 rounded-lg text-charcoal text-sm">
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>{layoutTiles.length} tiles</strong> will be live on the mobile app.</li>
                            <li>The current live layout will be archived.</li>
                            <li>Draft tiles used in this layout will become <strong>Active</strong>.</li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </App>
    );
};

export default AdminHome;