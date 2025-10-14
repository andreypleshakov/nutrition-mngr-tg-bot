import { Scenes, Markup } from "telegraf";
import {
  handleFromStartingScene,
  getConsumptionStatisticByDateAnTgId,
  isValidDateFormat,
  deleteConsumptionStatisticByDateAnTgId,
  getAverageConsumptionStatistic,
  getWeeksOfCurrentMonth,
  getMonthsOfCurrentYear,
} from "../utils/utils";
import {
  IDialogueState,
  IConsumedProduct,
  InitialState,
} from "../utils/models";
import {
  getTypeOfStatisticButton,
  todayOrCustomDateButton,
  rangeTypeButtons,
} from "../utils/buttons";
import { ConsumedProduct } from "../utils/schemas";
import {
  manipulateConsumptionStatisticStepsList,
  steps,
} from "../steps-middlewares/manipulateConsumptionStatistic";

export const manipulateConsumptionStatistic =
  new Scenes.WizardScene<Scenes.WizardContext>(
    "CHECK_OR_DELETE_CONSUMPTION_STATISTIC",
    ...manipulateConsumptionStatisticStepsList
  );

export async function startingDialogue(ctx: Scenes.WizardContext) {
  if (!(ctx.scene.state as InitialState).fromStartingScene) {
    return await handleFromStartingScene(ctx);
  }

  (ctx.wizard.state as IConsumedProduct).tgId = ctx.from!.id;

  await ctx.reply(
    "TODAY - check today's consumption statistic\n" +
      "YESTERDAY - check yesterday's consumption statistic\n" +
      "CUSTOM - check custom day of your consumption\n" +
      "DATE RANGE - check consumption statistic for a date range",
    Markup.inlineKeyboard(todayOrCustomDateButton)
  );
  return ctx.wizard.selectStep(steps.optionsOfDateStatistic);
}

export async function optionsOfDateStatistic(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData === "today") {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    (ctx.wizard.state as IConsumedProduct).dateOfConsumption =
      startDate.toISOString();
    (ctx.wizard.state as IDialogueState).isDateRange = false;
    const typeOfStatisticButton = getTypeOfStatisticButton(false);

    await ctx.reply(
      "General daily statistic - check general consumption statistic of day\n" +
        "List of products - check list of consumed products of day\n" +
        "Delete product - delete consumed product of day",
      typeOfStatisticButton
    );

    return ctx.wizard.selectStep(steps.typeOfStatistic);
  }

  if (callBackData === "yesterday") {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 1);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    (ctx.wizard.state as IConsumedProduct).dateOfConsumption =
      startDate.toISOString();
    (ctx.wizard.state as IDialogueState).isDateRange = false;
    const typeOfStatisticButton = getTypeOfStatisticButton(false);

    await ctx.reply(
      "General daily statistic - check general consumption statistic of day\n" +
        "List of products - check list of consumed products of day\n" +
        "Delete product - delete consumed product of day",
      typeOfStatisticButton
    );

    return ctx.wizard.selectStep(steps.typeOfStatistic);
  }

  if (callBackData === "date-range") {
    (ctx.wizard.state as IDialogueState).isDateRange = true;
    await ctx.reply(
      "Select range type:\n" +
        "Custom Range - enter your own start and end dates\n" +
        "Week Range - select a week from current month\n" +
        "Month Range - select a month from current year",
      Markup.inlineKeyboard(rangeTypeButtons)
    );
    return ctx.wizard.selectStep(steps.selectRangeType);
  }

  await ctx.reply("Enter date that you require in this format YYYY-MM-DD");
  return ctx.wizard.selectStep(steps.customDateForStatistic);
}

export async function customDateForStatistic(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!isValidDateFormat(ctx.message.text)) {
    await ctx.reply(
      "Wrong! Enter date that you require in this format YYYY-MM-DD"
    );
    return;
  }

  const customDateString = ctx.message.text;
  const startDate = new Date(customDateString);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);
  (ctx.wizard.state as IConsumedProduct).dateOfConsumption =
    startDate.toISOString();
  (ctx.wizard.state as IDialogueState).isDateRange = false;
  const typeOfStatisticButton = getTypeOfStatisticButton(false);

  await ctx.reply(
    "General daily statistic - check general consumption statistic of day\n" +
      "List of products - check list of consumed products of day\n" +
      "Delete product - delete consumed product of day",
    typeOfStatisticButton
  );

  return ctx.wizard.selectStep(steps.typeOfStatistic);
}

