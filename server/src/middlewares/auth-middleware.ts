import { RequestHandler } from "express";
import { ParsedEnvVariables } from "../config";
import {
  ApiErrorMessages,
  GlobalErrorMessages,
  HttpStatusCode,
} from "../constants";
import { Customer } from "../models";
import { JWTPayloadType } from "../global";
import { AppError } from "../utils";
import jwt from "jsonwebtoken";

export const AuthMiddleware: RequestHandler = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res
      .status(HttpStatusCode.UNAUTHORIZED)
      .json({ message: GlobalErrorMessages.UNAUTHORIZED });
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      ParsedEnvVariables.ACCESS_TOKEN_SECRET
    ) as JWTPayloadType;

    const existingCustomer = await Customer.findById(decoded._id).select(
      "-password"
    );

    if (!existingCustomer) {
      throw new AppError(
        ApiErrorMessages.INVALID_TOKEN,
        HttpStatusCode.UNAUTHORIZED
      );
    }

    req.user = existingCustomer;
    next();
  } catch (error) {
    next(error);
  }
};

export const AdminMiddleware: RequestHandler = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw new AppError(
      GlobalErrorMessages.UNAUTHORIZED,
      HttpStatusCode.UNAUTHORIZED
    );
  }
};
