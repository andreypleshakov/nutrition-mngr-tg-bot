import { Middleware, Scenes, Markup } from "telegraf";
import {
  handleFromStartingScene,
  getOrDeleteConsumptionStatisticByDateAnTgId,
  isValidDateFormat,
  deleteProduct,
} from "../utils/utils";
import { DialogueState, DailyFood } from "../utils/models";
import {
  getTypeOfStatisticButton,
  todayOrCustomDateButton,
} from "../utils/buttons";

export const checkOrDeleteConsumptionStatisticSteps: Middleware<Scenes.WizardContext>[] =
  [
    startingDialogue,
    optionsOfDateStatistic,
    customDateForStatistic,
    typeOfStatistic,
    deleteConsumedProduct,
  ];

export const startingDialogueStep =
  checkOrDeleteConsumptionStatisticSteps.findIndex(
    (scene) => scene === startingDialogue
  );

export const optionsOfDateStatisticStep =
  checkOrDeleteConsumptionStatisticSteps.findIndex(
    (scene) => scene === optionsOfDateStatistic
  );

export const customDateForStatisticStep =
  checkOrDeleteConsumptionStatisticSteps.findIndex(
    (scene) => scene === customDateForStatistic
  );

export const typeOfStatisticStep =
  checkOrDeleteConsumptionStatisticSteps.findIndex(
    (scene) => scene === typeOfStatistic
  );

export const deleteConsumedProductStep =
  checkOrDeleteConsumptionStatisticSteps.findIndex(
    (scene) => scene === deleteConsumedProduct
  );

///////////// check or delete consumption statistic (take data form daily_statistics)
export const checkOrDeleteConsumptionStatistic =
  new Scenes.WizardScene<Scenes.WizardContext>(
    "CHECK_OR_DELETE_CONSUMPTION_STATISTIC",
    ...checkOrDeleteConsumptionStatisticSteps
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
  return ctx.wizard.selectStep(optionsOfDateStatisticStep);
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

    return ctx.wizard.selectStep(typeOfStatisticStep);
  }
  await ctx.reply("Enter date that you require in this format YYYY-MM-DD");
  return ctx.wizard.selectStep(customDateForStatisticStep);
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

  return ctx.wizard.selectStep(typeOfStatisticStep);
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
      await getOrDeleteConsumptionStatisticByDateAnTgId(
        tgId,
        checkForList,
        deleteConsumption,
        startDate,
        endDate,
        ctx
      );
      break;
    case "list-of-consumed-products":
      checkForList = true;
      deleteConsumption = false;
      await getOrDeleteConsumptionStatisticByDateAnTgId(
        tgId,
        checkForList,
        deleteConsumption,
        startDate,
        endDate,
        ctx
      );
      break;
    case "delete-consumed-product":
      checkForList = false;
      deleteConsumption = true;
      await getOrDeleteConsumptionStatisticByDateAnTgId(
        tgId,
        checkForList,
        deleteConsumption,
        startDate,
        endDate,
        ctx
      );
      return ctx.wizard.selectStep(deleteConsumedProductStep);
  }
}

export async function deleteConsumedProduct(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  await ctx.answerCbQuery();

  await deleteProduct(ctx.callbackQuery.data);
  await ctx.reply(
    "Product was succesfully deleted from your daily consumption list "
  );
  return ctx.scene.enter("START_CALCULATION");
}
