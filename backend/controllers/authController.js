// Register, login, logout, and session check. Auth uses an httpOnly JWT cookie (not localStorage).
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { send } from "../utils/response.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cookieName = "token";
const weekMs = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  // Lax + Secure in production works with the Netlify same-site /api proxy; no JS access to the token.
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: weekMs,
    path: "/",
  };
}

function readCredentials(body, { requiredPassword = true } = {}) {
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!emailPattern.test(email)) {
    throw new HttpError(400, "Enter a valid email.");
  }
  if (requiredPassword && password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters.");
  }
  return { email, password };
}

function signIn(res, user) {
  if (!process.env.JWT_SECRET) {
    throw new HttpError(500, "Something went wrong");
  }
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie(cookieName, token, cookieOptions());
}

export async function register(req, res) {
  const { email, password } = readCredentials(req.body);
  const existing = await User.findOne({ email });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  signIn(res, user);
  send(res, 201, "Account created", { id: user.id, email: user.email });
}

export async function login(req, res) {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");
  const user = email ? await User.findOne({ email }) : null;
  const matches = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!matches) {
    throw new HttpError(401, "Email or password is incorrect.");
  }

  signIn(res, user);
  send(res, 200, "Logged in", { id: user.id, email: user.email });
}

export function logout(req, res) {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(cookieName, options);
  send(res, 200, "Logged out", null);
}

export async function me(req, res) {
  const user = await User.findById(req.userId).select("email");
  if (!user) {
    throw new HttpError(401, "Please log in.");
  }
  send(res, 200, "Current user", { id: user.id, email: user.email });
}
