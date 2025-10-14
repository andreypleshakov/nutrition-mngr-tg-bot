"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyStatistic = getDailyStatistic;
exports.deleteDailyStatistic = deleteDailyStatistic;
exports.addDailyStatistic = addDailyStatistic;
const schemas_1 = require("../../utils/schemas");
function getDailyStatistic(tgId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = {
            dateOfConsumption: { $gte: startDate, $lt: endDate },
            tgId: tgId,
        };
        const dailyStats = yield schemas_1.ConsumedProduct.find(filter);
        const initialVal = {
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
    });
}
function deleteDailyStatistic(documentId, tgId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemas_1.ConsumedProduct.deleteMany({
            _id: documentId,
            tgId: tgId,
        });
        return result.deletedCount || 0;
    });
}
function addDailyStatistic(consumedProduct) {
    return __awaiter(this, void 0, void 0, function* () {
        const newConsumedProduct = new schemas_1.ConsumedProduct(consumedProduct);
        yield newConsumedProduct.save();
        return;
    });
}
