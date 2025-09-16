import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TimeAdjustmentModal } from './TimeAdjustmentModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  ClockIcon, 
  SearchIcon, 
  EditIcon, 
  AlertTriangleIcon,
  CalendarIcon,
  UserIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface WorkSession {
  id: string;
  employee_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  total_hours: number | null;
  status: string;
  notes: string | null;
  clock_in_location_lat?: number | null;
  clock_in_location_lng?: number | null;
  clock_out_location_lat?: number | null;
  clock_out_location_lng?: number | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  } | null;
}

export function QuickTimeAdjustments() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<WorkSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<WorkSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'incomplete' | 'recent'>('incomplete');

  useEffect(() => {
    fetchWorkSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, filter]);

  const fetchWorkSessions = async () => {
    try {
      setIsLoading(true);
      
      // Get work sessions from the last 7 days with employee profiles
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('work_sessions')
        .select(`
          *,
          profiles!work_sessions_employee_id_fkey (
            full_name,
            email
          )
        `)
        .gte('clock_in_time', sevenDaysAgo.toISOString())
        .order('clock_in_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSessions((data as any) || []);
    } catch (error) {
      console.error('Error fetching work sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load work sessions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'active':
        filtered = filtered.filter(session => session.status === 'active');
        break;
      case 'incomplete':
        filtered = filtered.filter(session => 
          !session.clock_out_time || session.status === 'active'
        );
        break;
      case 'recent':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(session => 
          new Date(session.clock_in_time) >= today
        );
        break;
    }

    setFilteredSessions(filtered);
  };

  const getStatusBadge = (session: WorkSession) => {
    if (session.status === 'active' || !session.clock_out_time) {
      return <Badge variant="destructive" className="gap-1">
        <AlertTriangleIcon className="h-3 w-3" />
        Incomplete
      </Badge>;
    }
    if (session.status === 'completed') {
      return <Badge variant="default">Completed</Badge>;
    }
    if (session.status === 'adjusted') {
      return <Badge variant="secondary">Adjusted</Badge>;
    }
    return <Badge variant="outline">{session.status}</Badge>;
  };

  const formatDuration = (hours: number | null) => {
    if (!hours) return 'N/A';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const handleEditSession = (session: WorkSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleSessionUpdated = () => {
    fetchWorkSessions();
  };

  const incompleteSessions = sessions.filter(s => !s.clock_out_time || s.status === 'active');
  const todaysSessions = sessions.filter(s => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(s.clock_in_time) >= today;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{incompleteSessions.length}</p>
                <p className="text-sm text-muted-foreground">Incomplete Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{todaysSessions.length}</p>
                <p className="text-sm text-muted-foreground">Today's Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{new Set(sessions.map(s => s.employee_id)).size}</p>
                <p className="text-sm text-muted-foreground">Active Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Quick Time Adjustments
          </CardTitle>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filter === 'incomplete' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('incomplete')}
              >
                Incomplete
              </Button>
              <Button
                variant={filter === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('recent')}
              >
                Today
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No work sessions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{session.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{session.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(session.clock_in_time), 'MMM dd, yyyy')}</p>
                          <p className="text-muted-foreground">{format(new Date(session.clock_in_time), 'h:mm a')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.clock_out_time ? (
                          <div className="text-sm">
                            <p>{format(new Date(session.clock_out_time), 'MMM dd, yyyy')}</p>
                            <p className="text-muted-foreground">{format(new Date(session.clock_out_time), 'h:mm a')}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not clocked out</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDuration(session.total_hours)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(session)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSession(session)}
                          className="gap-2"
                        >
                          <EditIcon className="h-4 w-4" />
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Adjustment Modal */}
      <TimeAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        session={selectedSession}
        onSessionUpdated={handleSessionUpdated}
      />
    </div>
  );
}