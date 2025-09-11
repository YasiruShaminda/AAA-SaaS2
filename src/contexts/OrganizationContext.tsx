'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as api from '@/lib/api';

// New Project Data Type - Moved from projects/page.tsx
export type Project = {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Draft';
    createdAt: string;
    sharedSecret: string;
    subscriberGroups: string[];
    profile: Profile;
};

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
    product_id: number;
    group_id: number;
};

export type Product = {
    id: number;
    name: string;
    bandwidthUp: string;
    bandwidthDown: string;
    sessionLimit: string;
    subscribers: number;
};

export type Group = {
    id: number;
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
    isOrgDataLoaded: boolean;
    selectOrganization: (organization: Organization | null, onSelect?: () => void) => void;
    addOrganization: (organization: Organization, shouldAutoSelect?: boolean) => Promise<Organization | null>;
    deleteOrganization: (orgId: string) => void;
    subscribers: Subscriber[];
    addSubscriber: (subscriber: Partial<Subscriber>) => Promise<Subscriber | null>;
    updateSubscriber: (subscriber: Subscriber) => Promise<Subscriber | null>;
    deleteSubscriber: (subscriberId: number) => Promise<void>;
    products: Product[];
    addProduct: (product: Partial<Product>) => Promise<Product | null>;
    updateProduct: (product: Product) => Promise<Product | null>;
    deleteProduct: (productId: number) => Promise<void>;
    groups: Group[];
    addGroup: (group: Partial<Group>) => Promise<Group | null>;
    updateGroup: (group: Group) => Promise<Group | null>;
    deleteGroup: (groupId: number) => Promise<void>;
    profiles: Profile[];
    projects: Project[];
    addProject: (project: Partial<Project>) => Promise<Project | null>;
    updateProject: (project: Project) => Promise<Project | null>;
    deleteProject: (projectId: string) => Promise<void>;
    addDefaultDataForNewOrg: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isOrgDataLoaded, setIsOrgDataLoaded] = useState(false);
    
    // Data states
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);


    const loadOrganizations = useCallback(async () => {
        if (user) {
            try {
                const orgs = await api.getOrganizations(user.id);
                setOrganizations(orgs);
                // For now, keep the selection logic simple.
                // We can improve this later to remember the last selection.
                if (orgs.length > 0) {
                    setSelectedOrganization(orgs[0]);
                } else {
                    setSelectedOrganization(null);
                }
            } catch (error) {
                console.error("Failed to load organizations:", error);
                // Handle error appropriately, e.g., show a toast notification
            }
        }
        setIsLoaded(true);
    }, [user]);

    useEffect(() => {
        loadOrganizations();
    }, [loadOrganizations]);

    useEffect(() => {
        const loadOrgData = async () => {
            if (selectedOrganization) {
                setIsOrgDataLoaded(false);
                try {
                    const [subscribersData, productsData, groupsData, projectsData] = await Promise.all([
                        api.getSubscribers(selectedOrganization.id),
                        api.getProducts(selectedOrganization.id),
                        api.getGroups(selectedOrganization.id),
                        api.getProjects(selectedOrganization.id)
                    ]);
                    setSubscribers(subscribersData);
                    setProducts(productsData);
                    setGroups(groupsData);
                    setProjects(projectsData);
                } catch (error) {
                    console.error("Failed to load organization data:", error);
                } finally {
                    setIsOrgDataLoaded(true);
                }
            }
        };
        loadOrgData();
    }, [selectedOrganization]);


    const selectOrganization = (organization: Organization | null, onSelect?: () => void) => {
        setSelectedOrganization(organization);
        // We can re-add localStorage persistence for the selected org if needed
        if (onSelect) {
            setTimeout(onSelect, 0);
        }
    };
    
    const addOrganization = async (organization: Organization, shouldAutoSelect = true): Promise<Organization | null> => {
        if (user) {
            try {
                const newOrgData = { name: organization.name, description: organization.description, owner_id: user.id };
                const newOrg = await api.createOrganization(newOrgData);
                setOrganizations(prev => [...prev, newOrg]);
                if (shouldAutoSelect) {
                    selectOrganization(newOrg);
                }
                return newOrg;
            } catch (error) {
                 console.error("Failed to create organization:", error);
                 // Handle error appropriately
                 return null;
            }
        }
        return null;
    };
    
    const deleteOrganization = async (orgId: string) => {
        if (selectedOrganization?.id === orgId) {
            selectOrganization(null);
        }
        try {
            await api.deleteOrganization(orgId);
            setOrganizations(prev => prev.filter(o => o.id !== orgId));
        } catch (error) {
            console.error("Failed to delete organization:", error);
        }
    };

    const addDefaultDataForNewOrg = () => {
        // This function might need to be re-evaluated.
        // Should default data be created on the backend when a new org is created?
        // Or should we make a series of API calls to create it here?
        // For now, this is left as is.
    };

    const addProject = async (project: Partial<Project>): Promise<Project | null> => {
        if (selectedOrganization) {
            try {
                const newProject = await api.createProject(selectedOrganization.id, project);
                setProjects(prev => [...prev, newProject]);
                return newProject;
            } catch (error) {
                console.error("Failed to create project:", error);
                return null;
            }
        }
        return null;
    };

    const updateProject = async (project: Project): Promise<Project | null> => {
        if (selectedOrganization) {
            try {
                const updatedProject = await api.updateProject(selectedOrganization.id, project.id, project);
                setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
                return updatedProject;
            } catch (error) {
                console.error("Failed to update project:", error);
                return null;
            }
        }
        return null;
    };

    const deleteProject = async (projectId: string) => {
        if (selectedOrganization) {
            try {
                await api.deleteProject(selectedOrganization.id, projectId);
                setProjects(prev => prev.filter(p => p.id !== projectId));
            } catch (error) {
                console.error("Failed to delete project:", error);
            }
        }
    };

    const addSubscriber = async (subscriber: Partial<Subscriber>): Promise<Subscriber | null> => {
        if (selectedOrganization) {
            try {
                const newSubscriber = await api.createSubscriber(selectedOrganization.id, subscriber);
                setSubscribers(prev => [...prev, newSubscriber]);
                return newSubscriber;
            } catch (error) {
                console.error("Failed to create subscriber:", error);
                return null;
            }
        }
        return null;
    };

    const updateSubscriber = async (subscriber: Subscriber): Promise<Subscriber | null> => {
        if (selectedOrganization) {
            try {
                const updatedSubscriber = await api.updateSubscriber(selectedOrganization.id, subscriber.id, subscriber);
                setSubscribers(prev => prev.map(s => s.id === updatedSubscriber.id ? updatedSubscriber : s));
                return updatedSubscriber;
            } catch (error) {
                console.error("Failed to update subscriber:", error);
                return null;
            }
        }
        return null;
    };

    const deleteSubscriber = async (subscriberId: number) => {
        if (selectedOrganization) {
            try {
                await api.deleteSubscriber(selectedOrganization.id, subscriberId);
                setSubscribers(prev => prev.filter(s => s.id !== subscriberId));
            } catch (error) {
                console.error("Failed to delete subscriber:", error);
            }
        }
    };

    const addProduct = async (product: Partial<Product>): Promise<Product | null> => {
        if (selectedOrganization) {
            try {
                const newProduct = await api.createProduct(selectedOrganization.id, product);
                setProducts(prev => [...prev, newProduct]);
                return newProduct;
            } catch (error) {
                console.error("Failed to create product:", error);
                return null;
            }
        }
        return null;
    };

    const updateProduct = async (product: Product): Promise<Product | null> => {
        if (selectedOrganization) {
            try {
                const updatedProduct = await api.updateProduct(selectedOrganization.id, product.id, product);
                setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
                return updatedProduct;
            } catch (error) {
                console.error("Failed to update product:", error);
                return null;
            }
        }
        return null;
    };

    const deleteProduct = async (productId: number) => {
        if (selectedOrganization) {
            try {
                await api.deleteProduct(selectedOrganization.id, productId);
                setProducts(prev => prev.filter(p => p.id !== productId));
            } catch (error) {
                console.error("Failed to delete product:", error);
            }
        }
    };

    const addGroup = async (group: Partial<Group>): Promise<Group | null> => {
        if (selectedOrganization) {
            try {
                const newGroup = await api.createGroup(selectedOrganization.id, group);
                setGroups(prev => [...prev, newGroup]);
                return newGroup;
            } catch (error) {
                console.error("Failed to create group:", error);
                return null;
            }
        }
        return null;
    };

    const updateGroup = async (group: Group): Promise<Group | null> => {
        if (selectedOrganization) {
            try {
                const updatedGroup = await api.updateGroup(selectedOrganization.id, group.id, group);
                setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
                return updatedGroup;
            } catch (error) {
                console.error("Failed to update group:", error);
                return null;
            }
        }
        return null;
    };

    const deleteGroup = async (groupId: number) => {
        if (selectedOrganization) {
            try {
                await api.deleteGroup(selectedOrganization.id, groupId);
                setGroups(prev => prev.filter(g => g.id !== groupId));
            } catch (error) {
                console.error("Failed to delete group:", error);
            }
        }
    };

    return (
        <OrganizationContext.Provider value={{ 
            organizations, selectedOrganization, selectOrganization, addOrganization, deleteOrganization, isLoaded, isOrgDataLoaded,
            subscribers, addSubscriber, updateSubscriber, deleteSubscriber,
            products, addProduct, updateProduct, deleteProduct,
            groups, addGroup, updateGroup, deleteGroup,
            profiles,
            projects,
            addProject, updateProject, deleteProject,
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
