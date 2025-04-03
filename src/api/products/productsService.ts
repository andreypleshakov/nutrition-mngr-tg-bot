import { IProduct } from "../../utils/models";
import { UsersProduct } from "../../utils/schemas";

export async function getAllProducts(tgId: number) {
  const foods: IProduct[] = await UsersProduct.find({ tgId: tgId });
  return foods;
}
