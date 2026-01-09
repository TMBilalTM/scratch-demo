import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor - CodeCraft",
  description: "Create and edit your coding projects with block-based or text-based programming",
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
