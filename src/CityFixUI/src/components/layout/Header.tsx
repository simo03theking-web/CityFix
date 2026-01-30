import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, MapPin, User, LogIn, Bell, LogOut, 
  LayoutDashboard, Wrench, Building2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockMunicipalities } from '@/lib/mockData'; // Import necessario per i nomi dei comuni

// Link di navigazione basati sul ruolo
const getNavLinks = (role?: string) => {
  switch (role) {
    case 'maintenance_manager':
      return [
        { href: '/manager/dashboard', label: 'Dashboard' },
        { href: '/map', label: 'Mappa' },
        { href: '/manager/operators', label: 'Operatori' },
      ];
    case 'operator':
      return [
        { href: '/operator/tasks', label: 'I Miei Incarichi' },
        { href: '/map', label: 'Mappa' },
      ];
    case 'consortium_admin':
      return [
        { href: '/admin/dashboard', label: 'Dashboard Consorzio' },
        { href: '/map', label: 'Mappa' },
      ];
    case 'citizen':
    default:
      return [
        { href: '/', label: 'Home' },
        { href: '/map', label: 'Mappa' },
        { href: '/report', label: 'Segnala' },
        { href: '/my-tickets', label: 'I Miei Ticket' },
      ];
  }
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = getNavLinks(user?.role);

  // Recupera il nome della municipalità se l'utente ne ha una associata
  const municipalityName = user?.municipalityId 
    ? mockMunicipalities.find(m => m.id === user.municipalityId)?.name 
    : null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'maintenance_manager':
        return { label: 'Responsabile', icon: LayoutDashboard };
      case 'operator':
        return { label: 'Operatore', icon: Wrench };
      case 'consortium_admin':
        return { label: 'Admin Consorzio', icon: Building2 };
      default:
        return { label: 'Cittadino', icon: User };
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo e Municipalità */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="hidden font-semibold sm:inline-block">CityFix</span>
          </Link>

          {/* Badge Municipalità (Visibile solo se loggato e associato a un comune) */}
          {isAuthenticated && municipalityName && (
            <div className="hidden md:flex items-center px-2 py-1 rounded-md bg-secondary/10 border border-secondary/20">
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-secondary-foreground" />
              <span className="text-xs font-medium text-secondary-foreground">
                Comune di {municipalityName}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                location.pathname === link.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                 
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline text-sm">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span>{user?.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {user?.email}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-0.5">
                        {(() => {
                          const badge = getRoleBadge(user?.role);
                          const Icon = badge.icon;
                          return (
                            <>
                              <Icon className="w-3 h-3" />
                              {badge.label}
                            </>
                          );
                        })()}
                      </div>
                      {/* Municipalità nel menu per mobile o schermi piccoli */}
                      {municipalityName && (
                        <span className="text-xs text-muted-foreground md:hidden">
                          {municipalityName}
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profilo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Esci
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  Accedi
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Registrati</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-card"
          >
            <nav className="container py-4 flex flex-col gap-2">
              {isAuthenticated && (
                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-muted rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {(() => {
                        const badge = getRoleBadge(user?.role);
                        const Icon = badge.icon;
                        return <Icon className="w-3 h-3" />;
                      })()}
                      {getRoleBadge(user?.role).label}
                    </div>
                    {municipalityName && (
                      <p className="text-xs text-primary mt-0.5 truncate">
                        {municipalityName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium rounded-md transition-colors',
                    location.pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  className="mt-4 gap-2 text-destructive w-full justify-start px-4"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Esci
                </Button>
              ) : (
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Accedi</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>Registrati</Link>
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}