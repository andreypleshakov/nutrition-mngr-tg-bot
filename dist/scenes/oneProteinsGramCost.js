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
exports.costOfOneProteinsGram = void 0;
exports.startingDialogue = startingDialogue;
exports.nameOfProduct = nameOfProduct;
exports.perHundredOrCustomMass = perHundredOrCustomMass;
exports.customMass = customMass;
exports.proteinPerSelectedMass = proteinPerSelectedMass;
exports.totalMassOfProduct = totalMassOfProduct;
exports.costOfProduct = costOfProduct;
exports.fixingOrFinal = fixingOrFinal;
exports.finalCalculation = finalCalculation;
const telegraf_1 = require("telegraf");
const utils_1 = require("../utils/utils");
const buttons_1 = require("../utils/buttons");
const oneProteinsGramCostSteps_1 = require("../steps-middlewares/oneProteinsGramCostSteps");
exports.costOfOneProteinsGram = new telegraf_1.Scenes.WizardScene("COST_OF_PROTEIN", ...oneProteinsGramCostSteps_1.oneProteinsGramCostStepsList);
function startingDialogue(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.scene.state.fromStartingScene) {
            return yield (0, utils_1.handleFromStartingScene)(ctx);
        }
        yield ctx.reply("Name of product");
        return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.nameOfProduct);
    });
}
function nameOfProduct(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.message || !("text" in ctx.message)) {
            yield ctx.reply("Wrong, write a product name");
            return;
        }
        ctx.wizard.state.nameOfProduct = ctx.message.text.trim();
        yield ctx.reply("Choose the scope of mass you want to calculate nutrition PER 100 or PER CUSTOM", buttons_1.perButton);
        return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.perHundredOrCustomMass);
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
            ctx.wizard.state.massScope = 100;
            yield ctx.reply("Protein per 100 gram");
            return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.proteinPerSelectedMass);
        }
        else if (callBackData === "custom-mass") {
            yield ctx.reply("Enter mass that you want to calculate");
            return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.customMass);
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
        ctx.wizard.state.massScope = customMass;
        yield ctx.reply(`Protein per ${customMass} gram`);
        return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.proteinPerSelectedMass);
    });
}
function proteinPerSelectedMass(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.protein = validNumber;
        yield ctx.reply("Enter total mass of product");
        return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.totalMassOfProduct);
    });
}
function totalMassOfProduct(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        ctx.wizard.state.totalMass = validNumber;
        yield ctx.reply("Enter currency with cost of product (ex.: usd 100, usd 10.1, usd 10,1");
        return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.costOfProduct);
    });
}
function costOfProduct(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.message || !("text" in ctx.message)) {
            yield ctx.reply("Wrong! Enter currency with cost of product in this format: usd 100, usd 10.1, usd 10,1");
            return;
        }
        const input = ctx.message.text;
        const currencyAmountAndName = (0, utils_1.IsInputStringAndNumber)(input);
        if (currencyAmountAndName === null) {
            yield ctx.reply("Wrong! Enter currency with cost of product in this format: usd 100, usd 10.1, usd 10,1");
            return;
        }
        ctx.wizard.state.nameOfCurrency =
            currencyAmountAndName[0]; // usd
        ctx.wizard.state.cost = currencyAmountAndName[1]; // 100
        const fixButtonCostOfProtein = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Name", callback_data: "name" }],
                    [{ text: "Scope of protein", callback_data: "scope" }],
                    [
                        {
                            text: `Protein per ${ctx.wizard.state.massScope} `,
                            callback_data: "protein-per-scope",
                        },
                    ],
                    [{ text: "Product cost", callback_data: "cost" }],
                    [{ text: "Finish", callback_data: "finish" }],
                ],
            },
        };
        yield ctx.replyWithAnimation("Choose what you want to fix or press Finish to calculate?", fixButtonCostOfProtein);
        return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.fixingOrFinal);
    });
}
function fixingOrFinal(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const callBackData = ctx.callbackQuery.data;
        yield ctx.answerCbQuery();
        switch (callBackData) {
            case "name":
                yield ctx.reply("Name of product");
                return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.nameOfProduct);
            case "scope":
                yield ctx.reply("Choose the scope of mass you want to calculate nutrition PER 100 or PER CUSTOM", buttons_1.perButton);
                return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.perHundredOrCustomMass);
            case "protein-per-scope":
                yield ctx.reply(`Protein per ${customMass} gram`);
                return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.proteinPerSelectedMass);
            case "cost":
                yield ctx.reply("Enter currency with cost of product (ex.: usd 100, usd 10.1, usd 10,1");
                return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.costOfProduct);
            case "finish":
                return ctx.wizard.selectStep(oneProteinsGramCostSteps_1.steps.finalCalculation);
        }
    });
}
function finalCalculation(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const actualState = ctx.wizard.state;
    });
}
