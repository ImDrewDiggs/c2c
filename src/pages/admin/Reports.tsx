
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Download,
  FileText,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminReports() {
  return (
    <AdminPageLayout 
      title="Reports" 
      description="Generate and download detailed reports"
    >
      <Tabs defaultValue="financial">
        <TabsList className="mb-6">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date Range
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Monthly Revenue Summary</div>
                      <div className="text-sm text-muted-foreground">Total revenue by month with comparisons</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Revenue by Service Plan</div>
                      <div className="text-sm text-muted-foreground">Revenue breakdown by subscription type</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Annual Revenue Forecast</div>
                      <div className="text-sm text-muted-foreground">Projected revenue for next 12 months</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expense Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Monthly Expense Summary</div>
                      <div className="text-sm text-muted-foreground">Operational costs by category</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Fleet Maintenance Costs</div>
                      <div className="text-sm text-muted-foreground">Vehicle maintenance and fuel expenses</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Profit & Loss Statement</div>
                      <div className="text-sm text-muted-foreground">Complete P&L for selected period</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="operations" className="space-y-6">
          <div className="flex justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date Range
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Pickup Completion Rate</div>
                      <div className="text-sm text-muted-foreground">On-time vs. late or missed pickups</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Route Efficiency Analysis</div>
                      <div className="text-sm text-muted-foreground">Time and fuel usage per route</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Service Exceptions</div>
                      <div className="text-sm text-muted-foreground">Issues and exceptions during service</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Fleet Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Vehicle Usage</div>
                      <div className="text-sm text-muted-foreground">Miles driven and operating hours</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Maintenance Schedule</div>
                      <div className="text-sm text-muted-foreground">Upcoming and past maintenance</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Fuel Consumption</div>
                      <div className="text-sm text-muted-foreground">Fuel usage by vehicle and route</div>
                    </div>
                    <Button size="sm">Download</Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date Range
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">New Customer Acquisition</div>
                    <div className="text-sm text-muted-foreground">New customers by month and region</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Customer Retention</div>
                    <div className="text-sm text-muted-foreground">Renewal rates and churn analysis</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Service Plan Distribution</div>
                    <div className="text-sm text-muted-foreground">Customer breakdown by plan type</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Customer Feedback Summary</div>
                    <div className="text-sm text-muted-foreground">Analysis of customer ratings and comments</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-6">
          <div className="flex justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date Range
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Employee Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Employee Performance</div>
                    <div className="text-sm text-muted-foreground">Productivity and efficiency metrics</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Work Hours Summary</div>
                    <div className="text-sm text-muted-foreground">Hours worked, overtime, and attendance</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Safety Incidents</div>
                    <div className="text-sm text-muted-foreground">Workplace safety records and trends</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Training Compliance</div>
                    <div className="text-sm text-muted-foreground">Status of required training programs</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sustainability" className="space-y-6">
          <div className="flex justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date Range
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sustainability Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Waste Diversion Rate</div>
                    <div className="text-sm text-muted-foreground">Percentage of waste kept from landfills</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Carbon Footprint Analysis</div>
                    <div className="text-sm text-muted-foreground">Emissions data and reduction targets</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Recycling Impact</div>
                    <div className="text-sm text-muted-foreground">Environmental benefits of recycling efforts</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Water Conservation</div>
                    <div className="text-sm text-muted-foreground">Water usage and savings in operations</div>
                  </div>
                  <Button size="sm">Download</Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}
