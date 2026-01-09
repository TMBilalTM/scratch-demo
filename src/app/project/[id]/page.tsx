"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EditorWorkspace from "@/components/editor/editor-workspace";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import Head from "next/head";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [projectExists, setProjectExists] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    // Check if project exists
    const saved = localStorage.getItem("codecraft_projects");
    if (saved) {
      const projects = JSON.parse(saved);
      const project = projects.find((p: any) => p.id === projectId);
      setProjectExists(!!project);
      setProjectData(project);
      
      if (project) {
        // Set as last project so it auto-loads in editor
        localStorage.setItem("codecraft_last_project", projectId);
        
        // Set page title and meta description
        document.title = `${project.title} - CodeCraft`;
        
        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute(
          'content', 
          project.description || `${project.title} - Create amazing projects with CodeCraft, a visual programming platform for learning to code.`
        );
      }
    }
    setLoading(false);
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!projectExists) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/editor">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Editor
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <EditorWorkspace initialProjectId={projectId} />;
}
