import { randomBytes, createHash } from "node:crypto";
import { Session } from "./models.js";
import { AppError } from "./validation.js";
const hash = (t) => createHash("sha256").update(t).digest("hex");
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 86400000,
});
export async function createSession(user, res) {
  const token = randomBytes(32).toString("hex");
  await Session.create({
    user: user._id,
    tokenHash: hash(token),
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });
  res.cookie("session", token, cookieOptions());
}
export async function auth(req, res, next) {
  const token = req.cookies.session;
  const session =
    typeof token === "string" &&
    (await Session.findOne({
      tokenHash: hash(token),
      expiresAt: { $gt: new Date() },
    }).populate("user"));
  if (!session?.user) throw new AppError(401, "Please sign in to continue.");
  req.user = session.user;
  req.session = session;
  next();
}
export async function logout(req, res) {
  await Session.deleteOne({ _id: req.session._id });
  res.clearCookie("session", { ...cookieOptions(), maxAge: undefined });
  res.json({ ok: true });
}
export function manager(req, res, next) {
  if (req.user.role !== "manager")
    throw new AppError(403, "Manager access required.");
  next();
}
export const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});
