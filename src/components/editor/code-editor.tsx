"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { useEditorStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

export interface CodeEditorHandle {
  getCode: () => string;
  setCode: (code: string) => void;
}

export const CodeEditor = forwardRef<CodeEditorHandle>((props, ref) => {
  const { sprites, selectedSpriteId, selectSprite } = useEditorStore();
  const [code, setCode] = useState(`// Welcome to CodeCraft!
// Write your JavaScript code here

async function main() {
  // Move forward 100 steps
  moveForward(100);
  await wait(500);
  
  // Turn right 90 degrees
  turn(90);
  await wait(500);
  
  // Move forward 100 steps
  moveForward(100);
  await wait(500);
  
  // Say hello
  say('Hello CodeCraft!');
}

main();
`);

  useImperativeHandle(ref, () => ({
    getCode: () => code,
    setCode: (newCode: string) => setCode(newCode),
  }));

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Sprite Selector */}
      <div className="border-b bg-muted/30 px-4 py-2 flex items-center gap-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Target Sprite:</span>
        <Select
          value={selectedSpriteId || "all"}
          onValueChange={(value) => selectSprite(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[200px] h-8">
            <SelectValue placeholder="Select sprite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                All Sprites ({sprites.length})
              </span>
            </SelectItem>
            {sprites.map((sprite) => (
              <SelectItem key={sprite.id} value={sprite.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sprite.color || "#3b82f6" }}
                  />
                  {sprite.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {selectedSpriteId ? "Code runs for selected sprite only" : "Code runs for all sprites"}
        </span>
      </div>
      
      {/* Code Editor */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 resize-none border-0 bg-muted/30 p-4 font-mono text-sm focus:outline-none focus:ring-0"
        spellCheck={false}
        style={{ 
          tabSize: 2,
        }}
      />
    </div>
  );
});
