

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Project } from '@/app/projects/page';

export type Organization = {
    id: string;
    name: string;
    description: string;
    type: 'Region' | 'Site' | 'Client';
    subscribers: number;
    status: 'Active' | 'Inactive' | 'Trial';
    children?: Organization[];
};

export type Subscriber = {
    id: number;
    username: string;
    pass: string;
    fullname: string;
    product: string;
    group: string;
    status: 'Online' | 'Offline';
};

export type Product = {
    id: string;
    name: string;
    bandwidthUp: string;
    bandwidthDown: string;
    sessionLimit: string;
    subscribers: number;
};

export type Group = {
    id: string;
    name: string;
    description: string;
    subscribers: number;
    profile: string;
};

export type Profile = {
    id: string;
    name: string;
};


interface OrganizationContextType {
    organizations: Organization[];
    selectedOrganization: Organization | null;
    isLoaded: boolean;
    selectOrganization: (organization: Organization | null, onSelect?: () => void) => void;
    addOrganization: (organization: Organization, shouldAutoSelect?: boolean) => void;
    deleteOrganization: (orgId: string) => void;
    subscribers: Subscriber[];
    setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    groups: Group[];
    setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
    profiles: Profile[];
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    addDefaultDataForNewOrg: () => void;
}

const sampleOrganizations: Organization[] = [
    {
        id: 'org-1',
        name: 'Global Corp',
        type: 'Region',
        description: 'Main corporate client',
        subscribers: 1500,
        status: 'Active',
    },
    {
        id: 'org-2',
        name: 'FTTX Provider',
        type: 'Client',
        description: 'Fiber provider for residential areas',
        subscribers: 10000,
        status: 'Trial',
    },
];

const sampleSubscribers: Subscriber[] = [
    { id: 1, username: 'user_one', pass: 'pass123', fullname: 'User One', product: 'Premium', group: 'Enterprise', status: 'Online' },
    { id: 2, username: 'user_two', pass: 'secret', fullname: 'User Two', product: 'Basic', group: 'FTTX', status: 'Offline' },
];

const sampleProducts: Product[] = [
    { id: 'prod_1', name: 'Basic', bandwidthUp: '5 Mbps', bandwidthDown: '25 Mbps', sessionLimit: '24h', subscribers: 1 },
    { id: 'prod_2', name: 'Premium', bandwidthUp: '50 Mbps', bandwidthDown: '250 Mbps', sessionLimit: '72h', subscribers: 2 },
];

const sampleGroups: Group[] = [
    { id: 'grp_1', name: 'Enterprise', description: 'Corporate users with full access', subscribers: 2, profile: 'Enterprise AAA' },
    { id: 'grp_2', name: 'FTTX', description: 'Fiber-to-the-home residential users', subscribers: 1, profile: 'Wi-Fi Hotspot (Auth-Only)'},
];

const sampleProfiles: Profile[] = [
    { id: 'tpl-wifi-hotspot', name: 'Wi-Fi Hotspot (Auth-Only)'},
    { id: 'tpl-enterprise-aaa', name: 'Enterprise AAA' },
];

const initialProjects: Project[] = [
    {
        id: 'proj-1',
        name: 'Enterprise AAA',
        description: 'Full AAA profile for corporate networks with accounting.',
        status: 'Active',
        createdAt: '2024-07-20',
        sharedSecret: 'super-secret-key-1',
        subscriberGroups: ['Enterprise', 'VPN-Users'],
        profile: { authEnabled: true, acctEnabled: true, checkAttributes: ['User-Name', 'User-Password'], replyAttributes: ['Framed-IP-Address', 'Class'], vendorAttributes: ['Cisco-AVPair'], accountingAttributes: ['Acct-Status-Type', 'Acct-Session-Id'] }
    },
     {
        id: 'proj-2',
        name: 'Guest Wi-Fi Hotspot',
        description: 'Simple authentication for public Wi-Fi. No accounting.',
        status: 'Draft',
        createdAt: '2024-06-15',
        sharedSecret: 'guest-secret-key-2',
        subscriberGroups: ['Guest'],
        profile: { authEnabled: true, acctEnabled: false, checkAttributes: ['User-Name', 'User-Password'], replyAttributes: ['Session-Timeout'], vendorAttributes: [], accountingAttributes: [] }
    }
];

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
    const [organizations, setOrganizations] = useState<Organization[]>(sampleOrganizations);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
    const [isLoaded, setIsLoaded] = useState(true);
    
    // Data states
    const [subscribers, setSubscribers] = useState<Subscriber[]>(sampleSubscribers);
    const [products, setProducts] = useState<Product[]>(sampleProducts);
    const [groups, setGroups] = useState<Group[]>(sampleGroups);
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [profiles, setProfiles] = useState<Profile[]>(sampleProfiles);

    const selectOrganization = (organization: Organization | null, onSelect?: () => void) => {
        setSelectedOrganization(organization);
        if (organization) {
            localStorage.setItem(`selectedOrganizationId_Admin`, organization.id);
        } else {
            localStorage.removeItem(`selectedOrganizationId_Admin`);
        }
        
        // The callback ensures that any subsequent action (like a redirect)
        // happens after the state has been updated.
        if (onSelect) {
            // Using a timeout to ensure the state update has propagated
            setTimeout(onSelect, 0);
        }
    };
    
    const addOrganization = (organization: Organization, shouldAutoSelect = true) => {
        setOrganizations(prev => {
            const newOrgs = [...prev, organization];
            if (shouldAutoSelect) {
                // This will be called after the organizations state is updated
                selectOrganization(organization);
            }
            return newOrgs;
        });
    };
    
    const deleteOrganization = (orgId: string) => {
        if (selectedOrganization?.id === orgId) {
            selectOrganization(null);
        }
        setOrganizations(prev => prev.filter(o => o.id !== orgId));
    };

    const addDefaultDataForNewOrg = () => {
        const defaultGroup: Group = { id: 'grp_default_1', name: 'Default', description: 'Default subscriber group', subscribers: 1, profile: 'Enterprise AAA' };
        const defaultProduct: Product = { id: 'prod_default_1', name: 'Default Plan', bandwidthUp: '10 Mbps', bandwidthDown: '50 Mbps', sessionLimit: '24h', subscribers: 1 };
        const defaultSubscriber: Subscriber = { id: 1, username: 'default_user', pass: 'password', fullname: 'Default User', product: 'Default Plan', group: 'Default', status: 'Offline' };
        const defaultProject: Project = {
            id: 'proj-default-1', name: 'My First Project', description: 'A default project to get you started.', status: 'Draft', createdAt: new Date().toISOString().split('T')[0],
            sharedSecret: 'your-secret-here', subscriberGroups: ['Default'],
            profile: { authEnabled: true, acctEnabled: false, checkAttributes: ['User-Name', 'User-Password'], replyAttributes: ['Reply-Message', 'Session-Timeout'], vendorAttributes: [], accountingAttributes: [] }
        };

        setGroups([defaultGroup]);
        setProducts([defaultProduct]);
        setSubscribers([defaultSubscriber]);
        setProjects([defaultProject]);
    };

    return (
        <OrganizationContext.Provider value={{ 
            organizations, selectedOrganization, selectOrganization, addOrganization, deleteOrganization, isLoaded,
            subscribers, setSubscribers,
            products, setProducts,
            groups, setGroups,
            profiles,
            projects, setProjects,
            addDefaultDataForNewOrg
        }}>
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganization = (): OrganizationContextType => {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
};
