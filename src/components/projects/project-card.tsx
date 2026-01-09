"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Eye, Heart } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    views: number;
    likes: number;
    user: {
      id: string;
      username: string;
    };
    createdAt: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${project.id}`}>
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
            {project.thumbnail ? (
              <img
                src={project.thumbnail}
                alt={project.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-4xl">🎨</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <h3 className="mb-1 font-semibold line-clamp-1">{project.title}</h3>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 bg-primary/10">
              <span className="text-xs">{project.user.username[0].toUpperCase()}</span>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {project.user.username}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{project.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{project.likes}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
