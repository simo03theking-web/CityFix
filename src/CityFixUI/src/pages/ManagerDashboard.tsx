import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, Ticket as TicketIcon, CheckCircle, Clock, AlertTriangle,
  TrendingUp, Filter, UserPlus, ChevronRight
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketMap } from '@/components/map/TicketMap';
import { mockTickets, mockUsers } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { STATUS_INFO, CATEGORY_INFO, TicketStatus, Ticket } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Filtra ticket per municipalità del manager
  const municipalityTickets = mockTickets.filter(
    t => t.municipalityId === user?.municipalityId
  );

  const filteredTickets = municipalityTickets.filter(
    t => statusFilter === 'all' || t.status === statusFilter
  );

  // Operatori della municipalità
  const operators = mockUsers.filter(
    u => u.role === 'operator' && u.municipalityId === user?.municipalityId
  );

  // Stats mock
  const stats = {
    total: municipalityTickets.length,
    received: municipalityTickets.filter(t => t.status === 'received').length,
    inProgress: municipalityTickets.filter(t => t.status === 'in_progress').length,
    resolved: municipalityTickets.filter(t => t.status === 'resolved').length,
    avgResolutionTime: '48h',
  };

  const handleAssignTicket = (operatorId: string) => {
    // TODO: Chiamata API reale
    console.log(`Assegnando ticket ${selectedTicket?.id} a operatore ${operatorId}`);
    setAssignDialogOpen(false);
    setSelectedTicket(null);
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Responsabile</h1>
            <p className="text-muted-foreground">
              Gestisci i ticket e gli operatori della tua municipalità
            </p>
          </div>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Aggiungi Operatore
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <TicketIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Totale Ticket</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-info/10">
                  <AlertTriangle className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.received}</p>
                  <p className="text-sm text-muted-foreground">Da Assegnare</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Corso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-sm text-muted-foreground">Risolti</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tickets" className="gap-2">
              <TicketIcon className="h-4 w-4" />
              Tutti i Ticket
            </TabsTrigger>
            <TabsTrigger value="operators" className="gap-2">
              <Users className="h-4 w-4" />
              Operatori
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Mappa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtra per stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  {Object.entries(STATUS_INFO).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tickets Grid with Assign Action */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="relative">
                    <TicketCard ticket={ticket} />
                    {/* Manager Actions */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {ticket.status === 'received' && !ticket.assignedOperatorId && (
                        <Dialog open={assignDialogOpen && selectedTicket?.id === ticket.id} onOpenChange={setAssignDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              Assegna
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assegna Ticket</DialogTitle>
                              <DialogDescription>
                                Seleziona un operatore per "{ticket.title}"
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2 mt-4">
                              {operators.map((op) => (
                                <Button
                                  key={op.id}
                                  variant="outline"
                                  className="w-full justify-between"
                                  onClick={() => handleAssignTicket(op.id)}
                                >
                                  <span>{op.name}</span>
                                  <Badge variant="secondary">
                                    {op.category && CATEGORY_INFO[op.category]?.label}
                                  </Badge>
                                </Button>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {ticket.assignedOperatorId && (
                        <Badge variant="outline" className="text-xs">
                          Assegnato
                        </Badge>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="operators" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operators.map((operator) => (
                <Card key={operator.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{operator.name}</CardTitle>
                        <CardDescription>{operator.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge>
                        {operator.category && CATEGORY_INFO[operator.category]?.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {mockTickets.filter(t => t.assignedOperatorId === operator.id).length} ticket attivi
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardContent className="p-0">
                <div className="h-[500px] rounded-lg overflow-hidden">
                  <TicketMap 
                    tickets={filteredTickets} 
                    onTicketClick={setSelectedTicket}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
