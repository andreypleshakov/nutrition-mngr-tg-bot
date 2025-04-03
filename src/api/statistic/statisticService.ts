import { IConsumedProduct } from "../../utils/models";
import { ConsumedProduct } from "../../utils/schemas";

type TotalStatistic = {
  totals: IConsumedProduct;
  arrayOfProducts: IConsumedProduct[];
};

export async function getDailyStatistic(
  tgId: number,
  startDate: string,
  endDate: string
): Promise<TotalStatistic> {
  const filter = {
    dateOfConsumption: { $gte: startDate, $lt: endDate },
    tgId: tgId,
  };

  const dailyStats = await ConsumedProduct.find(filter);

  const initialVal: IConsumedProduct = {
    dateOfConsumption: startDate,
    mass: 0,
    kcal: 0,
    protein: 0,
    totalFat: 0,
    saturatedFat: 0,
    unsaturatedFat: 0,
    carbs: 0,
    fiber: 0,
    tgId: tgId,
  };

  const totals = dailyStats.reduce((acc, dailyStat) => {
    acc.mass += dailyStat.mass;
    acc.kcal += dailyStat.kcal;
    acc.protein += dailyStat.protein;
    acc.totalFat += dailyStat.totalFat;
    acc.saturatedFat += dailyStat.saturatedFat;
    acc.unsaturatedFat += dailyStat.unsaturatedFat;
    acc.carbs += dailyStat.carbs;
    acc.fiber += dailyStat.fiber;

    return acc;
  }, initialVal);

  const arrayOfProducts = dailyStats.map((stat) => ({
    id: stat._id,
    name: stat.name,
    dateOfConsumption: stat.dateOfConsumption,
    mass: stat.mass,
    kcal: stat.kcal,
    protein: stat.protein,
    totalFat: stat.totalFat,
    saturatedFat: stat.saturatedFat,
    unsaturatedFat: stat.unsaturatedFat,
    carbs: stat.carbs,
    fiber: stat.fiber,
    tgId: stat.tgId,
  }));

  return { totals, arrayOfProducts };
}

export async function deleteDailyStatistic(
  documentId: string,
  tgId: number
): Promise<number> {
  const result = await ConsumedProduct.deleteMany({
    _id: documentId,
    tgId: tgId,
  });

  return result.deletedCount || 0;
}

export async function addDailyStatistic(
  consumedProduct: IConsumedProduct
): Promise<void> {
  const newConsumedProduct = new ConsumedProduct(consumedProduct);
  await newConsumedProduct.save();
  return;
}
