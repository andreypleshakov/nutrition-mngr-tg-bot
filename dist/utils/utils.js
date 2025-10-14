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
exports.mealEditMessage = exports.productEditMessage = void 0;
exports.calculateAndRoundNutrient = calculateAndRoundNutrient;
exports.replaceProductMassInState = replaceProductMassInState;
exports.addProductMassInState = addProductMassInState;
exports.updateProductMassAndName = updateProductMassAndName;
exports.recalculateCombinedMass = recalculateCombinedMass;
exports.IsInputStringAndNumber = IsInputStringAndNumber;
exports.doesProductExistInState = doesProductExistInState;
exports.getProductNameAndMass = getProductNameAndMass;
exports.roundToThree = roundToThree;
exports.calculatePercentageOfNutrient = calculatePercentageOfNutrient;
exports.calculateFatTypePercentage = calculateFatTypePercentage;
exports.isValidDateFormat = isValidDateFormat;
exports.getMonday = getMonday;
exports.getWeeksOfCurrentMonth = getWeeksOfCurrentMonth;
exports.getMonthsOfCurrentYear = getMonthsOfCurrentYear;
exports.isValidText = isValidText;
exports.isValidNumber = isValidNumber;
exports.combineAllNutrition = combineAllNutrition;
exports.newCheckFormatOfProduct = newCheckFormatOfProduct;
exports.checkFormatOfProduct = checkFormatOfProduct;
exports.getProductNameById = getProductNameById;
exports.formatDate = formatDate;
exports.doesExistTheSameProductWithTgId = doesExistTheSameProductWithTgId;
exports.getProductNutritionFromBaseIfExists = getProductNutritionFromBaseIfExists;
exports.handleFromFixingStep = handleFromFixingStep;
exports.handleFromStartingScene = handleFromStartingScene;
exports.createProductInBase = createProductInBase;
exports.findProductInBases = findProductInBases;
exports.calculateConsumption = calculateConsumption;
exports.createOrUpdateProductInProductBase = createOrUpdateProductInProductBase;
exports.existanceOfUser = existanceOfUser;
exports.getConsumptionStatisticByDateAnTgId = getConsumptionStatisticByDateAnTgId;
exports.getAverageConsumptionStatistic = getAverageConsumptionStatistic;
exports.deleteConsumptionStatisticByDateAnTgId = deleteConsumptionStatisticByDateAnTgId;
exports.findTopTenProducts = findTopTenProducts;
exports.deleteAndUpdateBotMessageCreate = deleteAndUpdateBotMessageCreate;
exports.deleteAndUpdateBotMessage = deleteAndUpdateBotMessage;
exports.updateProductMeal = updateProductMeal;
exports.isSaturBiggerThanTotal = isSaturBiggerThanTotal;
const schemas_1 = require("./schemas");
const buttons_1 = require("./buttons");
/*
export function calculationOfCostProtein(actualState: ICostOfProtein): number {
  const amountOfProtein = actualState.protein / actualState.massScope;
  const costOfGram = actualState.cost / actualState.totalMass;
  const costForOneGramOfProtein = costOfGram / amountOfProtein;
  return costForOneGramOfProtein;
}
  */
