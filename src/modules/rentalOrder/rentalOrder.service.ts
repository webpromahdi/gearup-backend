import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { validateFields } from "../../utils/validateFields";
import { IRentalOrderPayload } from "./rentalOrder.interface";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const createRentalOrderIntoDB = async (
  customerId: string,
  payload: IRentalOrderPayload,
) => {
  validateFields(payload, ["gearItemId", "startDate", "endDate", "quantity"]);

  const { gearItemId, startDate, endDate } = payload;
  const quantity = Number(payload.quantity);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Quantity must be a positive integer",
    );
  }

  const startDateValue = new Date(startDate);
  const endDateValue = new Date(endDate);

  if (
    Number.isNaN(startDateValue.getTime()) ||
    Number.isNaN(endDateValue.getTime())
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Start date and end date must be valid dates",
    );
  }

  if (startDateValue > endDateValue) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date must be greater than or equal to start date",
    );
  }

  const gearItem = await prisma.gearItem.findUnique({
    where: { id: gearItemId },
  });

  if (!gearItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  if (!gearItem.availability) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This gear item is not available for rent",
    );
  }

  if (gearItem.providerId === customerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot rent your own gear item",
    );
  }

  const bookedQuantity = await prisma.rentalOrder.aggregate({
    where: {
      gearItemId,
      startDate: { lte: endDateValue },
      endDate: { gte: startDateValue },
      status: { notIn: ["CANCELLED", "RETURNED"] },
    },
    _sum: {
      quantity: true,
    },
  });

  const alreadyBookedQuantity = bookedQuantity._sum.quantity || 0;
  const availableQuantity = gearItem.stock - alreadyBookedQuantity;

  if (quantity > availableQuantity) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Only ${availableQuantity} items available for the selected dates`,
    );
  }

  const rentalDays =
    Math.ceil(
      (endDateValue.getTime() - startDateValue.getTime()) / MS_PER_DAY,
    ) + 1;
  const totalAmount = Number(gearItem.pricePerDay) * quantity * rentalDays;

  const rentalOrder = await prisma.rentalOrder.create({
    data: {
      gearItemId,
      customerId,
      startDate: startDateValue,
      endDate: endDateValue,
      quantity,
      totalAmount,
      status: "PLACED",
    },
    include: {
      gearItem: {
        include: {
          category: true,
          provider: { omit: { password: true } },
        },
      },
      customer: { omit: { password: true } },
    },
  });

  return rentalOrder;
};

export const rentalOrderService = {
  createRentalOrderIntoDB,
};
