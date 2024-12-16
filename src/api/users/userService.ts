import { userBase } from "../../utils/schemas";

export async function getAllUsers() {
  return await userBase.find();
}

export async function getUserByTgId(tgId: number) {
  return await userBase.findOne({ tgId: tgId });
}
