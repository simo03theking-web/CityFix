import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from '@/lib/api'; // Importa l'API vera

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, municipalityId: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inizializza lo stato dal localStorage al mount
  useEffect(() => {
    const savedToken = localStorage.getItem('cityfix_token');
    const savedUser = localStorage.getItem('cityfix_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('cityfix_token');
        localStorage.removeItem('cityfix_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // CHIAMATA REALE AL BACKEND
      const response = await authApi.login(email, password);
      
      const loggedUser = response.user;
      const loggedToken = response.token;

      setUser(loggedUser);
      setToken(loggedToken);
      
      // Salva nel browser
      localStorage.setItem('cityfix_token', loggedToken);
      localStorage.setItem('cityfix_user', JSON.stringify(loggedUser));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, municipalityId: string): Promise<void> => {
    setIsLoading(true);
    try {
        // CHIAMATA REALE AL BACKEND
        await authApi.register({ name, email, password, municipalityId });
        // Dopo la registrazione non facciamo login automatico (per scelta UX), 
        // l'utente verrà reindirizzato al login dalla pagina Register.tsx
    } catch (error) {
        console.error("Register error:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cityfix_token');
    localStorage.removeItem('cityfix_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


