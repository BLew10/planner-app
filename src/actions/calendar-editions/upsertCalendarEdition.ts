"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { parseForm } from "@/lib/data/calendarEdition";

const upserCalendarEdition = async (formData: FormData) => {
  try {
    const session = await auth();
    if (!session) {
      return {
        status: 401,
        json: {
          success: false,
          message: "Not authenticated",
        },
      };
    }
    const userId = session.user?.id;
    const data = parseForm(formData, userId);
    if (!data)
      return {
        status: 400,
        json: {
          success: false,
          message: "Invalid form data",
        },
      };

    if (data.id) {
      // If the data has an id, update the existing calendar edition
      await prisma.calendarEdition.update({
        where: {
          id: data.id,
        },
        data,
      });
    } else {
      // If the data does not have an id, create a new calendar edition
      const result = prisma.$transaction(async (prisma) => {
        // Create the calendar edition
        const calendarEdition = await prisma.calendarEdition.create({
          data: {
            userId,
            name: data.name,
          },
        });

        // Generate months for each year from startYear to endYear
        const startYear = new Date().getFullYear();
        const endYear = startYear + 2;
        const monthsData = [];
        for (let year = startYear; year <= endYear; year++) {
          for (let monthId = 0; monthId <= 11; monthId++) {
            monthsData.push({
              monthId,
              year,
              editionId: calendarEdition.id,
            });
          }
        }
        console.log(monthsData);

        // Bulk create the month entries
        await prisma.month.createMany({
          data: monthsData,
        });
      });
    }
  } catch (error: any) {
    console.error("Error upserting advertisement type", error);

    return {
      status: 500,
      json: {
        success: false,
        message: "Error upserting address book",
      },
    };
  }

  // redirect("/dashboard/calendar-editions");
}


export default upserCalendarEdition;