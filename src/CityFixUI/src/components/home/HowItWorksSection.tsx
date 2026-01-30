import { motion } from 'framer-motion';
import { UserPlus, MapPin, Send, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Registrati',
    description: 'Crea un account gratuito per accedere alla piattaforma.',
  },
  {
    icon: MapPin,
    title: 'Localizza',
    description: 'Individua sulla mappa il punto esatto del problema.',
  },
  {
    icon: Send,
    title: 'Segnala',
    description: 'Descrivi il problema, seleziona la categoria e allega foto.',
  },
  {
    icon: CheckCircle,
    title: 'Traccia',
    description: 'Monitora lo stato e ricevi notifiche fino alla risoluzione.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Come Funziona
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            In pochi semplici passi puoi segnalare un problema e contribuire
            al miglioramento della tua città.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-border" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                {/* Step number */}
                <div className="relative z-10 mx-auto w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center text-primary-foreground shadow-glow">
                      <step.icon className="h-7 w-7" />
                    </div>
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-primary text-primary font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