function calculateAndRoundNutrient(nutrient, customMass) {
    const nutrientPerGram = roundToThree(nutrient / customMass);
    return nutrientPerGram;
}
function replaceProductMassInState(combinedProduct, productName, mass) {
    Object.keys(combinedProduct.products).forEach((documentId) => {
        const product = combinedProduct.products[documentId];
        if (product.name === productName) {
            product.mass = mass;
        }
    });
}
function addProductMassInState(combinedProduct, productName, mass) {
    Object.keys(combinedProduct.products).forEach((documentId) => {
        const product = combinedProduct.products[documentId];
        if (product.name === productName) {
            product.mass = product.mass + mass;
        }
    });
}
function updateProductMassAndName(combinedProduct, productName, mass) {
    Object.keys(combinedProduct.products).forEach((documentId) => {
        const product = combinedProduct.products[documentId];
        if (product.name === productName) {
            product.mass = mass;
            product.name = productName;
        }
    });
}
function recalculateCombinedMass(combinedProduct) {
    const newMass = Object.values(combinedProduct.products).reduce((accumulator, product) => accumulator + product.mass, 0);
    combinedProduct.MealMass = newMass;
    return combinedProduct.MealMass;
}
function IsInputStringAndNumber(inputProduct) {
    const partsOfInput = inputProduct.trim().split(" ");
    if (partsOfInput.length < 2) {
        return null;
    }
    const stringMass = partsOfInput.pop();
    const correctedMass = stringMass.replace(",", ".");
    const productMass = parseFloat(correctedMass);
    const productName = partsOfInput.join(" ");
    if (!productName || !productMass || isNaN(Number(productMass))) {
        return null;
    }
    return [productName, productMass];
}
function doesProductExistInState(productName, combinedProduct) {
    const existingProductName = Object.values(combinedProduct.products).find((product) => product.name === productName);
    if (existingProductName) {
        return true;
    }
    return false;
}
function getProductNameAndMass(combinedProduct) {
    let productInfoArray = [];
    Object.keys(combinedProduct.products).forEach((documentId) => {
        const product = combinedProduct.products[documentId];
        const productInfo = `${product.name}: ${product.mass}`;
        productInfoArray.push(productInfo);
    });
    return productInfoArray;
}
function roundToThree(num) {
    return +num.toFixed(3);
}
function calculatePercentageOfNutrient(nutrientMass, foodElement) {
    const sumNutrition = roundToThree(foodElement.protein + foodElement.totalFat + foodElement.carbs);
    if (sumNutrition === 0) {
        return 0;
    }
    const persetnageOfNutrient = Math.round((nutrientMass / sumNutrition) * 100);
    return persetnageOfNutrient;
}
function calculateFatTypePercentage(fatType, totalFat) {
    if (totalFat === 0) {
        return 0;
    }
    const percentageOfFatType = Math.round((fatType / totalFat) * 100);
    return percentageOfFatType;
}
function isValidDateFormat(date) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(date)) {
        return false;
    }
    const [year, month, day] = date.split("-").map(Number);
    if (month < 1 || month > 12) {
        return false;
    }
    const dateObj = new Date(year, month - 1, day);
    if (dateObj.getFullYear() !== year ||
        dateObj.getMonth() + 1 !== month ||
        dateObj.getDate() !== day) {
        return false;
    }
    return true;
}
function getMonday(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}
function getWeeksOfCurrentMonth() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentWeekStart = getMonday(now);
    // Get first day of current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Get last day of current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const weeks = [];
    // Start from the Monday of the week containing the first day of the month
    let weekStart = getMonday(firstDayOfMonth);
    while (weekStart <= currentWeekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday
        // Check if this week overlaps with current month
        if (weekStart <= lastDayOfMonth && weekEnd >= firstDayOfMonth) {
            const startLabel = formatDate(weekStart);
            const endLabel = formatDate(weekEnd);
            weeks.push({
                start: new Date(weekStart),
                end: new Date(weekEnd),
                label: `Week ${startLabel} - ${endLabel}`
            });
        }
        // Move to next week
        weekStart.setDate(weekStart.getDate() + 7);
    }
    return weeks;
}
function getMonthsOfCurrentYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const months = [];
    for (let i = 0; i <= currentMonth; i++) {
        months.push({
            month: i,
            label: `${monthNames[i]} ${currentYear}`
        });
    }
    return months;
}
function replaceCommaToDot(input) {
    const finalInput = input.trim();
    return parseFloat(finalInput.replace(",", "."));
}
function isValidText(ctx) {
    return !ctx.message || !("text" in ctx.message)
        ? null
        : ctx.message.text.trim().toLowerCase();
}
function isValidNumber(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const errorMsg = "Wrong, write a number in this format: 10 / 10.0 / 10,0";
        if (!ctx.message || !("text" in ctx.message)) {
            yield ctx.reply(errorMsg);
            return null;
        }
        const text = ctx.message.text;
        if (!/^[\d.,]+$/.test(text)) {
            yield ctx.reply(errorMsg);
            return null;
        }
        const commaCount = (text.match(/,/g) || []).length;
        const dotCount = (text.match(/\./g) || []).length;
        const hasTooManySeparators = commaCount > 1 || dotCount > 1 || (commaCount === 1 && dotCount === 1);
        if (hasTooManySeparators) {
            yield ctx.reply(errorMsg);
            return null;
        }
        return replaceCommaToDot(text);
    });
}
function combineAllNutrition(combinedProduct) {
    let resultProduct = {
        name: combinedProduct.MealName,
        mass: combinedProduct.MealMass,
        kcal: 0,
        protein: 0,
        totalFat: 0,
        saturatedFat: 0,
        unsaturatedFat: 0,
        carbs: 0,
        fiber: 0,
        tgId: combinedProduct.tgId,
    };
    Object.keys(combinedProduct.products).forEach((productName) => {
        const product = combinedProduct.products[productName];
        resultProduct.kcal += product.kcal * product.mass;
        resultProduct.protein += product.protein * product.mass;
        resultProduct.totalFat += product.totalFat * product.mass;
        resultProduct.saturatedFat += product.saturatedFat * product.mass;
        resultProduct.unsaturatedFat += product.unsaturatedFat * product.mass;
        resultProduct.carbs += product.carbs * product.mass;
        resultProduct.fiber += product.fiber * product.mass;
    });
    const perGramResultProduct = resultProduct;
    perGramResultProduct.kcal =
        perGramResultProduct.kcal / perGramResultProduct.mass;
    perGramResultProduct.protein =
        perGramResultProduct.protein / perGramResultProduct.mass;
    perGramResultProduct.totalFat =
        perGramResultProduct.totalFat / perGramResultProduct.mass;
    perGramResultProduct.saturatedFat =
        perGramResultProduct.saturatedFat / perGramResultProduct.mass;
    perGramResultProduct.unsaturatedFat =
        perGramResultProduct.unsaturatedFat / perGramResultProduct.mass;
    perGramResultProduct.carbs =
        perGramResultProduct.carbs / perGramResultProduct.mass;
    perGramResultProduct.fiber =
        perGramResultProduct.fiber / perGramResultProduct.mass;
    return perGramResultProduct;
}
function newCheckFormatOfProduct(productName, productMass) {
    if (!productName || !productMass || isNaN(Number(productMass))) {
        return false;
    }
    return true;
}
function checkFormatOfProduct(userInput) {
    const parts = userInput.trim().split(" ");
    const mass = parts.pop();
    const productName = parts.join(" ");
    if (!productName || !mass || isNaN(Number(mass))) {
        return false;
    }
    return true;
}
function getProductNameById(combinedProduct, callBackData) {
    const product = Object.values(combinedProduct.products).find((product) => product._id.toString() === callBackData);
    return product.name;
}
function formatDate(date) {
    if (date !== undefined) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    return null;
}
function doesExistTheSameProductWithTgId(productName, tgId) {
    return __awaiter(this, void 0, void 0, function* () {
        const existancePrimal = yield schemas_1.PrimalProduct.findOne({
            name: productName,
            tgId: tgId,
        });
        if (existancePrimal) {
            return true;
        }
        const existanceProductBase = yield schemas_1.UsersProduct.findOne({
            name: productName,
            tgId: tgId,
        });
        if (existanceProductBase) {
            return true;
        }
        return false;
    });
}
function getProductNutritionFromBaseIfExists(productName, tgId) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield schemas_1.UsersProduct.findOne({
            name: productName,
            tgId: tgId,
        });
        if (!product) {
            return null;
        }
        const newStringProductId = product._id.toString();
        const nutrition = {};
        (nutrition._id = newStringProductId),
            (nutrition.name = productName),
            (nutrition.kcal = product.kcal),
            (nutrition.protein = product.protein),
            (nutrition.totalFat = product.totalFat),
            (nutrition.saturatedFat = product.saturatedFat),
            (nutrition.unsaturatedFat = product.unsaturatedFat),
            (nutrition.carbs = product.carbs);
        nutrition.tgId = tgId;
        return nutrition;
    });
}
function handleFromFixingStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const dialogueState = ctx.wizard.state;
        const actualState = ctx.wizard.state;
        const fixButtonProductBase = (0, buttons_1.getfixButtonProductBase)(actualState);
        if (dialogueState.fromFixingStep) {
            yield ctx.reply("Choose what you want ot fix or press done to create product", fixButtonProductBase);
            return true;
        }
        return false;
    });
}
function handleFromStartingScene(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const errorMessage = yield ctx.reply("You can't calculate anything because you are not logged, you will be redirected to start");
        yield delay(3000);
        yield ctx.deleteMessages([
            errorMessage.message_id,
            ctx.scene.state.mainMessageId,
        ]);
        yield ctx.scene.enter("START_CALCULATION");
    });
}
function createProductInBase(foodElement) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, tgId } = foodElement;
        const kcal = roundToThree(foodElement.kcal);
        const protein = roundToThree(foodElement.protein);
        const saturatedFat = roundToThree(foodElement.saturatedFat);
        const unsaturatedFat = roundToThree(foodElement.unsaturatedFat);
        const carbs = roundToThree(foodElement.carbs);
        const totalFat = roundToThree(foodElement.totalFat);
        const sumNutrition = roundToThree(protein + totalFat + carbs);
        let proteinPercent = 0, totalFatPercent = 0, carbPercent = 0, satFatPercent = 0, unsatFatPercent = 0;
        if (sumNutrition > 0) {
            proteinPercent = Math.round((protein / sumNutrition) * 100);
            carbPercent = Math.round((carbs / sumNutrition) * 100);
            totalFatPercent =
                totalFat > 0 ? Math.round((totalFat / sumNutrition) * 100) : 0;
        }
        if (totalFat > 0) {
            satFatPercent = Math.round((saturatedFat / totalFat) * 100);
            unsatFatPercent = Math.round((unsaturatedFat / totalFat) * 100);
        }
        const newProduct = new schemas_1.UsersProduct({
            name,
            kcal,
            protein,
            saturatedFat: saturatedFat,
            unsaturatedFat: unsaturatedFat,
            totalFat,
            carbs,
            proteinPercent,
            totalFatPercent,
            carbPercent,
            satFatPercent,
            unsatFatPercent,
            tgId,
        });
        yield newProduct.save();
    });
}
function productHelper(result, productName) {
    return Object.values(result).find((product) => product.name === productName);
}
function findProductInBases(productName, tgId) {
    return __awaiter(this, void 0, void 0, function* () {
        const searchPrimalResult = yield findProductInDB(schemas_1.PrimalProduct, productName, tgId, "searchPrimal");
        if (searchPrimalResult === null) {
            const searchProductsResults = yield findProductInDB(schemas_1.UsersProduct, productName, tgId, "searchProducts");
            if (searchProductsResults === null) {
                return null;
            }
            const product = productHelper(searchProductsResults, productName);
            if (product &&
                (searchProductsResults.length === 1 ||
                    product.name.split(" ").length >= 3)) {
                return [product];
            }
            return searchProductsResults;
        }
        const product = productHelper(searchPrimalResult, productName);
        if (product &&
            (searchPrimalResult.length === 1 || product.name.split(" ").length >= 3)) {
            return [product];
        }
        const result = searchPrimalResult.map((_a) => {
            var { allowedUsersTgId } = _a, rest = __rest(_a, ["allowedUsersTgId"]);
            return rest;
        });
        return result;
    });
}
function findProductInDB(DB, productName, tgId, indexName) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryPrimal = {
            allowedUsersTgId: { $in: [tgId] },
        };
        const queryPrduct = {
            tgId: tgId,
        };
        const result = yield DB.aggregate([
            {
                $search: {
                    index: indexName,
                    text: {
                        query: productName,
                        path: "name",
                    },
                },
            },
            {
                $match: indexName === "searchPrimal" ? queryPrimal : queryPrduct,
            },
        ]);
        return result.length ? result : null;
    });
}
function calculateConsumption(product, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const consumedState = ctx.wizard.state;
        const mass = consumedState.mass;
        const productName = product.name;
        const date = consumedState.dateOfConsumption;
        const sumNutrition = product.protein * mass + product.totalFat * mass + product.carbs * mass;
        if (sumNutrition === 0) {
            const nutritionDetails = {
                dateOfConsumption: date,
                name: productName,
                mass: mass,
                kcal: 0,
                protein: 0,
                saturatedFat: 0,
                unsaturatedFat: 0,
                totalFat: 0,
                carbs: 0,
                fiber: 0,
                tgId: consumedState.tgId,
                status: product.status,
                typeOfFood: product.typeOfFood,
            };
            const newDate = new schemas_1.ConsumedProduct(nutritionDetails);
            yield newDate.save();
            yield deleteAndUpdateBotMessage(ctx, `Product ${productName} added to daily consumption statistics`);
            yield ctx.deleteMessages([
                ctx.wizard.state.botMessageId,
                ctx.wizard.state.mainMessageId,
            ]);
            yield ctx.scene.enter("START_CALCULATION");
            return;
        }
        const nutritionDetails = {
            dateOfConsumption: date,
            name: productName,
            mass: mass,
            kcal: roundToThree(product.kcal * mass),
            protein: roundToThree(product.protein * mass),
            saturatedFat: roundToThree(product.saturatedFat * mass),
            unsaturatedFat: roundToThree(product.unsaturatedFat * mass),
            totalFat: roundToThree(product.totalFat * mass),
            carbs: roundToThree(product.carbs * mass),
            fiber: roundToThree(product.fiber * mass),
            tgId: consumedState.tgId,
            status: product.status,
            typeOfFood: product.typeOfFood,
        };
        const newDate = new schemas_1.ConsumedProduct(nutritionDetails);
        yield newDate.save();
        yield deleteAndUpdateBotMessage(ctx, `Product ${productName} added to daily consumption statistics`);
        yield ctx.deleteMessages([
            ctx.wizard.state.botMessageId,
            ctx.wizard.state.mainMessageId,
        ]);
        yield ctx.scene.enter("START_CALCULATION");
    });
}
function createOrUpdateProductInProductBase(foodElement, updateCheck, ctx, isCombined) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = { name: foodElement.name, tgId: foodElement.tgId };
        const nutrition = {
            name: foodElement.name,
            kcal: roundToThree(foodElement.kcal),
            protein: roundToThree(foodElement.protein),
            totalFat: roundToThree(foodElement.totalFat),
            saturatedFat: roundToThree(foodElement.saturatedFat),
            unsaturatedFat: roundToThree(foodElement.unsaturatedFat),
            carbs: roundToThree(foodElement.carbs),
            fiber: roundToThree(foodElement.fiber),
            proteinPercent: calculatePercentageOfNutrient(foodElement.protein, foodElement),
            totalFatPercent: calculatePercentageOfNutrient(foodElement.totalFat, foodElement),
            carbPercent: calculatePercentageOfNutrient(foodElement.carbs, foodElement),
            satFatPercent: calculateFatTypePercentage(foodElement.saturatedFat, foodElement.totalFat),
            unsatFatPercent: calculateFatTypePercentage(foodElement.unsaturatedFat, foodElement.totalFat),
            tgId: foodElement.tgId,
            typeOfFood: isCombined ? "meal" : "product",
        };
        if (updateCheck === true) {
            yield schemas_1.UsersProduct.findOneAndUpdate(filter, { $set: nutrition }, {
                new: true,
                runValidators: true,
            });
            yield ctx.reply(`Product ${foodElement.name} was updated in the database.`);
        }
        else {
            const newProduct = new schemas_1.UsersProduct(nutrition);
            yield newProduct.save();
            yield ctx.reply(`Product ${nutrition.name} was created in the database.`);
        }
        yield ctx.scene.enter("START_CALCULATION");
    });
}
function existanceOfUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const existance = yield schemas_1.User.findOne({
            tgId: userId,
        });
        if (existance) {
            return true;
        }
        return false;
    });
}
function getConsumptionStatisticByDateAnTgId(tgId, checkForList, startDate, endDate, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const customDateString = formatDate(new Date(startDate));
        const filter = {
            dateOfConsumption: { $gte: startDate, $lt: endDate },
            tgId: tgId,
        };
        const foods = yield schemas_1.ConsumedProduct.find(filter);
        if (foods.length === 0) {
            yield ctx.reply("You don't have any consumption records in this day");
            ctx.scene.enter("START_CALCULATION");
            return;
        }
        if (checkForList) {
            let productInfo = `List of consumed products (for ${customDateString}):\n`;
            foods.forEach((food) => {
                productInfo += `${food.name}: ${food.mass} g\n`;
            });
            yield ctx.reply(productInfo);
            ctx.scene.enter("START_CALCULATION");
            return;
        }
        const totals = foods.reduce((accumulator, food) => {
            accumulator.mass += food.mass;
            accumulator.kcal += food.kcal;
            accumulator.protein += food.protein;
            accumulator.totalFat += food.totalFat;
            accumulator.saturatedFat += food.saturatedFat;
            accumulator.unsaturatedFat += food.unsaturatedFat;
            accumulator.carbs += food.carbs;
            accumulator.fiber += food.fiber;
            return accumulator;
        }, {
            mass: 0,
            kcal: 0,
            protein: 0,
            totalFat: 0,
            saturatedFat: 0,
            unsaturatedFat: 0,
            carbs: 0,
            proteinPercent: 0,
            totalFatPercent: 0,
            carbPercent: 0,
            fiber: 0,
            satFatPercent: 0,
            unsatFatPercent: 0,
            tgId: tgId,
        });
        totals.proteinPercent = calculatePercentageOfNutrient(totals.protein, totals);
        totals.totalFatPercent = calculatePercentageOfNutrient(totals.totalFat, totals);
        totals.carbPercent = calculatePercentageOfNutrient(totals.carbs, totals);
        totals.satFatPercent = calculatePercentageOfNutrient(totals.saturatedFat, totals);
        totals.unsatFatPercent = calculatePercentageOfNutrient(totals.unsaturatedFat, totals);
        const productInfo = `
Date of consumption: ${customDateString}
Calories: ${Math.round(totals.kcal)}
-------------------
Nutritions in gram:

Proteins: ${Math.round(totals.protein)}g
Total Fat: ${Math.round(totals.totalFat)}g
Carbohydrates: ${Math.round(totals.carbs)}g
Fiber: ${Math.round(totals.fiber)}g
-------------------
Nutritions in perecents:

Proteins: ${totals.proteinPercent}%
Total Fat: ${totals.totalFatPercent}%
Carbohydrates: ${totals.carbPercent}%
-------------------
Type of fats in percents:

Saturated fats: ${totals.satFatPercent}%
Unsaturated fats: ${totals.unsatFatPercent}%`;
        yield ctx.reply(productInfo);
        ctx.scene.enter("START_CALCULATION");
        return;
    });
}
function getAverageConsumptionStatistic(tgId, startDate, endDate, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const startDateString = formatDate(new Date(startDate));
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() - 1);
        const endDateString = formatDate(endDateObj);
        const dateLabel = `${startDateString} to ${endDateString}`;
        const filter = {
            dateOfConsumption: { $gte: startDate, $lt: endDate },
            tgId: tgId,
        };
        const foods = yield schemas_1.ConsumedProduct.find(filter);
        if (foods.length === 0) {
            yield ctx.reply("You don't have any consumption records in this date range");
            ctx.scene.enter("START_CALCULATION");
            return;
        }
        // Group foods by date to count unique days with consumption
        const uniqueDates = new Set();
        foods.forEach((food) => {
            const dateOnly = formatDate(new Date(food.dateOfConsumption));
            if (dateOnly) {
                uniqueDates.add(dateOnly);
            }
        });
        const daysWithConsumption = uniqueDates.size;
        const totals = foods.reduce((accumulator, food) => {
            accumulator.mass += food.mass;
            accumulator.kcal += food.kcal;
            accumulator.protein += food.protein;
            accumulator.totalFat += food.totalFat;
            accumulator.saturatedFat += food.saturatedFat;
            accumulator.unsaturatedFat += food.unsaturatedFat;
            accumulator.carbs += food.carbs;
            accumulator.fiber += food.fiber;
            return accumulator;
        }, {
            mass: 0,
            kcal: 0,
            protein: 0,
            totalFat: 0,
            saturatedFat: 0,
            unsaturatedFat: 0,
            carbs: 0,
            fiber: 0,
        });
        // Calculate averages
        const averages = {
            mass: totals.mass / daysWithConsumption,
            kcal: totals.kcal / daysWithConsumption,
            protein: totals.protein / daysWithConsumption,
            totalFat: totals.totalFat / daysWithConsumption,
            saturatedFat: totals.saturatedFat / daysWithConsumption,
            unsaturatedFat: totals.unsaturatedFat / daysWithConsumption,
            carbs: totals.carbs / daysWithConsumption,
            fiber: totals.fiber / daysWithConsumption,
            tgId: tgId,
        };
        const proteinPercent = calculatePercentageOfNutrient(averages.protein, averages);
        const totalFatPercent = calculatePercentageOfNutrient(averages.totalFat, averages);
        const carbPercent = calculatePercentageOfNutrient(averages.carbs, averages);
        const satFatPercent = calculateFatTypePercentage(averages.saturatedFat, averages.totalFat);
        const unsatFatPercent = calculateFatTypePercentage(averages.unsaturatedFat, averages.totalFat);
        const productInfo = `
Average Daily Consumption
Date range: ${dateLabel}
Days with consumption: ${daysWithConsumption}
-------------------
Average Calories: ${Math.round(averages.kcal)}
-------------------
Average Nutritions in gram:

Proteins: ${Math.round(averages.protein)}g
Total Fat: ${Math.round(averages.totalFat)}g
Carbohydrates: ${Math.round(averages.carbs)}g
Fiber: ${Math.round(averages.fiber)}g
-------------------
Nutritions in perecents:

Proteins: ${proteinPercent}%
Total Fat: ${totalFatPercent}%
Carbohydrates: ${carbPercent}%
-------------------
Type of fats in percents:

Saturated fats: ${satFatPercent}%
Unsaturated fats: ${unsatFatPercent}%`;
        yield ctx.reply(productInfo);
        ctx.scene.enter("START_CALCULATION");
        return;
    });
}
function deleteConsumptionStatisticByDateAnTgId(startDate, endDate, tgId) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = {
            dateOfConsumption: { $gte: startDate, $lt: endDate },
            tgId: tgId,
        };
        const foods = yield schemas_1.ConsumedProduct.find(filter).lean();
        return foods;
    });
}
function findTopTenProducts(typeOfCheck) {
    return __awaiter(this, void 0, void 0, function* () {
        const foods = yield schemas_1.UsersProduct.find({});
        const calculated = foods
            .filter((food) => {
            return food.protein !== 0;
        })
            .map((food) => {
            return {
                name: food.name,
                kcalPerFiberGram: food.kcal / food.protein,
                kcal: food.kcal,
                fiber: food.fiber,
            };
        });
        const sorted = calculated.sort((a, b) => a.kcalPerFiberGram - b.kcalPerFiberGram);
        const topTen = sorted.slice(0, 20);
    });
}
function deleteAndUpdateBotMessageCreate(ctx, button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.deleteMessage(ctx.message.message_id);
        const message = `**${ctx.wizard.state.name}** doesn't exist in product database\n\n` +
            `**Create** - to create **${ctx.wizard.state.name}** in product database\n` +
            "Or just enter name of another product to try again";
        yield ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.botMessageId, undefined, message, button);
    });
}
function deleteAndUpdateBotMessage(ctx, message, button) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.message) {
            yield ctx.deleteMessage(ctx.message.message_id);
        }
        yield ctx.telegram.editMessageText(ctx.chat.id, ctx.wizard.state.botMessageId, undefined, message, button);
    });
}
const productEditMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply(`Choose per what mass you want to calculate nutrition of ${ctx.wizard.state.name} PER 100 or PER CUSTOM`, buttons_1.perButton);
});
exports.productEditMessage = productEditMessage;
const mealEditMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply(`The name and mass of the product that will be included in the meal ${ctx.wizard.state.MealName}`);
});
exports.mealEditMessage = mealEditMessage;
function updateProductMeal(ctx, step, sceneName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        yield ctx.answerCbQuery();
        if (ctx.callbackQuery.data === "bot-yes") {
            ctx.wizard.state.updateProduct = true;
            yield ctx.reply(`Updating existing ${sceneName === "Product" ? sceneName : "Meal"}`);
            sceneName === "Product"
                ? yield (0, exports.productEditMessage)(ctx)
                : yield (0, exports.mealEditMessage)(ctx);
            return ctx.wizard.selectStep(step);
        }
        yield ctx.reply("You can't have two equal products in product base");
        yield ctx.reply("If you want to enter new product use command /start_calculation");
        return ctx.scene.enter("START_CALCULATION");
    });
}
function isSaturBiggerThanTotal(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.wizard.state.saturatedFat >
            ctx.wizard.state.totalFat) {
            yield ctx.reply("Wrong, saturated fat mass can`t be more than total fat mass");
            return false;
        }
        return true;
    });
}
