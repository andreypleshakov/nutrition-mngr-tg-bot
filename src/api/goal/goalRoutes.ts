import express from "express";
import { getGoal } from "./goalController";

const router = express.Router();

router.get("/:tgId", getGoal);

export default router;