import { Scenes, Middleware } from "telegraf";
import {
  typeOfStatisticButton,
  handleFromStartingScene,
  todayOrCustomDateButton,
  getConsumptionStatisticByDateAnTgId,
  isValidDateFormat,
} from "../utils/utils";
import { DialogueState, DailyFood } from "../utils/models";

const checkConsumptionStatisticSteps: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  optionsOfDateStatistic,
  customDateForStatistic,
  typeOfStatistic,
];

const startingDialogueStep = checkConsumptionStatisticSteps.findIndex(
  (scene) => scene === startingDialogue
);

const optionsOfDateStatisticStep = checkConsumptionStatisticSteps.findIndex(
  (scene) => scene === optionsOfDateStatistic
);

const customDateForStatisticStep = checkConsumptionStatisticSteps.findIndex(
  (scene) => scene === customDateForStatistic
);

const typeOfStatisticStep = checkConsumptionStatisticSteps.findIndex(
  (scene) => scene === typeOfStatistic
);

///////////// check consumption statistic (take data form daily_statistics)
export const checkConsumptionStatistic =
  new Scenes.WizardScene<Scenes.WizardContext>(
    "CHECK_CONSUMPTION_STATISTIC",
    ...checkConsumptionStatisticSteps
  );

async function startingDialogue(ctx: Scenes.WizardContext) {
  const fromStartingScene2 = await handleFromStartingScene(ctx);

  if (fromStartingScene2) {
    return;
  }

  (ctx.wizard.state as DailyFood).tgId = ctx.from!.id;

  await ctx.reply(
    "TODAY - check today's consumption statistic\n" +
      "CUSTOM - check custom day of your consumption",
    todayOrCustomDateButton
  );
  return ctx.wizard.selectStep(optionsOfDateStatisticStep);
}

async function optionsOfDateStatistic(ctx: Scenes.WizardContext) {
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

    await ctx.reply(
      "General daily statistic - check general consumption statistic of day\n" +
        "List of consumed products - check list of consumed products of day",
      typeOfStatisticButton
    );

    return ctx.wizard.selectStep(typeOfStatisticStep);
  }
  await ctx.reply("Enter date that you require in this format YYYY-MM-DD");
  return ctx.wizard.selectStep(customDateForStatisticStep);
}

async function customDateForStatistic(ctx: Scenes.WizardContext) {
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

  await ctx.reply(
    "General daily statistic - check general consumption statistic of day\n" +
      "List of consumed products - check list of consumed products of day",
    typeOfStatisticButton
  );

  return ctx.wizard.selectStep(typeOfStatisticStep);
}

async function typeOfStatistic(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  

  const tgId = (ctx.wizard.state as DailyFood).tgId;
  let checkForList = (ctx.wizard.state as DialogueState).listOfProducts;

  const startDate = (ctx.wizard.state as DailyFood).dateOfConsumption;
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  await ctx.answerCbQuery();

  switch (callBackData) {
    case "general-daily-statistic":
      checkForList = false;
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
      await getConsumptionStatisticByDateAnTgId(
        tgId,
        checkForList,
        startDate,
        endDate,
        ctx
      );
      break;
  }
}
