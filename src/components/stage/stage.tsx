"use client";

import { useEffect, useRef, useState } from "react";

interface StageProps {
  isPlaying: boolean;
}

interface Sprite {
  x: number;
  y: number;
  rotation: number;
  size: number;
  message?: string;
}

export function Stage({ isPlaying }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sprite, setSprite] = useState<Sprite>({
    x: 240,
    y: 180,
    rotation: 0,
    size: 60,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw center lines
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Draw sprite (simple triangle)
    ctx.save();
    ctx.translate(sprite.x, sprite.y);
    ctx.rotate((sprite.rotation * Math.PI) / 180);
    
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.moveTo(0, -sprite.size / 2);
    ctx.lineTo(-sprite.size / 3, sprite.size / 2);
    ctx.lineTo(sprite.size / 3, sprite.size / 2);
    ctx.closePath();
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(-sprite.size / 6, -sprite.size / 6, sprite.size / 8, 0, Math.PI * 2);
    ctx.arc(sprite.size / 6, -sprite.size / 6, sprite.size / 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(-sprite.size / 6, -sprite.size / 6, sprite.size / 16, 0, Math.PI * 2);
    ctx.arc(sprite.size / 6, -sprite.size / 6, sprite.size / 16, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // Draw message bubble
    if (sprite.message) {
      ctx.fillStyle = "white";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      
      const padding = 12;
      const text = sprite.message;
      ctx.font = "14px sans-serif";
      const textWidth = ctx.measureText(text).width;
      const bubbleWidth = textWidth + padding * 2;
      const bubbleHeight = 30;
      const bubbleX = sprite.x - bubbleWidth / 2;
      const bubbleY = sprite.y - sprite.size - 40;
      
      // Rounded rectangle
      ctx.beginPath();
      ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8);
      ctx.fill();
      ctx.stroke();
      
      // Text
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, sprite.x, bubbleY + bubbleHeight / 2);
    }
  }, [sprite, isPlaying]);

  return (
    <div className="flex items-center justify-center">
      <div className="rounded-lg border bg-white shadow-lg">
        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          className="rounded-lg"
        />
      </div>
    </div>
  );
}
