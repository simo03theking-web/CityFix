import { Ticket, Municipality, User } from '@/types';

export const mockMunicipalities: Municipality[] = [
  { id: '1', name: 'Salerno', managerId: 'manager1' },
  { id: '2', name: 'Napoli', managerId: 'manager2' },
  { id: '3', name: 'Benevento', managerId: 'manager3' },
];

export const mockUsers: User[] = [
  { id: 'citizen1', email: 'mario.rossi@email.it', name: 'Mario Rossi', role: 'citizen', municipalityId: '1' },
  { id: 'operator1', email: 'operatore@comune.it', name: 'Giuseppe Verdi', role: 'operator', municipalityId: '1', category: 'roads' },
  { id: 'manager1', email: 'responsabile@comune.it', name: 'Anna Bianchi', role: 'maintenance_manager', municipalityId: '1' },
  { id: 'admin1', email: 'admin@consorzio.it', name: 'Admin Consorzio', role: 'consortium_admin' },
];

export const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Buca pericolosa in Via Roma',
    description: 'Buca di grandi dimensioni che mette a rischio automobilisti e ciclisti.',
    category: 'roads',
    status: 'in_progress',
    location: { lat: 40.6824, lng: 14.7681, address: 'Via Roma 45, Salerno' },
    photos: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400'],
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-18'),
    citizenId: 'citizen1',
    citizenName: 'Mario Rossi',
    municipalityId: '1',
    assignedOperatorId: 'operator1',
    comments: 'grossa buca'
  },
  {
    id: '2',
    title: 'Lampione spento in Piazza Vittoria',
    description: 'Il lampione non funziona da una settimana, zona molto buia di sera.',
    category: 'lighting',
    status: 'received',
    location: { lat: 40.6834, lng: 14.7701, address: 'Piazza Vittoria, Salerno' },
    photos: [],
    createdAt: new Date('2025-01-19'),
    updatedAt: new Date('2025-01-19'),
    citizenId: 'citizen1',
    citizenName: 'Mario Rossi',
    municipalityId: '1',
    comments: 'lampione spento'
  },
  {
    id: '3',
    title: 'Albero pericolante nel parco',
    description: 'Albero inclinato che rischia di cadere, necessita potatura urgente.',
    category: 'green',
    status: 'resolved',
    location: { lat: 40.6814, lng: 14.7661, address: 'Parco del Mercatello, Salerno' },
    photos: ['https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400'],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-17'),
    citizenId: 'citizen1',
    citizenName: 'Mario Rossi',
    municipalityId: '1',
    feedback: { rating: 5, comment: 'Intervento rapido e professionale!' },
    comments: 'albero inclinato'
  },
  {
    id: '4',
    title: 'Rifiuti abbandonati',
    description: 'Cumulo di rifiuti ingombranti abbandonati sul marciapiede.',
    category: 'waste',
    status: 'received',
    location: { lat: 40.6854, lng: 14.7721, address: 'Via Lungomare Trieste, Salerno' },
    photos: [],
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
    citizenId: 'citizen1',
    citizenName: 'Lucia Esposito',
    municipalityId: '1',
    comments: 'rifiuti abbandonati'
  },
  {
    id: '5',
    title: 'Crepa nel muro di contenimento',
    description: 'Crepa visibile nel muro di contenimento lungo la strada provinciale.',
    category: 'buildings',
    status: 'in_progress',
    location: { lat: 40.6794, lng: 14.7641, address: 'SP 45, Salerno' },
    photos: [],
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-16'),
    citizenId: 'citizen1',
    citizenName: 'Francesco Napoli',
    municipalityId: '1',
    assignedOperatorId: 'operator1',
    comments: 'crepa visibile'
  },
];