export async function selectRangeType(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData === "custom-range") {
    await ctx.reply("Enter start date in format YYYY-MM-DD");
    return ctx.wizard.selectStep(steps.startDateForRange);
  }

  if (callBackData === "week-range") {
    const weeks = getWeeksOfCurrentMonth();

    if (weeks.length === 0) {
      await ctx.reply("No weeks available in current month");
      ctx.scene.enter("START_CALCULATION");
      return;
    }

    const weekButtons = weeks.map((week, index) => [
      Markup.button.callback(week.label, `week-${index}`)
    ]);

    await ctx.reply(
      "Select a week:",
      Markup.inlineKeyboard(weekButtons)
    );
    return ctx.wizard.selectStep(steps.selectWeek);
  }

  if (callBackData === "month-range") {
    const months = getMonthsOfCurrentYear();

    const monthButtons = months.map((month) => [
      Markup.button.callback(month.label, `month-${month.month}`)
    ]);

    await ctx.reply(
      "Select a month:",
      Markup.inlineKeyboard(monthButtons)
    );
    return ctx.wizard.selectStep(steps.selectMonth);
  }
}

export async function selectWeek(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData.startsWith("week-")) {
    const weekIndex = parseInt(callBackData.split("-")[1]);
    const weeks = getWeeksOfCurrentMonth();
    const selectedWeek = weeks[weekIndex];

    if (!selectedWeek) {
      await ctx.reply("Invalid week selection");
      ctx.scene.enter("START_CALCULATION");
      return;
    }

    const startDate = selectedWeek.start;
    const endDate = new Date(selectedWeek.end);
    endDate.setDate(endDate.getDate() + 1); // Add 1 day for exclusive end

    (ctx.wizard.state as IConsumedProduct).dateOfConsumption = startDate.toISOString();
    (ctx.wizard.state as IDialogueState).customMass = endDate.getTime();

    const isDateRange = (ctx.wizard.state as IDialogueState).isDateRange || false;
    const typeOfStatisticButton = getTypeOfStatisticButton(isDateRange);

    await ctx.reply(
      "General daily statistic - check general consumption statistic for week\n" +
        "Average daily consumption - check average daily consumption for week\n" +
        "List of products - check list of consumed products for week\n" +
        "Delete product - delete consumed product from week",
      typeOfStatisticButton
    );

    return ctx.wizard.selectStep(steps.typeOfStatistic);
  }
}

export async function selectMonth(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData.startsWith("month-")) {
    const monthIndex = parseInt(callBackData.split("-")[1]);
    const now = new Date();
    const currentYear = now.getFullYear();

    const startDate = new Date(currentYear, monthIndex, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentYear, monthIndex + 1, 1);
    endDate.setHours(0, 0, 0, 0);

    (ctx.wizard.state as IConsumedProduct).dateOfConsumption = startDate.toISOString();
    (ctx.wizard.state as IDialogueState).customMass = endDate.getTime();

    const isDateRange = (ctx.wizard.state as IDialogueState).isDateRange || false;
    const typeOfStatisticButton = getTypeOfStatisticButton(isDateRange);

    await ctx.reply(
      "General daily statistic - check general consumption statistic for month\n" +
        "Average daily consumption - check average daily consumption for month\n" +
        "List of products - check list of consumed products for month\n" +
        "Delete product - delete consumed product from month",
      typeOfStatisticButton
    );

    return ctx.wizard.selectStep(steps.typeOfStatistic);
  }
}

export async function startDateForRange(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!isValidDateFormat(ctx.message.text)) {
    await ctx.reply(
      "Wrong! Enter start date in this format YYYY-MM-DD"
    );
    return;
  }

  const startDateString = ctx.message.text;
  const startDate = new Date(startDateString);
  (ctx.wizard.state as IDialogueState).customMass = startDate.getTime();

  await ctx.reply("Enter end date in format YYYY-MM-DD (this date will be included)");
  return ctx.wizard.selectStep(steps.endDateForRange);
}

export async function endDateForRange(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!isValidDateFormat(ctx.message.text)) {
    await ctx.reply(
      "Wrong! Enter end date in this format YYYY-MM-DD"
    );
    return;
  }

  const endDateString = ctx.message.text;
  const endDate = new Date(endDateString);
  endDate.setDate(endDate.getDate() + 1);

  const startDate = new Date((ctx.wizard.state as IDialogueState).customMass);

  if (endDate <= startDate) {
    await ctx.reply("End date must be after start date. Please enter end date again:");
    return;
  }

  (ctx.wizard.state as IConsumedProduct).dateOfConsumption = startDate.toISOString();
  (ctx.wizard.state as IDialogueState).customMass = endDate.getTime();

  const isDateRange = (ctx.wizard.state as IDialogueState).isDateRange || false;
  const typeOfStatisticButton = getTypeOfStatisticButton(isDateRange);

  await ctx.reply(
    "General daily statistic - check general consumption statistic for date range\n" +
      "Average daily consumption - check average daily consumption for date range\n" +
      "List of products - check list of consumed products for date range\n" +
      "Delete product - delete consumed product from date range",
    typeOfStatisticButton
  );

  return ctx.wizard.selectStep(steps.typeOfStatistic);
}

