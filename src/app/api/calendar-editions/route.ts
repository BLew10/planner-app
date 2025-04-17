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

    const [calendarEditions, totalItems] = await Promise.all([
      prisma.calendarEdition.findMany({
        where: {
          userId: session.user.id,
          isDeleted: false,
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
        orderBy: {
          id: "desc",
        },
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.calendarEdition.count({
        where: {
          userId: session.user.id,
          isDeleted: false,
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
      }),
    ]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return NextResponse.json({
      calendarEditions,
      totalItems,
      totalPages,
    });
  } catch (error) {
    console.error("[CALENDAR_EDITIONS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 