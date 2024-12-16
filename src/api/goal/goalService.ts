import { FoodElement } from "../../utils/models";
import { goalBase } from "../../utils/schemas";

export async function getUserGoal(tgId: number) {
  let userGoal: Omit<FoodElement, "mass"> = {
    kcal: 0,
    protein: 0,
    totalFat: 0,
    saturatedFat: 0,
    unsaturatedFat: 0,
    carbs: 0,
    fiber: 0,
    tgId: tgId,
  };

  const fetchedGoal = await goalBase.findOne({
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
