import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { scanLimiter } from "../middleware/rateLimiter";
import { createScan, listScans, getScan, deleteScan } from "../controllers/scanController";
import { ALLOWED_PORT_PRESETS, ALLOWED_SCAN_TYPES, ALLOWED_TIMING_TEMPLATES } from "../utils/validators";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  scanLimiter,
  [
    body("target").isString().trim().notEmpty().withMessage("Target is required"),
    body("portPreset").isIn(ALLOWED_PORT_PRESETS).withMessage("Invalid port preset"),
    body("customPortRange").optional().isString(),
    body("scanTypes").isArray({ min: 1 }).withMessage("At least one scan type is required"),
    body("scanTypes.*").isIn(ALLOWED_SCAN_TYPES).withMessage("Invalid scan type"),
    body("timingTemplate").optional().isIn(ALLOWED_TIMING_TEMPLATES),
    body("usePn").optional().isBoolean(),
    body("authorizationConfirmed")
      .isBoolean()
      .custom((v) => v === true)
      .withMessage("You must confirm authorization to scan this target")
  ],
  validate,
  createScan
);

router.get("/", listScans);
router.get("/:id", [param("id").isMongoId()], validate, getScan);
router.delete("/:id", [param("id").isMongoId()], validate, deleteScan);

export default router;
