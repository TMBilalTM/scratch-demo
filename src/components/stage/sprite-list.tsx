"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/store";
import { Plus, Trash2 } from "lucide-react";

const spriteColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
  "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"
];

export function SpriteList() {
  const { sprites, selectedSpriteId, selectSprite, addSprite, deleteSprite } = useEditorStore();

  const handleAddSprite = () => {
    const newSprite = {
      id: `sprite-${Date.now()}`,
      name: `Sprite ${sprites.length + 1}`,
      x: 240 + Math.random() * 100 - 50,
      y: 180 + Math.random() * 100 - 50,
      rotation: 0,
      size: 80,
      visible: true,
      costume: "default",
      color: spriteColors[sprites.length % spriteColors.length],
    };
    addSprite(newSprite);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Sprites:</span>
      
      <ScrollArea className="flex-1">
        <div className="flex gap-2 pb-1">
          {sprites.map((sprite) => (
            <div
              key={sprite.id}
              onClick={() => selectSprite(sprite.id)}
              className={`group relative flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border-2 transition-all hover:scale-105 cursor-pointer ${
                selectedSpriteId === sprite.id
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              <div
                className="h-8 w-8 rounded-full"
                style={{ background: `linear-gradient(135deg, ${sprite.color} 0%, ${adjustColor(sprite.color || "#3b82f6", -20)} 100%)` }}
              />
              <span className="mt-1 text-[10px] font-medium truncate w-full px-1 text-center">
                {sprite.name}
              </span>
              
              {sprites.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSprite(sprite.id);
                  }}
                  className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm group-hover:flex"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleAddSprite}
        className="shrink-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
