import { motion } from 'framer-motion';
import { MapPin, Camera, Bell, BarChart3, Users, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: MapPin,
    title: 'Georeferenziazione',
    description: 'Localizza il problema sulla mappa con precisione GPS per un intervento mirato.',
    color: 'hsl(var(--primary))',
  },
  {
    icon: Camera,
    title: 'Allegati Fotografici',
    description: 'Aggiungi foto per documentare meglio il problema e facilitare la diagnosi.',
    color: 'hsl(var(--success))',
  },
  {
    icon: Bell,
    title: 'Notifiche in Tempo Reale',
    description: 'Ricevi aggiornamenti sullo stato delle tue segnalazioni via email o push.',
    color: 'hsl(var(--warning))',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analytics',
    description: 'Monitora statistiche aggregate, tempi di risposta e performance.',
    color: 'hsl(var(--info))',
  },
  {
    icon: Users,
    title: 'Multi-Tenant',
    description: 'Ogni municipalità gestisce autonomamente i propri ticket e operatori.',
    color: 'hsl(var(--accent))',
  },
  {
    icon: Shield,
    title: 'Sicurezza Dati',
    description: 'Isolamento completo dei dati tra tenant con autenticazione robusta.',
    color: 'hsl(var(--destructive))',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Funzionalità Principali
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Una piattaforma completa per la gestione delle segnalazioni di manutenzione urbana,
            progettata per cittadini, operatori e amministratori.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-card">
                <CardContent className="p-6">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
