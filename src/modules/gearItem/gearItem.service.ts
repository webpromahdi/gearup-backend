import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { validateFields } from "../../utils/validateFields";
import { IGearQuery, TGearItemPayload } from "./gearItem.interface";
import { Prisma } from "../../../generated/prisma/client";

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

const getAllGearFromDB = async (query: IGearQuery) => {
  const andConditions: Prisma.GearItemWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
        { brand: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.category) {
    andConditions.push({ categoryId: query.category });
  }

  if (query.brand) {
    andConditions.push({
      brand: { contains: query.brand, mode: "insensitive" },
    });
  }

  if (query.minPrice) {
    andConditions.push({
      pricePerDay: { gte: parseFloat(query.minPrice) },
    });
  }

  if (query.maxPrice) {
    andConditions.push({
      pricePerDay: { lte: parseFloat(query.maxPrice) },
    });
  }

  if (query.availability !== undefined) {
    andConditions.push({
      availability: query.availability === "true",
    });
  }

  const gearItems = await prisma.gearItem.findMany({
    where: {
      AND: andConditions,
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return gearItems;
};

const getGearByIdFromDB = async (id: string) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: true,
      provider: { omit: { password: true } },
      reviews: {
        include: { customer: { omit: { password: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!gearItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  return gearItem;
};

export const gearItemService = {
  createGearItemIntoDB,
  getProviderGearFromDB,
  updateGearItemInDB,
  deleteGearItemFromDB,
  getAllGearFromDB,
  getGearByIdFromDB,
};
