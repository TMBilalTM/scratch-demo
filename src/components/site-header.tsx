"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">CodeCraft</span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <Button
              asChild
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/">Ana Sayfa</Link>
            </Button>
            <Button
              asChild
              variant={isActive("/projects") ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/projects">Projeler</Link>
            </Button>
            <Button
              asChild
              variant={isActive("/editor") ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/editor">Editör</Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className={cn("sm:hidden")}> 
            <Link href="/projects">Keşfet</Link>
          </Button>
          {session ? (
            <UserMenu />
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/">Giriş</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
