
import React, { Suspense, lazy, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "./components/Navbar";
import Loading from "./components/ui/Loading";

// Lazy load route components
const Index = lazy(() => import('./pages/Index'));
const About = lazy(() => import('./pages/About'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Subscription = lazy(() => import('./pages/Subscription'));
const ServicesAndPrices = lazy(() => import('./pages/ServicesAndPrices'));
const Schedule = lazy(() => import('./pages/Schedule'));
const CustomerLogin = lazy(() => import('./pages/auth/CustomerLogin'));
const CustomerRegister = lazy(() => import('./pages/auth/CustomerRegister'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const EmployeeLogin = lazy(() => import('./pages/auth/EmployeeLogin'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const EmployeeDashboard = lazy(() => import('./pages/employee/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ContactUs = lazy(() => import('./pages/ContactUs'));

// Admin Pages
const AdminEmployees = lazy(() => import('./pages/admin/Employees'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminPricing = lazy(() => import('./pages/admin/Pricing'));
const AdminSchedules = lazy(() => import('./pages/admin/Schedules'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminProperties = lazy(() => import('./pages/admin/Properties'));
const AdminServiceLogs = lazy(() => import('./pages/admin/ServiceLogs'));
const AdminGpsTracking = lazy(() => import('./pages/admin/GpsTracking'));
const AdminFleet = lazy(() => import('./pages/admin/Fleet'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminKnowledgeBase = lazy(() => import('./pages/admin/KnowledgeBase'));
const AdminSupportTickets = lazy(() => import('./pages/admin/SupportTickets'));

const App = () => {
  // Create memoized QueryClient to prevent unnecessary re-instantiation
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        networkMode: 'online',
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Suspense fallback={<Loading fullscreen={true} size="large" />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/services-and-prices" element={<ServicesAndPrices />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<ContactUs />} />

                {/* Auth Routes */}
                <Route path="/customer/login" element={<CustomerLogin />} />
                <Route path="/customer/register" element={<CustomerRegister />} />
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/employee/login" element={<EmployeeLogin />} />
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                
                {/* Admin Routes */}
                <Route path="/admin/employees" element={<AdminEmployees />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route path="/admin/pricing" element={<AdminPricing />} />
                <Route path="/admin/schedules" element={<AdminSchedules />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/properties" element={<AdminProperties />} />
                <Route path="/admin/service-logs" element={<AdminServiceLogs />} />
                <Route path="/admin/gps-tracking" element={<AdminGpsTracking />} />
                <Route path="/admin/fleet" element={<AdminFleet />} />
                <Route path="/admin/advanced-analytics" element={<AdminAnalytics />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/knowledge-base" element={<AdminKnowledgeBase />} />
                <Route path="/admin/support-tickets" element={<AdminSupportTickets />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(App);
