import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const configurations = await prisma.gridConfiguration.findMany({
      where: {
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

    return NextResponse.json(configurations);
  } catch (error) {
    console.error("Error fetching grid configurations:", error);
    return NextResponse.json(
      { error: "Failed to fetch grid configurations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, topRows, bottomRows, cols, calendarId, calendarYear, assignments } = data;

    const configuration = await prisma.gridConfiguration.create({
      data: {
        name,
        topRows,
        bottomRows,
        cols,
        calendarId,
        calendarYear,
        userId: session.user.id,
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
    console.error("Error creating grid configuration:", error);
    return NextResponse.json(
      { error: "Failed to create grid configuration" },
      { status: 500 }
    );
  }
} 