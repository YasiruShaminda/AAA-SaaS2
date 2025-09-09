
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type User = {
    id: number;
    name: string;
    email: string;
    emailVerified?: boolean;
};

// Extends the return type of the login function to include the verification status,
// allowing the UI to make smarter decisions without relying on a null value.
export type LoginResult = {
    user: User;
    isVerified: boolean;
};


const sampleUsers: (User & { pass:string })[] = [
    { id: 1, name: 'Admin', email: 'admin@example.com', pass: 'admin', emailVerified: true },
    { id: 2, name: 'User', email: 'user@example.com', pass: 'user', emailVerified: false },
];

interface AuthContextType {
    user: User | null;
    login: (username: string, pass: string) => LoginResult | null;
    register: (username: string, email: string, pass: string) => User;
    logout: () => void;
    sendVerificationEmail: (email: string) => void;
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

    const login = (username: string, pass: string): LoginResult | null => {
        const foundUser = sampleUsers.find(
            u => (u.name.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && u.pass === pass
        );

        if (foundUser) {
            const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email, emailVerified: foundUser.emailVerified };
            
            // Set user in context regardless of verification status
            localStorage.setItem('loggedInUser', JSON.stringify(userData));
            setUser(userData);
            
            // Return a result object instead of null for unverified users
            return { user: userData, isVerified: !!foundUser.emailVerified };
        }
        return null;
    };
    
    const register = (username: string, email: string, pass: string): User => {
        if (sampleUsers.some(u => u.name.toLowerCase() === username.toLowerCase())) {
            throw new Error('Username already exists.');
        }
         if (sampleUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('Email already registered.');
        }

        const newUser: (User & { pass: string }) = {
            id: sampleUsers.length + 1,
            name: username,
            email: email,
            pass: pass,
            emailVerified: false,
        };
        sampleUsers.push(newUser);
        
        // Log in the new user immediately to establish a session for verification
        const userData = { id: newUser.id, name: newUser.name, email: newUser.email, emailVerified: false };
        localStorage.setItem('loggedInUser', JSON.stringify(userData));
        setUser(userData);
        
        sendVerificationEmail(email);

        return userData;
    };
    
    const sendVerificationEmail = (email: string) => {
        // This is a placeholder for a real email sending service
        console.log(`Sending verification email to ${email}`);
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
        <AuthContext.Provider value={{ user, login, register, logout, sendVerificationEmail, isLoaded }}>
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
