import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Users, 
  Settings, 
  HelpCircle, 
  Code, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Download,
  ExternalLink
} from 'lucide-react';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Can2Curb Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive guide to using our waste management service platform
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline">Version 2.1.0</Badge>
            <Badge variant="secondary">Last Updated: December 2024</Badge>
          </div>
        </div>

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="user-manual">User Manual</TabsTrigger>
            <TabsTrigger value="api-docs">API Documentation</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Getting Started Guide
                </CardTitle>
                <CardDescription>
                  Everything you need to know to start using Can2Curb effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Start */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quick Start</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                        <h4 className="font-medium">Sign Up</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Create your account and choose your service plan
                      </p>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                        <h4 className="font-medium">Setup Profile</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Complete your profile and service address information
                      </p>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                        <h4 className="font-medium">Schedule Service</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Book your first pickup and manage your schedule
                      </p>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* System Requirements */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">System Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Supported Browsers</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Chrome 90+ (Recommended)</li>
                        <li>• Firefox 88+</li>
                        <li>• Safari 14+</li>
                        <li>• Edge 90+</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Mobile Support</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• iOS 14+ (Safari, Chrome)</li>
                        <li>• Android 8+ (Chrome, Firefox)</li>
                        <li>• Responsive design optimized</li>
                        <li>• GPS location services</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Account Types */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Account Types & Access Levels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 border-blue-200 bg-blue-50/50">
                      <Users className="h-8 w-8 text-blue-500 mb-2" />
                      <h4 className="font-medium mb-2">Customer Account</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Schedule pickups</li>
                        <li>• View service history</li>
                        <li>• Manage billing</li>
                        <li>• Track routes</li>
                      </ul>
                    </Card>
                    <Card className="p-4 border-green-200 bg-green-50/50">
                      <Settings className="h-8 w-8 text-green-500 mb-2" />
                      <h4 className="font-medium mb-2">Employee Account</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Time tracking</li>
                        <li>• Route optimization</li>
                        <li>• Job assignments</li>
                        <li>• GPS reporting</li>
                      </ul>
                    </Card>
                    <Card className="p-4 border-purple-200 bg-purple-50/50">
                      <Code className="h-8 w-8 text-purple-500 mb-2" />
                      <h4 className="font-medium mb-2">Admin Account</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Full system access</li>
                        <li>• Employee management</li>
                        <li>• Fleet tracking</li>
                        <li>• Analytics & reports</li>
                      </ul>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Manual */}
          <TabsContent value="user-manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete User Manual</CardTitle>
                <CardDescription>
                  Detailed instructions for all platform features and functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Customer Features */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Customer Portal
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium mb-3">Service Scheduling</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm mb-3">Schedule regular or one-time waste collection services:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Navigate to <code className="bg-background px-1 rounded">Schedule → New Pickup</code></li>
                          <li>Select service type (Regular, One-time, Bulk)</li>
                          <li>Choose pickup date and time window</li>
                          <li>Add special instructions if needed</li>
                          <li>Confirm and submit request</li>
                        </ol>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-3">Subscription Management</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm mb-3">Manage your service plans and billing:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          <li><strong>Single Family Plans:</strong> Residential weekly/bi-weekly service</li>
                          <li><strong>Multi-Family Plans:</strong> Apartment and complex services</li>
                          <li><strong>Commercial Plans:</strong> Business waste management</li>
                          <li><strong>Plan Changes:</strong> Upgrade/downgrade anytime</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-3">Service History & Tracking</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm mb-3">View and track all your service activities:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          <li>Real-time GPS tracking of pickup trucks</li>
                          <li>Service completion notifications</li>
                          <li>Photo documentation of completed services</li>
                          <li>Service history and reports</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Employee Features */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-500" />
                    Employee Dashboard
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium mb-3">Time Tracking</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm mb-3">Clock in/out and track work hours:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Clock In Process:</strong>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Open employee dashboard</li>
                              <li>Click "Clock In" button</li>
                              <li>GPS location automatically recorded</li>
                              <li>Add optional notes</li>
                            </ol>
                          </div>
                          <div>
                            <strong>Clock Out Process:</strong>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Click "Clock Out" button</li>
                              <li>Review hours worked</li>
                              <li>Add completion notes</li>
                              <li>Submit timecard</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-3">Route Optimization</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm mb-3">Optimize daily routes for efficiency:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          <li>View assigned pickup locations on map</li>
                          <li>Get optimized route suggestions</li>
                          <li>Real-time traffic updates</li>
                          <li>Update status for each stop</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-3">Job Management</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm mb-3">Handle daily job assignments:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          <li>View daily job assignments</li>
                          <li>Update job status (Pending → In Progress → Completed)</li>
                          <li>Upload completion photos</li>
                          <li>Report issues or delays</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Admin Features */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5 text-purple-500" />
                    Admin Control Panel
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium mb-3">Employee Management</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm mb-3">Comprehensive employee administration:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Employee Records:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Add new employees</li>
                              <li>Edit employee profiles</li>
                              <li>Manage driver licenses</li>
                              <li>Set pay rates</li>
                            </ul>
                          </div>
                          <div>
                            <strong>Time Management:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Review timecards</li>
                              <li>Adjust work hours</li>
                              <li>Generate payroll reports</li>
                              <li>Track attendance</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-3">Fleet Management</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm mb-3">Manage vehicles and maintenance:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          <li>Vehicle registration and tracking</li>
                          <li>Maintenance scheduling and records</li>
                          <li>Fuel tracking and costs</li>
                          <li>Vehicle assignment to employees</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-3">Analytics & Reporting</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm mb-3">Comprehensive business insights:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          <li>Revenue and financial reports</li>
                          <li>Service completion metrics</li>
                          <li>Employee performance analytics</li>
                          <li>Route efficiency analysis</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Documentation */}
          <TabsContent value="api-docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  REST API endpoints for integrating with Can2Curb platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    API access requires admin-level authentication. Contact support for API key generation.
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Authentication</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm mb-3">All API requests require Bearer token authentication:</p>
                    <pre className="bg-background p-3 rounded text-sm overflow-x-auto">
{`curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
     -H "Content-Type: application/json" \\
     https://api.can2curb.com/v1/endpoint`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Core Endpoints</h3>
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">GET</Badge>
                        <code className="text-sm">/api/v1/customers</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Retrieve customer list with filtering options</p>
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium">View example</summary>
                        <pre className="bg-background p-3 rounded mt-2 overflow-x-auto">
{`// Request
GET /api/v1/customers?status=active&limit=50

// Response
{
  "data": [
    {
      "id": "customer_123",
      "email": "john@example.com",
      "full_name": "John Doe",
      "subscription": {
        "plan": "single_family",
        "status": "active"
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 50
  }
}`}
                        </pre>
                      </details>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">POST</Badge>
                        <code className="text-sm">/api/v1/schedules</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Create new pickup schedule</p>
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium">View example</summary>
                        <pre className="bg-background p-3 rounded mt-2 overflow-x-auto">
{`// Request
POST /api/v1/schedules
{
  "customer_id": "customer_123",
  "service_type": "regular",
  "pickup_date": "2024-01-20",
  "address": "123 Main St, City, State 12345",
  "instructions": "Front yard pickup"
}

// Response
{
  "data": {
    "id": "schedule_456",
    "status": "scheduled",
    "pickup_date": "2024-01-20T08:00:00Z",
    "estimated_window": "08:00-12:00"
  }
}`}
                        </pre>
                      </details>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">GET</Badge>
                        <code className="text-sm">/api/v1/employees/tracking</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Get real-time employee location data</p>
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium">View example</summary>
                        <pre className="bg-background p-3 rounded mt-2 overflow-x-auto">
{`// Request
GET /api/v1/employees/tracking?active=true

// Response
{
  "data": [
    {
      "employee_id": "emp_789",
      "name": "Jane Smith",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "timestamp": "2024-01-20T14:30:00Z"
      },
      "status": "on_route",
      "vehicle_id": "truck_001"
    }
  ]
}`}
                        </pre>
                      </details>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Webhooks</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm mb-3">Configure webhooks to receive real-time updates:</p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li><code>pickup.completed</code> - When a pickup is marked complete</li>
                      <li><code>schedule.created</code> - When a new pickup is scheduled</li>
                      <li><code>employee.clocked_in</code> - When an employee starts work</li>
                      <li><code>payment.successful</code> - When a payment is processed</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Troubleshooting */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Guide</CardTitle>
                <CardDescription>
                  Common issues and step-by-step solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription>
                    Can't find a solution? Contact our support team at support@can2curb.com or call (555) 123-4567
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-600">Login & Authentication Issues</h3>
                    <div className="space-y-4">
                      <Card className="p-4 border-red-200">
                        <h4 className="font-medium mb-2">Problem: Cannot log in / "Invalid credentials" error</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Solution:</strong></p>
                          <ol className="list-decimal list-inside space-y-1 ml-4">
                            <li>Verify email address is correct</li>
                            <li>Check if Caps Lock is enabled</li>
                            <li>Try password reset: Click "Forgot Password"</li>
                            <li>Clear browser cache and cookies</li>
                            <li>Try logging in from incognito/private browser window</li>
                          </ol>
                        </div>
                      </Card>

                      <Card className="p-4 border-red-200">
                        <h4 className="font-medium mb-2">Problem: Account locked / Too many failed attempts</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Solution:</strong></p>
                          <ol className="list-decimal list-inside space-y-1 ml-4">
                            <li>Wait 15 minutes before trying again</li>
                            <li>Use password reset if you're unsure of your password</li>
                            <li>Contact support if lockout persists</li>
                          </ol>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-orange-600">GPS & Location Issues</h3>
                    <div className="space-y-4">
                      <Card className="p-4 border-orange-200">
                        <h4 className="font-medium mb-2">Problem: GPS location not updating</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Solution:</strong></p>
                          <ol className="list-decimal list-inside space-y-1 ml-4">
                            <li>Enable location services in browser settings</li>
                            <li>Refresh the page and allow location access</li>
                            <li>Check if GPS is enabled on mobile device</li>
                            <li>Move to an area with better GPS signal</li>
                            <li>Try logging out and back in</li>
                          </ol>
                        </div>
                      </Card>

                      <Card className="p-4 border-orange-200">
                        <h4 className="font-medium mb-2">Problem: Inaccurate location data</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Solution:</strong></p>
                          <ol className="list-decimal list-inside space-y-1 ml-4">
                            <li>Wait for GPS to acquire better signal (may take 1-2 minutes)</li>
                            <li>Move away from tall buildings or underground areas</li>
                            <li>Restart location services on your device</li>
                            <li>Report persistent issues to admin</li>
                          </ol>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">Billing & Payment Issues</h3>
                    <div className="space-y-4">
                      <Card className="p-4 border-blue-200">
                        <h4 className="font-medium mb-2">Problem: Payment failed / Card declined</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Solution:</strong></p>
                          <ol className="list-decimal list-inside space-y-1 ml-4">
                            <li>Verify card details (number, expiry, CVV)</li>
                            <li>Check with your bank for any holds or limits</li>
                            <li>Ensure sufficient funds are available</li>
                            <li>Try a different payment method</li>
                            <li>Contact our billing department for assistance</li>
                          </ol>
                        </div>
                      </Card>

                      <Card className="p-4 border-blue-200">
                        <h4 className="font-medium mb-2">Problem: Subscription not updating</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Solution:</strong></p>
                          <ol className="list-decimal list-inside space-y-1 ml-4">
                            <li>Allow 24-48 hours for plan changes to take effect</li>
                            <li>Check email for confirmation of plan change</li>
                            <li>Log out and back in to refresh account status</li>
                            <li>Contact billing support if changes don't appear</li>
                          </ol>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-600">Performance Issues</h3>
                    <div className="space-y-4">
                      <Card className="p-4 border-green-200">
                        <h4 className="font-medium mb-2">Problem: Slow loading / Page timeouts</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Solution:</strong></p>
                          <ol className="list-decimal list-inside space-y-1 ml-4">
                            <li>Check your internet connection speed</li>
                            <li>Close other browser tabs and applications</li>
                            <li>Clear browser cache and cookies</li>
                            <li>Try using a different browser</li>
                            <li>Restart your router/modem</li>
                          </ol>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Quick answers to common questions about Can2Curb
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">General Questions</h3>
                  
                  <div className="space-y-3">
                    <details className="bg-muted/50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium">What services does Can2Curb provide?</summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Can2Curb provides comprehensive waste management services including regular residential pickup, 
                        commercial waste collection, recycling services, bulk item removal, and specialized waste disposal. 
                        We serve both single-family homes and multi-family properties.
                      </p>
                    </details>

                    <details className="bg-muted/50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium">How do I change my pickup schedule?</summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Log into your customer dashboard and navigate to "Schedule Management." You can reschedule pickups 
                        up to 24 hours in advance. For emergency changes, contact our support team directly.
                      </p>
                    </details>

                    <details className="bg-muted/50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium">What payment methods do you accept?</summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        We accept all major credit cards (Visa, MasterCard, American Express), bank transfers (ACH), 
                        and PayPal. Automatic recurring billing is available for subscription customers.
                      </p>
                    </details>

                    <details className="bg-muted/50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium">Can I track my pickup in real-time?</summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Yes! All customers can track their assigned pickup truck in real-time through the customer portal. 
                        You'll receive notifications when the truck is approaching and when service is completed.
                      </p>
                    </details>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Billing & Subscriptions</h3>
                  
                  <div className="space-y-3">
                    <details className="bg-muted/50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium">How is billing calculated?</summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Billing is based on your selected service plan: Single Family plans start at $25/month for weekly service, 
                        Multi-Family plans are calculated per unit, and Commercial plans are customized based on volume and frequency. 
                        All plans include pickup, disposal, and basic recycling.
                      </p>
                    </details>

                    <details className="bg-muted/50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium">Can I pause my subscription temporarily?</summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Yes, you can pause your subscription for up to 90 days through your customer dashboard. 
                        Perfect for vacations or temporary relocations. You'll only pay a small maintenance fee during the pause period.
                      </p>
                    </details>

                    <details className="bg-muted/50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium">What happens if I miss a payment?</summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        We'll send email reminders and attempt to process payment again. After 15 days, service may be suspended. 
                        Contact our billing team immediately if you're experiencing payment issues - we're here to help find a solution.
                      </p>
                    </details>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Technical Support</h3>
                  
                  <div className="space-y-3">
                    <details className="bg-muted/50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium">What browsers are supported?</summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Can2Curb works best on Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. 
                        Mobile browsers are fully supported on iOS 14+ and Android 8+. For the best experience, 
                        keep your browser updated to the latest version.
                      </p>
                    </details>

                    <details className="bg-muted/50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium">Is my data secure?</summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Absolutely. We use enterprise-grade security including SSL encryption, regular security audits, 
                        and compliance with industry standards. Your personal and payment information is protected with 
                        the same security standards used by major financial institutions.
                      </p>
                    </details>

                    <details className="bg-muted/50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium">How do I reset my password?</summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Click "Forgot Password" on the login page, enter your email address, and we'll send you a secure 
                        reset link. The link expires after 1 hour for security. If you don't receive the email, check your spam folder.
                      </p>
                    </details>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Best Practices */}
          <TabsContent value="best-practices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Best Practices & Optimization</CardTitle>
                <CardDescription>
                  Recommended workflows and tips for getting the most out of Can2Curb
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Customer Best Practices
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 border-blue-200 bg-blue-50/50">
                      <CheckCircle className="h-8 w-8 text-blue-500 mb-3" />
                      <h4 className="font-medium mb-2">Scheduling Optimization</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Schedule recurring pickups for consistency</li>
                        <li>• Book bulk items 48 hours in advance</li>
                        <li>• Use the "preferred time window" feature</li>
                        <li>• Set up automatic notifications</li>
                      </ul>
                    </Card>

                    <Card className="p-4 border-blue-200 bg-blue-50/50">
                      <CheckCircle className="h-8 w-8 text-blue-500 mb-3" />
                      <h4 className="font-medium mb-2">Service Preparation</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Place bins at curbside by 6 AM</li>
                        <li>• Separate recyclables properly</li>
                        <li>• Secure loose items in bags</li>
                        <li>• Keep pickup area accessible</li>
                      </ul>
                    </Card>

                    <Card className="p-4 border-blue-200 bg-blue-50/50">
                      <CheckCircle className="h-8 w-8 text-blue-500 mb-3" />
                      <h4 className="font-medium mb-2">Communication Tips</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Use specific instructions in booking</li>
                        <li>• Enable SMS notifications</li>
                        <li>• Report issues promptly</li>
                        <li>• Provide feedback after service</li>
                      </ul>
                    </Card>

                    <Card className="p-4 border-blue-200 bg-blue-50/50">
                      <CheckCircle className="h-8 w-8 text-blue-500 mb-3" />
                      <h4 className="font-medium mb-2">Cost Management</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Choose the right plan for your needs</li>
                        <li>• Bundle services for discounts</li>
                        <li>• Monitor usage through dashboard</li>
                        <li>• Set up autopay for convenience</li>
                      </ul>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-500" />
                    Employee Best Practices
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 border-green-200 bg-green-50/50">
                      <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                      <h4 className="font-medium mb-2">Time Management</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Clock in/out at exact work times</li>
                        <li>• Take breaks according to schedule</li>
                        <li>• Update job status in real-time</li>
                        <li>• Submit timecards promptly</li>
                      </ul>
                    </Card>

                    <Card className="p-4 border-green-200 bg-green-50/50">
                      <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                      <h4 className="font-medium mb-2">Route Efficiency</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Follow optimized route suggestions</li>
                        <li>• Update GPS location regularly</li>
                        <li>• Communicate delays immediately</li>
                        <li>• Plan for traffic and weather</li>
                      </ul>
                    </Card>

                    <Card className="p-4 border-green-200 bg-green-50/50">
                      <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                      <h4 className="font-medium mb-2">Customer Service</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Take completion photos</li>
                        <li>• Handle special requests professionally</li>
                        <li>• Report hazardous materials</li>
                        <li>• Maintain clean work area</li>
                      </ul>
                    </Card>

                    <Card className="p-4 border-green-200 bg-green-50/50">
                      <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                      <h4 className="font-medium mb-2">Safety Protocols</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Wear required safety equipment</li>
                        <li>• Report equipment issues immediately</li>
                        <li>• Follow proper lifting techniques</li>
                        <li>• Maintain vehicle cleanliness</li>
                      </ul>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5 text-purple-500" />
                    Admin Best Practices
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 border-purple-200 bg-purple-50/50">
                      <CheckCircle className="h-8 w-8 text-purple-500 mb-3" />
                      <h4 className="font-medium mb-2">Operations Management</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Monitor daily performance metrics</li>
                        <li>• Review employee timecards weekly</li>
                        <li>• Optimize routes based on data</li>
                        <li>• Schedule maintenance proactively</li>
                      </ul>
                    </Card>

                    <Card className="p-4 border-purple-200 bg-purple-50/50">
                      <CheckCircle className="h-8 w-8 text-purple-500 mb-3" />
                      <h4 className="font-medium mb-2">Data Analytics</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Generate regular performance reports</li>
                        <li>• Track KPIs and trends</li>
                        <li>• Analyze customer satisfaction</li>
                        <li>• Monitor financial metrics</li>
                      </ul>
                    </Card>

                    <Card className="p-4 border-purple-200 bg-purple-50/50">
                      <CheckCircle className="h-8 w-8 text-purple-500 mb-3" />
                      <h4 className="font-medium mb-2">Employee Development</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Conduct regular performance reviews</li>
                        <li>• Provide ongoing training</li>
                        <li>• Recognize outstanding performance</li>
                        <li>• Address issues promptly</li>
                      </ul>
                    </Card>

                    <Card className="p-4 border-purple-200 bg-purple-50/50">
                      <CheckCircle className="h-8 w-8 text-purple-500 mb-3" />
                      <h4 className="font-medium mb-2">Security & Compliance</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Review security logs regularly</li>
                        <li>• Maintain data backup procedures</li>
                        <li>• Ensure regulatory compliance</li>
                        <li>• Update access permissions</li>
                      </ul>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Performance Optimization Tips</h3>
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">System Performance</h4>
                        <ul className="text-sm space-y-2">
                          <li>• Keep browser cache under 100MB</li>
                          <li>• Close unused browser tabs</li>
                          <li>• Use latest browser versions</li>
                          <li>• Enable GPS for accurate tracking</li>
                          <li>• Maintain stable internet connection</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Workflow Efficiency</h4>
                        <ul className="text-sm space-y-2">
                          <li>• Batch similar tasks together</li>
                          <li>• Use keyboard shortcuts when available</li>
                          <li>• Set up automated notifications</li>
                          <li>• Regularly update contact information</li>
                          <li>• Use mobile app for field operations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Guide
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Video Tutorials
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Need additional help? Contact our support team at{" "}
            <a href="mailto:support@can2curb.com" className="text-primary hover:underline">
              support@can2curb.com
            </a>{" "}
            or call (555) 123-4567
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Documentation last updated: December 2024 • Version 2.1.0
          </p>
        </div>
      </div>
    </div>
  );
}