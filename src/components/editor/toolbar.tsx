"use client";

import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export function Toolbar() {
  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="ghost">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-xs text-muted-foreground">100%</span>
      <Button size="sm" variant="ghost">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost">
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
