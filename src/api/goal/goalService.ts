import { IProduct } from "../../utils/models";
import { Goal } from "../../utils/schemas";

export async function getUserGoal(tgId: number) {
  let userGoal: Omit<IProduct, "mass"> = {
    kcal: 0,
    protein: 0,
    totalFat: 0,
    saturatedFat: 0,
    unsaturatedFat: 0,
    carbs: 0,
    fiber: 0,
    tgId: tgId,
  };

  const fetchedGoal = await Goal.findOne({
    tgId: tgId,
  });

  if (!fetchedGoal) {
    return;
  }

  userGoal = {
    kcal: fetchedGoal.kcal,
    protein: fetchedGoal.protein,
    totalFat: fetchedGoal.totalFat,
    saturatedFat: fetchedGoal.saturatedFat,
    unsaturatedFat: fetchedGoal.unsaturatedFat,
    carbs: fetchedGoal.carbs,
    fiber: fetchedGoal.fiber,
    tgId: tgId,
  };

  return userGoal;
}
