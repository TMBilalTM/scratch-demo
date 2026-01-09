import { Metadata } from "next";
import { ProjectGallery } from "@/components/projects/project-gallery";

export const metadata: Metadata = {
  title: "Projects - CodeCraft",
  description: "Explore and discover amazing coding projects created by the CodeCraft community",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Project Gallery</h1>
          <p className="text-muted-foreground">
            Discover amazing projects created by our community
          </p>
        </div>
        
        <ProjectGallery />
      </div>
    </main>
  );
}
