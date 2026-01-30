import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div 
          className="relative rounded-2xl overflow-hidden gradient-dark p-8 md:p-12 lg:p-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto a migliorare la tua città?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Unisciti a migliaia di cittadini che ogni giorno contribuiscono
              a rendere le nostre comunità posti migliori dove vivere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
                <Link to="/register">
                  Inizia Ora
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="ghost" 
                className="w-full sm:w-auto text-white hover:bg-white/10 border border-white/20"
              >
                <Link to="/map">
                  Esplora le Segnalazioni
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
