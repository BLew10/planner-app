import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configuration = await prisma.calendarEditionLayout.findUnique({
      where: { id: params.id },
      include: {
        calendarEdition: true,
      },
    });

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    if (configuration.calendarEdition.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.calendarEditionLayout.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CALENDAR_CONFIGURATION_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configuration = await prisma.calendarEditionLayout.findUnique({
      where: {
        id: params.id,
      },
      include: {
        calendarEdition: {
          select: {
            userId: true,
            name: true,
          },
        },
      },
    });

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (configuration.calendarEdition.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(configuration);
  } catch (error) {
    console.error("[CALENDAR_CONFIGURATION_GET]", error);
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

    // Verify the configuration exists and belongs to the user
    const existingConfig = await prisma.calendarEditionLayout.findUnique({
      where: {
        id: params.id,
      },
      include: {
        calendarEdition: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingConfig) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    if (existingConfig.calendarEdition.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if another configuration exists for this calendar edition and year
    const duplicateConfig = await prisma.calendarEditionLayout.findFirst({
      where: {
        calendarEditionId,
        year,
        NOT: {
          id: params.id, // Exclude current configuration
        },
      },
    });

    if (duplicateConfig) {
      return NextResponse.json(
        {
          error: `A configuration already exists for calendar edition ${calendarEdition.name} and year ${year}`,
        },
        { status: 409 }
      );
    }

    // Update the configuration
    const updatedConfig = await prisma.calendarEditionLayout.update({
      where: {
        id: params.id,
      },
      data: {
        calendarEditionId,
        layoutId,
        year,
      },
    });

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("[CALENDAR_CONFIGURATION_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 