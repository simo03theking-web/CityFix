import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Send, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { statsApi } from '@/lib/api';

export function HeroSection() {
  const [stats, setStats] = useState({ total: 0, received: 0, resolved: 0 });

  useEffect(() => {
    statsApi.getDashboardStats().then(data => {
        setStats({
            total: data.total,
            received: data.received,
            resolved: data.resolved
        });
    }).catch(console.error);
  }, []);

  return (
    <section className="relative overflow-hidden gradient-hero text-primary-foreground">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container relative py-20 md:py-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Piattaforma Attiva
            </span>
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            La tua città, la tua voce.
            <br />
            <span className="text-white/80">Segnala e migliora.</span>
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            CityFix ti permette di segnalare problemi urbani, tracciare lo stato delle tue richieste e contribuire attivamente alla manutenzione della tua comunità.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/report">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2 shadow-lg">
                <Send className="h-5 w-5" />
                Segnala un Problema
              </Button>
            </Link>
            <Link to="/map">
              <Button 
                size="lg" 
                variant="ghost" 
                className="w-full sm:w-auto gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <MapPin className="h-5 w-5" />
                Esplora la Mappa
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {[
            { icon: Send, label: 'Segnalazioni Totali', value: stats.total.toString() },
            { icon: MapPin, label: 'In Lavorazione', value: stats.received.toString() }, // O un'altra metrica
            { icon: CheckCircle, label: 'Risolti', value: stats.resolved.toString() },
          ].map((stat, i) => (
            <div 
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <stat.icon className="h-8 w-8 mb-3 text-white/80" />
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
