import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const configuration = await prisma.gridConfiguration.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        isDeleted: false,
      },
      include: {
        calendar: true,
        assignments: {
          include: {
            advertisement: true,
          },
        },
      },
    });

    if (!configuration) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(configuration);
  } catch (error) {
    console.error("Error fetching grid configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch grid configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, topRows, bottomRows, cols, calendarId, calendarYear, assignments } = data;

    // First delete existing assignments
    await prisma.gridAssignment.deleteMany({
      where: {
        gridConfigurationId: params.id,
      },
    });

    // Then update configuration and create new assignments
    const configuration = await prisma.gridConfiguration.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        topRows,
        bottomRows,
        cols,
        calendarId,
        calendarYear,
        assignments: {
          create: assignments.map((assignment: any) => ({
            advertisementId: assignment.advertisementId,
            cells: assignment.cells,
          })),
        },
      },
      include: {
        calendar: true,
        assignments: {
          include: {
            advertisement: true,
          },
        },
      },
    });

    return NextResponse.json(configuration);
  } catch (error) {
    console.error("Error updating grid configuration:", error);
    return NextResponse.json(
      { error: "Failed to update grid configuration" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.gridConfiguration.update({
      where: {
        id: params.id,
      },
      data: {
        isDeleted: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting grid configuration:", error);
    return NextResponse.json(
      { error: "Failed to delete grid configuration" },
      { status: 500 }
    );
  }
} 