import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Clock, MapPin, Camera, MessageSquare,
  ChevronRight, Loader2
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { mockTickets } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { STATUS_INFO, CATEGORY_INFO, Ticket } from '@/types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function OperatorTasks() {
  const { user } = useAuth();
  const [completingTicketId, setCompletingTicketId] = useState<string | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [completionNote, setCompletionNote] = useState('');

  // Filtra ticket assegnati a questo operatore
  const myTickets = mockTickets.filter(
    t => t.assignedOperatorId === user?.id || 
    // Mock: mostra alcuni ticket per demo
    (user?.role === 'operator' && t.status !== 'resolved' && t.category === user?.category)
  );

  const activeTickets = myTickets.filter(t => t.status === 'in_progress');
  const pendingTickets = myTickets.filter(t => t.status === 'received');
  const completedTickets = myTickets.filter(t => t.status === 'resolved');

  const handleStartWork = async (ticket: Ticket) => {
    // TODO: Chiamata API reale
    console.log(`Iniziando lavoro su ticket ${ticket.id}`);
  };

  const handleCompleteTicket = async () => {
    if (!selectedTicket) return;
    
    setCompletingTicketId(selectedTicket.id);
    // TODO: Chiamata API reale
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Completando ticket ${selectedTicket.id} con nota: ${completionNote}`);
    setCompletingTicketId(null);
    setCompleteDialogOpen(false);
    setSelectedTicket(null);
    setCompletionNote('');
  };

  const TaskCard = ({ ticket, showActions = true }: { ticket: Ticket; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">{ticket.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {ticket.description}
            </CardDescription>
          </div>
          <Badge 
            style={{ backgroundColor: STATUS_INFO[ticket.status].color }}
            className="text-white shrink-0"
          >
            {STATUS_INFO[ticket.status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-[150px]">{ticket.location.address || 'Posizione'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(ticket.createdAt), 'd MMM', { locale: it })}</span>
          </div>
        </div>

        {ticket.photos.length > 0 && (
          <div className="flex gap-2">
            {ticket.photos.slice(0, 3).map((photo, i) => (
              <div key={i} className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {ticket.photos.length > 3 && (
              <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                <span className="text-sm text-muted-foreground">+{ticket.photos.length - 3}</span>
              </div>
            )}
          </div>
        )}

        <Badge variant="outline">
          {CATEGORY_INFO[ticket.category].label}
        </Badge>

        {showActions && (
          <div className="flex gap-2 pt-2">
            {ticket.status === 'received' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleStartWork(ticket)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Inizia Lavoro
              </Button>
            )}
            {ticket.status === 'in_progress' && (
              <Dialog open={completeDialogOpen && selectedTicket?.id === ticket.id} onOpenChange={setCompleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Completa Intervento</DialogTitle>
                    <DialogDescription>
                      Conferma il completamento di "{ticket.title}"
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium">Note di completamento (opzionale)</label>
                      <Textarea
                        value={completionNote}
                        onChange={(e) => setCompletionNote(e.target.value)}
                        placeholder="Descrivi l'intervento eseguito..."
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setCompleteDialogOpen(false)}
                      >
                        Annulla
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handleCompleteTicket}
                        disabled={completingTicketId === ticket.id}
                      >
                        {completingTicketId === ticket.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Completamento...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Conferma
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">I Miei Incarichi</h1>
          <p className="text-muted-foreground">
            Gestisci gli interventi assegnati a te
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-warning">{pendingTickets.length}</p>
              <p className="text-sm text-muted-foreground">In Attesa</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-info">{activeTickets.length}</p>
              <p className="text-sm text-muted-foreground">In Corso</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-success">{completedTickets.length}</p>
              <p className="text-sm text-muted-foreground">Completati</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="gap-2">
              In Attesa
              {pendingTickets.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingTickets.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              In Corso
              {activeTickets.length > 0 && (
                <Badge variant="secondary" className="ml-1">{activeTickets.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completati</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingTickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nessun incarico in attesa</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pendingTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TaskCard ticket={ticket} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeTickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nessun intervento in corso</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {activeTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TaskCard ticket={ticket} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nessun intervento completato</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {completedTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TaskCard ticket={ticket} showActions={false} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
