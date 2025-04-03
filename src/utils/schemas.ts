import { Schema, model } from "mongoose";
import { IUser, IConsumedProduct, IProduct, IPrimalProduct } from "./models";

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

const { tgId, ...primalProductFields } = defaultSchemaParameters;

const userSchema = new Schema<IUser>({
  tgId: { type: Number, required: true, unique: true },
  tgUserName: { type: String, required: true },
});

export const User = model<IUser>("User", userSchema, "users");

const consumedProductSchema = new Schema<IConsumedProduct>({
  dateOfConsumption: { type: String, required: true },
  mass: { type: Number, required: true },
  ...defaultSchemaParameters,
});

export const ConsumedProduct = model<IConsumedProduct>(
  "ConsumedProduct",
  consumedProductSchema,
  "consumed_products"
);

const productSchema = new Schema<IProduct>({
  ...defaultSchemaParameters,
});

productSchema.index({ name: 1, telegramId: 1 }, { unique: true });

export const UsersProduct = model<IProduct>(
  "UsersProduct",
  productSchema,
  "users_products"
);

const nutritionGoalSchema = new Schema<IProduct>({
  ...nutritionGoalFields,
});

export const Goal = model<IProduct>("Goal", nutritionGoalSchema, "goals");

const primalProductSchema = new Schema<IPrimalProduct>({
  ...primalProductFields,
  allowedUsersTgId: [{ type: Number, required: true }],
});

export const PrimalProduct = model<IPrimalProduct>(
  "PrimalProduct",
  primalProductSchema,
  "primal_products"
);
