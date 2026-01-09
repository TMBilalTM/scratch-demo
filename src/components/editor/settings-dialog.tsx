"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon } from "lucide-react";
import { useEditorStore } from "@/lib/store";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  projectDescription: string;
  onUpdateProject: (updates: { title?: string; description?: string }) => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  projectTitle,
  projectDescription,
  onUpdateProject,
}: SettingsDialogProps) {
  const { gridEnabled, toggleGrid } = useEditorStore();
  const [title, setTitle] = useState(projectTitle);
  const [description, setDescription] = useState(projectDescription);
  const [autoSave, setAutoSave] = useState(true);

  // Modal açıldığında prop değerlerini state'e aktar
  useEffect(() => {
    if (open) {
      setTitle(projectTitle);
      setDescription(projectDescription);
    }
  }, [open, projectTitle, projectDescription]);

  const handleSave = () => {
    onUpdateProject({ title, description });
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Değişiklikleri geri al
    setTitle(projectTitle);
    setDescription(projectDescription);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Project Settings
          </DialogTitle>
          <DialogDescription>
            Configure your project settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Project Information</h3>
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Title</Label>
              <Input
                id="project-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Input
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your project..."
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Editor Preferences</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save your project every 30 seconds
                </p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Grid</Label>
                <p className="text-sm text-muted-foreground">
                  Display grid lines on the stage canvas
                </p>
              </div>
              <Switch checked={gridEnabled} onCheckedChange={toggleGrid} />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
