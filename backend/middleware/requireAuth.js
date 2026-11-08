import jwt from "jsonwebtoken";
import { HttpError } from "../utils/httpError.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token || !process.env.JWT_SECRET) {
    next(new HttpError(401, "Please log in."));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, "Please log in."));
  }
}
