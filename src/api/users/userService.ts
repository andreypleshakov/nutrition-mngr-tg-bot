import { User } from "../../utils/schemas";

export async function getAllUsers() {
  return await User.find();
}

export async function getUserByTgId(tgId: number) {
  return await User.findOne({ tgId: tgId });
}
