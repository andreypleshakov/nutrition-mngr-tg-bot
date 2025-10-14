"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimalProduct = exports.Goal = exports.UsersProduct = exports.ConsumedProduct = exports.User = void 0;
const mongoose_1 = require("mongoose");
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
const { name, status, typeOfFood } = defaultSchemaParameters, nutritionGoalFields = __rest(defaultSchemaParameters, ["name", "status", "typeOfFood"]);
const { tgId } = defaultSchemaParameters, primalProductFields = __rest(defaultSchemaParameters, ["tgId"]);
const userSchema = new mongoose_1.Schema({
    tgId: { type: Number, required: true, unique: true },
    tgUserName: { type: String, required: true },
});
exports.User = (0, mongoose_1.model)("User", userSchema, "users");
const consumedProductSchema = new mongoose_1.Schema(Object.assign({ dateOfConsumption: { type: String, required: true }, mass: { type: Number, required: true } }, defaultSchemaParameters));
exports.ConsumedProduct = (0, mongoose_1.model)("ConsumedProduct", consumedProductSchema, "consumed_products");
const productSchema = new mongoose_1.Schema(Object.assign({}, defaultSchemaParameters));
productSchema.index({ name: 1, telegramId: 1 }, { unique: true });
exports.UsersProduct = (0, mongoose_1.model)("UsersProduct", productSchema, "users_products");
const nutritionGoalSchema = new mongoose_1.Schema(Object.assign({}, nutritionGoalFields));
exports.Goal = (0, mongoose_1.model)("Goal", nutritionGoalSchema, "goals");
const primalProductSchema = new mongoose_1.Schema(Object.assign(Object.assign({}, primalProductFields), { allowedUsersTgId: [{ type: Number, required: true }] }));
exports.PrimalProduct = (0, mongoose_1.model)("PrimalProduct", primalProductSchema, "primal_products");
