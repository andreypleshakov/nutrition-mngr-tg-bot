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
exports.addConsumption = void 0;
exports.startingDialogue = startingDialogue;
exports.todayOrCustomDate = todayOrCustomDate;
exports.customDate = customDate;
exports.waitingForNameAndMassOfProduct = waitingForNameAndMassOfProduct;
exports.productOptions = productOptions;
const telegraf_1 = require("telegraf");
const utils_1 = require("../utils/utils");
const buttons_1 = require("../utils/buttons");
const addConsumptionSteps_1 = require("../steps-middlewares/addConsumptionSteps");
exports.addConsumption = new telegraf_1.Scenes.WizardScene("ADD_CONSUMPTION", ...addConsumptionSteps_1.addConsumptionStepsList);
function startingDialogue(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.scene.state.fromStartingScene) {
            return yield (0, utils_1.handleFromStartingScene)(ctx);
        }
        ctx.wizard.state.tgId = ctx.from.id;
        const firstMessage = yield ctx.reply("TODAY - add today's consumption statistic\n" +
            "CUSTOM - add custom day of your consumption", telegraf_1.Markup.inlineKeyboard(buttons_1.todayOrCustomDateButton));
        ctx.wizard.state.botMessageId = firstMessage.message_id;
        return ctx.wizard.selectStep(addConsumptionSteps_1.steps.todayOrCustomDate);
    });
}
function todayOrCustomDate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        yield ctx.answerCbQuery();
        const callBackData = ctx.callbackQuery.data;
        if (callBackData === "today") {
            ctx.wizard.state.dateOfConsumption =
                new Date().toISOString();
            yield ctx.editMessageText("Enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)");
            return ctx.wizard.selectStep(addConsumptionSteps_1.steps.waitingForNameAndMassOfProduct);
        }
        yield ctx.editMessageText("Enter date that you require in this format YYYY-MM-DD");
        return ctx.wizard.selectStep(addConsumptionSteps_1.steps.customDate);
    });
}
function customDate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.message || !("text" in ctx.message)) {
            return;
        }
        /* HERE IS A BUG */
        if (!(0, utils_1.isValidDateFormat)(ctx.message.text)) {
            const firstMessage = "Wrong! Enter date that you require in this format YYYY-MM-DD";
            const secondMessage = "NO";
            // Check if 'fromValidation' flag exists
            const state = ctx.wizard.state;
            if (!state.fromValidation) {
                state.fromValidation = true; // Set the flag
                yield ctx.editMessageText(firstMessage); // Send the first message
                return;
            }
            yield ctx.editMessageText(secondMessage); // Send the second message
            state.fromValidation = false; // Reset the flag
            return;
        }
        ctx.wizard.state.dateOfConsumption = new Date(ctx.message.text).toISOString();
        yield ctx.reply("Enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)");
        return ctx.wizard.selectStep(addConsumptionSteps_1.steps.waitingForNameAndMassOfProduct);
    });
}
function waitingForNameAndMassOfProduct(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const actualState = ctx.wizard.state;
        const dialogueState = ctx.wizard.state;
        if (ctx.callbackQuery &&
            "data" in ctx.callbackQuery &&
            ctx.callbackQuery.data === "create") {
            yield ctx.answerCbQuery();
            let initalState = {};
            initalState.name = actualState.name;
            return ctx.scene.enter("CREATE_PRODUCT", initalState);
        }
        if (!ctx.message || !("text" in ctx.message)) {
            return;
        }
        const productNameAndMass = (0, utils_1.IsInputStringAndNumber)(ctx.message.text);
        if (productNameAndMass === null) {
            yield (0, utils_1.deleteAndUpdateBotMessage)(ctx, "Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100)");
            return;
        }
        actualState.name = productNameAndMass[0];
        actualState.mass = productNameAndMass[1];
        const tgId = actualState.tgId;
        const searchResults = yield (0, utils_1.findProductInBases)(actualState.name, tgId);
        if (searchResults === null) {
            yield (0, utils_1.deleteAndUpdateBotMessageCreate)(ctx, buttons_1.createButton);
            return;
        }
        if (searchResults.length === 1) {
            const foodElement = searchResults[0];
            foodElement.mass = actualState.mass;
            yield (0, utils_1.calculateConsumption)(foodElement, ctx);
            return;
        }
        dialogueState.arrayOfProducts = searchResults;
        const chooseProductButton = (0, buttons_1.getChooseProductButton)(searchResults);
        yield (0, utils_1.deleteAndUpdateBotMessage)(ctx, "Did you mean one of these products?", chooseProductButton);
        return ctx.wizard.selectStep(addConsumptionSteps_1.steps.productOptions);
    });
}
function productOptions(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        yield ctx.answerCbQuery();
        const dialogueState = ctx.wizard.state;
        const callBackData = ctx.callbackQuery.data;
        const foodElement = Object.values(dialogueState.arrayOfProducts).find((product) => product._id.toString() === callBackData);
        yield (0, utils_1.calculateConsumption)(foodElement, ctx);
    });
}
