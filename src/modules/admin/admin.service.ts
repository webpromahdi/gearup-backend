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
  adminId: string,
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

  if (id === adminId && payload.status === "SUSPENDED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot suspend your own account",
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

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusIntoDB,
};
