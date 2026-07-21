import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import { validateFields } from "../../utils/validateFields.js";
import { TCategoryPayload } from "./category.interface.js";

const createCategoryIntoDB = async (payload: TCategoryPayload) => {
  const { name, description } = payload;
  validateFields(payload, ["name"]);

  const isExist = await prisma.category.findUnique({
    where: { name },
  });

  if (isExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A category with this name already exists",
    );
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  return category;
};

const updateCategoryInDB = async (
  id: string,
  payload: Partial<TCategoryPayload>,
) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (payload.name && payload.name !== isExist.name) {
    const isDuplicate = await prisma.category.findUnique({
      where: { name: payload.name },
    });
    if (isDuplicate) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "A category with this name already exists",
      );
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return category;
};

const deleteCategoryFromDB = async (id: string) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  await prisma.category.delete({
    where: { id },
  });

  return null;
};

const getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  return categories;
};

const getCategoryByIdFromDB = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  return category;
};

export const categoryService = {
  createCategoryIntoDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
  getAllCategoriesFromDB,
  getCategoryByIdFromDB,
};
