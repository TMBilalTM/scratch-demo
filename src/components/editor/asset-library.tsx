"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultSprites, defaultBackdrops } from "@/lib/assets";
import { useEditorStore } from "@/lib/store";
import { X, Search, Sparkles, Upload, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssetLibraryProps {
  onClose: () => void;
}

interface CustomAsset {
  id: string;
  name: string;
  svg: string;
  category: string;
  type: 'sprite' | 'backdrop';
  createdAt: number;
}

export function AssetLibrary({ onClose }: AssetLibraryProps) {
  const [search, setSearch] = useState("");
  const [customAssets, setCustomAssets] = useState<CustomAsset[]>([]);
  const { addSprite, setBackdrop } = useEditorStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'sprite' | 'backdrop'>('sprite');

  const handleAddSprite = (sprite: typeof defaultSprites[0]) => {
    addSprite({
      id: `sprite-${Date.now()}`,
      name: sprite.name,
      x: 320,
      y: 240,
      rotation: 0,
      size: 80,
      visible: true,
      costume: sprite.id,
      costumeSvg: sprite.svg,
      color: "#3b82f6",
    });
    onClose();
  };

  const handleSetBackdrop = (backdrop: typeof defaultBackdrops[0]) => {
    setBackdrop(backdrop.id);
    onClose();
  };

  const handleUploadClick = (type: 'sprite' | 'backdrop') => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (PNG, JPG, SVG)",
        variant: "destructive",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        
        let svgContent: string;
        
        if (file.type === 'image/svg+xml') {
          // Direct SVG
          svgContent = await file.text();
        } else {
          // Convert to SVG wrapper for raster images
          const img = new Image();
          img.onload = () => {
            svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}"><image href="${dataUrl}" width="${img.width}" height="${img.height}"/></svg>`;
            
            const newAsset: CustomAsset = {
              id: `custom-${Date.now()}`,
              name: file.name.replace(/\.[^/.]+$/, ""),
              svg: svgContent,
              category: 'custom',
              type: uploadType,
              createdAt: Date.now(),
            };
            
            setCustomAssets(prev => [...prev, newAsset]);
            toast({
              title: "Asset uploaded",
              description: `${file.name} has been added to your library`,
            });
          };
          img.src = dataUrl;
          return;
        }

        const newAsset: CustomAsset = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          svg: svgContent,
          category: 'custom',
          type: uploadType,
          createdAt: Date.now(),
        };
        
        setCustomAssets(prev => [...prev, newAsset]);
        toast({
          title: "Asset uploaded",
          description: `${file.name} has been added to your library`,
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomAsset = (assetId: string) => {
    setCustomAssets(prev => prev.filter(a => a.id !== assetId));
    toast({
      title: "Asset deleted",
      description: "The custom asset has been removed",
    });
  };

  const handleAddCustomSprite = (asset: CustomAsset) => {
    addSprite({
      id: `sprite-${Date.now()}`,
      name: asset.name,
      x: 320,
      y: 240,
      rotation: 0,
      size: 80,
      visible: true,
      costume: asset.id,
      costumeSvg: asset.svg,
      color: "#3b82f6",
    });
    onClose();
  };

  const handleSetCustomBackdrop = (asset: CustomAsset) => {
    // For custom backdrops, we need to update the store
    // This would require extending the backdrop system
    toast({
      title: "Coming soon",
      description: "Custom backdrop support will be added soon",
    });
  };

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="relative w-full max-w-5xl rounded-2xl border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Asset Manager</h2>
              <p className="text-sm text-muted-foreground">Manage sprites, backdrops, and sounds</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search & Upload */}
        <div className="border-b p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Content */}
        <Tabs defaultValue="sprites" className="h-[550px]">
          <div className="border-b px-4 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="sprites">🎭 Sprites</TabsTrigger>
              <TabsTrigger value="backdrops">🖼️ Backdrops</TabsTrigger>
              <TabsTrigger value="sounds">🔊 Sounds</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sprites" className="h-[calc(100%-60px)] p-6">
            <div className="mb-4 flex justify-end">
              <Button
                onClick={() => handleUploadClick('sprite')}
                size="sm"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Sprite
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(100%-48px)]">
              {/* Custom Sprites */}
              {customAssets.filter(a => a.type === 'sprite').length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">My Sprites</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {customAssets
                      .filter(a => a.type === 'sprite' && a.name.toLowerCase().includes(search.toLowerCase()))
                      .map((asset) => (
                        <div
                          key={asset.id}
                          className="group relative flex flex-col items-center gap-2 rounded-xl border-2 border-primary/50 bg-primary/5 p-4 transition-all hover:border-primary hover:scale-105"
                        >
                          <button
                            onClick={() => handleAddCustomSprite(asset)}
                            className="w-full"
                          >
                            <div
                              className="h-20 w-20 mx-auto rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden"
                              dangerouslySetInnerHTML={{ __html: asset.svg }}
                            />
                            <span className="text-sm font-medium mt-2 block">{asset.name}</span>
                            <span className="text-xs text-primary capitalize block">custom</span>
                          </button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteCustomAsset(asset.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Default Sprites */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Library Sprites</h3>
                <div className="grid grid-cols-4 gap-4">
                  {defaultSprites
                    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
                    .map((sprite) => (
                      <button
                        key={sprite.id}
                        onClick={() => handleAddSprite(sprite)}
                        className="group flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-muted/30 p-4 transition-all hover:border-primary hover:bg-primary/5 hover:scale-105"
                      >
                        <div
                          className="h-20 w-20 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: sprite.svg }}
                        />
                        <span className="text-sm font-medium">{sprite.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{sprite.category}</span>
                      </button>
                    ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="backdrops" className="h-[calc(100%-60px)] p-6">
            <div className="mb-4 flex justify-end">
              <Button
                onClick={() => handleUploadClick('backdrop')}
                size="sm"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Backdrop
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(100%-48px)]">
              {/* Custom Backdrops */}
              {customAssets.filter(a => a.type === 'backdrop').length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">My Backdrops</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {customAssets
                      .filter(a => a.type === 'backdrop' && a.name.toLowerCase().includes(search.toLowerCase()))
                      .map((asset) => (
                        <div
                          key={asset.id}
                          className="group relative flex flex-col gap-2 rounded-xl border-2 border-primary/50 bg-primary/5 p-3 transition-all hover:border-primary hover:scale-105"
                        >
                          <button
                            onClick={() => handleSetCustomBackdrop(asset)}
                            className="w-full"
                          >
                            <div
                              className="aspect-video w-full rounded-lg overflow-hidden shadow-sm bg-white"
                              dangerouslySetInnerHTML={{ __html: asset.svg }}
                            />
                            <span className="text-sm font-medium mt-2 block">{asset.name}</span>
                            <span className="text-xs text-primary capitalize block">custom</span>
                          </button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteCustomAsset(asset.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Default Backdrops */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Library Backdrops</h3>
                <div className="grid grid-cols-3 gap-4">
                  {defaultBackdrops
                    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
                    .map((backdrop) => (
                      <button
                        key={backdrop.id}
                        onClick={() => handleSetBackdrop(backdrop)}
                        className="group flex flex-col gap-2 rounded-xl border-2 border-border bg-muted/30 p-3 transition-all hover:border-primary hover:bg-primary/5 hover:scale-105"
                      >
                        <div
                          className="aspect-video w-full rounded-lg overflow-hidden shadow-sm"
                          dangerouslySetInnerHTML={{ __html: backdrop.svg }}
                        />
                        <span className="text-sm font-medium">{backdrop.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{backdrop.category}</span>
                      </button>
                    ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sounds" className="h-[calc(100%-60px)] p-6">
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Sound library coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
