import { Request, Response } from "express";
import { getAllUsers, getUserByTgId } from "./userService";
import { IUser } from "../../utils/models";

export async function getUsers(req: Request, res: Response) {
  const users: IUser[] = await getAllUsers();
  res.json(users);
}

export async function getUser(req: Request, res: Response) {
  const tgId = parseInt(req.params.tgId, 10);
  const user: IUser | null = await getUserByTgId(tgId);
  res.json(user);
}
