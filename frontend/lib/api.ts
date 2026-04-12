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
  role: 'user' | 'admin';
  balance: number;
};

export type TicketItem = {
  ticketId: string;
  userId: string;
  status: 'ACTIVE' | 'USED';
  createdAt: string;
  scannedAt: string | null;
  qrPayload: {
    ticketId: string;
    userId: string;
    timestamp: string;
  };
  qr: string;
};

export type ScanResult = {
  result: 'VALID' | 'INVALID' | 'REJECT';
  ticket?: {
    ticketId: string;
    userId: string;
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
    count: number
  ): Promise<{
    ticketPrice: number;
    count: number;
    totalAmount: number;
    balance: number;
    tickets: TicketItem[];
  }> => {
    const response = await api.post('/tickets/book', { count }, authHeaders(clerkUserId));
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
    totalTicketsSold: number;
    totalTicketsUsed: number;
    dailyStats: { _id: string; sold: number; used: number }[];
  }> => {
    const response = await api.get('/admin/analytics', authHeaders(clerkUserId));
    return response.data;
  }
};
