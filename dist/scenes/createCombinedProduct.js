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
exports.createCombinedProduct = void 0;
exports.startingDialogue = startingDialogue;
exports.waitingForCombinedProductName = waitingForCombinedProductName;
exports.isReplaceTheProduct = isReplaceTheProduct;
exports.waitingForNameAndMassOfProduct = waitingForNameAndMassOfProduct;
exports.productOptions = productOptions;
exports.replaceAddOrIgnore = replaceAddOrIgnore;
exports.fixingAndFinal = fixingAndFinal;
exports.fixingMassOfProduct = fixingMassOfProduct;
const telegraf_1 = require("telegraf");
const utils_1 = require("../utils/utils");
const buttons_1 = require("../utils/buttons");
const createCombinedProductSteps_1 = require("../steps-middlewares/createCombinedProductSteps");
exports.createCombinedProduct = new telegraf_1.Scenes.WizardScene("CREATE_COMBINED_PRODUCT", ...createCombinedProductSteps_1.createCombinedProductStepsList);
function startingDialogue(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.scene.state.fromStartingScene) {
            return yield (0, utils_1.handleFromStartingScene)(ctx);
        }
        ctx.wizard.state.tgId = ctx.from.id;
        yield ctx.reply("Name of product that you want to create");
        return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.waitingForCombinedProductName);
    });
}
function waitingForCombinedProductName(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validText = (0, utils_1.isValidText)(ctx);
        if (!validText)
            return;
        const actualState = ctx.wizard.state;
        const combinedProductName = validText;
        const existance = yield (0, utils_1.doesExistTheSameProductWithTgId)(combinedProductName, actualState.tgId);
        if (existance) {
            actualState.MealName = combinedProductName;
            actualState.MealMass = 0;
            actualState.products = {};
            yield ctx.reply("Product already exists in database");
            yield ctx.reply("Do you want to replace it?", buttons_1.yesOrNoButton);
            return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.isReplaceTheProduct);
        }
        actualState.MealName = combinedProductName;
        actualState.MealMass = 0;
        actualState.products = {};
        yield ctx.reply(`The name and mass of the first product that will be included in the meal ${ctx.wizard.state.MealName}`);
        return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.waitingForNameAndMassOfProduct);
    });
}
function isReplaceTheProduct(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, utils_1.updateProductMeal)(ctx, createCombinedProductSteps_1.steps.waitingForNameAndMassOfProduct, "Meal");
    });
}
function waitingForNameAndMassOfProduct(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const actualState = ctx.wizard.state;
        if (ctx.callbackQuery && "data" in ctx.callbackQuery) {
            yield ctx.answerCbQuery();
            if (ctx.callbackQuery.data === "bot-done") {
                const fixButtonCombinedProduct = (0, buttons_1.getFixButtonCombinedProduct)(actualState);
                yield ctx.reply("Choose product that you want to fix or press Done to calculate", fixButtonCombinedProduct);
                return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.fixingAndFinal);
            }
            if (ctx.callbackQuery.data === "create") {
                let initalState = {};
                initalState.name = actualState.actualProductName;
                return ctx.scene.enter("CREATE_PRODUCT", initalState);
            }
        }
        if (!ctx.message || !("text" in ctx.message)) {
            yield ctx.reply("Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100)");
            return;
        }
        const productNameAndMass = (0, utils_1.IsInputStringAndNumber)(ctx.message.text);
        if (productNameAndMass === null) {
            yield ctx.reply("Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100)");
            return;
        }
        actualState.actualProductName = productNameAndMass[0];
        const tgId = actualState.tgId;
        actualState.checkForCombined = true;
        const existanceOfProductInState = (0, utils_1.doesProductExistInState)(actualState.actualProductName, actualState);
        actualState.actualProductMass = productNameAndMass[1];
        if (existanceOfProductInState) {
            yield ctx.reply("You can't have two identical products as a part of combined product");
            yield ctx.reply("Press REPLACE if you want to replace product data, ADD if you want to add this data to previous and IGNORE if you don't want to change previous data", buttons_1.replaceAddOrIgnoreButton);
            return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.replaceAddOrIgnore);
        }
        const searchResults = yield (0, utils_1.findProductInBases)(actualState.actualProductName, tgId);
        `The name and mass of the product that will be included in the meal ${ctx.wizard.state.MealName}`;
        if (searchResults === null) {
            yield ctx.reply("This product does not exist in product database");
            yield ctx.reply(`
    Create - to create ${actualState.actualProductName} in product database;
    Done - to calculate nutrition of ${actualState.MealName};
    Or just enter the name and mass (in gram) of the next product that will be included in the meal ${ctx.wizard.state.MealName}, (ignore ${actualState.actualProductName})`, buttons_1.createOrDoneButton);
            return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.waitingForNameAndMassOfProduct);
        }
        if (searchResults.length === 1) {
            const foodElement = searchResults[0];
            const documentId = foodElement._id;
            actualState.products[documentId] = foodElement;
            actualState.products[documentId].name = actualState.actualProductName;
            actualState.products[documentId].mass = actualState.actualProductMass;
            actualState.MealMass += actualState.actualProductMass;
            yield ctx.reply(`The name and mass of the product that will be included in the meal ${ctx.wizard.state.MealName} or press Done to calculate nutrition`, buttons_1.doneButton);
            return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.waitingForNameAndMassOfProduct);
        }
        actualState.arrayOfProducts = searchResults;
        const chooseProductButton = (0, buttons_1.getChooseProductButton)(searchResults);
        yield ctx.reply("Did you mean one of these products?", chooseProductButton);
        return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.productOptions);
    });
}
function productOptions(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const actualState = ctx.wizard.state;
        const callBackData = ctx.callbackQuery.data;
        yield ctx.answerCbQuery();
        const foodElement = Object.values(actualState.arrayOfProducts).find((product) => product._id.toString() === callBackData);
        const documentId = foodElement._id;
        actualState.products[documentId] = foodElement;
        actualState.products[documentId].name = foodElement.name;
        actualState.products[documentId].mass = actualState.actualProductMass;
        actualState.MealMass += actualState.actualProductMass;
        yield ctx.reply(`The name and mass of the product that will be included in the meal ${ctx.wizard.state.MealName} or press Done to calculate nutrition`, buttons_1.doneButton);
        return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.waitingForNameAndMassOfProduct);
    });
}
function replaceAddOrIgnore(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const actualState = ctx.wizard.state;
        const productName = actualState.actualProductName;
        const productMass = actualState.actualProductMass;
        const callBackData = ctx.callbackQuery.data;
        yield ctx.answerCbQuery();
        switch (callBackData) {
            case "replace":
                (0, utils_1.replaceProductMassInState)(actualState, productName, productMass);
                (0, utils_1.recalculateCombinedMass)(actualState);
                yield ctx.reply("Product succsesfully replaced");
                yield ctx.reply(`The name and mass of the product that will be included in the meal ${ctx.wizard.state.MealName} or press Done to calculate nutrition`, buttons_1.doneButton);
                return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.waitingForNameAndMassOfProduct);
            case "add":
                (0, utils_1.addProductMassInState)(actualState, productName, productMass);
                (0, utils_1.recalculateCombinedMass)(actualState);
                yield ctx.reply("Product mass succsesfully added");
                yield ctx.reply(`The name and mass of the product that will be included in the meal ${ctx.wizard.state.MealName} or press Done to calculate nutrition`, buttons_1.doneButton);
                return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.waitingForNameAndMassOfProduct);
            case "ignore":
                Object.keys(actualState.products).forEach((documentId) => {
                    const product = actualState.products[documentId];
                    if (product.name === productName) {
                        product.mass = product.mass;
                    }
                });
                yield ctx.reply("New mass of product succsesfully ignored");
                yield ctx.reply(`The name and mass of the product that will be included in the meal ${ctx.wizard.state.MealName} or press Done to calculate nutrition`, buttons_1.doneButton);
                return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.waitingForNameAndMassOfProduct);
        }
    });
}
function fixingAndFinal(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        yield ctx.answerCbQuery();
        const actualState = ctx.wizard.state;
        if (ctx.callbackQuery.data === "done_action") {
            const finalNutrition = (0, utils_1.combineAllNutrition)(actualState);
            const updateCheck = ctx.scene.state.updateProduct;
            yield (0, utils_1.createOrUpdateProductInProductBase)(finalNutrition, updateCheck, ctx, true);
            return;
        }
        const documentIdFromCallBack = ctx.callbackQuery.data;
        const productName = (0, utils_1.getProductNameById)(actualState, documentIdFromCallBack);
        actualState.actualProductName = productName;
        yield ctx.reply("Write a mass of product");
        return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.fixingMassOfProduct);
    });
}
function fixingMassOfProduct(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNumber = yield (0, utils_1.isValidNumber)(ctx);
        if (validNumber === null)
            return;
        const actualState = ctx.wizard.state;
        const productName = actualState.actualProductName;
        const mass = validNumber;
        (0, utils_1.updateProductMassAndName)(actualState, productName, mass);
        const fixButtonCombinedProduct = (0, buttons_1.getFixButtonCombinedProduct)(actualState);
        yield ctx.reply("Product state succsesfully updated");
        yield ctx.reply("Choose product that you want to fix or press Done to calculate", fixButtonCombinedProduct);
        return ctx.wizard.selectStep(createCombinedProductSteps_1.steps.fixingAndFinal);
    });
}
