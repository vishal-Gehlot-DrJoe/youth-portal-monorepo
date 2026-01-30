import React, { useMemo, useState } from 'react';
import { Modal, Input, Empty, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Tile } from '../../api/tiles.api';

interface SelectTileModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (tile: Tile) => void;
    tiles: Tile[];
    usedTileIds: Set<string>;
}

const SelectTileModal: React.FC<SelectTileModalProps> = ({ open, onClose, onSelect, tiles, usedTileIds }) => {
    const [search, setSearch] = useState('');

    const filteredTiles = useMemo(() => {
        return tiles.filter(t =>
            t.title.toLowerCase().includes(search.toLowerCase()) &&
            t.status === 'DRAFT'
        );
    }, [tiles, search]);

    return (
        <Modal
            title="Select a Tile"
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
            destroyOnClose
        >
            <div className="mb-4">
                <Input
                    placeholder="Search tiles..."
                    prefix={<SearchOutlined className="text-charcoal/40" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                />
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1 flex flex-col gap-2">
                {filteredTiles.length === 0 ? (
                    <Empty description="No draft tiles found" />
                ) : (
                    filteredTiles.map(tile => {
                        const isUsed = usedTileIds.has(tile._id);
                        return (
                            <div
                                key={tile._id}
                                onClick={() => !isUsed && onSelect(tile)}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg border transition-all
                                    ${isUsed
                                        ? 'bg-background border-gray-200 opacity-50 cursor-not-allowed'
                                        : 'bg-white border-gray-200 hover:border-primary hover:shadow-sm cursor-pointer hover:bg-primary/5'}
                                `}
                            >
                                <div className="w-16 h-12 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                    {tile.imageUrl && (
                                        <img src={tile.imageUrl} alt={tile.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-charcoal">{tile.title}</div>
                                    <div className="text-xs text-charcoal/40">{tile.size}</div>
                                </div>
                                {isUsed && (
                                    <div className="text-xs font-medium text-charcoal/40 bg-gray-200 px-2 py-1 rounded">
                                        Used
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </Modal>
    );
};

export default SelectTileModal;
