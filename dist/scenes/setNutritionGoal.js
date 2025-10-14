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
exports.setNutritionGoal = void 0;
const telegraf_1 = require("telegraf");
exports.setNutritionGoal = new telegraf_1.Scenes.WizardScene("SET_NUTRITION_GOAL", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply("That is your nutrition goal, choose what do you want to change");
}));
