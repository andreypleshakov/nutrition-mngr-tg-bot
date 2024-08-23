import { Schema, model } from "mongoose";
import { users, DailyFood, FoodElement } from "./models";

export const userSchema = new Schema<users>({
  tgId: { type: Number, required: true, unique: true },
  tgUserName: { type: String, required: true },
});

export const userBase = model<users>("userBase", userSchema);

export const dailyFoodSchema = new Schema<DailyFood>({
  dateOfConsumption: { type: Date, required: true },
  name: { type: String, required: true },
  mass: { type: Number, required: true },
  kcal: { type: Number, required: true },
  protein: { type: Number, required: true },
  saturated_fat: { type: Number, required: true },
  unsaturated_fat: { type: Number, required: true },
  totalFat: { type: Number, required: true },
  carbs: { type: Number, required: true },
  tgId: { type: Number, required: true },
  fiber: { type: Number, required: true },
});

export const dailyFoodBase = model<DailyFood>("dailyFoodBase", dailyFoodSchema);

const productBaseSchema = new Schema<FoodElement>({
  name: { type: String, required: true },
  kcal: { type: Number, required: true },
  protein: { type: Number, required: true },
  totalFat: { type: Number, required: true },
  saturated_fat: { type: Number, required: true },
  unsaturated_fat: { type: Number, required: true },
  carbs: { type: Number, required: true },
  tgId: { type: Number, required: true },
  fiber: { type: Number, default: 0, required: true },
});

productBaseSchema.index({ name: 1, telegramId: 1 }, { unique: true });

export const productBase = model<FoodElement>("productBase", productBaseSchema);
