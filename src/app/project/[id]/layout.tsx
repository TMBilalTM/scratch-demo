import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project - CodeCraft",
  description: "View and edit your CodeCraft project",
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
