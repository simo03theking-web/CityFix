import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Ticket } from '@/types';

export const useTickets = (filters?: {
  tenant_id?: string;
  user_id?: string;
  status?: string;
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tickets/list', { params: filters });
        setTickets(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [filters?.tenant_id, filters?.user_id, filters?.status]);

  return { tickets, loading, error };
};