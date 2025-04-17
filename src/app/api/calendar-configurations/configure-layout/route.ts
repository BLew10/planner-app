import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma/prisma";
import { Prisma } from "@prisma/client";

interface ConfigurationBody {
  calendarEditionId: string;
  layoutId: string;
  year: number;
}

export async function POST(req: Request) {
  let body: ConfigurationBody | null = null;
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.json();
    body = rawBody as ConfigurationBody;
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

    // Create the configuration
    const config = await prisma.calendarEditionLayout.create({
      data: {
        calendarEditionId,
        layoutId,
        year,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("[CALENDAR_EDITION_CONFIGURE_LAYOUT]", error);
    
    // Handle unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      body
    ) {
      const calendarEdition = await prisma.calendarEdition.findUnique({
        where: { id: body.calendarEditionId },
        select: { name: true },
      });
      
      return NextResponse.json(
        {
          error: `A configuration already exists for calendar edition ${calendarEdition?.name || "selected"} and year ${body.year}`,
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 