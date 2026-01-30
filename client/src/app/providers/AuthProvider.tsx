import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, onAuthStateChanged, User } from '../../auth/firebase.auth';
import { getUserRole, UserRole } from '../../api/auth.api';
import { setToken, clearToken } from '../../auth/tokenStorage';

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    error: string | null;
    setRole: (role: UserRole | null) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            setLoading(true);
            setError(null);

            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const idToken = await firebaseUser.getIdToken();
                    setToken(idToken);
                    const roleInfo = await getUserRole();
                    setRole(roleInfo.role);
                } catch (err: any) {
                    console.error('Auth initialization error:', err);
                    const isUnauthorized =
                        err.statusCode === 403 ||
                        err.status === 403 ||
                        err.message?.toLowerCase().includes('authorized') ||
                        err.message?.toLowerCase().includes('forbidden');

                    if (isUnauthorized) {
                        try {
                            await auth.signOut();
                        } catch (signOutErr) {
                            console.error('Forced signout failed:', signOutErr);
                        }
                        clearToken();
                        setUser(null);
                        setRole(null);
                        setError('Access Denied: You are not authorized for this portal.');
                    } else {
                        setError('Failed to retrieve user profile.');
                        setRole(null);
                    }
                }
            } else {
                setUser(null);
                setRole(null);
                clearToken();
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);



    const logout = async () => {
        try {
            await auth.signOut();
            clearToken();
            setUser(null);
            setRole(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const value = {
        user,
        role,
        loading,
        error,
        setRole,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;
