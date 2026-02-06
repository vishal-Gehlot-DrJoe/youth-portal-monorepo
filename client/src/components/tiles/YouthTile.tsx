import React from 'react';
import { Tile } from '../../api/tiles.api';

interface YouthTileProps {
    tile: Tile;
    className?: string;
}

const YouthTile: React.FC<YouthTileProps> = ({ tile, className }) => {
    const handleClick = () => {
        if (tile.linkUrl) {
            if (tile.linkUrl.startsWith('http')) {
                window.open(tile.linkUrl, '_blank', 'noopener,noreferrer');
            } else {
                window.location.href = tile.linkUrl;
            }
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
                group relative w-full h-full bg-white rounded-xl overflow-hidden 
                border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 
                cursor-pointer transform hover:-translate-y-1 ${className}
            `}
        >
            <div className="absolute inset-0 bg-gray-100">
                {tile.imageUrl ? (
                    <img
                        src={tile.imageUrl}
                        alt={tile.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-100 group-hover:opacity-90 transition-opacity" />
            </div>

        </div>
    );
};

export default YouthTile;
