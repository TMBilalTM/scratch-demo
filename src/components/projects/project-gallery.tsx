"use client";

import { useEffect, useState } from "react";
import { ProjectCard } from "./project-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  views: number;
  likes: number;
  user: {
    id: string;
    username: string;
  };
  createdAt: string;
}

export function ProjectGallery({ publicOnly = false }: { publicOnly?: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "public">("public");

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (publicOnly || filter === "public") {
        params.set("public", "true");
      }
      
      const response = await fetch(`/api/projects?${params}`);
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <p className="mb-4 text-lg text-muted-foreground">
          No projects found
        </p>
        <Button asChild>
          <a href="/editor">Create Your First Project</a>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {!publicOnly && (
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === "public" ? "default" : "outline"}
            onClick={() => setFilter("public")}
          >
            Public Projects
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All Projects
          </Button>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
