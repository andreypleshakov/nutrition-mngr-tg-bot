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
exports.createProduct = void 0;
exports.startingDialogue = startingDialogue;
exports.waitingForProductName = waitingForProductName;
exports.perHundredOrCustomMass = perHundredOrCustomMass;
exports.customMass = customMass;
exports.isUpdatingTheProduct = isUpdatingTheProduct;
exports.kcalsPerGram = kcalsPerGram;
exports.proteinsPerGram = proteinsPerGram;
exports.totalFatPerGram = totalFatPerGram;
exports.saturatedFatPerGram = saturatedFatPerGram;
exports.unsaturatedFatPerGram = unsaturatedFatPerGram;
exports.carbohydratesPerGram = carbohydratesPerGram;
exports.fiberPerGram = fiberPerGram;
exports.fixingSomethingAndFinal = fixingSomethingAndFinal;
const telegraf_1 = require("telegraf");
const utils_1 = require("../utils/utils");
const buttons_1 = require("../utils/buttons");
const createProductSteps_1 = require("../steps-middlewares/createProductSteps");
exports.createProduct = new telegraf_1.Scenes.WizardScene("CREATE_PRODUCT", ...createProductSteps_1.createProductStepsList);
function startingDialogue(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.scene.state.fromStartingScene) {
            return yield (0, utils_1.handleFromStartingScene)(ctx);
        }
        ctx.wizard.state.tgId = ctx.from.id;
        yield ctx.reply("Name of product");
        return ctx.wizard.selectStep(createProductSteps_1.steps.waitingForProductName);
    });
}
function waitingForProductName(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.message || !("text" in ctx.message)) {
            yield ctx.reply("Wrong, write a product name");
            return;
        }
        const actualState = ctx.wizard.state;
        actualState.name = ctx.message.text.trim().toLowerCase();
        const fromFixingStep = yield (0, utils_1.handleFromFixingStep)(ctx);
        if (fromFixingStep) {
            return ctx.wizard.selectStep(createProductSteps_1.steps.fixingSomethingAndFinal);
        }
        const existance = yield (0, utils_1.doesExistTheSameProductWithTgId)(actualState.name, actualState.tgId);
        if (existance) {
            yield ctx.reply("Product already exists");
            yield ctx.reply("Do you want to update it?", buttons_1.yesOrNoButton);
            return ctx.wizard.selectStep(createProductSteps_1.steps.isUpdatingTheProduct);
        }
        yield ctx.reply("Choose the scope of mass you want to calculate nutrition PER 100 or PER CUSTOM", buttons_1.perButton);
        return ctx.wizard.selectStep(createProductSteps_1.steps.perHundredOrCustomMass);
    });
}
function perHundredOrCustomMass(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const callBackData = ctx.callbackQuery.data;
        yield ctx.answerCbQuery();
        if (callBackData === "100-gram") {
            ctx.wizard.state.customMass = 100;
            yield ctx.reply("Calories per 100 gram");
            return ctx.wizard.selectStep(createProductSteps_1.steps.kcalsPerGram);
        }
        else if (callBackData === "custom-mass") {
            yield ctx.reply("Enter mass that you want to calculate");
            return ctx.wizard.selectStep(createProductSteps_1.steps.customMass);
        }
    });
}
function customMass(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        const customMass = validNumber;
        if (customMass === 0) {
            yield ctx.reply("Enter mass that greater than 0");
            return;
        }
        ctx.wizard.state.customMass = customMass;
        yield ctx.reply(`Calories per ${customMass} gram`);
        return ctx.wizard.selectStep(createProductSteps_1.steps.kcalsPerGram);
    });
}
function isUpdatingTheProduct(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, utils_1.updateProductMeal)(ctx, createProductSteps_1.steps.perHundredOrCustomMass, "Product");
    });
}
function kcalsPerGram(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        const customMass = ctx.wizard.state.customMass;
        ctx.wizard.state.kcal = validNumber;
        const fromFixingStep = yield (0, utils_1.handleFromFixingStep)(ctx);
        if (fromFixingStep) {
            return ctx.wizard.selectStep(createProductSteps_1.steps.fixingSomethingAndFinal);
        }
        yield ctx.reply(`Proteins per ${customMass} gram`);
        return ctx.wizard.selectStep(createProductSteps_1.steps.proteinsPerGram);
    });
}
function proteinsPerGram(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        const customMass = ctx.wizard.state.customMass;
        ctx.wizard.state.protein = validNumber;
        const fromFixingStep = yield (0, utils_1.handleFromFixingStep)(ctx);
        if (fromFixingStep) {
            return ctx.wizard.selectStep(createProductSteps_1.steps.fixingSomethingAndFinal);
        }
        yield ctx.reply(`Total fats per ${customMass} gram`);
        return ctx.wizard.selectStep(createProductSteps_1.steps.totalFatPerGram);
    });
}
function totalFatPerGram(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        const actualState = ctx.wizard.state;
        const customMass = ctx.wizard.state.customMass;
        actualState.totalFat = validNumber;
        const fromFixingStep = yield (0, utils_1.handleFromFixingStep)(ctx);
        if (fromFixingStep) {
            return ctx.wizard.selectStep(createProductSteps_1.steps.fixingSomethingAndFinal);
        }
        if (actualState.totalFat === 0) {
            actualState.saturatedFat = 0;
            actualState.unsaturatedFat = 0;
            yield ctx.reply(`Carbohydrates per ${customMass} gram`);
            return ctx.wizard.selectStep(createProductSteps_1.steps.carbohydratesPerGram);
        }
        yield ctx.reply(`Saturated fats per ${customMass} gram`);
        return ctx.wizard.selectStep(createProductSteps_1.steps.saturatedFatPerGram);
    });
}
function saturatedFatPerGram(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        const actualState = ctx.wizard.state;
        actualState.saturatedFat = validNumber;
        if (!(yield (0, utils_1.isSaturBiggerThanTotal)(ctx))) {
            return;
        }
        const customMass = ctx.wizard.state.customMass;
        actualState.unsaturatedFat = Math.round(actualState.totalFat - actualState.saturatedFat);
        const fromFixingStep = yield (0, utils_1.handleFromFixingStep)(ctx);
        if (fromFixingStep) {
            return ctx.wizard.selectStep(createProductSteps_1.steps.fixingSomethingAndFinal);
        }
        yield ctx.reply(`Carbohydrates per ${customMass} gram`);
        return ctx.wizard.selectStep(createProductSteps_1.steps.carbohydratesPerGram);
    });
}
function unsaturatedFatPerGram(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        const customMass = ctx.wizard.state.customMass;
        const actualState = ctx.wizard.state;
        actualState.unsaturatedFat = validNumber;
        actualState.totalFat = actualState.saturatedFat + actualState.unsaturatedFat;
        const fromFixingStep = yield (0, utils_1.handleFromFixingStep)(ctx);
        if (fromFixingStep) {
            return ctx.wizard.selectStep(createProductSteps_1.steps.fixingSomethingAndFinal);
        }
        yield ctx.reply(`Carbohydrates per ${customMass} gram`);
        return ctx.wizard.selectStep(createProductSteps_1.steps.carbohydratesPerGram);
    });
}
function carbohydratesPerGram(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        const customMass = ctx.wizard.state.customMass;
        const actualState = ctx.wizard.state;
        actualState.carbs = validNumber;
        const fromFixingStep = yield (0, utils_1.handleFromFixingStep)(ctx);
        if (fromFixingStep) {
            return ctx.wizard.selectStep(createProductSteps_1.steps.fixingSomethingAndFinal);
        }
        yield ctx.reply(`Fiber per ${customMass} gram`);
        return ctx.wizard.selectStep(createProductSteps_1.steps.fiberPerGram);
    });
}
function fiberPerGram(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        const actualState = ctx.wizard.state;
        actualState.fiber = validNumber;
        const fromFixingStep = yield (0, utils_1.handleFromFixingStep)(ctx);
        if (fromFixingStep) {
            return ctx.wizard.selectStep(createProductSteps_1.steps.fixingSomethingAndFinal);
        }
        const fixButtonProductBase = (0, buttons_1.getfixButtonProductBase)(actualState);
        yield ctx.reply("Choose what you want ot fix or press done to create product", fixButtonProductBase);
        return ctx.wizard.selectStep(createProductSteps_1.steps.fixingSomethingAndFinal);
    });
}
function fixingSomethingAndFinal(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const customMass = ctx.wizard.state.customMass;
        const actualState = ctx.wizard.state;
        const updateCheck = ctx.scene.state.updateProduct;
        ctx.wizard.state.fromFixingStep = true;
        const callBackData = ctx.callbackQuery.data;
        yield ctx.answerCbQuery();
        switch (callBackData) {
            case "name":
                yield ctx.reply("Name of product");
                return ctx.wizard.selectStep(createProductSteps_1.steps.waitingForProductName);
            case "kcal":
                yield ctx.reply(`Calories per ${customMass} gram`);
                return ctx.wizard.selectStep(createProductSteps_1.steps.kcalsPerGram);
            case "protein":
                yield ctx.reply(`Proteins per ${customMass} gram`);
                return ctx.wizard.selectStep(createProductSteps_1.steps.proteinsPerGram);
            case "total-fat":
                yield ctx.reply(`Total fats per ${customMass}`);
                return ctx.wizard.selectStep(createProductSteps_1.steps.totalFatPerGram);
            case "saturated-fat":
                yield ctx.reply(`Saturated fats per ${customMass} gram`);
                return ctx.wizard.selectStep(createProductSteps_1.steps.saturatedFatPerGram);
            case "unsaturated-fat":
                yield ctx.reply(`Unsaturated fats per ${customMass} gram`);
                return ctx.wizard.selectStep(createProductSteps_1.steps.unsaturatedFatPerGram);
            case "carbs":
                yield ctx.reply(`Carbohydrates per ${customMass} gram`);
                return ctx.wizard.selectStep(createProductSteps_1.steps.carbohydratesPerGram);
            case "fiber":
                yield ctx.reply(`Fiber per ${customMass} gram`);
                return ctx.wizard.selectStep(createProductSteps_1.steps.fiberPerGram);
            case "done":
                const nutrientKeys = [
                    "kcal",
                    "protein",
                    "totalFat",
                    "saturatedFat",
                    "unsaturatedFat",
                    "carbs",
                    "fiber",
                ];
                nutrientKeys.forEach((nutrientKey) => {
                    actualState[nutrientKey] = (0, utils_1.calculateAndRoundNutrient)(actualState[nutrientKey], customMass);
                });
                yield (0, utils_1.createOrUpdateProductInProductBase)(actualState, updateCheck, ctx, false);
        }
    });
}
