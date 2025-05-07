import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs";
// import { put } from "@vercel/blob";

export async function POST(
  request: Request,
  { params }: { params: { id: string; year: string } }
) {
  try {
    // const { userId } = auth();
    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // const formData = await request.formData();
    // const file = formData.get("file") as File;
    // const placementId = formData.get("placementId") as string;

    // if (!file || !placementId) {
    //   return new NextResponse("Missing required fields", { status: 400 });
    // }

    // // Upload to blob storage
    // const blob = await put(`calendar-displays/${params.id}/${params.year}/${placementId}`, file, {
    //   access: 'public',
    // });

    return NextResponse.json({ url: "test" });
  } catch (error) {
    console.error("[CALENDAR_DISPLAY_IMAGE_UPLOAD]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 