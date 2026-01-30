import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import './EmptyState.css';

interface EmptyStateProps {
    onCreateClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
    return (
        <div className="empty-state" onClick={onCreateClick}>
            <div className="empty-state__card">
                <div className="empty-state__icon">
                    <PlusOutlined />
                </div>
                <h3 className="empty-state__title">Create your first tile</h3>
                <p className="empty-state__description">
                    Start building your homepage by creating tiles with images and links
                </p>
            </div>
        </div>
    );
};

export default EmptyState;
