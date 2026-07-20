import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalOrderService } from "./rentalOrder.service";

const createRentalOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const payload = req.body;

    const rentalOrder = await rentalOrderService.createRentalOrderIntoDB(
      customerId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental order created successfully",
      data: { rentalOrder },
    });
  },
);

export const rentalOrderController = {
  createRentalOrder,
};
