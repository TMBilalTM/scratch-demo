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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, Clock, Eye, Heart, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  updatedAt: string;
  views: number;
  likes: number;
}

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadProject: (projectId: string) => void;
  onCreateNew: () => void;
  currentProjectId?: string;
}

export function ProjectDialog({ open, onOpenChange, onLoadProject, onCreateNew, currentProjectId }: ProjectDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // For now, use localStorage
      const saved = localStorage.getItem("codecraft_projects");
      if (saved) {
        const allProjects = JSON.parse(saved);
        // En yeni projeler önce gelsin
        const sorted = allProjects.sort((a: Project, b: Project) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setProjects(sorted);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const saved = localStorage.getItem("codecraft_projects");
      if (saved) {
        const allProjects = JSON.parse(saved);
        const projectToDelete = allProjects.find((p: Project) => p.id === projectId);
        const filtered = allProjects.filter((p: Project) => p.id !== projectId);
        localStorage.setItem("codecraft_projects", JSON.stringify(filtered));
        
        // Eğer silinen proje son açılan proje ise, onu da temizle
        const lastProject = localStorage.getItem("codecraft_last_project");
        if (lastProject === projectId) {
          localStorage.removeItem("codecraft_last_project");
        }
        
        setProjects(filtered);
        
        toast({
          title: "Project Deleted",
          description: `"${projectToDelete?.title || 'Project'}" has been deleted successfully`,
        });
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Open Project
          </DialogTitle>
          <DialogDescription>
            Select a project to open and continue editing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => {
                onCreateNew();
                onOpenChange(false);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          <Separator />

          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-muted-foreground">Loading projects...</div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No projects found" : "No saved projects yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and save your first project!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-1">
                {filteredProjects.map((project) => {
                  const isActive = project.id === currentProjectId;
                  return (
                  <div
                    key={project.id}
                    onClick={() => {
                      onLoadProject(project.id);
                      onOpenChange(false);
                    }}
                    className={`group relative border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer ${
                      isActive ? 'border-primary bg-primary/5 shadow-md' : ''
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded z-10">
                        Active
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="font-semibold truncate pr-20">{project.title}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {project.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {project.likes}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => deleteProject(project.id, e)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
