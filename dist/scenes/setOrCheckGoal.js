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
exports.setOrCheckGoal = void 0;
exports.startingDialogue = startingDialogue;
exports.setKcal = setKcal;
exports.setProtein = setProtein;
exports.setTotalFat = setTotalFat;
exports.setSatFat = setSatFat;
exports.setUnsatFat = setUnsatFat;
exports.setCarbs = setCarbs;
exports.setFiber = setFiber;
const telegraf_1 = require("telegraf");
const setOrCheckGoalSteps_1 = require("../steps-middlewares/setOrCheckGoalSteps");
const utils_1 = require("../utils/utils");
const schemas_1 = require("../utils/schemas");
exports.setOrCheckGoal = new telegraf_1.Scenes.WizardScene("SET_OR_CHECK_GOAL", ...setOrCheckGoalSteps_1.setOrCheckGoalStepsList);
function startingDialogue(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.wizard.state.tgId = ctx.from.id;
        yield ctx.reply("Set kcal goal");
        return ctx.wizard.selectStep(setOrCheckGoalSteps_1.steps.setKcal);
    });
}
function setKcal(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.kcal = validNumber;
        yield ctx.reply("Set protein goal");
        return ctx.wizard.selectStep(setOrCheckGoalSteps_1.steps.setProtein);
    });
}
function setProtein(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.protein = validNumber;
        yield ctx.reply("Set total fat goal");
        return ctx.wizard.selectStep(setOrCheckGoalSteps_1.steps.setTotalFat);
    });
}
function setTotalFat(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.totalFat = validNumber;
        yield ctx.reply("Set saturated fat goal");
        return ctx.wizard.selectStep(setOrCheckGoalSteps_1.steps.setSatFat);
    });
}
function setSatFat(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.saturatedFat = validNumber;
        yield ctx.reply("Set unsaturated fat goal");
        return ctx.wizard.selectStep(setOrCheckGoalSteps_1.steps.setUnsatFat);
    });
}
function setUnsatFat(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.unsaturatedFat = validNumber;
        yield ctx.reply("Set carbs goal");
        return ctx.wizard.selectStep(setOrCheckGoalSteps_1.steps.setCarbs);
    });
}
function setCarbs(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.carbs = validNumber;
        yield ctx.reply("Set fiber goal");
        return ctx.wizard.selectStep(setOrCheckGoalSteps_1.steps.setFiber);
    });
}
function setFiber(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.fiber = validNumber;
        const actualState = ctx.wizard.state;
        const nutritionGoal = {
            kcal: actualState.kcal,
            protein: actualState.protein,
            totalFat: actualState.totalFat,
            saturatedFat: actualState.saturatedFat,
            unsaturatedFat: actualState.unsaturatedFat,
            carbs: actualState.carbs,
            fiber: actualState.fiber,
            tgId: actualState.tgId,
        };
        const newGoal = new schemas_1.Goal(nutritionGoal);
        yield newGoal.save();
        yield ctx.reply("Succses");
        yield ctx.scene.enter("START_CALCULATION");
    });
}
