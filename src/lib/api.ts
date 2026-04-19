import type { User, Email } from '../contexts/AppContext';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

// Auth
export const authApi = {
  register: (name: string, email: string, password: string, role: string) =>
    request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  login: (email: string, password: string) =>
    request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () =>
    request<{ user: User | null }>('/auth/me'),

  logout: () =>
    request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
};

// Emails
export interface EmailsQuery {
  provider?: string;
  min_price?: number;
  max_price?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}

export const emailsApi = {
  list: (query: EmailsQuery = {}) => {
    const params = new URLSearchParams();
    if (query.provider) params.set('provider', query.provider);
    if (query.min_price) params.set('min_price', String(query.min_price));
    if (query.max_price) params.set('max_price', String(query.max_price));
    if (query.sort) params.set('sort', query.sort);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    return request<{ emails: Email[]; total: number; page: number; limit: number }>(
      `/emails?${params.toString()}`
    );
  },
};

// Cart
export const cartApi = {
  get: () => request<{ items: { listing_id: string }[] }>('/cart'),
  add: (listing_id: string) =>
    request<{ success: boolean }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ listing_id }),
    }),
  remove: (listing_id: string) =>
    request<{ success: boolean }>('/cart', {
      method: 'DELETE',
      body: JSON.stringify({ listing_id }),
    }),
  clear: () =>
    request<{ success: boolean }>('/cart', {
      method: 'DELETE',
      body: JSON.stringify({}),
    }),
};

// Wishlist
export const wishlistApi = {
  get: () => request<{ items: string[] }>('/wishlist'),
  add: (listing_id: string) =>
    request<{ success: boolean }>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ listing_id }),
    }),
  remove: (listing_id: string) =>
    request<{ success: boolean }>('/wishlist', {
      method: 'DELETE',
      body: JSON.stringify({ listing_id }),
    }),
};
