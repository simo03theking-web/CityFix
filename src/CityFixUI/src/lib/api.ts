import { Ticket, TicketCategory, TicketStatus, User } from '@/types';

import api from '@/services/api';

// ============ AUTH SERVICE ============

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  register: async (data: { name: string; email: string; password: string; municipalityId: string }): Promise<{ message: string, id: string }> => {
    const { data: res } = await api.post('/auth/register', data);
    return res;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
};

// ============ TICKET SERVICE ============

export interface CreateTicketData {
  title: string;
  description: string;
  category: TicketCategory;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  photos?: File[];
}

export interface UpdateTicketData {
  status?: TicketStatus;
  assignedOperatorId?: string;
  feedback?: {
    rating: number;
    comment?: string;
  };
}

export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  municipalityId?: string;
  assignedOperatorId?: string;
  citizenId?: string;
}

export const ticketApi = {
  getAll: async (filters?: TicketFilters): Promise<Ticket[]> => {
    const params: Record<string, string> = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value as string;
      });
    }
    const { data } = await api.get('/tickets', { params });
    return data;
  },

  getById: async (id: string): Promise<Ticket> => {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },

  create: async (data: CreateTicketData): Promise<Ticket> => {
    const userStr = localStorage.getItem('cityfix_user');
    const user = userStr ? JSON.parse(userStr) : null;

    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      userId: user ? user.id : 'anonymous',
      municipalityId: user ? user.municipalityId : '1'
    };

    const { data: res } = await api.post('/tickets', payload);
    return res;
  },

  update: async (id: string, data: UpdateTicketData): Promise<Ticket> => {
    const { data: res } = await api.patch(`/tickets/${id}`, data);
    return res;
  },

  assign: async (ticketId: string, operatorId: string): Promise<Ticket> => {
    const { data } = await api.post(`/tickets/${ticketId}/assign`, { operatorId });
    return data;
  },

  complete: async (ticketId: string): Promise<Ticket> => {
    const { data } = await api.post(`/tickets/${ticketId}/complete`);
    return data;
  },

  addFeedback: async (ticketId: string, rating: number, comment?: string): Promise<Ticket> => {
    const { data } = await api.post(`/tickets/${ticketId}/feedback`, { rating, comment });
    return data;
  },

  addComment: async (ticketId: string, text: string, authorName: string) => {
    const { data } = await api.post(`/tickets/${ticketId}/comments`, { text, authorName });
    return data;
  }
};

// ============ USER SERVICE (per Manager) ============

export const userApi = {
  getOperators: async (municipalityId?: string): Promise<User[]> => {
    const params = municipalityId ? { municipalityId } : undefined;
    const { data } = await api.get('/users/operators', { params });
    return data;
  },

  createOperator: async (data: { name: string; email: string; category: TicketCategory }): Promise<User> => {
    const { data: res } = await api.post('/users/operators', data);
    return res;
  },
};

// ============ STATS SERVICE (per Dashboard) ============

export interface DashboardStats {
  total: number;
  received: number;
  resolved: number;
  totalTickets: number;
  ticketsByStatus: Record<TicketStatus, number>;
  ticketsByCategory: Record<TicketCategory, number>;
  averageResolutionTime: number; // in ore
  ticketsThisMonth: number;
  resolvedThisMonth: number;
}

export const statsApi = {
  getDashboardStats: async (municipalityId?: string): Promise<DashboardStats> => {
    const params = municipalityId ? { municipalityId } : undefined;
    const { data } = await api.get('/stats/dashboard', { params });
    return data;
  },

  getConsortiumStats: async (): Promise<{ municipalities: Array<{ id: string; name: string; stats: DashboardStats }> }> => {
    const { data } = await api.get('/stats/consortium');
    return data;
  },
};
