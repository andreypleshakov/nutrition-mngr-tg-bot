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
exports.getUserGoal = getUserGoal;
const schemas_1 = require("../../utils/schemas");
function getUserGoal(tgId) {
    return __awaiter(this, void 0, void 0, function* () {
        let userGoal = {
            kcal: 0,
            protein: 0,
            totalFat: 0,
            saturatedFat: 0,
            unsaturatedFat: 0,
            carbs: 0,
            fiber: 0,
            tgId: tgId,
        };
        const fetchedGoal = yield schemas_1.Goal.findOne({
            tgId: tgId,
        });
        if (!fetchedGoal) {
            return;
        }
        userGoal = {
            kcal: fetchedGoal.kcal,
            protein: fetchedGoal.protein,
            totalFat: fetchedGoal.totalFat,
            saturatedFat: fetchedGoal.saturatedFat,
            unsaturatedFat: fetchedGoal.unsaturatedFat,
            carbs: fetchedGoal.carbs,
            fiber: fetchedGoal.fiber,
            tgId: tgId,
        };
        return userGoal;
    });
}
