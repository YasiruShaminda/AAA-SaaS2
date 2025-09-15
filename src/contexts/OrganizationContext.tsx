'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as api from '@/lib/api';

// Project Data Type - Extended to support both API and UI requirements
export type Project = {
    // API fields from database
    id: number;
    organization_id: number;
    name: string;
    description: string;
    auth_enabled: number;
    acct_enabled: number;
    created_at: string;
    updated_at: string;
    
    // UI fields for project editor (required with defaults)
    status: 'Active' | 'Draft';
    createdAt: string;
    sharedSecret: string;
    subscriberGroups: string[];
    profile: ProjectProfile;
};

// Project profile type for RADIUS configuration
export type ProjectProfile = {
    authEnabled: boolean;
    acctEnabled: boolean;
    checkAttributes: string[];
    replyAttributes: string[];
    vendorAttributes: string[];
    accountingAttributes: string[];
};

// Adapter function to convert API project to UI project with defaults
export const adaptApiProjectToUI = (apiProject: any): Project => {
    return {
        // Map API fields
        id: apiProject.id,
        organization_id: apiProject.organization_id,
        name: apiProject.name,
        description: apiProject.description,
        auth_enabled: apiProject.auth_enabled,
        acct_enabled: apiProject.acct_enabled,
        created_at: apiProject.created_at,
        updated_at: apiProject.updated_at,
        
        // Add UI defaults
        status: apiProject.auth_enabled ? 'Active' : 'Draft',
        createdAt: apiProject.created_at,
        sharedSecret: 'shared-secret-' + Math.random().toString(36).substring(2),
        subscriberGroups: [],
        profile: {
            authEnabled: Boolean(apiProject.auth_enabled),
            acctEnabled: Boolean(apiProject.acct_enabled),
            checkAttributes: [],
            replyAttributes: [],
            vendorAttributes: [],
            accountingAttributes: []
        }
    };
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
    deleteSubscriber: (subscriberId: number) => Promise<{ success: boolean; error?: string }>;
    products: Product[];
    addProduct: (product: Partial<Product>) => Promise<Product | null>;
    updateProduct: (product: Product) => Promise<Product | null>;
    deleteProduct: (productId: number) => Promise<{ success: boolean; error?: string }>;
    groups: Group[];
    addGroup: (group: Partial<Group>) => Promise<Group | null>;
    updateGroup: (group: Group) => Promise<Group | null>;
    deleteGroup: (groupId: number) => Promise<{ success: boolean; error?: string }>;
    profiles: Profile[];
    projects: Project[];
    addProject: (project: Partial<Project>) => Promise<Project | null>;
    updateProject: (project: Project) => Promise<Project | null>;
    deleteProject: (projectId: number) => Promise<{ success: boolean; error?: string }>;
    addDefaultDataForNewOrg: (organization?: Organization) => Promise<void>;
    getProjectsForGroup: (groupName: string) => Project[];
    getSubscriberCountForGroup: (groupId: number) => number;
    refreshOrganizationData: () => Promise<void>;
    getProductNameById: (productId: number | null | undefined) => string;
    getGroupNameById: (groupId: number | null | undefined) => string;
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

    // Debug: Monitor state changes
    useEffect(() => {
        console.log('Subscribers state changed:', subscribers.length, subscribers);
    }, [subscribers]);

    useEffect(() => {
        console.log('Products state changed:', products.length, products);
    }, [products]);

    useEffect(() => {
        console.log('Groups state changed:', groups.length, groups);
    }, [groups]);


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
                        console.log('Raw subscribers API response:', subscribersData);
                        console.log('Type of subscribers data:', typeof subscribersData);
                        console.log('Is array:', Array.isArray(subscribersData));
                        
                        // Handle various response formats
                        let processedSubscribers: Subscriber[] = [];
                        if (Array.isArray(subscribersData)) {
                            processedSubscribers = subscribersData;
                        } else if (subscribersData && typeof subscribersData === 'object') {
                            const data = subscribersData as any;
                            if (data.data && Array.isArray(data.data)) {
                                processedSubscribers = data.data;
                            } else if (data.subscribers && Array.isArray(data.subscribers)) {
                                processedSubscribers = data.subscribers;
                            } else {
                                console.warn('Unexpected subscribers data format:', subscribersData);
                            }
                        } else {
                            console.warn('Unexpected subscribers data format:', subscribersData);
                        }
                        
                        console.log('Processed subscribers:', processedSubscribers);
                        console.log('Processed subscribers length:', processedSubscribers.length);
                        
                        // Validate each subscriber has required fields
                        const validSubscribers = processedSubscribers.filter(sub => 
                            sub && typeof sub === 'object' && sub.id !== undefined
                        );
                        
                        console.log('Valid subscribers after filtering:', validSubscribers.length);
                        if (validSubscribers.length !== processedSubscribers.length) {
                            console.warn('Some subscribers were filtered out due to missing required fields');
                        }
                        
                        setSubscribers(validSubscribers);
                        console.log('Subscribers set to state:', validSubscribers);
                    } catch (error) {
                        console.warn("Failed to load subscribers:", error);
                        setSubscribers([]);
                    }
                    
                    // Try other endpoints individually
                    try {
                        const productsData = await api.getProducts(selectedOrganization.id);
                        console.log('Raw products API response:', productsData);
                        
                        // Handle various response formats
                        let processedProducts: Product[] = [];
                        if (Array.isArray(productsData)) {
                            processedProducts = productsData;
                        } else if (productsData && typeof productsData === 'object') {
                            const data = productsData as any;
                            if (data.data && Array.isArray(data.data)) {
                                processedProducts = data.data;
                            } else if (data.products && Array.isArray(data.products)) {
                                processedProducts = data.products;
                            } else {
                                console.warn('Unexpected products data format:', productsData);
                            }
                        }
                        
                        const validProducts = processedProducts.filter(prod => 
                            prod && typeof prod === 'object' && prod.id !== undefined
                        );
                        
                        setProducts(validProducts);
                        console.log('Products set to state:', validProducts);
                    } catch (error) {
                        console.warn("Failed to load products:", error);
                        setProducts([]);
                    }
                    
                    try {
                        const groupsData = await api.getGroups(selectedOrganization.id);
                        console.log('Raw groups API response:', groupsData);
                        
                        // Handle various response formats
                        let processedGroups: Group[] = [];
                        if (Array.isArray(groupsData)) {
                            processedGroups = groupsData;
                        } else if (groupsData && typeof groupsData === 'object') {
                            const data = groupsData as any;
                            if (data.data && Array.isArray(data.data)) {
                                processedGroups = data.data;
                            } else if (data.groups && Array.isArray(data.groups)) {
                                processedGroups = data.groups;
                            } else {
                                console.warn('Unexpected groups data format:', groupsData);
                            }
                        }
                        
                        const validGroups = processedGroups.filter(group => 
                            group && typeof group === 'object' && group.id !== undefined
                        );
                        
                        setGroups(validGroups);
                        console.log('Groups set to state:', validGroups);
                    } catch (error) {
                        console.warn("Failed to load groups:", error);
                        setGroups([]);
                    }
                    
                    try {
                        const projectsData = await api.getProjects(selectedOrganization.id);
                        console.log('Raw projects API response:', projectsData);
                        
                        // Handle various response formats
                        let processedProjects: Project[] = [];
                        if (Array.isArray(projectsData)) {
                            processedProjects = projectsData;
                        } else if (projectsData && typeof projectsData === 'object') {
                            const data = projectsData as any;
                            if (data.data && Array.isArray(data.data)) {
                                processedProjects = data.data;
                            } else if (data.projects && Array.isArray(data.projects)) {
                                processedProjects = data.projects;
                            } else {
                                console.warn('Unexpected projects data format:', projectsData);
                            }
                        }
                        
                        const validProjects = processedProjects.filter(project => 
                            project && typeof project === 'object' && project.id !== undefined
                        ).map(adaptApiProjectToUI);
                        
                        setProjects(validProjects);
                        console.log('Projects set to state:', validProjects);
                    } catch (error) {
                        console.warn("Failed to load projects:", error);
                        setProjects([]);
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
                // Convert UI project data to API format
                const apiProjectData = {
                    name: project.name || 'New Project',
                    description: project.description || '',
                    auth_enabled: project.profile?.authEnabled ? 1 : (project.auth_enabled ?? 1),
                    acct_enabled: project.profile?.acctEnabled ? 1 : (project.acct_enabled ?? 0)
                };
                
                const apiProject = await api.createProject(selectedOrganization.id, apiProjectData);
                const uiProject = adaptApiProjectToUI(apiProject);
                
                // Apply any additional UI fields from the input
                if (project.sharedSecret) uiProject.sharedSecret = project.sharedSecret;
                if (project.subscriberGroups) uiProject.subscriberGroups = project.subscriberGroups;
                if (project.profile) uiProject.profile = { ...uiProject.profile, ...project.profile };
                
                setProjects(prev => [...prev, uiProject]);
                return uiProject;
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
                // Convert UI project data to API format for the API call
                const apiProjectData = {
                    name: project.name,
                    description: project.description,
                    auth_enabled: project.profile.authEnabled ? 1 : project.auth_enabled,
                    acct_enabled: project.profile.acctEnabled ? 1 : project.acct_enabled
                };
                
                const updatedApiProject = await api.updateProject(selectedOrganization.id, project.id, apiProjectData);
                const updatedUiProject = adaptApiProjectToUI(updatedApiProject);
                
                // Preserve UI-specific fields
                updatedUiProject.sharedSecret = project.sharedSecret;
                updatedUiProject.subscriberGroups = project.subscriberGroups;
                updatedUiProject.profile = project.profile;
                
                setProjects(prev => prev.map(p => p.id === updatedUiProject.id ? updatedUiProject : p));
                return updatedUiProject;
            } catch (error) {
                console.error("Failed to update project:", error);
                return null;
            }
        }
        return null;
    };

    const deleteProject = async (projectId: number): Promise<{ success: boolean; error?: string }> => {
        if (selectedOrganization) {
            try {
                await api.deleteProject(selectedOrganization.id, projectId);
                setProjects(prev => prev.filter(p => p.id !== projectId));
                console.log(`Project ${projectId} deleted successfully`);
                return { success: true };
            } catch (error) {
                console.error("Failed to delete project:", error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
                return { success: false, error: errorMessage };
            }
        }
        return { success: false, error: 'No organization selected' };
    };

    const addSubscriber = async (subscriber: Partial<Subscriber>): Promise<Subscriber | null> => {
        if (selectedOrganization) {
            try {
                console.log('Creating subscriber with data:', subscriber);
                const newSubscriber = await api.createSubscriber(selectedOrganization.id, subscriber);
                console.log('Subscriber created by API:', newSubscriber);
                
                // Validate the created subscriber
                if (newSubscriber && typeof newSubscriber === 'object' && newSubscriber.id !== undefined) {
                    setSubscribers(prev => {
                        const updated = [...prev, newSubscriber];
                        console.log('Updated subscribers state:', updated);
                        return updated;
                    });
                    
                    console.log('Subscriber added to state successfully');
                    return newSubscriber;
                } else {
                    console.error('Invalid subscriber data returned from API:', newSubscriber);
                    return null;
                }
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

    const deleteSubscriber = async (subscriberId: number): Promise<{ success: boolean; error?: string }> => {
        if (selectedOrganization) {
            try {
                await api.deleteSubscriber(selectedOrganization.id, subscriberId);
                setSubscribers(prev => prev.filter(s => s.id !== subscriberId));
                return { success: true };
            } catch (error) {
                console.error("Failed to delete subscriber:", error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete subscriber';
                return { success: false, error: errorMessage };
            }
        }
        return { success: false, error: 'No organization selected' };
    };

    const addProduct = async (product: Partial<Product>): Promise<Product | null> => {
        if (selectedOrganization) {
            try {
                console.log('Creating product with data:', product);
                const newProduct = await api.createProduct(selectedOrganization.id, product);
                console.log('Product created by API:', newProduct);
                
                // Validate the created product
                if (newProduct && typeof newProduct === 'object' && newProduct.id !== undefined) {
                    setProducts(prev => {
                        const updated = [...prev, newProduct];
                        console.log('Updated products state:', updated);
                        return updated;
                    });
                    
                    console.log('Product added to state successfully');
                    return newProduct;
                } else {
                    console.error('Invalid product data returned from API:', newProduct);
                    return null;
                }
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

    const deleteProduct = async (productId: number): Promise<{ success: boolean; error?: string }> => {
        if (selectedOrganization) {
            try {
                await api.deleteProduct(selectedOrganization.id, productId);
                setProducts(prev => prev.filter(p => p.id !== productId));
                return { success: true };
            } catch (error) {
                console.error("Failed to delete product:", error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
                return { success: false, error: errorMessage };
            }
        }
        return { success: false, error: 'No organization selected' };
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

    const deleteGroup = async (groupId: number): Promise<{ success: boolean; error?: string }> => {
        if (selectedOrganization) {
            try {
                await api.deleteGroup(selectedOrganization.id, groupId);
                setGroups(prev => prev.filter(g => g.id !== groupId));
                return { success: true };
            } catch (error) {
                console.error("Failed to delete group:", error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete group';
                return { success: false, error: errorMessage };
            }
        }
        return { success: false, error: 'No organization selected' };
    };

    const getProjectsForGroup = (groupName: string): Project[] => {
        // Note: Current Project type doesn't include subscriberGroups relationship
        // This function may need to be updated based on actual API relationships
        return [];
    };

    const getSubscriberCountForGroup = (groupId: number): number => {
        console.log(`Getting subscriber count for group ${groupId}`);
        console.log(`All subscribers available:`, subscribers.length);
        console.log(`Subscribers data:`, subscribers.map(s => ({ 
            id: s.id, 
            username: s.username, 
            group_id: s.group_id,
            group_id_type: typeof s.group_id 
        })));
        console.log(`Looking for group_id:`, groupId, 'type:', typeof groupId);
        
        const matching = subscribers.filter(subscriber => {
            const match = subscriber.group_id === groupId;
            console.log(`Subscriber ${subscriber.username} (group_id: ${subscriber.group_id}) matches group ${groupId}:`, match);
            return match;
        });
        
        console.log(`Found ${matching.length} subscribers for group ${groupId}`);
        return matching.length;
    };

    const getProductNameById = (productId: number | null | undefined): string => {
        console.log(`Getting product name for ID: ${productId}`);
        console.log(`Available products:`, products.map(p => ({ id: p.id, name: p.name })));
        
        if (!productId) {
            console.log(`No product ID provided`);
            return '';
        }
        
        const product = products.find(p => p.id === productId);
        const name = product?.name || '';
        console.log(`Found product name: "${name}" for ID ${productId}`);
        return name;
    };

    const getGroupNameById = (groupId: number | null | undefined): string => {
        console.log(`Getting group name for ID: ${groupId}`);
        console.log(`Available groups:`, groups.map(g => ({ id: g.id, name: g.name })));
        
        if (!groupId) {
            console.log(`No group ID provided`);
            return '';
        }
        
        const group = groups.find(g => g.id === groupId);
        const name = group?.name || '';
        console.log(`Found group name: "${name}" for ID ${groupId}`);
        return name;
    };

    const refreshOrganizationData = async () => {
        if (selectedOrganization) {
            console.log('Manually refreshing organization data...');
            setIsOrgDataLoaded(false);
            
            // Clear existing data
            setSubscribers([]);
            setProducts([]);
            setGroups([]);
            setProjects([]);
            
            try {
                // Load all data fresh from API
                console.log(`Refreshing data for organization: ${selectedOrganization.id}`);
                
                try {
                    const subscribersData = await api.getSubscribers(selectedOrganization.id);
                    console.log('Refreshed subscribers API response:', subscribersData);
                    
                    // Handle various response formats
                    let processedSubscribers: Subscriber[] = [];
                    if (Array.isArray(subscribersData)) {
                        processedSubscribers = subscribersData;
                    } else if (subscribersData && typeof subscribersData === 'object') {
                        const data = subscribersData as any;
                        if (data.data && Array.isArray(data.data)) {
                            processedSubscribers = data.data;
                        } else if (data.subscribers && Array.isArray(data.subscribers)) {
                            processedSubscribers = data.subscribers;
                        }
                    }
                    
                    const validSubscribers = processedSubscribers.filter(sub => 
                        sub && typeof sub === 'object' && sub.id !== undefined
                    );
                    
                    setSubscribers(validSubscribers);
                } catch (error) {
                    console.warn("Failed to refresh subscribers:", error);
                }
                
                try {
                    const productsData = await api.getProducts(selectedOrganization.id);
                    console.log('Refreshed products API response:', productsData);
                    
                    // Handle various response formats
                    let processedProducts: Product[] = [];
                    if (Array.isArray(productsData)) {
                        processedProducts = productsData;
                    } else if (productsData && typeof productsData === 'object') {
                        const data = productsData as any;
                        if (data.data && Array.isArray(data.data)) {
                            processedProducts = data.data;
                        } else if (data.products && Array.isArray(data.products)) {
                            processedProducts = data.products;
                        }
                    }
                    
                    const validProducts = processedProducts.filter(prod => 
                        prod && typeof prod === 'object' && prod.id !== undefined
                    );
                    
                    setProducts(validProducts);
                } catch (error) {
                    console.warn("Failed to refresh products:", error);
                }
                
                try {
                    const groupsData = await api.getGroups(selectedOrganization.id);
                    console.log('Refreshed groups API response:', groupsData);
                    
                    // Handle various response formats
                    let processedGroups: Group[] = [];
                    if (Array.isArray(groupsData)) {
                        processedGroups = groupsData;
                    } else if (groupsData && typeof groupsData === 'object') {
                        const data = groupsData as any;
                        if (data.data && Array.isArray(data.data)) {
                            processedGroups = data.data;
                        } else if (data.groups && Array.isArray(data.groups)) {
                            processedGroups = data.groups;
                        }
                    }
                    
                    const validGroups = processedGroups.filter(group => 
                        group && typeof group === 'object' && group.id !== undefined
                    );
                    
                    setGroups(validGroups);
                } catch (error) {
                    console.warn("Failed to refresh groups:", error);
                }
                
                try {
                    const projectsData = await api.getProjects(selectedOrganization.id);
                    console.log('Refreshed projects API response:', projectsData);
                    setProjects(Array.isArray(projectsData) ? projectsData : []);
                } catch (error) {
                    console.warn("Failed to refresh projects:", error);
                }
                
            } catch (error) {
                console.error("Failed to refresh organization data:", error);
            } finally {
                setIsOrgDataLoaded(true);
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
            addDefaultDataForNewOrg,
            getProjectsForGroup,
            getSubscriberCountForGroup,
            refreshOrganizationData,
            getProductNameById,
            getGroupNameById
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
