// Ticket Types
export type TicketStatus = 'received' | 'in_progress' | 'resolved';
export type TicketCategory = 'roads' | 'green' | 'buildings' | 'waste' | 'lighting' | 'other';

export interface Ticket {
  comments: any;
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  photos: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  citizenId: string;
  citizenName: string;
  municipalityId: string;
  assignedOperatorId?: string;
  feedback?: {
    rating: number;
    comment?: string;
  };
}

// User Types
export type UserRole = 'citizen' | 'operator' | 'maintenance_manager' | 'consortium_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  municipalityId?: string;
  category?: TicketCategory; // For operators
  avatar?: string;
}

// Municipality Types
export interface Municipality {
  id: string;
  name: string;
  boundaries?: GeoJSON.Feature;
  theme?: {
    primaryColor: string;
    logo?: string;
  };
  managerId: string;
}

// Category info for UI
export const CATEGORY_INFO: Record<TicketCategory, { label: string; icon: string; color: string }> = {
  roads: { label: 'Strade', icon: 'road', color: 'hsl(var(--warning))' },
  green: { label: 'Verde Pubblico', icon: 'trees', color: 'hsl(var(--success))' },
  buildings: { label: 'Edifici', icon: 'building', color: 'hsl(var(--secondary))' },
  waste: { label: 'Rifiuti', icon: 'trash', color: 'hsl(var(--destructive))' },
  lighting: { label: 'Illuminazione', icon: 'lamp', color: 'hsl(var(--info))' },
  other: { label: 'Altro', icon: 'help-circle', color: 'hsl(var(--muted-foreground))' },
};

export const STATUS_INFO: Record<TicketStatus, { label: string; color: string }> = {
  received: { label: 'Ricevuto', color: 'hsl(var(--info))' },
  in_progress: { label: 'In Corso', color: 'hsl(var(--warning))' },
  resolved: { label: 'Risolto', color: 'hsl(var(--success))' },
};
