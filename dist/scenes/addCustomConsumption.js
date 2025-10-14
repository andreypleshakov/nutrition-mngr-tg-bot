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
exports.addCustomConsumption = void 0;
exports.startingDialogue = startingDialogue;
exports.todayOrCustomDate = todayOrCustomDate;
exports.customDate = customDate;
exports.waitingForNameAndMassOfProduct = waitingForNameAndMassOfProduct;
exports.mass = mass;
exports.kcal = kcal;
exports.protein = protein;
exports.totalFat = totalFat;
exports.satAndUnsatFat = satAndUnsatFat;
exports.carbs = carbs;
exports.fiber = fiber;
const telegraf_1 = require("telegraf");
const addCustomConsumptionSteps_1 = require("../steps-middlewares/addCustomConsumptionSteps");
const utils_1 = require("../utils/utils");
const buttons_1 = require("../utils/buttons");
const schemas_1 = require("../utils/schemas");
exports.addCustomConsumption = new telegraf_1.Scenes.WizardScene("ADD_CUSTOM_CONSUMPTION", ...addCustomConsumptionSteps_1.addCustomConsumptionStepsList);
function startingDialogue(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.scene.state.fromStartingScene) {
            return yield (0, utils_1.handleFromStartingScene)(ctx);
        }
        ctx.wizard.state.tgId = ctx.from.id;
        yield ctx.reply("TODAY - add today's consumption statistic\n" +
            "CUSTOM - add custom day of your consumption", telegraf_1.Markup.inlineKeyboard(buttons_1.todayOrCustomDateButton));
        return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.todayOrCustomDate);
    });
}
function todayOrCustomDate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const callBackData = ctx.callbackQuery.data;
        yield ctx.answerCbQuery();
        if (callBackData === "today") {
            ctx.wizard.state.dateOfConsumption =
                new Date().toISOString();
            yield ctx.reply("Enter product's name");
            return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.waitingForNameAndMassOfProduct);
        }
        yield ctx.reply("Enter date that you require in this format YYYY-MM-DD");
        return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.customDate);
    });
}
function customDate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.message || !("text" in ctx.message)) {
            return;
        }
        if (!(0, utils_1.isValidDateFormat)(ctx.message.text)) {
            yield ctx.reply("Wrong! Enter date that you require in this format YYYY-MM-DD");
            return;
        }
        ctx.wizard.state.dateOfConsumption = new Date(ctx.message.text).toISOString();
        yield ctx.reply("Enter product's name");
        return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.waitingForNameAndMassOfProduct);
    });
}
function waitingForNameAndMassOfProduct(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validText = (0, utils_1.isValidText)(ctx);
        if (!validText)
            return;
        ctx.wizard.state.name = validText;
        yield ctx.reply(`Enter total mass of ${ctx.wizard.state.name}`);
        return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.mass);
    });
}
function mass(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (!validNumber)
            return;
        ctx.wizard.state.mass = validNumber;
        yield ctx.reply(`Enter total kcal of ${ctx.wizard.state.name}`);
        return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.kcal);
    });
}
function kcal(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.kcal = validNumber;
        yield ctx.reply(`Enter total protein of ${ctx.wizard.state.name}`);
        return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.protein);
    });
}
function protein(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.protein = validNumber;
        yield ctx.reply(`Enter total fat of ${ctx.wizard.state.name}`);
        return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.totalFat);
    });
}
function totalFat(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.totalFat = validNumber;
        yield ctx.reply(`Enter total saturated fat of ${ctx.wizard.state.name}`);
        return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.satAndUnsatFat);
    });
}
function satAndUnsatFat(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.saturatedFat = validNumber;
        if (!(yield (0, utils_1.isSaturBiggerThanTotal)(ctx)))
            return;
        ctx.wizard.state.unsaturatedFat =
            ctx.wizard.state.totalFat -
                ctx.wizard.state.saturatedFat;
        yield ctx.reply(`Enter total carbs of ${ctx.wizard.state.name}`);
        return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.carbs);
    });
}
function carbs(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.carbs = validNumber;
        yield ctx.reply(`Enter total fiber of ${ctx.wizard.state.name}`);
        return ctx.wizard.selectStep(addCustomConsumptionSteps_1.steps.fiber);
    });
}
function fiber(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.fiber = validNumber;
        const actualState = ctx.wizard.state;
        const nutritionDetails = {
            dateOfConsumption: actualState.dateOfConsumption,
            name: actualState.name,
            mass: actualState.mass,
            kcal: actualState.kcal,
            protein: actualState.protein,
            saturatedFat: actualState.saturatedFat,
            unsaturatedFat: actualState.unsaturatedFat,
            totalFat: actualState.totalFat,
            carbs: actualState.carbs,
            fiber: actualState.fiber,
            tgId: actualState.tgId,
        };
        const newDate = new schemas_1.ConsumedProduct(nutritionDetails);
        yield newDate.save();
        yield ctx.reply(`Custom's product ${actualState.name} statistic saved in database`);
        yield ctx.scene.enter("START_CALCULATION");
    });
}
