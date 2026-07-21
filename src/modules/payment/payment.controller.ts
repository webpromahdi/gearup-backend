import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { paymentService } from "./payment.service.js";

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

const getCustomerPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;

    const payments = await paymentService.getCustomerPaymentsFromDB(customerId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payments retrieved successfully",
      data: { payments },
    });
  },
);

const getCustomerPaymentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const { id } = req.params;

    const payment = await paymentService.getCustomerPaymentByIdFromDB(
      id as string,
      customerId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment retrieved successfully",
      data: { payment },
    });
  },
);

export const paymentController = {
  createCheckoutSession,
  handleStripeWebhook,
  getCustomerPayments,
  getCustomerPaymentById,
};
