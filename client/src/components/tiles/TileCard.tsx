import React from 'react';
import { Tag } from 'antd';
import { Tile, TileSize } from '../../api/tiles.api';

interface TileCardProps {
    tile: Tile;
    draggable?: boolean;
    onClick?: () => void;
}

const SIZE_LABELS: Record<TileSize, string> = {
    FULL_WIDTH: 'Full Width',
    SMALL: 'Small',
    LARGE: 'Large',
};

const SIZE_COLORS: Record<TileSize, string> = {
    FULL_WIDTH: 'purple',
    SMALL: 'blue',
    LARGE: 'cyan',
};

const TileCard: React.FC<TileCardProps & { hoverEffect?: 'lift' | 'scale' }> = ({ tile, draggable = false, onClick, hoverEffect = 'lift' }) => {
    return (
        <div
            onClick={onClick}
            className={`
                group relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm
                transition-all duration-300 hover:shadow-lg
                ${hoverEffect === 'lift' ? 'hover:-translate-y-1' : 'hover:scale-[1.02]'}
                ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                h-40 w-full flex-shrink-0
            `}
        >
            <div className="absolute inset-0 bg-gray-100">
                {tile.imageUrl ? (
                    <img
                        src={tile.imageUrl}
                        alt={tile.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 flex-col gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            </div>

            <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div className="flex justify-end">
                    <Tag
                        color={SIZE_COLORS[tile.size]}
                        className="mr-0 border-none bg-white/20 text-white backdrop-blur-md font-medium px-2 py-0.5"
                    >
                        {SIZE_LABELS[tile.size]}
                    </Tag>
                </div>

                <div className="translate-y-0 transition-transform duration-300">
                    <h4 className="text-white font-bold text-lg leading-tight drop-shadow-md line-clamp-2" title={tile.title}>
                        {tile.title}
                    </h4>
                </div>
            </div>

            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/30 rounded-xl pointer-events-none transition-colors" />
        </div>
    );
};

export default TileCard;
