import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Camera, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_INFO, TicketCategory } from '@/types';
import { ticketApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import 'leaflet/dist/leaflet.css';
import { useToast } from '@/hooks/use-toast';

// Fix marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map position updates
function MapCenterUpdater({ position }: { position: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
}

// Component to handle map click events
function MapClickHandler({ onPositionChange }: { onPositionChange: (pos: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function Report() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  // Form state
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<TicketCategory | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error('Geolocation error:', err);
        }
      );
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async () => {
    if (!position || !title || !category) return;

    setIsSubmitting(true);
    try {
      // Chiamata REALE al Backend
      await ticketApi.create({
        title,
        description,
        category: category as any, // Cast necessario se i tipi non combaciano perfettamente
        location: {
            lat: position[0],
            lng: position[1],
            address: address || 'Posizione su mappa'
        },
        // Nota: Le foto vere richiedono FormData complesso, per ora inviamo array vuoto o mock
        // photos: [] 
      });

      setIsSuccess(true);
      toast({
        title: "Segnalazione Inviata",
        description: "Il tuo ticket è stato registrato nel sistema."
      });
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Errore",
        description: "Impossibile inviare la segnalazione.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return position !== null;
    if (step === 2) return category !== '' && title.length > 0;
    return true;
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="container py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Segnalazione Inviata!</h1>
            <p className="text-muted-foreground mb-8">
              La tua segnalazione è stata ricevuta e sarà presa in carico a breve. 
              Riceverai notifiche sugli aggiornamenti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => {
                setStep(1);
                setPosition(null);
                setCategory('');
                setTitle('');
                setDescription('');
                setPhotos([]);
                setIsSuccess(false);
              }}>
                Nuova Segnalazione
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/my-tickets'}>
                I Miei Ticket
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">Nuova Segnalazione</h1>
            <p className="text-muted-foreground">
              Segnala un problema nella tua città in pochi passaggi
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Posizione
                  </CardTitle>
                  <CardDescription>
                    Indica sulla mappa dove si trova il problema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-80 rounded-lg overflow-hidden border border-border">
                    <MapContainer
                      center={[40.6824, 14.7681]}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <MapClickHandler onPositionChange={setPosition} />
                      <MapCenterUpdater position={position} />
                      {position && <Marker position={position} />}
                    </MapContainer>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={handleGetLocation}
                    >
                      <MapPin className="h-4 w-4" />
                      Usa la mia posizione
                    </Button>
                  </div>

                  {position && (
                    <div>
                      <Label htmlFor="address">Indirizzo (opzionale)</Label>
                      <Input
                        id="address"
                        placeholder="Via Roma 45, Salerno"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Dettagli</CardTitle>
                  <CardDescription>
                    Descrivi il problema nel modo più dettagliato possibile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            {info.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Titolo *</Label>
                    <Input
                      id="title"
                      placeholder="Es: Buca pericolosa in Via Roma"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrizione</Label>
                    <Textarea
                      id="description"
                      placeholder="Descrivi il problema nel dettaglio..."
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Foto (Opzionale)
                  </CardTitle>
                  <CardDescription>
                    Aggiungi foto per documentare meglio il problema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
                    >
                      <Camera className="h-6 w-6" />
                      <span className="text-xs">Aggiungi</span>
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">Riepilogo</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Categoria:</dt>
                        <dd>{category ? CATEGORY_INFO[category].label : '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Titolo:</dt>
                        <dd className="truncate max-w-[200px]">{title || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Foto:</dt>
                        <dd>{photos.length}</dd>
                      </div>
                    </dl>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Indietro
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Continua
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Invia Segnalazione
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
