
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Organization = {
    id: string;
    name: string;
    description: string;
    type: 'Region' | 'Site' | 'Client';
    subscribers: number;
    status: 'Active' | 'Inactive' | 'Trial';
    children?: Organization[];
};

interface OrganizationContextType {
    organizations: Organization[];
    selectedOrganization: Organization | null;
    selectOrganization: (organization: Organization | null, onSelect?: () => void) => void;
    addOrganization: (organization: Organization) => void;
    isLoaded: boolean;
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

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // In a real app, you would fetch organizations from an API.
        // Here, we'll use sample data and local storage for persistence.
        const storedOrgs = localStorage.getItem('organizations');
        const orgs = storedOrgs ? JSON.parse(storedOrgs) : sampleOrganizations;
        setOrganizations(orgs);
        
        if (orgs.length > 0) {
            const storedSelectedOrgId = localStorage.getItem('selectedOrganizationId');
            if (storedSelectedOrgId) {
                const org = orgs.find((o: Organization) => o.id === storedSelectedOrgId) || orgs[0];
                 setSelectedOrganization(org);
            } else {
                // By default, do not select any organization. Let user choose.
                setSelectedOrganization(null);
            }
        }
        setIsLoaded(true);
    }, []);

    const selectOrganization = (organization: Organization | null, onSelect?: () => void) => {
        setSelectedOrganization(organization);
        if (organization) {
            localStorage.setItem('selectedOrganizationId', organization.id);
        } else {
            localStorage.removeItem('selectedOrganizationId');
        }
        if (onSelect) {
            onSelect();
        }
    };
    
    const addOrganization = (organization: Organization) => {
        const newOrgs = [...organizations, organization];
        setOrganizations(newOrgs);
        localStorage.setItem('organizations', JSON.stringify(newOrgs));
        selectOrganization(organization); // Auto-select the new organization
    }

    return (
        <OrganizationContext.Provider value={{ organizations, selectedOrganization, selectOrganization, addOrganization, isLoaded }}>
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
