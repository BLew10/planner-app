import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma/prisma";

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

    // Update or create the calendar edition layout configuration
    const config = await prisma.calendarEditionLayout.upsert({
      where: {
        calendarEditionId_year: {
          calendarEditionId,
          year,
        },
      },
      update: {
        layoutId,
      },
      create: {
        calendarEditionId,
        layoutId,
        year,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("[CALENDAR_EDITION_CONFIGURE_LAYOUT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
