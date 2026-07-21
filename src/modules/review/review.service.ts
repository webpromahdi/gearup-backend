import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { validateFields } from "../../utils/validateFields";
import { ICreateReviewPayload } from "./review.interface";

const createReviewIntoDB = async (
  customerId: string,
  payload: ICreateReviewPayload,
) => {
  validateFields(payload, ["rentalOrderId", "rating"]);

  const rating = Number(payload.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Rating must be an integer between 1 and 5",
    );
  }

  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: payload.rentalOrderId },
    include: {
      review: true,
      gearItem: true,
    },
  });

  if (!rentalOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  if (rentalOrder.customerId !== customerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to review this rental order",
    );
  }

  if (rentalOrder.status !== "RETURNED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can review gear only after the rental order is returned",
    );
  }

  if (rentalOrder.review) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A review has already been submitted for this rental order",
    );
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment: payload.comment?.trim() || null,
      customerId,
      gearItemId: rentalOrder.gearItemId,
      rentalOrderId: rentalOrder.id,
    },
    include: {
      customer: { omit: { password: true } },
      gearItem: true,
      rentalOrder: true,
    },
  });

  return review;
};

const getCustomerReviewsFromDB = async (customerId: string) => {
  const reviews = await prisma.review.findMany({
    where: { customerId },
    include: {
      customer: { omit: { password: true } },
      gearItem: true,
      rentalOrder: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

export const reviewService = {
  createReviewIntoDB,
  getCustomerReviewsFromDB,
};
