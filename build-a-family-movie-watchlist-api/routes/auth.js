import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findByUsername } from "../utils/db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "family-movie-watchlist-secret";

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  let validPassword = false;

  if (typeof user.passwordHash === "string" && /^\$2[aby]\$/.test(user.passwordHash)) {
    validPassword = await bcrypt.compare(password, user.passwordHash);
  } else if (typeof user._password === "string" && /^\$2[aby]\$/.test(user._password)) {
    validPassword = await bcrypt.compare(password, user._password);
  } else {
    validPassword =
      password === user._password ||
      password === user.passwordHash;
  }

  if (!validPassword) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.status(200).json({ token });
});

export default router;