import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { validateFields } from "../../utils/validateFields";
import { IGearQuery, TGearItemPayload } from "./gearItem.interface";
import { Prisma } from "../../../generated/prisma/client";

const allowedGearConditions = ["NEW", "EXCELLENT", "GOOD", "FAIR", "POOR"];

const validateGearCondition = (condition: string) => {
  if (!allowedGearConditions.includes(condition)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid condition. Allowed conditions are: ${allowedGearConditions.join(", ")}`,
    );
  }
};

const validatePricePerDay = (pricePerDay: number) => {
  const price = Number(pricePerDay);
  if (!Number.isFinite(price) || price <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Price per day must be a positive number",
    );
  }
};

const validateStock = (stock: number) => {
  const stockValue = Number(stock);
  if (!Number.isInteger(stockValue) || stockValue < 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Stock must be a non-negative integer",
    );
  }
};

const parsePriceQuery = (value: string, fieldName: string) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${fieldName} must be a valid non-negative number`,
    );
  }

  return parsedValue;
};

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

  validatePricePerDay(payload.pricePerDay);
  validateStock(payload.stock);
  validateGearCondition(payload.condition);

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

  if (payload.pricePerDay !== undefined) {
    validatePricePerDay(payload.pricePerDay);
  }

  if (payload.stock !== undefined) {
    validateStock(payload.stock);
  }

  if (payload.condition !== undefined) {
    validateGearCondition(payload.condition);
  }

  if (payload.categoryId !== undefined) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!categoryExists) {
      throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }
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
      pricePerDay: { gte: parsePriceQuery(query.minPrice, "minPrice") },
    });
  }

  if (query.maxPrice) {
    andConditions.push({
      pricePerDay: { lte: parsePriceQuery(query.maxPrice, "maxPrice") },
    });
  }

  if (query.minPrice && query.maxPrice) {
    const minPrice = parsePriceQuery(query.minPrice, "minPrice");
    const maxPrice = parsePriceQuery(query.maxPrice, "maxPrice");

    if (minPrice > maxPrice) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "minPrice cannot be greater than maxPrice",
      );
    }
  }

  if (query.availability !== undefined) {
    if (query.availability !== "true" && query.availability !== "false") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "availability must be either true or false",
      );
    }

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
