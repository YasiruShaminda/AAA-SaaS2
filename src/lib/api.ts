import { Organization, Subscriber, Product, Group, Project } from '@/contexts/OrganizationContext';

const API_BASE_URL = 'http://54.205.5.145:3500/v1';
const USER_API_KEY = 'FA52BCD47738DE6ED22A874148D4B';

// Use proxy in development to avoid CORS issues
const USER_API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api/proxy'
  : 'http://54.205.5.145:3500/v1';

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
    // Handle 401 Unauthorized - but don't redirect during login attempts
    if (response.status === 401) {
      // Only redirect and clear token if this is not a login attempt
      // Login attempts to /auth/login should not trigger automatic redirects
      if (!endpoint.includes('/auth/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      // For login attempts, let the error bubble up normally without redirect
    }

    let errorMessage = 'API request failed';
    try {
      const error = await response.json();
      errorMessage = error.message || `HTTP ${response.status}: ${response.statusText}`;
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // Handle both cases where data might be wrapped in a 'data' property or returned directly
  return (data.data !== undefined ? data.data : data) as T;
}

// User registration request function with API key
async function userApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('accept', 'application/json');
  headers.set('x-api-key', USER_API_KEY);

  const response = await fetch(`${USER_API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Add success property based on response status
  return {
    ...data,
    success: response.ok
  } as T;
}

// Authentication
export const login = (credentials: any) =>
  request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const getAuthenticatedUser = () => request<any>('/auth/user');

// User Registration with Email Verification
export interface RegisterUserData {
  username: string;
  password: string;
  email: string;
}

export interface RegisterResponse {
  status: string;
  message: string;
  statusCode: number;
  data: {
    id: number;
    username: string;
    password: string;
    email: string;
    is_email_verified: boolean;
    created_at: string;
    updated_at: string;
    emailSent: boolean;
    requiresVerification: boolean;
  };
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ApiResponse {
  status: string;
  message: string;
  statusCode: number;
  success: boolean;
  data: any;
}

export const registerUser = (userData: RegisterUserData) =>
  userApiRequest<RegisterResponse>('/user/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const verifyEmail = (verifyData: VerifyEmailData) =>
  userApiRequest<ApiResponse>('/user/verify-email', {
    method: 'POST',
    body: JSON.stringify(verifyData),
  });

export const resendVerificationCode = (email: string) =>
  userApiRequest<ApiResponse>('/user/resend-verification-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

// Legacy register function (keeping for compatibility)
export const register = (userInfo: any) =>
  request<any>('/user/register', {
    method: 'POST',
    body: JSON.stringify(userInfo),
  });

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

export const getProject = (orgId: string, projectId: number) =>
    request<Project>(`/aaa/${orgId}/projects/${projectId}`);

export const createProject = (orgId: string, projectData: {
    name: string;
    description: string;
    auth_enabled?: boolean;
    acct_enabled?: boolean;
    AccAttribute: string;
    ReplyAttribute: string;
    AuthAttribute: string;
}) =>
    request<Project>(`/aaa/${orgId}/projects`, {
        method: 'POST',
        body: JSON.stringify(projectData),
    });

export const updateProject = (orgId: string, projectId: number, projectData: {
    name?: string;
    description?: string;
    auth_enabled?: boolean;
    acct_enabled?: boolean;
}) =>
    request<Project>(`/aaa/${orgId}/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
    });

export const deleteProject = (orgId: string, projectId: number) =>
    request<any>(`/aaa/${orgId}/projects/${projectId}`, {
        method: 'DELETE',
    });

// Project Groups Management
export const getProjectGroups = (orgId: string, projectId: number) =>
    request<Group[]>(`/aaa/${orgId}/projects/${projectId}/groups`);

export const addGroupToProject = (orgId: string, projectId: number, groupId: number) =>
    request<any>(`/aaa/${orgId}/projects/${projectId}/groups`, {
        method: 'POST',
        body: JSON.stringify({ group_id: groupId }),
    });

export const updateProjectGroups = (orgId: string, projectId: number, groupIds: number[]) =>
    request<any>(`/aaa/${orgId}/projects/${projectId}/groups`, {
        method: 'PUT',
        body: JSON.stringify({ groups: groupIds }),
    });

export const removeGroupsFromProject = (orgId: string, projectId: number, groupIds: number[]) =>
    request<any>(`/aaa/${orgId}/projects/${projectId}/groups`, {
        method: 'DELETE',
        body: JSON.stringify({ groups: groupIds }),
    });

// Project RADIUS Profile Management
export const createProjectRadProfile = (orgId: string, projectId: number, profileData: any) =>
    request<any>(`/aaa/${orgId}/projects/${projectId}/radProfile`, {
        method: 'POST',
        body: JSON.stringify(profileData),
    });

export const updateProjectRadProfile = (orgId: string, projectId: number, profileData: any) =>
    request<any>(`/aaa/${orgId}/projects/${projectId}/radProfile`, {
        method: 'PATCH',
        body: JSON.stringify(profileData),
    });

// Project Testing
export const testProject = (orgId: string, projectId: number) =>
    request<any>(`/aaa/${orgId}/projects/${projectId}/test`, {
        method: 'POST',
    });
