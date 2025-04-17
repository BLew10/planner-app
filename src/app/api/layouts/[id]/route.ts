import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const layout = await prisma.layout.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
        isDeleted: false,
      },
      include: {
        adPlacements: {
          include: {
            advertisement: true,
          },
        },
      },
    });

    if (!layout) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(layout);
  } catch (error) {
    console.error("[LAYOUT_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, savedAreas } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // First update the layout
    const layout = await prisma.layout.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        name,
        description,
      },
    });

    // If savedAreas are provided, update them
    if (savedAreas) {
      // Delete existing ad placements
      await prisma.adPlacement.deleteMany({
        where: {
          layoutId: params.id,
        },
      });

      // Create new ad placements
      await prisma.adPlacement.createMany({
        data: savedAreas.map((area: any) => ({
          layoutId: params.id,
          advertisementId: area.adTypeId,
          position: area.position,
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
        })),
      });
    }

    return NextResponse.json(layout);
  } catch (error) {
    console.error("[LAYOUT_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the layout and its ad placements (cascade delete will handle this)
    await prisma.layout.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LAYOUT_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 