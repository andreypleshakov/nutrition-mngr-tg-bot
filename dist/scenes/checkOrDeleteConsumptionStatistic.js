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
exports.manipulateConsumptionStatistic = void 0;
exports.startingDialogue = startingDialogue;
exports.optionsOfDateStatistic = optionsOfDateStatistic;
exports.customDateForStatistic = customDateForStatistic;
exports.selectRangeType = selectRangeType;
exports.selectWeek = selectWeek;
exports.selectMonth = selectMonth;
exports.startDateForRange = startDateForRange;
exports.endDateForRange = endDateForRange;
exports.typeOfStatistic = typeOfStatistic;
exports.deleteConsumedProduct = deleteConsumedProduct;
const telegraf_1 = require("telegraf");
const utils_1 = require("../utils/utils");
const buttons_1 = require("../utils/buttons");
const schemas_1 = require("../utils/schemas");
const manipulateConsumptionStatistic_1 = require("../steps-middlewares/manipulateConsumptionStatistic");
exports.manipulateConsumptionStatistic = new telegraf_1.Scenes.WizardScene("CHECK_OR_DELETE_CONSUMPTION_STATISTIC", ...manipulateConsumptionStatistic_1.manipulateConsumptionStatisticStepsList);
function startingDialogue(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.scene.state.fromStartingScene) {
            return yield (0, utils_1.handleFromStartingScene)(ctx);
        }
        ctx.wizard.state.tgId = ctx.from.id;
        yield ctx.reply("TODAY - check today's consumption statistic\n" +
            "YESTERDAY - check yesterday's consumption statistic\n" +
            "CUSTOM - check custom day of your consumption\n" +
            "DATE RANGE - check consumption statistic for a date range", telegraf_1.Markup.inlineKeyboard(buttons_1.todayOrCustomDateButton));
        return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.optionsOfDateStatistic);
    });
}
function optionsOfDateStatistic(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const callBackData = ctx.callbackQuery.data;
        yield ctx.answerCbQuery();
        if (callBackData === "today") {
            const startDate = new Date();
            startDate.setUTCHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            ctx.wizard.state.dateOfConsumption =
                startDate.toISOString();
            ctx.wizard.state.isDateRange = false;
            const typeOfStatisticButton = (0, buttons_1.getTypeOfStatisticButton)(false);
            yield ctx.reply("General daily statistic - check general consumption statistic of day\n" +
                "List of products - check list of consumed products of day\n" +
                "Delete product - delete consumed product of day", typeOfStatisticButton);
            return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.typeOfStatistic);
        }
        if (callBackData === "yesterday") {
            const startDate = new Date();
            startDate.setUTCHours(0, 0, 0, 0);
            startDate.setDate(startDate.getDate() - 1);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            ctx.wizard.state.dateOfConsumption =
                startDate.toISOString();
            ctx.wizard.state.isDateRange = false;
            const typeOfStatisticButton = (0, buttons_1.getTypeOfStatisticButton)(false);
            yield ctx.reply("General daily statistic - check general consumption statistic of day\n" +
                "List of products - check list of consumed products of day\n" +
                "Delete product - delete consumed product of day", typeOfStatisticButton);
            return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.typeOfStatistic);
        }
        if (callBackData === "date-range") {
            ctx.wizard.state.isDateRange = true;
            yield ctx.reply("Select range type:\n" +
                "Custom Range - enter your own start and end dates\n" +
                "Week Range - select a week from current month\n" +
                "Month Range - select a month from current year", telegraf_1.Markup.inlineKeyboard(buttons_1.rangeTypeButtons));
            return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.selectRangeType);
        }
        yield ctx.reply("Enter date that you require in this format YYYY-MM-DD");
        return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.customDateForStatistic);
    });
}
function customDateForStatistic(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.message || !("text" in ctx.message)) {
            return;
        }
        if (!(0, utils_1.isValidDateFormat)(ctx.message.text)) {
            yield ctx.reply("Wrong! Enter date that you require in this format YYYY-MM-DD");
            return;
        }
        const customDateString = ctx.message.text;
        const startDate = new Date(customDateString);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        ctx.wizard.state.dateOfConsumption =
            startDate.toISOString();
        ctx.wizard.state.isDateRange = false;
        const typeOfStatisticButton = (0, buttons_1.getTypeOfStatisticButton)(false);
        yield ctx.reply("General daily statistic - check general consumption statistic of day\n" +
            "List of products - check list of consumed products of day\n" +
            "Delete product - delete consumed product of day", typeOfStatisticButton);
        return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.typeOfStatistic);
    });
}
function selectRangeType(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const callBackData = ctx.callbackQuery.data;
        yield ctx.answerCbQuery();
        if (callBackData === "custom-range") {
            yield ctx.reply("Enter start date in format YYYY-MM-DD");
            return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.startDateForRange);
        }
        if (callBackData === "week-range") {
            const weeks = (0, utils_1.getWeeksOfCurrentMonth)();
            if (weeks.length === 0) {
                yield ctx.reply("No weeks available in current month");
                ctx.scene.enter("START_CALCULATION");
                return;
            }
            const weekButtons = weeks.map((week, index) => [
                telegraf_1.Markup.button.callback(week.label, `week-${index}`)
            ]);
            yield ctx.reply("Select a week:", telegraf_1.Markup.inlineKeyboard(weekButtons));
            return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.selectWeek);
        }
        if (callBackData === "month-range") {
            const months = (0, utils_1.getMonthsOfCurrentYear)();
            const monthButtons = months.map((month) => [
                telegraf_1.Markup.button.callback(month.label, `month-${month.month}`)
            ]);
            yield ctx.reply("Select a month:", telegraf_1.Markup.inlineKeyboard(monthButtons));
            return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.selectMonth);
        }
    });
}
function selectWeek(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const callBackData = ctx.callbackQuery.data;
        yield ctx.answerCbQuery();
        if (callBackData.startsWith("week-")) {
            const weekIndex = parseInt(callBackData.split("-")[1]);
            const weeks = (0, utils_1.getWeeksOfCurrentMonth)();
            const selectedWeek = weeks[weekIndex];
            if (!selectedWeek) {
                yield ctx.reply("Invalid week selection");
                ctx.scene.enter("START_CALCULATION");
                return;
            }
            const startDate = selectedWeek.start;
            const endDate = new Date(selectedWeek.end);
            endDate.setDate(endDate.getDate() + 1); // Add 1 day for exclusive end
            ctx.wizard.state.dateOfConsumption = startDate.toISOString();
            ctx.wizard.state.customMass = endDate.getTime();
            const isDateRange = ctx.wizard.state.isDateRange || false;
            const typeOfStatisticButton = (0, buttons_1.getTypeOfStatisticButton)(isDateRange);
            yield ctx.reply("General daily statistic - check general consumption statistic for week\n" +
                "Average daily consumption - check average daily consumption for week\n" +
                "List of products - check list of consumed products for week\n" +
                "Delete product - delete consumed product from week", typeOfStatisticButton);
            return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.typeOfStatistic);
        }
    });
}
function selectMonth(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const callBackData = ctx.callbackQuery.data;
        yield ctx.answerCbQuery();
        if (callBackData.startsWith("month-")) {
            const monthIndex = parseInt(callBackData.split("-")[1]);
            const now = new Date();
            const currentYear = now.getFullYear();
            const startDate = new Date(currentYear, monthIndex, 1);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(currentYear, monthIndex + 1, 1);
            endDate.setHours(0, 0, 0, 0);
            ctx.wizard.state.dateOfConsumption = startDate.toISOString();
            ctx.wizard.state.customMass = endDate.getTime();
            const isDateRange = ctx.wizard.state.isDateRange || false;
            const typeOfStatisticButton = (0, buttons_1.getTypeOfStatisticButton)(isDateRange);
            yield ctx.reply("General daily statistic - check general consumption statistic for month\n" +
                "Average daily consumption - check average daily consumption for month\n" +
                "List of products - check list of consumed products for month\n" +
                "Delete product - delete consumed product from month", typeOfStatisticButton);
            return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.typeOfStatistic);
        }
    });
}
function startDateForRange(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.message || !("text" in ctx.message)) {
            return;
        }
        if (!(0, utils_1.isValidDateFormat)(ctx.message.text)) {
            yield ctx.reply("Wrong! Enter start date in this format YYYY-MM-DD");
            return;
        }
        const startDateString = ctx.message.text;
        const startDate = new Date(startDateString);
        ctx.wizard.state.customMass = startDate.getTime();
        yield ctx.reply("Enter end date in format YYYY-MM-DD (this date will be included)");
        return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.endDateForRange);
    });
}
function endDateForRange(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.message || !("text" in ctx.message)) {
            return;
        }
        if (!(0, utils_1.isValidDateFormat)(ctx.message.text)) {
            yield ctx.reply("Wrong! Enter end date in this format YYYY-MM-DD");
            return;
        }
        const endDateString = ctx.message.text;
        const endDate = new Date(endDateString);
        endDate.setDate(endDate.getDate() + 1);
        const startDate = new Date(ctx.wizard.state.customMass);
        if (endDate <= startDate) {
            yield ctx.reply("End date must be after start date. Please enter end date again:");
            return;
        }
        ctx.wizard.state.dateOfConsumption = startDate.toISOString();
        ctx.wizard.state.customMass = endDate.getTime();
        const isDateRange = ctx.wizard.state.isDateRange || false;
        const typeOfStatisticButton = (0, buttons_1.getTypeOfStatisticButton)(isDateRange);
        yield ctx.reply("General daily statistic - check general consumption statistic for date range\n" +
            "Average daily consumption - check average daily consumption for date range\n" +
            "List of products - check list of consumed products for date range\n" +
            "Delete product - delete consumed product from date range", typeOfStatisticButton);
        return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.typeOfStatistic);
    });
}
function typeOfStatistic(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        const callBackData = ctx.callbackQuery.data;
        const tgId = ctx.wizard.state.tgId;
        let checkForList = ctx.wizard.state.listOfProducts;
        const startDate = ctx.wizard.state.dateOfConsumption;
        // Check if we're in date range mode (customMass will contain end date timestamp)
        const storedEndDate = ctx.wizard.state.customMass;
        const endDate = storedEndDate
            ? new Date(storedEndDate)
            : (() => {
                const date = new Date(startDate);
                date.setDate(new Date(startDate).getDate() + 1);
                return date;
            })();
        yield ctx.answerCbQuery();
        switch (callBackData) {
            case "general-daily-statistic":
                checkForList = false;
                yield (0, utils_1.getConsumptionStatisticByDateAnTgId)(tgId, checkForList, startDate, endDate.toISOString(), ctx);
                break;
            case "average-daily-statistic":
                yield (0, utils_1.getAverageConsumptionStatistic)(tgId, startDate, endDate.toISOString(), ctx);
                break;
            case "list-of-consumed-products":
                checkForList = true;
                yield (0, utils_1.getConsumptionStatisticByDateAnTgId)(tgId, checkForList, startDate, endDate.toISOString(), ctx);
                break;
            case "delete-consumed-product":
                checkForList = false;
                const foods = yield (0, utils_1.deleteConsumptionStatisticByDateAnTgId)(startDate, endDate.toISOString(), tgId);
                if (!foods || foods.length === 0) {
                    yield ctx.reply("You don't have any consumption records in this day");
                    ctx.scene.enter("START_CALCULATION");
                    return;
                }
                ctx.wizard.state.arrayOfProducts = foods;
                const buttons = ctx.wizard.state.arrayOfProducts.map((food) => [
                    telegraf_1.Markup.button.callback(`${food.name}: ${food.mass}g`, `${food._id.toString()}`),
                ]);
                yield ctx.reply("Choose what you want to delete or press Done to complete your delete", telegraf_1.Markup.inlineKeyboard(buttons));
                return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.deleteConsumedProduct);
        }
    });
}
function deleteConsumedProduct(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return;
        }
        yield ctx.answerCbQuery();
        let arrayOfProducts = ctx.wizard.state.arrayOfProducts;
        let arrayForDelete = ctx.wizard.state.arrayForDelete;
        if (ctx.callbackQuery.data === "Done") {
            const filter = ctx.wizard.state.arrayForDelete;
            yield schemas_1.ConsumedProduct.deleteMany({
                _id: { $in: filter },
                tgId: ctx.wizard.state.tgId,
            });
            yield ctx.reply("Product(s) succesfully deleted from your daily consumption list ");
            return ctx.scene.enter("START_CALCULATION");
        }
        if (ctx.wizard.state.fromPreparationToDelete !== true) {
            arrayForDelete = [];
        }
        let targetId = ctx.callbackQuery.data;
        const foundObject = arrayOfProducts.find((obj) => obj._id.toString() === targetId);
        arrayForDelete.push(foundObject._id);
        ctx.wizard.state.arrayForDelete = arrayForDelete;
        const index = arrayOfProducts.findIndex((obj) => obj._id.toString() === targetId);
        arrayOfProducts.splice(index, 1);
        ctx.wizard.state.arrayOfProducts = arrayOfProducts;
        ctx.wizard.state.fromPreparationToDelete = true;
        const buttons = ctx.wizard.state.arrayOfProducts.map((food) => [
            telegraf_1.Markup.button.callback(`${food.name}: ${food.mass}g`, `${food._id.toString()}`),
        ]);
        if (ctx.wizard.state.fromPreparationToDelete === true) {
            buttons.push([telegraf_1.Markup.button.callback("Done", "Done")]);
        }
        yield ctx.editMessageReplyMarkup(telegraf_1.Markup.inlineKeyboard(buttons).reply_markup);
        return ctx.wizard.selectStep(manipulateConsumptionStatistic_1.steps.deleteConsumedProduct);
    });
}
