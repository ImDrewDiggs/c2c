import { useState } from "react";
import { Package, Plus, Trash, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface BulkItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

interface BulkItemRequestProps {
  userId: string;
}

const BulkItemRequest = ({ userId }: BulkItemRequestProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<BulkItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    quantity: 1,
    description: ""
  });
  const [pickupAddress, setPickupAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const commonBulkItems = [
    "Furniture (Couch, Chair, Table)",
    "Mattress/Box Spring",
    "Large Appliances",
    "Electronics",
    "Exercise Equipment",
    "Other"
  ];

  const addItem = () => {
    if (!currentItem.name) {
      toast({
        title: "Item name required",
        description: "Please enter an item name.",
        variant: "destructive"
      });
      return;
    }

    const newItem: BulkItem = {
      id: Date.now().toString(),
      name: currentItem.name,
      quantity: currentItem.quantity,
      description: currentItem.description
    };

    setItems([...items, newItem]);
    setCurrentItem({ name: "", quantity: 1, description: "" });
    
    toast({
      title: "Item added",
      description: `${newItem.name} has been added to your request.`
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmitRequest = async () => {
    if (items.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one bulk item to your request.",
        variant: "destructive"
      });
      return;
    }

    if (!pickupAddress) {
      toast({
        title: "Address required",
        description: "Please provide a pickup address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Request Submitted!",
        description: `Your bulk item pickup request for ${items.length} item(s) has been submitted. We'll contact you within 24 hours with pricing and scheduling.`
      });
      
      // Reset form
      setItems([]);
      setPickupAddress("");
      setLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Bulk Item Pickup Request
        </CardTitle>
        <CardDescription>
          Request pickup for large or bulk items (pricing: $45-$99 per item)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Item Section */}
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold">Add Items</h3>
          
          <div className="space-y-2">
            <Label>Item Name *</Label>
            <Input
              placeholder="e.g., Couch, Refrigerator, Mattress"
              value={currentItem.name}
              onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              list="common-items"
            />
            <datalist id="common-items">
              {commonBulkItems.map(item => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              value={currentItem.quantity}
              onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Dimensions, condition, any details that help us prepare..."
              value={currentItem.description}
              onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          <Button onClick={addItem} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Item to Request
          </Button>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Items in Request ({items.length})</h3>
            {items.map(item => (
              <div key={item.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    <Badge variant="secondary">Qty: {item.quantity}</Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Pickup Address */}
        <div className="space-y-2">
          <Label>Pickup Address *</Label>
          <Textarea
            placeholder="Enter your complete pickup address..."
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <Button 
          onClick={handleSubmitRequest} 
          disabled={loading || items.length === 0 || !pickupAddress}
          className="w-full"
        >
          {loading ? "Submitting..." : "Submit Bulk Pickup Request"}
        </Button>

        {/* Pricing Information */}
        <div className="bg-primary/10 p-4 rounded-lg space-y-2 text-sm">
          <p className="font-semibold text-primary">Pricing Information</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Standard bulk items: $45 per item</li>
            <li>Large appliances/furniture: $75-$99 per item</li>
            <li>ELITE members receive priority scheduling</li>
            <li>We'll provide exact pricing within 24 hours</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkItemRequest;
