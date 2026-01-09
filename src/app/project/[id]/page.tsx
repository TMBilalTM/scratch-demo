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
    let cancelled = false;

    const run = async () => {
      try {
        const saved = localStorage.getItem("codecraft_projects");
        const projects = saved ? JSON.parse(saved) : [];
        const local = projects.find((p: any) => p.id === projectId);

        if (local) {
          if (cancelled) return;
          setProjectExists(true);
          setProjectData(local);
          localStorage.setItem("codecraft_last_project", projectId);
          document.title = `${local.title} - CodeCraft`;
          setLoading(false);
          return;
        }

        // Not in local storage: try cloud
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          if (cancelled) return;
          setProjectExists(false);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const p = data?.project;
        if (!p) {
          if (cancelled) return;
          setProjectExists(false);
          setLoading(false);
          return;
        }

        let reconstructed: any = {
          id: p.id,
          title: p.title,
          description: p.description || "",
          mode: p.mode || "blocks",
          code: p.code || "",
          isPublic: Boolean(p.isPublic),
        };

        try {
          const parsed = JSON.parse(p.blocks);
          reconstructed = {
            ...reconstructed,
            blocksXml: parsed?.blocksXml || "",
            sprites: parsed?.sprites,
            backdrop: parsed?.backdrop,
            zoom: parsed?.zoom,
            gridEnabled: parsed?.gridEnabled,
          };
        } catch {
          reconstructed.blocksXml = typeof p.blocks === "string" ? p.blocks : "";
        }

        const nextProjects = Array.isArray(projects) ? projects.slice() : [];
        nextProjects.push(reconstructed);
        localStorage.setItem("codecraft_projects", JSON.stringify(nextProjects));
        localStorage.setItem("codecraft_last_project", projectId);

        if (cancelled) return;
        setProjectExists(true);
        setProjectData(reconstructed);
        document.title = `${reconstructed.title} - CodeCraft`;
        setLoading(false);
      } catch (e) {
        console.error("Failed to load project:", e);
        if (cancelled) return;
        setProjectExists(false);
        setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
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
