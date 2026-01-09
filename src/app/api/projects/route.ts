import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

const projectSchema = z.object({
  id: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  blocks: z.string(),
  code: z.string(),
  mode: z.enum(["blocks", "code"]),
  isPublic: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isPublic = searchParams.get("public") === "true";

    const session = await auth();

    const where: any = {};

    if (isPublic) {
      where.isPublic = true;
    } else {
      // Non-public listing is only for the current user's projects.
      if (!session?.user?.id) {
        return NextResponse.json({ projects: [] });
      }
      where.userId = session.user.id;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    if (!validatedData.id) {
      return NextResponse.json(
        { error: "Project id is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({
      where: { id: validatedData.id },
      select: { id: true, userId: true },
    });

    if (existing && existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = existing
      ? await prisma.project.update({
          where: { id: validatedData.id },
          data: {
            title: validatedData.title,
            description: validatedData.description,
            blocks: validatedData.blocks,
            code: validatedData.code,
            mode: validatedData.mode,
            isPublic: validatedData.isPublic,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        })
      : await prisma.project.create({
          data: {
            id: validatedData.id,
            title: validatedData.title,
            description: validatedData.description,
            blocks: validatedData.blocks,
            code: validatedData.code,
            mode: validatedData.mode,
            isPublic: validatedData.isPublic,
            userId: session.user.id,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
