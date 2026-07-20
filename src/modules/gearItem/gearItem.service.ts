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

const getProviderGearFromDB = async (providerId: string) => {
  const gearItems = await prisma.gearItem.findMany({
    where: { providerId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return gearItems;
};

const updateGearItemInDB = async (
  id: string,
  providerId: string,
  payload: Partial<TGearItemPayload>,
) => {
  const gearItem = await prisma.gearItem.findUnique({ where: { id } });

  if (!gearItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  if (gearItem.providerId !== providerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this gear item",
    );
  }

  const updated = await prisma.gearItem.update({
    where: { id },
    data: payload,
    include: { category: true },
  });

  return updated;
};

const deleteGearItemFromDB = async (id: string, providerId: string) => {
  const gearItem = await prisma.gearItem.findUnique({ where: { id } });

  if (!gearItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  if (gearItem.providerId !== providerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this gear item",
    );
  }

  await prisma.gearItem.delete({ where: { id } });

  return null;
};

export const gearItemService = {
  createGearItemIntoDB,
  getProviderGearFromDB,
  updateGearItemInDB,
  deleteGearItemFromDB,
};
