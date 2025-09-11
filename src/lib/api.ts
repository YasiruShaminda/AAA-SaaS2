import { Organization, Subscriber, Product, Group, Project } from '@/contexts/OrganizationContext';

const API_BASE_URL = 'http://54.205.5.145:3500/v1';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  const data = await response.json();
  return data.data as T;
}

// Authentication
export const login = (credentials: any) =>
  request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
export const register = (userInfo: any) =>
  request<any>('/user/register', {
    method: 'POST',
    body: JSON.stringify(userInfo),
  });
export const getAuthenticatedUser = () => request<any>('/auth/user');

// Organizations
export const getOrganizations = (ownerId: number) =>
  request<Organization[]>(`/aaa/organizations?owner_id=${ownerId}`);

export type CreateOrganizationDto = {
  name: string;
  description?: string;
  owner_id: number;
};

export const createOrganization = (orgData: CreateOrganizationDto) =>
  request<Organization>('/aaa/organizations', {
    method: 'POST',
    body: JSON.stringify(orgData),
  });

export const deleteOrganization = (orgId: string) =>
    request<any>(`/aaa/organizations/${orgId}/delete`, {
        method: 'DELETE',
    });

// Subscribers
export const getSubscribers = (orgId: string) =>
    request<Subscriber[]>(`/aaa/${orgId}/subscribers`);

export const createSubscriber = (orgId: string, subscriberData: Partial<Subscriber>) =>
    request<Subscriber>(`/aaa/${orgId}/subscribers`, {
        method: 'POST',
        body: JSON.stringify(subscriberData),
    });

export const updateSubscriber = (orgId: string, subscriberId: number, subscriberData: Partial<Subscriber>) =>
    request<Subscriber>(`/aaa/${orgId}/subscribers/${subscriberId}`, {
        method: 'PUT',
        body: JSON.stringify(subscriberData),
    });

export const deleteSubscriber = (orgId: string, subscriberId: number) =>
    request<any>(`/aaa/${orgId}/subscribers/${subscriberId}`, {
        method: 'DELETE',
    });

// Products
export const getProducts = (orgId: string) =>
    request<Product[]>(`/aaa/${orgId}/products`);

export const createProduct = (orgId: string, productData: Partial<Product>) =>
    request<Product>(`/aaa/${orgId}/products`, {
        method: 'POST',
        body: JSON.stringify(productData),
    });

export const updateProduct = (orgId: string, productId: number, productData: Partial<Product>) =>
    request<Product>(`/aaa/${orgId}/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify(productData),
    });

export const deleteProduct = (orgId: string, productId: number) =>
    request<any>(`/aaa/${orgId}/products/${productId}`, {
        method: 'DELETE',
    });

// Groups
export const getGroups = (orgId: string) =>
    request<Group[]>(`/aaa/${orgId}/groups`);

export const createGroup = (orgId: string, groupData: Partial<Group>) =>
    request<Group>(`/aaa/${orgId}/groups`, {
        method: 'POST',
        body: JSON.stringify(groupData),
    });

export const updateGroup = (orgId: string, groupId: number, groupData: Partial<Group>) =>
    request<Group>(`/aaa/${orgId}/groups/${groupId}`, {
        method: 'PATCH',
        body: JSON.stringify(groupData),
    });

export const deleteGroup = (orgId: string, groupId: number) =>
    request<any>(`/aaa/${orgId}/groups/${groupId}`, {
        method: 'DELETE',
    });

// Projects
export const getProjects = (orgId: string) =>
    request<Project[]>(`/aaa/${orgId}/projects`);

export const createProject = (orgId: string, projectData: Partial<Project>) =>
    request<Project>(`/aaa/${orgId}/projects`, {
        method: 'POST',
        body: JSON.stringify(projectData),
    });

export const updateProject = (orgId: string, projectId: string, projectData: Project) =>
    request<Project>(`/aaa/${orgId}/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
    });

export const deleteProject = (orgId: string, projectId: string) =>
    request<any>(`/aaa/${orgId}/projects/${projectId}`, {
        method: 'DELETE',
    });
