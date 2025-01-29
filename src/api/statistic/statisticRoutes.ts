import express from "express";
import {
  deleteDailyStat,
  getDailyStat,
  postDailyStat,
} from "../statistic/statisticController";

const router = express.Router();

router.get("/:tgId", getDailyStat);
router.delete("/:tgId/:documentId", deleteDailyStat);
router.post("/:tgId", postDailyStat);

export default router;
