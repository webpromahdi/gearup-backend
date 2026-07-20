import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalOrderService } from "./rentalOrder.service";
import { TOrderStatus } from "./rentalOrder.interface";

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

const getCustomerRentalOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;

    const rentalOrders =
      await rentalOrderService.getCustomerRentalOrdersFromDB(customerId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental orders retrieved successfully",
      data: { rentalOrders },
    });
  },
);

const getCustomerRentalOrderById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const { id } = req.params;

    const rentalOrder =
      await rentalOrderService.getCustomerRentalOrderByIdFromDB(
        id as string,
        customerId,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental order retrieved successfully",
      data: { rentalOrder },
    });
  },
);

const cancelRentalOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const { id } = req.params;

    const rentalOrder = await rentalOrderService.cancelRentalOrderInDB(
      id as string,
      customerId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental order cancelled successfully",
      data: { rentalOrder },
    });
  },
);

const getProviderOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const orders = await rentalOrderService.getProviderOrdersFromDB(providerId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Provider orders retrieved successfully",
      data: { orders },
    });
  },
);

const getProviderOrderById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const { id } = req.params;
    const order = await rentalOrderService.getProviderOrderByIdFromDB(
      id as string,
      providerId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Order retrieved successfully",
      data: { order },
    });
  },
);

const updateOrderStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const { id } = req.params;
    const { status } = req.body as { status: TOrderStatus };

    const order = await rentalOrderService.updateOrderStatusInDB(
      id as string,
      providerId,
      status,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Order status updated successfully",
      data: { order },
    });
  },
);

export const rentalOrderController = {
  createRentalOrder,
  getCustomerRentalOrders,
  getCustomerRentalOrderById,
  cancelRentalOrder,
  getProviderOrders,
  getProviderOrderById,
  updateOrderStatus,
};
