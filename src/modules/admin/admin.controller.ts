import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await adminService.getAllUsersFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users retrieved successfully",
      data: { users },
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const payload = req.body;

    const user = await adminService.updateUserStatusIntoDB(
      id as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: { user },
    });
  },
);

const getAllGearListings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const gearItems = await adminService.getAllGearListingsFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear listings retrieved successfully",
      data: { gearItems },
    });
  },
);

const getAllRentalOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentalOrders = await adminService.getAllRentalOrdersFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental orders retrieved successfully",
      data: { rentalOrders },
    });
  },
);

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllGearListings,
  getAllRentalOrders,
};
