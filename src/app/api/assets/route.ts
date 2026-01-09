import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    const where: any = { isPublic: true };
    
    if (type) {
      where.type = type;
    }

    const assets = await prisma.asset.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}
