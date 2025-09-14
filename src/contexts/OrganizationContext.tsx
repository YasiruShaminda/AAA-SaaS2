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
    password: string;
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
    addDefaultDataForNewOrg: (organization?: Organization) => Promise<void>;
    getProjectsForGroup: (groupName: string) => Project[];
    getSubscriberCountForGroup: (groupId: number) => number;
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
                // Ensure orgs is an array, fallback to empty array if not
                const organizationsArray = Array.isArray(orgs) ? orgs : [];
                setOrganizations(organizationsArray);
                // For now, keep the selection logic simple.
                // We can improve this later to remember the last selection.
                if (organizationsArray.length > 0) {
                    setSelectedOrganization(organizationsArray[0]);
                } else {
                    setSelectedOrganization(null);
                }
            } catch (error) {
                console.error("Failed to load organizations:", error);
                // On error, set to empty array to prevent undefined states
                setOrganizations([]);
                setSelectedOrganization(null);
            }
        } else {
            // If no user, clear organizations
            setOrganizations([]);
            setSelectedOrganization(null);
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
                
                // Initialize with empty arrays to prevent undefined states
                setSubscribers([]);
                setProducts([]);
                setGroups([]);
                setProjects([]);
                
                try {
                    // Load data types that are likely to exist and handle individual failures
                    console.log(`Loading data for organization: ${selectedOrganization.id}`);
                    
                    // Try to load subscribers first as it's most likely to exist
                    try {
                        const subscribersData = await api.getSubscribers(selectedOrganization.id);
                        setSubscribers(Array.isArray(subscribersData) ? subscribersData : []);
                    } catch (error) {
                        console.warn("Failed to load subscribers:", error);
                    }
                    
                    // Try other endpoints individually
                    try {
                        const productsData = await api.getProducts(selectedOrganization.id);
                        setProducts(Array.isArray(productsData) ? productsData : []);
                    } catch (error) {
                        console.warn("Failed to load products:", error);
                    }
                    
                    try {
                        const groupsData = await api.getGroups(selectedOrganization.id);
                        setGroups(Array.isArray(groupsData) ? groupsData : []);
                    } catch (error) {
                        console.warn("Failed to load groups:", error);
                    }
                    
                    try {
                        const projectsData = await api.getProjects(selectedOrganization.id);
                        setProjects(Array.isArray(projectsData) ? projectsData : []);
                    } catch (error) {
                        console.warn("Failed to load projects:", error);
                    }
                    
                } catch (error) {
                    console.error("Failed to load organization data:", error);
                } finally {
                    setIsOrgDataLoaded(true);
                }
            } else {
                // Clear data when no organization is selected
                setSubscribers([]);
                setProducts([]);
                setGroups([]);
                setProjects([]);
                setIsOrgDataLoaded(true);
            }
        };
        loadOrgData();
    }, [selectedOrganization]);


    const selectOrganization = (organization: Organization | null, onSelect?: () => void) => {
        setSelectedOrganization(organization);
        // We can re-add localStorage persistence for the selected org if needed
        if (onSelect) {
            // Give a small delay to ensure state updates complete
            setTimeout(onSelect, 100);
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

    const addDefaultDataForNewOrg = async (organization?: Organization) => {
        const targetOrg = organization || selectedOrganization;
        if (!targetOrg) {
            console.error('No organization provided for default data creation');
            return;
        }
        
        try {
            console.log('Creating default data for new organization:', targetOrg.name, 'ID:', targetOrg.id);
            
            // Create default data with individual error handling in proper sequence
            let defaultGroup: Group | null = null;
            let defaultProduct: Product | null = null;
            let defaultSubscriber: Subscriber | null = null;
            let defaultProject: Project | null = null;
            
            // Step 1: Create default group first
            try {
                console.log('Creating default group...');
                const groupData = {
                    name: 'Default Group',
                    description: 'Default subscriber group for new organization'
                };
                console.log('Group data to send:', groupData);
                
                defaultGroup = await api.createGroup(targetOrg.id, groupData);
                if (defaultGroup) {
                    setGroups(prev => [...prev, defaultGroup!]);
                    console.log('Default group created successfully:', defaultGroup);
                } else {
                    console.error('Group creation returned null/undefined');
                }
            } catch (error) {
                console.error('Failed to create default group:', error);
                console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
            }
            
            // Step 2: Create default product
            try {
                console.log('Creating default product...');
                const productData = {
                    name: 'Default Plan',
                    bandwidthUp: '10 Mbps',
                    bandwidthDown: '50 Mbps',
                    sessionLimit: '1',
                    subscribers: 0
                };
                console.log('Product data to send:', productData);
                
                defaultProduct = await api.createProduct(targetOrg.id, productData);
                if (defaultProduct) {
                    setProducts(prev => [...prev, defaultProduct!]);
                    console.log('Default product created successfully:', defaultProduct);
                } else {
                    console.error('Product creation returned null/undefined');
                }
            } catch (error) {
                console.error('Failed to create default product:', error);
                console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
            }
            
            // Step 3: Create default subscriber (bind to default group and product)
            if (defaultGroup && defaultProduct) {
                try {
                    const subscriberData = {
                        username: 'demo-user',
                        password: 'demo123',
                        fullname: 'Demo User',
                        product_id: Number(defaultProduct.id),
                        group_id: Number(defaultGroup.id)
                    };
                    
                    defaultSubscriber = await api.createSubscriber(targetOrg.id, subscriberData);
                    if (defaultSubscriber) {
                        setSubscribers(prev => [...prev, defaultSubscriber!]);
                        console.log('Default subscriber created successfully');
                    } else {
                        console.error('Subscriber creation returned null/undefined');
                    }
                } catch (error) {
                    console.error('Failed to create default subscriber:', error);
                }
            } else {
                console.warn('Skipping subscriber creation because default group or product was not created');
            }
            
            // Step 4: Create default project (assign the group to subscriber groups)
            if (defaultGroup) {
                try {
                    console.log('Creating default project with subscriber group:', defaultGroup.name);
                    const projectData = {
                        name: 'My First AAA Project',
                        description: 'Welcome to your first AAA authentication project! This project helps you get started with RADIUS authentication.',
                        status: 'Draft' as const,
                        sharedSecret: 'testing123',
                        subscriberGroups: [defaultGroup.name]
                    };
                    console.log('Project data to send:', projectData);
                    
                    defaultProject = await api.createProject(targetOrg.id, projectData);
                    if (defaultProject) {
                        setProjects(prev => [...prev, defaultProject!]);
                        console.log('Default project created successfully:', defaultProject);
                    } else {
                        console.error('Project creation returned null/undefined');
                    }
                } catch (error) {
                    console.error('Failed to create default project:', error);
                    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
                }
            } else {
                console.warn('Skipping project creation because default group was not created');
            }
            
            console.log('Default data creation process completed');
            console.log('Summary - Group:', !!defaultGroup, 'Product:', !!defaultProduct, 'Subscriber:', !!defaultSubscriber, 'Project:', !!defaultProject);
            
        } catch (error) {
            console.error('Failed to create default data - outer catch:', error);
            console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        }
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

    const getProjectsForGroup = (groupName: string): Project[] => {
        return projects.filter(project => 
            project.subscriberGroups && project.subscriberGroups.includes(groupName)
        );
    };

    const getSubscriberCountForGroup = (groupId: number): number => {
        return subscribers.filter(subscriber => subscriber.group_id === groupId).length;
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
            addDefaultDataForNewOrg,
            getProjectsForGroup,
            getSubscriberCountForGroup
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
