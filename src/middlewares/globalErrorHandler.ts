import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../utils/appError.js";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode;
  let errorMessage = err.message || "Internal Server Error";

  let extraMeta: Record<string, any> = {};

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "Invalid JSON payload";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    extraMeta.code = err.code;
    extraMeta.meta = err.meta;
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "This value already exists.";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      errorMessage =
        "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2011") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Required field cannot be null";
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "Invalid request data";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errorMessage =
        "Authentication failed against database server. Please Check Your Credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during query execution";
  }

  statusCode = statusCode || httpStatus.INTERNAL_SERVER_ERROR;

  const errorDetails = {
    name: err.name || "Error",
    message: err.message || errorMessage,
    ...extraMeta,
  };

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    errorDetails,
  });
};
