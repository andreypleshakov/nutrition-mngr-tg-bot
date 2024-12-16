import express from "express";
import { deleteDailyStat, getDailyStat } from "../statistic/statisticController";

const router = express.Router();

router.get("/:tgId", getDailyStat);

router.delete("/:tgId/:documentId", deleteDailyStat)

export default router;