import { Prisma } from "@prisma/client";

export const convertToDollars = (cents: number | Prisma.Decimal) => {
  return (Number(cents) / 100).toFixed(2);
}