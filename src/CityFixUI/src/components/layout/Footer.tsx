import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="font-semibold text-lg">CityFix</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Piattaforma multi-tenant per la manutenzione urbana. Segnala problemi, traccia i progressi e contribuisci a migliorare la tua città.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Link Utili</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/map" className="hover:text-foreground transition-colors">Mappa Segnalazioni</Link></li>
              <li><Link to="/report" className="hover:text-foreground transition-colors">Nuova Segnalazione</Link></li>
              <li><Link to="/my-tickets" className="hover:text-foreground transition-colors">I Miei Ticket</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contatti</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@cityfix.it" className="hover:text-foreground transition-colors">
                  info@cityfix.it
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+390891234567" className="hover:text-foreground transition-colors">
                  089 123 4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 CityFix - Consorzio Municipalità Campania</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Termini</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
