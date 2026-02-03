import React from 'react';
import { Button, Tooltip, Tag } from 'antd';
import { SwapOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Tile } from '../../api/tiles.api';

interface LayoutTileProps {
    tile: Tile;
    index: number;
    onReplace: () => void;
    onRemove: () => void;
    onEdit: () => void;
    className?: string;
    isPreview?: boolean;
}

const LayoutTile: React.FC<LayoutTileProps> = ({ tile, index, onReplace, onRemove, onEdit, className, isPreview }) => {
    const handleClick = () => {
        if (tile.linkUrl) {
            window.open(tile.linkUrl, '_blank');
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`group relative w-full h-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${className} ${isPreview && tile.linkUrl ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
        >
            <div className="absolute inset-0 bg-gray-100">
                {tile.imageUrl ? (
                    <img
                        src={tile.imageUrl}
                        alt={tile.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
            </div>

            <div className="absolute inset-0 p-5 flex flex-col justify-between">
                {!isPreview && (
                    <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <div className="bg-black/30 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-medium border border-white/20">
                            #{index + 1}
                        </div>

                        <div className="flex gap-2">
                            <Tooltip title="Edit Tile">
                                <Button
                                    type="default"
                                    size="small"
                                    shape="circle"
                                    ghost
                                    className="!bg-white/20 !border-white/40 !text-white hover:!bg-white hover:!text-primary"
                                    icon={<EditOutlined />}
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                />
                            </Tooltip>
                            <Tooltip title="Replace Tile">
                                <Button
                                    type="default"
                                    size="small"
                                    shape="circle"
                                    ghost
                                    className="!bg-white/20 !border-white/40 !text-white hover:!bg-white hover:!text-primary"
                                    icon={<SwapOutlined />}
                                    onClick={(e) => { e.stopPropagation(); onReplace(); }}
                                />
                            </Tooltip>
                            <Tooltip title="Remove Tile">
                                <Button
                                    type="default"
                                    size="small"
                                    shape="circle"
                                    ghost
                                    className="!bg-white/20 !border-white/40 !text-white hover:!bg-white hover:!text-red-600"
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                />
                            </Tooltip>
                        </div>
                    </div>
                )}
                <div>
                    {!isPreview && (
                        <Tag className="mb-2 border-none bg-white/20 text-white backdrop-blur-md">
                            {tile.size.replace('_', ' ')}
                        </Tag>
                    )}
                    <h3 className="text-white font-bold text-base sm:text-lg md:text-xl leading-tight drop-shadow-sm line-clamp-2">
                        {tile.title}
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default LayoutTile;
