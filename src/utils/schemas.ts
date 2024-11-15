import { Schema, model } from "mongoose";
import { users, DailyFood, FoodElement } from "./models";

const defaultSchemaParameters = {
  name: { type: String, required: true },
  kcal: { type: Number, default: 0, required: true },
  protein: { type: Number, default: 0, required: true },
  totalFat: { type: Number, default: 0, required: true },
  saturatedFat: { type: Number, default: 0, required: true },
  unsaturatedFat: { type: Number, default: 0, required: true },
  carbs: { type: Number, default: 0, required: true },
  fiber: { type: Number, default: 0, required: true },
  tgId: { type: Number, required: true },
};

const { name, ...nutritionGoalFields } = defaultSchemaParameters;

const userSchema = new Schema<users>({
  tgId: { type: Number, required: true, unique: true },
  tgUserName: { type: String, required: true },
});

export const userBase = model<users>("userBase", userSchema);

const dailyFoodSchema = new Schema<DailyFood>({
  dateOfConsumption: { type: Date, required: true },
  mass: { type: Number, required: true },
  ...defaultSchemaParameters,
});

export const dailyFoodBase = model<DailyFood>("dailyFoodBase", dailyFoodSchema);

const productBaseSchema = new Schema<FoodElement>({
  ...defaultSchemaParameters,
});

productBaseSchema.index({ name: 1, telegramId: 1 }, { unique: true });

export const productBase = model<FoodElement>("productBase", productBaseSchema);

const nutritionGoalSchema = new Schema<FoodElement>({
  ...nutritionGoalFields,
});
