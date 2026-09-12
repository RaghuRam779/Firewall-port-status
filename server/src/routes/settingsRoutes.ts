import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { ALLOWED_PORT_PRESETS, ALLOWED_SCAN_TYPES } from "../utils/validators";

const router = Router();
router.use(requireAuth);

router.get("/", getSettings);
router.put(
  "/",
  [
    body("defaultScanType").optional().isIn(ALLOWED_SCAN_TYPES),
    body("defaultPortPreset").optional().isIn(ALLOWED_PORT_PRESETS),
    body("theme").optional().isIn(["dark", "light"]),
    body("notificationsEnabled").optional().isBoolean(),
    body("scanTimeoutMs").optional().isInt({ min: 10000, max: 600000 })
  ],
  validate,
  updateSettings
);

export default router;
