import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma/prisma";

const ITEMS_PER_PAGE = 10;

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const [layouts, totalItems] = await Promise.all([
      prisma.layout.findMany({
        where: {
          userId: session.user.id,
          isDeleted: false,
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          adPlacements: {
            include: {
              advertisement: true,
            },
          },
        },
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.layout.count({
        where: {
          userId: session.user.id,
          isDeleted: false,
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return NextResponse.json({
      layouts,
      totalItems,
      totalPages,
    });
  } catch (error) {
    console.error("[LAYOUTS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("[LAYOUTS_POST] Request body:", body);

    const { name, description, savedAreas } = body;

    if (!name || !savedAreas?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the layout with ad placements
    const layout = await prisma.layout.create({
      data: {
        name,
        description,
        userId: session.user.id,
        adPlacements: {
          create: savedAreas.map((area: any) => ({
            advertisementId: area.adTypeId,
            position: area.position,
            x: Math.floor(area.x),
            y: Math.floor(area.y),
            width: Math.floor(area.width),
            height: Math.floor(area.height),
          })),
        },
      },
      include: {
        adPlacements: {
          include: {
            advertisement: true,
          },
        },
      },
    });

    return NextResponse.json(layout);
  } catch (error) {
    console.error("[LAYOUTS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 