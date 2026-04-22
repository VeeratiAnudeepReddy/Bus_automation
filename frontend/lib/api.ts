import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const api = axios.create({ baseURL: API_BASE_URL });

const authHeaders = (clerkUserId: string) => ({
  headers: {
    'x-clerk-user-id': clerkUserId,
    'Content-Type': 'application/json'
  }
});

export type AppUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  clerkUserId: string;
  role: 'user' | 'admin' | 'fare_manager';
  balance: number;
};

export type StopItem = {
  name: string;
  coords: {
    lat: number;
    lng: number;
  };
};

export type RouteItem = {
  _id: string;
  from: string;
  to: string;
  fare: number;
  city: string;
  active: boolean;
  fromCoords: {
    lat: number;
    lng: number;
  };
  toCoords: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type TicketItem = {
  ticketId: string;
  userId: string;
  routeId?: string | null;
  from?: string | null;
  to?: string | null;
  status: 'ACTIVE' | 'USED';
  fare?: number;
  fromCoords?: { lat: number; lng: number } | null;
  toCoords?: { lat: number; lng: number } | null;
  createdAt: string;
  scannedAt: string | null;
  qrPayload: {
    ticketId: string;
    userId: string;
    timestamp: string;
    routeId?: string | null;
    from?: string | null;
    to?: string | null;
    fare?: number | null;
  };
  qr: string;
};

export type ScanResult = {
  result: 'VALID' | 'INVALID' | 'REJECT';
  ticket?: {
    ticketId: string;
    userId: string;
    passengerName?: string;
    status: 'USED';
    scannedAt: string;
    createdAt: string;
  };
};

export const apiService = {
  syncUser: async (payload: {
    clerkUserId: string;
    name: string;
    email: string;
    phone?: string;
  }): Promise<AppUser> => {
    const response = await api.post('/auth/sync', payload);
    return response.data;
  },

  addBalance: async (clerkUserId: string, amount: number): Promise<{ balance: number }> => {
    const response = await api.post('/wallet/add', { amount }, authHeaders(clerkUserId));
    return response.data;
  },

  bookTickets: async (
    clerkUserId: string,
    payload:
      | number
      | {
          count?: number;
          routeId?: string;
          from?: string;
          to?: string;
          fromCoords?: { lat: number; lng: number } | null;
          toCoords?: { lat: number; lng: number } | null;
        }
  ): Promise<{
    ticketPrice: number;
    count: number;
    totalAmount: number;
    balance: number;
    tickets: TicketItem[];
  }> => {
    const bookingPayload = typeof payload === 'number' ? { count: payload } : payload;
    const response = await api.post('/tickets/book', bookingPayload, authHeaders(clerkUserId));
    return response.data;
  },

  getMyTickets: async (
    clerkUserId: string
  ): Promise<{ balance: number; total: number; tickets: TicketItem[] }> => {
    const response = await api.get('/tickets/my', authHeaders(clerkUserId));
    return response.data;
  },

  scanTicket: async (clerkUserId: string, scannedData: string): Promise<ScanResult> => {
    const response = await api.post('/tickets/scan', { scannedData }, authHeaders(clerkUserId));
    return response.data;
  },

  getAdminAnalytics: async (
    clerkUserId: string
  ): Promise<{
    totalScannedTickets: number;
    dailyScannedStats: { _id: string; scanned: number }[];
  }> => {
    const response = await api.get('/admin/analytics', authHeaders(clerkUserId));
    return response.data;
  },

  getRoutes: async (
    clerkUserId: string,
    params?: { city?: string; from?: string; to?: string }
  ): Promise<{ city: string; routes: RouteItem[]; stops: StopItem[]; popularRoutes: RouteItem[] }> => {
    const response = await api.get('/routes', {
      ...authHeaders(clerkUserId),
      params
    });
    return response.data;
  },

  getAdminRoutes: async (
    clerkUserId: string,
    params?: { city?: string; search?: string; status?: 'all' | 'active' | 'inactive' }
  ): Promise<{ routes: RouteItem[] }> => {
    const response = await api.get('/admin/routes', {
      ...authHeaders(clerkUserId),
      params
    });
    return response.data;
  },

  createAdminRoute: async (
    clerkUserId: string,
    payload: {
      from: string;
      to: string;
      fare: number;
      city?: string;
      active?: boolean;
      fromCoords: { lat: number; lng: number };
      toCoords: { lat: number; lng: number };
    }
  ): Promise<RouteItem> => {
    const response = await api.post('/admin/routes/create', payload, authHeaders(clerkUserId));
    return response.data;
  },

  updateAdminRoute: async (
    clerkUserId: string,
    routeId: string,
    payload: Partial<{
      from: string;
      to: string;
      fare: number;
      city: string;
      active: boolean;
      fromCoords: { lat: number; lng: number };
      toCoords: { lat: number; lng: number };
    }>
  ): Promise<RouteItem> => {
    const response = await api.put(`/admin/routes/${routeId}`, payload, authHeaders(clerkUserId));
    return response.data;
  },

  deleteAdminRoute: async (clerkUserId: string, routeId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/admin/routes/${routeId}`, authHeaders(clerkUserId));
    return response.data;
  },

  toggleAdminRoute: async (clerkUserId: string, routeId: string): Promise<RouteItem> => {
    const response = await api.patch(`/admin/routes/${routeId}/toggle`, {}, authHeaders(clerkUserId));
    return response.data;
  },

  getFareHistory: async (
    clerkUserId: string,
    routeId?: string
  ): Promise<{
    history: {
      _id: string;
      route: { _id: string; from: string; to: string; city: string };
      previousFare: number;
      newFare: number;
      updatedBy: { _id: string; name: string; email: string; role: string };
      createdAt: string;
    }[];
  }> => {
    const response = await api.get('/admin/routes/fare-history', {
      ...authHeaders(clerkUserId),
      params: routeId ? { routeId } : undefined
    });
    return response.data;
  }
};