export async function typeOfStatistic(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;

  const tgId = (ctx.wizard.state as IConsumedProduct).tgId;
  let checkForList = (ctx.wizard.state as IDialogueState).listOfProducts;
  const startDate = (ctx.wizard.state as IConsumedProduct).dateOfConsumption;

  // Check if we're in date range mode (customMass will contain end date timestamp)
  const storedEndDate = (ctx.wizard.state as IDialogueState).customMass;
  const endDate = storedEndDate
    ? new Date(storedEndDate)
    : (() => {
        const date = new Date(startDate);
        date.setDate(new Date(startDate).getDate() + 1);
        return date;
      })();

  await ctx.answerCbQuery();

  switch (callBackData) {
    case "general-daily-statistic":
      checkForList = false;
      await getConsumptionStatisticByDateAnTgId(
        tgId,
        checkForList,
        startDate,
        endDate.toISOString(),
        ctx
      );
      break;
    case "average-daily-statistic":
      await getAverageConsumptionStatistic(
        tgId,
        startDate,
        endDate.toISOString(),
        ctx
      );
      break;
    case "list-of-consumed-products":
      checkForList = true;
      await getConsumptionStatisticByDateAnTgId(
        tgId,
        checkForList,
        startDate,
        endDate.toISOString(),
        ctx
      );
      break;
    case "delete-consumed-product":
      checkForList = false;
      const foods = await deleteConsumptionStatisticByDateAnTgId(
        startDate,
        endDate.toISOString(),
        tgId
      );

      if (!foods || foods.length === 0) {
        await ctx.reply("You don't have any consumption records in this day");
        ctx.scene.enter("START_CALCULATION");
        return;
      }

      (ctx.wizard.state as IDialogueState).arrayOfProducts = foods;

      const buttons = (ctx.wizard.state as IDialogueState).arrayOfProducts.map(
        (food) => [
          Markup.button.callback(
            `${food.name}: ${food.mass}g`,
            `${food._id!.toString()}`
          ),
        ]
      );

      await ctx.reply(
        "Choose what you want to delete or press Done to complete your delete",
        Markup.inlineKeyboard(buttons)
      );

      return ctx.wizard.selectStep(steps.deleteConsumedProduct);
  }
}

export async function deleteConsumedProduct(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  await ctx.answerCbQuery();

  let arrayOfProducts = (ctx.wizard.state as IDialogueState).arrayOfProducts;
  let arrayForDelete = (ctx.wizard.state as IDialogueState).arrayForDelete;

  if (ctx.callbackQuery.data === "Done") {
    const filter = (ctx.wizard.state as IDialogueState).arrayForDelete;
    await ConsumedProduct.deleteMany({
      _id: { $in: filter },
      tgId: (ctx.wizard.state as IConsumedProduct).tgId,
    });
    await ctx.reply(
      "Product(s) succesfully deleted from your daily consumption list "
    );
    return ctx.scene.enter("START_CALCULATION");
  }

  if ((ctx.wizard.state as IDialogueState).fromPreparationToDelete !== true) {
    arrayForDelete = [];
  }

  let targetId = ctx.callbackQuery.data;

  const foundObject = arrayOfProducts.find(
    (obj) => obj._id!.toString() === targetId
  );

  arrayForDelete.push(foundObject!._id!);

  (ctx.wizard.state as IDialogueState).arrayForDelete = arrayForDelete;

  const index = arrayOfProducts.findIndex(
    (obj) => obj._id!.toString() === targetId
  );

  arrayOfProducts.splice(index, 1);

  (ctx.wizard.state as IDialogueState).arrayOfProducts = arrayOfProducts;

  (ctx.wizard.state as IDialogueState).fromPreparationToDelete = true;

  const buttons = (ctx.wizard.state as IDialogueState).arrayOfProducts.map(
    (food) => [
      Markup.button.callback(
        `${food.name}: ${food.mass}g`,
        `${food._id!.toString()}`
      ),
    ]
  );

  if ((ctx.wizard.state as IDialogueState).fromPreparationToDelete === true) {
    buttons.push([Markup.button.callback("Done", "Done")]);
  }

  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(buttons).reply_markup);

  return ctx.wizard.selectStep(steps.deleteConsumedProduct);
}
