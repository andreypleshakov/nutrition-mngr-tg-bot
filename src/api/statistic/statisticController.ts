import { Request, Response } from "express";
import {
  addDailyStatistic,
  deleteDailyStatistic,
  getDailyStatistic,
} from "./statisticService";

export async function getDailyStat(req: Request, res: Response) {
  const tgId = parseInt(req.params.tgId, 10);
  const { startDate, endDate } = req.query;
  const dailyStat = await getDailyStatistic(tgId, startDate as string, endDate as string);
  res.json(dailyStat);
}

export async function deleteDailyStat(req: Request, res: Response) {
  try {
    const tgId = Number(req.params.tgId);
    const id = req.params.documentId;

    const deletedCount = await deleteDailyStatistic(id, tgId);

    if (deletedCount > 0) {
      res.status(200).json({ message: "Daily statistic deleted successfully" });
    } else {
      res.status(404).json({ error: "Daily statistic not found" });
    }
  } catch (error) {
    console.error("Error deleting daily statistic:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function postDailyStat(req: Request, res: Response) {
  await addDailyStatistic(req.body);
  res.status(200).json({ message: "Data received successfully!" });
}
