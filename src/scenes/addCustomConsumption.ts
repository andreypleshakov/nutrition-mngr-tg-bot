import { Markup, Scenes } from "telegraf";
import {
  addCustomConsumptionStepsList,
  steps,
} from "../steps-middlewares/addCustomConsumptionSteps";
import { DailyFood } from "../utils/models";
import {
  handleFromStartingScene,
  isValidDateFormat,
  isValidNumberString,
  replaceCommaToDot,
} from "../utils/utils";
import { todayOrCustomDateButton } from "../utils/buttons";
import { dailyFoodBase } from "../utils/schemas";

export const addCustomConsumption =
  new Scenes.WizardScene<Scenes.WizardContext>(
    "ADD_CUSTOM_CONSUMPTION",
    ...addCustomConsumptionStepsList
  );

export async function startingDialogue(ctx: Scenes.WizardContext) {
  (ctx.wizard.state as DailyFood).tgId = ctx.from!.id;

  const fromStartingScene = await handleFromStartingScene(ctx);

  if (fromStartingScene) {
    return;
  }

  await ctx.reply(
    "TODAY - add today's consumption statistic\n" +
      "CUSTOM - add custom day of your consumption",
    Markup.inlineKeyboard(todayOrCustomDateButton)
  );
  return ctx.wizard.selectStep(steps.todayOrCustomDate);
}

export async function todayOrCustomDate(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData === "today") {
    (ctx.wizard.state as DailyFood).dateOfConsumption = new Date();
    await ctx.reply(
      "Enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)"
    );
    return ctx.wizard.selectStep(steps.waitingForNameAndMassOfProduct);
  }

  await ctx.reply("Enter date that you require in this format YYYY-MM-DD");
  return ctx.wizard.selectStep(steps.customDate);
}

export async function customDate(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!isValidDateFormat(ctx.message.text)) {
    await ctx.reply(
      "Wrong! Enter date that you require in this format YYYY-MM-DD"
    );
    return;
  }

  (ctx.wizard.state as DailyFood).dateOfConsumption = new Date(
    ctx.message.text
  );
  await ctx.reply(
    "Enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)"
  );
  return ctx.wizard.selectStep(steps.waitingForNameAndMassOfProduct);
}

export async function waitingForNameAndMassOfProduct(
  ctx: Scenes.WizardContext
) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  (ctx.wizard.state as DailyFood).name = ctx.message.text.trim();

  await ctx.reply(
    `Enter total mass of ${(ctx.wizard.state as DailyFood).name}`
  );
  return ctx.wizard.selectStep(steps.mass);
}

export async function mass(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  (ctx.wizard.state as DailyFood).mass = replaceCommaToDot(ctx.message.text);

  await ctx.reply(
    `Enter total kcal of ${(ctx.wizard.state as DailyFood).name}`
  );

  return ctx.wizard.selectStep(steps.kcal);
}

export async function kcal(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  (ctx.wizard.state as DailyFood).kcal = replaceCommaToDot(ctx.message.text);

  await ctx.reply(
    `Enter total protein of ${(ctx.wizard.state as DailyFood).name}`
  );

  return ctx.wizard.selectStep(steps.protein);
}

export async function protein(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  (ctx.wizard.state as DailyFood).protein = replaceCommaToDot(ctx.message.text);

  await ctx.reply(`Enter total fat of ${(ctx.wizard.state as DailyFood).name}`);

  return ctx.wizard.selectStep(steps.totalFat);
}

export async function totalFat(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  (ctx.wizard.state as DailyFood).totalFat = replaceCommaToDot(
    ctx.message.text
  );

  await ctx.reply(
    `Enter total saturated fat of ${(ctx.wizard.state as DailyFood).name}`
  );

  return ctx.wizard.selectStep(steps.satAndUnsatFat);
}

export async function satAndUnsatFat(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  (ctx.wizard.state as DailyFood).saturatedFat = replaceCommaToDot(
    ctx.message.text
  );

  (ctx.wizard.state as DailyFood).unsaturatedFat =
    (ctx.wizard.state as DailyFood).totalFat -
    (ctx.wizard.state as DailyFood).saturatedFat;

  await ctx.reply(
    `Enter total carbs of ${(ctx.wizard.state as DailyFood).name}`
  );

  return ctx.wizard.selectStep(steps.carbs);
}

export async function carbs(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  (ctx.wizard.state as DailyFood).carbs = replaceCommaToDot(ctx.message.text);

  await ctx.reply(
    `Enter total fiber of ${(ctx.wizard.state as DailyFood).name}`
  );

  return ctx.wizard.selectStep(steps.fiber);
}

export async function fiber(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  (ctx.wizard.state as DailyFood).fiber = replaceCommaToDot(ctx.message.text);

  const actualState = ctx.wizard.state as DailyFood;

  const nutritionDetails = {
    dateOfConsumption: actualState.dateOfConsumption,
    name: actualState.name,
    mass: actualState.mass,
    kcal: actualState.kcal,
    protein: actualState.protein,
    saturatedFat: actualState.saturatedFat,
    unsaturatedFat: actualState.unsaturatedFat,
    totalFat: actualState.totalFat,
    carbs: actualState.carbs,
    fiber: actualState.fiber,
    tgId: actualState.tgId,
  };

  const newDate = new dailyFoodBase(nutritionDetails);

  await newDate.save();

  await ctx.reply(
    `Custom's product ${actualState.name} statistic saved in database`
  );

  await ctx.scene.enter("START_CALCULATION");
}
