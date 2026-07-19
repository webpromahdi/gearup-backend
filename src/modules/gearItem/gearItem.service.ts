import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { validateFields } from "../../utils/validateFields";
import { TGearItemPayload } from "./gearItem.interface";

const createGearItemIntoDB = async (
  providerId: string,
  payload: TGearItemPayload,
) => {
  validateFields(payload, [
    "name",
    "description",
    "brand",
    "pricePerDay",
    "stock",
    "image",
    "condition",
    "categoryId",
  ]);

  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!categoryExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  const gearItem = await prisma.gearItem.create({
    data: {
      ...payload,
      providerId,
    },
    include: {
      category: true,
      provider: {
        omit: { password: true },
      },
    },
  });

  return gearItem;
};

export const gearItemService = {
  createGearItemIntoDB,
};
