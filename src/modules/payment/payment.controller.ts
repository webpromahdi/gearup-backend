import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const payload = req.body;

    const result = await paymentService.createCheckoutSessionIntoDB(
      customerId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Stripe checkout session created successfully",
      data: result,
    });
  },
);

const handleStripeWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["stripe-signature"] as string | undefined;
    const result = await paymentService.handleStripeWebhook(
      req.body as Buffer,
      signature,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Stripe webhook received successfully",
      data: result,
    });
  },
);

export const paymentController = {
  createCheckoutSession,
  handleStripeWebhook,
};
