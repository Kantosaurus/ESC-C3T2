import { test } from "@esc-c3t2/core";
import { RequestHandler } from "express";

// TODO: Replace with real code
export const authMiddleware: RequestHandler = (req, res, next) => {
  res.send(test());
  next();
};
