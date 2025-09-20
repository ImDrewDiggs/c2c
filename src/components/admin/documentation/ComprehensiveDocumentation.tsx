import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Truck, 
  Calendar,
  MapPin,
  DollarSign,
  Settings,
  Bell,
  Search,
  FileText,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  Database,
  Key,
  Eye,
  Activity,
  Clipboard,
  Mail,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Wrench,
  Monitor,
  Lock,
  GitBranch,
  RefreshCw
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DocumentationSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime?: string;
  category: string;
}

export function ComprehensiveDocumentation() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const expandAll = () => {
    const allSectionIds = new Set([
      ...gettingStartedSections.map(s => s.id),
      ...adminManagementSections.map(s => s.id),
      ...customerManagementSections.map(s => s.id),
      ...employeeManagementSections.map(s => s.id),
      ...operationsManagementSections.map(s => s.id),
      ...fleetManagementSections.map(s => s.id),
      ...analyticsReportingSections.map(s => s.id),
      ...securityAndAuditSections.map(s => s.id),
      ...troubleshootingSections.map(s => s.id),
      ...advancedFeaturesSections.map(s => s.id)
    ]);
    setOpenSections(allSectionIds);
  };

  const collapseAll = () => {
    setOpenSections(new Set());
  };

  const gettingStartedSections: DocumentationSection[] = [
    {
      id: "system-overview",
      title: "System Overview & Architecture",
      icon: Monitor,
      difficulty: "Beginner",
      estimatedTime: "10 minutes",
      category: "getting-started",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">🎯 System Purpose</h4>
            <p className="text-blue-800">
              Can2Curb is a comprehensive waste management platform designed to streamline operations, 
              manage customers, track employees, and provide real-time analytics for waste collection businesses.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🏗️ System Architecture</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h5 className="font-medium mb-2">Frontend Components</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>React + TypeScript application</li>
                  <li>Tailwind CSS for styling</li>
                  <li>Supabase for real-time data</li>
                  <li>Responsive design for all devices</li>
                </ul>
              </Card>
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">Backend Services</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Supabase PostgreSQL database</li>
                  <li>Row Level Security (RLS) policies</li>
                  <li>Edge functions for business logic</li>
                  <li>Real-time subscriptions</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">👥 User Roles & Permissions</h4>
            <div className="space-y-3">
              <Card className="p-3 border-l-4 border-l-green-500">
                <h5 className="font-medium text-green-700">Super Admin</h5>
                <p className="text-sm text-green-600">Full system access, user management, security settings</p>
              </Card>
              <Card className="p-3 border-l-4 border-l-blue-500">
                <h5 className="font-medium text-blue-700">Admin</h5>
                <p className="text-sm text-blue-600">Operations management, customer service, analytics</p>
              </Card>
              <Card className="p-3 border-l-4 border-l-yellow-500">
                <h5 className="font-medium text-yellow-700">Employee</h5>
                <p className="text-sm text-yellow-600">Time tracking, job assignments, route management</p>
              </Card>
              <Card className="p-3 border-l-4 border-l-purple-500">
                <h5 className="font-medium text-purple-700">Customer</h5>
                <p className="text-sm text-purple-600">Service requests, billing, account management</p>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "admin-login-setup",
      title: "Admin Login & Initial Setup",
      icon: Key,
      difficulty: "Beginner",
      estimatedTime: "15 minutes",
      category: "getting-started",
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">🔐 Security Notice</h4>
            <p className="text-red-800">
              Currently, only <code>diggs844037@yahoo.com</code> has admin access. This is a security feature 
              to prevent unauthorized access during initial setup.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🚀 First Time Login</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Navigate to Admin Login:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <code>/admin/login</code> in your browser</li>
                  <li>You'll see the admin login interface</li>
                </ul>
              </li>
              
              <li>
                <strong>Enter Credentials:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Email: <code>diggs844037@yahoo.com</code></li>
                  <li>Password: [Your admin password]</li>
                  <li>Click "Sign In"</li>
                </ul>
              </li>

              <li>
                <strong>Dashboard Access:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Upon successful login, you'll be redirected to the admin dashboard</li>
                  <li>You'll see the main navigation tabs: Operations, Employees, Analytics, Users</li>
                  <li>The system will display real-time data (no mock data)</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Password Security</h4>
            <ul className="list-disc list-inside text-yellow-800 space-y-1">
              <li>Passwords are securely hashed in the database</li>
              <li>No plaintext passwords are stored anywhere in the system</li>
              <li>Change default passwords immediately after first login</li>
              <li>Use strong passwords with a mix of characters</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const adminManagementSections: DocumentationSection[] = [
    {
      id: "dashboard-overview",
      title: "Admin Dashboard Complete Guide",
      icon: Activity,
      difficulty: "Intermediate",
      estimatedTime: "20 minutes",
      category: "admin-management",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📊 Dashboard Overview</h4>
            <p className="text-blue-800">
              The admin dashboard provides real-time insights into your business operations, 
              employee activity, customer management, and financial performance.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🎛️ Dashboard Components</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Stats Overview Panel</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Today's Pickups:</strong> Real-time count from assignments table</li>
                  <li><strong>Active Employees:</strong> Live GPS tracking data</li>
                  <li><strong>Pending Pickups:</strong> Assignments with 'pending' status</li>
                  <li><strong>Today's Revenue:</strong> Calculated from completed orders</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">Quick Access Groups</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Customer Management:</strong> Add customers, create subscriptions</li>
                  <li><strong>Employee Management:</strong> Add employees, assign vehicles</li>
                  <li><strong>Fleet Management:</strong> Vehicle tracking, maintenance scheduling</li>
                  <li><strong>Operations:</strong> New pickups, notifications, search</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-500">
                <h5 className="font-medium mb-2">Navigation Tabs</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Operations:</strong> Live map, service areas, scheduled jobs</li>
                  <li><strong>Employees:</strong> Employee status, GPS locations, activity logs</li>
                  <li><strong>Analytics:</strong> Business metrics, revenue charts, KPIs</li>
                  <li><strong>Users:</strong> Complete user management for all roles</li>
                  <li><strong>Documentation:</strong> This comprehensive guide</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🔄 Real-Time Updates</h4>
            <div className="space-y-3">
              <p>All dashboard data updates automatically every 30 seconds, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Employee GPS locations and online status</li>
                <li>Assignment status changes and completions</li>
                <li>New customer registrations and orders</li>
                <li>Revenue calculations and financial metrics</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "user-management-complete",
      title: "Complete User Management System",
      icon: Users,
      difficulty: "Advanced",
      estimatedTime: "30 minutes",
      category: "admin-management",
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">👥 User Management Features</h4>
            <p className="text-green-800">
              Comprehensive user management with role-based access control, secure authentication, 
              and detailed audit logging for all user actions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🔧 Adding New Users</h4>
            <div className="space-y-4">
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">👨‍💼 Adding Employees</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Navigate to <strong>Users Tab</strong> → <strong>Employees</strong></li>
                  <li>Click <strong>"Add Employee"</strong> button</li>
                  <li>Fill required information:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Full name (required)</li>
                      <li>Email address (must be unique)</li>
                      <li>Phone number</li>
                      <li>Physical address</li>
                      <li>Driver's license number</li>
                      <li>Hourly pay rate</li>
                      <li>Job title (Driver, Can Courier, Can Cleaner, Supervisor, Trainee)</li>
                      <li>Employment status (Active, On Leave, Inactive)</li>
                    </ul>
                  </li>
                  <li>System automatically creates user account with temporary password</li>
                  <li>Employee receives email with login credentials</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">🏠 Adding Customers</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Go to <strong>Quick Access</strong> → <strong>Customer Management</strong></li>
                  <li>Click <strong>"Add Customer"</strong></li>
                  <li>Complete customer profile:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Personal information (name, email, phone)</li>
                      <li>Service address (where pickup occurs)</li>
                      <li>Billing address (if different)</li>
                      <li>Service preferences and special instructions</li>
                    </ul>
                  </li>
                  <li>Customer account is created with email verification</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">🛡️ Adding Admin Users (Super Admin Only)</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Only available to verified super admin accounts</li>
                  <li>Navigate to <strong>Users Tab</strong> → <strong>Admins</strong></li>
                  <li>Click <strong>"Add User"</strong></li>
                  <li>Admin creation requires approval and verification process</li>
                  <li>New admin accounts have limited privileges initially</li>
                </ol>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">✏️ Editing User Information</h4>
            <div className="space-y-3">
              <p>All user information can be modified through the admin interface:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Personal Information:</strong> Name, contact details, addresses</li>
                <li><strong>Employment Details:</strong> Job title, pay rate, status changes</li>
                <li><strong>Access Controls:</strong> Role modifications, permission updates</li>
                <li><strong>Account Status:</strong> Active, inactive, or suspended states</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">🗑️ User Deletion (Super Admin Only)</h4>
            <ul className="list-disc list-inside text-red-800 space-y-1">
              <li>User deletion is permanent and cannot be undone</li>
              <li>All user data, assignments, and history are removed</li>
              <li>Requires explicit confirmation and audit logging</li>
              <li>Consider deactivation instead of deletion for data retention</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const customerManagementSections: DocumentationSection[] = [
    {
      id: "customer-lifecycle-complete",
      title: "Complete Customer Lifecycle Management",
      icon: Users,
      difficulty: "Intermediate",
      estimatedTime: "25 minutes",
      category: "customer-management",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">🎯 Customer Management Overview</h4>
            <p className="text-blue-800">
              Comprehensive customer relationship management from initial contact through 
              ongoing service delivery, billing, and support.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📋 Customer Onboarding Process</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Initial Customer Registration:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Customer completes online registration form</li>
                  <li>System validates email and creates profile in database</li>
                  <li>Email verification sent automatically</li>
                  <li>Customer status set to "pending verification"</li>
                </ul>
              </li>
              
              <li>
                <strong>Service Address Setup:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>GPS coordinates captured for accurate routing</li>
                  <li>Service area validation ensures coverage</li>
                  <li>Special instructions and access notes recorded</li>
                  <li>Pickup schedule preferences established</li>
                </ul>
              </li>

              <li>
                <strong>Subscription Configuration:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Service plan selection (Basic, Premium, Deluxe)</li>
                  <li>Billing cycle setup (Monthly, Quarterly, Annual)</li>
                  <li>Payment method configuration and verification</li>
                  <li>First invoice generation and payment processing</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">💳 Subscription Management</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">Creating New Subscriptions</h5>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Access via <strong>Quick Access</strong> → <strong>Billing Management</strong></li>
                  <li>Select customer from searchable dropdown</li>
                  <li>Choose plan type: Single Family, Multi-Family, Commercial</li>
                  <li>Configure service frequency and special features</li>
                  <li>Set pricing and apply discounts if applicable</li>
                  <li>Generate first invoice and process payment</li>
                </ol>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Subscription Modifications</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Plan Upgrades:</strong> Prorated billing adjustments</li>
                  <li><strong>Service Changes:</strong> Frequency modifications, feature additions</li>
                  <li><strong>Temporary Suspension:</strong> Vacation holds, temporary pauses</li>
                  <li><strong>Address Changes:</strong> Service location updates with route reassignment</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-yellow-500">
                <h5 className="font-medium mb-2">Billing & Payment Processing</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Automated monthly billing with invoice generation</li>
                  <li>Multiple payment methods: Credit card, ACH, check</li>
                  <li>Failed payment handling with retry logic</li>
                  <li>Late fee application and collection procedures</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🎧 Customer Support Features</h4>
            <div className="space-y-3">
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Service Request Management:</strong> Missed pickup reports, special requests</li>
                <li><strong>Billing Dispute Resolution:</strong> Credit applications, refund processing</li>
                <li><strong>Communication Log:</strong> All customer interactions tracked and recorded</li>
                <li><strong>Feedback Collection:</strong> Service ratings and improvement suggestions</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "billing-payment-system",
      title: "Advanced Billing & Payment System",
      icon: CreditCard,
      difficulty: "Advanced",
      estimatedTime: "35 minutes",
      category: "customer-management",
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">💰 Billing System Features</h4>
            <p className="text-green-800">
              Comprehensive billing and payment processing with automated invoicing, 
              multiple payment methods, and detailed financial reporting.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🧾 Invoice Generation & Management</h4>
            <div className="space-y-4">
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">Automated Billing Cycle</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>System automatically generates invoices based on subscription billing cycle</li>
                  <li>Invoices include:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Base service charges</li>
                      <li>Additional service fees</li>
                      <li>Applicable taxes and surcharges</li>
                      <li>Previous balance and credits</li>
                      <li>Payment due date and terms</li>
                    </ul>
                  </li>
                  <li>PDF invoices automatically emailed to customers</li>
                  <li>Customer portal access for invoice viewing and payment</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">Manual Invoice Adjustments</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Credits:</strong> Service disruptions, customer complaints</li>
                  <li><strong>Additional Charges:</strong> Special pickups, excess waste</li>
                  <li><strong>Discounts:</strong> Promotional pricing, loyalty programs</li>
                  <li><strong>Pro-rated Billing:</strong> Mid-cycle plan changes</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">💳 Payment Processing</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Supported Payment Methods</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Credit/Debit Cards:</strong> Visa, MasterCard, American Express, Discover</li>
                  <li><strong>ACH Bank Transfers:</strong> Direct bank account debits</li>
                  <li><strong>Online Payments:</strong> Customer portal with saved payment methods</li>
                  <li><strong>Manual Payments:</strong> Cash, check, money order processing</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">Payment Security & Compliance</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>PCI DSS compliant payment processing through Stripe</li>
                  <li>Encrypted payment data transmission and storage</li>
                  <li>Fraud detection and prevention measures</li>
                  <li>Secure customer payment method storage</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-yellow-500">
                <h5 className="font-medium mb-2">Failed Payment Handling</h5>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Automatic retry attempts with smart retry logic</li>
                  <li>Customer notification of failed payments</li>
                  <li>Grace period before service suspension</li>
                  <li>Late fee application after specified timeframe</li>
                  <li>Collections process for seriously delinquent accounts</li>
                </ol>
              </Card>
            </div>
          </div>
        </div>
      )
    }
  ];

  const employeeManagementSections: DocumentationSection[] = [
    {
      id: "employee-lifecycle",
      title: "Complete Employee Lifecycle Management",
      icon: Users,
      difficulty: "Intermediate",
      estimatedTime: "30 minutes",
      category: "employee-management",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">👷 Employee Management Overview</h4>
            <p className="text-purple-800">
              Complete employee lifecycle management from hiring through performance tracking, 
              scheduling, payroll, and offboarding processes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📝 Employee Onboarding</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">New Employee Registration</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Navigate to <strong>Quick Access</strong> → <strong>Employee Management</strong></li>
                  <li>Click <strong>"Add Employee"</strong> button</li>
                  <li>Complete employee profile form:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li><strong>Personal Information:</strong> Full name, email, phone</li>
                      <li><strong>Address:</strong> Home address for records and emergency contact</li>
                      <li><strong>Employment Details:</strong> Job title, department, start date</li>
                      <li><strong>Compensation:</strong> Hourly rate, salary, commission structure</li>
                      <li><strong>Credentials:</strong> Driver's license, certifications, training records</li>
                    </ul>
                  </li>
                  <li>System generates unique employee ID and login credentials</li>
                  <li>Welcome email sent with login instructions and company policies</li>
                </ol>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Job Roles & Responsibilities</h5>
                <div className="space-y-2">
                  <div><strong>Driver:</strong> Primary waste collection vehicle operator</div>
                  <div><strong>Can Courier:</strong> Residential pickup specialist</div>
                  <div><strong>Can Cleaner:</strong> Container washing and maintenance</div>
                  <div><strong>Supervisor:</strong> Route oversight and quality control</div>
                  <div><strong>Trainee:</strong> New employee in training period</div>
                </div>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📍 GPS Tracking & Location Management</h4>
            <div className="space-y-4">
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">Real-Time Employee Tracking</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>GPS location updates every 30 seconds during work hours</li>
                  <li>Clock-in/clock-out location verification</li>
                  <li>Route compliance monitoring and alerts</li>
                  <li>Emergency location services for employee safety</li>
                  <li>Privacy controls for off-duty hours</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">Location Data Usage</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Route Optimization:</strong> Analyzing travel patterns for efficiency</li>
                  <li><strong>Time Verification:</strong> Confirming work hours and job site presence</li>
                  <li><strong>Safety Monitoring:</strong> Emergency response and check-ins</li>
                  <li><strong>Performance Analytics:</strong> Productivity and efficiency metrics</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">⏰ Time Tracking & Payroll</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-yellow-500">
                <h5 className="font-medium mb-2">Automated Time Tracking</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Employees clock in/out using mobile app with GPS verification</li>
                  <li>System automatically calculates:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Regular hours vs. overtime (40+ hours/week)</li>
                      <li>Break time deductions</li>
                      <li>Travel time between job sites</li>
                      <li>Total hours per day, week, pay period</li>
                    </ul>
                  </li>
                  <li>Supervisors can review and approve time entries</li>
                  <li>Payroll integration with automatic calculation</li>
                </ol>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">Payroll Processing</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Bi-weekly or monthly payroll cycles</li>
                  <li>Automatic overtime calculation at 1.5x rate</li>
                  <li>Tax withholding and benefits deductions</li>
                  <li>Direct deposit setup and pay stub generation</li>
                  <li>Year-end tax document preparation (W-2, 1099)</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "performance-scheduling",
      title: "Performance Tracking & Scheduling",
      icon: Calendar,
      difficulty: "Advanced",
      estimatedTime: "25 minutes",
      category: "employee-management",
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2">📈 Performance & Scheduling</h4>
            <p className="text-orange-800">
              Advanced performance monitoring, intelligent scheduling, and productivity analytics 
              for optimal workforce management.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📊 Performance Metrics</h4>
            <div className="space-y-4">
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">Key Performance Indicators (KPIs)</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Route Completion Rate:</strong> Percentage of assigned pickups completed on time</li>
                  <li><strong>Efficiency Score:</strong> Time per pickup compared to route standards</li>
                  <li><strong>Customer Satisfaction:</strong> Ratings and feedback from customers</li>
                  <li><strong>Safety Record:</strong> Incidents, accidents, and safety violations</li>
                  <li><strong>Attendance:</strong> Punctuality, absenteeism, schedule adherence</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">Performance Review Process</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Monthly performance data collection and analysis</li>
                  <li>Quarterly performance reviews with supervisors</li>
                  <li>Goal setting and improvement plan development</li>
                  <li>Annual performance evaluation and compensation review</li>
                  <li>Recognition and reward programs for top performers</li>
                </ol>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📅 Advanced Scheduling</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-purple-500">
                <h5 className="font-medium mb-2">Intelligent Route Assignment</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>AI-powered route optimization based on historical data</li>
                  <li>Employee skill matching to route requirements</li>
                  <li>Vehicle availability and maintenance schedules</li>
                  <li>Customer preferences and special requirements</li>
                  <li>Dynamic reassignment for sick days and emergencies</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Schedule Management Tools</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Shift Planning:</strong> Weekly and monthly schedule creation</li>
                  <li><strong>Time-Off Requests:</strong> Vacation, sick leave, personal time</li>
                  <li><strong>Overtime Management:</strong> Fair distribution and cost control</li>
                  <li><strong>On-Call Rotation:</strong> Emergency response coverage</li>
                  <li><strong>Training Schedules:</strong> Mandatory and continuing education</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )
    }
  ];

  const operationsManagementSections: DocumentationSection[] = [
    {
      id: "operations-overview",
      title: "Operations Management Center",
      icon: Activity,
      difficulty: "Intermediate",
      estimatedTime: "20 minutes",
      category: "operations-management",
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-2">🎯 Operations Command Center</h4>
            <p className="text-indigo-800">
              Central hub for real-time operations management, route monitoring, 
              service area coverage, and live GPS tracking of all field operations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🗺️ Live GPS Map & Tracking</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">Real-Time Fleet Monitoring</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Live GPS locations of all active vehicles and employees</li>
                  <li>Route progress indicators and completion status</li>
                  <li>Traffic and weather conditions affecting operations</li>
                  <li>Emergency alerts and incident notifications</li>
                  <li>Customer location markers with service status</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Service Area Management</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Zone Coverage:</strong> Visual representation of service territories</li>
                  <li><strong>Route Optimization:</strong> AI-powered efficient route planning</li>
                  <li><strong>Capacity Planning:</strong> Vehicle load optimization and scheduling</li>
                  <li><strong>Coverage Gaps:</strong> Identification of unserved or underserved areas</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📋 Scheduled Jobs Management</h4>
            <div className="space-y-4">
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">Job Assignment System</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Automatic daily job generation based on customer schedules</li>
                  <li>Intelligent assignment to available employees and vehicles</li>
                  <li>Priority handling for special requests and time-sensitive pickups</li>
                  <li>Real-time updates on job status and completion</li>
                  <li>Exception handling for missed or incomplete pickups</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">Job Status Tracking</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span><strong>Pending:</strong> Job assigned but not yet started</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span><strong>In Progress:</strong> Employee en route or at location</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                    <span><strong>Completed:</strong> Pickup completed successfully</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                    <span><strong>Exception:</strong> Issue requiring attention</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📊 Activity Logs & Monitoring</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-yellow-500">
                <h5 className="font-medium mb-2">Real-Time Activity Feed</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Employee clock-in/clock-out events</li>
                  <li>Job start and completion notifications</li>
                  <li>Vehicle maintenance alerts and updates</li>
                  <li>Customer service requests and complaints</li>
                  <li>System errors and technical issues</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-red-500">
                <h5 className="font-medium mb-2">Alert Management</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>High Priority:</strong> Emergency situations, safety incidents</li>
                  <li><strong>Medium Priority:</strong> Route delays, vehicle issues</li>
                  <li><strong>Low Priority:</strong> Schedule changes, routine notifications</li>
                  <li>Customizable alert thresholds and notification preferences</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )
    }
  ];

  const fleetManagementSections: DocumentationSection[] = [
    {
      id: "fleet-comprehensive",
      title: "Comprehensive Fleet Management",
      icon: Truck,
      difficulty: "Advanced",
      estimatedTime: "40 minutes",
      category: "fleet-management",
      content: (
        <div className="space-y-6">
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-teal-900 mb-2">🚛 Fleet Management Overview</h4>
            <p className="text-teal-800">
              Complete fleet lifecycle management including vehicle acquisition, maintenance scheduling, 
              performance monitoring, and disposal planning.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🚗 Vehicle Registration & Management</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">Adding New Vehicles</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Navigate to <strong>Quick Access</strong> → <strong>Fleet Management</strong></li>
                  <li>Click <strong>"Add Vehicle"</strong> button</li>
                  <li>Complete vehicle registration form:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li><strong>Basic Information:</strong> Make, model, year, VIN</li>
                      <li><strong>Registration:</strong> License plate, registration number</li>
                      <li><strong>Specifications:</strong> Capacity, fuel type, transmission</li>
                      <li><strong>Purchase Details:</strong> Date acquired, cost, financing</li>
                      <li><strong>Insurance:</strong> Policy numbers, coverage details</li>
                    </ul>
                  </li>
                  <li>Upload vehicle documentation (registration, insurance, inspection)</li>
                  <li>Assign unique vehicle number for internal tracking</li>
                </ol>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Vehicle Types & Classifications</h5>
                <div className="space-y-2">
                  <div><strong>Compactor Trucks:</strong> Front-loading and rear-loading waste collection</div>
                  <div><strong>Roll-Off Trucks:</strong> Large container pickup and delivery</div>
                  <div><strong>Side-Loaders:</strong> Automated residential collection</div>
                  <div><strong>Utility Vehicles:</strong> Maintenance and supervisory functions</div>
                  <div><strong>Support Vehicles:</strong> Parts delivery, emergency response</div>
                </div>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🔧 Maintenance Management</h4>
            <div className="space-y-4">
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">Preventive Maintenance Scheduling</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Time-Based:</strong> Oil changes, inspections, tire rotations</li>
                  <li><strong>Mileage-Based:</strong> Engine service, transmission maintenance</li>
                  <li><strong>Usage-Based:</strong> Hydraulic system checks, PTO maintenance</li>
                  <li><strong>Condition-Based:</strong> Brake inspections, emissions testing</li>
                  <li>Automated scheduling with email and SMS reminders</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">Maintenance Record Keeping</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Complete maintenance history for each vehicle</li>
                  <li>Parts inventory tracking and automatic reordering</li>
                  <li>Service provider management and performance tracking</li>
                  <li>Warranty tracking and claim management</li>
                  <li>Cost analysis and budgeting for maintenance expenses</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-red-500">
                <h5 className="font-medium mb-2">Emergency Maintenance</h5>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>24/7 breakdown reporting system</li>
                  <li>Emergency service provider network</li>
                  <li>Temporary vehicle allocation for route coverage</li>
                  <li>Priority repair scheduling for critical vehicles</li>
                  <li>Insurance claim processing for accident damage</li>
                </ol>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📈 Fleet Performance Analytics</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-purple-500">
                <h5 className="font-medium mb-2">Key Performance Metrics</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Utilization Rate:</strong> Percentage of time vehicles are in active use</li>
                  <li><strong>Fuel Efficiency:</strong> Miles per gallon and cost per mile analysis</li>
                  <li><strong>Maintenance Costs:</strong> Cost per mile and cost per hour operated</li>
                  <li><strong>Downtime Analysis:</strong> Scheduled vs. unscheduled maintenance time</li>
                  <li><strong>Driver Performance:</strong> Safety scores and efficiency ratings</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-orange-500">
                <h5 className="font-medium mb-2">Fleet Optimization Recommendations</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Right-sizing fleet based on demand patterns</li>
                  <li>Vehicle replacement timing optimization</li>
                  <li>Route efficiency improvements</li>
                  <li>Fuel cost reduction strategies</li>
                  <li>Maintenance cost optimization</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )
    }
  ];

  const analyticsReportingSections: DocumentationSection[] = [
    {
      id: "analytics-comprehensive",
      title: "Advanced Analytics & Business Intelligence",
      icon: BarChart3,
      difficulty: "Advanced",
      estimatedTime: "35 minutes",
      category: "analytics-reporting",
      content: (
        <div className="space-y-6">
          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
            <h4 className="font-semibold text-pink-900 mb-2">📊 Analytics & Reporting</h4>
            <p className="text-pink-800">
              Comprehensive business intelligence platform with real-time analytics, 
              predictive insights, and customizable reporting for data-driven decision making.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📈 Financial Analytics</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">Revenue Analysis</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Daily Revenue:</strong> Real-time tracking of completed payments</li>
                  <li><strong>Monthly Recurring Revenue (MRR):</strong> Subscription-based income analysis</li>
                  <li><strong>Revenue by Service Type:</strong> Breakdown by plan tiers and services</li>
                  <li><strong>Revenue Forecasting:</strong> Predictive modeling for future income</li>
                  <li><strong>Seasonal Trends:</strong> Historical patterns and seasonal adjustments</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Cost & Profitability Analysis</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Operating Expenses:</strong> Fuel, maintenance, labor costs</li>
                  <li><strong>Cost per Customer:</strong> Service delivery cost analysis</li>
                  <li><strong>Route Profitability:</strong> Profit margins by geographic area</li>
                  <li><strong>Vehicle ROI:</strong> Return on investment for fleet assets</li>
                  <li><strong>Margin Analysis:</strong> Gross and net profit margins by service</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📊 Operational Analytics</h4>
            <div className="space-y-4">
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">Service Performance Metrics</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>On-Time Performance:</strong> Percentage of pickups completed on schedule</li>
                  <li><strong>Route Efficiency:</strong> Time and fuel consumption per route</li>
                  <li><strong>Customer Satisfaction:</strong> Service ratings and feedback analysis</li>
                  <li><strong>Completion Rates:</strong> Successfully completed vs. missed pickups</li>
                  <li><strong>Service Exceptions:</strong> Issues requiring special handling</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">Employee Performance Analytics</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Productivity Metrics:</strong> Pickups per hour, route completion times</li>
                  <li><strong>Attendance Tracking:</strong> Punctuality, absenteeism patterns</li>
                  <li><strong>Safety Performance:</strong> Incident rates, safety violations</li>
                  <li><strong>Training Compliance:</strong> Certification status and renewal tracking</li>
                  <li><strong>Performance Trends:</strong> Individual and team performance over time</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📋 Custom Reporting</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-purple-500">
                <h5 className="font-medium mb-2">Report Generation</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Navigate to <strong>Admin Dashboard</strong> → <strong>Analytics Tab</strong></li>
                  <li>Select report type: Financial, Operations, Customers, Employees</li>
                  <li>Configure report parameters:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Date range selection</li>
                      <li>Data filters and grouping options</li>
                      <li>Visualization preferences (charts, tables, graphs)</li>
                      <li>Export format (PDF, CSV, Excel)</li>
                    </ul>
                  </li>
                  <li>Generate and download report</li>
                  <li>Schedule automated report delivery via email</li>
                </ol>
              </Card>

              <Card className="p-4 border-l-4 border-l-orange-500">
                <h5 className="font-medium mb-2">Dashboard Customization</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Drag-and-drop widget arrangement</li>
                  <li>Custom KPI selection and thresholds</li>
                  <li>Real-time vs. historical data views</li>
                  <li>Color-coded status indicators and alerts</li>
                  <li>Personal dashboard saves and sharing</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )
    }
  ];

  const securityAndAuditSections: DocumentationSection[] = [
    {
      id: "security-comprehensive",
      title: "Security & Audit Management",
      icon: Shield,
      difficulty: "Advanced",
      estimatedTime: "30 minutes",
      category: "security-audit",
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">🔒 Security & Compliance</h4>
            <p className="text-red-800">
              Comprehensive security framework with role-based access control, 
              audit logging, and compliance monitoring for data protection and operational security.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🛡️ Access Control & Authentication</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-red-500">
                <h5 className="font-medium mb-2">User Authentication System</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Secure Login:</strong> Email and password with encryption</li>
                  <li><strong>Session Management:</strong> Automatic timeout and secure tokens</li>
                  <li><strong>Password Policies:</strong> Complexity requirements and expiration</li>
                  <li><strong>Account Lockout:</strong> Protection against brute force attacks</li>
                  <li><strong>Password Recovery:</strong> Secure reset process via email verification</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Role-Based Access Control (RBAC)</h5>
                <div className="space-y-2">
                  <div><strong>Super Admin:</strong> Complete system access, user management, security settings</div>
                  <div><strong>Admin:</strong> Operations, customer service, reporting (no user management)</div>
                  <div><strong>Employee:</strong> Time tracking, assigned routes, personal data only</div>
                  <div><strong>Customer:</strong> Personal account, billing, service requests only</div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">Row Level Security (RLS)</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Database-level access control for all sensitive data</li>
                  <li>Users can only access their own records and authorized data</li>
                  <li>Automatic enforcement at the database layer</li>
                  <li>Protection against SQL injection and unauthorized access</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📝 Audit Logging & Monitoring</h4>
            <div className="space-y-4">
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">Comprehensive Activity Logging</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>User Actions:</strong> Login/logout, data access, modifications</li>
                  <li><strong>Administrative Actions:</strong> User creation, role changes, system settings</li>
                  <li><strong>Financial Transactions:</strong> Payments, billing changes, refunds</li>
                  <li><strong>Operational Events:</strong> Job assignments, route changes, status updates</li>
                  <li><strong>System Events:</strong> Errors, performance issues, security incidents</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">Security Monitoring</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Failed Login Attempts:</strong> Automatic detection and alerting</li>
                  <li><strong>Unusual Access Patterns:</strong> Time, location, and behavior analysis</li>
                  <li><strong>Data Export/Download:</strong> Monitoring of sensitive data access</li>
                  <li><strong>Permission Changes:</strong> Real-time alerts for role modifications</li>
                  <li><strong>System Intrusion Detection:</strong> Automated threat response</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🔍 Compliance & Data Protection</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-yellow-500">
                <h5 className="font-medium mb-2">Data Privacy Compliance</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Data Minimization:</strong> Collection of only necessary information</li>
                  <li><strong>Consent Management:</strong> Clear consent for data collection and use</li>
                  <li><strong>Right to Access:</strong> Customer access to their personal data</li>
                  <li><strong>Right to Deletion:</strong> Secure data removal upon request</li>
                  <li><strong>Data Portability:</strong> Export of customer data in standard formats</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-500">
                <h5 className="font-medium mb-2">Security Best Practices</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Regular security assessments and penetration testing</li>
                  <li>Encrypted data transmission and storage</li>
                  <li>Regular backup and disaster recovery testing</li>
                  <li>Employee security training and awareness</li>
                  <li>Third-party security audits and certifications</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )
    }
  ];

  const troubleshootingSections: DocumentationSection[] = [
    {
      id: "troubleshooting-guide",
      title: "Troubleshooting & Problem Resolution",
      icon: Wrench,
      difficulty: "Intermediate",
      estimatedTime: "25 minutes",
      category: "troubleshooting",
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">🔧 Troubleshooting Guide</h4>
            <p className="text-yellow-800">
              Comprehensive troubleshooting guide for common issues, error resolution, 
              and system maintenance procedures.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🚨 Common Issues & Solutions</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-red-500">
                <h5 className="font-medium mb-2">Login & Authentication Issues</h5>
                <div className="space-y-2">
                  <div><strong>Problem:</strong> Cannot access admin dashboard</div>
                  <div><strong>Solution:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Verify email address is <code>diggs844037@yahoo.com</code></li>
                      <li>Check password accuracy (case-sensitive)</li>
                      <li>Clear browser cache and cookies</li>
                      <li>Try incognito/private browsing mode</li>
                      <li>Check internet connection stability</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-orange-500">
                <h5 className="font-medium mb-2">Data Loading Issues</h5>
                <div className="space-y-2">
                  <div><strong>Problem:</strong> Dashboard shows loading indefinitely</div>
                  <div><strong>Solution:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Click the refresh button (↻) in the dashboard header</li>
                      <li>Check browser console for JavaScript errors</li>
                      <li>Verify internet connection is stable</li>
                      <li>Clear browser cache and reload page</li>
                      <li>Contact support if issue persists</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">GPS Tracking Issues</h5>
                <div className="space-y-2">
                  <div><strong>Problem:</strong> Employee locations not updating</div>
                  <div><strong>Solution:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Ensure employees have GPS enabled on mobile devices</li>
                      <li>Check mobile app permissions for location access</li>
                      <li>Verify employees are clocked in and active</li>
                      <li>Restart mobile app if location is stale</li>
                      <li>Check cellular/WiFi connectivity in field</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🔍 Diagnostic Tools</h4>
            <div className="space-y-4">
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">System Health Checks</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Database Connectivity:</strong> Verify Supabase connection status</li>
                  <li><strong>Real-time Updates:</strong> Check WebSocket connections</li>
                  <li><strong>Authentication Status:</strong> Validate user sessions and tokens</li>
                  <li><strong>API Response Times:</strong> Monitor performance metrics</li>
                  <li><strong>Error Logging:</strong> Review system error logs and patterns</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">Performance Optimization</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Browser Cache:</strong> Clear cache regularly for optimal performance</li>
                  <li><strong>Network Speed:</strong> Ensure adequate bandwidth for real-time features</li>
                  <li><strong>Device Resources:</strong> Close unnecessary browser tabs and applications</li>
                  <li><strong>Browser Updates:</strong> Use latest browser versions for compatibility</li>
                  <li><strong>Mobile Optimization:</strong> Ensure mobile devices have sufficient storage</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📞 Support & Escalation</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">When to Contact Support</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>System-wide outages or service disruptions</li>
                  <li>Data inconsistencies or corruption</li>
                  <li>Security concerns or suspicious activity</li>
                  <li>Payment processing failures</li>
                  <li>Integration issues with third-party services</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Information to Provide</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Detailed description of the issue</li>
                  <li>Steps taken to reproduce the problem</li>
                  <li>Browser type and version</li>
                  <li>Time and date when issue occurred</li>
                  <li>Screenshots or error messages</li>
                  <li>User account affected (if applicable)</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )
    }
  ];

  const advancedFeaturesSections: DocumentationSection[] = [
    {
      id: "advanced-features",
      title: "Advanced Features & Integrations",
      icon: GitBranch,
      difficulty: "Advanced",
      estimatedTime: "45 minutes",
      category: "advanced-features",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">🚀 Advanced Features</h4>
            <p className="text-purple-800">
              Advanced system features including API integrations, automation workflows, 
              custom notifications, and third-party service connections.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🔌 API & Integrations</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-blue-500">
                <h5 className="font-medium mb-2">Payment Processing Integration</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Stripe Integration:</strong> Secure credit card and ACH processing</li>
                  <li><strong>Webhook Handling:</strong> Real-time payment status updates</li>
                  <li><strong>Subscription Management:</strong> Automated recurring billing</li>
                  <li><strong>Refund Processing:</strong> Automated and manual refund handling</li>
                  <li><strong>Tax Calculation:</strong> Automatic tax computation by location</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500">
                <h5 className="font-medium mb-2">Communication Services</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Email Service:</strong> Transactional and marketing emails</li>
                  <li><strong>SMS Notifications:</strong> Real-time alerts and reminders</li>
                  <li><strong>Push Notifications:</strong> Mobile app notifications</li>
                  <li><strong>Customer Portal:</strong> Self-service account management</li>
                  <li><strong>Feedback Collection:</strong> Automated survey and rating systems</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-yellow-500">
                <h5 className="font-medium mb-2">Mapping & Navigation</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>GPS Tracking:</strong> Real-time vehicle and employee location</li>
                  <li><strong>Route Optimization:</strong> AI-powered efficient route planning</li>
                  <li><strong>Geocoding:</strong> Address validation and coordinate conversion</li>
                  <li><strong>Traffic Integration:</strong> Real-time traffic and weather data</li>
                  <li><strong>Service Area Mapping:</strong> Geographic coverage visualization</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🤖 Automation & Workflows</h4>
            <div className="space-y-4">
              
              <Card className="p-4">
                <h5 className="font-medium mb-2">Automated Business Processes</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Customer Onboarding:</strong> Welcome emails, account setup, first service scheduling</li>
                  <li><strong>Billing Automation:</strong> Invoice generation, payment processing, dunning procedures</li>
                  <li><strong>Route Assignment:</strong> Intelligent job assignment based on location and capacity</li>
                  <li><strong>Maintenance Scheduling:</strong> Automated vehicle maintenance reminders</li>
                  <li><strong>Performance Monitoring:</strong> Automated KPI tracking and alerting</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">Custom Notification Rules</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Service Alerts:</strong> Missed pickups, route delays, vehicle breakdowns</li>
                  <li><strong>Financial Alerts:</strong> Payment failures, revenue thresholds, cost overruns</li>
                  <li><strong>Operational Alerts:</strong> Employee tardiness, safety incidents, equipment issues</li>
                  <li><strong>Customer Alerts:</strong> Service changes, billing updates, satisfaction surveys</li>
                  <li><strong>Management Alerts:</strong> Performance metrics, compliance issues, system errors</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📊 Business Intelligence & Reporting</h4>
            <div className="space-y-4">
              
              <Card className="p-4 border-l-4 border-l-purple-500">
                <h5 className="font-medium mb-2">Predictive Analytics</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Revenue Forecasting:</strong> Machine learning-based revenue predictions</li>
                  <li><strong>Customer Churn Prediction:</strong> Early identification of at-risk customers</li>
                  <li><strong>Demand Forecasting:</strong> Seasonal and trend-based demand planning</li>
                  <li><strong>Equipment Failure Prediction:</strong> Predictive maintenance scheduling</li>
                  <li><strong>Route Optimization:</strong> AI-powered efficiency improvements</li>
                </ul>
              </Card>

              <Card className="p-4 border-l-4 border-l-teal-500">
                <h5 className="font-medium mb-2">Custom Dashboard Creation</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Drag-and-Drop Builder:</strong> Custom dashboard layout design</li>
                  <li><strong>Widget Library:</strong> Charts, tables, KPIs, and custom visualizations</li>
                  <li><strong>Real-Time Data:</strong> Live updating metrics and alerts</li>
                  <li><strong>Role-Based Views:</strong> Customized dashboards by user role</li>
                  <li><strong>Export Capabilities:</strong> PDF, Excel, and CSV export options</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Combine all sections
  const allSections = [
    ...gettingStartedSections,
    ...adminManagementSections,
    ...customerManagementSections,
    ...employeeManagementSections,
    ...operationsManagementSections,
    ...fleetManagementSections,
    ...analyticsReportingSections,
    ...securityAndAuditSections,
    ...troubleshootingSections,
    ...advancedFeaturesSections
  ];

  // Filter sections based on search and category
  const filteredSections = allSections.filter(section => {
    const matchesSearch = searchTerm === "" || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || section.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", label: "All Sections" },
    { id: "getting-started", label: "Getting Started" },
    { id: "admin-management", label: "Admin Management" },
    { id: "customer-management", label: "Customer Management" },
    { id: "employee-management", label: "Employee Management" },
    { id: "operations-management", label: "Operations Management" },
    { id: "fleet-management", label: "Fleet Management" },
    { id: "analytics-reporting", label: "Analytics & Reporting" },
    { id: "security-audit", label: "Security & Audit" },
    { id: "troubleshooting", label: "Troubleshooting" },
    { id: "advanced-features", label: "Advanced Features" }
  ];

  const renderSection = (section: DocumentationSection) => (
    <Card key={section.id} className="mb-4">
      <Collapsible 
        open={openSections.has(section.id)} 
        onOpenChange={() => toggleSection(section.id)}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <section.icon className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <CardTitle className="text-left">{section.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      variant={
                        section.difficulty === "Beginner" ? "default" :
                        section.difficulty === "Intermediate" ? "secondary" : "destructive"
                      }
                      className="text-xs"
                    >
                      {section.difficulty}
                    </Badge>
                    {section.estimatedTime && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {section.estimatedTime}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight 
                className={`h-4 w-4 transition-transform ${
                  openSections.has(section.id) ? "rotate-90" : ""
                }`} 
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            {section.content}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Comprehensive Documentation</h2>
            <p className="text-muted-foreground">
              Complete guide to Can2Curb system administration and operations
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              <ChevronRight className="w-4 h-4 mr-2" />
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              <ChevronRight className="w-4 h-4 mr-2 rotate-90" />
              Collapse All
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="min-w-[200px] bg-background">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border z-50">
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id} className="hover:bg-accent hover:text-accent-foreground">
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredSections.length} of {allSections.length} sections
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </Card>

      {/* Documentation Sections */}
      <div className="space-y-4">
        {filteredSections.length > 0 ? (
          filteredSections.map(renderSection)
        ) : (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No sections found</h3>
              <p>Try adjusting your search terms or category filter.</p>
            </div>
          </Card>
        )}
      </div>

      {/* Footer */}
      <Card className="p-4 bg-muted/30">
        <div className="text-center text-sm text-muted-foreground">
          <p>Documentation last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-1">
            For additional support, contact your system administrator or technical support team.
          </p>
        </div>
      </Card>
    </div>
  );
}