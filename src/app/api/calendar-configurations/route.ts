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

    const [configurations, totalItems] = await Promise.all([
      prisma.calendarEditionLayout.findMany({
        where: {
          calendarEdition: {
            userId: session.user.id,
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                code: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
        include: {
          calendarEdition: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          layout: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          year: "desc",
        },
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.calendarEditionLayout.count({
        where: {
          calendarEdition: {
            userId: session.user.id,
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                code: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return NextResponse.json({
      configurations,
      totalItems,
      totalPages,
    });
  } catch (error) {
    console.error("[CALENDAR_CONFIGURATIONS_GET]", error);
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
    const { calendarEditionId, layoutId, year } = body;

    if (!calendarEditionId || !layoutId || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the calendar edition belongs to the user
    const calendarEdition = await prisma.calendarEdition.findUnique({
      where: {
        id: calendarEditionId,
        userId: session.user.id,
      },
    });

    if (!calendarEdition) {
      return NextResponse.json(
        { error: "Calendar edition not found" },
        { status: 404 }
      );
    }

    // Verify the layout belongs to the user
    const layout = await prisma.layout.findUnique({
      where: {
        id: layoutId,
        userId: session.user.id,
      },
    });

    if (!layout) {
      return NextResponse.json({ error: "Layout not found" }, { status: 404 });
    }

    // Check if configuration already exists for this year
    const existingConfig = await prisma.calendarEditionLayout.findFirst({
      where: {
        calendarEditionId,
        year,
      },
    });

    if (existingConfig) {
      return NextResponse.json(
        { error: "Configuration already exists for this year" },
        { status: 400 }
      );
    }

    // Create the configuration
    const config = await prisma.calendarEditionLayout.create({
      data: {
        calendarEditionId,
        layoutId,
        year,
      },
      include: {
        calendarEdition: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        layout: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("[CALENDAR_CONFIGURATION_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 