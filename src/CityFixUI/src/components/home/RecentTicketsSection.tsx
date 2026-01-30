import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketCard } from '@/components/tickets/TicketCard';
import { mockTickets } from '@/lib/mockData';
import { ticketApi } from '@/lib/api';
import { Ticket } from '@/types';
import { useState, useEffect } from 'react';

export function RecentTicketsSection() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    ticketApi.getAll().then(data => {
        // Prendi i primi 3 (il backend li ordina già per data decrescente)
        setTickets(data.slice(0, 3));
    });
  }, []);
  
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-3xl font-bold mb-2">Segnalazioni Recenti</h2>
            <p className="text-muted-foreground">
              Le ultime segnalazioni nella tua zona
            </p>
          </div>
          <Link to="/map">
            <Button variant="outline" className="gap-2">
              Vedi Tutte
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket, i) => (
            <TicketCard key={ticket.id} ticket={ticket} showFeedback={false} />
        ))}
        {tickets.length === 0 && <p>Nessuna segnalazione recente.</p>}
        </div>
      </div>
    </section>
  );
}
