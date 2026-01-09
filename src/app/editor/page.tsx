"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const EditorWorkspace = dynamic(
  () => import("@/components/editor/editor-workspace"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function EditorPage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <EditorWorkspace />
    </main>
  );
}
