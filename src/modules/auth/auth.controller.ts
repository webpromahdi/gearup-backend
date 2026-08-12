import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { authService } from "./auth.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import passport from "passport";
import config from "../../config/index.js";

const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await authService.registerUserIntoDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: { user },
    });
  },
);

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      try {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(new Error(info?.message || "Invalid credentials!"));
        }
        const { accessToken, refreshToken } = await authService.loginUser(user);
        
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          maxAge: 1000 * 60 * 60 * 24,
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        sendResponse(res, {
          success: true,
          statusCode: httpStatus.OK,
          message: "User logged in successfully",
          data: { accessToken, refreshToken },
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  }
);

const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken } = await authService.refreshToken(refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Token refreshed successfully",
      data: {
        accessToken,
      },
    });
  },
);

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profile = await authService.getMyProfileFromDB(
      (req.user as { id: string })?.id, 
  );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile retrieved successfully",
      data: { profile },
    });
  },
);

const googleLoginCallback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", async (err: any, user: any, info: any) => {
      try {
        if (err) {
          return next(
            new Error(err?.message || "Google authentication Failed"),
          );
        }
        if (!user) {
          return next(
            new Error(info?.message || "Google authentication Failed"),
          );
        }
       
        const { accessToken, refreshToken } = await authService.loginUser(user);
       
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          maxAge: 1000 * 60 * 60 * 24,
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        res.redirect(`${config.app_url}`);
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  },
);



export const authController = {
  register,
  loginUser,
  refreshToken,
  getMyProfile,
  googleLoginCallback
};
