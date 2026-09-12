import { Router } from "express";
import { param } from "express-validator";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import {
  getReport,
  exportReportJSON,
  exportReportCSV,
  exportReportPDF
} from "../controllers/reportController";

const router = Router();

router.use(requireAuth);

const idCheck = [param("id").isMongoId()];

router.get("/:id", idCheck, validate, getReport);
router.get("/export/json/:id", idCheck, validate, exportReportJSON);
router.get("/export/csv/:id", idCheck, validate, exportReportCSV);
router.get("/export/pdf/:id", idCheck, validate, exportReportPDF);

export default router;
