import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRole: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not logged in! Please log in to get access.",
      );
    }
    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new AppError(httpStatus.UNAUTHORIZED, verifiedToken.error);
    }

    const { email, name, id, role } = verifiedToken.data as JwtPayload;
    if (requiredRole.length && !requiredRole.includes(role as Role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Forbidden: You do not have permission to access this resource",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id, email, name, role },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.status === "SUSPENDED") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Your account is suspended. Please contact support.",
      );
    }

    req.user = { id, name, email, role };
    next();
  });
};
