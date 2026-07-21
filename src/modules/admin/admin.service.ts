import httpStatus from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { validateFields } from "../../utils/validateFields";
import { IUpdateUserStatusPayload } from "./admin.interface";

const getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: { not: "ADMIN" },
    },
    omit: { password: true },
    include: {
      profile: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
};

const updateUserStatusIntoDB = async (
  id: string,
  payload: IUpdateUserStatusPayload,
) => {
  validateFields(payload, ["status"]);

  const allowedStatuses: UserStatus[] = ["ACTIVE", "SUSPENDED"];
  if (!allowedStatuses.includes(payload.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status: payload.status },
    omit: { password: true },
    include: {
      profile: true,
    },
  });

  return updatedUser;
};

const getAllGearListingsFromDB = async () => {
  const gearItems = await prisma.gearItem.findMany({
    include: {
      category: true,
      provider: { omit: { password: true } },
      reviews: {
        include: {
          customer: { omit: { password: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return gearItems;
};

const getAllRentalOrdersFromDB = async () => {
  const rentalOrders = await prisma.rentalOrder.findMany({
    include: {
      customer: { omit: { password: true } },
      gearItem: {
        include: {
          category: true,
          provider: { omit: { password: true } },
        },
      },
      payments: true,
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return rentalOrders;
};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusIntoDB,
  getAllGearListingsFromDB,
  getAllRentalOrdersFromDB,
};
