import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { gearItemService } from "./gearItem.service";
import { sendResponse } from "../../utils/sendResponse";

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

export const gearItemController = {
  createGearItem,
};
