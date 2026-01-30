import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, List, MapIcon, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { TicketMap } from '@/components/map/TicketMap';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { mockTickets } from '@/lib/mockData';
import { Ticket, TicketStatus, TicketCategory, STATUS_INFO, CATEGORY_INFO } from '@/types';
import { cn } from '@/lib/utils';
import { ticketApi } from '@/lib/api';

export default function Map() {
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'all'>('all');
  const [tickets, setTickets] = useState<Ticket[]>([]); // Stato per i ticket veri

  // Carica ticket all'avvio
  useEffect(() => {
    ticketApi.getAll().then(setTickets).catch(console.error);
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false;
    return true;
  });

  const activeFiltersCount = (statusFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0);

  return (
    <Layout hideFooter>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="container flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold hidden sm:block">Mappa Segnalazioni</h1>
              <Badge variant="secondary" className="hidden sm:flex">
                {filteredTickets.length} ticket
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtri
                    {activeFiltersCount > 0 && (
                      <Badge className="h-5 w-5 p-0 flex items-center justify-center">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtra Segnalazioni</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Status Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Stato</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={statusFilter === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setStatusFilter('all')}
                        >
                          Tutti
                        </Button>
                        {Object.entries(STATUS_INFO).map(([key, info]) => (
                          <Button
                            key={key}
                            variant={statusFilter === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(key as TicketStatus)}
                          >
                            {info.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Categoria</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={categoryFilter === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCategoryFilter('all')}
                        >
                          Tutte
                        </Button>
                        {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                          <Button
                            key={key}
                            variant={categoryFilter === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCategoryFilter(key as TicketCategory)}
                          >
                            {info.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setStatusFilter('all');
                          setCategoryFilter('all');
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rimuovi Filtri
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* View Toggle */}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={view === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setView('map')}
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {view === 'map' ? (
            <div className="h-full">
              <TicketMap
                tickets={filteredTickets}
                className="h-full rounded-none border-0"
                onTicketClick={setSelectedTicket}
              />

              {/* Selected Ticket Panel */}
              {selectedTicket && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96"
                >
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-card shadow-md"
                      onClick={() => setSelectedTicket(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <TicketCard ticket={selectedTicket} showFeedback />
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="container py-6 h-full overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTickets.map((ticket) => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    onClick={() => setSelectedTicket(ticket)}
                    showFeedback
                  />
                ))}
              </div>
              {filteredTickets.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Nessuna segnalazione trovata con i filtri selezionati.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
