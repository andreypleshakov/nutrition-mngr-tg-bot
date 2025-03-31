import { Scenes } from "telegraf";
import { DialogueState, FoodElement } from "../utils/models";
import {
  isValidNumberString,
  replaceCommaToDot,
  doesExistTheSameProductWithTgId,
  handleFromFixingStep,
  createOrUpdateProductInProductBase,
  calculateAndRoundNutrient,
} from "../utils/utils";
import {
  getYesOrNoButton,
  yesOrNoButton,
  getfixButtonProductBase,
  perButton,
} from "../utils/buttons";
import {
  steps,
  createProductStepsList,
} from "../steps-middlewares/createProductSteps";

export const createProduct = new Scenes.WizardScene<Scenes.WizardContext>(
  "CREATE_PRODUCT",
  ...createProductStepsList
);

export async function startingDialogue(ctx: Scenes.WizardContext) {
  (ctx.wizard.state as FoodElement).tgId = ctx.from!.id;

  await ctx.reply("Name of product");
  return ctx.wizard.selectStep(steps.waitingForProductName);
}

export async function waitingForProductName(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply("Wrong, write a product name");
    return;
  }

  const actualState = ctx.wizard.state as FoodElement;
  actualState.name = ctx.message.text.trim();
  const productName = actualState.name;
  const tgId = actualState.tgId;

  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  const existance = await doesExistTheSameProductWithTgId(
    productName
    // tgId
  );

  if (existance) {
    await ctx.reply("Product already exists");
    await ctx.reply("Do you want to update it?", yesOrNoButton);

    return ctx.wizard.selectStep(steps.isUpdatingTheProduct);
  }

  await ctx.reply(
    "Choose the scope of mass you want to calculate nutrition PER 100 or PER CUSTOM",
    perButton
  );
  return ctx.wizard.selectStep(steps.perHundredOrCustomMass);
}

export async function perHundredOrCustomMass(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData === "100-gram") {
    (ctx.wizard.state as DialogueState).customMass = 100;
    await ctx.reply("Calories per 100 gram");
    return ctx.wizard.selectStep(steps.kcalsPerGram);
  } else if (callBackData === "custom-mass") {
    await ctx.reply("Enter mass that you want to calculate");
    return ctx.wizard.selectStep(steps.customMass);
  }
}

export async function customMass(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const customMass = replaceCommaToDot(ctx.message.text);

  if (customMass === 0) {
    await ctx.reply("Enter mass that greater than 0");
    return;
  }

  (ctx.wizard.state as DialogueState).customMass = customMass;

  await ctx.reply(`Calories per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.kcalsPerGram);
}

export async function isUpdatingTheProduct(ctx: Scenes.WizardContext) {
  const succesButton = getYesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);

  if (succesButton) {
    (ctx.wizard.state as DialogueState).updateProduct = true;

    await ctx.reply("Updating existing product");
    await ctx.reply(
      "Choose per what mass you want to calculate nutrition PER 100 or PER CUSTOM",
      perButton
    );
    return ctx.wizard.selectStep(steps.perHundredOrCustomMass);
  }

  await ctx.reply("You can't have two equal products in product base");
  await ctx.reply(
    "If you want to enter new product use comman /start_calculation"
  );
  return ctx.scene.enter("START_CALCULATION");
}

export async function kcalsPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;
  (ctx.wizard.state as FoodElement).kcal = replaceCommaToDot(ctx.message.text);
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  await ctx.reply(`Proteins per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.proteinsPerGram);
}

export async function proteinsPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;
  (ctx.wizard.state as FoodElement).protein = replaceCommaToDot(
    ctx.message.text
  );
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  await ctx.reply(`Total fats per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.totalFatPerGram);
}

export async function totalFatPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const actualState = ctx.wizard.state as FoodElement;
  const customMass = (ctx.wizard.state as DialogueState).customMass;
  actualState.totalFat = replaceCommaToDot(ctx.message.text);
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  if (actualState.totalFat === 0) {
    actualState.saturatedFat = 0;
    actualState.unsaturatedFat = 0;
    await ctx.reply(`Carbohydrates per ${customMass} gram`);
    return ctx.wizard.selectStep(steps.carbohydratesPerGram);
  }

  await ctx.reply(`Saturated fats per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.saturatedFatPerGram);
}

export async function saturatedFatPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const actualState = ctx.wizard.state as FoodElement;
  actualState.saturatedFat = replaceCommaToDot(ctx.message.text);

  if (actualState.saturatedFat > actualState.totalFat) {
    await ctx.reply(
      "Wrong, saturated fat mass can`t be more than total fat mass"
    );
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;

  actualState.unsaturatedFat = Math.round(
    actualState.totalFat - actualState.saturatedFat
  );

  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  await ctx.reply(`Carbohydrates per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.carbohydratesPerGram);
}

export async function unsaturatedFatPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;
  const actualState = ctx.wizard.state as FoodElement;
  actualState.unsaturatedFat = replaceCommaToDot(ctx.message.text);

  actualState.totalFat = actualState.saturatedFat + actualState.unsaturatedFat;

  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  await ctx.reply(`Carbohydrates per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.carbohydratesPerGram);
}

export async function carbohydratesPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;
  const actualState = ctx.wizard.state as FoodElement;
  actualState.carbs = replaceCommaToDot(ctx.message.text);
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  await ctx.reply(`Fiber per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.fiberPerGram);
}

export async function fiberPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const actualState = ctx.wizard.state as FoodElement;
  actualState.fiber = replaceCommaToDot(ctx.message.text);
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  const fixButtonProductBase = getfixButtonProductBase(actualState);

  await ctx.reply(
    "Choose what you want ot fix or press done to create product",
    fixButtonProductBase
  );
  return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
}

export async function fixingSomethingAndFinal(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;
  const actualState = ctx.wizard.state as FoodElement;
  const updateCheck = (ctx.scene.state as DialogueState).updateProduct;
  (ctx.wizard.state as DialogueState).fromFixingStep = true;

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  switch (callBackData) {
    case "name":
      await ctx.reply("Name of product");
      return ctx.wizard.selectStep(steps.waitingForProductName);
    case "kcal":
      await ctx.reply(`Calories per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.kcalsPerGram);
    case "protein":
      await ctx.reply(`Proteins per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.proteinsPerGram);
    case "total-fat":
      await ctx.reply(`Total fats per ${customMass}`);
      return ctx.wizard.selectStep(steps.totalFatPerGram);
    case "saturated-fat":
      await ctx.reply(`Saturated fats per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.saturatedFatPerGram);
    case "unsaturated-fat":
      await ctx.reply(`Unsaturated fats per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.unsaturatedFatPerGram);
    case "carbs":
      await ctx.reply(`Carbohydrates per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.carbohydratesPerGram);
    case "fiber":
      await ctx.reply(`Fiber per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.fiberPerGram);
    case "done":
      type NutrientKeys = Exclude<
        keyof FoodElement,
        | "name"
        | "tgId"
        | "documentId"
        | "tgUserName"
        | "_id"
        | "status"
        | "typeOfFood"
      >;

      const nutrientKeys: NutrientKeys[] = [
        "kcal",
        "protein",
        "totalFat",
        "saturatedFat",
        "unsaturatedFat",
        "carbs",
        "fiber",
      ];

      nutrientKeys.forEach((nutrientKey) => {
        actualState[nutrientKey] = calculateAndRoundNutrient(
          actualState[nutrientKey],
          customMass
        );
      });

      await createOrUpdateProductInProductBase(actualState, updateCheck, ctx);
  }
}
