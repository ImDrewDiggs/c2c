
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import About from "./pages/About";
import Testimonials from "./pages/Testimonials";
import Subscription from "./pages/Subscription";
import ServicesAndPrices from "./pages/ServicesAndPrices";
import Schedule from "./pages/Schedule";
import CustomerLogin from "./pages/auth/CustomerLogin";
import CustomerRegister from "./pages/auth/CustomerRegister";
import CustomerDashboard from "./pages/customer/Dashboard";
import EmployeeLogin from "./pages/auth/EmployeeLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import EmployeeDashboard from "./pages/employee/Dashboard";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import ContactUs from "./pages/ContactUs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/services-and-prices" element={<ServicesAndPrices />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/register" element={<CustomerRegister />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/employee/login" element={<EmployeeLogin />} />
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
