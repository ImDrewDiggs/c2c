import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ChevronRight
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DocumentationSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export function ComprehensiveDocumentation() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const gettingStartedSections: DocumentationSection[] = [
    {
      id: "dashboard-overview",
      title: "Dashboard Overview & Navigation",
      icon: BookOpen,
      difficulty: "Beginner",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📋 What is the Admin Dashboard?</h4>
            <p className="text-blue-800">
              The Admin Dashboard is your central command center for managing all aspects of your waste management business. 
              From here, you can track employees, manage customers, monitor operations, and analyze business performance.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🚀 Getting Started - Step by Step</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Login Process:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Navigate to <code>/admin/login</code></li>
                  <li>Enter your admin credentials (email and password)</li>
                  <li>Click "Sign In" - you'll be redirected to the dashboard</li>
                  <li>If you have Super Admin access, you'll see additional features</li>
                </ul>
              </li>
              
              <li>
                <strong>Dashboard Layout:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Header:</strong> Shows your name, refresh button, and logout option</li>
                  <li><strong>Stats Overview:</strong> Key metrics (today's pickups, active employees, pending pickups, revenue)</li>
                  <li><strong>Quick Access:</strong> Expandable groups for common tasks</li>
                  <li><strong>Tab Navigation:</strong> Operations, Employees, Analytics, Users</li>
                </ul>
              </li>

              <li>
                <strong>Navigation Tabs:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Operations Tab:</strong> Live map, service areas, scheduled jobs, maintenance</li>
                  <li><strong>Employees Tab:</strong> Employee status, locations, and activity logs</li>
                  <li><strong>Analytics Tab:</strong> Business metrics, charts, and reports</li>
                  <li><strong>Users Tab:</strong> Manage employee, customer, and admin accounts</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Pro Tips</h4>
            <ul className="list-disc list-inside text-yellow-800 space-y-1">
              <li>Use the refresh button (↻) in the header to update real-time data</li>
              <li>The Quick Access section groups related actions for faster workflow</li>
              <li>Key metrics update automatically every few minutes</li>
              <li>Super Admins have access to additional settings and user management</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "first-login-setup",
      title: "First Login Setup & Initial Configuration",
      icon: Settings,
      difficulty: "Beginner",
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">🎯 What You'll Accomplish</h4>
            <p className="text-green-800">
              Set up your business for operations by configuring initial settings, adding employees, 
              and establishing service areas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📋 Initial Setup Checklist</h4>
            <div className="space-y-4">
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2">✅ Step 1: Add Your First Employee</h5>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Go to <strong>Quick Access</strong> → <strong>Employee Management</strong> group</li>
                  <li>Click <strong>"Add Employee"</strong></li>
                  <li>Fill in the form:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Email address (required)</li>
                      <li>Full name</li>
                      <li>Phone number</li>
                      <li>Job title (e.g., "Waste Collection Specialist")</li>
                      <li>Pay rate (dollars per hour)</li>
                      <li>Driver's license number (if applicable)</li>
                    </ul>
                  </li>
                  <li>Click <strong>"Add Employee"</strong> to save</li>
                  <li>The employee will receive login credentials via email</li>
                </ol>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2">🚛 Step 2: Add Your First Vehicle</h5>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Go to <strong>Quick Access</strong> → <strong>Fleet Management</strong> group</li>
                  <li>Click <strong>"Add Vehicle"</strong></li>
                  <li>Enter vehicle details:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Vehicle number (your internal ID)</li>
                      <li>Make and model</li>
                      <li>Year</li>
                      <li>License plate</li>
                      <li>VIN number</li>
                      <li>Capacity (cubic yards)</li>
                      <li>Fuel type</li>
                    </ul>
                  </li>
                  <li>Set vehicle status to "Active"</li>
                  <li>Click <strong>"Save Vehicle"</strong></li>
                </ol>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2">🗺️ Step 3: Define Service Areas</h5>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Navigate to <strong>Operations Tab</strong></li>
                  <li>Look at the <strong>Service Areas Panel</strong></li>
                  <li>Click <strong>"Add Service Area"</strong></li>
                  <li>Define your coverage zones:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Area name (e.g., "Downtown District")</li>
                      <li>Geographic boundaries</li>
                      <li>Service frequency</li>
                      <li>Assigned routes</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2">🏠 Step 4: Add Customer Locations</h5>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Go to <strong>Quick Access</strong> → <strong>Customer Management</strong> group</li>
                  <li>Click <strong>"Add Customer"</strong></li>
                  <li>Fill in customer information:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Full name</li>
                      <li>Email address</li>
                      <li>Phone number</li>
                      <li>Service address (where pickup occurs)</li>
                      <li>Service type (residential/commercial)</li>
                    </ul>
                  </li>
                  <li>Click <strong>"Add Customer"</strong></li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">⚠️ Important Security Notes</h4>
            <ul className="list-disc list-inside text-red-800 space-y-1">
              <li>Only authorized personnel should have admin access</li>
              <li>Change default passwords immediately</li>
              <li>Regularly review user permissions</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const customerManagementSections: DocumentationSection[] = [
    {
      id: "customer-lifecycle",
      title: "Complete Customer Lifecycle Management",
      icon: Users,
      difficulty: "Intermediate",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">🎯 Customer Management Overview</h4>
            <p className="text-blue-800">
              Manage your customers from initial signup through ongoing service delivery, 
              including billing, service modifications, and support requests.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">👤 Adding New Customers</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Access Customer Management:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <strong>Quick Access</strong> → <strong>Customer Management</strong></li>
                  <li>Click <strong>"Add Customer"</strong> button</li>
                  <li>The Add Customer modal will open</li>
                </ul>
              </li>
              
              <li>
                <strong>Fill Required Information:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Full Name:</strong> Customer's legal name</li>
                  <li><strong>Email:</strong> Primary contact email (will be used for login)</li>
                  <li><strong>Phone:</strong> Primary contact number</li>
                  <li><strong>Service Address:</strong> Where pickup/service occurs</li>
                  <li><strong>Billing Address:</strong> If different from service address</li>
                </ul>
              </li>

              <li>
                <strong>Set Service Preferences:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Select service tier (Basic, Premium, Commercial)</li>
                  <li>Choose pickup frequency (Weekly, Bi-weekly, Monthly)</li>
                  <li>Add special instructions or notes</li>
                  <li>Set preferred pickup time windows</li>
                </ul>
              </li>

              <li>
                <strong>Save and Activate:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Review all information for accuracy</li>
                  <li>Click <strong>"Add Customer"</strong></li>
                  <li>Customer will receive welcome email with login details</li>
                  <li>Account status will be set to "Active"</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">✏️ Editing Customer Information</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Find the Customer:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <strong>Users Tab</strong> → <strong>Customers</strong></li>
                  <li>Use the search box to find customer by name or email</li>
                  <li>Or scroll through the customer list</li>
                </ul>
              </li>
              
              <li>
                <strong>Open Edit Mode:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Click the <strong>"Edit"</strong> button next to customer name</li>
                  <li>The Edit Customer modal will open with current information</li>
                </ul>
              </li>

              <li>
                <strong>Make Changes:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Update any field that needs modification</li>
                  <li>Add notes about the changes in the notes field</li>
                  <li>Change service tier or frequency if needed</li>
                </ul>
              </li>

              <li>
                <strong>Save Changes:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Click <strong>"Save Changes"</strong></li>
                  <li>Customer will be notified of significant changes via email</li>
                  <li>Changes are logged in the customer's history</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">💳 Creating Customer Subscriptions</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Access Subscription Creation:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <strong>Quick Access</strong> → <strong>Billing Management</strong></li>
                  <li>Click <strong>"Create Subscription"</strong></li>
                </ul>
              </li>
              
              <li>
                <strong>Select Customer:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Search for customer by name or email</li>
                  <li>Select the customer from dropdown</li>
                  <li>Verify service address is correct</li>
                </ul>
              </li>

              <li>
                <strong>Configure Subscription:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Plan Type:</strong> Single Family, Multi-Family, Commercial</li>
                  <li><strong>Service Level:</strong> Basic, Premium, Deluxe</li>
                  <li><strong>Billing Cycle:</strong> Monthly, Quarterly, Annual</li>
                  <li><strong>Start Date:</strong> When service begins</li>
                  <li><strong>Special Features:</strong> Recycling, yard waste, bulk pickup</li>
                </ul>
              </li>

              <li>
                <strong>Set Pricing:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Base price is calculated automatically</li>
                  <li>Apply any discounts or promotions</li>
                  <li>Add fees for special services</li>
                  <li>Review total monthly cost</li>
                </ul>
              </li>

              <li>
                <strong>Activate Subscription:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Review all details</li>
                  <li>Click <strong>"Create Subscription"</strong></li>
                  <li>Subscription becomes active on start date</li>
                  <li>First invoice is generated automatically</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">🔄 Customer Service Workflows</h4>
            <div className="text-yellow-800 space-y-2">
              <p><strong>Service Suspension:</strong> Temporarily pause service while maintaining customer account</p>
              <p><strong>Plan Upgrades:</strong> Move customers to higher service tiers with prorated billing</p>
              <p><strong>Address Changes:</strong> Update service locations and route assignments</p>
              <p><strong>Billing Disputes:</strong> Handle payment issues and apply credits/refunds</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const employeeManagementSections: DocumentationSection[] = [
    {
      id: "employee-operations",
      title: "Employee Management & Time Tracking",
      icon: Clock,
      difficulty: "Intermediate",
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">👥 Employee Management System</h4>
            <p className="text-green-800">
              Comprehensive employee lifecycle management including hiring, time tracking, 
              route assignments, and performance monitoring.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">👤 Adding New Employees</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Access Employee Management:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <strong>Quick Access</strong> → <strong>Employee Management</strong></li>
                  <li>Click <strong>"Add Employee"</strong></li>
                </ul>
              </li>
              
              <li>
                <strong>Basic Information:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Email:</strong> Will be their login username</li>
                  <li><strong>Full Name:</strong> Legal name for payroll</li>
                  <li><strong>Phone Number:</strong> Primary contact</li>
                  <li><strong>Address:</strong> Home address for records</li>
                </ul>
              </li>

              <li>
                <strong>Employment Details:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Job Title:</strong> Role description (Driver, Collector, Supervisor)</li>
                  <li><strong>Pay Rate:</strong> Hourly wage in dollars</li>
                  <li><strong>Start Date:</strong> When employment begins</li>
                  <li><strong>Employment Status:</strong> Full-time, Part-time, Contractor</li>
                </ul>
              </li>

              <li>
                <strong>Operational Info:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Driver's License:</strong> Required for vehicle operators</li>
                  <li><strong>Certifications:</strong> Safety training, hazmat, etc.</li>
                  <li><strong>Emergency Contact:</strong> Name and phone number</li>
                </ul>
              </li>

              <li>
                <strong>Save and Setup:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Click <strong>"Add Employee"</strong></li>
                  <li>Employee account is created automatically</li>
                  <li>Login credentials sent via email</li>
                  <li>Employee can access their dashboard immediately</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">⏰ Time Tracking & Payroll</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>How Time Tracking Works:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Employees clock in/out using their mobile dashboard</li>
                  <li>GPS location is recorded with each time stamp</li>
                  <li>Time is calculated in 0.01 hour increments for accuracy</li>
                  <li>All sessions are automatically logged to their timecard</li>
                </ul>
              </li>
              
              <li>
                <strong>Viewing Employee Time Cards:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <strong>Employees Tab</strong></li>
                  <li>Click <strong>"View Time Card"</strong> next to employee name</li>
                  <li>Or go to <strong>Quick Access</strong> → <strong>Employee Management</strong> → <strong>"View All Time Cards"</strong></li>
                </ul>
              </li>

              <li>
                <strong>Time Card Information Displayed:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Date & Time:</strong> Exact clock in/out times</li>
                  <li><strong>Duration:</strong> Total hours worked (in 0.01 increments)</li>
                  <li><strong>Location:</strong> Where they clocked in/out</li>
                  <li><strong>Status:</strong> Active, Completed, or Break</li>
                  <li><strong>Notes:</strong> Any employee-added comments</li>
                  <li><strong>Total Pay:</strong> Hours × hourly rate</li>
                </ul>
              </li>

              <li>
                <strong>Payroll Processing:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Time cards automatically calculate total hours per pay period</li>
                  <li>Overtime is flagged for hours over 40/week</li>
                  <li>Export time card data for payroll software</li>
                  <li>All time stamps are preserved for auditing</li>
                </ul>
              </li>

              <li>
                <strong>Time Card Management:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Approve/Edit:</strong> Admins can modify incorrect entries</li>
                  <li><strong>Add Notes:</strong> Document reasons for any changes</li>
                  <li><strong>Export Reports:</strong> Generate pay period summaries</li>
                  <li><strong>Audit Trail:</strong> All changes are logged with timestamps</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📍 Employee Location Tracking</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Real-Time GPS Tracking:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>View live employee locations on Operations map</li>
                  <li>See who's currently online/offline</li>
                  <li>Track route progress and completion</li>
                  <li>Monitor break times and locations</li>
                </ul>
              </li>
              
              <li>
                <strong>Assignment Management:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Assign specific routes to employees</li>
                  <li>Set pickup schedules and priorities</li>
                  <li>Monitor assignment completion status</li>
                  <li>Reassign jobs if needed</li>
                </ul>
              </li>

              <li>
                <strong>Performance Monitoring:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Track completion times for routes</li>
                  <li>Monitor customer satisfaction scores</li>
                  <li>Review safety incident reports</li>
                  <li>Analyze productivity metrics</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2">⚖️ Labor Law Compliance</h4>
            <ul className="list-disc list-inside text-orange-800 space-y-1">
              <li>Time tracking includes break periods and meal breaks</li>
              <li>Overtime calculations follow federal and state regulations</li>
              <li>All time modifications require admin approval and documentation</li>
              <li>GPS data ensures accurate on-site work verification</li>
              <li>Export capabilities support payroll tax reporting</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const operationsManagementSections: DocumentationSection[] = [
    {
      id: "route-scheduling",
      title: "Route Planning & Scheduling Operations",
      icon: MapPin,
      difficulty: "Advanced",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">🗺️ Operations Management</h4>
            <p className="text-purple-800">
              Efficient route planning, scheduling, and real-time operations monitoring 
              to maximize productivity and customer satisfaction.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📅 Creating Scheduled Jobs</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Access Scheduling:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <strong>Operations Tab</strong></li>
                  <li>Look at <strong>Scheduled Jobs Panel</strong></li>
                  <li>Click <strong>"Add New Job"</strong></li>
                </ul>
              </li>
              
              <li>
                <strong>Job Details:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Service Type:</strong> Regular pickup, bulk collection, recycling</li>
                  <li><strong>Customer/Location:</strong> Select from customer list</li>
                  <li><strong>Scheduled Date:</strong> When service should occur</li>
                  <li><strong>Time Window:</strong> Preferred pickup time range</li>
                  <li><strong>Priority Level:</strong> Normal, High, Emergency</li>
                </ul>
              </li>

              <li>
                <strong>Route Assignment:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Auto-Assign:</strong> System suggests best employee/route</li>
                  <li><strong>Manual Assign:</strong> Choose specific employee</li>
                  <li><strong>Route Optimization:</strong> System groups nearby jobs</li>
                  <li><strong>Vehicle Assignment:</strong> Assign appropriate truck</li>
                </ul>
              </li>

              <li>
                <strong>Special Instructions:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Gate codes or access instructions</li>
                  <li>Special handling requirements</li>
                  <li>Customer contact preferences</li>
                  <li>Safety considerations</li>
                </ul>
              </li>

              <li>
                <strong>Save and Deploy:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Review all job details</li>
                  <li>Click <strong>"Schedule Job"</strong></li>
                  <li>Job appears on assigned employee's mobile dashboard</li>
                  <li>Customer receives service confirmation</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🚛 Route Optimization</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Access Route Optimizer:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <strong>Quick Access</strong> → <strong>Operations Management</strong></li>
                  <li>Click <strong>"Optimize Routes"</strong></li>
                </ul>
              </li>
              
              <li>
                <strong>Select Parameters:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Date Range:</strong> Which days to optimize</li>
                  <li><strong>Service Area:</strong> Geographic zones to include</li>
                  <li><strong>Vehicle Types:</strong> Truck capacity requirements</li>
                  <li><strong>Employee Constraints:</strong> Availability and skills</li>
                </ul>
              </li>

              <li>
                <strong>Optimization Factors:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Distance:</strong> Minimize total travel distance</li>
                  <li><strong>Time Windows:</strong> Respect customer preferences</li>
                  <li><strong>Vehicle Capacity:</strong> Don't exceed truck limits</li>
                  <li><strong>Traffic Patterns:</strong> Account for rush hour delays</li>
                  <li><strong>Employee Breaks:</strong> Schedule mandatory rest periods</li>
                </ul>
              </li>

              <li>
                <strong>Review and Apply:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>System generates optimized route suggestions</li>
                  <li>Review proposed changes and efficiency gains</li>
                  <li>Make manual adjustments if needed</li>
                  <li>Click <strong>"Apply Routes"</strong> to update assignments</li>
                </ul>
              </li>

              <li>
                <strong>Monitor Results:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Track route completion times</li>
                  <li>Monitor fuel savings and efficiency gains</li>
                  <li>Collect employee feedback on route changes</li>
                  <li>Adjust parameters for future optimizations</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🗺️ Live Operations Monitoring</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Operations Map Overview:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>View live employee locations on interactive map</li>
                  <li>See real-time progress on assigned routes</li>
                  <li>Monitor service area coverage</li>
                  <li>Track vehicle movements and stops</li>
                </ul>
              </li>
              
              <li>
                <strong>Status Indicators:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Green Dots:</strong> Active employees on route</li>
                  <li><strong>Red Dots:</strong> Employees needing attention</li>
                  <li><strong>Blue Dots:</strong> Completed jobs today</li>
                  <li><strong>Yellow Dots:</strong> Scheduled but not started</li>
                </ul>
              </li>

              <li>
                <strong>Real-Time Alerts:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Route delays or traffic issues</li>
                  <li>Emergency requests from customers</li>
                  <li>Vehicle breakdowns or maintenance needs</li>
                  <li>Employee safety check-ins</li>
                </ul>
              </li>

              <li>
                <strong>Quick Actions from Map:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Click employee pin to see current status</li>
                  <li>Reassign jobs between employees</li>
                  <li>Send messages or instructions</li>
                  <li>Add emergency pickups to routes</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📊 Operations Metrics</h4>
            <div className="text-blue-800 space-y-2">
              <p><strong>Route Efficiency:</strong> Compare planned vs actual completion times</p>
              <p><strong>Customer Satisfaction:</strong> Track on-time service delivery rates</p>
              <p><strong>Fuel Costs:</strong> Monitor vehicle efficiency and route optimization savings</p>
              <p><strong>Employee Productivity:</strong> Analyze jobs completed per hour/day</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const fleetMaintenanceSections: DocumentationSection[] = [
    {
      id: "fleet-maintenance",
      title: "Fleet Management & Maintenance Scheduling",
      icon: Truck,
      difficulty: "Advanced",
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-2">🚛 Fleet Management System</h4>
            <p className="text-indigo-800">
              Comprehensive vehicle management including maintenance scheduling, 
              cost tracking, and compliance monitoring for your waste collection fleet.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🚚 Adding Vehicles to Fleet</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Access Fleet Management:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <strong>Quick Access</strong> → <strong>Fleet Management</strong></li>
                  <li>Click <strong>"Add Vehicle"</strong></li>
                </ul>
              </li>
              
              <li>
                <strong>Vehicle Identification:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Vehicle Number:</strong> Your internal fleet ID (e.g., "TRUCK-001")</li>
                  <li><strong>Make & Model:</strong> Manufacturer and specific model</li>
                  <li><strong>Year:</strong> Model year</li>
                  <li><strong>License Plate:</strong> Current registration</li>
                  <li><strong>VIN:</strong> Vehicle identification number</li>
                </ul>
              </li>

              <li>
                <strong>Operational Specifications:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Vehicle Type:</strong> Front-loader, rear-loader, roll-off</li>
                  <li><strong>Capacity:</strong> Cubic yards or weight capacity</li>
                  <li><strong>Fuel Type:</strong> Diesel, gas, electric, hybrid</li>
                  <li><strong>Status:</strong> Active, maintenance, retired</li>
                </ul>
              </li>

              <li>
                <strong>Purchase & Financial Info:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Purchase Date:</strong> When vehicle was acquired</li>
                  <li><strong>Purchase Price:</strong> Original cost for depreciation</li>
                  <li><strong>Current Mileage:</strong> Starting odometer reading</li>
                  <li><strong>Insurance Info:</strong> Policy numbers and coverage</li>
                </ul>
              </li>

              <li>
                <strong>Save and Activate:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Review all information for accuracy</li>
                  <li>Click <strong>"Add Vehicle"</strong></li>
                  <li>Vehicle is now available for employee assignment</li>
                  <li>Maintenance schedule is automatically initialized</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🔧 Maintenance Scheduling</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Access Maintenance Panel:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <strong>Operations Tab</strong></li>
                  <li>Look at <strong>Maintenance Schedule Panel</strong></li>
                  <li>Click <strong>"Schedule Maintenance"</strong></li>
                </ul>
              </li>
              
              <li>
                <strong>Select Vehicle & Service:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Choose vehicle from dropdown list</li>
                  <li>Select maintenance type:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Routine Service (oil change, filters)</li>
                      <li>Preventive Maintenance (scheduled inspections)</li>
                      <li>Repair Work (fix specific issues)</li>
                      <li>DOT Inspection (regulatory compliance)</li>
                      <li>Emissions Testing (environmental compliance)</li>
                    </ul>
                  </li>
                </ul>
              </li>

              <li>
                <strong>Schedule Details:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Scheduled Date:</strong> When maintenance should occur</li>
                  <li><strong>Service Description:</strong> Detailed work to be performed</li>
                  <li><strong>Vendor Information:</strong> Shop name and contact info</li>
                  <li><strong>Estimated Cost:</strong> Budget for the work</li>
                  <li><strong>Priority Level:</strong> Routine, urgent, emergency</li>
                </ul>
              </li>

              <li>
                <strong>Resource Planning:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Downtime Duration:</strong> How long vehicle will be unavailable</li>
                  <li><strong>Backup Vehicle:</strong> Replacement truck if needed</li>
                  <li><strong>Route Impact:</strong> Adjust schedules for affected routes</li>
                  <li><strong>Parts Ordering:</strong> Pre-order required components</li>
                </ul>
              </li>

              <li>
                <strong>Schedule and Track:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Click <strong>"Schedule Maintenance"</strong></li>
                  <li>Maintenance appears in upcoming schedule</li>
                  <li>Automatic reminders sent to fleet manager</li>
                  <li>Vehicle status updated to "Scheduled for Maintenance"</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📊 Maintenance Tracking & Costs</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Completing Maintenance:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>When service is finished, update maintenance record</li>
                  <li>Enter actual completion date</li>
                  <li>Input final cost and invoice details</li>
                  <li>Upload receipts and service documentation</li>
                </ul>
              </li>
              
              <li>
                <strong>Cost Tracking:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Labor Costs:</strong> Shop time and rates</li>
                  <li><strong>Parts Costs:</strong> Components and materials</li>
                  <li><strong>Vendor Charges:</strong> Additional fees or services</li>
                  <li><strong>Total Cost:</strong> Complete maintenance expense</li>
                </ul>
              </li>

              <li>
                <strong>Performance Metrics:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Track cost per mile for each vehicle</li>
                  <li>Monitor maintenance frequency trends</li>
                  <li>Compare vendor performance and pricing</li>
                  <li>Identify vehicles with high maintenance costs</li>
                </ul>
              </li>

              <li>
                <strong>Compliance Tracking:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>DOT inspection due dates</li>
                  <li>Emissions testing schedules</li>
                  <li>Commercial vehicle registrations</li>
                  <li>Insurance coverage renewals</li>
                </ul>
              </li>

              <li>
                <strong>Reporting & Analysis:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Generate monthly maintenance reports</li>
                  <li>Track fleet-wide maintenance costs</li>
                  <li>Analyze preventive vs reactive maintenance ratios</li>
                  <li>Plan vehicle replacement schedules</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">⚠️ Safety & Compliance</h4>
            <ul className="list-disc list-inside text-red-800 space-y-1">
              <li>Never skip safety inspections or required maintenance</li>
              <li>Keep detailed records for DOT audits and insurance claims</li>
              <li>Remove unsafe vehicles from service immediately</li>
              <li>Train employees on proper vehicle inspection procedures</li>
              <li>Maintain current insurance and registration for all vehicles</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const analyticsReportingSections: DocumentationSection[] = [
    {
      id: "analytics-reporting",
      title: "Analytics Dashboard & Business Reporting",
      icon: BarChart3,
      difficulty: "Intermediate",
      content: (
        <div className="space-y-6">
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-teal-900 mb-2">📊 Business Analytics & Reporting</h4>
            <p className="text-teal-800">
              Comprehensive analytics tools to track business performance, 
              identify trends, and make data-driven decisions for growth.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📈 Understanding the Analytics Dashboard</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Access Analytics:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Click the <strong>Analytics Tab</strong> in the main dashboard</li>
                  <li>The dashboard loads with current month data by default</li>
                  <li>Use date filters to view different time periods</li>
                </ul>
              </li>
              
              <li>
                <strong>Key Performance Metrics:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Revenue Metrics:</strong>
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Total revenue for selected period</li>
                      <li>Monthly recurring revenue (MRR)</li>
                      <li>Revenue per customer</li>
                      <li>Growth rate vs previous period</li>
                    </ul>
                  </li>
                  <li><strong>Customer Metrics:</strong>
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Total active customers</li>
                      <li>New customer acquisitions</li>
                      <li>Customer churn rate</li>
                      <li>Customer lifetime value</li>
                    </ul>
                  </li>
                  <li><strong>Operational Metrics:</strong>
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Total pickups completed</li>
                      <li>On-time delivery rate</li>
                      <li>Employee productivity</li>
                      <li>Vehicle utilization</li>
                    </ul>
                  </li>
                </ul>
              </li>

              <li>
                <strong>Chart Types & Analysis:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Line Charts:</strong> Track trends over time (revenue, customers)</li>
                  <li><strong>Bar Charts:</strong> Compare categories (service types, regions)</li>
                  <li><strong>Pie Charts:</strong> Show composition (service distribution)</li>
                  <li><strong>Heatmaps:</strong> Geographic performance by service area</li>
                </ul>
              </li>

              <li>
                <strong>Interactive Features:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Hover over data points for detailed information</li>
                  <li>Click legend items to show/hide data series</li>
                  <li>Use date range picker to focus on specific periods</li>
                  <li>Export charts as images or data as CSV</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📋 Generating Business Reports</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Standard Report Types:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Daily Operations Report:</strong>
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Pickups completed vs scheduled</li>
                      <li>Employee hours and productivity</li>
                      <li>Vehicle utilization and fuel costs</li>
                      <li>Customer service issues</li>
                    </ul>
                  </li>
                  <li><strong>Weekly Financial Report:</strong>
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Revenue by service type</li>
                      <li>New customer acquisitions</li>
                      <li>Payment collection status</li>
                      <li>Outstanding invoices</li>
                    </ul>
                  </li>
                  <li><strong>Monthly Business Review:</strong>
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Overall business performance</li>
                      <li>Growth metrics and trends</li>
                      <li>Cost analysis and profitability</li>
                      <li>Strategic recommendations</li>
                    </ul>
                  </li>
                </ul>
              </li>
              
              <li>
                <strong>Creating Custom Reports:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <strong>Quick Access</strong> → <strong>Analytics & Reporting</strong></li>
                  <li>Click <strong>"Generate Custom Report"</strong></li>
                  <li>Select data sources and metrics to include</li>
                  <li>Choose date range and filtering criteria</li>
                  <li>Preview report before finalizing</li>
                </ul>
              </li>

              <li>
                <strong>Report Scheduling:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Set up automatic report generation</li>
                  <li>Choose delivery schedule (daily, weekly, monthly)</li>
                  <li>Add email recipients for automatic distribution</li>
                  <li>Configure report format (PDF, Excel, email)</li>
                </ul>
              </li>

              <li>
                <strong>Report Distribution:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Download reports in various formats</li>
                  <li>Email reports to stakeholders</li>
                  <li>Share reports via secure links</li>
                  <li>Print reports for physical distribution</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">💡 Using Analytics for Business Decisions</h4>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Identifying Growth Opportunities:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Analyze service area performance to identify expansion zones</li>
                  <li>Track customer acquisition costs by marketing channel</li>
                  <li>Identify high-value customer segments</li>
                  <li>Monitor competitor pricing and market share</li>
                </ul>
              </li>
              
              <li>
                <strong>Operational Efficiency:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Route optimization based on pickup density</li>
                  <li>Employee productivity analysis for training needs</li>
                  <li>Vehicle maintenance cost trends</li>
                  <li>Fuel efficiency tracking and improvement</li>
                </ul>
              </li>

              <li>
                <strong>Customer Satisfaction:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>On-time service delivery rates</li>
                  <li>Customer complaint trends and resolution</li>
                  <li>Service quality feedback analysis</li>
                  <li>Customer retention and churn factors</li>
                </ul>
              </li>

              <li>
                <strong>Financial Performance:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Profit margin analysis by service type</li>
                  <li>Cash flow forecasting</li>
                  <li>Cost structure optimization</li>
                  <li>Pricing strategy effectiveness</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">💰 ROI Tracking</h4>
            <div className="text-green-800 space-y-2">
              <p><strong>Marketing ROI:</strong> Track customer acquisition cost vs lifetime value</p>
              <p><strong>Operational ROI:</strong> Measure efficiency improvements and cost savings</p>
              <p><strong>Technology ROI:</strong> Analyze software and automation benefits</p>
              <p><strong>Employee ROI:</strong> Training investment vs productivity gains</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const troubleshootingSections: DocumentationSection[] = [
    {
      id: "troubleshooting",
      title: "Troubleshooting & Common Issues",
      icon: AlertTriangle,
      difficulty: "Beginner",
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">🔧 Troubleshooting Guide</h4>
            <p className="text-red-800">
              Quick solutions to common problems and step-by-step troubleshooting 
              for when things don't work as expected.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🚫 Login & Access Issues</h4>
            <div className="space-y-4">
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-red-700">❌ Problem: Can't log in to admin dashboard</h5>
                <div className="text-sm space-y-2">
                  <p><strong>Symptoms:</strong> Login page shows "Invalid credentials" or "Access denied"</p>
                  <p><strong>Solutions:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Verify you're using the correct email address</li>
                    <li>Check if Caps Lock is on - passwords are case sensitive</li>
                    <li>Try resetting your password using "Forgot Password" link</li>
                    <li>Confirm your account has admin privileges</li>
                    <li>Clear browser cookies and cache, then try again</li>
                    <li>Try a different browser or incognito/private mode</li>
                  </ol>
                  <p><strong>If still not working:</strong> Contact your Super Admin to verify account status</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-red-700">❌ Problem: Dashboard loads slowly or times out</h5>
                <div className="text-sm space-y-2">
                  <p><strong>Symptoms:</strong> White screen, loading indicators that never finish, timeout errors</p>
                  <p><strong>Solutions:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Check your internet connection speed</li>
                    <li>Close other browser tabs to free up memory</li>
                    <li>Refresh the page using Ctrl+F5 (hard refresh)</li>
                    <li>Clear browser cache and reload</li>
                    <li>Try a different browser</li>
                    <li>Check if other users are experiencing the same issue</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">📊 Data & Display Issues</h4>
            <div className="space-y-4">
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-red-700">❌ Problem: Employee locations not showing on map</h5>
                <div className="text-sm space-y-2">
                  <p><strong>Symptoms:</strong> Map loads but no employee pins visible</p>
                  <p><strong>Solutions:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Click the refresh button (↻) in the dashboard header</li>
                    <li>Check if employees are actually clocked in and online</li>
                    <li>Verify employees have GPS enabled on their mobile devices</li>
                    <li>Look at different zoom levels on the map</li>
                    <li>Check the "Employees" tab to see if location data is being received</li>
                  </ol>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-red-700">❌ Problem: Time cards showing incorrect hours</h5>
                <div className="text-sm space-y-2">
                  <p><strong>Symptoms:</strong> Hours don't match employee's actual work time</p>
                  <p><strong>Solutions:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Check if employee forgot to clock out (will show as still active)</li>
                    <li>Verify employee clocked in/out in correct time zone</li>
                    <li>Look for duplicate time entries that need to be removed</li>
                    <li>Check if there are any pending time corrections to approve</li>
                    <li>Ask employee if they had any issues with their mobile app</li>
                  </ol>
                  <p><strong>To fix:</strong> Edit the time card entry and add notes explaining the correction</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-red-700">❌ Problem: Customer information not saving</h5>
                <div className="text-sm space-y-2">
                  <p><strong>Symptoms:</strong> Form appears to save but changes don't persist</p>
                  <p><strong>Solutions:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Make sure all required fields (marked with *) are filled</li>
                    <li>Check that email addresses are in valid format</li>
                    <li>Verify phone numbers don't contain special characters</li>
                    <li>Try saving with shorter text in description fields</li>
                    <li>Refresh the page and try again</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">🔔 Communication & Notification Issues</h4>
            <div className="space-y-4">
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-red-700">❌ Problem: Employees not receiving job assignments</h5>
                <div className="text-sm space-y-2">
                  <p><strong>Symptoms:</strong> Jobs assigned but employees say they don't see them</p>
                  <p><strong>Solutions:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Verify employee mobile app is updated to latest version</li>
                    <li>Check if employee is logged into their mobile dashboard</li>
                    <li>Confirm assignment was saved properly (check Operations tab)</li>
                    <li>Ask employee to refresh their mobile app</li>
                    <li>Send a test message to verify communication is working</li>
                  </ol>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-red-700">❌ Problem: Customers not receiving service confirmations</h5>
                <div className="text-sm space-y-2">
                  <p><strong>Symptoms:</strong> Customers ask about services you've already scheduled</p>
                  <p><strong>Solutions:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Check customer's email address is correct in their profile</li>
                    <li>Ask customer to check spam/junk folder</li>
                    <li>Verify email notifications are enabled in system settings</li>
                    <li>Test by sending a manual notification</li>
                    <li>Consider adding phone/SMS as backup notification method</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">⚡ Performance & Speed Issues</h4>
            <div className="space-y-4">
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-orange-700">⚠️ Problem: Dashboard running slowly</h5>
                <div className="text-sm space-y-2">
                  <p><strong>Quick Fixes:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Close unnecessary browser tabs</li>
                    <li>Use latest version of Chrome, Firefox, or Safari</li>
                    <li>Clear browser cache and cookies</li>
                    <li>Restart your browser</li>
                    <li>Check available RAM (8GB+ recommended)</li>
                  </ol>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-orange-700">⚠️ Problem: Reports taking too long to generate</h5>
                <div className="text-sm space-y-2">
                  <p><strong>Solutions:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Use smaller date ranges for large reports</li>
                    <li>Filter data to specific categories or regions</li>
                    <li>Schedule reports to run during off-peak hours</li>
                    <li>Export data in smaller segments</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📞 When to Contact Support</h4>
            <div className="text-blue-800 space-y-2">
              <p><strong>Contact immediately for:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>System-wide outages affecting multiple users</li>
                <li>Data loss or corruption</li>
                <li>Security concerns or unauthorized access</li>
                <li>Payment processing failures</li>
              </ul>
              <p><strong>Include in your support request:</strong> Browser type/version, error messages, steps to reproduce the issue</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const allSections = [
    ...gettingStartedSections,
    ...customerManagementSections,
    ...employeeManagementSections,
    ...operationsManagementSections,
    ...fleetMaintenanceSections,
    ...analyticsReportingSections,
    ...troubleshootingSections
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Complete App Documentation</h1>
            <p className="text-blue-700">Step-by-step guides for every feature in your waste management system</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{allSections.length}</div>
            <div className="text-sm text-blue-700">Total Guides</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{allSections.filter(s => s.difficulty === "Beginner").length}</div>
            <div className="text-sm text-green-700">Beginner Guides</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{allSections.filter(s => s.difficulty === "Advanced").length}</div>
            <div className="text-sm text-red-700">Advanced Guides</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="getting-started" className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Getting Started Guides
          </h2>
          {gettingStartedSections.map((section) => (
            <Card key={section.id}>
              <Collapsible open={openSections.has(section.id)} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <section.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge className={getDifficultyColor(section.difficulty)}>
                          {section.difficulty}
                        </Badge>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${openSections.has(section.id) ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <ScrollArea className="h-auto max-h-96">
                      {section.content}
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Management
          </h2>
          {customerManagementSections.map((section) => (
            <Card key={section.id}>
              <Collapsible open={openSections.has(section.id)} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <section.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge className={getDifficultyColor(section.difficulty)}>
                          {section.difficulty}
                        </Badge>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${openSections.has(section.id) ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <ScrollArea className="h-auto max-h-96">
                      {section.content}
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Employee Management
          </h2>
          {employeeManagementSections.map((section) => (
            <Card key={section.id}>
              <Collapsible open={openSections.has(section.id)} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <section.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge className={getDifficultyColor(section.difficulty)}>
                          {section.difficulty}
                        </Badge>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${openSections.has(section.id) ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <ScrollArea className="h-auto max-h-96">
                      {section.content}
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Operations Management
          </h2>
          {operationsManagementSections.map((section) => (
            <Card key={section.id}>
              <Collapsible open={openSections.has(section.id)} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <section.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge className={getDifficultyColor(section.difficulty)}>
                          {section.difficulty}
                        </Badge>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${openSections.has(section.id) ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <ScrollArea className="h-auto max-h-96">
                      {section.content}
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Fleet Management
          </h2>
          {fleetMaintenanceSections.map((section) => (
            <Card key={section.id}>
              <Collapsible open={openSections.has(section.id)} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <section.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge className={getDifficultyColor(section.difficulty)}>
                          {section.difficulty}
                        </Badge>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${openSections.has(section.id) ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <ScrollArea className="h-auto max-h-96">
                      {section.content}
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics & Reporting
          </h2>
          {analyticsReportingSections.map((section) => (
            <Card key={section.id}>
              <Collapsible open={openSections.has(section.id)} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <section.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge className={getDifficultyColor(section.difficulty)}>
                          {section.difficulty}
                        </Badge>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${openSections.has(section.id) ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <ScrollArea className="h-auto max-h-96">
                      {section.content}
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Troubleshooting & Support
          </h2>
          {troubleshootingSections.map((section) => (
            <Card key={section.id}>
              <Collapsible open={openSections.has(section.id)} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <section.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge className={getDifficultyColor(section.difficulty)}>
                          {section.difficulty}
                        </Badge>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${openSections.has(section.id) ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <ScrollArea className="h-auto max-h-96">
                      {section.content}
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-gray-900">Need More Help?</span>
        </div>
        <p className="text-gray-700 text-sm">
          This documentation covers all major features of your waste management system. 
          If you need additional assistance or have questions about specific use cases, 
          contact your system administrator or support team.
        </p>
      </div>
    </div>
  );
}