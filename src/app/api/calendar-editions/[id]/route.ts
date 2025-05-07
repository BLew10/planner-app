import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs";
// import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string; year: string } }
) {
  try {
    // const { userId } = auth();
    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // const { id, year } = params;
    // const yearNumber = parseInt(year);

    // const calendarEditionLayout = await prisma.calendarEditionLayout.findUnique({
    //   where: {
    //     calendarEditionId_year: {
    //       calendarEditionId: id,
    //       year: yearNumber,
    //     },
    //   },
    //   include: {
    //     layout: {
    //       include: {
    //         adPlacements: {
    //           include: {
    //             advertisement: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // if (!calendarEditionLayout) {
    //   return new NextResponse("Not found", { status: 404 });
    // }

    return NextResponse.json({ test: "test" });
  } catch (error) {
    console.error("[CALENDAR_EDITION_LAYOUT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 