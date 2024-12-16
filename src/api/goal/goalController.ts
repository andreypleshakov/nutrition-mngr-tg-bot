import { Request, Response } from "express";
import { getUserGoal } from "./goalService";

export async function getGoal(req: Request, res: Response) {
  const tgId = parseInt(req.params.tgId, 10);
  const userGoal = await getUserGoal(tgId);
  res.json(userGoal);
}
