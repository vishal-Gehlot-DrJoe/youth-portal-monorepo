import React, { useState } from 'react';
import {
    Card,
    Table,
    Input,
    Button,
    Tag,
    Space,
    Typography,
    Modal,
    Form,
    Upload,
    message,
    notification,
    Tooltip,
    DatePicker,
    Popconfirm,
    Divider
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    CloudUploadOutlined,
    MailOutlined,
    InboxOutlined,
    ReloadOutlined,
    DeleteOutlined,
    StopOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import {
    useYouthEmails,
    useAddYouthEmail,
    useBulkUploadYouthEmails,
    useUpdateYouthEmailStatus,
    useDeleteYouthEmails
} from '../../hooks/youth/useYouthEmails';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { RangePicker } = DatePicker;

const AdminYouth: React.FC = () => {
    const [queryParams, setQueryParams] = useState({
        page: 1,
        pageSize: 10,
        search: '',
        isActive: undefined as boolean | undefined,
        startDate: undefined as string | undefined,
        endDate: undefined as string | undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc' as 'asc' | 'desc'
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const { data, isLoading, isFetching, refetch } = useYouthEmails(queryParams);
    const { mutate: addEmail, isPending: adding } = useAddYouthEmail();
    const { mutate: bulkUpload, isPending: uploading } = useBulkUploadYouthEmails();
    const { mutate: updateStatus, isPending: updatingStatus } = useUpdateYouthEmailStatus();
    const { mutate: deleteEmails, isPending: deleting } = useDeleteYouthEmails();

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setQueryParams(prev => ({
            ...prev,
            page: pagination.current,
            pageSize: pagination.pageSize,
            search: filters.email ? filters.email[0] : prev.search,
            isActive: filters.isActive ? (filters.isActive[0] === 'true') : undefined,
            sortBy: sorter.field || 'createdAt',
            sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
        }));
    };

    const handleSearch = (value: string) => {
        setQueryParams(prev => ({ ...prev, search: value, page: 1 }));
    };

    const handleDateRangeChange = (dates: any) => {
        setQueryParams(prev => ({
            ...prev,
            page: 1,
            startDate: dates ? dates[0].format('YYYY-MM-DD') : undefined,
            endDate: dates ? dates[1].format('YYYY-MM-DD') : undefined
        }));
    };

    const handleAddEmail = (values: { email: string }) => {
        addEmail(values.email, {
            onSuccess: () => {
                message.success('Email added successfully');
                setAddModalOpen(false);
                form.resetFields();
            },
            onError: (err: any) => {
                const msg = err.response?.data?.error || 'Failed to add email';
                message.error(msg);
            }
        });
    };

    const handleBulkUpload = () => {
        if (fileList.length === 0) {
            message.warning('Please select a file first');
            return;
        }

        const file = fileList[0].originFileObj;
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            const emails: string[] = [];
            if (json.length > 0) {
                const headerRow = json[0];
                const emailColIndex = headerRow.findIndex((cell: any) =>
                    typeof cell === 'string' && cell.toLowerCase() === 'email'
                );

                const targetColIndex = emailColIndex !== -1 ? emailColIndex : 0;
                const startRow = emailColIndex !== -1 ? 1 : 0;

                for (let i = startRow; i < json.length; i++) {
                    const row = json[i];
                    const email = row[targetColIndex];
                    if (typeof email === 'string' && email.includes('@')) {
                        emails.push(email);
                    }
                }
            }

            if (emails.length === 0) {
                message.error('No valid emails found in the file');
                return;
            }

            console.log('[YouthPortal] Extracted emails from file:', emails);
            message.loading({ content: `Processing ${emails.length} emails...`, key: 'bulk-upload-processing' });

            bulkUpload(emails, {
                onSuccess: (res) => {
                    message.destroy('bulk-upload-processing');
                    const hasDuplicates = res.totalDuplicatesIgnored > 0;
                    const noneInserted = res.totalInserted === 0;

                    const notificationConfig = {
                        message: noneInserted ? 'No New Emails Added' : 'Bulk Upload Complete',
                        description: (
                            <div>
                                <p>Total Processed: <strong>{res.totalProcessed}</strong></p>
                                <p className="text-green-600">Successfully Inserted: <strong>{res.totalInserted}</strong></p>
                                {hasDuplicates && (
                                    <p className="text-amber-600 font-medium">
                                        Duplicates Ignored: <strong>{res.totalDuplicatesIgnored}</strong>
                                    </p>
                                )}
                            </div>
                        ),
                        duration: hasDuplicates ? 15 : 6
                    };

                    if (noneInserted && hasDuplicates) {
                        notification.warning(notificationConfig);
                    } else if (hasDuplicates) {
                        notification.info(notificationConfig);
                    } else {
                        notification.success(notificationConfig);
                    }

                    setUploadModalOpen(false);
                    setFileList([]);
                },
                onError: () => {
                    message.destroy('bulk-upload-processing');
                    message.error('Failed to upload emails');
                }
            });
        };

        reader.readAsBinaryString(file);
    };

    const handleBulkStatusUpdate = (isActive: boolean) => {
        if (selectedRowKeys.length === 0) return;

        const actionText = isActive ? 'Activate' : 'Deactivate';

        Modal.confirm({
            title: `Confirm Bulk ${actionText}`,
            icon: isActive ? <CheckCircleOutlined className="text-green-500" /> : <StopOutlined className="text-amber-500" />,
            content: `Are you sure you want to ${actionText.toLowerCase()} all ${selectedRowKeys.length} selected records?`,
            okText: actionText,
            cancelText: 'Cancel',
            centered: true,
            onOk: () => {
                const idsString = selectedRowKeys as string[];
                setProcessingIds(prev => new Set([...prev, ...idsString]));
                return new Promise((resolve, reject) => {
                    updateStatus({ ids: idsString, isActive }, {
                        onSuccess: () => {
                            message.success(`Successfully ${actionText.toLowerCase()}d ${selectedRowKeys.length} items`);
                            setSelectedRowKeys([]);
                            resolve(true);
                        },
                        onError: () => {
                            message.error(`Failed to ${actionText.toLowerCase()} items`);
                            reject();
                        },
                        onSettled: () => {
                            setProcessingIds(prev => {
                                const next = new Set(prev);
                                idsString.forEach(id => next.delete(id));
                                return next;
                            });
                        }
                    });
                });
            }
        });
    };

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) return;

        Modal.confirm({
            title: 'Confirm Bulk Deletion',
            icon: <ExclamationCircleOutlined className="text-red-500" />,
            content: `Are you sure you want to permanently delete these ${selectedRowKeys.length} records? This action cannot be undone.`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            className: 'rounded-confirm-modal',
            onOk: () => {
                const idsString = selectedRowKeys as string[];
                setProcessingIds(prev => new Set([...prev, ...idsString]));
                return new Promise((resolve, reject) => {
                    deleteEmails(idsString, {
                        onSuccess: () => {
                            message.success('Selected records deleted');
                            setSelectedRowKeys([]);
                            resolve(true);
                        },
                        onError: () => {
                            message.error('Failed to delete records');
                            reject();
                        },
                        onSettled: () => {
                            setProcessingIds(prev => {
                                const next = new Set(prev);
                                idsString.forEach(id => next.delete(id));
                                return next;
                            });
                        }
                    });
                });
            }
        });
    };

    const columns = [
        {
            title: 'Email Address',
            dataIndex: 'email',
            key: 'email',
            sorter: true,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
                <div className="p-3" onKeyDown={e => e.stopPropagation()}>
                    <Input
                        placeholder="Search email"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        className="mb-2 block !rounded-md"
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            icon={<SearchOutlined />}
                            size="small"
                            className="w-20 !rounded-md"
                        >
                            Search
                        </Button>
                        <Button
                            onClick={() => {
                                clearFilters();
                                confirm();
                            }}
                            size="small"
                            className="w-20 !rounded-md"
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
            ),
            render: (text: string) => (
                <Space>
                    <MailOutlined className="text-secondary/40" />
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            filters: [
                { text: 'Active', value: 'true' },
                { text: 'Inactive', value: 'false' },
            ],
            filterMultiple: false,
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'success' : 'default'} className="!rounded-full px-3">
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            )
        },
        {
            title: 'Added On',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            defaultSortOrder: 'descend' as 'descend',
            render: (date: string) => (
                <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
                    <Text type="secondary">{dayjs(date).format('MMM D, YYYY')}</Text>
                </Tooltip>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_: any, record: any) => (
                <Space split={<Divider type="vertical" />} size="small">
                    <Popconfirm
                        title={`${record.isActive ? 'Deactivate' : 'Activate'} Email`}
                        description={(
                            <span>
                                Do you really want to {record.isActive ? 'deactivate' : 'activate'} <br />
                                <strong>{record.email}</strong>?
                            </span>
                        )}
                        onConfirm={() => {
                            setProcessingIds(prev => new Set(prev).add(record._id));
                            updateStatus({ ids: [record._id], isActive: !record.isActive }, {
                                onSettled: () => setProcessingIds(prev => {
                                    const next = new Set(prev);
                                    next.delete(record._id);
                                    return next;
                                })
                            });
                        }}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ loading: updatingStatus && processingIds.has(record._id) }}
                    >
                        <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
                            <Button
                                type="text"
                                size="small"
                                icon={record.isActive ? <StopOutlined className="text-amber-500" /> : <CheckCircleOutlined className="text-green-500" />}
                                loading={updatingStatus && processingIds.has(record._id)}
                            />
                        </Tooltip>
                    </Popconfirm>

                    <Popconfirm
                        title="Delete Email"
                        description={(
                            <span>
                                Do you really want to delete <br />
                                <strong>{record.email}</strong>?<br />
                                <Text type="danger" className="text-[11px]">This action cannot be undone.</Text>
                            </span>
                        )}
                        onConfirm={() => {
                            setProcessingIds(prev => new Set(prev).add(record._id));
                            deleteEmails([record._id], {
                                onSettled: () => setProcessingIds(prev => {
                                    const next = new Set(prev);
                                    next.delete(record._id);
                                    return next;
                                })
                            });
                        }}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true, loading: deleting && processingIds.has(record._id) }}
                    >
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            loading={deleting && processingIds.has(record._id)}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    const hasSelected = selectedRowKeys.length > 0;

    return (
        <div className="max-w-6xl mx-auto py-4 px-2 md:py-8 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <Title level={2} className="!mb-1">Youth Email Management</Title>
                    <Text type="secondary">Whitelist and manage authorized youth member emails</Text>
                </div>
                <Space size="middle">
                    <Button
                        icon={<CloudUploadOutlined />}
                        size="large"
                        onClick={() => setUploadModalOpen(true)}
                        className="!rounded-xl !h-11 px-6 border-primary text-primary hover:bg-primary/5 font-semibold"
                    >
                        Upload CSV / Excel
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => setAddModalOpen(true)}
                        className="!rounded-xl !h-11 px-6 shadow-md shadow-primary/20 font-semibold"
                    >
                        Add Email
                    </Button>
                </Space>
            </div>
            <Card className="!rounded-2xl shadow-sm border-gray-100 overflow-hidden relative">
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <Input
                            placeholder="Search emails..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            size="large"
                            allowClear
                            className="!rounded-xl max-w-md"
                            onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
                            onChange={(e) => !e.target.value && handleSearch('')}
                        />

                        <Space className="w-full md:w-auto">
                            <RangePicker
                                size="large"
                                className="!rounded-xl"
                                onChange={handleDateRangeChange}
                                placeholder={['Start Date', 'End Date']}
                            />
                            <Button
                                icon={<ReloadOutlined spin={isFetching} />}
                                onClick={() => refetch()}
                                className="!rounded-lg h-10"
                            >
                                Refresh
                            </Button>
                        </Space>
                    </div>
                    {hasSelected && (
                        <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                            <Space size="middle">
                                <Text strong className="text-primary">{selectedRowKeys.length} items selected</Text>
                                <Divider type="vertical" className="border-primary/20" />
                                <Space size="small">
                                    <Button
                                        size="small"
                                        icon={<CheckCircleOutlined />}
                                        className="!rounded-lg !text-green-600 !border-green-200"
                                        onClick={() => handleBulkStatusUpdate(true)}
                                        loading={updatingStatus}
                                    >
                                        Mark Active
                                    </Button>
                                    <Button
                                        size="small"
                                        icon={<StopOutlined />}
                                        className="!rounded-lg !text-amber-600 !border-amber-200"
                                        onClick={() => handleBulkStatusUpdate(false)}
                                        loading={updatingStatus}
                                    >
                                        Mark Inactive
                                    </Button>
                                    <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        className="!rounded-lg"
                                        onClick={handleBulkDelete}
                                        loading={deleting}
                                    >
                                        Delete Forever
                                    </Button>
                                </Space>
                            </Space>
                            <Button type="text" size="small" onClick={() => setSelectedRowKeys([])}>Clear</Button>
                        </div>
                    )}
                </div>

                <Table
                    rowSelection={rowSelection}
                    columns={columns as any}
                    dataSource={data?.items || []}
                    rowKey="_id"
                    loading={isLoading}
                    onChange={handleTableChange}
                    pagination={{
                        current: data?.page || 1,
                        pageSize: data?.pageSize || 10,
                        total: data?.total || 0,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        className: "!mt-8"
                    }}
                    className="youth-email-table"
                />
            </Card>

            <Modal
                title="Add Authorized Email"
                open={addModalOpen}
                onCancel={() => setAddModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={adding}
                okText="Add Email"
                cancelText="Cancel"
                okButtonProps={{ className: '!rounded-lg !h-10 px-8' }}
                cancelButtonProps={{ className: '!rounded-lg !h-10' }}
            >
                <Form form={form} layout="vertical" onFinish={handleAddEmail} className="mt-4">
                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: 'Please enter an email' },
                            { type: 'email', message: 'Invalid email format' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="e.g. youth@example.com" size="large" className="!rounded-lg" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Bulk Upload Emails"
                open={uploadModalOpen}
                onCancel={() => setUploadModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setUploadModalOpen(false)} className="!rounded-lg">
                        Cancel
                    </Button>,
                    <Button
                        key="upload"
                        type="primary"
                        icon={<CloudUploadOutlined />}
                        onClick={handleBulkUpload}
                        loading={uploading}
                        className="!rounded-lg !h-9 px-6"
                    >
                        Start Upload
                    </Button>
                ]}
            >
                <div className="py-4">
                    <Dragger
                        name="file"
                        multiple={false}
                        accept=".csv,.xlsx"
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList.slice(-1))}
                        beforeUpload={() => false}
                        className="!rounded-2xl"
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined className="text-primary" />
                        </p>
                        <p className="ant-upload-text">Click or drag CSV/Excel file to this area</p>
                        <p className="ant-upload-hint">
                            Supports .csv and .xlsx. Ensure the first column contains the email addresses.
                        </p>
                    </Dragger>
                </div>
            </Modal>
        </div>
    );
};

export default AdminYouth;
