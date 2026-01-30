import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Star, ChevronDown, ChevronUp, Image as ImageIcon, MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Ticket, STATUS_INFO, CATEGORY_INFO } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ticketApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  showFeedback?: boolean;
}

export function TicketCard({ ticket, onClick, showFeedback = false }: TicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const statusInfo = STATUS_INFO[ticket.status] || { label: ticket.status, color: '#666' };
  const categoryInfo = CATEGORY_INFO[ticket.category] || { label: ticket.category };

  // Helper data super robusto
  const formatDate = (dateValue: any) => {
    try {
      if (!dateValue) return 'Data non disp.';
      // Se è già un oggetto Date, usalo. Se è stringa, converti.
      const date = new Date(dateValue);
      // Controlla se la data è valida
      if (isNaN(date.getTime())) return 'Data invalida';
      return format(date, 'd MMM HH:mm', { locale: it });
    } catch (e) {
      return 'Err. Data';
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita di attivare l'onClick del padre se presente
    setIsExpanded(!isExpanded);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await ticketApi.addComment(ticket.id, newComment, user?.name || 'Utente');
      
      toast({ title: "Commento aggiunto" });
      setNewComment('');
      // Qui dovresti ricaricare i ticket per vedere il nuovo commento, 
      // o aggiungerlo localmente alla lista commenti visualizzata
      
    } catch (error) {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card 
        className="transition-all duration-200 hover:shadow-md border-l-4"
        style={{ borderLeftColor: statusInfo.color }}
      >
        <CardContent className="p-4">
          <div className="flex gap-4 cursor-pointer" onClick={onClick || handleExpandClick}>
            {/* Immagine */}
            <div className="w-20 h-20 rounded-md bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
              {ticket.photos && ticket.photos.length > 0 ? (
                <img src={ticket.photos[0]} alt="Ticket" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              )}
            </div>

            {/* Contenuto Principale */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-sm line-clamp-1">{ticket.title}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" onClick={handleExpandClick}>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-2">
                {ticket.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" style={{ borderColor: statusInfo.color, color: statusInfo.color }} className="text-[10px] px-1.5 py-0">
                  {statusInfo.label}
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {categoryInfo.label}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">
                    {ticket.location?.address || 'Posizione'}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Sezione Espandibile (Dettagli + Commenti) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-border">
                  {/* Descrizione Completa */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Descrizione</h4>
                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  </div>

                  {/* Feedback (se presente) */}
                  {showFeedback && ticket.feedback && (
                    <div className="mb-4 bg-muted/30 p-3 rounded-md">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-medium mr-2">Valutazione:</span>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn('h-3 w-3', i < ticket.feedback!.rating ? 'fill-warning text-warning' : 'text-muted-foreground')} />
                        ))}
                      </div>
                      {ticket.feedback.comment && <p className="text-xs italic text-muted-foreground">"{ticket.feedback.comment}"</p>}
                    </div>
                  )}

                  {/* Sezione Commenti */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      Commenti
                    </div>
                    
                    {/* Lista commenti REALE */}
<div className="space-y-2 max-h-40 overflow-y-auto pr-1">
    {/* Mostra sempre la data di creazione come primo evento */}
    <div className="bg-muted/50 p-2 rounded text-xs">
        <span className="font-semibold block">Sistema</span>
        Ticket creato il {formatDate(ticket.createdAt)}
    </div>

    {/* Itera sui commenti veri del ticket */}
    {ticket.comments && ticket.comments.map((comment: any, index: number) => (
        <div key={index} className="bg-white border border-border p-2 rounded text-xs shadow-sm">
            <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{comment.author || 'Utente'}</span>
                <span className="text-[10px] text-muted-foreground">
                    {formatDate(comment.createdAt || comment.created_at)}
                </span>
            </div>
            <p>{comment.text}</p>
        </div>
    ))}
    
    {/* Messaggio se non ci sono commenti */}
    {(!ticket.comments || ticket.comments.length === 0) && (
        <p className="text-xs text-center text-muted-foreground py-2">
            Nessun commento aggiuntivo.
        </p>
    )}
</div>

                    {/* Form Nuovo Commento */}
                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                      <Input 
                        placeholder="Scrivi un commento..." 
                        className="h-8 text-sm"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button type="submit" size="icon" className="h-8 w-8">
                        <Send className="h-3 w-3" />
                      </Button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}