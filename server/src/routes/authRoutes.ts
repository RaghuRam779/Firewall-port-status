import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";
import { register, login, logout, me, updateProfile, forgotPassword, resetPassword } from "../controllers/authController";

const router = Router();

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
  ],
  validate,
  register
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  login
);

router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.put(
  "/profile",
  requireAuth,
  [body("name").trim().isLength({ min: 2, max: 100 })],
  validate,
  updateProfile
);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().withMessage("A valid email is required").normalizeEmail()],
  validate,
  forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  [
    body("token").isString().notEmpty(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
  ],
  validate,
  resetPassword
);

export default router;
