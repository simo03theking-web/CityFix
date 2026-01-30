import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, BarChart3, TrendingUp, Users, Ticket,
  CheckCircle, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { mockMunicipalities, mockTickets } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { STATUS_INFO, CATEGORY_INFO } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Stats aggregate per municipalità
  const municipalityStats = mockMunicipalities.map(mun => {
    const tickets = mockTickets.filter(t => t.municipalityId === mun.id);
    return {
      ...mun,
      totalTickets: tickets.length,
      received: tickets.filter(t => t.status === 'received').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      resolutionRate: tickets.length > 0 
        ? Math.round((tickets.filter(t => t.status === 'resolved').length / tickets.length) * 100) 
        : 0,
    };
  });

  // Totali consorzio
  const consortiumTotals = {
    totalTickets: mockTickets.length,
    received: mockTickets.filter(t => t.status === 'received').length,
    inProgress: mockTickets.filter(t => t.status === 'in_progress').length,
    resolved: mockTickets.filter(t => t.status === 'resolved').length,
    avgResolutionRate: Math.round(
      municipalityStats.reduce((acc, m) => acc + m.resolutionRate, 0) / municipalityStats.length
    ),
  };

  // Stats per categoria
  const categoryStats = Object.keys(CATEGORY_INFO).map(cat => ({
    category: cat,
    ...CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO],
    count: mockTickets.filter(t => t.category === cat).length,
  }));

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Consorzio</h1>
            <p className="text-muted-foreground">
              Panoramica aggregata di tutte le municipalità
            </p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Ultima Settimana</SelectItem>
              <SelectItem value="month">Ultimo Mese</SelectItem>
              <SelectItem value="quarter">Ultimo Trimestre</SelectItem>
              <SelectItem value="year">Ultimo Anno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Consortium Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Ticket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consortiumTotals.totalTickets}</p>
                  <p className="text-xs text-muted-foreground">Totale</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-info/10">
                  <AlertTriangle className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consortiumTotals.received}</p>
                  <p className="text-xs text-muted-foreground">Ricevuti</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consortiumTotals.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Corso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consortiumTotals.resolved}</p>
                  <p className="text-xs text-muted-foreground">Risolti</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consortiumTotals.avgResolutionRate}%</p>
                  <p className="text-xs text-muted-foreground">Tasso Risoluzione</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="municipalities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="municipalities" className="gap-2">
              <Building2 className="h-4 w-4" />
              Municipalità
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Categorie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="municipalities" className="space-y-4">
            {/* Municipality Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {municipalityStats.map((mun, index) => (
                <motion.div
                  key={mun.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          {mun.name}
                        </CardTitle>
                        <Badge 
                          variant={mun.resolutionRate >= 70 ? 'default' : mun.resolutionRate >= 40 ? 'secondary' : 'destructive'}
                        >
                          {mun.resolutionRate}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tasso di risoluzione</span>
                          <span className="font-medium">{mun.resolutionRate}%</span>
                        </div>
                        <Progress value={mun.resolutionRate} />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-info/10">
                          <p className="text-lg font-bold text-info">{mun.received}</p>
                          <p className="text-xs text-muted-foreground">Ricevuti</p>
                        </div>
                        <div className="p-2 rounded-lg bg-warning/10">
                          <p className="text-lg font-bold text-warning">{mun.inProgress}</p>
                          <p className="text-xs text-muted-foreground">In Corso</p>
                        </div>
                        <div className="p-2 rounded-lg bg-success/10">
                          <p className="text-lg font-bold text-success">{mun.resolved}</p>
                          <p className="text-xs text-muted-foreground">Risolti</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Totale ticket</span>
                        <span className="font-bold">{mun.totalTickets}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Confronto Municipalità</CardTitle>
                <CardDescription>Performance comparativa</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Municipalità</TableHead>
                      <TableHead className="text-center">Totale</TableHead>
                      <TableHead className="text-center">Ricevuti</TableHead>
                      <TableHead className="text-center">In Corso</TableHead>
                      <TableHead className="text-center">Risolti</TableHead>
                      <TableHead className="text-center">Tasso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {municipalityStats.map((mun) => (
                      <TableRow key={mun.id}>
                        <TableCell className="font-medium">{mun.name}</TableCell>
                        <TableCell className="text-center">{mun.totalTickets}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                            {mun.received}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                            {mun.inProgress}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            {mun.resolved}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {mun.resolutionRate >= 50 ? (
                              <ArrowUpRight className="h-4 w-4 text-success" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-destructive" />
                            )}
                            <span className={mun.resolutionRate >= 50 ? 'text-success' : 'text-destructive'}>
                              {mun.resolutionRate}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.map((cat, index) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div 
                          className="p-3 rounded-full"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <BarChart3 
                            className="h-6 w-6" 
                            style={{ color: cat.color }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{cat.label}</p>
                          <p className="text-2xl font-bold">{cat.count}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {Math.round((cat.count / mockTickets.length) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">del totale</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
