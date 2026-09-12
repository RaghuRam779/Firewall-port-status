import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ status: "error", message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const status = err instanceof ApiError ? err.status : 500;
  if (status >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.originalUrl });
  }
  res.status(status).json({
    status: "error",
    message: err instanceof ApiError ? err.message : status >= 500 ? "Internal server error" : err.message
  });
}
