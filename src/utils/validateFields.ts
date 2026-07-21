import httpStatus from "http-status";
import { AppError } from "./appError";

export const validateFields = (
  payload: Record<string, any>,
  requiredFields: string[],
) => {
  if (!payload) {
    throw new AppError(httpStatus.BAD_REQUEST, "Request body is missing");
  }

  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    );
  });

  if (missingFields.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required`,
    );
  }
};
