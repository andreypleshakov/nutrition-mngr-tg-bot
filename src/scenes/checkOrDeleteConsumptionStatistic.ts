import { Scenes, Markup } from "telegraf";
import {
  handleFromStartingScene,
  getConsumptionStatisticByDateAnTgId,
  isValidDateFormat,
  deleteConsumptionStatisticByDateAnTgId,
} from "../utils/utils";
import { DialogueState, DailyFood } from "../utils/models";
import {
  getTypeOfStatisticButton,
  todayOrCustomDateButton,
} from "../utils/buttons";
import { dailyFoodBase } from "../utils/schemas";
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
  const fromStartingScene2 = await handleFromStartingScene(ctx);

  if (fromStartingScene2) {
    return;
  }

  (ctx.wizard.state as DailyFood).tgId = ctx.from!.id;

  await ctx.reply(
    "TODAY - check today's consumption statistic\n" +
      "CUSTOM - check custom day of your consumption",
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

    (ctx.wizard.state as DailyFood).dateOfConsumption = startDate;
    const typeOfStatisticButton = getTypeOfStatisticButton();

    await ctx.reply(
      "General daily statistic - check general consumption statistic of day\n" +
        "List of products - check list of consumed products of day\n" +
        "Delete product - delete consumed product of day",
      typeOfStatisticButton
    );

    return ctx.wizard.selectStep(steps.typeOfStatistic);
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
  (ctx.wizard.state as DailyFood).dateOfConsumption = startDate;
  const typeOfStatisticButton = getTypeOfStatisticButton();

  await ctx.reply(
    "General daily statistic - check general consumption statistic of day\n" +
      "List of products - check list of consumed products of day\n" +
      "Delete product - delete consumed product of day",
    typeOfStatisticButton
  );

  return ctx.wizard.selectStep(steps.typeOfStatistic);
}

export async function typeOfStatistic(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;

  const tgId = (ctx.wizard.state as DailyFood).tgId;
  let checkForList = (ctx.wizard.state as DialogueState).listOfProducts;
  let deleteConsumption = (ctx.wizard.state as DialogueState).deleteConsumption;
  const startDate = (ctx.wizard.state as DailyFood).dateOfConsumption;
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  await ctx.answerCbQuery();

  switch (callBackData) {
    case "general-daily-statistic":
      checkForList = false;
      deleteConsumption = false;
      await getConsumptionStatisticByDateAnTgId(
        tgId,
        checkForList,
        startDate,
        endDate,
        ctx
      );
      break;
    case "list-of-consumed-products":
      checkForList = true;
      deleteConsumption = false;
      await getConsumptionStatisticByDateAnTgId(
        tgId,
        checkForList,
        startDate,
        endDate,
        ctx
      );
      break;
    case "delete-consumed-product":
      checkForList = false;
      deleteConsumption = true;
      const foods = await deleteConsumptionStatisticByDateAnTgId(
        startDate,
        endDate,
        tgId
      );

      if (!foods || foods.length === 0) {
        await ctx.reply("You don't have any consumption records in this day");
        ctx.scene.enter("START_CALCULATION");
        return;
      }

      (ctx.wizard.state as DailyFood).arrayOfProducts = foods;

      const buttons = (ctx.wizard.state as DailyFood).arrayOfProducts.map(
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

  let arrayOfProducts = (ctx.wizard.state as DailyFood).arrayOfProducts;
  let arrayForDelete = (ctx.wizard.state as DailyFood).arrayForDelete;

  if (ctx.callbackQuery.data === "Done") {
    const filter = (ctx.wizard.state as DailyFood).arrayForDelete;
    await dailyFoodBase.deleteMany({
      _id: { $in: filter },
      tgId: (ctx.wizard.state as DailyFood).tgId,
    });
    await ctx.reply(
      "Product(s) succesfully deleted from your daily consumption list "
    );
    return ctx.scene.enter("START_CALCULATION");
  }

  if ((ctx.wizard.state as DialogueState).fromPreparationToDelete !== true) {
    arrayForDelete = [];
  }

  let targetId = ctx.callbackQuery.data;

  const foundObject = arrayOfProducts.find(
    (obj) => obj._id!.toString() === targetId
  );

  arrayForDelete.push(foundObject!._id!);

  (ctx.wizard.state as DailyFood).arrayForDelete = arrayForDelete;

  const index = arrayOfProducts.findIndex(
    (obj) => obj._id!.toString() === targetId
  );

  arrayOfProducts.splice(index, 1);

  (ctx.wizard.state as DailyFood).arrayOfProducts = arrayOfProducts;

  (ctx.wizard.state as DialogueState).fromPreparationToDelete = true;

  const buttons = (ctx.wizard.state as DailyFood).arrayOfProducts.map(
    (food) => [
      Markup.button.callback(
        `${food.name}: ${food.mass}g`,
        `${food._id!.toString()}`
      ),
    ]
  );

  if ((ctx.wizard.state as DialogueState).fromPreparationToDelete === true) {
    buttons.push([Markup.button.callback("Done", "Done")]);
  }

  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(buttons).reply_markup);

  return ctx.wizard.selectStep(steps.deleteConsumedProduct);
}
