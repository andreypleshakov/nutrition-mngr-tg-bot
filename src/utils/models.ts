import { Schema, model } from "mongoose";

interface users {
  tgId: number;
  tgUserName?: string;
}

export interface FoodElement extends users {
  _id?: string;
  documentId?: string;
  name?: string;
  mass: number;
  kcal: number;
  protein: number;
  totalFat: number;
  saturated_fat: number;
  unsaturated_fat: number;
  carbs: number;
}

export interface DialogueState extends FoodElement {
  updateProduct: boolean;

  fromDailyProduct: boolean;
  fromCombinedProduct: boolean;
  fromFixingStep: boolean;
  fromStartingScene: boolean;

  checkForCombined: boolean;

  listOfProducts: boolean;

  customMass: number;
}

export interface CostOfProtein {
  nameOfProduct: string;
  nameOfCurrency: string;
  cost: number;
  protein: number;
  massScope: number;
  totalMass: number;
}

export interface DailyFood extends FoodElement {
  dateOfConsumption: Date;

  arrayOfProducts: FoodElement[];
  objectProduct: {};
}

export interface CombinedProduct extends DialogueState {
  CombinedName: string;
  CombinedMass: number;

  products: Record<string, FoodElement>;
  actualProductName: string;
  actualProductMass: number;
}

export const userSchema = new Schema<users>({
  tgId: { type: Number, required: true, unique: true },
  tgUserName: { type: String, required: true },
});

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
});

const productBaseSchema = new Schema<FoodElement>({
  name: { type: String, required: true },
  kcal: { type: Number, required: true },
  protein: { type: Number, required: true },
  totalFat: { type: Number, required: true },
  saturated_fat: { type: Number, required: true },
  unsaturated_fat: { type: Number, required: true },
  carbs: { type: Number, required: true },
  tgId: { type: Number, required: true },
});

export const userBase = model<users>("userBase", userSchema);

export const dailyFoodBase = model<DailyFood>("dailyFoodBase", dailyFoodSchema);

export const productBase = model<FoodElement>("productBase", productBaseSchema);
