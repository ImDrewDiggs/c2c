import { useState, useEffect } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DollarSign, Edit, Save, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/ui/Loading";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  frequency: string;
  category: string;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export default function AdminPricing() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: 0,
    frequency: 'monthly',
    category: 'single_family',
    features: [],
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category, sort_order, name');

      if (error) throw error;

      // Transform the data to match our Service interface
      const transformedServices: Service[] = (data || []).map(service => ({
        ...service,
        description: service.description || '',
        sort_order: service.sort_order || 0,
        features: Array.isArray(service.features) 
          ? service.features.filter((f): f is string => typeof f === 'string')
          : []
      }));

      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load services"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveService = async (service: Service) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('services')
        .update({
          name: service.name,
          description: service.description,
          price: service.price,
          frequency: service.frequency,
          features: service.features,
          is_active: service.is_active,
          sort_order: service.sort_order
        })
        .eq('id', service.id);

      if (error) throw error;

      setServices(prev => prev.map(s => s.id === service.id ? service : s));
      setEditingService(null);
      
      toast({
        title: "Success",
        description: "Service updated successfully"
      });
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update service"
      });
    } finally {
      setSaving(false);
    }
  };

  const createService = async () => {
    try {
      setSaving(true);
      
      // Ensure required fields are present
      if (!newService.name || typeof newService.price !== 'number') {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Name and price are required fields"
        });
        return;
      }

      const serviceToCreate = {
        name: newService.name,
        description: newService.description || '',
        price: newService.price,
        frequency: newService.frequency || 'monthly',
        category: newService.category || 'single_family',
        features: newService.features || [],
        is_active: newService.is_active ?? true,
        sort_order: newService.sort_order || 0
      };
      
      const { data, error } = await supabase
        .from('services')
        .insert([serviceToCreate])
        .select()
        .single();

      if (error) throw error;

      // Transform the returned data to match our interface
      const transformedService: Service = {
        ...data,
        description: data.description || '',
        sort_order: data.sort_order || 0,
        features: Array.isArray(data.features) 
          ? data.features.filter((f): f is string => typeof f === 'string')
          : []
      };

      setServices(prev => [...prev, transformedService]);
      setIsCreateModalOpen(false);
      setNewService({
        name: '',
        description: '',
        price: 0,
        frequency: 'monthly',
        category: 'single_family',
        features: [],
        is_active: true,
        sort_order: 0
      });
      
      toast({
        title: "Success",
        description: "Service created successfully"
      });
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create service"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: string) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== id));
      
      toast({
        title: "Success",
        description: "Service deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete service"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const updatedService = { ...service, is_active: !service.is_active };
      await saveService(updatedService);
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  const updateFeatures = (service: Service, featuresText: string) => {
    const features = featuresText.split('\n').filter(f => f.trim() !== '');
    return { ...service, features };
  };

  const ServiceCard = ({ service, isEditing }: { service: Service; isEditing: boolean }) => {
    const [localService, setLocalService] = useState(service);

    useEffect(() => {
      setLocalService(service);
    }, [service]);

    if (isEditing) {
      return (
        <Card className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={() => setEditingService(null)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`service-${service.id}-name`}>Service Name</Label>
                <Input
                  id={`service-${service.id}-name`}
                  value={localService.name}
                  onChange={(e) => setLocalService({ ...localService, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`service-${service.id}-description`}>Description</Label>
                <Input
                  id={`service-${service.id}-description`}
                  value={localService.description}
                  onChange={(e) => setLocalService({ ...localService, description: e.target.value })}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`service-${service.id}-price`}>Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id={`service-${service.id}-price`}
                  type="number"
                  step="0.01"
                  value={localService.price}
                  onChange={(e) => setLocalService({ ...localService, price: parseFloat(e.target.value) || 0 })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`service-${service.id}-features`}>Features (one per line)</Label>
              <Textarea
                id={`service-${service.id}-features`}
                value={localService.features.join('\n')}
                onChange={(e) => setLocalService(updateFeatures(localService, e.target.value))}
                placeholder="Enter features, one per line"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={`service-${service.id}-active`}
                checked={localService.is_active}
                onCheckedChange={(checked) => setLocalService({ ...localService, is_active: checked })}
              />
              <Label htmlFor={`service-${service.id}-active`}>Active</Label>
            </div>
            <Button
              className="w-full"
              onClick={() => saveService(localService)}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {service.name}
                {!service.is_active && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditingService(service)}>
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Service</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{service.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteService(service.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">${service.price}</div>
          <div className="text-muted-foreground mb-4 capitalize">{service.frequency}</div>
          <ul className="space-y-2">
            {service.features.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2 text-green-500 mt-0.5">✓</span>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleServiceStatus(service)}
              className="w-full"
            >
              {service.is_active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getServicesByCategory = (category: string) => {
    return services.filter(service => service.category === category);
  };

  if (loading) {
    return <Loading fullscreen={true} message="Loading services..." />;
  }

  return (
    <AdminPageLayout 
      title="Service Pricing" 
      description="Manage service offerings and pricing plans"
    >
      <Tabs defaultValue="single_family">
        <TabsList className="mb-6">
          <TabsTrigger value="single_family">Single Family</TabsTrigger>
          <TabsTrigger value="multi_family">Multi-Family</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
        </TabsList>
        
        {['single_family', 'multi_family', 'commercial'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {category === 'single_family' ? 'Single Family Plans' :
                 category === 'multi_family' ? 'Multi-Family Plans' : 'Commercial Plans'}
              </h2>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setNewService({ ...newService, category })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Service</DialogTitle>
                    <DialogDescription>
                      Add a new service plan to this category.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-service-name">Service Name</Label>
                      <Input
                        id="new-service-name"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        placeholder="Enter service name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-service-description">Description</Label>
                      <Input
                        id="new-service-description"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        placeholder="Enter service description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-service-price">Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-service-price"
                          type="number"
                          step="0.01"
                          value={newService.price}
                          onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                          className="pl-8"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-service-features">Features (one per line)</Label>
                      <Textarea
                        id="new-service-features"
                        value={newService.features?.join('\n') || ''}
                        onChange={(e) => setNewService(updateFeatures(newService as Service, e.target.value))}
                        placeholder="Enter features, one per line"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createService} disabled={saving || !newService.name}>
                      {saving ? "Creating..." : "Create Service"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getServicesByCategory(category).map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isEditing={editingService?.id === service.id}
                />
              ))}
            </div>
            
            {getServicesByCategory(category).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No services found for this category.</p>
                <p className="text-sm text-muted-foreground mt-1">Click "Add Service" to create your first service.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AdminPageLayout>
  );
}