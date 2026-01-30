import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Map from "./pages/Map";
import Report from "./pages/Report";
import MyTickets from "./pages/MyTickets";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Role-specific Pages
import ManagerDashboard from "./pages/ManagerDashboard";
import OperatorTasks from "./pages/OperatorTasks";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/map" element={<Map />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Citizen Routes */}
            <Route 
              path="/report" 
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <Report />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-tickets" 
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <MyTickets />
                </ProtectedRoute>
              } 
            />

            {/* Manager Routes */}
            <Route 
              path="/manager/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['maintenance_manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/operators" 
              element={
                <ProtectedRoute allowedRoles={['maintenance_manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Operator Routes */}
            <Route 
              path="/operator/tasks" 
              element={
                <ProtectedRoute allowedRoles={['operator']}>
                  <OperatorTasks />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['consortium_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
