import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, Image } from "lucide-react";

interface UploadPhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  assignmentId?: string;
}

export function UploadPhotoModal({ open, onOpenChange, userId, assignmentId }: UploadPhotoModalProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [photoType, setPhotoType] = useState("completion");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select a file smaller than 10MB."
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file."
        });
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a photo to upload."
      });
      return;
    }

    setIsUploading(true);

    try {
      // In a real app, you would upload to Supabase Storage
      // For now, we'll simulate the upload
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a record of the photo upload
      // const { error } = await supabase
      //   .from('job_photos')
      //   .insert({
      //     user_id: userId,
      //     assignment_id: assignmentId,
      //     photo_url: uploadedUrl,
      //     caption: caption,
      //     photo_type: photoType,
      //     uploaded_at: new Date().toISOString()
      //   });

      toast({
        title: "Photo Uploaded",
        description: "Your photo has been uploaded successfully."
      });

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setCaption("");
      setPhotoType("completion");
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption("");
    setPhotoType("completion");
    onOpenChange(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>📷 Upload Photo</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>Photo</Label>
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={triggerFileInput}
            >
              {preview ? (
                <div className="space-y-2">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-w-full max-h-40 mx-auto rounded-md object-cover"
                  />
                  <p className="text-sm text-muted-foreground">
                    Click to change photo
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Click to upload photo</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Photo Type */}
          <div className="space-y-2">
            <Label htmlFor="photo-type">Photo Type</Label>
            <select 
              id="photo-type"
              value={photoType}
              onChange={(e) => setPhotoType(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              <option value="completion">Job Completion</option>
              <option value="before">Before Service</option>
              <option value="after">After Service</option>
              <option value="issue">Issue/Problem</option>
              <option value="equipment">Equipment</option>
              <option value="safety">Safety Concern</option>
            </select>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Textarea
              id="caption"
              placeholder="Add a description or note about this photo..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {assignmentId && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <strong>Job:</strong> #{assignmentId.substring(0, 8)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleCancel}
              disabled={isUploading}
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
            
            <Button 
              size="sm"
              className="flex-1"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
            >
              <Upload className="mr-1 h-3 w-3" />
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}