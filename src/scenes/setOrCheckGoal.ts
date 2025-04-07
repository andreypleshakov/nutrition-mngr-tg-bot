import { Scenes } from "telegraf";
import {
  setOrCheckGoalStepsList,
  steps,
} from "../steps-middlewares/setOrCheckGoalSteps";
import { IProduct } from "../utils/models";
import { isValidNumber } from "../utils/utils";
import { Goal } from "../utils/schemas";

export const setOrCheckGoal = new Scenes.WizardScene<Scenes.WizardContext>(
  "SET_OR_CHECK_GOAL",
  ...setOrCheckGoalStepsList
);

export async function startingDialogue(ctx: Scenes.WizardContext) {
  (ctx.wizard.state as IProduct).tgId = ctx.from!.id;

  await ctx.reply("Set kcal goal");
  return ctx.wizard.selectStep(steps.setKcal);
}

export async function setKcal(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (validNumber === null) return;

  (ctx.wizard.state as IProduct).kcal = validNumber;
  await ctx.reply("Set protein goal");
  return ctx.wizard.selectStep(steps.setProtein);
}

export async function setProtein(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (validNumber === null) return;

  (ctx.wizard.state as IProduct).protein = validNumber;
  await ctx.reply("Set total fat goal");
  return ctx.wizard.selectStep(steps.setTotalFat);
}

export async function setTotalFat(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (validNumber === null) return;

  (ctx.wizard.state as IProduct).totalFat = validNumber;
  await ctx.reply("Set saturated fat goal");
  return ctx.wizard.selectStep(steps.setSatFat);
}

export async function setSatFat(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (validNumber === null) return;

  (ctx.wizard.state as IProduct).saturatedFat = validNumber;
  await ctx.reply("Set unsaturated fat goal");
  return ctx.wizard.selectStep(steps.setUnsatFat);
}

export async function setUnsatFat(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (validNumber === null) return;

  (ctx.wizard.state as IProduct).unsaturatedFat = validNumber;
  await ctx.reply("Set carbs goal");
  return ctx.wizard.selectStep(steps.setCarbs);
}

export async function setCarbs(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (validNumber === null) return;

  (ctx.wizard.state as IProduct).carbs = validNumber;
  await ctx.reply("Set fiber goal");
  return ctx.wizard.selectStep(steps.setFiber);
}

export async function setFiber(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (validNumber === null) return;

  (ctx.wizard.state as IProduct).fiber = validNumber;

  const actualState = ctx.wizard.state as IProduct;

  const nutritionGoal: Omit<IProduct, "mass"> = {
    kcal: actualState.kcal,
    protein: actualState.protein,
    totalFat: actualState.totalFat,
    saturatedFat: actualState.saturatedFat,
    unsaturatedFat: actualState.unsaturatedFat,
    carbs: actualState.carbs,
    fiber: actualState.fiber,
    tgId: actualState.tgId,
  };

  const newGoal = new Goal(nutritionGoal);

  await newGoal.save();

  await ctx.reply("Succses");

  await ctx.scene.enter("START_CALCULATION");
}
