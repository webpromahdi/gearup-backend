import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { gearItemService } from "./gearItem.service";
import { sendResponse } from "../../utils/sendResponse";
import { IGearQuery } from "./gearItem.interface";

const createGearItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const payload = req.body;

    const gearItem = await gearItemService.createGearItemIntoDB(
      providerId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Gear item created successfully",
      data: { gearItem },
    });
  },
);

const getProviderGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const gearItems = await gearItemService.getProviderGearFromDB(providerId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear items retrieved successfully",
      data: { gearItems },
    });
  },
);

const updateGearItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const { id } = req.params;
    const payload = req.body;

    const gearItem = await gearItemService.updateGearItemInDB(
      id as string,
      providerId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear item updated successfully",
      data: { gearItem },
    });
  },
);

const deleteGearItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const { id } = req.params;

    await gearItemService.deleteGearItemFromDB(id as string, providerId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear item deleted successfully",
      data: null,
    });
  },
);

const getAllGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as IGearQuery;
    const gearItems = await gearItemService.getAllGearFromDB(query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear items retrieved successfully",
      data: { gearItems },
    });
  },
);


const getGearById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const gearItem = await gearItemService.getGearByIdFromDB(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear item retrieved successfully",
      data: { gearItem },
    });
  },
);

export const gearItemController = {
  createGearItem,
  getProviderGear,
  updateGearItem,
  deleteGearItem,
  getAllGear,
  getGearById,
};
