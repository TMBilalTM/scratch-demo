"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultSprites, defaultBackdrops } from "@/lib/assets";
import { useEditorStore } from "@/lib/store";
import { X, Search, Sparkles } from "lucide-react";

interface AssetLibraryProps {
  onClose: () => void;
}

export function AssetLibrary({ onClose }: AssetLibraryProps) {
  const [search, setSearch] = useState("");
  const { addSprite, setBackdrop } = useEditorStore();

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

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="relative w-full max-w-4xl rounded-2xl border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Asset Library</h2>
              <p className="text-sm text-muted-foreground">Choose sprites and backdrops</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="sprites" className="h-[500px]">
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="sprites">🎭 Sprites</TabsTrigger>
              <TabsTrigger value="backdrops">🖼️ Backdrops</TabsTrigger>
              <TabsTrigger value="sounds">🔊 Sounds</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sprites" className="h-[calc(100%-60px)] p-6">
            <ScrollArea className="h-full">
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
                        className="h-20 w-20 rounded-lg bg-white shadow-sm flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: sprite.svg }}
                      />
                      <span className="text-sm font-medium">{sprite.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{sprite.category}</span>
                    </button>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="backdrops" className="h-[calc(100%-60px)] p-6">
            <ScrollArea className="h-full">
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
