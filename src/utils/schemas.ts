import { Schema, model } from "mongoose";
import { Users, DailyFood, FoodElement, PrimalFoodElement } from "./models";

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
  status: {
    type: String,
    enum: ["primal", "custom"],
    required: true,
    default: "custom",
  },
  typeOfFood: {
    type: String,
    enum: ["product", "meal"],
    required: true,
    default: "product",
  },
};

const { name, status, typeOfFood, ...nutritionGoalFields } =
  defaultSchemaParameters;

const { tgId, ...primalProductBaseFields } = defaultSchemaParameters;

const userSchema = new Schema<Users>({
  tgId: { type: Number, required: true, unique: true },
  tgUserName: { type: String, required: true },
});

export const userBase = model<Users>("userBase", userSchema);

const dailyFoodSchema = new Schema<DailyFood>({
  dateOfConsumption: { type: String, required: true },
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

export const goalBase = model<FoodElement>("goalBase", nutritionGoalSchema);

const primalProductBaseSchema = new Schema<PrimalFoodElement>({
  ...primalProductBaseFields,
  allowedUsersTgId: [{ type: Number, required: true }],
});

export const primalProductBase = model<PrimalFoodElement>(
  "primalProductBase",
  primalProductBaseSchema
);
