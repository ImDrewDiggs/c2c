import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Truck, Plus, Minus, MapPin, RefreshCw, Eye, 
  NotebookPen, Camera, Clock, TrendingUp, DollarSign, 
  AlertTriangle, MessageSquare, Bell, HelpCircle, 
  FileText, Calendar, Settings, CheckCircle2, Navigation
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Location } from "@/types/map";
import { JobDetailsModal } from "./JobDetailsModal";
import { AddNoteModal } from "./AddNoteModal";
import { UploadPhotoModal } from "./UploadPhotoModal";
import { ReportIssueModal } from "./ReportIssueModal";
import { MessageAdminModal } from "./MessageAdminModal";
import { PTORequestModal } from "./PTORequestModal";

interface FieldWorkerGroupsProps {
  assignments: Assignment[];
  userId: string;
  currentLocation: Location | null;
  onRefreshRoute: () => void;
  onMarkComplete: (assignment: Assignment) => void;
  onViewRoute: (assignment: Assignment) => void;
}

export function FieldWorkerGroups({ 
  assignments, 
  userId, 
  currentLocation, 
  onRefreshRoute, 
  onMarkComplete, 
  onViewRoute 
}: FieldWorkerGroupsProps) {
  const { toast } = useToast();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [showMessageAdmin, setShowMessageAdmin] = useState(false);
  const [showPTORequest, setShowPTORequest] = useState(false);
  const [isClocked, setIsClocked] = useState(false);
  const [todayHours, setTodayHours] = useState(0);
  const [grossPay, setGrossPay] = useState(0);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const pendingStops = assignments.filter(a => a.status === 'pending' || a.status === 'in_progress');
  const completedStops = assignments.filter(a => a.status === 'completed');
  const totalStops = assignments.length;
  const progressPercent = totalStops > 0 ? (completedStops.length / totalStops) * 100 : 0;

  const handleClockInOut = async () => {
    try {
      if (!isClocked) {
        // Clock in
        const { error } = await supabase
          .from('work_sessions')
          .insert({
            employee_id: userId,
            clock_in_location_lat: currentLocation?.latitude,
            clock_in_location_lng: currentLocation?.longitude,
            status: 'active'
          });
        
        if (error) throw error;
        setIsClocked(true);
        toast({ title: "Clocked In", description: "GPS tracking started" });
      } else {
        // Clock out
        const { error } = await supabase
          .from('work_sessions')
          .update({
            clock_out_time: new Date().toISOString(),
            clock_out_location_lat: currentLocation?.latitude,
            clock_out_location_lng: currentLocation?.longitude,
            status: 'completed'
          })
          .eq('employee_id', userId)
          .eq('status', 'active');
        
        if (error) throw error;
        setIsClocked(false);
        toast({ title: "Clocked Out", description: "Work session ended" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update clock status" });
    }
  };

  const handleOptimizeRoute = async () => {
    try {
      // This would typically call a route optimization service
      toast({ title: "Route Optimized", description: "Calculating most efficient route..." });
      // Simulate API call
      setTimeout(() => {
        toast({ title: "Route Ready", description: "Optimized route calculated successfully" });
      }, 2000);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to optimize route" });
    }
  };

  const handleToggleMaintenanceMode = async () => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'maintenance_mode',
          value: { enabled: true },
          category: 'system'
        });
      
      if (error) throw error;
      toast({ title: "Maintenance Mode", description: "System maintenance mode toggled" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to toggle maintenance mode" });
    }
  };

  const groups = [
    {
      id: "route",
      title: "🚛 My Route",
      icon: <Truck className="h-5 w-5" />,
      actions: [
        {
          label: "Today's Stops",
          icon: <MapPin className="h-4 w-4" />,
          onClick: () => toast({ title: "Today's Stops", description: `${pendingStops.length} pending, ${completedStops.length} completed` }),
          badge: `${completedStops.length}/${totalStops}`
        },
        {
          label: "Optimized Route",
          icon: <Navigation className="h-4 w-4" />,
          onClick: handleOptimizeRoute
        },
        {
          label: "Refresh Route",
          icon: <RefreshCw className="h-4 w-4" />,
          onClick: onRefreshRoute
        },
        {
          label: "Job Details",
          icon: <Eye className="h-4 w-4" />,
          onClick: () => setShowJobDetails(true),
          disabled: !selectedAssignment
        }
      ]
    },
    {
      id: "logging",
      title: "🗑️ Task Logging",
      icon: <NotebookPen className="h-5 w-5" />,
      actions: [
        {
          label: "Add Note 📝",
          icon: <NotebookPen className="h-4 w-4" />,
          onClick: () => setShowAddNote(true)
        },
        {
          label: "Upload Photo 📷",
          icon: <Camera className="h-4 w-4" />,
          onClick: () => setShowUploadPhoto(true)
        }
      ]
    },
    {
      id: "progress",
      title: "📊 Progress & Status",
      icon: <TrendingUp className="h-5 w-5" />,
      actions: [
        {
          label: isClocked ? "Clock Out 🕒" : "Clock In 🕒",
          icon: <Clock className="h-4 w-4" />,
          onClick: handleClockInOut,
          variant: isClocked ? "destructive" : "default"
        },
        {
          label: "Today's Progress 📈",
          icon: <TrendingUp className="h-4 w-4" />,
          onClick: () => toast({ title: "Progress", description: `${Math.round(progressPercent)}% complete` }),
          badge: `${Math.round(progressPercent)}%`
        },
        {
          label: "Total Hours Worked ⏱️",
          icon: <Clock className="h-4 w-4" />,
          onClick: () => toast({ title: "Hours Worked", description: `${todayHours.toFixed(1)} hours today` }),
          badge: `${todayHours.toFixed(1)}h`
        },
        {
          label: "Estimated Gross Pay 💵",
          icon: <DollarSign className="h-4 w-4" />,
          onClick: () => toast({ title: "Estimated Pay", description: `$${grossPay.toFixed(2)} today` }),
          badge: `$${grossPay.toFixed(2)}`
        },
        {
          label: "Report Issue ⚠️",
          icon: <AlertTriangle className="h-4 w-4" />,
          onClick: () => setShowReportIssue(true),
          variant: "outline"
        }
      ]
    },
    {
      id: "communication",
      title: "📢 Communication",
      icon: <MessageSquare className="h-5 w-5" />,
      actions: [
        {
          label: "Message Admin / Request Help 📩",
          icon: <MessageSquare className="h-4 w-4" />,
          onClick: () => setShowMessageAdmin(true)
        },
        {
          label: "Receive Alerts / Announcements 📲",
          icon: <Bell className="h-4 w-4" />,
          onClick: () => toast({ title: "Notifications", description: "Checking for new alerts..." })
        },
        {
          label: "Request Time Off 📝",
          icon: <FileText className="h-4 w-4" />,
          onClick: () => setShowPTORequest(true)
        }
      ]
    },
    {
      id: "settings",
      title: "⚙️ Settings",
      icon: <Settings className="h-5 w-5" />,
      actions: [
        {
          label: "Schedule 🗓️",
          icon: <Calendar className="h-4 w-4" />,
          onClick: () => toast({ title: "Schedule", description: "Opening weekly schedule..." })
        },
        {
          label: "Profile / Preferences 🛠️",
          icon: <Settings className="h-4 w-4" />,
          onClick: () => toast({ title: "Settings", description: "Opening preferences..." })
        }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* Current Stops Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{pendingStops.length}</div>
              <div className="text-sm text-muted-foreground">Pending Stops</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedStops.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(progressPercent)}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stops List */}
      {pendingStops.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Stops</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {pendingStops.slice(0, 3).map((assignment) => (
                <div 
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowJobDetails(true);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div>
                      <div className="font-medium text-sm">{assignment.house?.address}</div>
                      <div className="text-xs text-muted-foreground">
                        Job #{assignment.id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {assignment.status}
                  </Badge>
                </div>
              ))}
              {pendingStops.length > 3 && (
                <div className="text-center text-sm text-muted-foreground pt-2">
                  +{pendingStops.length - 3} more stops
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expandable Groups */}
      {groups.map((group) => (
        <Card key={group.id}>
          <Collapsible
            open={expandedGroups[group.id]}
            onOpenChange={() => toggleGroup(group.id)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    {group.icon}
                    <span>{group.title}</span>
                  </div>
                  {expandedGroups[group.id] ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || "outline"}
                      size="lg"
                      className="h-16 flex-col gap-1 relative"
                      onClick={action.onClick}
                      disabled={action.disabled}
                    >
                      <div className="flex items-center space-x-2">
                        {action.icon}
                        <span className="text-sm font-medium">{action.label}</span>
                      </div>
                      {action.badge && (
                        <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      {/* Modals */}
      {showJobDetails && selectedAssignment && (
        <JobDetailsModal
          assignment={selectedAssignment}
          open={showJobDetails}
          onOpenChange={setShowJobDetails}
          onMarkComplete={() => onMarkComplete(selectedAssignment)}
          onViewRoute={() => onViewRoute(selectedAssignment)}
        />
      )}

      {showAddNote && (
        <AddNoteModal
          open={showAddNote}
          onOpenChange={setShowAddNote}
          userId={userId}
          assignmentId={selectedAssignment?.id}
        />
      )}

      {showUploadPhoto && (
        <UploadPhotoModal
          open={showUploadPhoto}
          onOpenChange={setShowUploadPhoto}
          userId={userId}
          assignmentId={selectedAssignment?.id}
        />
      )}

      {showReportIssue && (
        <ReportIssueModal
          open={showReportIssue}
          onOpenChange={setShowReportIssue}
          userId={userId}
          assignmentId={selectedAssignment?.id}
        />
      )}

      {showMessageAdmin && (
        <MessageAdminModal
          open={showMessageAdmin}
          onOpenChange={setShowMessageAdmin}
          userId={userId}
        />
      )}

      {showPTORequest && (
        <PTORequestModal
          open={showPTORequest}
          onOpenChange={setShowPTORequest}
          userId={userId}
        />
      )}
    </div>
  );
}