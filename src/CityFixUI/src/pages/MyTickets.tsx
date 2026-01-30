import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTickets } from '@/lib/mockData';
import { TicketStatus, STATUS_INFO } from '@/types';
import { ticketApi } from '@/lib/api';
import { Ticket } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function MyTickets() {
  // Stato locale per i ticket veri
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TicketStatus | 'all'>('all');
  const { toast } = useToast();

  // Carica i ticket dal backend all'avvio
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await ticketApi.getAll();
        setTickets(Array.isArray(data) ? data : []);
      } catch (error) {
        toast({
          title: "Errore",
          description: "Impossibile caricare i ticket.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Usa la variabile 'tickets' (quella vera) invece di 'mockTickets' per il filtro
  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab !== 'all' && ticket.status !== activeTab) return false;
    if (searchQuery && !ticket.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getTicketCount = (status: TicketStatus | 'all') => {
    if (status === 'all') return tickets.length;
    return tickets.filter((t) => t.status === status).length;
  };
  
  if (isLoading) {
      return (
          <Layout>
              <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin" />
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">I Miei Ticket</h1>
            <p className="text-muted-foreground">
              Traccia lo stato delle tue segnalazioni
            </p>
          </div>
          <Link to="/report">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuova Segnalazione
            </Button>
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca nei tuoi ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TicketStatus | 'all')}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="gap-2">
              Tutti
              <span className="text-xs bg-muted-foreground/20 px-2 py-0.5 rounded-full">
                {getTicketCount('all')}
              </span>
            </TabsTrigger>
            {Object.entries(STATUS_INFO).map(([key, info]) => (
              <TabsTrigger key={key} value={key} className="gap-2">
                {info.label}
                <span className="text-xs bg-muted-foreground/20 px-2 py-0.5 rounded-full">
                  {getTicketCount(key as TicketStatus)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTickets.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TicketCard ticket={ticket} showFeedback />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-center py-16 bg-muted/30 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Nessun ticket trovato</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? 'Prova a modificare i criteri di ricerca'
                    : 'Non hai ancora effettuato segnalazioni'}
                </p>
                {!searchQuery && (
                  <Link to="/report">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Crea la tua prima segnalazione
                    </Button>
                  </Link>
                )}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
