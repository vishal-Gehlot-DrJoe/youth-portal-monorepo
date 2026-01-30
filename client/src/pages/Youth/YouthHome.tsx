import React from 'react';
import { Typography, Spin, Empty, Card, Row, Col } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { useActiveLayout } from '../../hooks/tiles/useLayout';
import { useTiles } from '../../hooks/tiles/useTiles';
import { Tile } from '../../api/tiles.api';
import './YouthHome.css';

const { Title, Text } = Typography;

const YouthHome: React.FC = () => {
    const { data: layout, isLoading: layoutLoading } = useActiveLayout();
    const { data: activeTiles = [], isLoading: tilesLoading } = useTiles('ACTIVE');

    const isLoading = layoutLoading || tilesLoading;

    if (isLoading) {
        return (
            <div className="youth-home__loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!layout || layout.tiles.length === 0) {
        return (
            <div className="youth-home__empty">
                <Empty description="No content available yet" />
                <Text type="secondary">Check back later for updates!</Text>
            </div>
        );
    }

    const sortedPositions = [...layout.tiles].sort((a, b) => a.order - b.order);
    const getTile = (tileId: string): Tile | undefined => {
        return activeTiles.find((t) => t._id === tileId);
    };

    return (
        <div className="youth-home">
            <div className="youth-home__header">
                <Title level={2}>Welcome to Youth Portal</Title>
                <Text type="secondary">Explore our latest updates and resources</Text>
            </div>

            <div className="youth-home__grid">
                {sortedPositions.map((pos) => {
                    const tile = getTile(pos.tileId);
                    if (!tile) return null;

                    return (
                        <div
                            key={tile._id}
                            className={`youth-tile youth-tile--${tile.size.toLowerCase()}`}
                            onClick={() => tile.linkUrl && window.open(tile.linkUrl, '_blank')}
                            style={{ cursor: tile.linkUrl ? 'pointer' : 'default' }}
                        >
                            <div
                                className="youth-tile__image"
                                style={{ backgroundImage: `url(${tile.imageUrl})` }}
                            />
                            <div className="youth-tile__content">
                                <h3 className="youth-tile__title">{tile.title}</h3>
                                {tile.linkUrl && (
                                    <span className="youth-tile__link">
                                        <LinkOutlined /> Learn more
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default YouthHome;
