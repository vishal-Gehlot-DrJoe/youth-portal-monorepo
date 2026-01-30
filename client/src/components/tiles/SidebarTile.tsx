import React from 'react';
import { Tag, Typography, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Tile } from '../../api/tiles.api';

interface SidebarTileProps {
    tile: Tile;
    disabled?: boolean;
    onEdit?: (tile: Tile) => void;
}

const { Text } = Typography;

const SidebarTile: React.FC<SidebarTileProps> = ({ tile, disabled, onEdit }) => {
    return (
        <div
            className={`
                group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
                ${disabled
                    ? 'bg-background border-gray-200 opacity-60 cursor-not-allowed grayscale'
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-primary-light cursor-default'}
            `}
        >
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100 relative">
                {tile.imageUrl ? (
                    <img
                        src={tile.imageUrl}
                        alt={tile.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-xs">
                        Img
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <Text
                    strong
                    className={`block mb-0.5 truncate ${disabled ? 'text-charcoal/40' : 'text-charcoal'}`}
                    style={{ fontSize: 13 }}
                >
                    {tile.title}
                </Text>
                <div className="flex items-center gap-2">
                    <Tag
                        className={`mr-0 text-[10px] leading-tight px-1 py-0 border-none ${disabled ? 'bg-gray-200 text-charcoal/40' : 'bg-primary/10 text-primary'
                            }`}
                    >
                        {tile.size.replace('_', ' ')}
                    </Tag>
                </div>
            </div>
            {!disabled && onEdit && (
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-charcoal/40 hover:text-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(tile);
                    }}
                />
            )}
        </div>
    );
};

export default SidebarTile;
