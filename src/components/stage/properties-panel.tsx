"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, ZoomIn, ZoomOut, Grid3x3, Image as ImageIcon } from "lucide-react";

const spriteColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
  "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2",
  "#F06292", "#AED581", "#FFD54F", "#4DB6AC"
];

export function PropertiesPanel() {
  const { sprites, selectedSpriteId, updateSprite, zoom, setZoom, gridEnabled, toggleGrid } = useEditorStore();
  
  const selectedSprite = sprites.find((s) => s.id === selectedSpriteId);

  if (!selectedSprite) {
    return (
      <div className="flex h-full flex-col p-4">
        <h3 className="mb-4 text-sm font-semibold">Stage Settings</h3>
        
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label className="text-xs">Zoom</Label>
              <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => setZoom(zoom - 0.1)}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Slider
                value={[zoom]}
                onValueChange={(v) => setZoom(v[0])}
                min={0.25}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => setZoom(zoom + 0.1)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="grid" className="flex items-center gap-2 text-xs">
              <Grid3x3 className="h-4 w-4" />
              Show Grid
            </Label>
            <Switch id="grid" checked={gridEnabled} onCheckedChange={toggleGrid} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col p-4 space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold">Sprite Properties</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input
                id="name"
                value={selectedSprite.name}
                onChange={(e) => updateSprite(selectedSprite.id, { name: e.target.value })}
                className="mt-1.5 h-9"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="x" className="text-xs">X Position</Label>
                <Input
                  id="x"
                  type="number"
                  value={Math.round(selectedSprite.x)}
                  onChange={(e) => updateSprite(selectedSprite.id, { x: Number(e.target.value) })}
                  className="mt-1.5 h-9"
                />
              </div>
              <div>
                <Label htmlFor="y" className="text-xs">Y Position</Label>
                <Input
                  id="y"
                  type="number"
                  value={Math.round(selectedSprite.y)}
                  onChange={(e) => updateSprite(selectedSprite.id, { y: Number(e.target.value) })}
                  className="mt-1.5 h-9"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label htmlFor="rotation" className="text-xs">Rotation</Label>
                <span className="text-xs text-muted-foreground">{selectedSprite.rotation}°</span>
              </div>
              <Slider
                id="rotation"
                value={[selectedSprite.rotation]}
                onValueChange={(v) => updateSprite(selectedSprite.id, { rotation: v[0] })}
                min={0}
                max={360}
                step={1}
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label htmlFor="size" className="text-xs">Size</Label>
                <span className="text-xs text-muted-foreground">{selectedSprite.size}%</span>
              </div>
              <Slider
                id="size"
                value={[selectedSprite.size]}
                onValueChange={(v) => updateSprite(selectedSprite.id, { size: v[0] })}
                min={10}
                max={200}
                step={1}
                className="mt-1.5"
              />
            </div>

            <Separator />

            <div>
              <Label className="mb-3 block text-xs">Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {spriteColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSprite(selectedSprite.id, { color })}
                    className={`h-10 w-10 rounded-lg transition-transform hover:scale-110 ${
                      selectedSprite.color === color ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    style={{ background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)` }}
                  />
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-xs">
                {selectedSprite.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Visible
              </Label>
              <Switch
                checked={selectedSprite.visible}
                onCheckedChange={(checked) => updateSprite(selectedSprite.id, { visible: checked })}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Costume
          </h3>
          <Button variant="outline" className="w-full" disabled>
            Change Costume (Coming Soon)
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}

function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
