import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider, Alert, Tag, Card, Row, Col } from 'antd';
import {
    ArrowLeftOutlined,
    GoogleOutlined,
    LockOutlined,
    MailOutlined,
    UserOutlined,
    KeyOutlined,
    SafetyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmail, signInWithGoogle, signOut } from '../../auth/firebase.auth';
import { setToken, clearToken } from '../../auth/tokenStorage';
import { useValidateAccess, useGetUserRole } from '../../hooks/auth/useValidateAccess';
import { useAuth } from '../../app/providers/AuthProvider';
import { ValidateAccessResponse } from '../../api/auth.api';
import { env } from '../../config/env';

const { Title, Text } = Typography;

type LoginStep = 'email' | 'password' | 'google-confirm';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { setRole } = useAuth();
    const { validateAsync, isLoading: isValidating } = useValidateAccess();
    const { fetchRoleAsync, isLoading: isFetchingRole } = useGetUserRole();

    const [step, setStep] = useState<LoginStep>('email');
    const [email, setEmail] = useState('');
    const [accessInfo, setAccessInfo] = useState<ValidateAccessResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const handleEmailSubmit = async (values: { email: string }) => {
        try {
            const result = await validateAsync(values.email);
            setEmail(values.email);
            setAccessInfo(result);

            if (result.allowedAuthMethods.includes('email')) {
                setStep('password');
            } else if (result.allowedAuthMethods.includes('google')) {
                setStep('google-confirm');
            }
        } catch (error) {
            message.error('This email is not authorized to access the Youth Portal');
        }
    };

    const handleDirectGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            const userAuth = await signInWithGoogle();

            if (!userAuth.email) {
                await signOut();
                throw new Error('No email associated with Google account');
            }

            try {
                const result = await validateAsync(userAuth.email);
                setEmail(userAuth.email);
                setAccessInfo(result);

                if (result.allowedAuthMethods.includes('google')) {
                    const idToken = await auth.currentUser?.getIdToken();
                    if (idToken) setToken(idToken);

                    const roleInfo = await fetchRoleAsync();
                    setRole(roleInfo.role);

                    message.success('Login successful!');
                    navigate(roleInfo.role === 'admin' ? '/admin/home' : '/youth', { replace: true });
                } else {
                    await signOut();
                    message.error('Google login not officially allowed for this account role.');
                }
            } catch (validationError: any) {
                await signOut();
                const errorMsg = validationError.response?.data?.error?.message || validationError.message || 'Access Denied';
                message.error(errorMsg);
            }
        } catch (error: any) {
            clearToken();
            if (error.code !== 'auth/popup-closed-by-user') {
                const errorMsg = error.response?.data?.error?.message || error.message || 'Google sign-in failed.';
                message.error(errorMsg);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handlePasswordSubmit = async (values: { password: string }) => {
        if (!accessInfo?.allowedAuthMethods.includes('email')) {
            message.error('Email/password login not allowed for this account');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmail(email, values.password);
            const idToken = await userCredential.getIdToken();
            setToken(idToken);

            const roleInfo = await fetchRoleAsync();
            setRole(roleInfo.role);

            message.success('Login successful!');
            navigate(roleInfo.role === 'admin' ? '/admin/home' : '/youth', { replace: true });
        } catch (error: any) {
            clearToken();
            message.error('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!accessInfo?.allowedAuthMethods.includes('google')) {
            message.error('Google login not allowed for this account.');
            return;
        }

        setLoading(true);
        try {
            const user = await signInWithGoogle();
            if (user.email?.toLowerCase() !== email.toLowerCase()) {
                await signOut();
                message.error('Please sign in with the same email address you entered');
                return;
            }

            const idToken = await auth.currentUser?.getIdToken();
            if (idToken) setToken(idToken);

            const roleInfo = await fetchRoleAsync();
            setRole(roleInfo.role);

            message.success('Login successful!');
            navigate(roleInfo.role === 'admin' ? '/admin/home' : '/youth', { replace: true });
        } catch (error: any) {
            clearToken();
            if (error.code !== 'auth/popup-closed-by-user') {
                message.error('Google sign-in failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setStep('email');
        setAccessInfo(null);
        setEmail('');
    };

    const isLoading = isValidating || isFetchingRole || loading;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center">
                    <div className="mb-6 text-center">
                        <div className="size-16 lg:size-44 mx-auto mb-6">
                            <img
                                src="/login-logo.png"
                                alt="Organization Logo"
                                className="w-full h-full object-contain drop-shadow-lg animate-fade-in"
                            />
                        </div>
                        <Title level={1} className="!mb-2 !text-3xl lg:!text-4xl text-gray-800 font-bold">
                            Youth Portal
                        </Title>
                        <Text className="text-gray-600 text-lg">
                            Secure Access Portal
                        </Text>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 max-w-md">
                    <Card
                        className="shadow-xl border-0 rounded-2xl overflow-hidden"
                        styles={{
                            body: {
                                padding: '2rem'
                            }
                        }}
                    >
                        <div className="text-center mb-6">
                            <Title level={2} className="!mb-2 !text-2xl text-gray-800">
                                {step === 'email' ? 'Sign In to Portal' :
                                    step === 'password' ? 'Enter Password' :
                                        'Google Sign In'}
                            </Title>
                            <Text className="text-gray-600">
                                {step === 'email' ? 'Choose your login method' : 'Continue with your account'}
                            </Text>
                        </div>

                        <Divider className="!my-6 !border-gray-200" />

                        <div className="min-h-[200px]">
                            {step === 'email' && (
                                <div className="animate-fade-in">
                                    <div className="mb-6">
                                        <Button
                                            type="default"
                                            icon={<GoogleOutlined />}
                                            size="large"
                                            onClick={handleDirectGoogleLogin}
                                            loading={googleLoading || isFetchingRole}
                                            className="w-full !h-12 !rounded-lg !text-base !font-semibold !border-gray-300 hover:!border-blue-500 hover:!bg-blue-50"
                                        >
                                            Sign in with Google
                                        </Button>
                                        <div className="text-center mt-2">
                                            <Text type="secondary" className="text-xs">
                                                Quick access for Google accounts
                                            </Text>
                                        </div>
                                    </div>

                                    <Divider plain className="!text-gray-400 !my-8">
                                        OR
                                    </Divider>
                                    <div>
                                        <Text strong className="text-gray-700 block mb-3">
                                            Continue with email
                                        </Text>
                                        <Form
                                            onFinish={handleEmailSubmit}
                                            layout="vertical"
                                            requiredMark={false}
                                            size="large"
                                        >
                                            <Form.Item
                                                name="email"
                                                rules={[
                                                    { required: true, message: 'Please enter your email' },
                                                    { type: 'email', message: 'Please enter a valid email' },
                                                ]}
                                            >
                                                <Input
                                                    prefix={<MailOutlined className="text-gray-400" />}
                                                    placeholder="Enter your email address"
                                                    className="!rounded-lg !border-gray-300 hover:!border-blue-400"
                                                    autoFocus
                                                />
                                            </Form.Item>

                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={isValidating}
                                                className="w-full !h-12 !rounded-lg !text-base font-semibold"
                                            >
                                                Continue with Email
                                            </Button>
                                        </Form>
                                    </div>
                                </div>
                            )}

                            {step === 'password' && (
                                <div className="animate-fade-in">
                                    <div className="flex items-center justify-between mb-6">
                                        <div
                                            className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                                            onClick={handleBackToEmail}
                                        >
                                            <ArrowLeftOutlined />
                                            <Text className="text-gray-600">Back</Text>
                                        </div>
                                        <div className="text-right">
                                            <Text className="text-gray-500 text-sm truncate max-w-[200px] inline-block">
                                                {email}
                                            </Text>
                                            <Tag color="blue" className="!ml-2">
                                                <KeyOutlined />
                                            </Tag>
                                        </div>
                                    </div>

                                    <Form
                                        onFinish={handlePasswordSubmit}
                                        layout="vertical"
                                        requiredMark={false}
                                        size="large"
                                    >
                                        <Form.Item
                                            name="password"
                                            label={<Text strong className="text-gray-700">Password</Text>}
                                            rules={[{ required: true, message: 'Please enter your password' }]}
                                            className="mb-6"
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined className="text-gray-400" />}
                                                placeholder="Enter your password"
                                                className="!rounded-lg !border-gray-300 hover:!border-blue-400"
                                                autoFocus
                                            />
                                        </Form.Item>


                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={isLoading}
                                            className="w-full !h-12 !rounded-lg !text-base font-semibold"
                                        >
                                            Sign In
                                        </Button>
                                    </Form>
                                </div>
                            )}
                            <div className="flex justify-end mt-5">
                                <a
                                    href={env.RESET_PASSLINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            {step === 'google-confirm' && (
                                <div className="animate-fade-in text-center">
                                    <div className="flex items-center justify-between mb-6">
                                        <div
                                            className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                                            onClick={handleBackToEmail}
                                        >
                                            <ArrowLeftOutlined />
                                            <Text className="text-gray-600">Back</Text>
                                        </div>
                                        <div className="text-right">
                                            <Text className="text-gray-500 text-sm truncate max-w-[200px] inline-block">
                                                {email}
                                            </Text>
                                            <Tag color="orange" className="!ml-2">
                                                <UserOutlined /> Member
                                            </Tag>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <GoogleOutlined className="text-2xl text-blue-600" />
                                        </div>
                                        <Title level={4} className="!mb-2">Google Authentication</Title>
                                        <Text className="text-gray-600">
                                            Please confirm your Google sign-in for<br />
                                            <Text strong>{email}</Text>
                                        </Text>
                                    </div>

                                    <Button
                                        type="primary"
                                        icon={<GoogleOutlined />}
                                        size="large"
                                        onClick={handleGoogleSignIn}
                                        loading={isLoading}
                                        className="w-full !h-12 !rounded-lg !text-base font-semibold"
                                    >
                                        Sign in with Google
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Divider className="!my-8 !border-gray-200" />

                        <div className="text-center">
                            <SafetyOutlined className="text-gray-400 mb-2" />
                            <Text className="text-gray-400 text-xs block">
                                Your data is encrypted and securely stored
                            </Text>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Login;