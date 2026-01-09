"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store";
import { defaultBackdrops, defaultSprites } from "@/lib/assets";

export function StageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    sprites, 
    selectedSpriteId, 
    zoom, 
    gridEnabled, 
    backdrop, 
    selectSprite, 
    updateSprite, 
    saveInitialState,
    setMousePosition,
    setKeyPressed,
  } = useEditorStore();
  const [backdropImage, setBackdropImage] = useState<HTMLImageElement | null>(null);
  const [spriteImages, setSpriteImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSpriteId, setDraggedSpriteId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const loadSvgAsImage = (
    svg: string,
    onLoad: (img: HTMLImageElement) => void,
    onFail: () => void,
    context: { kind: "backdrop" | "sprite"; id: string }
  ) => {
    if (!svg?.trim()) {
      onFail();
      return () => {};
    }

    const img = new Image();

    // Prefer data URL: avoids some blob URL decoding/CSP edge cases.
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    let blobUrl: string | null = null;
    let settled = false;

    const cleanup = () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };

    img.onload = () => {
      if (settled) return;
      settled = true;
      onLoad(img);
      cleanup();
    };

    img.onerror = () => {
      if (settled) return;

      // Fallback: blob URL
      if (!blobUrl) {
        try {
          const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
          blobUrl = URL.createObjectURL(svgBlob);
          img.src = blobUrl;
          return;
        } catch {
          // ignore
        }
      }

      settled = true;
      // Keep this as warn (not error) to avoid scaring users; still provides debug info.
      console.warn(`Failed to load ${context.kind} SVG as image`, {
        id: context.id,
        svgLength: svg.length,
      });
      onFail();
      cleanup();
    };

    img.src = dataUrl;
    return cleanup;
  };

  // Backdrop SVG'sini Image'a çevir
  useEffect(() => {
    const backdropData = defaultBackdrops.find((b) => b.id === backdrop);
    if (!backdropData) {
      setBackdropImage(null);
      return;
    }

    return loadSvgAsImage(
      backdropData.svg,
      (img) => setBackdropImage(img),
      () => setBackdropImage(null),
      { kind: "backdrop", id: backdropData.id }
    );
  }, [backdrop]);

  // Sprite SVG'lerini Image'lara çevir
  useEffect(() => {
    const newImages = new Map<string, HTMLImageElement>();
    
    sprites.forEach((sprite) => {
      if (sprite.costumeSvg) {
        loadSvgAsImage(
          sprite.costumeSvg,
          (img) => {
            newImages.set(sprite.id, img);
            setSpriteImages(new Map(newImages));
          },
          () => {
            // no-op: sprite will fall back to default triangle
          },
          { kind: "sprite", id: sprite.id }
        );
      }
    });
  }, [sprites]);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeyPressed(e.key, true);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeyPressed(e.key, false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setKeyPressed]);
  
  // Mouse position tracker
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / zoom) - (canvas.width / zoom / 2);
    const y = ((canvas.height / zoom / 2) - ((e.clientY - rect.top) / zoom));
    
    setMousePosition(Math.round(x), Math.round(y));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context and apply zoom
      ctx.save();
      ctx.scale(zoom, zoom);
      
      // Backdrop - SVG image veya gradient
      if (backdropImage) {
        ctx.drawImage(backdropImage, 0, 0, canvas.width / zoom, canvas.height / zoom);
      } else {
        // Varsayılan gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / zoom);
        gradient.addColorStop(0, "#87CEEB");
        gradient.addColorStop(1, "#E0F6FF");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width / zoom, canvas.height / zoom);
      }
      
      // Grid
      if (gridEnabled) {
        ctx.strokeStyle = "#e5e7eb40";
        ctx.lineWidth = 1 / zoom;
        
        const gridSpacing = 40;
        const canvasWidth = canvas.width / zoom;
        const canvasHeight = canvas.height / zoom;
        
        for (let x = 0; x <= canvasWidth; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();
        }
        
        for (let y = 0; y <= canvasHeight; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
          ctx.stroke();
        }

        // Center lines
        ctx.strokeStyle = "#d1d5db80";
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, 0);
        ctx.lineTo(canvasWidth / 2, canvasHeight);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight / 2);
        ctx.lineTo(canvasWidth, canvasHeight / 2);
        ctx.stroke();
        
        ctx.setLineDash([]);
      }

      // Sprites
      sprites.forEach((sprite) => {
        if (!sprite.visible) return;

        ctx.save();
        ctx.translate(sprite.x, sprite.y);
        // Rotate around center - 0° points right
        ctx.rotate((sprite.rotation * Math.PI) / 180);
        ctx.scale(sprite.size / 100, sprite.size / 100);

        // Sprite SVG image varsa onu kullan
        const spriteImg = spriteImages.get(sprite.id);
        if (spriteImg) {
          // SVG'yi merkeze al
          ctx.drawImage(spriteImg, -30, -30, 60, 60);
        } else {
          // Varsayılan triangle sprite
          const gradient = ctx.createLinearGradient(-40, -30, 40, 30);
          gradient.addColorStop(0, sprite.color || "#3b82f6");
          gradient.addColorStop(1, adjustColor(sprite.color || "#3b82f6", -20));
          
          ctx.fillStyle = gradient;
          ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 4;
          
          // Triangle pointing RIGHT (0° default)
          ctx.beginPath();
          ctx.moveTo(40, 0);      // Point (front)
          ctx.lineTo(-25, -30);   // Top back
          ctx.lineTo(-25, 30);    // Bottom back
          ctx.closePath();
          ctx.fill();
          
          // Outline for clarity
          ctx.strokeStyle = adjustColor(sprite.color || "#3b82f6", -40);
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;

          // Eyes pointing forward
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(10, -12, 8, 0, Math.PI * 2);
          ctx.arc(10, 12, 8, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "black";
          ctx.beginPath();
          ctx.arc(12, -12, 4, 0, Math.PI * 2);
          ctx.arc(12, 12, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Direction indicator (small dot at front)
          ctx.fillStyle = adjustColor(sprite.color || "#3b82f6", -60);
          ctx.beginPath();
          ctx.arc(35, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Selection highlight
        if (sprite.id === selectedSpriteId) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(0, 0, 50, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();

        // Message bubble
        if (sprite.message) {
          const padding = 16;
          ctx.font = "bold 14px system-ui";
          const textWidth = ctx.measureText(sprite.message).width;
          const bubbleWidth = textWidth + padding * 2;
          const bubbleHeight = 40;
          const bubbleX = sprite.x - bubbleWidth / 2;
          const bubbleY = sprite.y - sprite.size - 60;

          // Bubble shadow
          ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 2;

          // Bubble
          ctx.fillStyle = "white";
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 12);
          ctx.fill();
          ctx.stroke();

          // Pointer
          ctx.beginPath();
          ctx.moveTo(sprite.x - 8, bubbleY + bubbleHeight);
          ctx.lineTo(sprite.x, bubbleY + bubbleHeight + 8);
          ctx.lineTo(sprite.x + 8, bubbleY + bubbleHeight);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;

          // Text
          ctx.fillStyle = "#1e293b";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(sprite.message, sprite.x, bubbleY + bubbleHeight / 2);
        }
      });
      
      // Restore context after zoom
      ctx.restore();
    };

    draw();
  }, [sprites, selectedSpriteId, zoom, gridEnabled, backdrop, backdropImage, spriteImages]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  const findSpriteAtPosition = (x: number, y: number) => {
    for (let i = sprites.length - 1; i >= 0; i--) {
      const sprite = sprites[i];
      const distance = Math.sqrt(
        Math.pow(x - sprite.x, 2) + Math.pow(y - sprite.y, 2)
      );
      
      if (distance < sprite.size / 2) {
        return sprite;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const sprite = findSpriteAtPosition(pos.x, pos.y);
    
    if (sprite) {
      setIsDragging(true);
      setDraggedSpriteId(sprite.id);
      setDragOffset({
        x: pos.x - sprite.x,
        y: pos.y - sprite.y
      });
      selectSprite(sprite.id);
    } else {
      selectSprite(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedSpriteId) return;
    
    const pos = getMousePos(e);
    const newX = pos.x - dragOffset.x;
    const newY = pos.y - dragOffset.y;
    
    // Bounds checking
    const boundedX = Math.max(30, Math.min(610, newX));
    const boundedY = Math.max(30, Math.min(450, newY));
    
    updateSprite(draggedSpriteId, {
      x: boundedX,
      y: boundedY
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedSpriteId(null);
      // Başlangıç konumunu kaydet
      saveInitialState();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedSpriteId(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Click zaten mouseDown/mouseUp ile handle ediliyor
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative rounded-2xl border-4 border-border bg-white shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            handleMouseMove(e);
            handleCanvasMouseMove(e);
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
        />
        
        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>
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
