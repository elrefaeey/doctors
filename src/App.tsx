import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRoute, DoctorRoute, PatientRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RoleSelection from "./pages/RoleSelection";
import PatientLogin from "./pages/PatientLogin";
import PatientRegister from "./pages/PatientRegister";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorSearch from "./pages/DoctorSearch";
import DoctorProfile from "./pages/DoctorProfile";
import PatientDashboard from "./pages/PatientDashboard";
import PatientSettings from "./pages/PatientSettings";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorSettings from "./pages/DoctorSettings";
import DoctorSubscriptionPlans from "./pages/DoctorSubscriptionPlans";
import AdminDashboard from "./pages/AdminDashboard";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/role-select" element={<RoleSelection />} />
              <Route path="/login/patient" element={<PatientLogin />} />
              <Route path="/register/patient" element={<PatientRegister />} />
              <Route path="/login/doctor" element={<DoctorLogin />} />
              <Route path="/doctors" element={<DoctorSearch />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />

              {/* Protected Routes */}
              <Route
                path="/patient/dashboard"
                element={
                  <PatientRoute>
                    <PatientDashboard />
                  </PatientRoute>
                }
              />
              <Route
                path="/patient/settings"
                element={
                  <PatientRoute>
                    <PatientSettings />
                  </PatientRoute>
                }
              />
              <Route
                path="/doctor/dashboard"
                element={
                  <DoctorRoute>
                    <DoctorDashboard />
                  </DoctorRoute>
                }
              />
              <Route
                path="/doctor/settings"
                element={
                  <DoctorRoute>
                    <DoctorSettings />
                  </DoctorRoute>
                }
              />
              <Route
                path="/doctor/subscription-plans"
                element={
                  <DoctorRoute>
                    <DoctorSubscriptionPlans />
                  </DoctorRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route path="/chat" element={<Chat />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
