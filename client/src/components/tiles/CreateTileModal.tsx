import React, { useState } from 'react';
import { InboxOutlined, LinkOutlined, LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import httpClient from '../../api/httpClient';
import { useCreateTile, useUpdateTile } from '../../hooks/tiles/useTiles';
import { Tile, TileSize } from '../../api/tiles.api';

interface CreateTileModalProps {
    open: boolean;
    onClose: () => void;
    tileToEdit?: Tile | null;
}

const CreateTileModal: React.FC<CreateTileModalProps> = ({ open, onClose, tileToEdit }) => {
    const isEditing = !!tileToEdit;
    const { mutate: createTile, isPending: isCreating } = useCreateTile();
    const { mutate: updateTile, isPending: isUpdating } = useUpdateTile();

    const [step, setStep] = useState<1 | 2>(isEditing ? 2 : 1);
    const [title, setTitle] = useState(tileToEdit?.title || '');
    const [linkUrl, setLinkUrl] = useState(tileToEdit?.linkUrl || '');
    const [size, setSize] = useState<TileSize | null>(tileToEdit?.size || null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(tileToEdit?.imageUrl || null);
    const [submitUrl, setSubmitUrl] = useState<string | null>(tileToEdit?.imageUrl || null);
    React.useEffect(() => {
        if (open) {
            if (tileToEdit) {
                setTitle(tileToEdit.title);
                setLinkUrl(tileToEdit.linkUrl || '');
                setSize(tileToEdit.size);
                setPreviewUrl(tileToEdit.imageUrl);
                setSubmitUrl(tileToEdit.imageUrl);
                setStep(2);
            } else {
                resetForm();
            }
        }
    }, [tileToEdit, open]);

    const resetForm = () => {
        setStep(1);
        setTitle('');
        setLinkUrl('');
        setSize(null);
        setPreviewUrl(null);
        setSubmitUrl(null);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleUploadProcess = async (file: File) => {
        setUploading(true);
        setError(null);
        try {
            const { data } = await httpClient.post('/media/upload-url', {
                filename: file.name,
                contentType: file.type,
                contentLength: file.size,
            });

            const { uploadUrl, publicUrl, viewUrl } = data.data;

            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type }
            });

            setPreviewUrl(viewUrl);
            setSubmitUrl(publicUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            setError('Failed to upload image. Please try again.');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const isImage = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
            const isLt5M = file.size / 1024 / 1024 < 5;

            if (!isImage) {
                setError('Only PNG, JPEG, and WebP images are allowed');
                return;
            }
            if (!isLt5M) {
                setError('Image must be smaller than 5MB');
                return;
            }

            handleUploadProcess(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Please enter a title');
            return;
        }
        if (!submitUrl) {
            setError('Please upload an image first');
            return;
        }
        if (!size) return;

        let finalLinkUrl = linkUrl;
        if (finalLinkUrl && !/^https?:\/\//i.test(finalLinkUrl)) {
            finalLinkUrl = `https://${finalLinkUrl}`;
        }

        const payload = {
            title,
            imageUrl: submitUrl,
            linkUrl: finalLinkUrl,
            size,
        };

        if (isEditing && tileToEdit) {
            updateTile(
                { id: tileToEdit._id, data: payload },
                {
                    onSuccess: () => {
                        handleClose();
                    },
                    onError: () => {
                        setError('Failed to update tile. Please try again.');
                    },
                }
            );
        } else {
            createTile(
                payload,
                {
                    onSuccess: () => {
                        handleClose();
                    },
                    onError: () => {
                        setError('Failed to save tile. Please try again.');
                    },
                }
            );
        }
    };

    if (!open) return null;
    const renderSizeCard = (value: TileSize, label: string, gridClass: string) => {
        const isSelected = size === value;
        return (
            <div
                onClick={() => setSize(value)}
                className={`
                    cursor-pointer rounded-xl border-2 transition-all duration-200 relative overflow-hidden group
                    ${isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-background'
                    }
                `}
            >
                <div className="p-4 flex flex-col h-full gap-3">
                    <div className="flex-1 bg-white border border-gray-200 border-dashed rounded-lg p-2 flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-1 w-full max-w-[120px] aspect-[4/3]">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className={`
                                    rounded-sm aspect-square
                                    ${i === 0 && value === 'SMALL' ? 'bg-primary' : ''}
                                    ${(i === 0 || i === 1 || i === 4 || i === 5) && value === 'LARGE' ? 'bg-primary' : ''}
                                    ${(i >= 0 && i < 4) && value === 'FULL_WIDTH' ? 'bg-primary' : ''}
                                    ${(!isSelected || (
                                        (value === 'SMALL' && i !== 0) ||
                                        (value === 'LARGE' && ![0, 1, 4, 5].includes(i)) ||
                                        (value === 'FULL_WIDTH' && i >= 4)
                                    )) ? 'bg-gray-100' : ''}
                                `} />
                            ))}
                        </div>
                    </div>
                    <div className="text-center">
                        <span className={`font-semibold block ${isSelected ? 'text-primary' : 'text-charcoal'}`}>{label}</span>
                        <span className="text-xs text-charcoal/40 font-medium">{gridClass}</span>
                    </div>
                </div>
                {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                        ✓
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleClose} />

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        {step === 2 && !isEditing && (
                            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-700 transition-colors">
                                <ArrowLeftOutlined />
                            </button>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-charcoal">
                                {isEditing ? 'Edit Tile' : step === 1 ? 'Choose Tile Size' : 'Tile Details'}
                            </h3>
                            <p className="text-xs text-charcoal/65">{isEditing ? 'Update tile content' : `Step ${step} of 2`}</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-charcoal/40 hover:text-charcoal transition-colors text-2xl leading-none">&times;</button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {step === 1 && (
                        <div className="flex flex-col h-full">
                            <p className="text-charcoal/80 mb-6 text-center max-w-md mx-auto">
                                Select how this tile should appear in the mobile app layout.
                                <br />This cannot be changed later.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                {renderSizeCard('SMALL', 'Small', '1x1 (Quarter)')}
                                {renderSizeCard('LARGE', 'Large', '2x2 (Big Box)')}
                                {renderSizeCard('FULL_WIDTH', 'Full Width', '4x1 (Banner)')}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!size}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-1">Tile Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Weekly Events"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-1">Image <span className="text-red-500">*</span></label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl bg-background hover:bg-gray-100 transition-colors relative group h-48">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={uploading}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        {uploading ? (
                                            <div className="text-center">
                                                <LoadingOutlined className="text-3xl text-primary animate-spin" />
                                                <p className="mt-2 text-charcoal/65 text-sm">Uploading...</p>
                                            </div>
                                        ) : previewUrl ? (
                                            <div className="w-full h-full p-2 relative">
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                    <span className="text-white text-xs font-bold bg-black/40 px-3 py-1 rounded-full">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <InboxOutlined className="text-3xl text-primary mb-2" />
                                                <p className="text-charcoal font-medium text-sm">Upload Image</p>
                                                <p className="text-charcoal/40 text-xs mt-1">PNG, JPEG, WebP</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-1">Link URL (Optional)</label>
                                <div className="relative">
                                    <LinkOutlined className="absolute left-3 top-3 text-charcoal/40" />
                                    <input
                                        type="text"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="google.com"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-charcoal font-semibold hover:bg-background transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating || !submitUrl || uploading}
                                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {isCreating || isUpdating ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Tile' : 'Create Tile')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateTileModal;