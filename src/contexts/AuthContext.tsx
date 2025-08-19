
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type User = {
    id: number;
    name: string;
    email: string;
};

const sampleUsers: (User & { pass: string })[] = [
    { id: 1, name: 'Admin', email: 'admin@example.com', pass: 'admin' },
    { id: 2, name: 'User', email: 'user@example.com', pass: 'user' },
];

interface AuthContextType {
    user: User | null;
    login: (username: string, pass: string) => User | null;
    logout: () => void;
    isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('loggedInUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('loggedInUser');
        }
        setIsLoaded(true);
    }, []);

    const login = (username: string, pass: string): User | null => {
        const foundUser = sampleUsers.find(
            u => (u.name.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && u.pass === pass
        );

        if (foundUser) {
            const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email };
            localStorage.setItem('loggedInUser', JSON.stringify(userData));
            setUser(userData);
            return userData;
        }
        return null;
    };

    const logout = useCallback(() => {
        localStorage.removeItem('loggedInUser');
        // Also clear selected org for this user
        if(user) {
            localStorage.removeItem(`selectedOrganizationId_${user.name}`);
        }
        setUser(null);
        router.push('/login');
    }, [router, user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoaded }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
