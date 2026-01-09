"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BlockEditor, BlockEditorHandle } from "./block-editor";
import { CodeEditor, CodeEditorHandle } from "./code-editor";
import { StageCanvas } from "@/components/stage/stage-canvas";
import { SpriteList } from "@/components/stage/sprite-list";
import { PropertiesPanel } from "@/components/stage/properties-panel";
import { AssetLibrary } from "./asset-library";
import { ProjectDialog } from "./project-dialog";
import { SettingsDialog } from "./settings-dialog";
import { ShareDialog } from "./share-dialog";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { UserMenu } from "@/components/auth/user-menu";
import { useEditorStore } from "@/lib/store";
import { createRuntime, executeCode } from "@/lib/runtime";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Square, 
  RotateCcw,
  Save,
  Share2,
  Settings,
  FolderOpen,
  Download,
  Upload,
  Sparkles,
  Loader2,
  LogIn,
} from "lucide-react";

type EditorMode = "blocks" | "code";

interface EditorWorkspaceProps {
  initialProjectId?: string;
}

export default function EditorWorkspace({ initialProjectId }: EditorWorkspaceProps = {}) {
  const { data: session } = useSession();
  const [mode, setMode] = useState<EditorMode>("blocks");
  const [draftBlocksXml, setDraftBlocksXml] = useState<string>("");
  const [draftCode, setDraftCode] = useState<string>("");
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectId, setProjectId] = useState(() => `project-${Date.now()}`);
  const [projectThumbnail, setProjectThumbnail] = useState<string | null>(null);
  const [isProjectPublic, setIsProjectPublic] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showAssets, setShowAssets] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const blockEditorRef = useRef<BlockEditorHandle>(null);
  const codeEditorRef = useRef<CodeEditorHandle>(null);
  
  const { 
    isPlaying, 
    setPlaying, 
    resetStage, 
    sprites, 
    selectedSpriteId, 
    updateSprite, 
    backdrop,
    zoom,
    gridEnabled,
    loadProjectState,
    saveInitialState,
  } = useEditorStore();
  const { toast } = useToast();

  const syncProjectToCloud = async (opts?: { isPublic?: boolean; thumbnail?: string | null }) => {
    if (!session?.user?.id) return;

    const blocksXml = mode === "blocks"
      ? (blockEditorRef.current?.getWorkspaceXml() ?? draftBlocksXml)
      : draftBlocksXml;
    const code = mode === "blocks"
      ? (blockEditorRef.current?.getCode() ?? draftCode)
      : (codeEditorRef.current?.getCode() ?? draftCode);

    const payload = {
      id: projectId,
      title: projectTitle,
      description: projectDescription || undefined,
      thumbnail:
        typeof opts?.thumbnail === "string" || opts?.thumbnail === null
          ? opts.thumbnail
          : projectThumbnail,
      // Store full editor state in `blocks` so shared projects can be reconstructed.
      blocks: JSON.stringify({
        blocksXml,
        sprites,
        backdrop,
        zoom,
        gridEnabled,
      }),
      code,
      mode,
      isPublic: typeof opts?.isPublic === "boolean" ? opts.isPublic : isProjectPublic,
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to sync project");
      }
    } catch (error) {
      console.error("Cloud sync failed:", error);
      toast({
        title: "Share sync failed",
        description: error instanceof Error ? error.message : "Failed to sync sharing state",
        variant: "destructive",
      });
    }
  };

  // Persist Share dialog open state across refreshes (per project)
  useEffect(() => {
    try {
      const key = `codecraft_share_open:${projectId}`;
      const persisted = localStorage.getItem(key);
      if (persisted === "1") setShowShare(true);
    } catch {
      // ignore storage errors
    }
  }, [projectId]);

  useEffect(() => {
    try {
      const key = `codecraft_share_open:${projectId}`;
      if (showShare) localStorage.setItem(key, "1");
      else localStorage.removeItem(key);
    } catch {
      // ignore storage errors
    }
  }, [projectId, showShare]);

  const handleModeChange = (newMode: EditorMode) => {
    if (newMode === mode) return;

    if (mode === "blocks") {
      const blocksXml = blockEditorRef.current?.getWorkspaceXml() ?? draftBlocksXml;
      const generatedCode = blockEditorRef.current?.getCode() ?? draftCode;
      setDraftBlocksXml(blocksXml);
      setDraftCode(generatedCode);
      setMode(newMode);

      if (newMode === "code") {
        // Best-effort: ensure mounted editor receives the generated code.
        setTimeout(() => {
          codeEditorRef.current?.setCode(generatedCode);
        }, 0);
      }
      return;
    }

    // Leaving code mode
    const currentCode = codeEditorRef.current?.getCode() ?? draftCode;
    setDraftCode(currentCode);
    setMode(newMode);
  };

  // Auto-load project on mount
  useEffect(() => {
    // If initialProjectId provided (from URL), load that project
    if (initialProjectId) {
      handleLoadProject(initialProjectId);
      return;
    }
    
    // Otherwise, load last project
    const lastProjectId = localStorage.getItem("codecraft_last_project");
    if (lastProjectId) {
      handleLoadProject(lastProjectId);
    }
  }, [initialProjectId]); // Re-run if initialProjectId changes

  const handleRun = async () => {
    if (isExecuting) return;
    
    try {
      setIsExecuting(true);
      setPlaying(true);
      
      // Get code from active editor
      let code = "";
      if (mode === "blocks") {
        code = blockEditorRef.current?.getCode() || "";
        setDraftCode(code);
      } else {
        code = codeEditorRef.current?.getCode() || draftCode;
        setDraftCode(code);
      }

      if (!code.trim()) {
        toast({
          title: "No code to run",
          description: "Add some blocks or write code first!",
          variant: "destructive",
        });
        setPlaying(false);
        setIsExecuting(false);
        return;
      }

      // Sprite'ları başlangıç durumuna döndür
      useEditorStore.getState().resetToInitialState();
      
      // DOM güncellemesi için kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 50));

      // Tüm sprite'lar için kodu çalıştır (eğer seçili sprite varsa sadece onu, yoksa hepsini)
      const currentSprites = useEditorStore.getState().sprites;
      
      if (currentSprites.length === 0) {
        toast({
          title: "No sprite found",
          description: "Add a sprite first!",
          variant: "destructive",
        });
        setPlaying(false);
        setIsExecuting(false);
        return;
      }

      // Seçili sprite varsa sadece onun için kod çalıştır, yoksa hepsi için paralel çalıştır
      const targetSprites = selectedSpriteId 
        ? currentSprites.filter(s => s.id === selectedSpriteId)
        : currentSprites;

      // Her sprite için ayrı runtime oluştur ve paralel çalıştır
      const executions = targetSprites.map(sprite => {
        const runtime = createRuntime(
          {
            x: sprite.x,
            y: sprite.y,
            rotation: sprite.rotation,
          },
          (updates) => updateSprite(sprite.id, updates),
          () => {},
          () => useEditorStore.getState()
        );
        return executeCode(code, runtime);
      });

      // Tüm sprite'ların kodlarını paralel çalıştır
      await Promise.all(executions);
      
      toast({
        title: "Success!",
        description: "Code executed successfully",
      });
      
    } catch (error) {
      console.error("Execution error:", error);
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Failed to execute code",
        variant: "destructive",
      });
    } finally {
      setPlaying(false);
      setIsExecuting(false);
    }
  };

  const handleStop = () => {
    setPlaying(false);
  };

  const handleReset = () => {
    resetStage();
    toast({
      title: "Stage Reset",
      description: "All sprites returned to initial positions",
    });
  };

  const handleSave = async () => {
    try {
      const blocksXml = mode === "blocks"
        ? (blockEditorRef.current?.getWorkspaceXml() ?? draftBlocksXml)
        : draftBlocksXml;
      const code = mode === "blocks"
        ? (blockEditorRef.current?.getCode() ?? draftCode)
        : (codeEditorRef.current?.getCode() ?? draftCode);

      const captureInitialThumbnail = async (): Promise<string | null> => {
        try {
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

          const canvas = document.querySelector<HTMLCanvasElement>(
            'canvas[data-codecraft-stage="main"]'
          );
          if (!canvas) return null;

          const targetWidth = 640;
          const targetHeight = 360;
          const targetAspect = targetWidth / targetHeight;

          const srcWidth = canvas.width;
          const srcHeight = canvas.height;
          if (srcWidth <= 0 || srcHeight <= 0) return null;

          // Center-crop 4:3 stage into 16:9 banner
          const cropHeight = Math.round(srcWidth / targetAspect);
          const cropY = Math.max(0, Math.round((srcHeight - cropHeight) / 2));
          const safeCropHeight = Math.min(cropHeight, srcHeight);

          const out = document.createElement("canvas");
          out.width = targetWidth;
          out.height = targetHeight;
          const ctx = out.getContext("2d");
          if (!ctx) return null;

          ctx.drawImage(
            canvas,
            0,
            cropY,
            srcWidth,
            safeCropHeight,
            0,
            0,
            targetWidth,
            targetHeight
          );

          return out.toDataURL("image/png");
        } catch {
          // Can fail if canvas is tainted by cross-origin assets
          return null;
        }
      };

      // Save to localStorage
      const saved = localStorage.getItem("codecraft_projects");
      const projects = saved ? JSON.parse(saved) : [];
      const existingIndex = projects.findIndex((p: any) => p.id === projectId);

      const existing = existingIndex >= 0 ? projects[existingIndex] : null;
      const existingThumb = typeof existing?.thumbnail === "string" ? existing.thumbnail : null;
      const nextThumbnail = existingThumb ?? projectThumbnail ?? (await captureInitialThumbnail());

      const projectData = {
        id: projectId,
        title: projectTitle,
        description: projectDescription,
        thumbnail: nextThumbnail,
        mode,
        blocksXml,
        code,
        isPublic: isProjectPublic,
        sprites: JSON.parse(JSON.stringify(sprites)), // Deep copy
        backdrop: backdrop,
        zoom: zoom,
        gridEnabled: gridEnabled,
        updatedAt: new Date().toISOString(),
        views: typeof existing?.views === "number" ? existing.views : 0,
        likes: typeof existing?.likes === "number" ? existing.likes : 0,
      };
      
      if (existingIndex >= 0) {
        projects[existingIndex] = projectData;
      } else {
        projects.push(projectData);
      }
      
      localStorage.setItem("codecraft_projects", JSON.stringify(projects));
      localStorage.setItem("codecraft_last_project", projectId);
      setLastSaved(new Date());
      setProjectThumbnail(nextThumbnail);

      // If the project is public and user is logged in, keep cloud copy in sync.
      if (isProjectPublic && session?.user?.id) {
        void syncProjectToCloud({ thumbnail: nextThumbnail });
      }
      
      toast({
        title: "Project Saved!",
        description: `"${projectTitle}" has been saved successfully`,
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpen = () => {
    setShowProjects(true);
  };

  const handleCreateNew = () => {
    // Yeni proje ID'si oluştur
    const newProjectId = `project-${Date.now()}`;
    setProjectId(newProjectId);
    setProjectTitle("Untitled Project");
    setProjectDescription("");
    setProjectThumbnail(null);
    setMode("blocks");
    setDraftBlocksXml("");
    setDraftCode("");
    setIsProjectPublic(false);
    
    // Editor'ları temizle
    blockEditorRef.current?.loadWorkspaceXml("");
    codeEditorRef.current?.setCode("");
    
    // Stage'i sıfırla
    resetStage();
    
    // Last saved'i sıfırla
    setLastSaved(null);
    
    toast({
      title: "New Project Created",
      description: "Start building your amazing project!",
    });
  };

  const handleLoadProject = (id: string) => {
    try {
      const saved = localStorage.getItem("codecraft_projects");
      const projects = saved ? JSON.parse(saved) : [];
      const localProject = projects.find((p: any) => p.id === id);

      const applyProject = (project: any) => {
        setProjectId(project.id);
        setProjectTitle(project.title);
        setProjectDescription(project.description || "");
        setProjectThumbnail(typeof project.thumbnail === "string" ? project.thumbnail : null);
        setDraftBlocksXml(project.blocksXml || "");
        setDraftCode(project.code || "");
        setIsProjectPublic(Boolean(project.isPublic));
        setMode(project.mode || "blocks");

        if (project.sprites && project.backdrop) {
          loadProjectState({
            sprites: project.sprites,
            backdrop: project.backdrop,
            zoom: project.zoom,
            gridEnabled: project.gridEnabled,
          });
        }

        setTimeout(() => {
          if ((project.mode || "blocks") === "blocks") {
            blockEditorRef.current?.loadWorkspaceXml(project.blocksXml || "");
          } else {
            codeEditorRef.current?.setCode(project.code || "");
          }
        }, 0);

        localStorage.setItem("codecraft_last_project", project.id);

        toast({
          title: "Project Loaded",
          description: `"${project.title}" opened successfully`,
        });
      };

      if (localProject) {
        applyProject(localProject);
        return;
      }

      // Not found locally: try cloud (public projects, or owner when authenticated)
      void (async () => {
        try {
          const res = await fetch(`/api/projects/${id}`);
          if (!res.ok) {
            throw new Error("Project not found");
          }
          const data = await res.json();
          const p = data?.project;
          if (!p) throw new Error("Project not found");

          let reconstructed: any = {
            id: p.id,
            title: p.title,
            description: p.description || "",
            thumbnail: p.thumbnail || null,
            mode: p.mode || "blocks",
            code: p.code || "",
            isPublic: Boolean(p.isPublic),
          };

          // Try parse full editor state from p.blocks
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
            // Fallback: treat `blocks` as raw blocksXml
            reconstructed.blocksXml = typeof p.blocks === "string" ? p.blocks : "";
          }

          const nextProjects = Array.isArray(projects) ? projects.slice() : [];
          if (!nextProjects.find((x: any) => x.id === reconstructed.id)) {
            nextProjects.push(reconstructed);
            localStorage.setItem("codecraft_projects", JSON.stringify(nextProjects));
          }

          applyProject(reconstructed);
        } catch (error) {
          console.error("Failed to load cloud project:", error);
          toast({
            title: "Project Not Found",
            description: "This project doesn't exist or is private.",
            variant: "destructive",
          });
        }
      })();
    } catch (error) {
      console.error("Load error:", error);
      toast({
        title: "Load Failed",
        description: "Failed to load project",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    try {
      const projectData = {
        title: projectTitle,
        description: projectDescription,
        mode,
        code: mode === "blocks"
          ? (blockEditorRef.current?.getCode() ?? draftCode)
          : (codeEditorRef.current?.getCode() ?? draftCode),
        sprites: sprites,
        backdrop: backdrop,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(projectData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectTitle.replace(/\s+/g, "-").toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Project exported as JSON file",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export project",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    setShowShare(true);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleUpdateProject = async (updates: { title?: string; description?: string }) => {
    if (updates.title !== undefined) setProjectTitle(updates.title);
    if (updates.description !== undefined) setProjectDescription(updates.description);
    
    // Ayarlar güncellendiğinde otomatik kaydet
    setTimeout(() => {
      handleSave();
    }, 100);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [projectTitle, projectDescription, mode, sprites, backdrop, zoom, gridEnabled]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Modern Header with Glassmorphism */}
      <header className="flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-xl px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-0 px-1 -ml-1 rounded hover:bg-muted/50 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : "Not saved yet"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isPlaying || isExecuting ? (
            <Button 
              size="default" 
              variant="destructive" 
              onClick={handleStop}
              disabled={isExecuting}
              className="shadow-lg shadow-destructive/20"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Square className="mr-2 h-4 w-4 fill-current" />
                  Stop
                </>
              )}
            </Button>
          ) : (
            <Button 
              size="default" 
              onClick={handleRun}
              className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              Run
            </Button>
          )}
          
          <Button size="default" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="mx-1 h-8" />
          
          <Button size="sm" variant="ghost" onClick={handleOpen}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Open
          </Button>
          
          <Button size="sm" variant="ghost" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          
          <Button size="sm" variant="ghost" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Separator orientation="vertical" className="mx-1 h-8" />
          
          <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button size="sm" variant="ghost" onClick={handleSettings}>
            <Settings className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="mx-1 h-8" />
          
          {session ? (
            <UserMenu />
          ) : (
            <Button size="sm" variant="outline" onClick={() => setShowAuth(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Code/Blocks Editor */}
        <div className="flex w-[45%] flex-col border-r bg-background/50 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
            <Tabs value={mode} onValueChange={(v) => handleModeChange(v as EditorMode)}>
              <TabsList className="bg-background/80">
                <TabsTrigger value="blocks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  🧩 Blocks
                </TabsTrigger>
                <TabsTrigger value="code" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  💻 Code
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowAssets(!showAssets)}>
                <Upload className="mr-2 h-4 w-4" />
                Assets
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {mode === "blocks" ? (
              <BlockEditor ref={blockEditorRef} initialXml={draftBlocksXml} />
            ) : (
              <CodeEditor ref={codeEditorRef} initialCode={draftCode} />
            )}
          </div>
        </div>

        {/* Center: Stage */}
        <div className="flex flex-1 flex-col bg-gradient-to-b from-muted/10 to-muted/30">
          <div className="flex h-14 items-center justify-between border-b bg-background/50 backdrop-blur-sm px-4">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Stage Preview
            </h2>
          </div>
          
          <div className="flex-1 overflow-hidden p-6">
            <StageCanvas />
          </div>
          
          <div className="border-t bg-background/50 backdrop-blur-sm p-3">
            <SpriteList />
          </div>
        </div>

        {/* Right: Properties Panel */}
        <div className="w-[280px] border-l bg-background/50 backdrop-blur-sm">
          <PropertiesPanel />
        </div>
      </div>

      {/* Asset Library Modal */}
      {showAssets && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <AssetLibrary onClose={() => setShowAssets(false)} />
        </div>
      )}

      {/* Dialogs */}
      <ProjectDialog
        open={showProjects}
        onOpenChange={setShowProjects}
        onLoadProject={handleLoadProject}
        onCreateNew={handleCreateNew}
        currentProjectId={projectId}
      />
      
      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        projectTitle={projectTitle}
        projectDescription={projectDescription}
        onUpdateProject={handleUpdateProject}
      />
      
      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        projectId={projectId}
        projectTitle={projectTitle}
        isPublic={isProjectPublic}
        onIsPublicChange={(next) => {
          if (next && !session?.user?.id) {
            toast({
              title: "Login required",
              description: "You must be logged in to share publicly.",
              variant: "destructive",
            });
            setIsProjectPublic(false);
            return;
          }

          setIsProjectPublic(next);
          setTimeout(() => {
            void (async () => {
              await handleSave();

              if (!session?.user?.id) return;
              try {
                const saved = localStorage.getItem("codecraft_projects");
                const projects = saved ? JSON.parse(saved) : [];
                const current = projects.find((p: any) => p.id === projectId);
                const thumb = typeof current?.thumbnail === "string" ? current.thumbnail : null;
                void syncProjectToCloud({ isPublic: next, thumbnail: thumb ?? projectThumbnail });
              } catch {
                void syncProjectToCloud({ isPublic: next, thumbnail: projectThumbnail });
              }
            })();
          }, 0);
        }}
      />
      
      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        onSuccess={() => {
          toast({
            title: "Welcome!",
            description: "You can now save your projects to the cloud",
          });
        }}
      />
    </div>
  );
}
