import { FoodElement } from "../../utils/models";
import { productBase } from "../../utils/schemas";

export async function getAllProducts(tgId: number) {
  const foods: FoodElement[] = await productBase.find({tgId: tgId});
  return foods;
}
