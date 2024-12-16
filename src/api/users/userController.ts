import { Request, Response } from "express";
import { getAllUsers, getUserByTgId } from "./userService";
import { Users } from "../../utils/models";

export async function getUsers(req: Request, res: Response) {
  const users: Users[] = await getAllUsers();
  res.json(users);
}

export async function getUser(req: Request, res: Response) {
  const tgId = parseInt(req.params.tgId, 10);
  const user: Users | null = await getUserByTgId(tgId);
  res.json(user);
}
